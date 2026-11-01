import { describe, expect, it } from "vitest";
import { maskName, maskFamily } from "@/lib/privacy-store";
import {
  normalizePin,
  findPublicReportByPin,
  addPublicReport,
} from "@/lib/reports-store";

describe("LGPD Privacy & Name Masking", () => {
  it("masks child full names into initials", () => {
    expect(maskName("Lucas Silva", true)).toBe("L. S.");
    expect(maskName("Maria Eduarda Santos", true)).toBe("M. E. S.");
    expect(maskName("Ana Clara", true)).toBe("A. C.");
  });

  it("preserves already masked initials", () => {
    expect(maskName("J. S.", true)).toBe("J. S.");
    expect(maskName("L. O.", true)).toBe("L. O.");
    expect(maskName("A.S.", true)).toBe("A. S.");
  });

  it("does not mask when privacy mode is disabled", () => {
    expect(maskName("Lucas Silva", false)).toBe("Lucas Silva");
    expect(maskName("Maria Eduarda Santos", false)).toBe("Maria Eduarda Santos");
  });

  it("masks family surnames into initials", () => {
    expect(maskFamily("Silva", true)).toBe("S.");
    expect(maskFamily("Oliveira", true)).toBe("O.");
    expect(maskFamily("Pereira", true)).toBe("P.");
    expect(maskFamily("Silva", false)).toBe("Silva");
  });
});

describe("Public Reports & PIN Tracking", () => {
  it("normalizes various PIN input formats", () => {
    expect(normalizePin("#PROT-8921")).toBe("#PROT-8921");
    expect(normalizePin("prot-8921")).toBe("#PROT-8921");
    expect(normalizePin("PROT8921")).toBe("#PROT-8921");
    expect(normalizePin("8921")).toBe("#PROT-8921");
    expect(normalizePin(" 1042 ")).toBe("#PROT-1042");
  });

  it("finds pre-registered reports by PIN and partial pin", () => {
    const report1 = findPublicReportByPin("8921");
    expect(report1).not.toBeNull();
    expect(report1?.pin).toBe("#PROT-8921");
    expect(report1?.type).toBe("Violência doméstica");
    expect(report1?.timeline.length).toBeGreaterThan(0);

    const report2 = findPublicReportByPin("#PROT-1042");
    expect(report2).not.toBeNull();
    expect(report2?.status).toBe("visit_scheduled");

    const notFound = findPublicReportByPin("9999");
    expect(notFound).toBeNull();
  });

  it("registers new anonymous reports and enables instant PIN tracking", () => {
    const created = addPublicReport({
      type: "Negligência",
      place: "Centro",
      desc: "Situação acompanhada pela comunidade",
    });

    expect(created.pin).toMatch(/^#PROT-\d{4}$/);
    expect(created.status).toBe("screening");

    const fetched = findPublicReportByPin(created.pin);
    expect(fetched).not.toBeNull();
    expect(fetched?.pin).toBe(created.pin);
    expect(fetched?.type).toBe("Negligência");
  });
});

