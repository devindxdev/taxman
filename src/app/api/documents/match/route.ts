import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { document_id } = await request.json();
    if (!document_id) {
      return NextResponse.json(
        { error: "Missing document_id" },
        { status: 400 }
      );
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, extracted_json")
      .eq("id", document_id)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const extracted = (doc.extracted_json as Record<string, unknown>) || {};
    const amount = Number(extracted.amount);
    const date = extracted.date as string | undefined;
    const vendor = (extracted.vendor as string) || "";

    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { error: "Document has no amount to match" },
        { status: 400 }
      );
    }

    const { data: transactions } = await supabase
      .from("transactions")
      .select("id, amount, date, merchant")
      .eq("user_id", user.id)
      .is("matched_document_id", null);

    let bestMatch: { id: string; score: number } | null = null;
    const amountTolerance = 0.02;
    const dateRangeDays = 7;

    for (const tx of transactions || []) {
      const amountMatch = Math.abs(Number(tx.amount) - amount) <= amountTolerance;
      if (!amountMatch) continue;

      let dateMatch = true;
      if (date && tx.date) {
        const docDate = new Date(date);
        const txDate = new Date(tx.date);
        const diffDays = Math.abs(
          (docDate.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        dateMatch = diffDays <= dateRangeDays;
      }

      const merchantMatch =
        !vendor ||
        !tx.merchant ||
        vendor.toLowerCase().includes(tx.merchant.toLowerCase()) ||
        tx.merchant.toLowerCase().includes(vendor.toLowerCase());

      const score =
        (amountMatch ? 1 : 0) * 0.4 +
        (dateMatch ? 1 : 0) * 0.3 +
        (merchantMatch ? 1 : 0) * 0.3;

      if (score >= 0.5 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { id: tx.id, score };
      }
    }

    if (bestMatch) {
      await supabase
        .from("transactions")
        .update({ matched_document_id: document_id })
        .eq("id", bestMatch.id);

      await supabase.from("evidence_links").insert({
        document_id,
        transaction_id: bestMatch.id,
        user_confirmed: false,
      });
    }

    return NextResponse.json({
      matched: !!bestMatch,
      transaction_id: bestMatch?.id,
      score: bestMatch?.score,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Matching failed" },
      { status: 500 }
    );
  }
}
