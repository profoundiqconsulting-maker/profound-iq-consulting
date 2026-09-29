import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Share2, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";
import { CourseCoverImage } from "@/components/CourseCoverImage";
import { CourseShareActions } from "@/components/CourseShareActions";
import { courseCatalog } from "@shared/courseCatalog";



export default function CourseComparison() {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const valid = (params.get("compare") ?? "")
      .split(",")
      .filter(slug => courseCatalog.some(course => course.slug === slug))
      .slice(0, 3);
    setSelectedSlugs(valid);
  }, []);

  const selectedCourses = useMemo(
    () =>
      selectedSlugs
        .map(slug => courseCatalog.find(course => course.slug === slug))
        .filter(Boolean),
    [selectedSlugs]
  );
  const shareUrl = useMemo(
    () =>
      `${window.location.origin}/courses/compare?compare=${encodeURIComponent(selectedSlugs.join(","))}`,
    [selectedSlugs]
  );

  useEffect(() => {
    const titles = selectedCourses
      .map(course => course?.title)
      .filter(Boolean)
      .join(" vs ");
    const title = titles
      ? `${titles} | Course Comparison | Profound IQ Consulting`
      : "Course Comparison | Profound IQ Consulting";
    document.title = title;
    const description = selectedCourses.length
      ? `Compare ${titles} by outcomes, duration, delivery format, and staged investment.`
      : "Compare Profound IQ Consulting professional courses by outcomes, duration, and staged investment.";
    let meta = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
    const ogTitle = document.querySelector(
      'meta[property="og:title"]'
    ) as HTMLMetaElement | null;
    if (ogTitle) ogTitle.content = title;
    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    ) as HTMLMetaElement | null;
    if (ogDescription) ogDescription.content = description;
  }, [selectedCourses]);

  const removeCourse = (slug: string) => {
    const next = selectedSlugs.filter(item => item !== slug);
    setSelectedSlugs(next);
    const url = new URL(window.location.href);
    if (next.length) url.searchParams.set("compare", next.join(","));
    else url.searchParams.delete("compare");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const copyLink = async () => {
    if (!selectedCourses.length) {
      toast.info("Choose courses from the catalog first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Comparison link copied", {
        description: "Anyone with this link can open the same comparison.",
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy failed", {
        description: "Copy the URL from your browser address bar instead.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8]">
        <div className="container flex items-center justify-between py-5">
          <Link href="/" aria-label="Profound IQ Consulting home">
            <BrandLogo context="home" className="border border-[#c9a34e]/70" />
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-[#d8dfeb] hover:text-[#c9a34e]"
          >
            <ArrowLeft size={14} /> Back to courses
          </Link>
        </div>
      </header>
      <main>
        <section className="bg-[#101d35] px-5 pb-20 pt-14 text-[#f7f3e8] sm:px-10 lg:pb-24 lg:pt-20">
          <div className="container">
            <p className="eyebrow flex items-center gap-3 text-[#c9a34e]">
              <span className="h-px w-10 bg-[#c9a34e]" /> COURSE COMPARISON
            </p>
            <div className="mt-7 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <h1 className="display max-w-4xl text-5xl leading-[.95] sm:text-7xl">
                  Choose with{" "}
                  <em className="font-normal text-[#c9a34e]">confidence.</em>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#c1cad7]">
                  A focused view of the pathways you selected—so the next step
                  is grounded in outcomes, not guesswork.
                </p>
              </div>
              <CourseShareActions
                courseTitle={
                  selectedCourses
                    .map(course => course?.title)
                    .filter(Boolean)
                    .join(" vs ") || "Profound IQ course comparison"
                }
                shareUrl={shareUrl}
                shareLabel="Share comparison"
                pagePath="/courses/compare"
              />
            </div>
          </div>
        </section>
        <section className="container py-12 lg:py-20">
          {!selectedCourses.length ? (
            <div className="border-l-2 border-[#c9a34e] bg-white/60 p-8">
              <p className="eyebrow text-[#7d5e1e]">NO COURSES SELECTED</p>
              <h2 className="display mt-3 text-3xl">
                Build your comparison from the catalog.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#657084]">
                Select up to three courses on the catalog page, then use the
                comparison link to return here or share it with a colleague.
              </p>
              <Link
                href="/courses"
                className="mt-6 inline-flex items-center gap-2 border-b border-[#a27e2e] pb-1 text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]"
              >
                Explore courses <ArrowLeft className="rotate-180" size={14} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-[#7d5e1e]">
                    {selectedCourses.length} PATHWAY
                    {selectedCourses.length === 1 ? "" : "S"}
                  </p>
                  <h2 className="display mt-2 text-4xl">Your shortlist.</h2>
                </div>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="hidden items-center gap-2 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e] sm:inline-flex"
                >
                  <Copy size={14} /> Copy URL
                </button>
              </div>
              <div className="grid gap-5 lg:grid-cols-3">
                {selectedCourses.map(
                  course =>
                    course && (
                      <article
                        key={course.slug}
                        className="border border-[#16243d]/15 bg-white/70 shadow-sm"
                      >
                        <CourseCoverImage
                          src={course.coverImage}
                          slug={course.slug}
                          alt=""
                          title={course.title}
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[.1em]">
                                <span className="border border-[#16243d]/20 px-2 py-1 text-[#657084]">
                                  {course.category}
                                </span>
                                <span className="border border-[#c9a34e]/60 px-2 py-1 text-[#7d5e1e]">
                                  {course.skillLevel}
                                </span>
                              </div>
                              <h3 className="display mt-4 text-3xl leading-tight">
                                {course.title}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCourse(course.slug)}
                              aria-label={`Remove ${course.title}`}
                              className="text-[#657084] hover:text-[#7d5e1e]"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <dl className="mt-7 space-y-5 text-sm">
                            <div>
                              <dt className="text-[9px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                                Outcomes
                              </dt>
                              <dd className="mt-2 space-y-2">
                                {course.outcomes.map(outcome => (
                                  <p
                                    key={outcome}
                                    className="border-l border-[#c9a34e] pl-3 leading-5"
                                  >
                                    {outcome}
                                  </p>
                                ))}
                              </dd>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-[#16243d]/10 pt-5">
                              <div>
                                <dt className="text-[9px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                                  Duration
                                </dt>
                                <dd className="mt-1 leading-5">
                                  {course.duration}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[9px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                                  Investment
                                </dt>
                                <dd className="mt-1 leading-5">
                                  KES {course.priceKes.toLocaleString()}
                                </dd>
                              </div>
                            </div>
                          </dl>
                          <div className="mt-7 flex flex-col gap-3">
                            <Link
                              href={`/courses/${course.slug}?workspace=1`}
                              className="inline-flex items-center justify-center border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.13em] text-[#7d5e1e]"
                            >
                              View syllabus
                            </Link>
                            <Link
                              href={`/courses?enroll=${course.slug}`}
                              className="inline-flex items-center justify-center bg-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.13em] text-[#16243d]"
                            >
                              Start enrollment
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
