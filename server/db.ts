import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { assessmentAttempts, InsertAssessmentAttempt, InsertUser, users } from "../drizzle/schema";
import type { AssessmentReport } from "../shared/assessment";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
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

export async function createAssessmentAttempt(input: Pick<InsertAssessmentAttempt, "name" | "email" | "answers">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(assessmentAttempts).values({ ...input, paymentStatus: "pending", consentedAt: new Date() });
  return Number(result[0].insertId);
}

export async function setPaystackReference(id: number, reference: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(assessmentAttempts).set({ paystackReference: reference }).where(eq(assessmentAttempts.id, id));
}

export async function getAssessmentAttempt(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.id, id)).limit(1);
  return result[0];
}

export async function getAssessmentAttemptByReference(reference: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.paystackReference, reference)).limit(1);
  return result[0];
}

export async function markAssessmentPaid(id: number, report: AssessmentReport) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(assessmentAttempts).set({ paymentStatus: "paid", report, paidAt: new Date() }).where(eq(assessmentAttempts.id, id));
}

export async function getLatestPaidAssessment(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.email, email)).orderBy(desc(assessmentAttempts.createdAt)).limit(20);
  return result.find((item) => item.paymentStatus === "paid");
}

export async function getUserAssessmentHistory(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const rows = await db.select({
    id: assessmentAttempts.id,
    name: assessmentAttempts.name,
    email: assessmentAttempts.email,
    paymentStatus: assessmentAttempts.paymentStatus,
    paystackReference: assessmentAttempts.paystackReference,
    createdAt: assessmentAttempts.createdAt,
    paidAt: assessmentAttempts.paidAt,
    report: assessmentAttempts.report,
  }).from(assessmentAttempts).where(eq(assessmentAttempts.email, email)).orderBy(desc(assessmentAttempts.createdAt)).limit(50);

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    paidAt: row.paidAt,
    paymentStatus: row.paymentStatus,
    paystackReference: row.paystackReference,
    overallScore: (row.report as AssessmentReport | null)?.overallScore ?? null,
    overallBand: (row.report as AssessmentReport | null)?.overallBand ?? null,
    report: row.paymentStatus === "paid" ? row.report : null,
  }));
}

export async function getAssessmentAdminOverview() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const rows = await db.select({
    id: assessmentAttempts.id,
    name: assessmentAttempts.name,
    email: assessmentAttempts.email,
    paymentStatus: assessmentAttempts.paymentStatus,
    paystackReference: assessmentAttempts.paystackReference,
    createdAt: assessmentAttempts.createdAt,
    paidAt: assessmentAttempts.paidAt,
    report: assessmentAttempts.report,
  }).from(assessmentAttempts).orderBy(desc(assessmentAttempts.createdAt)).limit(250);

  const attempts = rows.map((row) => {
    const report = row.report as AssessmentReport | null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      paymentStatus: row.paymentStatus,
      paystackReference: row.paystackReference,
      createdAt: row.createdAt,
      paidAt: row.paidAt,
      overallScore: report?.overallScore ?? null,
      overallBand: report?.overallBand ?? null,
    };
  });

  return {
    attempts,
    summary: {
      total: attempts.length,
      paid: attempts.filter((attempt) => attempt.paymentStatus === "paid").length,
      pending: attempts.filter((attempt) => attempt.paymentStatus !== "paid").length,
    },
  };
}
