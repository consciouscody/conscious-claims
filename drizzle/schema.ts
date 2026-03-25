import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  tinyint,
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
  onboardingCompleted: tinyint("onboardingCompleted").default(0).notNull(),
  adminNotes: text("adminNotes"),
  referredBy: varchar("referredBy", { length: 256 }), // name/email of who referred this contractor
  referralSource: varchar("referralSource", { length: 128 }), // e.g. "cold_call", "linkedin", "friend_referral"
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
  // Trade type - determines which AI supplement specialist is used
  tradeType: mysqlEnum("tradeType", ["roofing", "water_restoration"]).default("roofing").notNull(),
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

// CRM Integrations — one row per connected CRM per user
export const crmIntegrations = mysqlTable("crm_integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  crmType: mysqlEnum("crmType", ["jobnimbus", "acculynx", "roofr", "contractors_cloud", "hubspot", "zapier"]).notNull(),
  apiKey: text("apiKey"), // encrypted API key for native integrations
  webhookSecret: varchar("webhookSecret", { length: 64 }), // unique secret for webhook URL
  displayName: varchar("displayName", { length: 128 }), // user-facing label e.g. "My JobNimbus"
  status: mysqlEnum("status", ["active", "error", "disconnected"]).default("active").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  lastSyncStatus: text("lastSyncStatus"), // last sync result message
  jobsSynced: int("jobsSynced").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmIntegration = typeof crmIntegrations.$inferSelect;
export type InsertCrmIntegration = typeof crmIntegrations.$inferInsert;

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

// ─── Affiliate Program ────────────────────────────────────────────────────────

// Affiliates — people who sign up to promote Conscious Capital products
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // linked user account (nullable — can sign up before creating account)
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 256 }),
  referralCode: varchar("referralCode", { length: 32 }).notNull().unique(), // e.g. "CODY40"
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("40.00"), // percentage
  status: mysqlEnum("status", ["pending", "active", "suspended"]).default("pending").notNull(),
  paypalEmail: varchar("paypalEmail", { length: 320 }), // payout destination
  totalClicks: int("totalClicks").default(0).notNull(),
  totalConversions: int("totalConversions").default(0).notNull(),
  totalEarned: decimal("totalEarned", { precision: 12, scale: 2 }).default("0.00").notNull(),
  totalPaid: decimal("totalPaid", { precision: 12, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

// Affiliate clicks — every time someone clicks a referral link
export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  referralCode: varchar("referralCode", { length: 32 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  landingPage: varchar("landingPage", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateClick = typeof affiliateClicks.$inferSelect;

// Affiliate conversions — every sale attributed to an affiliate
export const affiliateConversions = mysqlTable("affiliate_conversions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  referralCode: varchar("referralCode", { length: 32 }).notNull(),
  // What was sold
  productType: mysqlEnum("productType", ["storm_the_door_book", "supplement_pro_monthly", "supplement_pro_annual"]).notNull(),
  productName: varchar("productName", { length: 256 }).notNull(),
  saleAmount: decimal("saleAmount", { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }).notNull(),
  // Stripe reference
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  stripeSessionId: varchar("stripeSessionId", { length: 128 }),
  // Buyer info (anonymized)
  buyerEmail: varchar("buyerEmail", { length: 320 }),
  // Payout status
  payoutStatus: mysqlEnum("payoutStatus", ["pending", "approved", "paid", "refunded"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateConversion = typeof affiliateConversions.$inferSelect;
export type InsertAffiliateConversion = typeof affiliateConversions.$inferInsert;

// LinkedIn Posts — AI-generated McConaughey-style posts
export const linkedinPosts = mysqlTable("linkedin_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 512 }).notNull(),
  tone: varchar("tone", { length: 64 }).default("mcconaughey").notNull(),
  generatedPosts: text("generatedPosts").notNull(), // JSON array of 3 posts
  savedPost: text("savedPost"), // the one they chose to use
  used: tinyint("used").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LinkedinPost = typeof linkedinPosts.$inferSelect;
export type InsertLinkedinPost = typeof linkedinPosts.$inferInsert;

// Waitlist signups — for upcoming Conscious Capital features
export const waitlistSignups = mysqlTable("waitlist_signups", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 256 }),
  company: varchar("company", { length: 256 }),
  source: varchar("source", { length: 128 }).default("waitlist_page").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type InsertWaitlistSignup = typeof waitlistSignups.$inferInsert;

// AI Visibility Audits — free audit tool for prospects
export const visibilityAudits = mysqlTable("visibility_audits", {
  id: int("id").autoincrement().primaryKey(),
  businessName: varchar("businessName", { length: 256 }).notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  website: varchar("website", { length: 512 }),
  email: varchar("email", { length: 320 }),
  auditResult: json("auditResult"),
  score: int("score"),
  leadConverted: tinyint("leadConverted").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type VisibilityAudit = typeof visibilityAudits.$inferSelect;
export type InsertVisibilityAudit = typeof visibilityAudits.$inferInsert;
