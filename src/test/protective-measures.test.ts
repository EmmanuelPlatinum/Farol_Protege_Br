import { describe, expect, it } from "vitest";
import {
  addDaysToDateKey,
  getDaysUntilDeadline,
  getMeasureDeadline,
  isDueWithinDays,
  isActiveMeasureStatus,
  protectiveMeasureTemplates,
  type ProtectiveMeasure,
} from "@/lib/protective-measures";

const measure: ProtectiveMeasure = {
  id: "measure-1",
  templateId: "school-enrollment",
  title: "Matrícula e frequência escolar",
  category: "child",
  legalBasis: "ECA, art. 101, III",
  status: "pending",
  createdAt: "2026-11-01T10:00:00.000Z",
  deadlineDays: 15,
};

describe("protective measure SLA helpers", () => {
  it("calculates a deadline using calendar days and crosses month boundaries", () => {
    expect(addDaysToDateKey("2026-11-01", 15)).toBe("2026-11-16");
    expect(addDaysToDateKey("2026-12-20", 15)).toBe("2027-01-04");
    expect(getMeasureDeadline(measure)).toBe("2026-11-16");
  });

  it("calculates days remaining and counts active measures due this week", () => {
    expect(getDaysUntilDeadline(measure, "2026-11-13")).toBe(3);
    expect(isDueWithinDays(measure, 7, "2026-11-13")).toBe(true);
    expect(isDueWithinDays(measure, 7, "2026-11-17")).toBe(false);
  });

  it("does not count completed or breached measures as active SLA items", () => {
    expect(isActiveMeasureStatus("pending")).toBe(true);
    expect(isActiveMeasureStatus("in_progress")).toBe(true);
    expect(
      isDueWithinDays({ ...measure, status: "completed" }, 7, "2026-11-13"),
    ).toBe(false);
    expect(
      isDueWithinDays({ ...measure, status: "breached" }, 7, "2026-11-13"),
    ).toBe(false);
  });

  it("provides measures for both children and caregivers with the requested default SLAs", () => {
    expect(protectiveMeasureTemplates.some((item) => item.category === "child")).toBe(true);
    expect(protectiveMeasureTemplates.some((item) => item.category === "caregiver")).toBe(true);
    expect(
      protectiveMeasureTemplates.find((item) => item.id === "school-enrollment")
        ?.defaultDeadlineDays,
    ).toBe(15);
    expect(
      protectiveMeasureTemplates.find((item) => item.id === "family-support")
        ?.defaultDeadlineDays,
    ).toBe(30);
  });
});
