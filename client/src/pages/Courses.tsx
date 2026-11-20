/* Profound IQ Consulting — Course Catalog redesigned for executive conversion */
import { useEffect, useMemo, useState } from "react";
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
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { COURSE_PRICE_KES } from "@shared/courseCatalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckoutForm } from "@/components/CheckoutForm";
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
const courseCategory = (course: Pick<CourseCard, "category">) => course.category;
const coverFallback = "/cover-people-practice_342ff6e3.svg";
const skillFallback = (slug: string): CourseCard["skillLevel"] =>
  /professional-certificate|mastering|lead|strategic|negotiation/.test(slug)
    ? "Advanced"
    : /essentials|personal-growth|growth-mindset|communication|confidence/.test(slug)
    ? "Foundation"
    : "Practitioner";

export default function Courses() {
  const [selectedCourse, setSelectedCourse] = useState<CourseCard | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All categories");
  const [skillLevel, setSkillLevel] = useState("All levels");
  const [sortBy, setSortBy] = useState("recommended");
  const [comparisonSlugs, setComparisonSlugs] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [careerGoal, setCareerGoal] = useState("ai");
  const [currentLevel, setCurrentLevel] = useState<CourseCard["skillLevel"]>("Foundation");
  const [recommendedCourses, setRecommendedCourses] = useState<CourseCard[]>([]);
  const [showRecommended, setShowRecommended] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const catalogList = trpc.course.catalogList.useQuery(undefined, { retry: false, refetchOnWindowFocus: true });
  const liveCatalog = trpc.catalog.listPublished.useQuery(undefined, { retry: false, refetchOnWindowFocus: true });

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
      audience: item.audience,
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
      return { ...course, ...overlay, modules: course.modules, isDatabaseItem: true };
    });
    return [...merged, ...Array.from(bySlug.values())] as CourseCard[];
  }, [catalogList.data, liveCatalog.data]);

  const categories = useMemo(() => [
    "All categories",
    ...Array.from(new Set(courses.map(courseCategory).map(v => v))),
  ], [courses]);
  const levels = useMemo(() => [
    "All levels",
    ...Array.from(new Set(courses.map(course => course.skillLevel))),
  ], [courses]);
  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return courses.filter(course =>
      (!query || `${course.title} ${course.strapline} ${course.description} ${course.outcomes.join(" ")} ${course.category} ${course.skillLevel}`.toLowerCase().includes(query)) &&
      (category === "All categories" || courseCategory(course) === category) &&
      (skillLevel === "All levels" || course.skillLevel === skillLevel)
    ).sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "price") return Number(a.price.replace(/[^0-9]/g, "")) - Number(b.price.replace(/[^0-9]/g, ""));
      if (sortBy === "level") return ["Foundation", "Practitioner", "Advanced"].indexOf(a.skillLevel) - ["Foundation", "Practitioner", "Advanced"].indexOf(b.skillLevel);
      return Number(a.index) - Number(b.index);
    });
  }, [courses, searchTerm, category, skillLevel, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = (params.get("compare") ?? "").split(",").filter(slug => courses.some(course => course.slug === slug)).slice(0, 3);
    if (shared.length) setComparisonSlugs(shared);
    if (params.get("recommend") === "1") setRecommendOpen(true);
    const slug = params.get("enroll");
    if (!slug || !courses.length || selectedCourse) return;
    const course = courses.find(item => item.slug === slug);
    if (course) { setSelectedCourse(course); window.history.replaceState({}, "", "/courses"); }
  }, [courses, selectedCourse]);

  useEffect(() => { setVisibleCount(6); }, [category, searchTerm, skillLevel, sortBy]);

  // Recommendation logic
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
    const scored = courses.map(course => {
      const text = `${course.title} ${course.strapline} ${course.description} ${course.outcomes.join(" ")}`.toLowerCase();
      const categoryScore = keywords.some(k => text.includes(k.toLowerCase())) ? 3 : 0;
      const courseLevelIndex = levelOrder.indexOf(course.skillLevel);
      const levelDistance = Math.abs(courseLevelIndex - userLevelIndex);
      const levelScore = levelDistance === 0 ? 3 : levelDistance === 1 ? 1 : 0;
      return { course, score: categoryScore + levelScore };
    }).sort((a, b) => b.score - a.score || Number(a.course.index) - Number(b.course.index)).slice(0, 3).map(({ course }) => course);
    setRecommendedCourses(scored);
  }, [careerGoal, currentLevel, showRecommended, courses]);

  const openCheckout = (course: CourseCard) => {
    setSelectedCourse(course);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (reference: string) => {
    setShowCheckout(false);
    setSelectedCourse(null);
    toast.success("Enrollment complete!", { description: "Access your course from the dashboard." });
  };

  const handleCompareToggle = (slug: string) => {
    setComparisonSlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev.slice(-2), slug]);
    if (!comparisonOpen) setComparisonOpen(true);
  };

  if (catalogList.isLoading || liveCatalog.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <TransformationNav active="courses" />
        <main className="container py-16">
          <div className="flex items-center gap-3 text-sm" role="status" aria-live="polite">
            <Loader2 size={16} className="animate-spin text-[var(--gold)]" /> Loading the current catalog…
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
      <TransformationNav active="courses" />

{/* Sticky Filters Header */}
      <header className="sticky top-16 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="mb-3 relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search courses, topics, or outcomes…"
              className="w-full h-10 pl-9 pr-4 border border-[var(--border)] bg-[var(--card)] text-sm focus-gold-ring rounded-xl"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap",
                    category === cat
                      ? "bg-[var(--gold)] text-[var(--navy-deep)] shadow"
                      : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Separator className="h-7 mx-1.5" />
            <div className="flex items-center gap-1.5">
              <Label htmlFor="skill-filter" className="sr-only">Skill level</Label>
              <select
                id="skill-filter"
                value={skillLevel}
                onChange={e => setSkillLevel(e.target.value)}
                className="h-9 px-3 border border-[var(--border)] bg-[var(--card)] text-xs focus-gold-ring rounded-lg min-w-[130px]"
              >
                {levels.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Label htmlFor="sort-filter" className="sr-only">Sort</Label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-9 px-3 border border-[var(--border)] bg-[var(--card)] text-xs focus-gold-ring rounded-lg min-w-[140px]"
              >
                <option value="recommended">Recommended</option>
                <option value="title">Title A–Z</option>
                <option value="level">Skill level</option>
                <option value="price">Price: low to high</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 lg:py-12">
        {/* Hero */}
        <section className="mb-12 text-center sm:mb-16">
          <p className="eyebrow text-[var(--gold)]">Course Catalog</p>
          <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight mt-3 sm:text-5xl lg:text-6xl text-[var(--navy-deep)]">
            Choose the capability you want to <span className="text-[var(--gold)]">build in practice</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-relaxed text-[var(--muted-foreground)]">
            Each course includes an applied curriculum, interactive lessons, repeatable practice, and a clear completion path.
          </p>
        </section>

        {/* Results Count */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            {filteredCourses.length === courses.length
              ? `Showing all ${courses.length} courses`
              : `Showing ${filteredCourses.length} of ${courses.length} courses${category !== "All categories" ? ` in ${category}` : ""}`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRecommendOpen(true)}
              className="gap-2"
            >
              <Sparkles size={14} /> Find my course
            </Button>
            {comparisonSlugs.length > 0 && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => setComparisonOpen(true)}
                className="gap-2"
              >
                <ChevronRight size={14} /> Compare ({comparisonSlugs.length})
              </Button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        <section aria-label="Course catalog">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-2xl">
              <Search size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
              <h3 className="text-display text-2xl text-[var(--foreground)]">No courses match your filters</h3>
              <p className="mt-2 text-[var(--muted-foreground)]">Try adjusting your search or filters</p>
              <Button variant="outline" size="lg" onClick={() => { setSearchTerm(""); setCategory("All categories"); setSkillLevel("All levels"); }} className="mt-4">
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.slice(0, visibleCount).map(course => (
                  <article
                    key={course.index}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:shadow-xl hover:border-[var(--gold)]/30"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                      <CourseCoverImage
                        src={course.coverImage || coverFallback}
                        slug={course.slug}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <Badge variant="subtle" className="text-xs">{course.format}</Badge>
                      <Badge variant="subtle" className="text-xs">{course.skillLevel}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--navy-deep)] mb-2">{course.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--muted-foreground)] line-clamp-2 mb-4">{course.strapline || course.body}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
                      <span className="text-xl font-bold text-[var(--gold)]">{course.price}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => openCheckout(course)}
                          className="flex-1"
                        >
                          <ArrowRight size={14} className="mr-1" />
                          Enroll
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompareToggle(course.slug)}
                          className={cn(
                            "flex-1",
                            comparisonSlugs.includes(course.slug)
                              ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                          )}
                          aria-pressed={comparisonSlugs.includes(course.slug)}
                        >
                          <ChevronRight size={14} className="mr-1" />
                          Compare
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {visibleCount < filteredCourses.length && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisibleCount(v => v + 6)}
                    className="border-2 border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy-deep)] w-full max-w-md"
                  >
                    Load more courses ({filteredCourses.length - visibleCount} remaining)
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Find My Course Modal */}
        {showRecommended && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--navy-deep)]/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="recommend-title">
            <div className="w-full max-w-2xl bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h2 id="recommend-title" className="text-display text-2xl font-semibold text-[var(--foreground)]">Find my course</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowRecommended(false)} aria-label="Close">
                  <X size={24} />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">What's your primary goal?</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { id: "ai", label: "AI & Data", icon: BrainCircuit },
                      { id: "leadership", label: "Leadership", icon: Users },
                      { id: "growth", label: "Growth & Strategy", icon: Target },
                      { id: "communication", label: "Communication", icon: MessageCircle },
                      { id: "finance", label: "Finance & Value", icon: BookOpen },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCareerGoal(opt.id)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all text-left",
                          careerGoal === opt.id
                            ? "border-[var(--gold)] bg-[var(--gold)]/10"
                            : "border-[var(--border)] hover:border-[var(--gold)]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <opt.icon size={20} className={cn(careerGoal === opt.id ? "text-[var(--gold)]" : "text-[var(--muted-foreground)]")} />
                          <span className="font-semibold text-[var(--foreground)]">{opt.label}</span>
                        </div>
                        {careerGoal === opt.id && (
                          <CheckCircle2 className="absolute top-2 right-2 text-[var(--gold)]" size={18} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">Current skill level</Label>
                  <div className="flex gap-2">
                    {["Foundation", "Practitioner", "Advanced"].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setCurrentLevel(level as CourseCard["skillLevel"])}
                        className={cn(
                          "flex-1 py-3 rounded-xl border-2 font-semibold transition-all",
                          currentLevel === level
                            ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                            : "border-[var(--border)] hover:border-[var(--gold)]"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <Button variant="gold" size="lg" className="w-full" onClick={() => { setShowRecommended(false); }}>
                  <Sparkles size={18} className="mr-2" />
                  Show my matches
                </Button>
              </div>
              {recommendedCourses.length > 0 && (
                <div className="p-6 border-t border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">Your top matches</p>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {recommendedCourses.map(course => (
                      <div key={course.index} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--muted)]/50">
                        <CourseCoverImage
                          src={course.coverImage || coverFallback}
                          slug={course.slug}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--foreground)] truncate">{course.title}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{course.skillLevel} · {course.format}</p>
                        </div>
                        <Button variant="gold" size="sm" onClick={() => { setShowRecommended(false); openCheckout(course); }}>
                          Enroll
                        </Button>
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
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--navy-deep)]/60 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="w-full max-w-4xl bg-[var(--card)] rounded-t-2xl border-t border-[var(--border)] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-display text-xl font-semibold text-[var(--foreground)]">Compare courses ({comparisonSlugs.length})</h3>
                <Button variant="ghost" size="icon" onClick={() => setComparisonOpen(false)} aria-label="Close">
                  <X size={24} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {comparisonSlugs.map(slug => {
                    const course = courses.find(c => c.slug === slug);
                    if (!course) return null;
                    return (
                      <Card key={slug} className="flex flex-col">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setComparisonSlugs(p => p.filter(s => s !== slug))} aria-label="Remove">
                              <X size={18} />
                            </Button>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)]">{course.strapline}</p>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="subtle">{course.skillLevel}</Badge>
                            <Badge variant="subtle">{course.format}</Badge>
                          </div>
                          <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                            {course.outcomes.slice(0, 3).map((outcome, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-[var(--success)]" />
                                {outcome}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between">
                            <span className="text-xl font-bold text-[var(--gold)]">{course.price}</span>
                            <Button variant="gold" size="sm" className="flex-1" onClick={() => { setComparisonOpen(false); openCheckout(course); }}>
                              Enroll
                            </Button>
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

        {/* Checkout Modal */}
        {showCheckout && selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--navy-deep)]/80 backdrop-blur-sm" role="dialog" aria-modal="true">
            <CheckoutForm
              product={{
                name: selectedCourse.title,
                priceKes: selectedCourse.isDatabaseItem ? COURSE_PRICE_KES : 4999,
                type: "course_stage",
                slug: selectedCourse.slug,
              }}
              prefilled={user ? { email: user.email || undefined, name: user.name || undefined } : undefined}
              upsells={[
                { id: "coaching", name: "1-on-1 Coaching Session", priceKes: 5000, description: "60-minute personalized debrief with a certified coach" },
                { id: "team", name: "Team License (5+ seats)", priceKes: 15000, description: "Group access with admin dashboard" },
              ]}
              onSuccess={handleCheckoutSuccess}
              onClose={() => { setShowCheckout(false); setSelectedCourse(null); }}
            />
          </div>
        )}
      </main>
    </div>
  );
}