import { NextResponse } from "next/server";
import { Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products } from "plaid";

const LOCAL_USER_ID = "local-dev";

export async function POST() {
  try {
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

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: LOCAL_USER_ID },
      client_name: "Taxman",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
