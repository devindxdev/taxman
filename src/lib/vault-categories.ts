export const VAULT_CATEGORIES = [
  { key: "office_supplies", label: "Office Supplies" },
  { key: "travel", label: "Travel" },
  { key: "meals", label: "Meals" },
  { key: "medical", label: "Medical" },
  { key: "equipment", label: "Equipment" },
  { key: "software", label: "Software" },
  { key: "professional_services", label: "Professional Services" },
  { key: "other", label: "Other" },
] as const;

export type VaultCategoryKey = (typeof VAULT_CATEGORIES)[number]["key"];

export function getCategoryLabel(
  key: string | null | undefined
): string {
  if (!key) return "Uncategorized";
  const found = VAULT_CATEGORIES.find((c) => c.key === key);
  return found ? found.label : key;
}
