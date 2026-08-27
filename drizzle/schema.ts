import { boolean, index, int, json, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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
  learningGoals: json("learningGoals"),
  recommendationAnswers: json("recommendationAnswers"),
  cohort: varchar("cohort", { length: 80 }),
  leaderboardOptIn: boolean("leaderboardOptIn").default(false).notNull(),
  leaderboardDisplayName: varchar("leaderboardDisplayName", { length: 80 }),
  exportPreferences: json("exportPreferences"),
  exportLogoUrl: varchar("exportLogoUrl", { length: 512 }),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
  phoneUnique: uniqueIndex("users_phone_unique").on(table.phone),
  usernameUnique: uniqueIndex("users_username_unique").on(table.username),
}));

export const courseLessonResponseNotifications = mysqlTable("course_lesson_response_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userOpenId: varchar("user_open_id", { length: 64 }).notNull(),
  enrollmentId: int("enrollment_id").notNull(),
  responseId: int("response_id").notNull(),
  reviewId: int("review_id").notNull(),
  courseSlug: varchar("course_slug", { length: 160 }).notNull(),
  lessonId: varchar("lesson_id", { length: 180 }).notNull(),
  taskId: varchar("task_id", { length: 120 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userUnreadIdx: index("course_feedback_notifications_user_unread_idx").on(table.userOpenId, table.readAt),
  reviewIdx: index("course_feedback_notifications_review_idx").on(table.reviewId),
}));

export const staffInvitations = mysqlTable("staff_invitations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 32 }).default("staff").notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  invitedByOpenId: varchar("invited_by_open_id", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const catalogItems = mysqlTable("catalog_items", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  itemType: varchar("itemType", { length: 32 }).default("course").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  strapline: varchar("strapline", { length: 240 }).notNull(),
  description: text("description").notNull(),
  audience: varchar("audience", { length: 300 }).notNull(),
  duration: varchar("duration", { length: 120 }).notNull(),
  outcomes: json("outcomes").notNull(),
  coverImageUrl: varchar("coverImageUrl", { length: 600 }),
  priceKes: int("priceKes").default(4999).notNull(),
  published: boolean("published").default(false).notNull(),
  createdByOpenId: varchar("createdByOpenId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contactInquiries = mysqlTable("contact_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  message: text("message").notNull(),
  internalNotes: text("internal_notes"),
  assignedToOpenId: varchar("assigned_to_open_id", { length: 64 }),
  assignedToName: varchar("assigned_to_name", { length: 160 }),
  dueDate: timestamp("due_date"),
  priority: varchar("priority", { length: 16 }).default("normal").notNull(),
  status: varchar("status", { length: 32 }).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  source: varchar("source", { length: 80 }).default("insights").notNull(),
  status: varchar("status", { length: 24 }).default("pending").notNull(),
  consentedAt: timestamp("consentedAt").notNull(),
  confirmedAt: timestamp("confirmedAt"),
  confirmationTokenHash: varchar("confirmationTokenHash", { length: 64 }),
  confirmationExpiresAt: timestamp("confirmationExpiresAt"),
  confirmationSentAt: timestamp("confirmationSentAt"),
  unsubscribeTokenHash: varchar("unsubscribeTokenHash", { length: 64 }),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ emailUnique: uniqueIndex("newsletter_subscribers_email_unique").on(table.email) }));

export const insightArticles = mysqlTable("insight_articles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  excerpt: text("excerpt").notNull(),
  readTime: varchar("readTime", { length: 40 }).notNull(),
  accent: varchar("accent", { length: 180 }).notNull(),
  sectionsJson: text("sectionsJson").notNull(),
  status: varchar("status", { length: 24 }).default("draft").notNull(),
  socialImageUrl: varchar("socialImageUrl", { length: 512 }),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ slugUnique: uniqueIndex("insight_articles_slug_unique").on(table.slug) }));

export const contactInquiryAuditLogs = mysqlTable("contact_inquiry_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  inquiryId: int("inquiry_id").notNull(),
  actorOpenId: varchar("actor_open_id", { length: 64 }).notNull(),
  actorName: varchar("actor_name", { length: 160 }),
  actorEmail: varchar("actor_email", { length: 320 }),
  action: varchar("action", { length: 32 }).notNull(),
  previousValue: text("previous_value"),
  nextValue: text("next_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courseLearnerEnrollments = mysqlTable("course_learner_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  courseSlug: varchar("courseSlug", { length: 120 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ learnerCourseUnique: uniqueIndex("course_learner_course_unique").on(table.userOpenId, table.courseSlug) }));
export const courseLessonProgress = mysqlTable("course_lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  lessonId: varchar("lessonId", { length: 180 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
}, (table) => ({ enrollmentLessonUnique: uniqueIndex("course_enrollment_lesson_unique").on(table.enrollmentId, table.lessonId) }));
export const courseLessonResponses = mysqlTable("course_lesson_responses", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  lessonId: varchar("lessonId", { length: 180 }).notNull(),
  taskId: varchar("taskId", { length: 120 }).notNull(),
  responseHtml: text("responseHtml").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ enrollmentLessonTaskUnique: uniqueIndex("course_enrollment_lesson_task_unique").on(table.enrollmentId, table.lessonId, table.taskId) }));
export const courseSavedCourses = mysqlTable("course_saved_courses", {
  id: int("id").autoincrement().primaryKey(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  courseSlug: varchar("courseSlug", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ learnerCourseUnique: uniqueIndex("course_saved_course_unique").on(table.userOpenId, table.courseSlug), learnerIdx: index("course_saved_course_learner_idx").on(table.userOpenId) }));

export const courseRecommendationHistory = mysqlTable("course_recommendation_history", {
  id: int("id").autoincrement().primaryKey(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  careerGoal: varchar("careerGoal", { length: 80 }).notNull(),
  skillLevel: varchar("skillLevel", { length: 24 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ learnerIdx: index("course_recommendation_history_learner_idx").on(table.userOpenId), createdIdx: index("course_recommendation_history_created_idx").on(table.userOpenId, table.createdAt) }));

export const courseLessonIllustrationBookmarks = mysqlTable("course_lesson_illustration_bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  courseSlug: varchar("courseSlug", { length: 120 }).notNull(),
  lessonId: varchar("lessonId", { length: 180 }).notNull(),
  illustrationMode: varchar("illustrationMode", { length: 24 }).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  content: text("content").notNull(),
  folder: varchar("folder", { length: 80 }).default("Unsorted").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ learnerIllustrationUnique: uniqueIndex("course_illustration_bookmark_unique").on(table.userOpenId, table.courseSlug, table.lessonId, table.illustrationMode), learnerCourseIdx: index("course_illustration_bookmark_learner_course_idx").on(table.userOpenId, table.courseSlug) }));
export const courseLessonResponseReviews = mysqlTable("course_lesson_response_reviews", {
  id: int("id").autoincrement().primaryKey(),
  responseId: int("responseId").notNull(),
  enrollmentId: int("enrollmentId").notNull(),
  lessonId: varchar("lessonId", { length: 180 }).notNull(),
  taskId: varchar("taskId", { length: 120 }).notNull(),
  reviewerOpenId: varchar("reviewerOpenId", { length: 64 }).notNull(),
  reviewerName: varchar("reviewerName", { length: 160 }),
  feedback: text("feedback").notNull(),
  status: varchar("status", { length: 24 }).default("reviewed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ responseReviewerUnique: uniqueIndex("course_response_reviewer_unique").on(table.responseId, table.reviewerOpenId) }));
export const courseQuizAttempts = mysqlTable("course_quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  moduleId: varchar("moduleId", { length: 120 }).notNull(),
  score: int("score").notNull(),
  passed: boolean("passed").default(false).notNull(),
  answers: json("answers").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export const coursePaymentStages = mysqlTable("course_payment_stages", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  stage: int("stage").notNull(),
  amountKes: int("amountKes").notNull(),
  paymentStatus: varchar("paymentStatus", { length: 32 }).default("pending").notNull(),
  paystackReference: varchar("paystackReference", { length: 120 }).unique(),
  initializedAt: timestamp("initializedAt"),
  paidAt: timestamp("paidAt"),
  lastCheckedAt: timestamp("lastCheckedAt"),
  lastError: text("lastError"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ enrollmentStageUnique: uniqueIndex("course_enrollment_stage_unique").on(table.enrollmentId, table.stage) }));
export const coursePaymentEvents = mysqlTable("course_payment_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 160 }).notNull().unique(),
  enrollmentId: int("enrollmentId"),
  paymentStageId: int("paymentStageId"),
  reference: varchar("reference", { length: 120 }),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  transactionStatus: varchar("transactionStatus", { length: 32 }),
  amountKes: int("amountKes"),
  currency: varchar("currency", { length: 8 }),
  payload: json("payload"),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  errorMessage: text("errorMessage"),
});
export const courseActivePositions = mysqlTable("course_active_positions", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull().unique(),
  moduleIndex: int("moduleIndex").default(0).notNull(),
  lessonId: varchar("lessonId", { length: 180 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const courseCertificates = mysqlTable("course_certificates", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  certificateNumber: varchar("certificateNumber", { length: 80 }).notNull().unique(),
  recipientName: varchar("recipientName", { length: 160 }).notNull(),
  courseTitle: varchar("courseTitle", { length: 180 }).notNull(),
  status: varchar("status", { length: 32 }).default("issued").notNull(),
  fileKey: varchar("fileKey", { length: 512 }),
  fileUrl: varchar("fileUrl", { length: 512 }),
  emailStatus: varchar("emailStatus", { length: 32 }).default("pending").notNull(),
  emailedAt: timestamp("emailedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export const courseDeliveryEvents = mysqlTable("course_delivery_events", {
  id: int("id").autoincrement().primaryKey(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  enrollmentId: int("enrollmentId").notNull(),
  certificateId: int("certificateId"),
  step: varchar("step", { length: 32 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  organizationName: varchar("organizationName", { length: 180 }),
  metadata: json("metadata"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
  pausedAt: timestamp("pausedAt"),
  pausedByOpenId: varchar("pausedByOpenId", { length: 64 }),
  pausedByName: varchar("pausedByName", { length: 160 }),
});

export const psychometricDeliveryAcknowledgementLogs = mysqlTable("psychometric_delivery_acknowledgement_logs", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  actorOpenId: varchar("actorOpenId", { length: 64 }).notNull(),
  actorName: varchar("actorName", { length: 160 }),
  note: text("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const psychometricRecommendationFeedback = mysqlTable("psychometric_recommendation_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  testSlug: varchar("testSlug", { length: 120 }).notNull(),
  courseSlug: varchar("courseSlug", { length: 120 }).notNull(),
  rating: int("rating").notNull(),
  goal: varchar("goal", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ recommendationFeedbackUnique: uniqueIndex("psychometric_recommendation_feedback_unique").on(table.userOpenId, table.testSlug, table.courseSlug) }));

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
  networkAddress: varchar("networkAddress", { length: 64 }),
  userAgent: varchar("userAgent", { length: 512 }),
  deviceType: varchar("deviceType", { length: 32 }),
  estimatedLocation: varchar("estimatedLocation", { length: 120 }),
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
  lockoutWindowSeconds: int("lockoutWindowSeconds").default(60).notNull(),
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

export const loginUnlockAudits = mysqlTable("login_unlock_audits", {
  id: int("id").autoincrement().primaryKey(),
  targetOpenId: varchar("targetOpenId", { length: 64 }).notNull(),
  targetEmail: varchar("targetEmail", { length: 320 }),
  actorOpenId: varchar("actorOpenId", { length: 64 }).notNull(),
  actorName: varchar("actorName", { length: 160 }),
  clearedAttemptCount: int("clearedAttemptCount").default(0).notNull(),
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

export const siteSeoSettings = mysqlTable("site_seo_settings", {
  settingKey: varchar("settingKey", { length: 80 }).primaryKey(),
  settingValue: text("settingValue").notNull(),
  updatedByOpenId: varchar("updatedByOpenId", { length: 64 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reportShares = mysqlTable("report_shares", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
  lens: varchar("lens", { length: 32 }).default("leadership").notNull(),
  recipientPurpose: varchar("recipientPurpose", { length: 40 }),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
});

export const reportShareAuditEvents = mysqlTable("report_share_audit_events", {
  id: int("id").autoincrement().primaryKey(),
  shareId: int("shareId").notNull(),
  attemptId: int("attemptId").notNull(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 24 }).notNull(),
  recipientPurpose: varchar("recipientPurpose", { length: 40 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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

export const assessmentReflectionResponses = mysqlTable("assessment_reflection_responses", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
  dimensionKey: varchar("dimensionKey", { length: 48 }).notNull(),
  promptIndex: int("promptIndex").notNull(),
  promptText: text("promptText").notNull(),
  note: text("note"),
  status: varchar("status", { length: 16 }).default("planned").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  attemptPromptUnique: uniqueIndex("assessment_reflection_attempt_prompt_unique").on(table.attemptId, table.dimensionKey, table.promptIndex),
  ownerAttemptIndex: index("assessment_reflection_owner_attempt_idx").on(table.ownerOpenId, table.attemptId),
}));
export const assessmentDrafts = mysqlTable("assessment_drafts", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  answers: json("answers").notNull(),
  currentModule: int("currentModule").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resumedAt: timestamp("resumedAt"),
});

export const careerPathActiveModules = mysqlTable("career_path_active_modules", {
  id: int("id").autoincrement().primaryKey(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull().unique(),
  moduleIndex: int("moduleIndex").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const careerPathAttempts = mysqlTable("career_path_attempts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  answers: json("answers").notNull(),
  paystackReference: varchar("paystackReference", { length: 120 }).unique(),
  paymentStatus: varchar("paymentStatus", { length: 32 }).default("pending").notNull(),
  report: json("report"),
  reportEmailStatus: varchar("reportEmailStatus", { length: 32 }).default("pending").notNull(),
  reportEmailSentAt: timestamp("reportEmailSentAt"),
  reportEmailClaimedAt: timestamp("reportEmailClaimedAt"),
  personalNotes: text("personalNotes"),
  receiptTitle: varchar("receiptTitle", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
  consentedAt: timestamp("consentedAt").notNull(),
});

export const psychometricAttempts = mysqlTable("psychometric_attempts", {
  id: int("id").autoincrement().primaryKey(),
  testSlug: varchar("testSlug", { length: 120 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  answers: json("answers").notNull(),
  paystackReference: varchar("paystackReference", { length: 120 }).unique(),
  paymentStatus: varchar("paymentStatus", { length: 32 }).default("pending").notNull(),
  report: json("report"),
  reportEmailStatus: varchar("reportEmailStatus", { length: 16 }).default("pending").notNull(),
  reportEmailSentAt: timestamp("reportEmailSentAt"),
  deliveryAcknowledgedAt: timestamp("deliveryAcknowledgedAt"),
  deliveryAcknowledgedByOpenId: varchar("deliveryAcknowledgedByOpenId", { length: 64 }),
  deliveryAcknowledgedByName: varchar("deliveryAcknowledgedByName", { length: 160 }),
  deliveryAcknowledgementNote: varchar("deliveryAcknowledgementNote", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
  consentedAt: timestamp("consentedAt").notNull(),
});

export const organizationInvitations = mysqlTable("organization_invitations", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  organizationName: varchar("organizationName", { length: 180 }).notNull(),
  organizationEmail: varchar("organizationEmail", { length: 320 }).notNull(),
  requesterOpenId: varchar("requesterOpenId", { length: 64 }).notNull(),
  reportType: varchar("reportType", { length: 40 }).notNull(),
  reportId: int("reportId").notNull(),
  status: varchar("status", { length: 24 }).default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  reminderSentAt: timestamp("reminderSentAt"),
  reviewedAt: timestamp("reviewedAt"),
  reviewedByOpenId: varchar("reviewedByOpenId", { length: 64 }),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export const resetLinkRevocationAudits = mysqlTable("reset_link_revocation_audits", {
  id: int("id").autoincrement().primaryKey(),
  targetOpenId: varchar("target_open_id", { length: 64 }).notNull(),
  targetEmail: varchar("target_email", { length: 320 }).notNull(),
  actorOpenId: varchar("actor_open_id", { length: 64 }).notNull(),
  actorName: varchar("actor_name", { length: 160 }),
  revokedAt: timestamp("revoked_at").defaultNow().notNull(),
});
export const unlockAuditExportDownloads = mysqlTable("unlock_audit_export_downloads", {
  id: int("id").autoincrement().primaryKey(),
  adminOpenId: varchar("adminOpenId", { length: 64 }).notNull(),
  adminName: varchar("adminName", { length: 160 }),
  filename: varchar("filename", { length: 220 }).notNull(),
  filterSummary: varchar("filterSummary", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export const organizationApprovalEvents = mysqlTable("organization_approval_events", {
  id: int("id").autoincrement().primaryKey(),
  invitationId: int("invitationId").notNull(),
  organizationName: varchar("organizationName", { length: 180 }).notNull(),
  organizationEmail: varchar("organizationEmail", { length: 320 }).notNull(),
  requesterOpenId: varchar("requesterOpenId", { length: 64 }).notNull(),
  actorOpenId: varchar("actorOpenId", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 24 }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type AssessmentDraft = typeof assessmentDrafts.$inferSelect;
export type CareerPathAttempt = typeof careerPathAttempts.$inferSelect;
export type ReportShare = typeof reportShares.$inferSelect;
export type ReportShareAuditEvent = typeof reportShareAuditEvents.$inferSelect;
export type InsertAssessmentAttempt = typeof assessmentAttempts.$inferInsert;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type CourseLearnerEnrollment = typeof courseLearnerEnrollments.$inferSelect;
export type CourseLessonProgress = typeof courseLessonProgress.$inferSelect;
export type CourseQuizAttempt = typeof courseQuizAttempts.$inferSelect;
export type CoursePaymentStage = typeof coursePaymentStages.$inferSelect;
export type CoursePaymentEvent = typeof coursePaymentEvents.$inferSelect;
export type CourseActivePosition = typeof courseActivePositions.$inferSelect;
export type CourseCertificate = typeof courseCertificates.$inferSelect;
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
export type UnlockAuditExportDownload = typeof unlockAuditExportDownloads.$inferSelect;
