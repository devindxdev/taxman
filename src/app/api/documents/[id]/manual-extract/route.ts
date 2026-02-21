import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
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

    const { amount } = await request.json();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, extracted_json")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const existing = (doc.extracted_json as Record<string, unknown>) || {};
    const extracted = { ...existing, amount: numAmount };

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        extracted_json: extracted,
        confidence: 0.9,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    await supabase.from("extractions").delete().eq("document_id", id);
    await supabase.from("extractions").insert({
      document_id: id,
      field_name: "amount",
      value: String(numAmount),
      confidence: 0.9,
    });

    return NextResponse.json({ extracted });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}
