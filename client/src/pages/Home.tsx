/* Profound IQ Consulting — Modern Executive Landing Page. Clean, professional, elegant with enhanced UX/UI. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Vote,
  X,
  Award,
  Users,
  BookOpen,
  BrainCircuit,
  BarChart3,
  GraduationCap,
  School,
  Briefcase,
  Quote,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialMediaIcons";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteNavigation } from "@/components/SiteNavigation";
import { CourseShareActions } from "@/components/CourseShareActions";
import { ScrollReveal, ScrollRevealGroup } from "@/components/ScrollReveal";
import { trpc } from "@/lib/trpc";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { ASSESSMENT_PRICE_KES } from "@shared/assessment";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

const services = [
  {
    index: "01",
    title: "Educational consulting",
    body: "Make better learning decisions with a clearer view of goals, pathways, and the environment required for meaningful progress.",
    tag: "Direction",
    href: "/services",
    icon: BookOpen,
  },
  {
    index: "02",
    title: "Professional courses",
    body: "Build practical capability across leadership, strategic growth, and the professional habits that turn knowledge into momentum.",
    tag: "Development",
    href: "/courses",
    icon: Award,
  },
  {
    index: "03",
    title: "Psychometric testing",
    body: "See the patterns beneath performance. Use structured insight to support self-awareness, fit, and confident next steps.",
    tag: "Insight",
    href: "/psychometrics",
    icon: BarChart3,
  },
  {
    index: "04",
    title: "Research surveys",
    body: "Turn questions into evidence with focused surveys that help institutions and teams listen, learn, and act with precision.",
    tag: "Evidence",
    href: "/surveys",
    icon: Mail,
  },
];

const stats = [
  { value: "10k+", label: "Assessments completed" },
  { value: "500+", label: "Organizations served" },
  { value: "50+", label: "Professional courses" },
  { value: "98%", label: "Client satisfaction" },
];

const testimonials = [
  {
    quote:
      "The psychometric profile gave our leadership team a shared vocabulary for development conversations we had been avoiding for years.",
    author: "Margaret Kim",
    role: "Director of Learning & Development, Kenya",
    metric: "40% faster succession planning",
  },
  {
    quote:
      "Profund IQ's framework transformed how we approach professional development across 12 campuses. The insights were precise and immediately actionable.",
    author: "James Ochieng",
    role: "Academic Director, CBE Institution",
    metric: "92% program completion rate",
  },
  {
    quote:
      "The assessment insights surfaced blind spots we didn't know we had. Our team's performance improved within the first quarter.",
    author: "Sarah Wanjiku",
    role: "Operations Lead, Nairobi",
    metric: "31% productivity gain",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Profound IQ Consulting",
  description:
    "Transformational learning, educational consulting, psychometric testing, research surveys, and professional courses.",
  url: PUBLISHED_SITE_ORIGIN,
  address: { "@type": "PostalAddress", addressLocality: "Online" },
  email: "admin@profoundiqconsulting.com",
  telephone: "+254727374055",
  openingHours: "Mo-Sa 09:00-17:00",
  priceRange: "KES 10,000–20,000",
  sameAs: [
    "https://www.facebook.com/profoundIQ",
    "https://x.com/ProfoundIQC",
    "https://linkedin.com/company/profoundiqconsulting",
    "https://www.instagram.com/profoundiqconsulting/",
  ],
  areaServed: "Worldwide",
};

export default function Home() {
  const [sent, setSent] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [mathA, setMathA] = useState(() => Math.floor(Math.random() * 9) + 2);
  const [mathB, setMathB] = useState(() => Math.floor(Math.random() * 9) + 2);
  const [catalogLevel, setCatalogLevel] = useState<string>("All levels");
  const [catalogCategory, setCatalogCategory] =
    useState<string>("All categories");
  const [catalogPage, setCatalogPage] = useState(1);
  const CATALOG_PAGE_SIZE = 6;
  const [selectedCourse, setSelectedCourse] = useState<
    (typeof courses)[number] | null
  >(null);
  const [enrollmentSubmitted, setEnrollmentSubmitted] = useState(false);
  const [visibleResourceCount, setVisibleResourceCount] = useState(3);
  const [visibleSurveyCount, setVisibleSurveyCount] = useState(3);
  const HOME_PREVIEW_COUNT = 3;
  const enrollmentTriggerRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const enrollmentDialogRef = useRef<HTMLDivElement>(null);
  const enrollment = trpc.enrollment.create.useMutation();
  const inquiry = trpc.inquiry.create.useMutation();
  const { user, isAuthenticated } = useAuth();
  const catalogList = trpc.course.catalogList.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const liveCatalog = trpc.catalog.listPublished.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const publishedResources = trpc.resources.listPublished.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const activeSurveys = trpc.resources.activeSurveys.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const courses = useMemo(() => {
    const baseCourses = (catalogList.data ?? []).map(course => ({
      ...course,
      price: `KES ${course.priceKes.toLocaleString()}`,
      format: course.duration,
      body: course.description,
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
      modules: [] as never[],
      price: `KES ${item.priceKes.toLocaleString()}`,
      format: item.duration,
      body: item.description,
      isDatabaseItem: true,
      skillLevel: (item as any).skillLevel ?? "Practitioner",
      category: (item as any).category ?? "Professional development",
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
    return [
      ...merged,
      ...Array.from(bySlug.values()),
    ] as (typeof baseCourses)[number][];
  }, [catalogList.data, liveCatalog.data]);

  const uniqueLevels = Array.from(
    new Set(courses.map(course => course.skillLevel).filter(Boolean))
  );
  const uniqueCategories = Array.from(
    new Set(courses.map(course => course.category).filter(Boolean))
  ).sort();
  const filteredCatalog = courses.filter(course => {
    if (catalogLevel !== "All levels" && course.skillLevel !== catalogLevel)
      return false;
    if (
      catalogCategory !== "All categories" &&
      course.category !== catalogCategory
    )
      return false;
    return true;
  });
  const catalogPageCount = Math.max(
    1,
    Math.ceil(filteredCatalog.length / CATALOG_PAGE_SIZE)
  );
  const pagedCatalog = filteredCatalog.slice(
    0,
    catalogPage * CATALOG_PAGE_SIZE
  );

  const displayResources = useMemo(() => {
    const data = (publishedResources.data ?? [])
      .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder);
    return data.slice(0, visibleResourceCount);
  }, [publishedResources.data, visibleResourceCount]);

  const displaySurveys = useMemo(() => {
    const data = (activeSurveys.data ?? []).filter(
      survey => survey.status === "published"
    );
    return data.slice(0, visibleSurveyCount);
  }, [activeSurveys.data, visibleSurveyCount]);

  const renderResourcePreview = (resource: {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    fileUrl?: string | null;
  }) => (
    <article className="flex h-full flex-col justify-between border border-[#16243d]/10 bg-white p-6 transition-all hover:border-[#c9a34e] hover:shadow-lg">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[.16em] text-[#7d5e1e]">
          {resource.category}
        </span>
        <h3 className="mt-3 text-lg font-semibold leading-tight text-[#16243d]">
          {resource.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {resource.description}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#16243d]">
          {(resource.price ?? 0) === 0
            ? "Free"
            : `${resource.currency ?? "KES"} ${(resource.price ?? 0).toLocaleString()}`}
        </span>
        <a
          href={resource.fileUrl || "/resources"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white transition-all hover:bg-[#0f172a]"
        >
          {(resource.price ?? 0) === 0 ? "Download" : "View"}
          <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );

  const renderSurveyPreview = (survey: {
    id: number;
    title: string;
    description: string;
    type: string;
    totalResponses: number;
  }) => (
    <article className="flex h-full flex-col justify-between border border-[#16243d]/10 bg-white p-6 transition-all hover:border-[#c9a34e] hover:shadow-lg">
      <div>
        <span className="inline-flex rounded-full bg-[#c9a34e]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
          {survey.type}
        </span>
        <h3 className="mt-3 text-lg font-semibold leading-tight text-[#16243d]">
          {survey.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {survey.description}
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {survey.totalResponses} response{survey.totalResponses === 1 ? "" : "s"}
        </span>
        <a
          href="/surveys"
          className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white transition-all hover:bg-[#0f172a]"
        >
          Participate <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );

  useEffect(() => {
    setCatalogPage(1);
  }, [catalogLevel, catalogCategory]);

  useEffect(() => {
    if (!selectedCourse) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        enrollmentTriggerRef.current?.focus();
        setSelectedCourse(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    enrollmentDialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedCourse]);

  const openEnrollment = (course: (typeof courses)[number], element: HTMLButtonElement | HTMLAnchorElement | null = null) => {
    setEnrollmentSubmitted(false);
    enrollmentTriggerRef.current = element;
    setSelectedCourse(course);
  };

  const submitEnrollment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourse) return;
    const form = new FormData(event.currentTarget);
    enrollment.mutate(
      {
        courseTitle: String(form.get("courseTitle")),
        name: String(form.get("enrollment-name")),
        email: String(form.get("enrollment-email")),
        consent: true,
      },
      { onSuccess: () => setEnrollmentSubmitted(true) }
    );
  };

  const submitInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(false);
    setInquiryError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    inquiry.mutate(
      {
        name: String(form.get("name")),
        email: String(form.get("email")),
        category: String(form.get("category")) as
          | "professional-courses"
          | "educational-consulting"
          | "psychometric-testing"
          | "research-surveys"
          | "organizational-development"
          | "general",
        message: String(form.get("message")),
        mathA,
        mathB,
        mathAnswer: Number(form.get("mathAnswer")),
      },
      {
        onSuccess: () => {
          setSent(true);
          formElement.reset();
          setMathA(Math.floor(Math.random() * 9) + 2);
          setMathB(Math.floor(Math.random() * 9) + 2);
        },
        onError: error =>
          setInquiryError(
            error.message || "We could not send your inquiry. Please try again."
          ),
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <SiteNavigation variant="home" dark />

      <main id="top">
        {/* Modern Hero Section */}
        <section className="relative overflow-hidden bg-[#101d35] text-[#f7f3e8]">
          <div className="absolute inset-0 bg-[url('/profound-hero-f95a7f36_76e0eb6f.svg')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101d35]/90 via-[#101d35]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101d35]/50 to-transparent" />

<div className="container relative px-6 py-14 sm:px-8 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a34e]/60 bg-[#c9a34e]/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9a34e]">
                  <Sparkles size={12} />
                  Executive Assessment & Development
                </div>

                <h1 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                  Turn potential into{" "}
                  <span className="text-[#c9a34e]">measurable impact</span>
                </h1>

                <p className="mt-4 text-base leading-relaxed text-[#e5eaf5] lg:text-lg">
                  Profound IQ Consulting equips professionals, educators, and
                  organizations with evidence-based assessment frameworks and
                  practical development pathways — so you can lead with
                  confidence and measure what matters.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/assessment"
                    className="group inline-flex items-center gap-2 rounded-lg bg-[#c9a34e] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#101d35] shadow-lg shadow-[#c9a34e]/25 transition-all hover:gap-3 hover:shadow-xl hover:shadow-[#c9a34e]/40"
                  >
                    Take the KES {ASSESSMENT_PRICE_KES} assessment
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </a>
                  <a
                    href="#offerings"
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-[#f7f3e8] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f7f3e8] transition-all hover:border-[#c9a34e] hover:text-[#8b6914]"
                  >
                    Explore services
                    <ArrowDownRight size={16} />
                  </a>
                  <a
                    href="/courses"
                    className="group inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f7f3e8] shadow-lg shadow-[#16243d]/25 transition-all hover:gap-3 hover:shadow-xl hover:shadow-[#16243d]/40"
                  >
                    Enroll for courses
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </a>
                </div>

                <div className="mt-8 flex items-center gap-6 text-sm text-[#e5eaf5]">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-[#101d35] bg-gradient-to-br from-[#16243d] to-[#101d35]"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-[#f7f3e8]">
                      Trusted by 500+ organizations
                    </p>
                    <p className="text-xs text-[#d7deea]">Across Kenya and beyond</p>
                  </div>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative rounded-3xl border border-[#c9a34e]/40 bg-[#0b1326]/60 p-8 backdrop-blur-md shadow-2xl shadow-[#c9a34e]/10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div className="w-full flex justify-end lg:justify-start gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#c9a34e]/40 text-[10px] font-bold uppercase tracking-wider text-[#c9a34e]">
                        Since 2019
                      </span>
                    </div>
                    <div className="text-right lg:text-left">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#d7deea]/70">
                        profound iq consulting
                      </p>
                      <p className="text-sm font-bold text-[#f7f3e8]">
                        Executive Assessment & Development
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: Award, title: "Professional Courses", value: "50+ programs" },
                      { icon: BarChart3, title: "Psychometric Testing", value: "Evidence-based" },
                      { icon: Users, title: "1-on-1 Coaching", value: "Personalized" },
                    ].map(({ icon: Icon, title, value }) => (
                      <div
                        key={title}
                        className="flex items-center gap-3 rounded-xl border border-[#c9a34e]/30 bg-[#101d35]/40 p-4 hover:border-[#c9a34e]/60 transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a34e]/20">
                          <Icon className="h-5 w-5 text-[#c9a34e]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#f7f3e8]">{title}</p>
                          <p className="text-xs text-[#c9a34e]">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#c9a34e]/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#f7f3e8]">Client satisfaction</p>
                      <p className="text-xs font-bold text-[#c9a34e]">98%</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#c9a34e]/20 overflow-hidden">
                      <div className="h-full bg-[#c9a34e] w-[98%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-12 grid grid-cols-2 gap-6 border-t-2 border-[#f7f3e8]/20 pt-8 sm:mt-14 sm:gap-8 sm:pt-10 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-[#c9a34e] sm:text-3xl lg:text-4xl xl:text-5xl">
                      {stat.value}
                    </div>
                    <div className="mt-1.5 text-fluid-xs text-[#d7deea] sm:text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </section>

        {/* Audience Pathways */}
        <section className="section-py bg-white">
          <div className="container px-6 lg:px-8">
            <div className="mb-10 text-center sm:mb-12">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                Choose Your Path
              </p>
              <h2 className="heading-clamp mt-3 font-bold tracking-tight text-[#16243d]">
                Where are you starting from?
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-fluid-base text-muted-foreground">
                Three clear paths to help you find the right tools, courses, and support for your goals.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* CBE Learners */}
              <a
                href="/careerpath"
                className="group relative overflow-hidden rounded-2xl border-2 border-[#16243d]/10 bg-gradient-to-br from-[#16243d] to-[#101d35] p-8 text-[#f7f3e8] shadow-lg transition-all hover:shadow-xl hover:border-[#c9a34e]"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#c9a34e]/20 blur-2xl" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a34e] text-[#101d35]">
                    <GraduationCap size={24} />
                  </div>
                  <span className="inline-block rounded-full bg-[#c9a34e]/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#c9a34e]">
                    CBE Learners
                  </span>
                  <h3 className="mt-3 text-2xl font-bold">CareerPath</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#c1cad7]">
                    Competency Based Education learners get clear pathway mapping,
                    talent-fit assessment, and coaching-ready results.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#c9a34e]">
                    Explore CareerPath
                    <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </a>

              {/* Schools */}
              <a
                href="/school-solutions"
                className="group relative overflow-hidden rounded-2xl border-2 border-[#16243d]/10 bg-gradient-to-br from-[#c9a34e] to-[#d4b45a] p-8 text-[#16243d] shadow-lg transition-all hover:shadow-xl hover:border-[#16243d]"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#16243d]/10 blur-2xl" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#16243d] text-[#f7f3e8]">
                    <School size={24} />
                  </div>
                  <span className="inline-block rounded-full bg-[#16243d]/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
                    Schools
                  </span>
                  <h3 className="mt-3 text-2xl font-bold">School Solutions</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#3d4a6b]">
                    Institutions get structured programs, psychometric testing,
                    research surveys, and consulting at scale.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#16243d]">
                    Explore School Solutions
                    <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </a>

              {/* Professionals */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#16243d]/10 bg-gradient-to-br from-[#f7f3e8] to-white p-8 text-[#16243d] shadow-lg">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#c9a34e]/15 blur-2xl" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#16243d] text-[#f7f3e8]">
                    <Briefcase size={24} />
                  </div>
                  <span className="inline-block rounded-full bg-[#16243d]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
                    Professionals
                  </span>
                  <h3 className="mt-3 text-2xl font-bold">Self Assessment</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#3d4a6b]">
                    Evidence-based psychometric profiles, professional courses,
                    and practical development insights for career acceleration.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <a
                      href="/assessment"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#0f172a]"
                    >
                      <BrainCircuit size={14} /> Self Assessment
                    </a>
                    <a
                      href="/courses"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#16243d]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#16243d] transition-all hover:border-[#c9a34e] hover:text-[#8b6914]"
                    >
                      <BookOpen size={14} /> Courses
                    </a>
                    <a
                      href="/psychometrics"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#16243d]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#16243d] transition-all hover:border-[#c9a34e] hover:text-[#8b6914]"
                    >
                      <BarChart3 size={14} /> Psychometric Tests
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="offerings" className="section-py bg-[#f7f3e8]">
          <div className="container px-6 lg:px-8">
            <div className="mb-8 text-center sm:mb-10">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                Our Services
              </p>
              <h2 className="heading-clamp mt-3 font-bold tracking-tight text-[#16243d]">
                Comprehensive development solutions
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-fluid-base text-muted-foreground">
                From individual assessments to organizational consulting, we
                provide the tools and expertise to drive meaningful growth.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <a
                    key={service.index}
                    href={service.href}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f7f3e8] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a34e] text-white shadow-lg shadow-[#c9a34e]/25">
                        <Icon size={22} />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                        {service.tag}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-[#16243d]">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {service.body}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#8b6914]">
                        Learn more
                        <ArrowUpRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-py bg-[#101d35]">
          <div className="container px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#c9a34e]">
                Client Success Stories
              </p>
              <h2 className="heading-clamp mt-3 font-bold tracking-tight text-[#f7f3e8]">
                Results leaders trust
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-fluid-base text-[#c1cad7]">
                Real outcomes from organizations and professionals who chose evidence-based development.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#f7f3e8]/10 bg-[#f7f3e8]/5 p-8 transition-all hover:border-[#c9a34e] hover:bg-[#f7f3e8]/10"
                >
                  <div>
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a34e]/15 text-[#c9a34e]">
                      <Quote size={24} />
                    </div>
                    <blockquote className="text-base leading-relaxed text-[#e5eaf5]">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                  <div className="mt-6 border-t border-[#f7f3e8]/10 pt-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#f7f3e8]">
                          {testimonial.author}
                        </p>
                        <p className="mt-1 text-xs text-[#aab5c6]">
                          {testimonial.role}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#c9a34e]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c9a34e]">
                        {testimonial.metric}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Course Catalog */}
        <section id="courses" className="section-py bg-[#101d35]">
          <div className="container px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#c9a34e]">
                  Course Catalog
                </p>
                <h2 className="heading-clamp mt-3 font-bold tracking-tight text-[#f7f3e8]">
                  Choose the capability you want to build
                </h2>
                <p className="mt-3 max-w-2xl text-fluid-base text-[#c1cad7]">
                  Each course is designed to meet professional standards while
                  giving you a practical path from reflection to measurable progress.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCatalogLevel("All levels")}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    catalogLevel === "All levels"
                      ? "bg-[#c9a34e] text-[#101d35]"
                      : "border border-[#f7f3e8]/30 text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]"
                  }`}
                >
                  All levels
                </button>
                {uniqueLevels.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCatalogLevel(level)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      catalogLevel === level
                        ? "bg-[#c9a34e] text-[#101d35]"
                        : "border border-[#f7f3e8]/30 text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pagedCatalog.map(course => (
                <article
                  key={course.index}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#f7f3e8]/10 bg-[#f7f3e8]/5 p-6 transition-all hover:border-[#c9a34e] hover:bg-[#f7f3e8]/10"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[#c9a34e]">
                        {course.index}
                      </span>
                      <span className="rounded-full bg-[#c9a34e]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c9a34e]">
                        {course.format}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-[#f7f3e8]">
                      {course.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#aab5c6]">
                      {course.body}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#f7f3e8]/10 pt-4">
                    <span className="text-xl font-bold text-[#c9a34e]">
                      {course.price}
                    </span>
                    <div className="flex gap-2">
                      <a
                        href={`/courses/${course.slug}?workspace=1`}
                        aria-label={`Enroll now in ${course.title}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#c9a34e] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#101d35] transition-all hover:bg-[#d4b45a]"
                      >
                        Enroll
                        <ArrowUpRight size={12} />
                      </a>
                      <a
                        href={
                          course.modules.length
                            ? `/courses/${course.slug}`
                            : "#contact"
                        }
                        aria-label={
                          course.modules.length
                            ? `Open syllabus for ${course.title}`
                            : `Discuss ${course.title}`
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#f7f3e8]/30 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#c1cad7] transition-all hover:border-[#c9a34e] hover:text-[#c9a34e]"
                      >
                        {course.modules.length ? "Syllabus" : "Discuss"}
                        <ChevronRight size={12} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {catalogPage < catalogPageCount && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setCatalogPage(page => page + 1)}
                  className="inline-flex items-center gap-3 rounded-lg border-2 border-[#c9a34e] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-[#c9a34e] transition-all hover:bg-[#c9a34e] hover:text-[#101d35]"
                >
                  Load more courses
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {filteredCatalog.length === 0 && (
              <p className="py-12 text-center text-base text-[#aab5c6]">
                No courses match the selected filters.
              </p>
            )}
          </div>
        </section>

        {/* Resources & Surveys */}
        <section className="section-py bg-[#f7f3e8]">
          <div className="container px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Resources Column */}
              <div className="rounded-2xl border border-[#16243d]/10 bg-white p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16243d] text-[#f7f3e8]">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                      Resources
                    </p>
                    <h3 className="text-lg font-bold text-[#16243d]">
                      Curated materials
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Practical guides, templates, and tools to support better
                  decisions and clearer next steps.
                </p>
                {publishedResources.isLoading ? (
                  <div className="mt-5 space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-lg border border-[#16243d]/10 bg-[#f7f3e8]" />
                    ))}
                  </div>
                ) : displayResources.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {(displayResources as Array<{ id: number; title: string; description: string; category: string; price: number; currency: string; fileUrl?: string | null }>).map(resource => (
                      <div key={resource.id} className="rounded-lg border border-[#16243d]/10 bg-[#f7f3e8] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                              {resource.category}
                            </span>
                            <p className="mt-1 text-sm font-semibold text-[#16243d]">
                              {resource.title}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-[#16243d]">
                            {(resource.price ?? 0) === 0 ? "Free" : `${resource.currency ?? "KES"} ${(resource.price ?? 0).toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-center text-sm text-muted-foreground">
                    No published resources yet.
                  </p>
                )}
                <div className="mt-5">
                  <a
                    href="/resources"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#16243d] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#0f172a]"
                  >
                    View all resources <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              {/* Surveys Column */}
              <div className="rounded-2xl border border-[#16243d]/10 bg-white p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a34e] text-[#16243d]">
                    <Vote size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                      Surveys
                    </p>
                    <h3 className="text-lg font-bold text-[#16243d]">
                      Have your say
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Take part in our active polls, surveys, and product reviews.
                  Your feedback helps shape what comes next.
                </p>
                {activeSurveys.isLoading ? (
                  <div className="mt-5 space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-lg border border-[#16243d]/10 bg-[#f7f3e8]" />
                    ))}
                  </div>
                ) : displaySurveys.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {(displaySurveys as Array<{ id: number; title: string; description: string; type: string; status: string; totalResponses: number }>).map(survey => (
                      <div key={survey.id} className="rounded-lg border border-[#16243d]/10 bg-[#f7f3e8] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="inline-flex rounded-full bg-[#c9a34e]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7d5e1e]">
                              {survey.type}
                            </span>
                            <p className="mt-1 text-sm font-semibold text-[#16243d]">
                              {survey.title}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {survey.totalResponses} response{survey.totalResponses === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 text-center">
                    <Vote size={32} className="mx-auto text-[#8b6914]" aria-hidden="true" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No active surveys right now.
                    </p>
                  </div>
                )}
                <div className="mt-5">
                  <a
                    href="/surveys"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#16243d] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#0f172a]"
                  >
                    View all surveys <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Enrollment Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101d35]/80 p-5 backdrop-blur-sm"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedCourse(null);
          }}
        >
          <div
            ref={enrollmentDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="enrollment-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl sm:p-10"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                  Enrollment / next step
                </p>
                <h2
                  id="enrollment-title"
                  className="mt-3 text-3xl font-bold tracking-tight text-[#16243d]"
                >
                  Reserve your place.
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close enrollment form"
                onClick={() => {
                  setSelectedCourse(null);
                  enrollmentTriggerRef.current?.focus();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d]/10 text-muted-foreground transition-colors hover:border-[#16243d] hover:text-[#16243d]"
              >
                <X size={20} />
              </button>
            </div>

            {enrollmentSubmitted ? (
              <div className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                <Check size={24} className="text-emerald-700" />
                <h3 className="mt-4 text-xl font-bold text-[#16243d]">
                  Your interest is recorded.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Thank you for choosing {selectedCourse.title}. Our team will
                  follow up using the email you provided.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse(null);
                    enrollmentTriggerRef.current?.focus();
                  }}
                  className="mt-6 text-sm font-semibold text-[#8b6914] underline underline-offset-4"
                >
                  Close form
                </button>
              </div>
            ) : (
              <form className="mt-8" onSubmit={submitEnrollment}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#16243d]">
                      Selected course
                    </label>
                    <select
                      required
                      name="courseTitle"
                      value={selectedCourse.title}
                      onChange={event =>
                        setSelectedCourse(
                          courses.find(
                            course => course.title === event.target.value
                          ) ?? selectedCourse
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-[#16243d]/10 px-4 py-3 text-base font-semibold outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                    >
                      {courses.map(course => (
                        <option key={course.title} value={course.title}>
                          {course.title} — {course.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#16243d]">
                      Your name
                    </label>
                    <input
                      required
                      name="enrollment-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      className="mt-2 w-full rounded-lg border border-[#16243d]/10 px-4 py-3 text-base font-semibold outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#16243d]">
                      Email address
                    </label>
                    <input
                      required
                      name="enrollment-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-lg border border-[#16243d]/10 px-4 py-3 text-base font-semibold outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      required
                      id="enrollment-consent"
                      name="enrollment-consent"
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-[#16243d]/20 text-[#8b6914] focus:ring-[#c9a34e]"
                    />
                    <label
                      htmlFor="enrollment-consent"
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      I consent to Profound IQ Consulting using my name and
                      email to respond to this enrollment inquiry, in line with
                      our privacy policy.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={enrollment.isPending}
                    className="w-full rounded-lg bg-[#16243d] px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#0f172a] disabled:opacity-60"
                  >
                    {enrollment.isPending
                      ? "Recording…"
                      : "Submit enrollment interest"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#101d35] py-16 text-[#f7f3e8] lg:py-20">
        <div className="container px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <BrandLogo context="footer" />
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#aab5c6]">
                Transformational learning, educational consulting, school
                improvement, psychometric insight, and professional development
                for a changing world.
              </p>
              <a
                href="/contact"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#c9a34e] transition-colors hover:text-[#d4af5e]"
              >
                Talk to our consultants
                <ArrowUpRight size={16} />
              </a>
<div className="mt-7 flex gap-3">
                <a
                  href="https://www.facebook.com/profoundIQ"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on Facebook"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d] text-[#aab5c6] transition-all hover:border-[#c9a34e] hover:text-[#c9a34e]"
                >
                  <SocialIcon platform="facebook" />
                </a>
                <a
                  href="https://x.com/ProfoundIQC"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on X"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d] text-[#aab5c6] transition-all hover:border-[#c9a34e] hover:text-[#c9a34e]"
                >
                  <SocialIcon platform="twitter" />
                </a>
                <a
                  href="https://linkedin.com/company/profoundiqconsulting"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on LinkedIn"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d] text-[#aab5c6] transition-all hover:border-[#c9a34e] hover:text-[#c9a34e]"
                >
                  <SocialIcon platform="linkedin" />
                </a>
                <a
                  href="https://www.instagram.com/profoundiqconsulting/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d] text-[#aab5c6] transition-all hover:border-[#c9a34e] hover:text-[#c9a34e]"
                >
                  <SocialIcon platform="instagram" />
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#c9a34e]">
                Quick Links
              </p>
              <div className="mt-6 grid gap-3">
                <a
                  href="/about"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  About
                </a>
                <a
                  href="/services"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  Services
                </a>
                <a
                  href="/courses"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  Courses
                </a>
                <a
                  href="/assessment"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  Self Assessment
                </a>
                <a
                  href="/careerpath"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  CareerPath
                </a>
                <a
                  href="/psychometrics"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  Psychometrics
                </a>
                <a
                  href="/resources"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  Resources
                </a>
                <a
                  href="/contact"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  Contact
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#c9a34e]">
                Legal
              </p>
              <div className="mt-6 grid gap-3">
                <a
                  href="/privacy-policy"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms-of-service"
                  className="text-sm text-[#aab5c6] transition-colors hover:text-[#f7f3e8]"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-[#16243d] pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-[#aab5c6]">
                © 2026 Profound IQ Consulting. All rights reserved.
              </p>
              <p className="text-sm text-[#aab5c6]">
                Online / Kenya / Global reach
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
