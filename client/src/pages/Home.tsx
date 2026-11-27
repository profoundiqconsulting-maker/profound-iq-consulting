import { useMemo } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  GraduationCap,
  Layers3,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteNavigation } from "@/components/SiteNavigation";
import { SocialIcon } from "@/components/SocialMediaIcons";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import { COURSE_PRICE_KES } from "@shared/courseCatalog";
import { CAREER_PATH_PRICE_KES } from "@shared/careerPath";

const audiencePaths = [
  {
    eyebrow: "For individuals",
    title: "Understand where you are",
    copy: "Turn reflection into a clear picture of your strengths, patterns, and next best move.",
    icon: BrainCircuit,
    href: "/assessment",
    cta: "Start self assessment",
  },
  {
    eyebrow: "For teams",
    title: "Move talent with intention",
    copy: "Use evidence to align people, roles, leadership readiness, and development priorities.",
    icon: Users,
    href: "/careerpath",
    cta: "Explore CareerPath",
  },
  {
    eyebrow: "For schools",
    title: "Build capability at scale",
    copy: "Bring assessments, research, and practical learning together in a school-wide pathway.",
    icon: School,
    href: "/school-solutions",
    cta: "View school solutions",
  },
] as const;

const products = [
  {
    title: "Self Assessment",
    copy: "A private, practical reflection framework for identifying strengths and development areas.",
    icon: BrainCircuit,
    href: "/assessment",
    meta: "Free",
  },
  {
    title: "CareerPath",
    copy: "Career and competency guidance designed for learners, teams, and coaching conversations.",
    icon: BriefcaseBusiness,
    href: "/careerpath",
    meta: `KES ${CAREER_PATH_PRICE_KES.toLocaleString()}`,
  },
  {
    title: "Psychometrics",
    copy: "Evidence-led profiles for cognitive, emotional, career, and leadership insight.",
    icon: BarChart3,
    href: "/psychometrics",
    meta: "From KES 699",
  },
] as const;

const schema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Profound IQ Consulting",
  url: PUBLISHED_SITE_ORIGIN,
  email: "admin@profoundiqconsulting.com",
  telephone: "+254727374055",
  description:
    "Assessment, consulting, and professional development for individuals, teams, and schools.",
};

export default function Home() {
  const catalogQuery = trpc.course.catalogList.useQuery(undefined, {
    retry: false,
  });
  const resourcesQuery = trpc.resources.listPublished.useQuery(undefined, {
    retry: false,
  });

  const courses = useMemo(() => {
    return (catalogQuery.data ?? []).slice(0, 3);
  }, [catalogQuery.data]);

  const resources = useMemo(() => {
    return (resourcesQuery.data ?? [])
      .slice()
      .sort((a: { sortOrder: number }, b: { sortOrder: number }) =>
        a.sortOrder - b.sortOrder
      )
      .slice(0, 3);
  }, [resourcesQuery.data]);

  return (
    <div className="min-h-screen bg-[#f6f4ee] font-body text-[#16243d] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNavigation variant="public" />

      <main id="main-content" className="scroll-mt-24">
        <section className="relative overflow-hidden bg-[#10213b] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at 82% 18%, rgba(211,174,92,.32), transparent 22%), radial-gradient(circle at 12% 88%, rgba(255,255,255,.09), transparent 18%)",
            }}
          />
          <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-12 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#d5b45f]">
                <Sparkles size={14} />
                Clarity for better decisions
              </p>
              <h1 className="font-display text-[clamp(3rem,7vw,5.75rem)] leading-[0.96] tracking-[-0.045em]">
                Know more.
                <br />
                <span className="text-[#d5b45f]">Become ready.</span>
              </h1>
              <p className="mt-7 max-w-xl text-[clamp(1.05rem,1.5vw,1.28rem)] leading-8 text-white/72">
                Evidence-based assessment, practical learning, and focused
                consulting for people and organizations making important choices.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  className="h-14 bg-[#d5b45f] px-6 text-[#10213b] hover:bg-[#e3c778]"
                >
                  <a href="/assessment">
                    Begin self assessment
                    <ArrowRight size={18} />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="xl"
                  className="h-14 border-white/20 bg-transparent px-6 text-white hover:border-[#d5b45f] hover:bg-white/5 hover:text-[#d5b45f]"
                >
                  <a href="/courses">
                    Explore courses
                    <ArrowUpRight size={17} />
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-5 top-12 h-32 w-32 rounded-full border border-[#d5b45f]/30" />
              <div className="absolute -right-4 bottom-16 h-20 w-20 rounded-full bg-[#d5b45f]/10 blur-xl" />
              <div className="relative rounded-[28px] border border-white/12 bg-white/[0.065] p-5 backdrop-blur-sm sm:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d5b45f]">
                      Your development lens
                    </p>
                    <p className="mt-2 font-display text-2xl">From insight to action</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d5b45f]/50 bg-[#d5b45f]/10">
                    <GraduationCap className="text-[#d5b45f]" size={22} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-5">
                  {[
                    ["01", "Discover", "Your strengths"],
                    ["02", "Decide", "Your direction"],
                    ["03", "Develop", "Your capability"],
                    ["04", "Demonstrate", "Your progress"],
                  ].map(([number, title, copy], index) => (
                    <div
                      key={number}
                      className={`rounded-2xl border p-4 ${
                        index === 0
                          ? "border-[#d5b45f]/50 bg-[#d5b45f]/10"
                          : "border-white/10 bg-white/[0.035]"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-[#d5b45f]">
                        {number}
                      </span>
                      <p className="mt-3 font-semibold">{title}</p>
                      <p className="mt-1 text-xs text-white/55">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#16243d]/10 bg-white">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 divide-x divide-[#16243d]/10 px-5 sm:px-8 lg:grid-cols-4 lg:px-12">
            {[
              ["10k+", "Assessments completed"],
              ["500+", "Organizations reached"],
              ["50+", "Professional courses"],
              ["94%", "Learner completion"],
            ].map(([value, label]) => (
              <div key={label} className="px-3 py-7 text-center sm:px-6">
                <p className="font-display text-3xl text-[#16243d] sm:text-4xl">{value}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--fg-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1280px]">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--brand)]">
                Choose your starting point
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.25rem,4vw,4rem)] leading-[1.05] tracking-[-0.035em]">
                A clear pathway for every kind of growth.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {audiencePaths.map((path, index) => {
                const Icon = path.icon;
                return (
                  <a
                    key={path.title}
                    href={path.href}
                    className="group relative overflow-hidden border border-[#16243d]/10 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#b39142]/50 hover:shadow-[0_18px_50px_rgba(22,36,61,.08)] sm:p-8"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2eddf] text-[var(--brand)]">
                        <Icon size={21} />
                      </div>
                      <span className="font-mono text-xs text-[var(--fg-subtle)]">0{index + 1}</span>
                    </div>
                    <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                      {path.eyebrow}
                    </p>
                    <h3 className="mt-3 max-w-xs font-display text-3xl leading-tight">
                      {path.title}
                    </h3>
                    <p className="mt-4 max-w-sm leading-7 text-[var(--fg-muted)]">{path.copy}</p>
                    <span className="mt-8 flex items-center gap-2 text-sm font-bold text-[#16243d]">
                      {path.cta}
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[#16243d]/10 bg-[#eeece5] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--brand)]">
                  Tools that create movement
                </p>
                <h2 className="mt-4 font-display text-[clamp(2.25rem,4vw,4rem)] leading-[1.05] tracking-[-0.035em]">
                  Start with the insight you need now.
                </h2>
              </div>
              <Button asChild variant="outline" className="border-[#16243d]/20">
                <a href="/services">
                  Compare solutions
                  <ChevronRight size={16} />
                </a>
              </Button>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden border border-[#16243d]/10 bg-[#16243d]/10 md:grid-cols-3">
              {products.map(product => {
                const Icon = product.icon;
                return (
                  <a
                    key={product.title}
                    href={product.href}
                    className="group bg-[#f9f8f4] p-7 transition-colors hover:bg-white sm:p-8"
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={23} className="text-[var(--brand)]" />
                      <span className="text-xs font-bold text-[var(--fg-muted)]">
                        {product.meta}
                      </span>
                    </div>
                    <h3 className="mt-12 font-display text-2xl">{product.title}</h3>
                    <p className="mt-3 min-h-20 leading-7 text-[var(--fg-muted)]">
                      {product.copy}
                    </p>
                    <span className="mt-6 flex items-center gap-2 text-sm font-bold">
                      Explore
                      <ArrowUpRight
                        size={15}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--brand)]">
                  Professional learning
                </p>
                <h2 className="mt-4 font-display text-[clamp(2.25rem,4vw,4rem)] leading-[1.05] tracking-[-0.035em]">
                  Build what the work demands.
                </h2>
                <p className="mt-5 max-w-md leading-7 text-[var(--fg-muted)]">
                  Applied courses for leadership, communication, strategy,
                  wellbeing, and the capabilities that improve performance.
                </p>
                <Button asChild className="mt-8 bg-[#16243d] text-white hover:bg-[#263956]">
                  <a href="/courses">
                    Browse all courses
                    <ArrowRight size={16} />
                  </a>
                </Button>
              </div>

              <div className="divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
                {courses.length > 0 ? (
                  courses.map((course: any, index: number) => (
                    <a
                      key={course.slug}
                      href={`/courses/${course.slug}`}
                      className="group grid gap-4 py-7 sm:grid-cols-[56px_1fr_auto] sm:items-center"
                    >
                      <span className="font-mono text-xs text-[var(--brand)]">
                        0{index + 1}
                      </span>
                      <div>
                        <h3 className="font-display text-2xl">{course.title}</h3>
                        <p className="mt-2 line-clamp-1 text-sm text-[var(--fg-muted)]">
                          {course.strapline || course.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <span className="text-sm font-bold">
                          KES{" "}
                          {(
                            course.priceKes ?? COURSE_PRICE_KES
                          ).toLocaleString()}
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#16243d]/15 transition group-hover:border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white">
                          <ArrowUpRight size={16} />
                        </span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="py-12 text-center text-sm text-[var(--fg-muted)]">
                    Loading the course catalogue…
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#16243d]/10 bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--brand)]">
                Resource library
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-[-0.03em]">
                Useful thinking, ready to use.
              </h2>
              <div className="mt-8 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
                {resources.length > 0 ? (
                  resources.map((resource: any) => (
                    <a
                      key={resource.id}
                      href="/resources"
                      className="group flex items-center justify-between gap-4 py-5"
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                          {resource.category}
                        </p>
                        <p className="mt-1 font-semibold">{resource.title}</p>
                      </div>
                      <ChevronRight
                        size={17}
                        className="shrink-0 transition-transform group-hover:translate-x-1"
                      />
                    </a>
                  ))
                ) : (
                  <p className="py-8 text-sm text-[var(--fg-muted)]">
                    New resources are being prepared.
                  </p>
                )}
              </div>
              <a
                href="/resources"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold"
              >
                Visit resource library
                <ArrowRight size={15} />
              </a>
            </div>

            <div className="border border-[#16243d]/10 bg-[#10213b] p-8 text-white sm:p-10">
              <ShieldCheck size={28} className="text-[#d5b45f]" />
              <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.22em] text-[#d5b45f]">
                A conversation can help
              </p>
              <h2 className="mt-4 max-w-md font-display text-4xl leading-tight">
                Not sure which path fits?
              </h2>
              <p className="mt-5 max-w-md leading-7 text-white/65">
                Tell us what you are trying to understand, improve, or change.
                We will help you find the right place to begin.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-[#d5b45f] text-[#10213b] hover:bg-[#e3c778]"
              >
                <a href="/contact">
                  Start a conversation
                  <ArrowRight size={16} />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#16243d]/10 bg-[#f6f4ee]">
        <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <BrandLogo context="footer" className="h-32 w-32" />
              <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--fg-muted)]">
                Evidence-based assessment, consulting, and professional development
                for individuals, teams, and schools.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                Explore
              </p>
              <div className="mt-5 grid gap-3 text-sm">
                <a href="/assessment">Self Assessment</a>
                <a href="/careerpath">CareerPath</a>
                <a href="/psychometrics">Psychometrics</a>
                <a href="/courses">Professional Courses</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                Company
              </p>
              <div className="mt-5 grid gap-3 text-sm">
                <a href="/about">About</a>
                <a href="/school-solutions">School solutions</a>
                <a href="/resources">Resources</a>
                <a href="/contact">Contact</a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-5 border-t border-[#16243d]/10 pt-6 text-xs text-[var(--fg-muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Profound IQ Consulting</p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/profoundiqconsulting"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon platform="linkedin" />
              </a>
              <a
                href="https://x.com/ProfoundIQC"
                aria-label="X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon platform="x" />
              </a>
              <a
                href="https://www.instagram.com/profoundiqconsulting/"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon platform="instagram" />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
