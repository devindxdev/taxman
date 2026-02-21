import OpenAI from "openai";

export type ExtractedData = {
  amount?: number;
  date?: string;
  vendor?: string;
  category?: string;
  doc_type?: "receipt" | "invoice" | "form" | "other";
  line_items?: Array<{ description: string; amount: number }>;
};

const EXTRACTION_PROMPT = `You are a tax document extraction assistant. Analyze this receipt or invoice image and extract structured data.

Return a JSON object with these fields (use null for missing values):
- amount: number - total amount (e.g. 49.99)
- date: string - transaction date in YYYY-MM-DD format
- vendor: string - merchant or vendor name
- category: string - tax category. Use exactly one of: office_supplies, travel, meals, medical, equipment, software, professional_services, other
  - Use "medical" for: prescription drugs, pharmacy receipts, medical supplies, dental, optometry, physiotherapy, and any health-related expenses
  - Use "office_supplies" for office/stationery
  - Use "travel" for transportation, flights, hotels
  - Use "meals" for restaurants, food
  - Use "equipment" for hardware, machinery
  - Use "software" for software, subscriptions
  - Use "professional_services" for legal, accounting, consulting
  - Use "other" only when none of the above fit
- doc_type: one of "receipt", "invoice", "form", "other"

Only return valid JSON, no other text.`;

function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: key });
}

export async function extractFromImage(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp"
): Promise<{ extracted: ExtractedData; confidence: number }> {
  const client = getClient();

  const url = `data:${mimeType};base64,${imageBase64}`;

  let response;
  try {
    response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: EXTRACTION_PROMPT,
          },
          {
            type: "image_url",
            image_url: { url },
          },
        ],
      },
    ],
    max_tokens: 500,
  });
  } catch (err: unknown) {
    const status = err && typeof err === "object" && "status" in err ? (err as { status: number }).status : 0;
    if (status === 429) {
      throw new Error("OpenAI rate limit exceeded. Please try again shortly.");
    }
    throw err;
  }

  const content = response!.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("No extraction result from OpenAI");
  }

  // Parse JSON - handle potential markdown code blocks
  let jsonStr = content;
  const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    jsonStr = codeBlock[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Invalid JSON in extraction response");
  }

  const obj = parsed as Record<string, unknown>;
  const amount = typeof obj.amount === "number" ? obj.amount : undefined;
  const date = typeof obj.date === "string" ? obj.date : undefined;
  const vendor = typeof obj.vendor === "string" ? obj.vendor : undefined;
  const category = typeof obj.category === "string" ? obj.category : undefined;
  const docType = ["receipt", "invoice", "form", "other"].includes(
    String(obj.doc_type)
  )
    ? (obj.doc_type as ExtractedData["doc_type"])
    : undefined;

  const extracted: ExtractedData = {
    amount: amount != null && !isNaN(amount) ? amount : undefined,
    date,
    vendor,
    category,
    doc_type: docType,
  };

  // Compute confidence: 0.9 if we got amount, 0.7 if we got other fields, 0.5 otherwise
  let confidence = 0.5;
  if (extracted.amount != null) confidence = 0.9;
  else if (extracted.vendor || extracted.date) confidence = 0.7;

  return { extracted, confidence };
}
