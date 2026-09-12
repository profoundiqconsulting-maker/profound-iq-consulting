/* Profound IQ Consulting — Executive Observatory public-page shell: editorial navy fields, ivory reading surfaces, antique-gold route markers, and restrained motion. */
import {
  ArrowUp,
  ArrowUpRight,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import { ExecutiveHeader } from "@/components/ExecutiveHeader";
import { useLocale } from "@/contexts/LocaleContext";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "School solutions", href: "/school-solutions" },
  { label: "Courses", href: "/courses" },
  { label: "Self Assessment", href: "/assessment" },
  { label: "CareerPath", href: "/careerpath" },
  { label: "Resources", href: "/resources" },
  { label: "Surveys", href: "/surveys" },
];

type Breadcrumb = { label: string; href?: string };

type PublicPageShellProps = {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
  cta?: { label: string; href: string };
  darkHero?: boolean;
};

export function PublicPageShell({
  eyebrow,
  title,
  intro,
  breadcrumbs = [],
  children,
  cta,
  darkHero = true,
}: PublicPageShellProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <ExecutiveHeader variant="public" dark />

      <main id="main-content" className="scroll-mt-24">
        <section
          className={`${darkHero ? "bg-[#101d35] text-[#f7f3e8]" : "bg-[#f7f3e8] text-[#16243d]"} relative overflow-hidden border-b border-[#16243d]/10 py-20 sm:py-24 lg:py-32`}
        >
          <div className="absolute right-[10%] top-0 hidden h-full w-px bg-[#c9a34e]/25 lg:block">
            <span className="absolute top-20 -left-1 h-2 w-2 rounded-full bg-[#c9a34e]" />
          </div>
          <div className="container relative">
            {breadcrumbs.length > 0 && (
              <nav
                aria-label="Breadcrumb"
                className={`mb-10 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] ${darkHero ? "text-[#8f9db3]" : "text-[#657084]"}`}
              >
                <Link
                  href="/"
                  className="transition-colors hover:text-[#c9a34e]"
                >
                  Home
                </Link>
                {breadcrumbs.map(crumb => (
                  <span
                    key={crumb.label}
                    className="inline-flex items-center gap-2"
                  >
                    <ChevronRight size={12} aria-hidden="true" />
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-[#c9a34e]"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <div className="grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
              <div className="max-w-4xl">
                <p className="eyebrow flex items-center gap-3 text-[#c9a34e]">
                  <span className="h-px w-12 bg-[#c9a34e]" />
                  {eyebrow}
                </p>
                <h1 className="display mt-7 max-w-4xl text-5xl leading-[.96] tracking-[-.045em] sm:text-6xl lg:text-8xl">
                  {title}
                </h1>
                <p
                  className={`mt-8 max-w-2xl text-lg leading-8 sm:text-xl ${darkHero ? "text-[#d6dce6]" : "text-[#4a566a]"}`}
                >
                  {intro}
                </p>
                {cta && (
                  <Link
                    href={cta.href}
                    className="mt-9 inline-flex items-center gap-3 border border-[#c9a34e] px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] transition-colors hover:bg-[#c9a34e] hover:text-[#101d35]"
                  >
                    {cta.label} <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
              <aside
                className={`hidden border-l pl-7 lg:block ${darkHero ? "border-[#c9a34e]/60" : "border-[#16243d]/20"}`}
              >
                <div className="h-24 w-px bg-[#c9a34e]" />
                <p
                  className={`eyebrow mt-5 ${darkHero ? "text-[#8f9db3]" : "text-[#a27e2e]"}`}
                >
                  The signal
                </p>
                <p
                  className={`mt-3 text-sm leading-6 ${darkHero ? "text-[#d6dce6]" : "text-[#657084]"}`}
                >
                  Insight becomes valuable when it can be understood, shared,
                  and applied.
                </p>
              </aside>
            </div>
          </div>
        </section>
        {children}
      </main>

      <footer id="site-footer" className="bg-[#101d35] text-[#f7f3e8]">
        <div className="container grid gap-12 py-16 md:grid-cols-[1.2fr_.8fr_.8fr] lg:py-20">
          <div>
            <BrandLogo
              context="footer"
              className="border border-[#c9a34e]/70"
            />
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#c1cad7]">
              Transformational learning, educational consulting, school
              improvement, psychometric insight, and professional development
              for a changing world.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e]"
            >
              Talk to our consultants <ArrowUpRight size={14} />
            </Link>
            <div
              className="mt-7 flex flex-wrap items-center gap-2"
              aria-label="Social media links"
            >
              <a
                href="https://www.facebook.com/profoundIQ"
                target="_blank"
                rel="noreferrer"
                aria-label="Profound IQ Consulting on Facebook"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-[#c1cad7] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
              >
                <Facebook size={17} />
              </a>
              <a
                href="https://x.com/ProfoundIQC"
                target="_blank"
                rel="noreferrer"
                aria-label="Profound IQ Consulting on X"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-[#c1cad7] transition-all duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#101d35]"
              >
                <X size={17} />
              </a>
              <a
                href="https://linkedin.com/company/profoundiqconsulting"
                target="_blank"
                rel="noreferrer"
                aria-label="Profound IQ Consulting on LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-[#c1cad7] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
              >
                <Linkedin size={17} />
              </a>
              <a
                href="https://www.instagram.com/profoundiqconsulting/"
                target="_blank"
                rel="noreferrer"
                aria-label="Profound IQ Consulting on Instagram"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-[#c1cad7] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E4405F] hover:bg-[#E4405F] hover:text-white"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://wa.me/254727374055"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Profound IQ Consulting on WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center border border-[#25D366]/60 text-[#d9fbe5] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#25D366] hover:bg-[#25D366]/10"
              >
                <MessageCircle size={17} />
              </a>
            </div>
          </div>
          <div>
            <p className="eyebrow text-[#c9a34e]">Explore</p>
            <div className="mt-5 grid gap-3 text-sm text-[#c1cad7]">
              {navItems.slice(0, 6).map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-[#c9a34e]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow text-[#c9a34e]">Trust & access</p>
            <div className="mt-5 grid gap-3 text-sm text-[#c1cad7]">
              <Link
                href="/verify/certificate"
                className="transition-colors hover:text-[#c9a34e]"
              >
                Verify a certificate
              </Link>
              <Link
                href="/verify/psychometric"
                className="transition-colors hover:text-[#c9a34e]"
              >
                Verify a report
              </Link>
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-[#c9a34e]"
              >
                Privacy policy
              </Link>
              <Link
                href="/terms-of-service"
                className="transition-colors hover:text-[#c9a34e]"
              >
                Terms of service
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container flex flex-col gap-3 py-5 text-[10px] font-bold uppercase tracking-[.14em] text-[#8f9db3] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Profound IQ Consulting</span>
            <span>Online / Kenya / Global reach</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
