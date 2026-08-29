import Stripe from "stripe";

const API_VERSION = "2026-02-25.clover";

let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Billing is optional for local shingle identify."
    );
  }
  cached = new Stripe(key, { apiVersion: API_VERSION });
  return cached;
}
