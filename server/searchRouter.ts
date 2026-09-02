/* Profound IQ Consulting — header search router. Provides global search across courses, pages, certificates, and admin quick actions. */
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "./db";
import { courseCatalog } from "../shared/courseCatalog";
import { userActivityEvents, userNavFavorites } from "../drizzle/schema";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { isQualityControlAdmin } from "@shared/courseAccess";

const MAX_RESULTS_PER_CATEGORY = 5;

type SearchResult = {
  id: string;
  category: "page" | "course" | "certificate" | "member" | "report" | "action";
  title: string;
  description: string;
  href: string;
  icon?: string;
};

const STATIC_PAGE_INDEX: Array<Omit<SearchResult, "id">> = [
  { category: "page", title: "Dashboard", description: "Workspace overview and recent activity", href: "/dashboard", icon: "LayoutDashboard" },
  { category: "page", title: "Executive Reports", description: "Performance insights and exports", href: "/dashboard?tab=reports", icon: "BarChart3" },
  { category: "page", title: "Team Management", description: "Organization, members, and roles", href: "/admin", icon: "Users" },
  { category: "page", title: "My Certificates", description: "Issued credentials and downloads", href: "/dashboard/certificates", icon: "Award" },
  { category: "page", title: "Settings", description: "Account, notifications, and preferences", href: "/settings", icon: "Settings" },
  { category: "page", title: "Courses", description: "Course catalog and syllabi", href: "/courses", icon: "BookOpen" },
  { category: "page", title: "Self Assessment", description: "100-question reflection", href: "/assessment", icon: "ClipboardCheck" },
  { category: "page", title: "CareerPath", description: "Talent-fit pathways for CBE learners", href: "/careerpath", icon: "TrendingUp" },
  { category: "page", title: "Psychometrics", description: "Structured insight tests", href: "/psychometrics", icon: "Brain" },
  { category: "page", title: "Resources", description: "Guides and insights", href: "/resources", icon: "Library" },
  { category: "page", title: "Blog", description: "Editorial articles", href: "/blog", icon: "FileText" },
  { category: "page", title: "About", description: "Company background", href: "/about", icon: "Building2" },
  { category: "page", title: "Services", description: "Consulting offerings", href: "/services", icon: "Briefcase" },
  { category: "page", title: "School solutions", description: "Education programs", href: "/school-solutions", icon: "GraduationCap" },
  { category: "page", title: "Contact", description: "Talk to our team", href: "/contact", icon: "Mail" },
];

const ADMIN_QUICK_ACTIONS: Array<Omit<SearchResult, "id">> = [
  { category: "action", title: "New assessment report", description: "Issue a Profound IQ Self Assessment", href: "/admin?action=new-assessment", icon: "FilePlus" },
  { category: "action", title: "New career path report", description: "Issue a CareerPath report", href: "/admin?action=new-careerpath", icon: "Compass" },
  { category: "action", title: "New psychometric report", description: "Issue a psychometric report", href: "/admin?action=new-psychometric", icon: "Sparkles" },
  { category: "action", title: "New contact inquiry", description: "Log an inbound inquiry manually", href: "/admin?action=new-inquiry", icon: "Inbox" },
  { category: "action", title: "Export enrollment log", description: "Run the weekly enrollment export", href: "/admin?action=export-enrollments", icon: "Download" },
  { category: "action", title: "Open admin observatory", description: "Jump to the admin dashboard", href: "/admin", icon: "ShieldCheck" },
];

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function matches(value: string, query: string): boolean {
  if (!query) return true;
  return normalize(value).includes(query);
}

function score(item: { title: string; description: string }, query: string): number {
  if (!query) return 0;
  const q = normalize(query);
  const title = normalize(item.title);
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (normalize(item.description).includes(q)) return 30;
  return 10;
}

export const searchRouter = router({
  global: publicProcedure
    .input(z.object({
      query: z.string().trim().max(120).default(""),
      limit: z.number().int().min(1).max(25).default(8),
    }))
    .query(async ({ input }) => {
      const query = normalize(input.query);
      const limit = input.limit;

      const pageResults: SearchResult[] = STATIC_PAGE_INDEX
        .filter((item) => !query || normalize(item.title).includes(query) || normalize(item.description).includes(query))
        .slice(0, limit)
        .map((item, index) => ({ ...item, id: `page-${index}-${item.href}` }));

      const courseResults: SearchResult[] = courseCatalog
        .filter((course) => {
          if (!query) return true;
          const haystack = [
            course.title,
            course.strapline,
            course.description,
            course.audience,
            course.category,
            course.skillLevel,
            ...course.outcomes,
          ]
            .map((value) => normalize(value))
            .join(" \n ");
          return haystack.includes(query);
        })
        .slice(0, MAX_RESULTS_PER_CATEGORY)
        .map((course, index) => ({
          id: `course-${index}-${course.slug}`,
          category: "course" as const,
          title: course.title,
          description: course.strapline,
          href: `/courses/${course.slug}`,
          icon: "BookOpen",
        }));

      const actionResults: SearchResult[] = ADMIN_QUICK_ACTIONS
        .filter((item) => !query || normalize(item.title).includes(query) || normalize(item.description).includes(query))
        .slice(0, MAX_RESULTS_PER_CATEGORY)
        .map((item, index) => ({ ...item, id: `action-${index}-${item.href}` }));

      const certificateResults: SearchResult[] = [];
      try {
        const db = await getDb();
        if (db && query) {
          const { courseCertificates, users } = await import("../drizzle/schema");
          const rows = await db
            .select({
              certificateNumber: courseCertificates.certificateNumber,
              courseTitle: courseCertificates.courseTitle,
              recipientName: courseCertificates.recipientName,
              status: courseCertificates.status,
            })
            .from(courseCertificates)
            .where(
              or(
                like(courseCertificates.certificateNumber, `%${query}%`),
                like(courseCertificates.courseTitle, `%${query}%`),
                like(courseCertificates.recipientName, `%${query}%`)
              )
            )
            .orderBy(desc(courseCertificates.createdAt))
            .limit(MAX_RESULTS_PER_CATEGORY);
          rows.forEach((row, index) => {
            certificateResults.push({
              id: `cert-${index}-${row.certificateNumber}`,
              category: "certificate" as const,
              title: `${row.recipientName} — ${row.courseTitle}`,
              description: `Certificate ${row.certificateNumber}`,
              href: `/verify/certificate?certificate=${encodeURIComponent(row.certificateNumber)}`,
              icon: "Award",
            });
          });
        }
      } catch (error) {
        // Certificates are best-effort; do not fail the entire search.
        console.warn("[search] certificate lookup failed:", error);
      }

      const allResults = [...pageResults, ...courseResults, ...certificateResults, ...actionResults]
        .map((item) => ({ item, s: score(item, query) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map((entry) => entry.item);

      return {
        query: input.query,
        results: allResults,
        totalMatches: pageResults.length + courseResults.length + certificateResults.length + actionResults.length,
      };
    }),

  recent: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(15).default(6) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 6;
      try {
        const db = await getDb();
        if (!db) {
          return deriveRecentFromHistory(ctx.user.openId, limit);
        }
        const rows = await db
          .select()
          .from(userActivityEvents)
          .where(eq(userActivityEvents.userOpenId, ctx.user.openId))
          .orderBy(desc(userActivityEvents.createdAt))
          .limit(limit);
        if (rows.length > 0) {
          return rows.map((row) => ({
            id: String(row.id),
            type: row.activityType,
            title: row.title,
            description: row.description ?? "",
            href: row.href ?? "#",
            createdAt: row.createdAt,
          }));
        }
        return deriveRecentFromHistory(ctx.user.openId, limit);
      } catch (error) {
        console.warn("[search] recent activity lookup failed:", error);
        return deriveRecentFromHistory(ctx.user.openId, limit);
      }
    }),

  logActivity: protectedProcedure
    .input(z.object({
      activityType: z.string().trim().min(2).max(32),
      title: z.string().trim().min(2).max(200),
      description: z.string().trim().max(500).optional(),
      href: z.string().trim().max(255).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return { recorded: false as const };
        await db.insert(userActivityEvents).values({
          userOpenId: ctx.user.openId,
          activityType: input.activityType,
          title: input.title,
          description: input.description ?? null,
          href: input.href ?? null,
          metadata: input.metadata ?? null,
        });
        return { recorded: true as const };
      } catch (error) {
        console.warn("[search] activity log failed:", error);
        return { recorded: false as const };
      }
    }),

  favorites: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return { favorites: [] as Array<{ href: string; label: string; sortOrder: number }> };
      const rows = await db
        .select()
        .from(userNavFavorites)
        .where(eq(userNavFavorites.userOpenId, ctx.user.openId))
        .orderBy(userNavFavorites.sortOrder);
      return {
        favorites: rows.map((row) => ({
          href: row.navHref,
          label: row.navLabel,
          sortOrder: row.sortOrder,
        })),
      };
    } catch (error) {
      console.warn("[search] favorites lookup failed:", error);
      return { favorites: [] as Array<{ href: string; label: string; sortOrder: number }> };
    }
  }),

  addFavorite: protectedProcedure
    .input(z.object({
      href: z.string().trim().min(1).max(255),
      label: z.string().trim().min(1).max(120),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return { added: false as const };
        await db
          .insert(userNavFavorites)
          .values({
            userOpenId: ctx.user.openId,
            navHref: input.href,
            navLabel: input.label,
            sortOrder: 0,
          })
          .onDuplicateKeyUpdate({
            set: { navLabel: input.label },
          });
        return { added: true as const };
      } catch (error) {
        console.warn("[search] favorite add failed:", error);
        return { added: false as const };
      }
    }),

  removeFavorite: protectedProcedure
    .input(z.object({ href: z.string().trim().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return { removed: false as const };
        await db
          .delete(userNavFavorites)
          .where(and(
            eq(userNavFavorites.userOpenId, ctx.user.openId),
            eq(userNavFavorites.navHref, input.href)
          ));
        return { removed: true as const };
      } catch (error) {
        console.warn("[search] favorite remove failed:", error);
        return { removed: false as const };
      }
    }),

  quickActions: adminProcedure.query(async ({ ctx }) => {
    const actions = ADMIN_QUICK_ACTIONS.map((item, index) => ({ ...item, id: `action-${index}-${item.href}` }));
    return {
      isAdmin: isQualityControlAdmin(ctx.user),
      actions,
    };
  }),
});

async function deriveRecentFromHistory(userOpenId: string, limit: number) {
  try {
    const db = await getDb();
    if (!db) return [];
    const { courseCertificates, courseEnrollments, assessmentAttempts, users } = await import("../drizzle/schema");
    const userRow = await db.select({ email: users.email }).from(users).where(eq(users.openId, userOpenId)).limit(1);
    const userEmail = userRow[0]?.email;
    if (!userEmail) return [];

    const out: Array<{ id: string; type: string; title: string; description: string; href: string; createdAt: Date }> = [];

    const certs = await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.recipientName, userEmail))
      .orderBy(desc(courseCertificates.createdAt))
      .limit(limit);
    certs.forEach((cert, index) => {
      out.push({
        id: `cert-${cert.id}-${index}`,
        type: "certificate",
        title: `Issued ${cert.courseTitle}`,
        description: cert.certificateNumber,
        href: `/verify/certificate?certificate=${encodeURIComponent(cert.certificateNumber)}`,
        createdAt: cert.createdAt ?? new Date(),
      });
    });

    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.email, userEmail))
      .orderBy(desc(courseEnrollments.createdAt))
      .limit(limit);
    enrollments.forEach((row, index) => {
      out.push({
        id: `enrollment-${row.id}-${index}`,
        type: "enrollment",
        title: `Started ${row.courseTitle}`,
        description: "Course enrollment",
        href: "/dashboard",
        createdAt: row.createdAt ?? new Date(),
      });
    });

    const assessments = await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.email, userEmail))
      .orderBy(desc(assessmentAttempts.createdAt))
      .limit(limit);
    assessments.forEach((row, index) => {
      out.push({
        id: `assessment-${row.id}-${index}`,
        type: "assessment",
        title: "Self Assessment completed",
        description: row.reportEmailStatus ?? "Available in dashboard",
        href: "/dashboard",
        createdAt: row.createdAt ?? new Date(),
      });
    });

    return out
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  } catch (error) {
    console.warn("[search] derive recent failed:", error);
    return [];
  }
}
