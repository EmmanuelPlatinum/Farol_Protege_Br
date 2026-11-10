import { describe, expect, it } from "vitest";
import { maskName, maskFamily } from "@/lib/privacy-store";
import {
  normalizePin,
  findPublicReportByPin,
  addPublicReport,
} from "@/lib/reports-store";
import { isSupportNeed } from "@/lib/protection-types";

describe("Protection triage", () => {
  it("accepts only the supported diagnosis/suspicion choices", () => {
    expect(isSupportNeed("confirmed")).toBe(true);
    expect(isSupportNeed("suspected")).toBe(true);
    expect(isSupportNeed("none")).toBe(true);
    expect(isSupportNeed("unknown")).toBe(true);
    expect(isSupportNeed("other")).toBe(false);
  });
});

describe("LGPD Privacy & Name Masking", () => {
  it("masks child full names into initials", () => {
    expect(maskName("Lucas Silva")).toBe("L. S.");
    expect(maskName("Maria Eduarda Santos")).toBe("M. E. S.");
    expect(maskName("Ana Clara")).toBe("A. C.");
  });

  it("preserves already masked initials", () => {
    expect(maskName("J. S.")).toBe("J. S.");
    expect(maskName("L. O.")).toBe("L. O.");
    expect(maskName("A.S.")).toBe("A. S.");
  });

  it("masks family surnames into initials", () => {
    expect(maskFamily("Silva")).toBe("S.");
    expect(maskFamily("Oliveira")).toBe("O.");
    expect(maskFamily("Pereira")).toBe("P.");
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

  it("finds reports without exposing investigation details or internal statuses", () => {
    const report1 = findPublicReportByPin("8921");
    expect(report1).not.toBeNull();
    expect(report1?.pin).toBe("#PROT-8921");
    expect(report1?.type).toBe("Denúncia cidadã");
    expect(report1?.timeline).toEqual([]);
    expect(report1?.summary).not.toContain("medidas protetivas");

    const report2 = findPublicReportByPin("#PROT-1042");
    expect(report2).not.toBeNull();
    expect(report2?.status).toBe("screening");
    expect(report2?.statusLabel).toBe("Em processamento");

    const notFound = findPublicReportByPin("9999");
    expect(notFound).toBeNull();
  });

  it("registers new anonymous reports and enables instant PIN tracking", () => {
    const created = addPublicReport({
      type: "Negligência",
      place: "Centro",
      desc: "Situação acompanhada pela comunidade",
      supportNeed: "suspected",
    });

    expect(created.pin).toMatch(/^#PROT-\d{4}$/);
    expect(created.status).toBe("screening");

    const fetched = findPublicReportByPin(created.pin);
    expect(fetched).not.toBeNull();
    expect(fetched?.pin).toBe(created.pin);
    expect(fetched?.type).toBe("Denúncia cidadã");
    expect(fetched?.supportNeed).toBeUndefined();
    expect(fetched?.statusLabel).toBe("Em processamento");
  });
});
