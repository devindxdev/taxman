import { NextRequest, NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

export async function POST(request: NextRequest) {
  try {
    const { public_token } = await request.json();
    if (!public_token) {
      return NextResponse.json(
        { error: "Missing public_token" },
        { status: 400 }
      );
    }

    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;

    if (!clientId || !secret) {
      return NextResponse.json(
        { error: "Plaid not configured" },
        { status: 503 }
      );
    }

    const configuration = new Configuration({
      basePath: process.env.PLAID_ENV === "production"
        ? PlaidEnvironments.production
        : PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "Plaid-Secret": secret,
        },
      },
    });

    const plaidClient = new PlaidApi(configuration);

    const { data } = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = data.access_token;

    const transactionsResponse = await plaidClient.transactionsSync({
      access_token: accessToken,
    });

    const added = transactionsResponse.data.added;
    const transactions = added.map((t) => ({
      plaid_id: t.transaction_id,
      amount: Math.abs(t.amount),
      date: t.date,
      merchant: t.merchant_name || t.name,
      category: t.personal_finance_category?.primary,
    }));

    return NextResponse.json({
      success: true,
      access_token: accessToken,
      transactions_synced: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}
