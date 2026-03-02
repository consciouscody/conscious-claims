import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ─────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  createJob: vi.fn().mockResolvedValue({ id: 1 }),
  getJobsByUser: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      propertyAddress: "123 Main St, Atlanta, GA",
      homeownerName: "John Smith",
      claimNumber: "CLM-001",
      insuranceCarrier: "State Farm",
      status: "draft",
      feePercentage: "12.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getJobById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    propertyAddress: "123 Main St, Atlanta, GA",
    status: "draft",
    feePercentage: "12.00",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateJob: vi.fn().mockResolvedValue(undefined),
  updateJobStatus: vi.fn().mockResolvedValue(undefined),
  deleteJob: vi.fn().mockResolvedValue(undefined),
  createJobPhoto: vi.fn().mockResolvedValue({ id: 1 }),
  getPhotosByJob: vi.fn().mockResolvedValue([]),
  updatePhotoAnalysis: vi.fn().mockResolvedValue(undefined),
  deletePhoto: vi.fn().mockResolvedValue(undefined),
  createSupplementLineItems: vi.fn().mockResolvedValue(undefined),
  getSupplementLineItemsByJob: vi.fn().mockResolvedValue([
    {
      id: 1,
      jobId: 1,
      xactimateCode: "RFG STRT",
      description: "Starter Shingles",
      unit: "SQ",
      unitPrice: "45.00",
      totalPrice: "135.00",
      quantity: "3",
      isIncluded: "yes",
      source: "auto_detected",
    },
    {
      id: 2,
      jobId: 1,
      xactimateCode: "RFG DRIP",
      description: "Drip Edge",
      unit: "LF",
      unitPrice: "2.50",
      totalPrice: "375.00",
      quantity: "150",
      isIncluded: "yes",
      source: "auto_detected",
    },
  ]),
  updateSupplementLineItem: vi.fn().mockResolvedValue(undefined),
  deleteSupplementLineItemsByJob: vi.fn().mockResolvedValue(undefined),
  createAdjusterEmail: vi.fn().mockResolvedValue({ id: 1 }),
  getAdjusterEmailsByJob: vi.fn().mockResolvedValue([]),
  updateAdjusterEmail: vi.fn().mockResolvedValue(undefined),
  getStatusHistoryByJob: vi.fn().mockResolvedValue([]),
  getDashboardStats: vi.fn().mockResolvedValue({
    total: 5,
    submitted: 2,
    approved: 1,
    denied: 0,
    paid: 1,
    totalRecovered: "8500.00",
    totalFees: "1020.00",
  }),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content:
            "SUBJECT: Claim #CLM-001 – Supplement Request – 123 Main St\n---\nDear Adjuster,\n\nPlease review the following supplement items...",
        },
      },
    ],
  }),
}));

// ─── Test context factory ─────────────────────────────────────────────────────
function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-001",
      email: "cody@supplementai.com",
      name: "Cody McCain",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
describe("jobs router", () => {
  it("lists jobs for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.jobs.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("propertyAddress");
  });

  it("creates a new job", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.jobs.create({
      propertyAddress: "456 Oak Ave, Marietta, GA 30060",
      homeownerName: "Jane Doe",
      claimNumber: "CLM-002",
      insuranceCarrier: "Allstate",
      feePercentage: "12",
    });
    expect(result).toEqual({ success: true });
  });

  it("gets a job by id", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.jobs.get({ id: 1 });
    expect(result).not.toBeNull();
    expect(result?.propertyAddress).toBe("123 Main St, Atlanta, GA");
  });

  it("updates job status", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.jobs.updateStatus({ id: 1, status: "submitted" });
    expect(result).toEqual({ success: true });
  });

  it("returns dashboard stats", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const stats = await caller.jobs.stats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("approved");
    expect(stats).toHaveProperty("totalFees");
  });
});

// ─── Supplement Items ─────────────────────────────────────────────────────────
describe("supplement router", () => {
  it("returns supplement items for a job", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const items = await caller.supplement.getByJob({ jobId: 1 });
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBe(2);
    expect(items[0].xactimateCode).toBe("RFG STRT");
  });

  it("calculates total for included items", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const totals = await caller.supplement.calculateTotal({ jobId: 1 });
    expect(totals.total).toBe("510.00"); // 135 + 375
    expect(totals.itemCount).toBe(2);
  });

  it("returns the knowledge base", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const kb = await caller.supplement.knowledgeBase();
    expect(Array.isArray(kb)).toBe(true);
    expect(kb.length).toBeGreaterThan(0);
    expect(kb[0]).toHaveProperty("xactimateCode");
    expect(kb[0]).toHaveProperty("description");
  });

  it("updates a supplement item", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.supplement.update({
      id: 1,
      quantity: "5",
      unitPrice: "45.00",
      totalPrice: "225.00",
      isIncluded: "yes",
    });
    expect(result).toEqual({ success: true });
  });
});

// ─── Payment Calculator ───────────────────────────────────────────────────────
describe("calculator router", () => {
  it("calculates fee at 12%", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.calculator.calculate({
      supplementAmount: 5000,
      feePercentage: 12,
    });
    expect(result.feeAmount).toBe(600);
    expect(result.contractorNet).toBe(4400);
    expect(result.supplementAmount).toBe(5000);
  });

  it("calculates fee at 15%", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.calculator.calculate({
      supplementAmount: 10000,
      feePercentage: 15,
    });
    expect(result.feeAmount).toBe(1500);
    expect(result.contractorNet).toBe(8500);
  });

  it("handles fractional amounts correctly", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.calculator.calculate({
      supplementAmount: 3750,
      feePercentage: 10,
    });
    expect(result.feeAmount).toBe(375);
    expect(result.contractorNet).toBe(3375);
  });
});

// ─── Email Generation ─────────────────────────────────────────────────────────
describe("emails router", () => {
  it("generates an adjuster email", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.emails.generate({
      jobId: 1,
      claimNumber: "CLM-001",
      propertyAddress: "123 Main St, Atlanta, GA",
      adjusterName: "Bob Johnson",
      insuranceCarrier: "State Farm",
      supplementItems: [
        {
          xactimateCode: "RFG STRT",
          description: "Starter Shingles",
          justification: "Required per manufacturer installation requirements",
          codeReference: "IRC R905.2.8.2",
          quantity: "3",
          unit: "SQ",
          totalPrice: "135.00",
        },
      ],
      emailType: "supplement_request",
    });
    expect(result).toHaveProperty("subject");
    expect(result).toHaveProperty("body");
    expect(result.subject).toContain("CLM-001");
  });

  it("lists emails for a job", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const emails = await caller.emails.list({ jobId: 1 });
    expect(Array.isArray(emails)).toBe(true);
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe("auth router", () => {
  it("returns current user from me query", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const user = await caller.auth.me();
    expect(user?.name).toBe("Cody McCain");
    expect(user?.email).toBe("cody@supplementai.com");
  });

  it("logout clears session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
