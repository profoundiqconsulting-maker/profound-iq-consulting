import { boolean, int, json, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  username: varchar("username", { length: 40 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  passwordResetTokenHash: varchar("passwordResetTokenHash", { length: 128 }),
  passwordResetExpiresAt: timestamp("passwordResetExpiresAt"),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 32 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  notificationPreferences: json("notificationPreferences"),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  timezone: varchar("timezone", { length: 64 }),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
  phoneUnique: uniqueIndex("users_phone_unique").on(table.phone),
  usernameUnique: uniqueIndex("users_username_unique").on(table.username),
}));

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

export const loginEvents = mysqlTable("login_events", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }),
  identifierType: varchar("identifierType", { length: 16 }).notNull(),
  success: boolean("success").notNull(),
  failureCode: varchar("failureCode", { length: 32 }),
  networkHash: varchar("networkHash", { length: 64 }).notNull(),
  userAgent: varchar("userAgent", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userSessions = mysqlTable("user_sessions", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
  networkHash: varchar("networkHash", { length: 64 }),
  userAgent: varchar("userAgent", { length: 512 }),
  deviceType: varchar("deviceType", { length: 32 }),
  estimatedLocation: varchar("estimatedLocation", { length: 120 }),
  trustedDevice: boolean("trustedDevice").default(false).notNull(),
  trustExpiresAt: timestamp("trustExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
}, (table) => ({
  tokenHashUnique: uniqueIndex("user_sessions_token_hash_unique").on(table.tokenHash),
}));

export const adminSecuritySettings = mysqlTable("admin_security_settings", {
  id: int("id").autoincrement().primaryKey(),
  adminOpenId: varchar("adminOpenId", { length: 64 }).notNull(),
  alertThreshold: int("alertThreshold").default(5).notNull(),
  reviewWindowDays: int("reviewWindowDays").default(7).notNull(),
  loginEventRetentionDays: int("loginEventRetentionDays").default(90).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  adminUnique: uniqueIndex("admin_security_settings_admin_unique").on(table.adminOpenId),
}));

export const authLoginAttempts = mysqlTable("auth_login_attempts", {
  id: int("id").autoincrement().primaryKey(),
  identifierHash: varchar("identifierHash", { length: 64 }).notNull(),
  networkHash: varchar("networkHash", { length: 64 }).notNull(),
  failedCount: int("failedCount").default(0).notNull(),
  windowStartedAt: timestamp("windowStartedAt").notNull(),
  lastFailedAt: timestamp("lastFailedAt").notNull(),
  alertSentAt: timestamp("alertSentAt"),
}, (table) => ({
  identifierNetworkUnique: uniqueIndex("auth_login_attempts_identifier_network_unique").on(table.identifierHash, table.networkHash),
}));

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
export type LoginEvent = typeof loginEvents.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type AdminSecuritySettings = typeof adminSecuritySettings.$inferSelect;
export type AuthLoginAttempt = typeof authLoginAttempts.$inferSelect;
export type VerificationRevocationAudit = typeof verificationRevocationAudits.$inferSelect;
export type DeliveryLogExportJob = typeof deliveryLogExportJobs.$inferSelect;
export type AdminAnalyticsSettings = typeof adminAnalyticsSettings.$inferSelect;
