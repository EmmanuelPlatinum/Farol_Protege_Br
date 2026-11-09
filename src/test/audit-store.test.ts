import { beforeEach, describe, expect, it } from "vitest";
import { appendAuditEvents } from "@/lib/audit-store";

describe("LGPD audit event storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("appends case access records with UTC time and explicitly simulated identifiers", async () => {
    const records = await appendAuditEvents([
      {
        caseId: "1042",
        action: "case_viewed_unmasked",
        summary: "Acesso de demonstração sem máscara.",
        actorProfile: "counselor",
      },
    ]);
    const event = records[0];
    expect(event).toBeDefined();
    if (!event) throw new Error("Expected an audit event to be recorded.");

    expect(event.caseId).toBe("1042");
    expect(event.timestampUtc).toMatch(/Z$/);
    expect(event.actor).toContain("demonstrativo");
    expect(event.counselorRegistration).toContain("não configurada");
    expect(event.simulatedIp).toContain("simulado");
    expect(event.simulatedBrowser).toContain("demonstrativo");
    expect(JSON.parse(localStorage.getItem("farol_lgpd_audit_events") ?? "[]")).toEqual([event]);
  });
});
