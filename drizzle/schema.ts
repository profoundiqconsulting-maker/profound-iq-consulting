import { int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 32 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  notificationPreferences: json("notificationPreferences"),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  timezone: varchar("timezone", { length: 64 }),
});

export const courseEnrollments = mysqlTable("course_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  courseTitle: varchar("courseTitle", { length: 180 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: varchar("status", { length: 32 }).default("new").notNull(),
  consentedAt: timestamp("consentedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  eventName: varchar("eventName", { length: 80 }).notNull(),
  attemptId: int("attemptId"),
  userOpenId: varchar("userOpenId", { length: 64 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").autoincrement().primaryKey(),
  templateKey: varchar("templateKey", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  subject: varchar("subject", { length: 240 }).notNull(),
  body: text("body").notNull(),
  updatedByOpenId: varchar("updatedByOpenId", { length: 64 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const scheduledExports = mysqlTable("scheduled_exports", {
  id: int("id").autoincrement().primaryKey(),
  exportKey: varchar("exportKey", { length: 80 }).notNull().unique(),
  scheduleTaskUid: varchar("scheduleTaskUid", { length: 65 }),
  lastRunAt: timestamp("lastRunAt"),
  lastFileKey: varchar("lastFileKey", { length: 512 }),
  lastFileUrl: varchar("lastFileUrl", { length: 512 }),
  retentionDays: int("retentionDays").default(30).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const scheduledExportRuns = mysqlTable("scheduled_export_runs", {
  id: int("id").autoincrement().primaryKey(),
  exportKey: varchar("exportKey", { length: 80 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  rowCount: int("rowCount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const verificationRevocationAudits = mysqlTable("verification_revocation_audits", {
  id: int("id").autoincrement().primaryKey(),
  targetOpenId: varchar("targetOpenId", { length: 64 }).notNull(),
  targetEmail: varchar("targetEmail", { length: 320 }),
  actorOpenId: varchar("actorOpenId", { length: 64 }).notNull(),
  actorName: varchar("actorName", { length: 160 }),
  actorEmail: varchar("actorEmail", { length: 320 }),
  reason: text("reason").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const deliveryLogExportJobs = mysqlTable("delivery_log_export_jobs", {
  id: int("id").autoincrement().primaryKey(),
  requestedByOpenId: varchar("requestedByOpenId", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).default("queued").notNull(),
  filters: json("filters"),
  fileKey: varchar("fileKey", { length: 512 }),
  fileUrl: varchar("fileUrl", { length: 512 }),
  rowCount: int("rowCount"),
  errorMessage: varchar("errorMessage", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
});

export const emailPreviewDeliveries = mysqlTable("email_preview_deliveries", {
  id: int("id").autoincrement().primaryKey(),
  templateKey: varchar("templateKey", { length: 80 }).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 240 }).notNull(),
  body: text("body"),
  status: varchar("status", { length: 20 }).notNull(),
  errorMessage: varchar("errorMessage", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const adminAnalyticsSettings = mysqlTable("admin_analytics_settings", {
  id: int("id").autoincrement().primaryKey(),
  adminOpenId: varchar("adminOpenId", { length: 64 }).notNull().unique(),
  paidBenchmark: int("paidBenchmark").default(35).notNull(),
  downloadBenchmark: int("downloadBenchmark").default(60).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessmentAttempts = mysqlTable("assessment_attempts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  answers: json("answers").notNull(),
  paystackReference: varchar("paystackReference", { length: 120 }).unique(),
  paymentStatus: varchar("paymentStatus", { length: 32 }).default("pending").notNull(),
  report: json("report"),
  reportEmailStatus: varchar("reportEmailStatus", { length: 16 }).default("pending").notNull(),
  reportEmailClaimedAt: timestamp("reportEmailClaimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
  reportEmailSentAt: timestamp("reportEmailSentAt"),
  consentedAt: timestamp("consentedAt").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type InsertAssessmentAttempt = typeof assessmentAttempts.$inferInsert;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type ScheduledExport = typeof scheduledExports.$inferSelect;
export type ScheduledExportRun = typeof scheduledExportRuns.$inferSelect;
export type EmailPreviewDelivery = typeof emailPreviewDeliveries.$inferSelect;
export type VerificationRevocationAudit = typeof verificationRevocationAudits.$inferSelect;
export type DeliveryLogExportJob = typeof deliveryLogExportJobs.$inferSelect;
export type AdminAnalyticsSettings = typeof adminAnalyticsSettings.$inferSelect;
