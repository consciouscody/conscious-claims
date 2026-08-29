import express from "express";
import type Stripe from "stripe";
import { getDb } from "./db";
import { jobs } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getStripe, isStripeConfigured } from "./stripeClient";

export const stripeWebhookRouter = express.Router();

// MUST use raw body for Stripe signature verification
stripeWebhookRouter.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!isStripeConfigured()) {
      return res.status(503).send("Stripe is not configured");
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (!webhookSecret || !sig) {
        throw new Error("Missing webhook secret or signature");
      }
      event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[Webhook] Signature verification failed: ${message}`);
      return res.status(400).send(`Webhook Error: ${message}`);
    }

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Webhook] Received event: ${event.type} | ID: ${event.id}`);

    const db = await getDb();

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const jobId = session.metadata?.job_id ? parseInt(session.metadata.job_id) : null;
          if (jobId && db) {
            await db
              .update(jobs)
              .set({
                paymentStatus: "paid",
                status: "paid",
                paidAt: new Date(),
                stripePaymentIntentId: session.payment_intent as string,
              })
              .where(eq(jobs.id, jobId));
            console.log(`[Webhook] Job ${jobId} marked as paid via checkout`);
          }
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.id && db) {
            await db
              .update(jobs)
              .set({
                paymentStatus: "paid",
                status: "paid",
                paidAt: new Date(),
              })
              .where(eq(jobs.stripeInvoiceId, invoice.id));
            console.log(`[Webhook] Job with invoice ${invoice.id} marked as paid`);
          }
          break;
        }

        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          if (paymentIntent.id && db) {
            await db
              .update(jobs)
              .set({
                paymentStatus: "paid",
                status: "paid",
                paidAt: new Date(),
              })
              .where(eq(jobs.stripePaymentIntentId, paymentIntent.id));
            console.log(`[Webhook] Job with payment intent ${paymentIntent.id} marked as paid`);
          }
          break;
        }

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error("[Webhook] Error processing event:", err);
    }

    return res.json({ received: true });
  }
);
