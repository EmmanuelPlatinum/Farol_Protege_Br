import { describe, expect, it } from "vitest";
import { dateKey, normalizePhone, onCall, weekDates } from "@/lib/shift-schedule";

describe("Weekly shifts", () => {
  it("returns seven days starting Monday and containing today's Sunday", () => {
    const week = weekDates(new Date(2026, 10, 1, 12));
    expect(week.map(dateKey)).toEqual(["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"]);
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
  });
  it("normalizes a user-provided Brazilian number for phone and WhatsApp", () => {
    expect(normalizePhone("(11) 99999-9999")).toBe("5511999999999");
  });
});