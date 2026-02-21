import { extractFromImage } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const dynamic = "force-dynamic";

async function processFile(file: File): Promise<{ imageBase64: string; mimeType: "image/jpeg" | "image/png" | "image/webp" }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file.type === "application/pdf") {
      const { pdf } = await import("pdf-to-img");
      const document = await pdf(buffer, { scale: 2 });
      let firstPage: Buffer | undefined;
      for await (const page of document) {
        firstPage = page;
        break;
      }
      if (!firstPage) {
        throw new Error("Could not render PDF to image");
      }
    return {
      imageBase64: firstPage.toString("base64"),
      mimeType: "image/png" as const,
    };
  }
  return {
    imageBase64: buffer.toString("base64"),
    mimeType:
      file.type === "image/png"
        ? ("image/png" as const)
        : file.type === "image/webp"
          ? ("image/webp" as const)
          : ("image/jpeg" as const),
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI is not configured. Set OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let imageBase64: string;
    let mimeType: "image/jpeg" | "image/png" | "image/webp";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const rawBase64 = body.base64 ?? body.fileBase64;
      const mt = body.mimeType ?? body.fileType;
      if (!rawBase64) {
        return NextResponse.json({ error: "Missing base64 or fileBase64" }, { status: 400 });
      }
      if (mt === "application/pdf") {
        const buffer = Buffer.from(rawBase64, "base64");
        const { pdf } = await import("pdf-to-img");
        const document = await pdf(buffer, { scale: 2 });
        let firstPage: Buffer | undefined;
        for await (const page of document) {
          firstPage = page;
          break;
        }
        if (!firstPage) {
          return NextResponse.json({ error: "Could not render PDF to image" }, { status: 500 });
        }
        imageBase64 = firstPage.toString("base64");
        mimeType = "image/png";
      } else {
        imageBase64 = rawBase64;
        mimeType = mt === "image/png" ? "image/png" : mt === "image/webp" ? "image/webp" : "image/jpeg";
      }
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Allowed: PDF, JPEG, PNG, WebP" },
          { status: 400 }
        );
      }
      const result = await processFile(file);
      imageBase64 = result.imageBase64;
      mimeType = result.mimeType;
    }

    const { extracted, confidence } = await extractFromImage(imageBase64, mimeType);

    const extractedJson = {
      amount: extracted.amount ?? null,
      date: extracted.date ?? null,
      vendor: extracted.vendor ?? null,
      category: extracted.category ?? null,
    };

    return NextResponse.json({
      extracted: extractedJson,
      confidence,
      doc_type: extracted.doc_type ?? null,
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
