// MOCK availability — deterministic, derived from the date + item id. No storage.
export type AvailabilityLevel = "available" | "few" | "full";

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function getAvailability(dateISO: string, itemId: string, capacity = 8) {
  const h = hash(`${dateISO}|${itemId}`);
  const past = new Date(dateISO) < new Date(new Date().toDateString());
  if (past) return { level: "full" as AvailabilityLevel, remaining: 0, capacity };
  const bucket = h % 10;
  if (bucket === 0 || bucket === 1) return { level: "full" as AvailabilityLevel, remaining: 0, capacity };
  if (bucket <= 4) {
    const remaining = 1 + (h % 2);
    return { level: "few" as AvailabilityLevel, remaining, capacity };
  }
  return {
    level: "available" as AvailabilityLevel,
    remaining: Math.max(3, capacity - (h % 3)),
    capacity,
  };
}

export type Slot = "matin" | "apres-midi" | "journee";

export function getSlots(dateISO: string, itemId: string) {
  return (["matin", "apres-midi", "journee"] as Slot[]).map((slot) => ({
    slot,
    ...getAvailability(dateISO, `${itemId}:${slot}`),
  }));
}
