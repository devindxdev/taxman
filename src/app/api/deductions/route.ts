import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEDUCTIBLE_CATEGORIES = [
  "office_supplies",
  "travel",
  "meals",
  "equipment",
  "software",
  "professional_services",
];

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

    const { data: transactions } = await supabase
      .from("transactions")
      .select("id, amount, date, merchant, category, matched_document_id")
      .eq("user_id", user.id)
      .is("matched_document_id", null)
      .order("date", { ascending: false })
      .limit(100);

    const candidates = (transactions || []).filter((tx) => {
      const cat = (tx.category || "").toLowerCase();
      return (
        DEDUCTIBLE_CATEGORIES.some((d) => cat.includes(d)) ||
        /office|software|travel|meal|equipment|consulting|legal|accounting/i.test(
          tx.merchant || ""
        )
      );
    });

    return NextResponse.json({
      candidates: candidates.slice(0, 10).map((t) => ({
        id: t.id,
        amount: t.amount,
        date: t.date,
        merchant: t.merchant,
        category: t.category,
        question: `Is this $${Number(t.amount).toFixed(2)} at ${t.merchant || "unknown"} business-related?`,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch deductions" },
      { status: 500 }
    );
  }
}
