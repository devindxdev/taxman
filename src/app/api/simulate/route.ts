import { createClient } from "@/lib/supabase/server";
import { getMarginalRateBC } from "@/lib/bc-tax";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_MARGINAL_RATE = 28.2; // BC middle bracket if no income provided

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

    const body = await request.json();
    const businessUsePercent = Math.min(100, Math.max(0, Number(body.businessUsePercent) || 0));
    const estimatedIncome = Number(body.estimatedIncome) || 0;

    const marginalRate =
      estimatedIncome > 0 ? getMarginalRateBC(estimatedIncome) : DEFAULT_MARGINAL_RATE;

    const { data: docs } = await supabase
      .from("documents")
      .select("extracted_json")
      .eq("user_id", user.id)
      .not("extracted_json", "is", null);

    let totalDeductible = 0;
    for (const doc of docs || []) {
      const amount = Number((doc.extracted_json as Record<string, unknown>)?.amount);
      if (!isNaN(amount)) {
        totalDeductible += amount * (businessUsePercent / 100);
      }
    }

    const estimatedSavings = totalDeductible * (marginalRate / 100);

    return NextResponse.json({
      businessUsePercent,
      estimatedIncome: estimatedIncome || null,
      marginalRate,
      estimatedDeductible: Math.round(totalDeductible * 100) / 100,
      estimatedTaxSavings: Math.round(estimatedSavings * 100) / 100,
      note: "BC combined federal + provincial rates. Consult a tax professional.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Simulation failed" },
      { status: 500 }
    );
  }
}
