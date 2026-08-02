// Currency integration point:
// - Currently hardcoded to Nigerian Naira (NGN) to match the EarnXact platform.
export const CURRENCY_SYMBOL = "\u20a6";
export const CURRENCY_CODE = "NGN";

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString()}`;
}
