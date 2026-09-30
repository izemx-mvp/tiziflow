// MOCK payment — no provider, no network, no card data ever transmitted.
export const REFUSED_CARD = "4000000000000002";

export type PaymentResult = { ok: true; id: string } | { ok: false; reason: "refused" };

export async function payMock(cardNumber: string): Promise<PaymentResult> {
  await new Promise((r) => setTimeout(r, 1500)); // fake processing delay
  const digits = cardNumber.replace(/\s/g, "");
  if (digits === REFUSED_CARD) return { ok: false, reason: "refused" };
  return { ok: true, id: `pay_${Math.random().toString(36).slice(2, 10)}` };
}

export function detectBrand(cardNumber: string): "visa" | "mastercard" | "amex" | "unknown" {
  const n = cardNumber.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

export function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
