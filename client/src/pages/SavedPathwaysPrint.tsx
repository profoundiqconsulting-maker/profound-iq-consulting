import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import { trpc } from "@/lib/trpc";
import { courseCatalog } from "@shared/courseCatalog";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Printer,
} from "lucide-react";
import { Link } from "wouter";

const copy: {
  title: string;
  description: string;
  print: string;
  back: string;
  empty: string;
  pathway: string;
  outcomes: string;
  prepared: string;
  page: string;
  watermark: string;
  previous: string;
  next: string;
} = {
  title: "Saved learning pathways",
  description:
    "A print-ready reference of the pathways you selected for future learning.",
  print: "Print pathways",
  back: "Back to My Space",
  empty: "You have no saved pathways yet.",
  pathway: "Pathway",
  outcomes: "Outcomes",
  prepared: "Prepared for",
  page: "Page",
  watermark: "Brand watermark",
  previous: "Previous",
  next: "Next",
};

export default function SavedPathwaysPrint() {
  const { user, loading } = useAuth();
  const saved = trpc.course.savedCourses.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
  });
  const labels = copy;
  const courses = (saved.data ?? [])
    .map(row => {
      const course = courseCatalog.find(item => item.slug === row.courseSlug);
      return course
        ? {
            slug: course.slug,
            title: course.title,
            description: course.description,
          }
        : null;
    })
    .filter((course): course is NonNullable<typeof course> => Boolean(course));
  const [printPage, setPrintPage] = useState(1);
  const [pageSize, setPageSize] = useState<"A4" | "LETTER">(() => {
    const value = new URLSearchParams(window.location.search).get("pageSize");
    return value === "LETTER" ? "LETTER" : "A4";
  });
  const [showWatermark, setShowWatermark] = useState(
    () => new URLSearchParams(window.location.search).get("watermark") !== "0"
  );
  const [showCoverPage, setShowCoverPage] = useState(
    () => new URLSearchParams(window.location.search).get("coverPage") === "1"
  );
  const chunkSize = 2;
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(courses.length / chunkSize)) },
    (_, index) => courses.slice(index * chunkSize, (index + 1) * chunkSize)
  );
  const formattedDate = new Date().toLocaleString(
    "en-KE",
    { dateStyle: "medium", timeStyle: "short" }
  );

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f3e8]">
        <Loader2 className="animate-spin text-[#7d5e1e]" />
      </div>
    );
  if (!user)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f3e8] p-6 text-center">
        <div>
          <p className="text-lg font-semibold text-[#16243d]">
            Sign in to view your saved pathways.
          </p>
          <Link
            href="/auth"
            className="mt-4 inline-flex border border-[#16243d]/20 px-4 py-3 text-xs font-black uppercase tracking-[.12em]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );

  return (
    <>
      <style>{`@page { size: ${pageSize}; margin: 0.45in; } @media print { .print-page { break-after: page; min-height: 9.35in; } .print-page:last-child { break-after: auto; } .print-cover { break-after: page; min-height: 9.35in; } }`}</style>
      <main
        dir="ltr"
        className="min-h-screen bg-[#f7f3e8] text-[#16243d] print:bg-white"
      >
        <header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8] print:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <BrandLogo context="my space" compactOnMobile />
              <span className="text-[10px] font-black uppercase tracking-[.16em]">
                / MY SPACE
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7]"
              >
                <ArrowLeft size={14} /> {labels.back}
              </Link>
            </div>
          </div>
        </header>
        <section className="mx-auto max-w-5xl px-5 py-10 sm:py-14 print:max-w-none print:px-12 print:py-8">
          <div className="flex flex-col justify-between gap-6 border-b-2 border-[#c9a34e] pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#7d5e1e]">
                PROFOUND IQ / CONSULTING
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                {labels.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657084]">
                {labels.description}
              </p>
              <p className="mt-3 text-xs text-[#657084]">
                {labels.prepared} {user.name || "Learner"}
                {user.email ? ` · ${user.email}` : ""} · {formattedDate}
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 print:hidden">
              <div className="flex flex-wrap justify-end gap-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                  Page size{" "}
                  <select
                    value={pageSize}
                    onChange={event =>
                      setPageSize(
                        event.target.value === "LETTER" ? "LETTER" : "A4"
                      )
                    }
                    className="border border-[#16243d]/20 bg-transparent px-1 py-1 text-[10px] font-black"
                  >
                    <option value="A4">A4</option>
                    <option value="LETTER">Letter</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={event => setShowWatermark(event.target.checked)}
                    className="accent-[#a27e2e]"
                  />{" "}
                  {labels.watermark}
                </label>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                  <input
                    type="checkbox"
                    checked={showCoverPage}
                    onChange={event => setShowCoverPage(event.target.checked)}
                    className="accent-[#a27e2e]"
                  />{" "}
                  Cover page
                </label>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8]"
              >
                <Printer size={15} /> {labels.print}
              </button>
            </div>
          </div>
          {showCoverPage && !saved.isLoading && courses.length > 0 && (
            <section className="print-cover mt-8 grid place-items-center bg-[#16243d] p-10 text-center text-[#f7f3e8]">
              <div>
                <BrandLogo context="my space" />
                <p className="mt-10 text-[10px] font-black uppercase tracking-[.2em] text-[#c9a34e]">
                  PROFOUND IQ / CONSULTING
                </p>
                <h2 className="mt-5 font-serif text-4xl leading-tight">
                  {labels.title}
                </h2>
                <p className="mt-6 text-sm text-[#c1cad7]">
                  {labels.prepared} {user.name || "Learner"}
                </p>
                <p className="mt-2 text-xs text-[#c1cad7]">{formattedDate}</p>
              </div>
            </section>
          )}
          {saved.isLoading ? (
            <div className="py-12 text-sm text-[#657084]">
              Loading saved pathways…
            </div>
          ) : courses.length === 0 ? (
            <div className="border-l-2 border-[#c9a34e] py-10 text-sm text-[#657084]">
              {labels.empty}
            </div>
          ) : (
            <>
              {pages.map((pageCourses, pageIndex) => (
                <section
                  key={pageIndex}
                  className={`print-page relative mt-8 ${pageIndex + 1 === printPage ? "block" : "hidden print:block"}`}
                  aria-label={`${labels.page} ${pageIndex + 1}`}
                >
                  <div
                    className={`grid gap-6 ${pageCourses.length > 1 ? "sm:grid-cols-2" : ""}`}
                  >
                    {pageCourses.map((course, index) => (
                      <article
                        key={course.slug}
                        className="break-inside-avoid border border-[#16243d]/15 bg-white/70 p-6 print:border-[#16243d]/30 print:bg-white"
                      >
                        <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                          {labels.pathway}{" "}
                          {String(pageIndex * chunkSize + index + 1).padStart(
                            2,
                            "0"
                          )}
                        </p>
                        <h2 className="mt-3 font-serif text-2xl leading-tight">
                          {course.title}
                        </h2>
                        <p className="mt-3 text-xs leading-5 text-[#657084]">
                          {course.description}
                        </p>
                        <div className="mt-4 border-t border-[#16243d]/10 pt-4">
                          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                            {labels.outcomes}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#4a566a]">
                            {course.description}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                  {showWatermark && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden opacity-[.045] print:opacity-[.06]"
                    >
                      <span className="rotate-[-28deg] whitespace-nowrap text-6xl font-black tracking-[.18em] text-[#16243d]">
                        PROFOUND IQ
                      </span>
                    </div>
                  )}
                  <footer className="mt-10 flex justify-between border-t border-[#16243d]/15 pt-5 text-[10px] uppercase tracking-[.14em] text-[#657084]">
                    <span>
                      {PUBLISHED_SITE_ORIGIN.replace(/^https?:\/\//, "")} · Profound IQ Consulting
                    </span>
                    <span>
                      {labels.page} {pageIndex + 1} / {pages.length}
                    </span>
                  </footer>
                </section>
              ))}
              <nav
                className="mt-6 flex items-center justify-center gap-3 print:hidden"
                aria-label="Print pages"
              >
                <button
                  type="button"
                  onClick={() => setPrintPage(page => Math.max(1, page - 1))}
                  disabled={printPage === 1}
                  className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> {labels.previous}
                </button>
                <span className="text-xs font-bold text-[#657084]">
                  {labels.page} {printPage} / {pages.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPrintPage(page => Math.min(pages.length, page + 1))
                  }
                  disabled={printPage === pages.length}
                  className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
                >
                  {labels.next} <ChevronRight size={14} />
                </button>
              </nav>
            </>
          )}
          {saved.isLoading ? null : (
            <footer className="mt-10 border-t border-[#16243d]/15 pt-5 text-center text-[10px] uppercase tracking-[.14em] text-[#657084] print:hidden">
              {PUBLISHED_SITE_ORIGIN.replace(/^https?:\/\//, "")} · Profound IQ Consulting
            </footer>
          )}
        </section>
      </main>
    </>
  );
}
