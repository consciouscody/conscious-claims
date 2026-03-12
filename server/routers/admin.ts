import { router, protectedProcedure } from "../_core/trpc";
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
