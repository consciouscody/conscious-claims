import { describe, expect, it } from "vitest";
import { createLocalUser, isLocalAuthEnabled } from "./_core/localAuth";

describe("local auth", () => {
  it("is on when Manus OAuth is not configured", () => {
    expect(isLocalAuthEnabled()).toBe(true);
  });

  it("builds a signed-in local user that skips onboarding", () => {
    const user = createLocalUser();
    expect(user.openId).toBe("local-dev");
    expect(user.role).toBe("admin");
    expect(user.onboardingCompleted).toBe(1);
    expect(user.loginMethod).toBe("local");
  });
});
