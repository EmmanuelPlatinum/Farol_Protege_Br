export type SupportNeed = "confirmed" | "suspected" | "none" | "unknown";

export function isSupportNeed(value: string): value is SupportNeed {
  return value === "confirmed" || value === "suspected" || value === "none" || value === "unknown";
}
