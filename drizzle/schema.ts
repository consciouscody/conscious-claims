import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  companyName: text("companyName"),
  phone: varchar("phone", { length: 32 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Jobs table - one job per insurance claim / property
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Property & claim info
  propertyAddress: text("propertyAddress").notNull(),
  homeownerName: varchar("homeownerName", { length: 256 }),
  claimNumber: varchar("claimNumber", { length: 128 }),
  insuranceCarrier: varchar("insuranceCarrier", { length: 256 }),
  adjusterName: varchar("adjusterName", { length: 256 }),
  adjusterEmail: varchar("adjusterEmail", { length: 320 }),
  adjusterPhone: varchar("adjusterPhone", { length: 32 }),
  dateOfLoss: timestamp("dateOfLoss"),
  // Estimate data
  originalEstimateUrl: text("originalEstimateUrl"),
  originalEstimateKey: text("originalEstimateKey"),
  originalEstimateAmount: decimal("originalEstimateAmount", { precision: 12, scale: 2 }),
  parsedLineItems: json("parsedLineItems"), // Array of {code, description, quantity, unit, amount}
  // Supplement data
  supplementAmount: decimal("supplementAmount", { precision: 12, scale: 2 }),
  recoveredAmount: decimal("recoveredAmount", { precision: 12, scale: 2 }),
  feePercentage: decimal("feePercentage", { precision: 5, scale: 2 }).default("12.00"),
  feeAmount: decimal("feeAmount", { precision: 12, scale: 2 }),
  // Status
  status: mysqlEnum("status", [
    "draft",
    "estimate_uploaded",
    "supplement_generated",
    "email_drafted",
    "submitted",
    "approved",
    "denied",
    "paid",
  ])
    .default("draft")
    .notNull(),
  notes: text("notes"),
  // Stripe payment tracking
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 128 }),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "invoice_sent", "paid"]).default("unpaid"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Photos uploaded for a job
export const jobPhotos = mysqlTable("job_photos", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  userId: int("userId").notNull(),
  url: text("url").notNull(),
  fileKey: text("fileKey").notNull(),
  filename: varchar("filename", { length: 512 }),
  label: text("label"), // e.g. "Front slope - hail damage"
  aiAnalysis: text("aiAnalysis"), // AI-detected supplement evidence
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobPhoto = typeof jobPhotos.$inferSelect;
export type InsertJobPhoto = typeof jobPhotos.$inferInsert;

// Supplement line items generated for a job
export const supplementLineItems = mysqlTable("supplement_line_items", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  // Xactimate info
  xactimateCode: varchar("xactimateCode", { length: 64 }).notNull(),
  description: text("description").notNull(),
  unit: varchar("unit", { length: 16 }).notNull(), // LF, SQ, EA, SF
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }),
  // Justification
  justification: text("justification"), // Why this item should be included
  codeReference: text("codeReference"), // e.g. "IRC R905.2.8.5"
  manufacturerReference: text("manufacturerReference"),
  photoEvidence: text("photoEvidence"), // Photo IDs or labels
  // Source
  source: mysqlEnum("source", ["auto_detected", "ai_photo", "manual"]).default("auto_detected"),
  isIncluded: mysqlEnum("isIncluded", ["yes", "no"]).default("yes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupplementLineItem = typeof supplementLineItems.$inferSelect;
export type InsertSupplementLineItem = typeof supplementLineItems.$inferInsert;

// Adjuster email drafts
export const adjusterEmails = mysqlTable("adjuster_emails", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  subject: text("subject"),
  body: text("body"),
  emailType: mysqlEnum("emailType", ["supplement_request", "reinspection_request", "follow_up"]).default(
    "supplement_request"
  ),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdjusterEmail = typeof adjusterEmails.$inferSelect;
export type InsertAdjusterEmail = typeof adjusterEmails.$inferInsert;

// Status history log
export const jobStatusHistory = mysqlTable("job_status_history", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  fromStatus: varchar("fromStatus", { length: 64 }),
  toStatus: varchar("toStatus", { length: 64 }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobStatusHistory = typeof jobStatusHistory.$inferSelect;

// E-book lead capture — free guide signups
export const ebookLeads = mysqlTable("ebook_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 256 }),
  phone: varchar("phone", { length: 32 }),
  source: varchar("source", { length: 128 }).default("free-guide"), // which page/campaign
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EbookLead = typeof ebookLeads.$inferSelect;
export type InsertEbookLead = typeof ebookLeads.$inferInsert;
