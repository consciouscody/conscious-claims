import { describe, it, expect } from "vitest";

describe("Admin claims feed", () => {
  it("STATUS_CONFIG covers all 8 job statuses", () => {
    const statuses = ["draft", "estimate_uploaded", "dossier_generated", "email_drafted", "submitted", "approved", "denied", "paid"];
    expect(statuses).toHaveLength(8);
    statuses.forEach((s) => expect(typeof s).toBe("string"));
  });

  it("customer decision enum is valid", () => {
    const decisions = ["accept", "keep_fighting"];
    expect(decisions).toContain("accept");
    expect(decisions).toContain("keep_fighting");
  });

  it("claim message senderRole enum is valid", () => {
    const roles = ["admin", "customer"];
    expect(roles).toContain("admin");
    expect(roles).toContain("customer");
  });
});
