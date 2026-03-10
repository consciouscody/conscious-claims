import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// Mock the database module so tests run without a real DB
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("affiliate router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitApplication", () => {
    it("returns error when DB is unavailable", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.affiliate.submitApplication({
          name: "John Doe",
          email: "john@example.com",
        })
      ).rejects.toThrow("Database unavailable");
    });
  });

  describe("trackClick", () => {
    it("returns tracked: false when DB is unavailable", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.affiliate.trackClick({
        referralCode: "TEST123",
        landingPage: "/",
      });

      expect(result).toEqual({ tracked: false });
    });
  });

  describe("validateCode", () => {
    it("returns valid: false when DB is unavailable", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.affiliate.validateCode({
        referralCode: "TEST123",
      });

      expect(result).toEqual({ valid: false, affiliateName: null });
    });
  });

  describe("myStats", () => {
    it("returns null when DB is unavailable", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.affiliate.myStats();
      expect(result).toBeNull();
    });
  });

  describe("adminGetAll", () => {
    it("throws Forbidden for non-admin users", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.affiliate.adminGetAll()).rejects.toThrow("Forbidden");
    });

    it("returns empty array for admin when DB is unavailable", async () => {
      const ctx = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.affiliate.adminGetAll();
      expect(result).toEqual([]);
    });
  });

  describe("adminApprove", () => {
    it("throws Forbidden for non-admin users", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.affiliate.adminApprove({ affiliateId: 1 })
      ).rejects.toThrow("Forbidden");
    });

    it("throws error for admin when DB is unavailable", async () => {
      const ctx = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.affiliate.adminApprove({ affiliateId: 1 })
      ).rejects.toThrow("Database unavailable");
    });
  });

  describe("adminGetConversions", () => {
    it("throws Forbidden for non-admin users", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.affiliate.adminGetConversions()).rejects.toThrow("Forbidden");
    });

    it("returns empty array for admin when DB is unavailable", async () => {
      const ctx = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.affiliate.adminGetConversions();
      expect(result).toEqual([]);
    });
  });
});
