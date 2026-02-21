import { createClient } from "@/lib/supabase/server";
import { extractFromImage } from "@/lib/openai";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, file_url, file_type, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!ALLOWED_TYPES.includes(doc.file_type || "")) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI is not configured. Set OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    const res = await fetch(doc.file_url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch document from storage" },
        { status: 500 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let imageBase64: string;
    let mimeType: "image/jpeg" | "image/png" | "image/webp";

    if (doc.file_type === "application/pdf") {
      const { pdf } = await import("pdf-to-img");
      const document = await pdf(buffer, { scale: 2 });
      let firstPage: Buffer | undefined;
      for await (const page of document) {
        firstPage = page;
        break;
      }
      if (!firstPage) {
        return NextResponse.json(
          { error: "Could not render PDF to image" },
          { status: 500 }
        );
      }
      imageBase64 = firstPage.toString("base64");
      mimeType = "image/png";
    } else {
      imageBase64 = buffer.toString("base64");
      mimeType =
        doc.file_type === "image/png"
          ? "image/png"
          : doc.file_type === "image/webp"
            ? "image/webp"
            : "image/jpeg";
    }

    const { extracted, confidence } = await extractFromImage(imageBase64, mimeType);

    if (!extracted.amount && !extracted.vendor && !extracted.date) {
      return NextResponse.json({
        extracted: null,
        confidence: 0,
        message: "Could not extract usable data. Use manual entry.",
      });
    }

    const extractedJson = {
      amount: extracted.amount ?? null,
      date: extracted.date ?? null,
      vendor: extracted.vendor ?? null,
      category: extracted.category ?? null,
    };

    const updatePayload: Record<string, unknown> = {
      extracted_json: extractedJson,
      confidence: Math.round(confidence * 100) / 100,
      updated_at: new Date().toISOString(),
    };
    if (extracted.doc_type) {
      updatePayload.doc_type = extracted.doc_type;
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    await supabase.from("extractions").delete().eq("document_id", id);

    const fields = [
      { field_name: "amount", value: extracted.amount },
      { field_name: "date", value: extracted.date },
      { field_name: "vendor", value: extracted.vendor },
      { field_name: "category", value: extracted.category },
    ].filter((f) => f.value != null && f.value !== "");

    if (fields.length > 0) {
      await supabase.from("extractions").insert(
        fields.map((f) => ({
          document_id: id,
          field_name: f.field_name,
          value: String(f.value),
          confidence,
        }))
      );
    }

    return NextResponse.json({
      extracted: extractedJson,
      confidence,
    });
  } catch (err) {
    console.error("Extract error:", err);
    const message =
      err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
