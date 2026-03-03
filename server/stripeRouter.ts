import Stripe from "stripe";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
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
