import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { affiliates, affiliateClicks, affiliateConversions } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

// Generate a unique referral code from a name
function generateReferralCode(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6)
    .padEnd(4, "X");
  const suffix = Math.floor(Math.random() * 900 + 100).toString();
  return `${base}${suffix}`;
}

export const affiliateRouter = router({
  // Public: Submit affiliate application
  submitApplication: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(256),
        email: z.string().email().max(320),
        phone: z.string().max(32).optional(),
        company: z.string().max(256).optional(),
        paypalEmail: z.string().email().max(320).optional(),
        message: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if email already registered
      const existing = await db
        .select({ id: affiliates.id, status: affiliates.status })
        .from(affiliates)
        .where(eq(affiliates.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          message: "This email is already registered as an affiliate.",
          referralCode: null,
        };
      }

      // Generate unique referral code
      let referralCode = generateReferralCode(input.name);
      let attempts = 0;
      while (attempts < 5) {
        const codeCheck = await db
          .select({ id: affiliates.id })
          .from(affiliates)
          .where(eq(affiliates.referralCode, referralCode))
          .limit(1);
        if (codeCheck.length === 0) break;
        referralCode = generateReferralCode(input.name);
        attempts++;
      }

      await db.insert(affiliates).values({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        company: input.company ?? null,
        paypalEmail: input.paypalEmail ?? null,
        referralCode,
        commissionRate: "40.00",
        status: "pending",
        totalClicks: 0,
        totalConversions: 0,
        totalEarned: "0.00",
        totalPaid: "0.00",
      });

      // Notify owner
      await notifyOwner({
        title: "New Affiliate Application",
        content: `${input.name} (${input.email}) applied to become an affiliate. Code: ${referralCode}${input.company ? ` | Company: ${input.company}` : ""}`,
      });

      return {
        success: true,
        message: "Application received! We will review and activate your account within 24 hours.",
        referralCode,
      };
    }),

  // Public: Track a referral link click
  trackClick: publicProcedure
    .input(
      z.object({
        referralCode: z.string().max(32),
        landingPage: z.string().max(512).optional(),
        userAgent: z.string().max(512).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { tracked: false };

      const affiliate = await db
        .select({ id: affiliates.id, status: affiliates.status, totalClicks: affiliates.totalClicks })
        .from(affiliates)
        .where(eq(affiliates.referralCode, input.referralCode.toUpperCase()))
        .limit(1);

      if (affiliate.length === 0 || affiliate[0].status !== "active") {
        return { tracked: false };
      }

      await db.insert(affiliateClicks).values({
        affiliateId: affiliate[0].id,
        referralCode: input.referralCode.toUpperCase(),
        landingPage: input.landingPage ?? null,
        userAgent: input.userAgent ?? null,
      });

      // Increment click counter
      const newClicks = (affiliate[0].totalClicks ?? 0) + 1;
      await db
        .update(affiliates)
        .set({ totalClicks: newClicks })
        .where(eq(affiliates.id, affiliate[0].id));

      return { tracked: true };
    }),

  // Public: Check if a referral code is valid
  validateCode: publicProcedure
    .input(z.object({ referralCode: z.string().max(32) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false, affiliateName: null };

      const affiliate = await db
        .select({ id: affiliates.id, name: affiliates.name, status: affiliates.status })
        .from(affiliates)
        .where(eq(affiliates.referralCode, input.referralCode.toUpperCase()))
        .limit(1);

      if (affiliate.length === 0 || affiliate[0].status !== "active") {
        return { valid: false, affiliateName: null };
      }

      return { valid: true, affiliateName: affiliate[0].name };
    }),

  // Protected: Get my affiliate stats (for logged-in affiliates)
  myStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const affiliate = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.email, ctx.user.email ?? ""))
      .limit(1);

    if (affiliate.length === 0) return null;

    const aff = affiliate[0];

    // Get recent conversions
    const conversions = await db
      .select()
      .from(affiliateConversions)
      .where(eq(affiliateConversions.affiliateId, aff.id))
      .orderBy(desc(affiliateConversions.createdAt))
      .limit(20);

    return {
      affiliate: aff,
      conversions,
      referralLink: `https://consconscioussupplements.com/?ref=${aff.referralCode}`,
    };
  }),

  // Admin: Get all affiliates
  adminGetAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Forbidden");
    const db = await getDb();
    if (!db) return [];

    return db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  }),

  // Admin: Approve an affiliate
  adminApprove: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(affiliates)
        .set({ status: "active" })
        .where(eq(affiliates.id, input.affiliateId));

      return { success: true };
    }),

  // Admin: Reject/suspend an affiliate
  adminReject: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(affiliates)
        .set({ status: "suspended" })
        .where(eq(affiliates.id, input.affiliateId));

      return { success: true };
    }),

  // Admin: Get all conversions
  adminGetConversions: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Forbidden");
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(affiliateConversions)
      .orderBy(desc(affiliateConversions.createdAt))
      .limit(100);
  }),
});
