import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([
      {
        id: 1,
        userId: 1,
        propertyAddress: "123 Main St",
        claimNumber: "CLM-001",
        feeAmount: "500.00",
        feePercentage: "12.00",
        recoveredAmount: "4166.67",
        paymentStatus: "unpaid",
        stripePaymentIntentId: null,
        stripeInvoiceId: null,
        paidAt: null,
      },
    ]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onDuplicateKeyUpdate: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock Stripe
vi.mock("stripe", () => {
  const mockStripe = vi.fn().mockImplementation(() => ({
    customers: {
      create: vi.fn().mockResolvedValue({ id: "cus_test123" }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: "cs_test123",
          url: "https://checkout.stripe.com/test",
          payment_intent: "pi_test123",
        }),
      },
    },
    invoiceItems: {
      create: vi.fn().mockResolvedValue({ id: "ii_test123" }),
    },
    invoices: {
      create: vi.fn().mockResolvedValue({ id: "in_test123" }),
      finalizeInvoice: vi.fn().mockResolvedValue({
        id: "in_test123",
        hosted_invoice_url: "https://invoice.stripe.com/test",
      }),
      sendInvoice: vi.fn().mockResolvedValue({ id: "in_test123" }),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  }));
  return { default: mockStripe };
});

function createMockContext(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

describe("stripe.getPaymentStatus", () => {
  it("returns payment status for a job owned by the user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.getPaymentStatus({ jobId: 1 });

    expect(result).toMatchObject({
      paymentStatus: "unpaid",
      feeAmount: "500.00",
      recoveredAmount: "4166.67",
      feePercentage: "12.00",
    });
  });
});

describe("stripe.createCheckoutSession", () => {
  it("creates a Stripe checkout session and returns a URL", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Mock user lookup for getOrCreateStripeCustomer
    const { getDb } = await import("./db");
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 1,
          userId: 1,
          propertyAddress: "123 Main St",
          claimNumber: "CLM-001",
          feeAmount: "500.00",
          feePercentage: "12.00",
          recoveredAmount: "4166.67",
          paymentStatus: "unpaid",
          stripePaymentIntentId: null,
          stripeInvoiceId: null,
          paidAt: null,
          stripeCustomerId: "cus_existing",
        },
      ]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    });

    const result = await caller.stripe.createCheckoutSession({
      jobId: 1,
      origin: "https://example.com",
    });

    expect(result).toHaveProperty("url");
    expect(result.url).toContain("stripe.com");
  });
});

describe("stripe.sendInvoice", () => {
  it("creates and sends a Stripe invoice to the contractor", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.sendInvoice({
      jobId: 1,
      contractorEmail: "contractor@roofing.com",
      contractorName: "Bob Builder",
    });

    expect(result).toHaveProperty("invoiceId");
    expect(result).toHaveProperty("invoiceUrl");
    expect(result.invoiceId).toBe("in_test123");
  });
});
