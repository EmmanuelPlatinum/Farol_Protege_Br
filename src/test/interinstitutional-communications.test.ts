import { describe, expect, it } from "vitest";
import QRCode from "qrcode";
import { createOfficialCommunicationDraft } from "@/lib/cases-store";

describe("interinstitutional demo records", () => {
  it("creates a clearly marked demo protocol and validation key", () => {
    const draft = createOfficialCommunicationDraft(
      "Ofício Enviado ao MP",
      "prosecutor",
      "2026-11-09",
    );

    expect(draft.protocol).toMatch(/^DEMO-ECA-2026\/[A-F0-9]{8}$/);
    expect(draft.verificationKey).toMatch(/^FP-DEMO-[A-F0-9]{20}$/);
    expect(draft.date).toBe("2026-11-09");
    expect(draft.actorProfile).toBe("prosecutor");
  });

  it("encodes only the demo verification key in a valid QR image", async () => {
    const draft = createOfficialCommunicationDraft(
      "Audiência Concentrada Agendada",
      "juvenile_court",
      "2026-11-09",
    );
    const image = await QRCode.toDataURL(`FAROL-PROTEGE-DEMO|${draft.verificationKey}`);

    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image).not.toContain("1042");
    expect(image).not.toContain("criança");
  });
});
