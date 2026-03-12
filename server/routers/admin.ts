import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users, jobs } from "../../drizzle/schema";
import { eq, desc, count, sum, sql } from "drizzle-orm";

// Middleware: only admin users can call these procedures
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // List all users with their job counts and fee settings
  listUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        companyName: users.companyName,
        phone: users.phone,
        adminNotes: users.adminNotes,
        onboardingCompleted: users.onboardingCompleted,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Get job counts and fee info per user
    const jobStats = await db
      .select({
        userId: jobs.userId,
        jobCount: count(jobs.id),
        totalRecovered: sum(jobs.recoveredAmount),
        feePercentage: sql<string>`MAX(${jobs.feePercentage})`,
      })
      .from(jobs)
      .groupBy(jobs.userId);

    const statsMap = new Map(jobStats.map((s) => [s.userId, s]));

    return allUsers.map((u) => {
      const stats = statsMap.get(u.id);
      return {
        ...u,
        jobCount: Number(stats?.jobCount || 0),
        totalRecovered: stats?.totalRecovered ? parseFloat(stats.totalRecovered) : 0,
        currentFeePercentage: stats?.feePercentage ? parseFloat(stats.feePercentage) : null,
      };
    });
  }),

  // Get a single user's details
  getUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "NOT_FOUND" });

      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user[0]) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const userJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.userId, input.userId))
        .orderBy(desc(jobs.createdAt));

      return { user: user[0], jobs: userJobs };
    }),

  // Set fee percentage for ALL of a user's jobs (existing + future default)
  setUserFee: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        feePercentage: z.number().min(1).max(30),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Update all existing jobs for this user
      await db
        .update(jobs)
        .set({ feePercentage: input.feePercentage.toFixed(2) })
        .where(eq(jobs.userId, input.userId));

      return { success: true };
    }),

  // Set fee percentage for a specific job only
  setJobFee: adminProcedure
    .input(
      z.object({
        jobId: z.number(),
        feePercentage: z.number().min(1).max(30),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(jobs)
        .set({ feePercentage: input.feePercentage.toFixed(2) })
        .where(eq(jobs.id, input.jobId));

      return { success: true };
    }),

  // Promote or demote a user's role
  setUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change your own role" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  // Set private admin notes on a user
  setAdminNotes: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        notes: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(users)
        .set({ adminNotes: input.notes || null })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  // Generate a personalized cold call script for a contractor
  generateCallScript: adminProcedure
    .input(
      z.object({
        companyName: z.string().min(1),
        ownerName: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const context = [
        `Company: ${input.companyName}`,
        input.ownerName ? `Owner: ${input.ownerName}` : null,
        input.city && input.state ? `Location: ${input.city}, ${input.state}` : input.state ? `State: ${input.state}` : null,
        input.notes ? `Notes: ${input.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const result = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are Cody, founder of Conscious Supplements (conscioussupplements.com). You help roofing contractors recover money they're owed on insurance claims through AI-powered supplement generation. You're confident, direct, and speak like a contractor — not a salesperson. Your tone is Matthew McConaughey meets roofing expert: calm, unhurried, certain.

Generate a cold call script for reaching out to a roofing contractor. Include:
1. Opening (10 seconds — pattern interrupt, not a pitch)
2. The hook (1 sentence — the problem they have that costs them money)
3. The bridge (how SupplementAI solves it)
4. The ask (book a 15-minute demo, not a sale)
5. Objection handlers for: "Not interested", "I already have someone who does this", "How much does it cost?"
6. A voicemail script (30 seconds)

Keep the opening under 3 sentences. No corporate speak. No "I was wondering if...". Start with a statement, not a question.`,
          },
          {
            role: "user",
            content: `Generate a cold call script for this contractor:\n${context}`,
          },
        ],
      });

      const script = result.choices?.[0]?.message?.content || "Could not generate script. Try again.";
      return { script };
    }),

  // Send welcome email to a newly onboarded user
  sendWelcomeEmail: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        feePercentage: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const name = user.name || user.companyName || "there";
      const loginUrl = "https://consconscioussupplements.com";

      // Notify owner that welcome email was triggered
      await notifyOwner({
        title: `Welcome email sent to ${name}`,
        content: `User: ${user.email}\nCompany: ${user.companyName || "—"}\nFee rate: ${input.feePercentage}%\nLogin: ${loginUrl}`,
      });

      return {
        success: true,
        emailPreview: {
          to: user.email,
          subject: `You're in — here's how to get started with SupplementAI`,
          body: `Hey ${name},\n\nWelcome to SupplementAI. Your account is active and your rate is locked in at ${input.feePercentage}%.\n\nHere's how to get your first supplement done in under 5 minutes:\n\n1. Log in at ${loginUrl}\n2. Click "New Job" and enter the property address\n3. Upload the Xactimate PDF the insurance company sent\n4. Upload your roof photos\n5. Hit "Generate Supplement" — the AI finds every missing line item\n6. Review and send the adjuster email directly from the app\n\nThat's it. The average contractor recovers $4,200–$12,000 per job they were leaving on the table.\n\nAny questions, reply to this email or text me directly.\n\n— Cody\nFounder, Conscious Supplements\n(conscioussupplements.com)`,
        },
      };
    }),

  // Get platform-wide stats
  platformStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    const [userCount] = await db.select({ count: count() }).from(users);
    const [jobCount] = await db.select({ count: count() }).from(jobs);
    const [revenue] = await db
      .select({ total: sum(jobs.recoveredAmount) })
      .from(jobs)
      .where(eq(jobs.status, "paid"));

    return {
      totalUsers: Number(userCount.count),
      totalJobs: Number(jobCount.count),
      totalRecovered: revenue.total ? parseFloat(revenue.total) : 0,
    };
  }),
});
