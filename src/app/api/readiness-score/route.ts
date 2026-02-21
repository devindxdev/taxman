import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      { count: docCount },
      { count: txCount },
      { count: matchedCount },
      { count: extractedCount },
    ] = await Promise.all([
      supabase.from("documents").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("transactions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("transactions").select("*", { count: "exact", head: true }).eq("user_id", user.id).not("matched_document_id", "is", null),
      supabase.from("documents").select("*", { count: "exact", head: true }).eq("user_id", user.id).not("extracted_json", "is", null),
    ]);

    const documents = docCount ?? 0;
    const transactions = txCount ?? 0;
    const matched = matchedCount ?? 0;
    const extracted = extractedCount ?? 0;

    const hasDocuments = documents > 0;
    const hasTransactions = transactions > 0;
    const matchRate = transactions > 0 ? matched / transactions : 0;
    const extractRate = documents > 0 ? extracted / documents : 0;

    const score = Math.round(
      (hasDocuments ? 25 : 0) +
      (hasTransactions ? 25 : 0) +
      matchRate * 25 +
      extractRate * 25
    );

    return NextResponse.json({
      score: Math.min(100, score),
      breakdown: {
        documents,
        transactions,
        matched,
        extracted,
        hasDocuments,
        hasTransactions,
        matchRate,
        extractRate,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to compute score" },
      { status: 500 }
    );
  }
}
