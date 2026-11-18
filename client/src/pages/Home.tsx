/* Profound IQ Consulting — Executive Landing Page Redesign */
import { lazy, useEffect, useMemo, useRef, useState, Suspense } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  MessageCircle,
  Quote,
  School,
  Shield,
  Sparkles,
  Star,
  Users,
  Vote,
  X,
  Zap,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialMediaIcons";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteNavigation } from "@/components/SiteNavigation";
import { ScrollReveal, ScrollRevealGroup } from "@/components/ScrollReveal";
import { trpc } from "@/lib/trpc";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import { ASSESSMENT_PRICE_KES } from "@shared/assessment";
import { CAREER_PATH_PRICE_KES } from "@shared/careerPath";
import { COURSE_PRICE_KES } from "@shared/courseCatalog";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const ProgressRing = lazy(() => import("@/components/ui/progress-ring").then(m => ({ default: m.ProgressRing })));
const CheckoutForm = lazy(() => import("@/components/CheckoutForm").then(m => ({ default: m.CheckoutForm })));
const SocialSharing = lazy(() => import("@/components/SocialSharing").then(m => ({ default: m.SocialSharing })));

const stats = [
  { value: "10k+", label: "Assessments completed" },
  { value: "500+", label: "Organizations served" },
  { value: "50+", label: "Professional courses" },
  { value: "98%", label: "Client satisfaction" },
];

const testimonials = [
  {
    quote: "The psychometric profile gave our leadership team a shared vocabulary for development conversations we had been avoiding for years.",
    author: "Margaret Kim",
    role: "Director of Learning & Development, Kenya",
    metric: "40% faster succession planning",
    avatar: "MK",
  },
  {
    quote: "Profound IQ's framework transformed how we approach professional development across 12 campuses. The insights were precise and immediately actionable.",
    author: "James Ochieng",
    role: "Academic Director, CBE Institution",
    metric: "92% program completion rate",
    avatar: "JO",
  },
  {
    quote: "The assessment insights surfaced blind spots we didn't know we had. Our team's performance improved within the first quarter.",
    author: "Sarah Wanjiku",
    role: "Operations Lead, Nairobi",
    metric: "31% productivity gain",
    avatar: "SW",
  },
];

const pathways = [
  {
    id: "individual",
    label: "For Me",
    icon: Briefcase,
    description: "Self Assessment, Psychometric profiles, Professional courses",
    primaryCTA: { label: "Start Self Assessment", href: "/assessment", price: ASSESSMENT_PRICE_KES },
    secondaryCTA: { label: "Explore Courses", href: "/courses" },
    gradient: "from-[#101d35] to-[#16243d]",
    accent: "text-[#c9a34e]",
    bgAccent: "bg-[#c9a34e]/20",
    borderAccent: "border-[#c9a34e]",
  },
  {
    id: "team",
    label: "For My Team",
    icon: Users,
    description: "CareerPath, Leadership courses, Organizational consulting",
    primaryCTA: { label: "Start CareerPath", href: "/careerpath", price: CAREER_PATH_PRICE_KES },
    secondaryCTA: { label: "View Solutions", href: "/school-solutions" },
    gradient: "from-[#c9a34e] to-[#d4b45a]",
    accent: "text-[#16243d]",
    bgAccent: "bg-[#16243d]/15",
    borderAccent: "border-[#16243d]",
  },
  {
    id: "school",
    label: "For Schools",
    icon: School,
    description: "Institutional programs, Research surveys, Bulk assessments",
    primaryCTA: { label: "Contact Sales", href: "/contact" },
    secondaryCTA: { label: "Learn More", href: "/school-solutions" },
    gradient: "from-[#f7f3e8] to-white",
    accent: "text-[#16243d]",
    bgAccent: "bg-[#16243d]/10",
    borderAccent: "border-[#16243d]/20",
  },
];

const trustLogos = [
  { name: "KICD", alt: "Kenya Institute of Curriculum Development" },
  { name: "TSC", alt: "Teachers Service Commission" },
  { name: "UNICEF", alt: "UNICEF Kenya" },
  { name: "World Bank", alt: "World Bank Group" },
  { name: "Safaricom", alt: "Safaricom PLC" },
  { name: "Equity Bank", alt: "Equity Group Holdings" },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Profound IQ Consulting",
  description: "Transformational learning, educational consulting, psychometric testing, research surveys, and professional courses.",
  url: PUBLISHED_SITE_ORIGIN,
  address: { "@type": "PostalAddress", addressLocality: "Online" },
  email: "admin@profoundiqconsulting.com",
  telephone: "+254727374055",
  openingHours: "Mo-Sa 09:00-17:00",
  priceRange: "KES 399–20,000",
  sameAs: [
    "https://www.facebook.com/profoundIQ",
    "https://x.com/ProfoundIQC",
    "https://linkedin.com/company/profoundiqconsulting",
    "https://www.instagram.com/profoundiqconsulting/",
  ],
  areaServed: "Worldwide",
};

export default function Home() {
  const [activePathway, setActivePathway] = useState<typeof pathways[0]>(pathways[0]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [catalogLevel, setCatalogLevel] = useState<string>("All levels");
  const [catalogCategory, setCatalogCategory] = useState<string>("All categories");
  const [catalogPage, setCatalogPage] = useState(1);
  const [visibleResourceCount, setVisibleResourceCount] = useState(3);
  const [visibleSurveyCount, setVisibleSurveyCount] = useState(3);
  const [showCheckout, setShowCheckout] = useState<{
    product: { name: string; priceKes: number; type: "assessment" | "course" | "psychometric"; slug?: string };
    prefilled?: { email?: string; name?: string };
  } | null>(null);
  const HOME_PREVIEW_COUNT = 3;

  const { user, isAuthenticated } = useAuth();
  const catalogList = trpc.course.catalogList.useQuery(undefined, { retry: false, refetchOnWindowFocus: true });
  const liveCatalog = trpc.catalog.listPublished.useQuery(undefined, { retry: false, refetchOnWindowFocus: true });
  const publishedResources = trpc.resources.listPublished.useQuery(undefined, { retry: false, refetchOnWindowFocus: true });
  const activeSurveys = trpc.resources.activeSurveys.useQuery(undefined, { retry: false, refetchOnWindowFocus: true });

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
      return { ...course, ...overlay, modules: course.modules, isDatabaseItem: true };
    });
    return [...merged, ...Array.from(bySlug.values())] as (typeof baseCourses)[number][];
  }, [catalogList.data, liveCatalog.data]);

  const uniqueLevels = Array.from(new Set(courses.map(course => course.skillLevel).filter(Boolean)));
  const uniqueCategories = Array.from(new Set(courses.map(course => course.category).filter(Boolean))).sort();
  const filteredCatalog = courses.filter(course => {
    if (catalogLevel !== "All levels" && course.skillLevel !== catalogLevel) return false;
    if (catalogCategory !== "All categories" && course.category !== catalogCategory) return false;
    return true;
  });
  const CATALOG_PAGE_SIZE = 6;
  const catalogPageCount = Math.max(1, Math.ceil(filteredCatalog.length / CATALOG_PAGE_SIZE));
  const pagedCatalog = filteredCatalog.slice(0, catalogPage * CATALOG_PAGE_SIZE);

  const displayResources = useMemo(() => {
    const data = (publishedResources.data ?? []).sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder);
    return data.slice(0, visibleResourceCount);
  }, [publishedResources.data, visibleResourceCount]);

  const displaySurveys = useMemo(() => {
    const data = (activeSurveys.data ?? []).filter((survey: { status: string }) => survey.status === "published");
    return data.slice(0, visibleSurveyCount);
  }, [activeSurveys.data, visibleSurveyCount]);

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => setTestimonialIndex(i => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const openCheckout = (product: { name: string; priceKes: number; type: "assessment" | "course" | "psychometric"; slug?: string }) => {
    setShowCheckout({ product, prefilled: user ? { email: user.email || undefined, name: user.name || undefined } : undefined });
  };

  const handleCheckoutSuccess = (reference: string) => {
    setShowCheckout(null);
    toast.success("Payment successful!", { description: "Your report is ready." });
  };

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteNavigation variant="home" dark={true} />

      <main id="top">
        {/* CLIENT SECTORS SCROLLING BANNER */}
        <section className="relative overflow-hidden bg-[var(--navy-deep)] text-[var(--text-on-dark)] py-4" aria-label="Organizations we work with">
          <div className="container px-6 lg:px-8">
            <div className="overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap will-change-transform">
                {[
                  "Banks",
                  "Insurance Companies",
                  "Public & Private Schools",
                  "International Organisations",
                  "Local NGOs",
                  "International NGOs",
                ].flatMap((sector, i) => [
                  <span key={`${sector}-${i}-1`} className="flex items-center gap-4 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-[var(--gold)]/80">
                    {sector}
                    <span className="text-[var(--gold)]/40" aria-hidden="true">•</span>
                  </span>,
                  <span key={`${sector}-${i}-2`} className="flex items-center gap-4 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-[var(--gold)]/80">
                    {sector}
                    <span className="text-[var(--gold)]/40" aria-hidden="true">•</span>
                  </span>,
                ])}
              </div>
            </div>
          </div>
        </section>

        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-[var(--navy-deep)] text-[var(--text-on-dark)] pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy-deep)] to-[var(--ivory-soft)] opacity-5" />
          <div className="absolute inset-0 bg-[url('/profound-hero-f95a7f36_76e0eb6f.svg')] bg-cover bg-center opacity-10" />

          <div className="container relative px-6 py-4 sm:px-8 lg:px-8">
            {/* Eyebrow + Trust Logos */}
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">
                <Sparkles size={12} />
                Executive Assessment & Development
              </div>
              <div className="flex items-center gap-6 opacity-60" aria-label="Trusted by leading organizations">
                {trustLogos.map((logo, i) => (
                  <span key={i} className="text-xs font-bold uppercase tracking-wider text-[var(--muted-on-dark)]">
                    {logo.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
              {/* Left: Copy */}
              <div className="max-w-2xl">
                <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  Turn potential into <span className="text-[var(--gold)]">measurable impact</span>
                </h1>

                <p className="mt-5 text-lg leading-relaxed text-[var(--muted-on-dark)]">
                  Profound IQ Consulting equips professionals, educators, and organizations with evidence-based assessment frameworks and practical development pathways — so you can lead with confidence and measure what matters.
                </p>

                {/* Primary CTA Group */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    asChild
                    variant="gold"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <a href="/assessment">
                      <ArrowRight size={18} className="mr-2" />
                      Start Self Assessment
                      <span className="ml-2 text-xs opacity-80">KES {ASSESSMENT_PRICE_KES} • 25 min</span>
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy-deep)]"
                  >
                    <a href="/courses">Explore Courses</a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="w-full sm:w-auto text-[var(--muted-on-dark)] hover:text-[var(--text-on-dark)]"
                  >
                    <a href="#pathways">See all pathways</a>
                  </Button>
                </div>

                {/* Trust Bar */}
                <div className="mt-10 flex items-center gap-6 text-sm text-[var(--muted-on-dark)]">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-[var(--navy-deep)] bg-gradient-to-br from-[var(--navy-deep)] to-[var(--ivory)]" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-on-dark)]">Trusted by 500+ organizations</p>
                    <p className="text-xs text-[var(--muted-on-dark)]">Across Kenya and beyond</p>
                  </div>
                </div>
              </div>

              {/* Right: Dashboard Preview */}
              <div className="hidden lg:block relative">
                <div className="relative rounded-3xl border border-[var(--gold)]/30 bg-[var(--navy-deep)]/60 p-6 backdrop-blur-md shadow-2xl shadow-[var(--gold)]/10">
                  <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[var(--gold)]/40 text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">
                        Since 2019
                      </span>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-on-dark)]/70">profound iq consulting</p>
                        <p className="text-sm font-bold text-[var(--text-on-dark)]">Executive Assessment & Development</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { icon: Award, title: "Professional Courses", value: "50+ programs" },
                        { icon: BarChart3, title: "Psychometric Testing", value: "Evidence-based" },
                        { icon: Users, title: "1-on-1 Coaching", value: "Personalized" },
                      ].map(({ icon: Icon, title, value }) => (
                        <div key={title} className="flex items-center gap-3 rounded-xl border border-[var(--gold)]/20 bg-[var(--navy-deep)]/40 p-4 hover:border-[var(--gold)]/40 transition-colors">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--gold)]/15">
                            <Icon className="h-5 w-5 text-[var(--gold)]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-on-dark)]">{title}</p>
                            <p className="text-xs text-[var(--gold)]">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-[var(--gold)]/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-[var(--text-on-dark)]">Client satisfaction</p>
                        <p className="text-xs font-bold text-[var(--gold)]">98%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--gold)]/20 overflow-hidden">
                        <div className="h-full bg-[var(--gold)] w-[98%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-16 grid grid-cols-2 gap-6 border-t-2 border-[var(--text-on-dark)]/10 pt-10 sm:mt-20 sm:gap-8 sm:pt-12 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-display text-3xl font-bold text-[var(--gold)] sm:text-4xl lg:text-5xl xl:text-6xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-fluid-xs text-[var(--muted-on-dark)] sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PATHWAY SELECTOR */}
        <section id="pathways" className="py-16 sm:py-20 lg:py-24 bg-[var(--ivory)]">
          <div className="container px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <p className="text-fluid-xs font-bold uppercase tracking-wider text-[var(--gold)]">Choose Your Path</p>
              <h2 className="text-display text-3xl font-semibold leading-[1.1] tracking-tight mt-3 sm:text-4xl lg:text-5xl text-[var(--navy-deep)]">
                Where are you starting from?
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-fluid-base text-[var(--muted-on-dark)]">
                Three clear paths to help you find the right tools, courses, and support for your goals.
              </p>
            </div>

            {/* Pathway Tabs */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
              {pathways.map((pathway, i) => (
                <button
                  key={pathway.id}
                  type="button"
                  onClick={() => setActivePathway(pathway)}
                  className={cn(
                    "relative px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 rounded-xl",
                    activePathway.id === pathway.id
                      ? "bg-[var(--navy-deep)] text-[var(--text-on-dark)] shadow-lg"
                      : "bg-white text-[var(--muted-on-dark)] hover:bg-[var(--ivory-soft)] border border-[var(--navy-deep)]/10"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <pathway.icon size={16} />
                    {pathway.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Pathway Card */}
            <div className={cn(
              "relative overflow-hidden rounded-3xl p-8 sm:p-12 transition-all duration-300",
              activePathway.gradient,
              activePathway.accent
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--gold)]/5 to-transparent" />
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1 max-w-2xl">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: activePathway.id === "team" ? "var(--navy-deep)" : "var(--gold)" }}>
                    <activePathway.icon size={28} className={activePathway.id === "team" ? "text-[var(--gold)]" : "text-[var(--navy-deep)]"} />
                  </div>
                  <span className={cn(
                    "inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]",
                    activePathway.id === "team" ? "bg-[var(--navy-deep)]/20 text-[var(--gold)]" : "bg-[var(--navy-deep)]/20 text-[var(--gold)]"
                  )}>
                    {activePathway.label}
                  </span>
                  <h3 className="mt-4 text-3xl font-bold sm:text-4xl">Your Path: {activePathway.label}</h3>
                  <p className="mt-4 text-lg leading-relaxed opacity-90">{activePathway.description}</p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      asChild
                      variant={activePathway.id === "team" ? "outline" : "gold"}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      <a href={activePathway.primaryCTA.href}>
                        {activePathway.primaryCTA.label}
                        {activePathway.primaryCTA.price && (
                          <span className="ml-2 text-xs opacity-80">KES {activePathway.primaryCTA.price}</span>
                        )}
                        <ArrowRight size={18} className="ml-2" />
                      </a>
                    </Button>
                    {activePathway.secondaryCTA && (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className={cn(
                          "w-full sm:w-auto",
                          activePathway.id === "team"
                            ? "border-[var(--navy-deep)] text-[var(--navy-deep)] hover:bg-[var(--navy-deep)]"
                            : "border-white text-white hover:bg-white/10"
                        )}
                      >
                        <a href={activePathway.secondaryCTA.href}>
                          {activePathway.secondaryCTA.label} <ArrowRight size={18} className="ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block w-72 flex-shrink-0">
                  <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-80">What you get</p>
                    <ul className="space-y-3 text-sm opacity-90">
                      {activePathway.description.split(",").map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0" style={{ color: activePathway.id === "team" ? "var(--navy-deep)" : "var(--gold)" }} />
                          <span>{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-16 sm:py-20 lg:py-24 bg-[var(--background)]">
          <div className="container px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <p className="text-fluid-xs font-bold uppercase tracking-wider text-[var(--gold)]">Our Services</p>
              <h2 className="text-display text-3xl font-semibold leading-[1.1] tracking-tight mt-3 sm:text-4xl lg:text-5xl text-[var(--navy-deep)]">
                Comprehensive development solutions
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-fluid-base text-[var(--muted-on-dark)]">
                From individual assessments to organizational consulting, we provide the tools and expertise to drive meaningful growth.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Self Assessment", desc: "100-question reflective framework with module navigation, secure progress saving, and practical development insights.", icon: BrainCircuit, tag: "Individual", href: "/assessment", price: ASSESSMENT_PRICE_KES },
                { title: "CareerPath", desc: "Competency Based Education pathway and talent-fit assessment with coaching-ready results and certificate.", icon: GraduationCap, tag: "CBE Learners", href: "/careerpath", price: CAREER_PATH_PRICE_KES },
                { title: "Psychometric Testing", desc: "Six complementary profiles for career exploration, cognitive reasoning, emotional intelligence, and leadership.", icon: BarChart3, tag: "Insight", href: "/psychometrics", price: 699 },
                { title: "Professional Courses", desc: "Practical capability building across leadership, strategic growth, and professional habits.", icon: Award, tag: "Development", href: "/courses", price: COURSE_PRICE_KES },
              ].map((service, i) => (
                <article
                  key={service.title}
                  className="group relative overflow-hidden rounded-2xl bg-[var(--card)] p-6 shadow-sm border border-[var(--border)] transition-all hover:shadow-xl hover:border-[var(--gold)]/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gold)] text-[var(--navy-deep)] shadow-lg shadow-[var(--gold)]/25">
                      <service.icon size={22} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">{service.tag}</p>
                    <h3 className="mt-2 text-lg font-bold text-[var(--navy-deep)]">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted-on-dark)]">{service.desc}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-xl font-bold text-[var(--gold)]">KES {service.price.toLocaleString()}</span>
                      <a
                        href={service.href}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:gap-3 transition-all"
                      >
                        Explore <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-16 sm:py-20 lg:py-24 bg-[var(--navy-deep)]">
          <div className="container px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <p className="text-fluid-xs font-bold uppercase tracking-wider text-[var(--gold)]">Client Success Stories</p>
              <h2 className="text-display text-3xl font-semibold leading-[1.1] tracking-tight mt-3 sm:text-4xl lg:text-5xl text-[var(--text-on-dark)]">
                Results leaders trust
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-fluid-base text-[var(--muted-on-dark)]">
                Real outcomes from organizations and professionals who chose evidence-based development.
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
                >
                  {testimonials.map((testimonial, i) => (
                    <div key={i} className="w-full flex-shrink-0 px-4">
                      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--text-on-dark)]/10 bg-[var(--text-on-dark)]/5 p-8 transition-all hover:border-[var(--gold)] hover:bg-[var(--text-on-dark)]/10">
                        <div>
                          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                            <Quote size={24} />
                          </div>
                          <blockquote className="text-lg leading-relaxed text-[var(--muted-on-dark)]">
                            "{testimonial.quote}"
                          </blockquote>
                        </div>
                        <div className="mt-8 border-t border-[var(--text-on-dark)]/10 pt-6">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)] font-bold">
                                {testimonial.avatar}
                              </div>
                              <p className="mt-3 font-bold text-[var(--text-on-dark)]">{testimonial.author}</p>
                              <p className="mt-1 text-xs text-[var(--muted-on-dark)]">{testimonial.role}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[var(--gold)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">
                              {testimonial.metric}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="mt-8 flex justify-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTestimonialIndex(i)}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all",
                      i === testimonialIndex
                        ? "bg-[var(--gold)] w-8"
                        : "bg-[var(--text-on-dark)]/20 hover:bg-[var(--text-on-dark)]/40"
                    )}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === testimonialIndex ? "true" : "false"}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COURSE PREVIEW */}
        <section id="courses" className="py-16 sm:py-20 lg:py-24 bg-[var(--ivory)]">
          <div className="container px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-fluid-xs font-bold uppercase tracking-wider text-[var(--gold)]">Course Catalog</p>
                <h2 className="text-display text-3xl font-semibold leading-[1.1] tracking-tight mt-3 sm:text-4xl lg:text-5xl text-[var(--navy-deep)]">
                  Choose the capability you want to build
                </h2>
                <p className="mt-3 max-w-2xl text-fluid-base text-[var(--muted-on-dark)]">
                  Each course is designed to meet professional standards while giving you a practical path from reflection to measurable progress.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={catalogLevel === "All levels" ? "gold" : "outline"}
                  size="sm"
                  onClick={() => { setCatalogLevel("All levels"); setCatalogPage(1); }}
                  className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy-deep)]"
                >
                  All levels
                </Button>
                {uniqueLevels.map(level => (
                  <Button
                    key={level}
                    variant={catalogLevel === level ? "gold" : "outline"}
                    size="sm"
                    onClick={() => { setCatalogLevel(level); setCatalogPage(1); }}
                    className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy-deep)]"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pagedCatalog.map(course => (
                <article
                  key={course.index}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--navy-deep)]/10 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-[var(--gold)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[var(--gold)]">{course.index}</span>
                      <Badge variant="subtle" className="text-xs">{course.format}</Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-[var(--navy-deep)]">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted-on-dark)]">{course.body}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--navy-deep)]/10 pt-4">
                    <span className="text-xl font-bold text-[var(--gold)]">{course.price}</span>
                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="gold"
                        size="sm"
                        onClick={() => openCheckout({ name: course.title, priceKes: course.isDatabaseItem ? COURSE_PRICE_KES : 4999, type: "course", slug: course.slug })}
                      >
                        <a href="#">Enroll <ArrowRight size={12} /></a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-[var(--navy-deep)]/20 text-[var(--navy-deep)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                      >
                        <a href={course.modules.length ? `/courses/${course.slug}` : "#contact"}>
                          {course.modules.length ? "Syllabus" : "Discuss"} <ChevronRight size={12} />
                        </a>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {catalogPage < catalogPageCount && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCatalogPage(p => p + 1)}
                  className="border-2 border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy-deep)]"
                >
                  Load more courses <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* RESOURCES & SURVEYS */}
        <section className="py-16 sm:py-20 lg:py-24 bg-[var(--background)]">
          <div className="container px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              {/* Resources */}
              <Card className="border-[var(--navy-deep)]/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--navy-deep)] text-white">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">Resources</p>
                      <CardTitle className="text-2xl text-[var(--navy-deep)]">Curated materials</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-[var(--muted-on-dark)] mb-6">
                    Practical guides, templates, and tools to support better decisions and clearer next steps.
                  </p>
                  {displayResources.length > 0 ? (
                    <div className="space-y-3">
                      {displayResources.map((resource: any) => (
                        <div key={resource.id} className="rounded-lg border border-[var(--navy-deep)]/10 bg-[var(--ivory)] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--gold)]">{resource.category}</span>
                              <p className="mt-1 text-sm font-semibold text-[var(--navy-deep)]">{resource.title}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-[var(--navy-deep)]">
                              {(resource.price ?? 0) === 0 ? "Free" : `${resource.currency ?? "KES"} ${(resource.price ?? 0).toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-[var(--muted-on-dark)] py-8">No published resources yet.</p>
                  )}
                  <Button asChild className="w-full mt-4" variant="outline" size="lg">
                    <a href="/resources">View all resources <ArrowRight size={14} /></a>
                  </Button>
                </CardContent>
              </Card>

              {/* Surveys */}
              <Card className="border-[var(--navy-deep)]/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gold)] text-[var(--navy-deep)]">
                      <Vote size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">Surveys</p>
                      <CardTitle className="text-2xl text-[var(--navy-deep)]">Have your say</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-[var(--muted-on-dark)] mb-6">
                    Take part in our active polls, surveys, and product reviews. Your feedback helps shape what comes next.
                  </p>
                  {displaySurveys.length > 0 ? (
                    <div className="space-y-3">
                      {displaySurveys.map((survey: any) => (
                        <div key={survey.id} className="rounded-lg border border-[var(--navy-deep)]/10 bg-[var(--ivory)] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <Badge variant="subtle" className="text-[10px] mb-1">{survey.type}</Badge>
                              <p className="text-sm font-semibold text-[var(--navy-deep)]">{survey.title}</p>
                            </div>
                            <span className="shrink-0 text-xs text-[var(--muted-on-dark)]">{survey.totalResponses} response{survey.totalResponses === 1 ? "" : "s"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Vote size={32} className="mx-auto text-[var(--gold)]" aria-hidden="true" />
                      <p className="mt-2 text-sm text-[var(--muted-on-dark)]">No active surveys right now.</p>
                    </div>
                  )}
                  <Button asChild className="w-full mt-4" variant="outline" size="lg">
                    <a href="/surveys">View all surveys <ArrowRight size={14} /></a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--navy-deep)] text-[var(--text-on-dark)] border-t border-[var(--text-on-dark)]/10">
        <div className="container px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <BrandLogo context="footer" className="w-36 h-36 sm:w-40 sm:h-40" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--muted-on-dark)]">
                Transforming potential into measurable impact through evidence-based assessment, consulting, and professional development.
              </p>
              <div className="mt-6 flex gap-4">
                <a href="https://www.facebook.com/profoundIQ" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-on-dark)] hover:text-[var(--gold)]" aria-label="Facebook">
                  <span className="w-5 h-5"><SocialIcon platform="facebook" /></span>
                </a>
                <a href="https://x.com/ProfoundIQC" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-on-dark)] hover:text-[var(--gold)]" aria-label="X">
                  <span className="w-5 h-5"><SocialIcon platform="x" /></span>
                </a>
                <a href="https://linkedin.com/company/profoundiqconsulting" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-on-dark)] hover:text-[var(--gold)]" aria-label="LinkedIn">
                  <span className="w-5 h-5"><SocialIcon platform="linkedin" /></span>
                </a>
                <a href="https://www.instagram.com/profoundiqconsulting/" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-on-dark)] hover:text-[var(--gold)]" aria-label="Instagram">
                  <span className="w-5 h-5"><SocialIcon platform="instagram" /></span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">Products</h4>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted-on-dark)]">
                <li><a href="/assessment" className="hover:text-[var(--gold)]">Self Assessment</a></li>
                <li><a href="/careerpath" className="hover:text-[var(--gold)]">CareerPath</a></li>
                <li><a href="/psychometrics" className="hover:text-[var(--gold)]">Psychometric Testing</a></li>
                <li><a href="/courses" className="hover:text-[var(--gold)]">Professional Courses</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted-on-dark)]">
                <li><a href="/resources" className="hover:text-[var(--gold)]">Resource Library</a></li>
                <li><a href="/surveys" className="hover:text-[var(--gold)]">Surveys & Polls</a></li>
                <li><a href="/blog" className="hover:text-[var(--gold)]">Insights Blog</a></li>
                <li><a href="/school-solutions" className="hover:text-[var(--gold)]">School Solutions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted-on-dark)]">
                <li><a href="/about" className="hover:text-[var(--gold)]">About Us</a></li>
                <li><a href="/contact" className="hover:text-[var(--gold)]">Contact</a></li>
                <li><a href="/privacy-policy" className="hover:text-[var(--gold)]">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-[var(--gold)]">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--text-on-dark)]/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted-on-dark)]">
              © {new Date().getFullYear()} Profound IQ Consulting. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-[var(--muted-on-dark)]">
              <span>+254 727 374 055</span>
              <span>admin@profoundiqconsulting.com</span>
            </div>
          </div>
        </div>
      </footer>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy-deep)]/80 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
          onMouseDown={e => { if (e.target === e.currentTarget) setShowCheckout(null); }}
        >
          <Suspense fallback={<div className="w-full max-w-md animate-pulse space-y-4 bg-[var(--card)] rounded-2xl p-6" aria-busy="true"><div className="h-8 w-3/4 rounded bg-[var(--muted)]" /><div className="h-4 w-full rounded bg-[var(--muted)]" /><div className="h-4 w-2/3 rounded bg-[var(--muted)]" /><div className="h-4 w-1/2 rounded bg-[var(--muted)]" /></div>}>
            <CheckoutForm
              product={showCheckout.product}
              prefilled={showCheckout.prefilled}
              upsells={[
                { id: "coaching", name: "1-on-1 Coaching Session", priceKes: 5000, description: "60-minute personalized debrief with a certified coach" },
                { id: "team", name: "Team Report Add-on", priceKes: 3000, description: "Aggregate insights for groups of 5+" },
              ]}
              onSuccess={handleCheckoutSuccess}
              onClose={() => setShowCheckout(null)}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}