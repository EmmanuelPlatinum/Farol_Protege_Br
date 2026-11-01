import { describe, expect, it } from "vitest";
import {
  dateKey,
  formatPhoneDisplay,
  normalizePhone,
  onCall,
  resolveActiveCounselor,
  shiftKey,
  weekDates,
} from "@/lib/shift-schedule";

describe("Weekly shifts", () => {
  it("returns seven days starting Monday and containing today's Sunday", () => {
    const week = weekDates(new Date(2026, 10, 1, 12));
    expect(week.map(dateKey)).toEqual([
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
    ]);
  });

  it("moves exactly one week when navigating", () => {
    expect(dateKey(weekDates(new Date(2026, 10, 1), 1)[0])).toBe("2026-11-02");
  });

  it("keeps the previous night's shift active before 08:00", () => {
    const active = onCall(new Date(2026, 10, 1, 7, 59));
    expect(dateKey(active.date)).toBe("2026-10-31");
    expect(active.period).toBe(1);
  });

  it("changes to the day shift at 08:00", () => {
    expect(onCall(new Date(2026, 10, 1, 8)).period).toBe(0);
  });

  it("changes to the night shift at 18:00", () => {
    expect(onCall(new Date(2026, 10, 1, 18)).period).toBe(1);
  });

  it("does not produce callable links for absent or invalid numbers", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("abc-def")).toBeNull();
  });

  it("normalizes a user-provided Brazilian number for phone and WhatsApp", () => {
    expect(normalizePhone("(11) 99999-9999")).toBe("5511999999999");
    expect(normalizePhone("11988887777")).toBe("5511988887777");
    expect(normalizePhone("5511988887777")).toBe("5511988887777");
  });

  it("formats normalized Brazilian numbers for human display", () => {
    expect(formatPhoneDisplay("11999998888")).toBe("+55 (11) 99999-8888");
    expect(formatPhoneDisplay("1133334444")).toBe("+55 (11) 3333-4444");
    expect(formatPhoneDisplay("invalid")).toBe("invalid");
  });

  it("computes standard shift key format", () => {
    const d = new Date(2026, 9, 31);
    expect(shiftKey(d, 0)).toBe("2026-10-31-0");
    expect(shiftKey(d, 1)).toBe("2026-10-31-1");
  });

  it("never replaces the active titular counselor for pending or unapproved swap requests", () => {
    const originalCounselor = 0; // Ana Costa
    const replacementCounselor = 2; // Júlia Rocha

    // Pending swap must retain original counselor
    const pendingResult = resolveActiveCounselor(originalCounselor, {
      status: "pending_approval",
      replacementCounselor,
    });
    expect(pendingResult).toBe(originalCounselor);

    // Rejected swap must retain original counselor
    const rejectedResult = resolveActiveCounselor(originalCounselor, {
      status: "rejected",
      replacementCounselor,
    });
    expect(rejectedResult).toBe(originalCounselor);

    // Null or undefined swap retains original counselor
    expect(resolveActiveCounselor(originalCounselor, null)).toBe(originalCounselor);

    // Only approved swap replaces counselor
    const approvedResult = resolveActiveCounselor(originalCounselor, {
      status: "approved",
      replacementCounselor,
    });
    expect(approvedResult).toBe(replacementCounselor);
  });
});
