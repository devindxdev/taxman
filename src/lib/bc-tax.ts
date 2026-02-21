/**
 * British Columbia, Canada - Combined federal + provincial tax rates 2024
 * Source: TaxTips.ca, CRA
 */

export const BC_TAX_YEAR = 2025;
export const BC_FILING_DEADLINE = "April 30, 2026";

/** Combined federal + BC marginal rates for "Other Income" (employment, business, etc.) - 2024 */
const BC_COMBINED_BRACKETS_2024: { maxIncome: number; rate: number }[] = [
  { maxIncome: 47_937, rate: 20.06 },
  { maxIncome: 55_867, rate: 22.70 },
  { maxIncome: 95_875, rate: 28.20 },
  { maxIncome: 110_076, rate: 31.00 },
  { maxIncome: 111_733, rate: 32.79 },
  { maxIncome: 133_664, rate: 38.29 },
  { maxIncome: 173_205, rate: 40.70 },
  { maxIncome: 181_232, rate: 44.02 },
  { maxIncome: 246_752, rate: 46.12 },
  { maxIncome: 252_752, rate: 49.80 },
  { maxIncome: Infinity, rate: 53.50 },
];

/** Returns marginal tax rate (0-100) for BC resident based on taxable income */
export function getMarginalRateBC(taxableIncome: number): number {
  if (taxableIncome <= 0) return BC_COMBINED_BRACKETS_2024[0].rate;
  for (const bracket of BC_COMBINED_BRACKETS_2024) {
    if (taxableIncome <= bracket.maxIncome) return bracket.rate;
  }
  return BC_COMBINED_BRACKETS_2024[BC_COMBINED_BRACKETS_2024.length - 1].rate;
}

/** BC combined brackets for display */
export const BC_BRACKETS_DISPLAY = BC_COMBINED_BRACKETS_2024.map((b, i) => ({
  from: i === 0 ? 0 : BC_COMBINED_BRACKETS_2024[i - 1].maxIncome + 0.01,
  to: b.maxIncome === Infinity ? null : b.maxIncome,
  rate: b.rate,
}));
