import Stripe from "stripe";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { jobs, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

// Helper: get or create Stripe customer for a user
async function getOrCreateStripeCustomer(userId: number, email: string | null, name: string | null) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: email || undefined,
    name: name || undefined,
    metadata: { userId: userId.toString() },
  });

  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));
  return customer.id;
}

export const stripeRouter = router({
  // Create a Stripe Checkout Session for the contractor to pay your fee
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
        origin: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [job] = await db.select().from(jobs).where(eq(jobs.id, input.jobId)).limit(1);
      if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      if (job.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (!job.feeAmount || Number(job.feeAmount) <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fee amount set. Please enter the recovered amount first." });
      }

      const feeInCents = Math.round(Number(job.feeAmount) * 100);
      if (feeInCents < 50) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Fee amount must be at least $0.50 to process payment." });
      }

      const customerId = await getOrCreateStripeCustomer(ctx.user.id, ctx.user.email, ctx.user.name);

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Supplement Recovery Fee`,
                description: `Job: ${job.propertyAddress} | Claim: ${job.claimNumber || "N/A"} | ${Number(job.feePercentage)}% of $${Number(job.recoveredAmount || 0).toFixed(2)} recovered`,
              },
              unit_amount: feeInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        customer_email: !customerId ? (ctx.user.email || undefined) : undefined,
        metadata: {
          user_id: ctx.user.id.toString(),
          job_id: input.jobId.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
        },
        success_url: `${input.origin}/dashboard?payment=success&jobId=${input.jobId}`,
        cancel_url: `${input.origin}/jobs/${input.jobId}?payment=cancelled`,
      });

      // Save payment intent ID
      if (session.payment_intent) {
        await db
          .update(jobs)
          .set({ stripePaymentIntentId: session.payment_intent as string })
          .where(eq(jobs.id, input.jobId));
      }

      return { url: session.url };
    }),

  // Send a Stripe invoice to the contractor via email
  sendInvoice: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
        contractorEmail: z.string().email(),
        contractorName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [job] = await db.select().from(jobs).where(eq(jobs.id, input.jobId)).limit(1);
      if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      if (job.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (!job.feeAmount || Number(job.feeAmount) <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fee amount set. Please enter the recovered amount first." });
      }

      const feeInCents = Math.round(Number(job.feeAmount) * 100);
      if (feeInCents < 50) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Fee amount must be at least $0.50 to send invoice." });
      }

      // Create or find a Stripe customer for the contractor
      let contractorCustomer: Stripe.Customer;
      const existingCustomers = await stripe.customers.list({ email: input.contractorEmail, limit: 1 });
      if (existingCustomers.data.length > 0) {
        contractorCustomer = existingCustomers.data[0];
      } else {
        contractorCustomer = await stripe.customers.create({
          email: input.contractorEmail,
          name: input.contractorName || undefined,
          metadata: { type: "contractor", job_id: input.jobId.toString() },
        });
      }

      // Create invoice item
      await stripe.invoiceItems.create({
        customer: contractorCustomer.id,
        amount: feeInCents,
        currency: "usd",
        description: `Supplement Recovery Fee — ${job.propertyAddress} | Claim: ${job.claimNumber || "N/A"} | ${Number(job.feePercentage)}% of $${Number(job.recoveredAmount || 0).toFixed(2)} recovered`,
      });

      // Create and finalize the invoice
      const invoice = await stripe.invoices.create({
        customer: contractorCustomer.id,
        collection_method: "send_invoice",
        days_until_due: 7,
        metadata: {
          job_id: input.jobId.toString(),
          user_id: ctx.user.id.toString(),
        },
      });

      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.sendInvoice(finalizedInvoice.id);

      // Save invoice ID and update payment status
      await db
        .update(jobs)
        .set({
          stripeInvoiceId: finalizedInvoice.id,
          paymentStatus: "invoice_sent",
        })
        .where(eq(jobs.id, input.jobId));

      return { invoiceId: finalizedInvoice.id, invoiceUrl: finalizedInvoice.hosted_invoice_url };
    }),

  // Create a subscription checkout session for SupplementAI plans
  createSubscriptionCheckout: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        origin: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customerId = await getOrCreateStripeCustomer(ctx.user.id, ctx.user.email, ctx.user.name);

      // Map plan IDs to prices (using Stripe price_data for flexibility)
      const PLAN_PRICES: Record<string, { name: string; amount: number; interval: "month" | "year" }> = {
        starter_monthly: { name: "SupplementAI Starter", amount: 9700, interval: "month" },
        pro_monthly: { name: "SupplementAI Pro", amount: 19700, interval: "month" },
        agency_monthly: { name: "SupplementAI Agency", amount: 39700, interval: "month" },
        starter_annual: { name: "SupplementAI Starter (Annual)", amount: 94800, interval: "year" },
        pro_annual: { name: "SupplementAI Pro (Annual)", amount: 190800, interval: "year" },
        agency_annual: { name: "SupplementAI Agency (Annual)", amount: 382800, interval: "year" },
      };

      const plan = PLAN_PRICES[input.priceId];
      if (!plan) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid plan selected" });

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: plan.name },
              unit_amount: plan.amount,
              recurring: { interval: plan.interval },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          plan_id: input.priceId,
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
        },
        success_url: `${input.origin}/dashboard?subscription=success`,
        cancel_url: `${input.origin}/pricing?subscription=cancelled`,
      });

      return { url: session.url };
    }),

  // Create a $27 checkout session for Storm the Door e-book (no login required)
  createEbookCheckout: publicProcedure
    .input(
      z.object({
        origin: z.string(),
        ebookId: z.enum(["storm_the_door"]),
        referralCode: z.string().max(32).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const EBOOKS: Record<string, { name: string; description: string; amount: number; pdfUrl: string }> = {
        storm_the_door: {
          name: "Storm the Door: A Roofing Contractor's Psychological Sales Playbook",
          description: "20-page field-tested sales playbook — mirroring, frame control, 10 objection rebuttals, and the post-inspection close. My Proven Methods by Conscious Capital.",
          amount: 2700, // $27.00
          pdfUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/StormTheDoor_SalesPlaybook_9c5c4059.pdf",
        },
      };

      const ebook = EBOOKS[input.ebookId];
      if (!ebook) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid ebook" });

      // Support both logged-in users and guests — Stripe collects email at checkout
      let customerOptions: { customer?: string } = {};
      if (ctx.user) {
        const customerId = await getOrCreateStripeCustomer(ctx.user.id, ctx.user.email, ctx.user.name);
        customerOptions = { customer: customerId };
      }

      const session = await stripe.checkout.sessions.create({
        ...customerOptions,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: ebook.name,
                description: ebook.description,
              },
              unit_amount: ebook.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        allow_promotion_codes: true,
        client_reference_id: ctx.user ? ctx.user.id.toString() : "guest",
        metadata: {
          user_id: ctx.user ? ctx.user.id.toString() : "guest",
          ebook_id: input.ebookId,
          pdf_url: ebook.pdfUrl,
          customer_email: ctx.user?.email || "",
          customer_name: ctx.user?.name || "",
          referral_code: input.referralCode || "",
        },
        success_url: `${input.origin}/storm-the-door/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/storm-the-door`,
      });

      return { url: session.url };
    }),

  // Get ebook purchase status (check if user has bought storm_the_door)
  getEbookAccess: protectedProcedure
    .input(z.object({ ebookId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check Stripe for completed payments with this ebook_id in metadata
      try {
        const sessions = await stripe.checkout.sessions.list({
          limit: 100,
        });
        const purchased = sessions.data.some(
          (s) =>
            s.payment_status === "paid" &&
            s.metadata?.ebook_id === input.ebookId &&
            s.metadata?.user_id === ctx.user.id.toString()
        );
        return { purchased };
      } catch {
        return { purchased: false };
      }
    }),

  // Get PDF download URL after successful ebook purchase (no login required — validated by Stripe session)
  getEbookDownload: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      if (session.payment_status !== "paid") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Payment not completed" });
      }
      const pdfUrl = session.metadata?.pdf_url;
      if (!pdfUrl) throw new TRPCError({ code: "NOT_FOUND", message: "PDF not found" });
      return { pdfUrl, ebookId: session.metadata?.ebook_id };
    }),

  // Get payment status for a job
  getPaymentStatus: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [job] = await db.select().from(jobs).where(eq(jobs.id, input.jobId)).limit(1);
      if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      if (job.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      return {
        paymentStatus: job.paymentStatus,
        stripePaymentIntentId: job.stripePaymentIntentId,
        stripeInvoiceId: job.stripeInvoiceId,
        paidAt: job.paidAt,
        feeAmount: job.feeAmount,
        recoveredAmount: job.recoveredAmount,
        feePercentage: job.feePercentage,
      };
    }),
});
