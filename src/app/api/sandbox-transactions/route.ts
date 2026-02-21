import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

function parseMerchant(description: string): string {
  const match = description.match(/Merchant name:\s*(.+)$/i);
  return match ? match[1].trim() : description;
}

export async function GET() {
  try {
    const candidates = [
      path.join(process.cwd(), "..", "plaid", "sandbox-transactions"),
      path.join(process.cwd(), "plaid", "sandbox-transactions"),
    ];
    let raw: string | null = null;
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        raw = fs.readFileSync(filePath, "utf-8");
        break;
      }
    }
    if (!raw) {
      throw new Error("sandbox-transactions file not found");
    }
    const data = JSON.parse(raw);

    type TxOut = { plaid_id: string; amount: number; date: string; merchant: string; category: string | null };
    let mapped: TxOut[] = [];

    if (data.override_accounts) {
      for (const account of data.override_accounts) {
        const txs = account.transactions || [];
        for (let i = 0; i < txs.length; i++) {
          const t = txs[i];
          const amount = Math.abs(Number(t.amount));
          const date = t.date_transacted || t.date_posted || t.date || "";
          const merchant = parseMerchant(t.description || "");
          const plaid_id = `${account.numbers?.account || "sandbox"}-${date}-${i}-${amount}`;
          mapped.push({ plaid_id, amount, date, merchant, category: null });
        }
      }
    } else if (data.transactions) {
      mapped = data.transactions.map(
        (t: { amount?: number; date?: string; name?: string; category?: string[]; transaction_id?: string }, i: number) => {
          const amount = Math.abs(Number(t.amount ?? 0));
          const date = t.date || "";
          const merchant = (t.name || "Unknown").trim();
          const plaid_id = t.transaction_id || `sandbox-${date}-${i}-${amount}`;
          const category = Array.isArray(t.category) ? t.category.join(" ") : null;
          return { plaid_id, amount, date, merchant, category };
        }
      );
    }

    mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const shuffled = [...mapped].sort(() => Math.random() - 0.5);
    const sampled = shuffled.slice(0, 10);

    return NextResponse.json({ transactions: sampled });
  } catch (err) {
    console.error("Sandbox transactions error:", err);
    return NextResponse.json(
      { error: "Failed to load sandbox transactions" },
      { status: 500 }
    );
  }
}
