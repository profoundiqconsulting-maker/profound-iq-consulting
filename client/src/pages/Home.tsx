/* Profound IQ Consulting — Modern Executive Landing Page. Clean, professional, elegant with enhanced UX/UI. */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  X,
  Award,
  Users,
  BookOpen,
  BrainCircuit,
  BarChart3,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ExecutiveHeader } from "@/components/ExecutiveHeader";
import { CourseShareActions } from "@/components/CourseShareActions";
import { trpc } from "@/lib/trpc";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { courseCatalog, COURSE_PRICE_KES } from "@shared/courseCatalog";
import { ASSESSMENT_PRICE_KES } from "@shared/assessment";
import { CAREER_PATH_PRICE_KES } from "@shared/careerPath";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

const baseCourses = courseCatalog.map(course => ({
  ...course,
  price: `KES ${COURSE_PRICE_KES.toLocaleString()}`,
  format: course.duration,
  body: course.description,
  isDatabaseItem: false,
}));

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
    href: "/contact",
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
  const [catalogCategory, setCatalogCategory] = useState<string>("All categories");
  const [catalogPage, setCatalogPage] = useState(1);
  const CATALOG_PAGE_SIZE = 6;
  const [selectedCourse, setSelectedCourse] = useState<
    (typeof courses)[number] | null
  >(null);
  const [enrollmentSubmitted, setEnrollmentSubmitted] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const enrollment = trpc.enrollment.create.useMutation();
  const inquiry = trpc.inquiry.create.useMutation();
  const { user, isAuthenticated } = useAuth();
  const liveCatalog = trpc.catalog.listPublished.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const courses = useMemo(() => {
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
    return [...merged, ...Array.from(bySlug.values())] as (typeof baseCourses)[number][];
  }, [liveCatalog.data]);

  const uniqueLevels = Array.from(
    new Set(courses.map(course => course.skillLevel).filter(Boolean))
  );
  const uniqueCategories = Array.from(
    new Set(courses.map(course => course.category).filter(Boolean))
  ).sort();
  const filteredCatalog = courses.filter(course => {
    if (catalogLevel !== "All levels" && course.skillLevel !== catalogLevel)
      return false;
    if (catalogCategory !== "All categories" && course.category !== catalogCategory)
      return false;
    return true;
  });
  const catalogPageCount = Math.max(
    1,
    Math.ceil(filteredCatalog.length / CATALOG_PAGE_SIZE)
  );
  const pagedCatalog = filteredCatalog.slice(
    (catalogPage - 1) * CATALOG_PAGE_SIZE,
    catalogPage * CATALOG_PAGE_SIZE
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
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openEnrollment = (course: (typeof courses)[number]) => {
    setEnrollmentSubmitted(false);
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
    <div className="min-h-screen bg-white text-[#0f172a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <ExecutiveHeader variant="home" dark />

      <main id="top">
        {/* Modern Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('/profound-hero-f95a7f36_76e0eb6f.svg')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          
          <div className="container relative px-6 py-24 lg:px-8 lg:py-32">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                  <Sparkles size={14} />
                  Executive Assessment & Development
                </div>
                
                <h1 className="mt-8 text-5xl leading-[1.1] tracking-tight lg:text-7xl">
                  Transform potential into{" "}
                  <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    measurable impact
                  </span>
                </h1>
                
                <p className="mt-8 text-lg leading-relaxed text-slate-300 lg:text-xl">
                  Profound IQ Consulting helps professionals and organizations move from raw potential to purposeful impact through evidence-based learning, assessment, and strategic development.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <a
                    href="/assessment"
                    className="group inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-sm font-bold uppercase tracking-wider text-slate-900 shadow-lg shadow-amber-500/25 transition-all hover:gap-4 hover:shadow-xl hover:shadow-amber-500/40"
                  >
                    Take the KES 399 assessment
                    <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="#offerings"
                    className="inline-flex items-center gap-3 rounded-lg border border-white/20 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:border-amber-400 hover:text-amber-300"
                  >
                    Explore services
                    <ArrowDownRight size={18} />
                  </a>
                </div>

                <div className="mt-12 flex items-center gap-8 text-sm text-slate-400">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-slate-900 bg-gradient-to-br from-slate-700 to-slate-600"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-white">Trusted by 500+ organizations</p>
                    <p className="text-xs">Across Kenya and beyond</p>
                  </div>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 blur-2xl" />
                  <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                          <Award className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Professional Courses</p>
                          <p className="text-sm text-slate-400">50+ expert-led programs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                          <BarChart3 className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Psychometric Testing</p>
                          <p className="text-sm text-slate-400">Evidence-based insights</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                          <Users className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">1-on-1 Coaching</p>
                          <p className="text-sm text-slate-400">Personalized development</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-20 grid grid-cols-2 gap-8 border-t border-white/10 pt-12 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-amber-400 lg:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="offerings" className="bg-slate-50 py-24 lg:py-32">
          <div className="container px-6 lg:px-8">
            <div className="mb-16 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Our Services
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                Comprehensive development solutions
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
                From individual assessments to organizational consulting, we provide the tools and expertise to drive meaningful growth.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <a
                    key={service.index}
                    href={service.href}
                    className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25">
                        <Icon size={24} />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                        {service.tag}
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-slate-900">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {service.body}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-amber-600">
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
        <section className="bg-white py-24 lg:py-32">
          <div className="container px-6 lg:px-8">
            <div className="mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Featured Programs
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
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
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                        <Icon size={28} />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        {service.tag}
                      </p>
                      <h3 className="mt-3 text-3xl font-bold">
                        {service.title}
                      </h3>
                      <p className="mt-4 text-base leading-relaxed text-slate-300">
                        {service.body}
                      </p>
                      <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-amber-400">
                        Open service
                        <ArrowUpRight
                          size={16}
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
        <section className="bg-slate-900 py-24 lg:py-32">
          <div className="container px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                Client Success Stories
              </p>
              <div className="mt-12">
                <div className="relative h-64">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-700 ${
                        index === currentTestimonial
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      <blockquote className="text-3xl font-light leading-relaxed text-white lg:text-4xl">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="mt-8">
                        <p className="font-semibold text-amber-400">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-slate-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentTestimonial
                          ? "w-8 bg-amber-400"
                          : "w-2 bg-slate-700 hover:bg-slate-600"
                      }`}
                      aria-label={`Testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Catalog */}
        <section id="courses" className="bg-slate-50 py-24 lg:py-32">
          <div className="container px-6 lg:px-8">
            <div className="mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Course Catalog
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                Choose the capability you want to build
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                Each course is designed to meet professional standards while giving you a practical path from reflection to measurable progress.
              </p>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCatalogLevel("All levels")}
                className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  catalogLevel === "All levels"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-900"
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
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-slate-900"
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
                  className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-amber-300"
                >
                  <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-amber-600">
                          {course.index}
                        </span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {course.format}
                        </span>
                      </div>
                      <h3 className="mt-4 text-2xl font-bold text-slate-900">
                        {course.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-slate-600">
                        {course.body}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-4">
                        <button
                          type="button"
                          onClick={() => openEnrollment(course)}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800"
                        >
                          Enroll now
                          <ArrowUpRight size={14} />
                        </button>
                        <a
                          href={
                            course.modules.length
                              ? `/courses/${course.slug}`
                              : "#contact"
                          }
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors hover:text-amber-600"
                        >
                          {course.modules.length ? "Open syllabus" : "Discuss item"}
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                    <div className="lg:text-right">
                      <p className="text-3xl font-bold text-slate-900">
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
                  className="inline-flex items-center gap-3 rounded-lg border-2 border-slate-900 px-8 py-3 text-sm font-bold uppercase tracking-wider text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
                >
                  Load more
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {filteredCatalog.length === 0 && (
              <p className="py-12 text-center text-base text-slate-500">
                No courses match the selected filters.
              </p>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-slate-900 py-24 lg:py-32">
          <div className="container px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                  Get in Touch
                </p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-white lg:text-5xl">
                  Make the next step deliberate
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-300">
                  Tell us what you are working toward. We will help you see the path with more clarity.
                </p>
                <div className="mt-10 space-y-6">
                  <a
                    href="mailto:admin@profoundiqconsulting.com"
                    className="flex items-center gap-4 text-slate-300 transition-colors hover:text-amber-400"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-amber-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Email us</p>
                      <p className="text-sm">admin@profoundiqconsulting.com</p>
                    </div>
                  </a>
                  <a
                    href="tel:+254727374055"
                    className="flex items-center gap-4 text-slate-300 transition-colors hover:text-amber-400"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-amber-400">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Call us</p>
                      <p className="text-sm">+254 727 374 055</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-amber-400">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Always online</p>
                      <p className="text-sm">WhatsApp support available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={submitInquiry}
                className="rounded-2xl bg-white p-8 shadow-xl lg:p-10"
              >
                <h3 className="text-2xl font-bold text-slate-900">
                  Start with a question
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                {sent && (
                  <div
                    role="status"
                    className="mt-6 flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                  >
                    <Check size={18} />
                    Your inquiry has been received. We will be in touch shortly.
                  </div>
                )}

                {inquiryError && (
                  <div
                    role="alert"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                    {inquiryError}
                  </div>
                )}

                <div className="mt-8 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Your name
                    </label>
                    <input
                      required
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email address
                    </label>
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Inquiry subject
                    </label>
                    <select
                      required
                      name="category"
                      defaultValue="general"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      What are you exploring?
                    </label>
                    <textarea
                      required
                      name="message"
                      placeholder="A course, a team challenge, a new direction…"
                      rows={4}
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-base outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quick verification
                    </label>
                    <p className="mt-2 text-sm text-slate-600">
                      What is {mathA} + {mathB}?
                    </p>
                    <input
                      required
                      name="mathAnswer"
                      type="number"
                      inputMode="numeric"
                      min="2"
                      max="40"
                      placeholder="Your answer"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inquiry.isPending}
                    className="w-full rounded-lg bg-slate-900 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-5 backdrop-blur-sm"
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
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                  Enrollment / next step
                </p>
                <h2
                  id="enrollment-title"
                  className="mt-3 text-3xl font-bold tracking-tight text-slate-900"
                >
                  Reserve your place.
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close enrollment form"
                onClick={() => setSelectedCourse(null)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {enrollmentSubmitted ? (
              <div className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                <Check size={24} className="text-emerald-600" />
                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  Your interest is recorded.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Thank you for choosing {selectedCourse.title}. Our team will follow up using the email you provided.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="mt-6 text-sm font-semibold text-amber-600 underline underline-offset-4"
                >
                  Close form
                </button>
              </div>
            ) : (
              <form className="mt-8" onSubmit={submitEnrollment}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    >
                      {courses.map(course => (
                        <option key={course.title} value={course.title}>
                          {course.title} — {course.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Your name
                    </label>
                    <input
                      required
                      name="enrollment-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email address
                    </label>
                    <input
                      required
                      name="enrollment-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      required
                      id="enrollment-consent"
                      name="enrollment-consent"
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label
                      htmlFor="enrollment-consent"
                      className="text-sm leading-relaxed text-slate-600"
                    >
                      I consent to Profound IQ Consulting using my name and email to respond to this enrollment inquiry, in line with our privacy policy.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={enrollment.isPending}
                    className="w-full rounded-lg bg-slate-900 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800 disabled:opacity-60"
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
      <footer className="bg-slate-900 py-16 text-white lg:py-20">
        <div className="container px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <BrandLogo context="footer" />
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
                Transformational learning, educational consulting, school improvement, psychometric insight, and professional development for a changing world.
              </p>
              <a
                href="/contact"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300"
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-all hover:border-amber-400 hover:text-amber-400"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://x.com/ProfoundIQC"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on X"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-all hover:border-white hover:text-white"
                >
                  <X size={18} />
                </a>
                <a
                  href="https://linkedin.com/company/profoundiqconsulting"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on LinkedIn"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-all hover:border-blue-400 hover:text-blue-400"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://www.instagram.com/profoundiqconsulting/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Profound IQ Consulting on Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-all hover:border-pink-400 hover:text-pink-400"
                >
                  <Instagram size={18} />
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                Quick Links
              </p>
              <div className="mt-6 grid gap-3">
                <a href="/about" className="text-sm text-slate-400 transition-colors hover:text-white">
                  About
                </a>
                <a href="/services" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Services
                </a>
                <a href="/courses" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Courses
                </a>
                <a href="/assessment" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Self Assessment
                </a>
                <a href="/resources" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Resources
                </a>
                <a href="/contact" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Contact
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                Legal
              </p>
              <div className="mt-6 grid gap-3">
                <a
                  href="/privacy-policy"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms-of-service"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-slate-800 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-slate-500">
                © 2026 Profound IQ Consulting. All rights reserved.
              </p>
              <p className="text-sm text-slate-500">
                Online / Kenya / Global reach
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
