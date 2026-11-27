/* Profound IQ Consulting — Course Catalog, executive redesign.
 * Clean typography, generous whitespace, restrained palette,
 * semantic HTML, accessible navigation, responsive grid.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CourseEnrollmentForm } from "@/components/CourseEnrollmentForm";
import { TransformationNav } from "@/components/TransformationNav";
import { CourseCoverImage } from "@/components/CourseCoverImage";
import { cn } from "@/lib/utils";

type ModulePreview = { id: string; title: string; promise: string };
type CourseCard = {
  slug: string;
  index: string;
  title: string;
  strapline: string;
  description: string;
  audience: string;
  duration: string;
  outcomes: string[];
  modules: ModulePreview[];
  price: string;
  format: string;
  body: string;
  category: string;
  skillLevel: "Foundation" | "Practitioner" | "Advanced";
  coverImage: string;
  isDatabaseItem: boolean;
};
const courseCategory = (course: Pick<CourseCard, "category">) =>
  course.category;
const coverFallback = "/cover-people-practice_342ff6e3.svg";
const skillFallback = (slug: string): CourseCard["skillLevel"] =>
  /professional-certificate|mastering|lead|strategic|negotiation/.test(slug)
    ? "Advanced"
    : /essentials|personal-growth|growth-mindset|communication|confidence/.test(
          slug
        )
      ? "Foundation"
      : "Practitioner";

export default function Courses() {
  const reduceMotion = useReducedMotion();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All categories");
  const [skillLevel, setSkillLevel] = useState("All levels");
  const [sortBy, setSortBy] = useState("recommended");
  const [comparisonSlugs, setComparisonSlugs] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [careerGoal, setCareerGoal] = useState("ai");
  const [currentLevel, setCurrentLevel] =
    useState<CourseCard["skillLevel"]>("Foundation");
  const [recommendedCourses, setRecommendedCourses] = useState<CourseCard[]>(
    []
  );
  const [showRecommended, setShowRecommended] = useState(false);

  const catalogList = trpc.course.catalogList.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const liveCatalog = trpc.catalog.listPublished.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });

  const courses = useMemo<CourseCard[]>(() => {
    const baseCourses = (catalogList.data ?? []).map((course, index) => ({
      slug: course.slug,
      index: String(index + 1).padStart(2, "0"),
      title: course.title,
      strapline: course.strapline,
      description: course.description,
      audience: course.audience,
      duration: course.duration,
      outcomes: [...course.outcomes],
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        promise: module.promise,
      })),
      price: `KES ${course.priceKes.toLocaleString()}`,
      format: course.duration,
      body: course.description,
      category: course.category,
      skillLevel: skillFallback(course.slug),
      coverImage: course.coverImage,
      isDatabaseItem: false,
    }));
    const overlays = (liveCatalog.data ?? []).map(item => ({
      slug: item.slug,
      index: `D${String(item.id).padStart(2, "0")}`,
      title: item.title,
      strapline: item.strapline,
      description: item.description,
      audience: (item as any).audience ?? "",
      duration: item.duration,
      outcomes: item.outcomes,
      modules: [] as ModulePreview[],
      price: `KES ${item.priceKes.toLocaleString()}`,
      format: item.duration,
      body: item.description,
      isDatabaseItem: true,
      skillLevel: (item as any).skillLevel ?? "Practitioner",
      category: (item as any).category ?? "Professional development",
      coverImage: item.coverImageUrl ?? "",
    }));
    const bySlug = new Map(overlays.map(item => [item.slug, item]));
    const merged = baseCourses.map(course => {
      const overlay = bySlug.get(course.slug);
      if (!overlay) return course;
      bySlug.delete(course.slug);
      return {
        ...course,
        ...overlay,
        modules: course.modules,
        isDatabaseItem: true,
      };
    });
    return [...merged, ...Array.from(bySlug.values())] as CourseCard[];
  }, [catalogList.data, liveCatalog.data]);

  const categories = useMemo(
    () => [
      "All categories",
      ...Array.from(new Set(courses.map(courseCategory).map(v => v))),
    ],
    [courses]
  );
  const levels = useMemo(
    () => [
      "All levels",
      ...Array.from(new Set(courses.map(course => course.skillLevel))),
    ],
    [courses]
  );
  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return courses
      .filter(
        course =>
          (!query ||
            `${course.title} ${course.strapline} ${course.description} ${course.outcomes.join(" ")} ${course.category} ${course.skillLevel}`
              .toLowerCase()
              .includes(query)) &&
          (category === "All categories" ||
            courseCategory(course) === category) &&
          (skillLevel === "All levels" || course.skillLevel === skillLevel)
      )
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "price")
          return (
            Number(a.price.replace(/[^0-9]/g, "")) -
            Number(b.price.replace(/[^0-9]/g, ""))
          );
        if (sortBy === "level")
          return (
            ["Foundation", "Practitioner", "Advanced"].indexOf(a.skillLevel) -
            ["Foundation", "Practitioner", "Advanced"].indexOf(b.skillLevel)
          );
        return Number(a.index) - Number(b.index);
      });
  }, [courses, searchTerm, category, skillLevel, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = (params.get("compare") ?? "")
      .split(",")
      .filter(slug => courses.some(course => course.slug === slug))
      .slice(0, 3);
    if (shared.length) setComparisonSlugs(shared);
    if (params.get("recommend") === "1") setShowRecommended(true);
  }, [courses]);

  useEffect(() => {
    setVisibleCount(6);
  }, [category, searchTerm, skillLevel, sortBy]);

  const goalMap: Record<string, string[]> = {
    ai: ["AI", "Data", "Analytics", "Machine Learning", "Automation"],
    leadership: ["Lead", "Manage", "Strategy", "Executive", "Team"],
    growth: ["Growth", "Mindset", "Scale", "Expand", "Innovate"],
    communication: ["Communicate", "Present", "Write", "Speak", "Negotiate"],
    finance: ["Finance", "Budget", "Invest", "Model", "Value"],
  };
  useEffect(() => {
    if (!showRecommended) return;
    const keywords = goalMap[careerGoal] || [];
    const levelOrder = ["Foundation", "Practitioner", "Advanced"];
    const userLevelIndex = levelOrder.indexOf(currentLevel);
    const scored = courses
      .map(course => {
        const text =
          `${course.title} ${course.strapline} ${course.description} ${course.outcomes.join(" ")}`.toLowerCase();
        const categoryScore = keywords.some(k => text.includes(k.toLowerCase()))
          ? 3
          : 0;
        const courseLevelIndex = levelOrder.indexOf(course.skillLevel);
        const levelDistance = Math.abs(courseLevelIndex - userLevelIndex);
        const levelScore =
          levelDistance === 0 ? 3 : levelDistance === 1 ? 1 : 0;
        return { course, score: categoryScore + levelScore };
      })
      .sort(
        (a, b) =>
          b.score - a.score || Number(a.course.index) - Number(b.course.index)
      )
      .slice(0, 3)
      .map(({ course }) => course);
    setRecommendedCourses(scored);
  }, [careerGoal, currentLevel, showRecommended, courses]);

  const handleCompareToggle = (slug: string) => {
    setComparisonSlugs(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev.slice(-2), slug]
    );
    if (!comparisonOpen) setComparisonOpen(true);
  };

  if (catalogList.isLoading || liveCatalog.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] font-body">
        <TransformationNav active="courses" />
        <main className="container py-20">
          <div
            className="flex items-center gap-3 text-sm"
            role="status"
            aria-live="polite"
          >
            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />{" "}
            Loading the current catalog…
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4ee] font-body text-[#16243d]">
      <TransformationNav active="courses" />

      <main>
        <section
          className="relative overflow-hidden bg-[#10213b] text-white"
          aria-labelledby="courses-hero-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at 82% 18%, rgba(211,174,92,.35), transparent 22%), radial-gradient(circle at 8% 100%, rgba(255,255,255,.1), transparent 20%)",
            }}
          />
          <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_.85fr] lg:px-12 lg:py-24">
            <div className="max-w-3xl">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#d5b45f]">
                Professional courses
              </p>
              <h1
                id="courses-hero-heading"
                className="font-display text-[clamp(2.8rem,6.6vw,5.6rem)] leading-[0.98] tracking-[-0.045em]"
              >
                Make your next move{" "}
                <span className="text-[#d5b45f]">a skilled one.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Practical learning for the moments that matter at work. Find a
                course, practise the capability, and put it to use.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  className="h-12 bg-[#d5b45f] px-6 text-[#10213b] hover:bg-[#e3c778]"
                >
                  <a href="#course-catalog">
                    Browse the catalogue
                    <ArrowRight size={17} />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  onClick={() => setShowRecommended(true)}
                  className="h-12 border-white/25 bg-transparent px-6 text-white hover:border-[#d5b45f] hover:bg-white/5 hover:text-[#d5b45f]"
                >
                  <Sparkles size={16} />
                  Find my course
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[450px]">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-[#d5b45f]/30" />
              <div className="relative border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8">
                <div className="flex items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                      Explore the catalogue
                    </p>
                    <p className="mt-2 font-display text-5xl text-[#d5b45f]">
                      {courses.length}
                    </p>
                    <p className="mt-1 text-sm text-white/70">courses to explore</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d5b45f]/40 bg-[#d5b45f]/10 text-[#d5b45f]">
                    <BookOpen size={25} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-4 pt-6">
                  {[
                    "Applied lessons",
                    "Guided practice",
                    "Clear skill levels",
                    "Completion certificates",
                  ].map(item => (
                    <p
                      key={item}
                      className="flex items-start gap-2 text-xs leading-5 text-white/75"
                    >
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-[#d5b45f]"
                      />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="course-catalog"
          className="scroll-mt-24 px-5 py-12 sm:px-8 lg:px-12 lg:py-16"
          aria-label="Course catalog"
        >
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-8 max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
                Find your focus
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                Learning for what comes next.
              </h2>
            </div>

            <div className="border border-[#16243d]/10 bg-white p-4 shadow-[0_12px_36px_rgba(22,36,61,.045)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative w-full lg:max-w-md">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    id="course-search"
                    name="course-search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search courses, topics, or outcomes"
                    className="h-12 w-full rounded-none border border-[#16243d]/15 bg-[#fbfaf7] pl-11 pr-4 text-sm text-[#16243d] placeholder:text-[var(--fg-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/15"
                  />
                </div>
                <div className="flex flex-wrap gap-3 lg:ml-auto">
                  <div>
                    <Label htmlFor="skill-filter" className="sr-only">
                      Skill level
                    </Label>
                    <select
                      id="skill-filter"
                      value={skillLevel}
                      onChange={e => setSkillLevel(e.target.value)}
                      className="h-12 min-w-[150px] border border-[#16243d]/15 bg-white px-3 text-sm text-[#16243d] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sort-filter" className="sr-only">
                      Sort courses
                    </Label>
                    <select
                      id="sort-filter"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="h-12 min-w-[175px] border border-[#16243d]/15 bg-white px-3 text-sm text-[#16243d] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                    >
                      <option value="recommended">Recommended order</option>
                      <option value="title">Title A–Z</option>
                      <option value="level">Skill level</option>
                      <option value="price">Price: low to high</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-[#16243d]/10 pt-4">
                <div
                  className="flex gap-2 overflow-x-auto pb-1"
                  role="group"
                  aria-label="Category filters"
                >
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={category === cat}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                        category === cat
                          ? "border-[#16243d] bg-[#16243d] text-white"
                          : "border-[#16243d]/15 bg-white text-[var(--fg-muted)] hover:border-[var(--brand)] hover:text-[#16243d]"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#16243d]">
                  {filteredCourses.length === courses.length
                    ? `All ${courses.length} courses`
                    : `${filteredCourses.length} of ${courses.length} courses`}
                </p>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  {category !== "All categories"
                    ? category
                    : searchTerm || skillLevel !== "All levels"
                      ? "Filtered results"
                      : "Browse the complete professional learning catalogue"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecommended(true)}
                  className="gap-2 border-[#16243d]/15 text-[#16243d] hover:border-[var(--brand)] hover:text-[#80621f]"
                >
                  <Sparkles size={14} />
                  Find my course
                </Button>
                {comparisonSlugs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setComparisonOpen(true)}
                    className="gap-2 border-[var(--brand)]/60 text-[#80621f]"
                  >
                    <ChevronRight size={14} />
                    Compare ({comparisonSlugs.length})
                  </Button>
                )}
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="border border-dashed border-[#16243d]/20 bg-white px-6 py-16 text-center">
                <Search size={36} className="mx-auto mb-5 text-[var(--brand)]" />
                <h3 className="font-display text-2xl text-[#16243d]">
                  No courses match those filters
                </h3>
                <p className="mt-2 text-sm text-[var(--fg-muted)]">
                  Try a different topic or clear your filters.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-[#16243d]/20"
                  onClick={() => {
                    setSearchTerm("");
                    setCategory("All categories");
                    setSkillLevel("All levels");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredCourses.slice(0, visibleCount).map((course, i) => (
                    <motion.article
                      key={course.index}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.4,
                        ease: "easeOut",
                        delay: reduceMotion ? 0 : Math.min(i, 6) * 0.04,
                      }}
                      whileHover={
                        reduceMotion ? undefined : { y: -4 }
                      }
                      className="group flex flex-col border border-[#16243d]/10 bg-white p-3 transition-[border-color,box-shadow] hover:border-[var(--brand)]/45 hover:shadow-[0_18px_42px_rgba(22,36,61,.09)] sm:p-4"
                    >
                      <a
                        href={`/courses/${course.slug}`}
                        className="relative block aspect-[1.7] overflow-hidden bg-[#eeece5]"
                        aria-label={`View ${course.title} course`}
                      >
                        <CourseCoverImage
                          src={course.coverImage || coverFallback}
                          slug={course.slug}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          width={640}
                          height={360}
                        />
                        <span className="absolute left-3 top-3 border border-white/60 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#16243d] backdrop-blur">
                          {course.category}
                        </span>
                      </a>

                      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="subtle"
                            className="rounded-full text-[10px]"
                          >
                            {course.skillLevel}
                          </Badge>
                          <span className="text-xs text-[var(--fg-muted)]">
                            {course.format}
                          </span>
                        </div>
                        <h3 className="mt-4 font-display text-[1.55rem] leading-tight tracking-[-0.02em] text-[#16243d]">
                          <a
                            href={`/courses/${course.slug}`}
                            className="hover:text-[#80621f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                          >
                            {course.title}
                          </a>
                        </h3>
                        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[var(--fg-muted)]">
                          {course.strapline || course.body}
                        </p>
                        {course.outcomes[0] && (
                          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#4f596c]">
                            <CheckCircle2
                              size={15}
                              className="mt-0.5 shrink-0 text-[var(--brand)]"
                            />
                            <span className="line-clamp-2">
                              {course.outcomes[0]}
                            </span>
                          </p>
                        )}
                        <div className="mt-auto pt-6">
                          <div className="flex items-end justify-between gap-3 border-t border-[#16243d]/10 pt-4">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                                Course fee
                              </p>
                              <p className="mt-1 text-lg font-bold text-[#16243d]">
                                {course.price}
                              </p>
                            </div>
                            {course.modules.length > 0 && (
                              <p className="text-right text-[11px] text-[var(--fg-muted)]">
                                {course.modules.length} modules
                              </p>
                            )}
                          </div>
                          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <CourseEnrollmentForm
                              courseSlug={course.slug}
                              className="mt-0 h-10 w-full px-3 !whitespace-nowrap !text-xs !leading-none !tracking-normal"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="default"
                              onClick={() => handleCompareToggle(course.slug)}
                              aria-pressed={comparisonSlugs.includes(course.slug)}
                              aria-label={`${comparisonSlugs.includes(course.slug) ? "Remove from" : "Add to"} course comparison: ${course.title}`}
                              className={cn(
                                "h-10 w-full justify-center border-[#16243d]/15 px-3 !whitespace-nowrap !text-xs !leading-none hover:border-[var(--brand)] hover:text-[#80621f] sm:w-auto",
                                comparisonSlugs.includes(course.slug) &&
                                  "border-[var(--brand)] bg-[#f3eedf] text-[#80621f]"
                              )}
                            >
                              <ChevronRight size={15} />
                              Compare
                            </Button>
                          </div>
                          <a
                            href={`/courses/${course.slug}`}
                            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#80621f] hover:text-[#16243d]"
                          >
                            Course details
                            <ArrowRight size={13} />
                          </a>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {visibleCount < filteredCourses.length && (
                  <div className="mt-10 text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setVisibleCount(v => v + 6)}
                      className="w-full border-[#16243d]/20 bg-white text-[#16243d] hover:border-[var(--brand)] hover:text-[#80621f] sm:w-auto sm:min-w-72"
                    >
                      Show more courses
                      <span className="ml-1 text-xs text-[var(--fg-muted)]">
                        ({filteredCourses.length - visibleCount} remaining)
                      </span>
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Find My Course Modal */}
        {showRecommended && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--brand)]/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recommend-title"
            onClick={() => setShowRecommended(false)}
          >
            <div
              className="w-full max-w-2xl bg-[var(--card)] rounded-2xl border border-[var(--popover-border)] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[var(--popover-border)] flex items-center justify-between">
                <h2
                  id="recommend-title"
                  className="heading-3 text-[var(--fg)]"
                >
                  Find my course
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRecommended(false)}
                  aria-label="Close"
                >
                  <X size={24} />
                </Button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <Label className="text-sm font-bold text-[var(--fg)] mb-3 block">
                    What&rsquo;s your primary goal?
                  </Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { id: "ai", label: "AI & Data", icon: BrainCircuit },
                      { id: "leadership", label: "Leadership", icon: Users },
                      {
                        id: "growth",
                        label: "Growth & Strategy",
                        icon: Target,
                      },
                      {
                        id: "communication",
                        label: "Communication",
                        icon: MessageCircle,
                      },
                      {
                        id: "finance",
                        label: "Finance & Value",
                        icon: BookOpen,
                      },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCareerGoal(opt.id)}
                        className={cn(
                          "relative p-4 rounded-xl border transition-all text-left",
                          careerGoal === opt.id
                            ? "border-[var(--brand)] bg-[var(--brand-muted)]"
                            : "border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--bg-sunken)]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <opt.icon
                            size={20}
                            className={cn(
                              careerGoal === opt.id
                                ? "text-[var(--brand)]"
                                : "text-[var(--fg-muted)]"
                            )}
                          />
                          <span className="font-semibold text-[var(--fg)]">
                            {opt.label}
                          </span>
                        </div>
                        {careerGoal === opt.id && (
                          <CheckCircle2
                            className="absolute top-3 right-3 text-[var(--brand)]"
                            size={18}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-bold text-[var(--fg)] mb-3 block">
                    Current skill level
                  </Label>
                  <div className="flex gap-2">
                    {["Foundation", "Practitioner", "Advanced"].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setCurrentLevel(level as CourseCard["skillLevel"])
                        }
                        className={cn(
                          "flex-1 py-3 rounded-xl border transition-all font-bold",
                          currentLevel === level
                            ? "border-[var(--brand)] bg-[var(--brand-muted)] text-[var(--brand)]"
                            : "border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--bg-sunken)]"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setShowRecommended(false);
                  }}
                >
                  <Sparkles size={18} className="mr-2" />
                  Show my matches
                </Button>
              </div>
              {recommendedCourses.length > 0 && (
                <div className="p-6 border-t border-[var(--popover-border)]">
                  <p className="text-sm font-bold text-[var(--fg-muted)] mb-4">
                    Your top matches
                  </p>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {recommendedCourses.map(course => (
                      <div
                        key={course.index}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-sunken)]/50"
                      >
                        <CourseCoverImage
                          src={course.coverImage || coverFallback}
                          slug={course.slug}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          width={64}
                          height={64}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--fg)] truncate">
                            {course.title}
                          </p>
                          <p className="text-sm text-[var(--fg-muted)]">
                            {course.skillLevel} &middot; {course.format}
                          </p>
                        </div>
                        <CourseEnrollmentForm
                          courseSlug={course.slug}
                          className="mt-0 shrink-0 !whitespace-nowrap !text-xs !leading-none !tracking-normal"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison Drawer */}
        {comparisonOpen && comparisonSlugs.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--brand)]/10"
            role="dialog"
            aria-modal="true"
            onClick={() => setComparisonOpen(false)}
          >
            <div
              className="w-full max-w-4xl bg-[var(--card)] rounded-t-2xl border-t border-[var(--popover-border)] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-[var(--popover-border)] flex items-center justify-between">
                <h3 className="heading-3 text-[var(--fg)]">
                  Compare courses ({comparisonSlugs.length})
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setComparisonOpen(false)}
                  aria-label="Close"
                >
                  <X size={24} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {comparisonSlugs.map(slug => {
                    const course = courses.find(c => c.slug === slug);
                    if (!course) return null;
                    return (
                      <Card key={slug} className="flex flex-col border-[var(--card-border)] hover:border-[var(--brand)]/40 transition-colors">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {course.title}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setComparisonSlugs(p =>
                                  p.filter(s => s !== slug)
                                )
                              }
                              aria-label="Remove"
                            >
                              <X size={18} />
                            </Button>
                          </div>
                          <p className="text-sm text-[var(--fg-muted)]">
                            {course.strapline}
                          </p>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col space-y-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="subtle">{course.skillLevel}</Badge>
                            <Badge variant="subtle">{course.format}</Badge>
                          </div>
                          <ul className="text-sm text-[var(--fg-muted)] space-y-2">
                            {course.outcomes.slice(0, 3).map((outcome, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2
                                  size={14}
                                  className="text-[var(--success)]"
                                />
                                {outcome}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-auto flex flex-col gap-3 border-t border-[var(--card-border)] pt-4">
                            <span className="text-xl font-bold text-[var(--brand)]">
                              {course.price}
                            </span>
                            <CourseEnrollmentForm
                              courseSlug={course.slug}
                              className="mt-0 h-10 w-full px-3 !whitespace-nowrap !text-xs !leading-none !tracking-normal"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
