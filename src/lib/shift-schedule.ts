export const counselors = ["Ana Costa", "Marcos Lima", "Júlia Rocha", "Paulo Mendes"];

export type SwapRequest = {
  key: string;
  dateKey: string;
  period: number;
  originalCounselor: number;
  replacementCounselor: number;
  reason: string;
  status: "pending_approval" | "approved" | "rejected";
  requestedAt: string;
};

export function weekDates(date: Date, offset = 0): Date[] {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + i);
    return day;
  });
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function shiftKey(date: Date, period: number): string {
  return `${dateKey(date)}-${period}`;
}

export function assignedCounselor(date: Date, period: number): number {
  return (((date.getDay() + 6) % 7) * 2 + period) % counselors.length;
}

export function onCall(now: Date) {
  const date = new Date(now);
  if (now.getHours() < 8) date.setDate(date.getDate() - 1);
  const period = now.getHours() >= 8 && now.getHours() < 18 ? 0 : 1;
  return { date, period, counselor: assignedCounselor(date, period) };
}

export function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) return digits;
  return null;
}

export function formatPhoneDisplay(value: string): string {
  const normalized = normalizePhone(value);
  if (!normalized) return value;
  const ddd = normalized.slice(2, 4);
  const number = normalized.slice(4);
  if (number.length === 9) {
    return `+55 (${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
  }
  if (number.length === 8) {
    return `+55 (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }
  return `+${normalized}`;
}

/**
 * Pure helper ensuring simulated swap requests in pending status
 * DO NOT replace the active titular counselor without coordinator approval.
 */
export function resolveActiveCounselor(
  originalCounselorIndex: number,
  swapRequest?: { status: "pending_approval" | "approved" | "rejected"; replacementCounselor: number } | null
): number {
  if (swapRequest && swapRequest.status === "approved") {
    return swapRequest.replacementCounselor;
  }
  return originalCounselorIndex;
}
