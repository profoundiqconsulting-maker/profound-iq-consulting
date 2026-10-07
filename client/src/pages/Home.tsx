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
import { CAREER_PATH_PRICE_KES } from "@shared/careerPath";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

const transformationServices = [
  {
    index: "01",
    title: "Self Assessment",
    body: "A guided 100-question reflection with module navigation, secure progress saving, import/export recovery, payment-gated reporting, and practical development insights.",
    tag: "Professional insight",
    href: "/assessment",
    icon: BrainCircuit,
  },
  {
    index: "02",
    title: "CareerPath",
    body: "A pathway and talent-fit assessment for Competency Based Education learners, with clear progress, Paystack checkout, sub-pathway visuals, and coaching-ready results.",
    tag: "Learner direction",
    href: "/careerpath",
    icon: Users,
  },
];

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
    quote: "The shift begins with what you can now see.",
    author: "Margaret Kim",
    role: "Education Leader",
  },
  {
    quote: "Profound IQ transformed how we approach professional development.",
    author: "James Ochieng",
    role: "HR Director",
  },
  {
    quote: "The assessment insights were incredibly accurate and actionable.",
    author: "Sarah Wanjiku",
    role: "Team Lead",
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialsPaused, setTestimonialsPaused] = useState(false);
  const [visibleResourceCount, setVisibleResourceCount] = useState(3);
  const [visibleSurveyCount, setVisibleSurveyCount] = useState(3);
  const HOME_PREVIEW_COUNT = 3;
  const enrollmentTriggerRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
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
        <p className="mt-2 line-clamp-2 text-sm text-[#657084]">
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
        <p className="mt-2 line-clamp-2 text-sm text-[#657084]">
          {survey.description}
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-[#657084]">
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
      if (event.key === "Escape") setSelectedCourse(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedCourse]);

  useEffect(() => {
    if (testimonialsPaused) return;
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonialsPaused]);

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

          <div className="container relative px-6 py-20 sm:px-8 sm:py-24 lg:px-8 lg:py-28 xl:py-32">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a34e]/60 bg-[#c9a34e]/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                  <Sparkles size={14} />
                  Executive Assessment & Development
                </div>

                <h1 className="mt-8 text-fluid-lg leading-[1.1] tracking-tight lg:text-fluid-xl">
                  Transform potential into{" "}
                  <span className="bg-gradient-to-r from-[#c9a34e] to-[#d4af5e] bg-clip-text text-transparent">
                    measurable impact
                  </span>
                </h1>

                <p className="mt-6 text-fluid-base leading-relaxed text-[#e5eaf5] lg:text-fluid-lg">
                  Profound IQ Consulting helps professionals and organizations
                  move from raw potential to purposeful impact through
                  evidence-based learning, assessment, and strategic
                  development.
                </p>

                <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                  <a
                    href="/assessment"
                    className="group inline-flex items-center gap-2 rounded-lg bg-[#c9a34e] px-5 py-3 text-fluid-xs font-bold uppercase tracking-wider text-[#101d35] shadow-lg shadow-[#c9a34e]/25 transition-all hover:gap-3 hover:shadow-xl hover:shadow-[#c9a34e]/40 sm:px-6 sm:py-4 sm:text-sm sm:gap-3"
                  >
                    Take the KES 399 assessment
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4"
                    />
                  </a>
                  <a
                    href="#offerings"
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-[#f7f3e8] px-5 py-3 text-fluid-xs font-bold uppercase tracking-wider text-[#f7f3e8] transition-all hover:border-[#c9a34e] hover:text-[#8b6914] sm:px-6 sm:py-4 sm:text-sm sm:gap-3"
                  >
                    Explore services
                    <ArrowDownRight size={16} className="sm:h-4 sm:w-4" />
                  </a>
                  <a
                    href="/courses"
                    className="group inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-5 py-3 text-fluid-xs font-bold uppercase tracking-wider text-[#f7f3e8] shadow-lg shadow-[#16243d]/25 transition-all hover:gap-3 hover:shadow-xl hover:shadow-[#16243d]/40 sm:px-6 sm:py-4 sm:text-sm sm:gap-3"
                  >
                    Enroll for courses
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4"
                    />
                  </a>
                </div>

                <div className="mt-12 flex items-center gap-8 text-sm text-[#e5eaf5]">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-[#101d35] bg-gradient-to-br from-[#16243d] to-[#101d35]"
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
                <div className="relative">
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-[#c9a34e]/30 to-[#c9a34e]/30 blur-2xl" />
                  <div className="relative rounded-2xl border-2 border-[#f7f3e8]/40 bg-[#f7f3e8]/15 p-8 backdrop-blur-sm">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 rounded-xl bg-[#f7f3e8]/15 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c9a34e]">
                          <Award className="h-6 w-6 text-[#101d35]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#f7f3e8]">
                            Professional Courses
                          </p>
                          <p className="text-sm text-[#f7f3e8]">
                            50+ expert-led programs
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-xl bg-[#f7f3e8]/15 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c9a34e]">
                          <BarChart3 className="h-6 w-6 text-[#101d35]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#f7f3e8]">
                            Psychometric Testing
                          </p>
                          <p className="text-sm text-[#f7f3e8]">
                            Evidence-based insights
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-xl bg-[#f7f3e8]/15 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c9a34e]">
                          <Users className="h-6 w-6 text-[#101d35]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#f7f3e8]">
                            1-on-1 Coaching
                          </p>
                          <p className="text-sm text-[#f7f3e8]">
                            Personalized development
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Stats Bar */}
              <div className="mt-16 grid grid-cols-2 gap-6 border-t-2 border-[#f7f3e8]/20 pt-10 sm:mt-20 sm:gap-8 sm:pt-12 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-[#8b6914] sm:text-3xl lg:text-4xl xl:text-5xl">
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

        {/* Services Section */}
        <section id="offerings" className="section-py bg-[#f7f3e8]">
          <div className="container px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                Our Services
              </p>
              <h2 className="heading-clamp mt-4 font-bold tracking-tight text-[#16243d]">
                Comprehensive development solutions
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-fluid-base text-[#657084]">
                From individual assessments to organizational consulting, we
                provide the tools and expertise to drive meaningful growth.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <a
                    key={service.index}
                    href={service.href}
                    className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f7f3e8] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#c9a34e] text-white shadow-lg shadow-[#c9a34e]/25">
                        <Icon size={24} />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                        {service.tag}
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-[#16243d]">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#657084]">
                        {service.body}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#8b6914]">
                        Learn more
                        <ArrowUpRight
                          size={16}
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

        {/* Featured Services */}
        <section className="section-py bg-white">
          <div className="container px-6 lg:px-8">
            <div className="mb-12 sm:mb-16">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                Featured Programs
              </p>
              <h2 className="heading-clamp mt-4 font-bold tracking-tight text-[#16243d]">
                Tools for the work ahead
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {transformationServices.map(service => {
                const Icon = service.icon;
                return (
                  <a
                    key={service.index}
                    href={service.href}
                    className="group relative overflow-hidden rounded-2xl bg-[#16243d] p-10 text-[#f7f3e8] shadow-xl transition-all hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c9a34e]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#c9a34e]/20 text-[#8b6914]">
                        <Icon size={28} />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                        {service.tag}
                      </p>
                      <h3 className="mt-3 text-3xl font-bold">
                        {service.title}
                      </h3>
                      <p className="mt-4 text-base leading-relaxed text-[#c1cad7]">
                        {service.body}
                      </p>
                      <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#8b6914]">
                        Open service
                        <ArrowUpRight
                          size={16}
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
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                Client Success Stories
              </p>
              <div className="mt-8 sm:mt-12">
                <div className="relative h-56 sm:h-64">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-700 ${
                        index === currentTestimonial
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      <blockquote className="text-2xl font-light leading-relaxed text-[#f7f3e8] sm:text-3xl lg:text-4xl">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="mt-6 sm:mt-8">
                        <p className="font-semibold text-[#8b6914]">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-[#aab5c6]">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setTestimonialsPaused(paused => !paused)}
                    aria-label={testimonialsPaused ? "Play testimonial carousel" : "Pause testimonial carousel"}
                    className="inline-flex items-center gap-2 rounded-full border border-[#16243d]/20 px-4 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#aab5c6] transition-colors hover:border-[#c9a34e] hover:text-[#8b6914]"
                  >
                    {testimonialsPaused ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                        Play
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                        Pause
                      </>
                    )}
                  </button>
                  <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentTestimonial
                            ? "w-8 bg-[#c9a34e]"
                            : "w-2 bg-[#16243d] hover:bg-[#1f3050]"
                        }`}
                        aria-label={`Testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Catalog */}
        <section id="courses" className="section-py bg-[#f7f3e8]">
          <div className="container px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                Course Catalog
              </p>
              <h2 className="heading-clamp mt-4 font-bold tracking-tight text-[#16243d]">
                Choose the capability you want to build
              </h2>
              <p className="mt-4 max-w-2xl text-fluid-base text-[#657084]">
                Each course is designed to meet professional standards while
                giving you a practical path from reflection to measurable
                progress.
              </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setCatalogLevel("All levels")}
                className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  catalogLevel === "All levels"
                    ? "bg-[#16243d] text-white"
                    : "bg-white text-[#657084] border border-[#16243d]/10 hover:border-[#16243d]"
                }`}
              >
                All levels
              </button>
              {uniqueLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCatalogLevel(level)}
                  className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    catalogLevel === level
                      ? "bg-[#16243d] text-white"
                      : "bg-white text-[#657084] border border-[#16243d]/10 hover:border-[#16243d]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {pagedCatalog.map(course => (
                <article
                  key={course.index}
                  className="group rounded-2xl border border-[#16243d]/10 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[#c9a34e]"
                >
                  <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-sm font-bold text-[#8b6914]">
                          {course.index}
                        </span>
                        <span className="rounded-full bg-[#c9a34e]/10 px-2.5 py-1 text-xs font-semibold text-[#7d5e1e] sm:px-3 sm:py-1">
                          {course.format}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-bold text-[#16243d] sm:text-2xl">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-fluid-base leading-relaxed text-[#657084]">
                        {course.body}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3 sm:mt-6 sm:gap-4">
                        <a
                          href={`/courses/${course.slug}?workspace=1`}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#0f172a]"
                        >
                          Enroll now
                          <ArrowUpRight size={14} />
                        </a>
                        <a
                          href={
                            course.modules.length
                              ? `/courses/${course.slug}`
                              : "#contact"
                          }
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657084] transition-colors hover:text-[#8b6914]"
                        >
                          {course.modules.length
                            ? "Open syllabus"
                            : "Discuss item"}
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                    <div className="lg:text-right">
                      <p className="text-3xl font-bold text-[#16243d]">
                        {course.price}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {catalogPage < catalogPageCount && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => setCatalogPage(page => page + 1)}
                  className="inline-flex items-center gap-3 rounded-lg border-2 border-[#16243d] px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#16243d] transition-all hover:bg-[#16243d] hover:text-white"
                >
                  Load more
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {filteredCatalog.length === 0 && (
              <p className="py-12 text-center text-base text-[#657084]">
                No courses match the selected filters.
              </p>
            )}
          </div>
        </section>

        {/* Resources Preview */}
        <section className="section-py bg-[#f7f3e8]">
          <div className="container px-6 lg:px-8">
            <div className="mb-10 sm:mb-12">
              <p className="eyebrow text-[#7d5e1e]">Resources</p>
              <h2 className="display mt-5 heading-clamp">
                Curated materials
              </h2>
              <p className="mt-4 max-w-2xl text-fluid-base text-[#4a566a]">
                Practical guides, templates, and tools to support better decisions and clearer next steps.
              </p>
            </div>
            {publishedResources.isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: HOME_PREVIEW_COUNT }).map((_, index) => (
                  <div key={index} className="h-48 animate-pulse rounded-xl border border-[#16243d]/10 bg-white" />
                ))}
              </div>
            ) : displayResources.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(displayResources as Array<{ id: number; title: string; description: string; category: string; price: number; currency: string; fileUrl?: string | null }>).map(resource => (
                    <ScrollReveal key={resource.id}>
                      {renderResourcePreview(resource)}
                    </ScrollReveal>
                  ))}
                </div>
                {visibleResourceCount < (publishedResources.data ?? []).length && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleResourceCount(count => count + HOME_PREVIEW_COUNT)}
                      className="inline-flex items-center gap-3 rounded-lg border-2 border-[#16243d] px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#16243d] transition-all hover:bg-[#16243d] hover:text-white"
                    >
                      Load more
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="py-12 text-center text-base text-[#657084]">
                No published resources yet.
              </p>
            )}
            <div className="mt-10 flex justify-center">
              <a
                href="/resources"
                className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-6 py-3 text-[10px] font-black uppercase tracking-[.12em] text-white transition-all hover:bg-[#0f172a]"
              >
                View all resources <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Surveys Preview */}
        <section className="section-py bg-white">
          <div className="container px-6 lg:px-8">
            <div className="mb-10 sm:mb-12">
              <p className="eyebrow text-[#7d5e1e]">Surveys</p>
              <h2 className="display mt-5 heading-clamp">
                Have your say
              </h2>
              <p className="mt-4 max-w-2xl text-fluid-base text-[#4a566a]">
                Take part in our active polls, surveys, and product reviews. Your feedback helps shape what comes next.
              </p>
            </div>
            {activeSurveys.isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: HOME_PREVIEW_COUNT }).map((_, index) => (
                  <div key={index} className="h-48 animate-pulse rounded-xl border border-[#16243d]/10 bg-[#f7f3e8]" />
                ))}
              </div>
            ) : displaySurveys.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(displaySurveys as Array<{ id: number; title: string; description: string; type: string; status: string; totalResponses: number }>).map(survey => (
                    <ScrollReveal key={survey.id}>
                      {renderSurveyPreview(survey)}
                    </ScrollReveal>
                  ))}
                </div>
                {visibleSurveyCount < (activeSurveys.data ?? []).length && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleSurveyCount(count => count + HOME_PREVIEW_COUNT)}
                      className="inline-flex items-center gap-3 rounded-lg border-2 border-[#16243d] px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#16243d] transition-all hover:bg-[#16243d] hover:text-white"
                    >
                      Load more
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="mx-auto max-w-2xl text-center">
                <Vote size={48} className="mx-auto text-[#8b6914]" aria-hidden="true" />
                <h3 className="display mt-6 text-3xl">No active surveys right now</h3>
                <p className="mt-4 text-base text-[#4a566a]">
                  Check back soon. We regularly run polls, surveys, and product reviews.
                </p>
              </div>
            )}
            <div className="mt-10 flex justify-center">
              <a
                href="/surveys"
                className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-6 py-3 text-[10px] font-black uppercase tracking-[.12em] text-white transition-all hover:bg-[#0f172a]"
              >
                View all surveys <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="section-py bg-[#16243d]">
          <div className="container px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-fluid-xs font-semibold uppercase tracking-wider text-[#8b6914]">
                  Get in Touch
                </p>
                <h2 className="heading-clamp mt-4 font-bold tracking-tight text-[#f7f3e8]">
                  Make the next step deliberate
                </h2>
                <p className="mt-4 text-fluid-base leading-relaxed text-[#c1cad7] sm:text-lg">
                  Tell us what you are working toward. We will help you see the
                  path with more clarity.
                </p>
                <div className="mt-10 space-y-6">
                  <a
                    href="mailto:admin@profoundiqconsulting.com"
                    className="flex items-center gap-4 text-[#c1cad7] transition-colors hover:text-[#8b6914]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#16243d] text-[#c9a34e]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#f7f3e8]">Email us</p>
                      <p className="text-sm">admin@profoundiqconsulting.com</p>
                    </div>
                  </a>
                  <a
                    href="tel:+254727374055"
                    className="flex items-center gap-4 text-[#c1cad7] transition-colors hover:text-[#8b6914]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#16243d] text-[#c9a34e]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#f7f3e8]">Call us</p>
                      <p className="text-sm">+254 727 374 055</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 text-[#c1cad7]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#16243d] text-[#c9a34e]">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#f7f3e8]">Always online</p>
                      <p className="text-sm">WhatsApp support available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={submitInquiry}
                className="rounded-2xl bg-white p-8 shadow-xl lg:p-10"
                aria-live="polite"
              >
                <h3 className="text-2xl font-bold text-[#16243d]">
                  Start with a question
                </h3>
                <p className="mt-2 text-sm text-[#657084]">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>

                {sent && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-6 flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                  >
                    <Check size={18} />
                    Your inquiry has been received. We will be in touch shortly.
                  </div>
                )}

                {inquiryError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                    {inquiryError}
                  </div>
                )}

                <div className="mt-8 space-y-6">
                  <div>
                    <label htmlFor="inquiry-name" className="block text-xs font-bold uppercase tracking-wider text-[#16243d]">
                      Your name
                    </label>
                    <input
                      required
                      id="inquiry-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      className="mt-2 w-full rounded-lg border border-[#16243d]/10 px-4 py-3 text-base outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiry-email" className="block text-xs font-bold uppercase tracking-wider text-[#16243d]">
                      Email address
                    </label>
                    <input
                      required
                      id="inquiry-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-lg border border-[#16243d]/10 px-4 py-3 text-base outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiry-category" className="block text-xs font-bold uppercase tracking-wider text-[#16243d]">
                      Inquiry subject
                    </label>
                    <select
                      required
                      id="inquiry-category"
                      name="category"
                      defaultValue="general"
                      className="mt-2 w-full rounded-lg border border-[#16243d]/10 px-4 py-3 text-base outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                    >
                      <option value="general">General question</option>
                      <option value="professional-courses">
                        Professional courses
                      </option>
                      <option value="educational-consulting">
                        Educational consulting
                      </option>
                      <option value="psychometric-testing">
                        Psychometric testing
                      </option>
                      <option value="research-surveys">Research surveys</option>
                      <option value="organizational-development">
                        Organizational development
                      </option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="inquiry-message" className="block text-xs font-bold uppercase tracking-wider text-[#16243d]">
                      What are you exploring?
                    </label>
                    <textarea
                      required
                      id="inquiry-message"
                      name="message"
                      placeholder="A course, a team challenge, a new direction…"
                      rows={4}
                      className="mt-2 w-full resize-none rounded-lg border border-[#16243d]/10 px-4 py-3 text-base outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiry-math" className="block text-xs font-bold uppercase tracking-wider text-[#16243d]">
                      Quick verification
                    </label>
                    <p className="mt-2 text-sm text-[#657084]">
                      What is {mathA} + {mathB}?
                    </p>
                    <input
                      required
                      id="inquiry-math"
                      name="mathAnswer"
                      type="number"
                      inputMode="numeric"
                      min="2"
                      max="40"
                      placeholder="Your answer"
                      className="mt-2 w-full rounded-lg border border-[#16243d]/10 px-4 py-3 text-base outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inquiry.isPending}
                    className="w-full rounded-lg bg-[#16243d] px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#0f172a] disabled:cursor-wait disabled:opacity-60"
                  >
                    {inquiry.isPending ? "Sending…" : "Send inquiry"}
                  </button>
                </div>
              </form>
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
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d]/10 text-[#657084] transition-colors hover:border-[#16243d] hover:text-[#16243d]"
              >
                <X size={20} />
              </button>
            </div>

            {enrollmentSubmitted ? (
              <div className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                <Check size={24} className="text-emerald-600" />
                <h3 className="mt-4 text-xl font-bold text-[#16243d]">
                  Your interest is recorded.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#657084]">
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
                      className="text-sm leading-relaxed text-[#657084]"
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
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#8b6914] transition-colors hover:text-[#d4af5e]"
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d] text-[#aab5c6] transition-all hover:border-[#c9a34e] hover:text-[#8b6914]"
                >
                   <SocialIcon platform="facebook" />
                </a>
                <a
                  href="https://x.com/ProfoundIQC"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on X"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d] text-[#aab5c6] transition-all hover:border-[#f7f3e8] hover:text-[#f7f3e8]"
                >
                  <X size={18} />
                </a>
                <a
                  href="https://linkedin.com/company/profoundiqconsulting"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on LinkedIn"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d] text-[#aab5c6] transition-all hover:border-[#c9a34e] hover:text-[#8b6914]"
                >
                   <SocialIcon platform="linkedin" />
                </a>
                <a
                  href="https://www.instagram.com/profoundiqconsulting/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#16243d] text-[#aab5c6] transition-all hover:border-[#c9a34e] hover:text-[#8b6914]"
                >
                   <SocialIcon platform="instagram" />
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#8b6914]">
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
              <p className="text-sm font-semibold uppercase tracking-wider text-[#8b6914]">
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
              <p className="text-sm text-[#657084]">
                © 2026 Profound IQ Consulting. All rights reserved.
              </p>
              <p className="text-sm text-[#657084]">
                Online / Kenya / Global reach
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
