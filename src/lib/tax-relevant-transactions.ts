/**
 * Flags Plaid transactions that could be used for BC/Canada tax returns.
 * Uses category and merchant name patterns for common deductible types.
 */

import type { Transaction } from "@/lib/local-storage";

export type TaxRelevantReason =
  | "matched"
  | "medical"
  | "office_supplies"
  | "travel"
  | "meals"
  | "equipment"
  | "software"
  | "professional_services"
  | "charitable";

const CATEGORY_PATTERNS: { pattern: RegExp | string; reason: TaxRelevantReason }[] = [
  { pattern: /healthcare|medical|pharmac|dental|vision|optometr|physiotherap|prescription/i, reason: "medical" },
  { pattern: /office|supplies|stationery|staples/i, reason: "office_supplies" },
  { pattern: /travel|transportation|airline|hotel|lodging|gas|fuel|uber|lyft/i, reason: "travel" },
  { pattern: /restaurant|meal|food|dining|cafe/i, reason: "meals" },
  { pattern: /computer|electronics|equipment|hardware/i, reason: "equipment" },
  { pattern: /software|subscription|saas|adobe|microsoft|slack|zoom|aws/i, reason: "software" },
  { pattern: /legal|accounting|consulting|professional|professional_services/i, reason: "professional_services" },
  { pattern: /donation|charity|charitable|nonprofit/i, reason: "charitable" },
];

const MERCHANT_PATTERNS: { pattern: RegExp | string; reason: TaxRelevantReason }[] = [
  { pattern: /shoppers|pharmacy|rexall|london drugs|well.ca|costco pharmacy|walmart pharmacy/i, reason: "medical" },
  { pattern: /dental|dentist|optometrist|eye doctor|physio|chiro|clinic|medical|united healthcar/i, reason: "medical" },
  { pattern: /staples|office depot|grand.*toy|business depot/i, reason: "office_supplies" },
  { pattern: /air canada|westjet|airline|expedia|booking|hotel|motel|marriott|hilton|american air/i, reason: "travel" },
  { pattern: /uber|lyft|taxi|gas station|esso|shell|petro|chevron/i, reason: "travel" },
  { pattern: /restaurant|cafe|starbucks|tim horton|mcdonald|subway|pub|grill/i, reason: "meals" },
  { pattern: /best buy|dell|apple store|computer|lenovo|hp|canon|logitech/i, reason: "equipment" },
  { pattern: /adobe|microsoft|slack|zoom|dropbox|aws|google cloud|github|atlassian|twilio|typeform|hubspot|calendly|linkedin|amazon web services/i, reason: "software" },
  { pattern: /lawyer|legal|accountant|consulting|kpmg|deloitte|ernst|pwc|h&r block|gusto|intuit|hiscox|small business administration|sba|brex/i, reason: "professional_services" },
  { pattern: /\blabor\b|labor&|att.*bill|amex epayment/i, reason: "professional_services" },
  { pattern: /charity|donation|united way|red cross|foundation|salvation army/i, reason: "charitable" },
];

export function getTaxRelevantInfo(tx: Transaction): { relevant: boolean; reason?: TaxRelevantReason } {
  if (tx.matched_document_id) {
    return { relevant: true, reason: "matched" };
  }

  const merchant = (tx.merchant || "").toLowerCase();
  const category = (tx.category || "").toLowerCase();

  for (const { pattern, reason } of MERCHANT_PATTERNS) {
    if (typeof pattern === "string" ? merchant.includes(pattern) : pattern.test(merchant)) {
      return { relevant: true, reason };
    }
  }

  for (const { pattern, reason } of CATEGORY_PATTERNS) {
    if (typeof pattern === "string" ? category.includes(pattern) : pattern.test(category)) {
      return { relevant: true, reason };
    }
  }

  return { relevant: false };
}

export const TAX_REASON_LABELS: Record<TaxRelevantReason, string> = {
  matched: "Matched to receipt",
  medical: "Medical",
  office_supplies: "Office supplies",
  travel: "Travel",
  meals: "Meals",
  equipment: "Equipment",
  software: "Software",
  professional_services: "Professional services",
  charitable: "Charitable",
};
