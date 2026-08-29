import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";
import { sdk } from "./sdk";

export function isLocalAuthEnabled(): boolean {
  if (process.env.LOCAL_DEV_AUTH === "0") return false;
  if (process.env.LOCAL_DEV_AUTH === "1") return true;
  return !ENV.oAuthServerUrl;
}

export function createLocalUser(): User {
  const now = new Date();
  return {
    id: 1,
    openId: "local-dev",
    name: "Local User",
    email: "local@localhost",
    loginMethod: "local",
    role: "admin",
    companyName: "Local",
    phone: null,
    stripeCustomerId: null,
    onboardingCompleted: 1,
    adminNotes: null,
    referredBy: null,
    referralSource: null,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export async function resolveRequestUser(req: Request): Promise<User | null> {
  if (isLocalAuthEnabled()) {
    return createLocalUser();
  }
  try {
    return await sdk.authenticateRequest(req);
  } catch {
    return null;
  }
}
