import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  jobs,
  jobPhotos,
  supplementLineItems,
  adjusterEmails,
  jobStatusHistory,
  InsertJob,
  InsertJobPhoto,
  InsertSupplementLineItem,
  InsertAdjusterEmail,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function createJob(data: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(jobs).values(data);
  return result[0];
}

export async function getJobsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
}

export async function getJobById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateJob(id: number, userId: number, data: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(jobs).set(data).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}

export async function updateJobStatus(
  id: number,
  userId: number,
  newStatus: InsertJob["status"],
  note?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const job = await getJobById(id, userId);
  if (!job) throw new Error("Job not found");

  await db.update(jobs).set({ status: newStatus }).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));

  await db.insert(jobStatusHistory).values({
    jobId: id,
    fromStatus: job.status,
    toStatus: newStatus!,
    note,
  });
}

export async function deleteJob(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function createJobPhoto(data: InsertJobPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobPhotos).values(data);
}

export async function getPhotosByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPhotos).where(eq(jobPhotos.jobId, jobId)).orderBy(desc(jobPhotos.createdAt));
}

export async function updatePhotoAnalysis(photoId: number, aiAnalysis: string, label?: string) {
  const db = await getDb();
  if (!db) return;
  const updateData: Partial<InsertJobPhoto> = { aiAnalysis };
  if (label) updateData.label = label;
  await db.update(jobPhotos).set(updateData).where(eq(jobPhotos.id, photoId));
}

export async function deletePhoto(photoId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobPhotos).where(and(eq(jobPhotos.id, photoId), eq(jobPhotos.userId, userId)));
}

// ─── Supplement Line Items ────────────────────────────────────────────────────

export async function createSupplementLineItems(items: InsertSupplementLineItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (items.length === 0) return;
  await db.insert(supplementLineItems).values(items);
}

export async function getSupplementLineItemsByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplementLineItems).where(eq(supplementLineItems.jobId, jobId));
}

export async function updateSupplementLineItem(
  id: number,
  data: Partial<InsertSupplementLineItem>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(supplementLineItems).set(data).where(eq(supplementLineItems.id, id));
}

export async function deleteSupplementLineItemsByJob(jobId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(supplementLineItems).where(eq(supplementLineItems.jobId, jobId));
}

// ─── Adjuster Emails ──────────────────────────────────────────────────────────

export async function createAdjusterEmail(data: InsertAdjusterEmail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adjusterEmails).values(data);
}

export async function getAdjusterEmailsByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adjusterEmails).where(eq(adjusterEmails.jobId, jobId)).orderBy(desc(adjusterEmails.createdAt));
}

export async function updateAdjusterEmail(id: number, data: Partial<InsertAdjusterEmail>) {
  const db = await getDb();
  if (!db) return;
  await db.update(adjusterEmails).set(data).where(eq(adjusterEmails.id, id));
}

// ─── Status History ───────────────────────────────────────────────────────────

export async function getStatusHistoryByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobStatusHistory).where(eq(jobStatusHistory.jobId, jobId)).orderBy(desc(jobStatusHistory.createdAt));
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, submitted: 0, approved: 0, denied: 0, totalRecovered: 0, totalFees: 0 };

  const allJobs = await db.select().from(jobs).where(eq(jobs.userId, userId));

  return {
    total: allJobs.length,
    draft: allJobs.filter((j) => j.status === "draft").length,
    submitted: allJobs.filter((j) => j.status === "submitted").length,
    approved: allJobs.filter((j) => j.status === "approved" || j.status === "paid").length,
    denied: allJobs.filter((j) => j.status === "denied").length,
    totalRecovered: allJobs.reduce((sum, j) => sum + parseFloat(String(j.recoveredAmount || "0")), 0),
    totalFees: allJobs.reduce((sum, j) => sum + parseFloat(String(j.feeAmount || "0")), 0),
  };
}
