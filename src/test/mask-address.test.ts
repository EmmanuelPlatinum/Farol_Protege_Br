import { describe, expect, it } from "vitest";
import { maskAddress } from "@/lib/privacy-store";

describe("maskAddress", () => {
  it("hides street details in privacy mode", () => {
    expect(maskAddress("Rua das Flores, 120 - Jardim América")).toBe("Endereço sigiloso · Jardim América");
  });
  it("keeps the full address when privacy mode is off", () => {
    expect(maskAddress("Rua das Flores, 120", false)).toBe("Rua das Flores, 120");
  });
});
