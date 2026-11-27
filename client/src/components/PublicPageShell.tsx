/* Profound IQ Consulting — Executive Observatory public-page shell: editorial navy fields, ivory reading surfaces, antique-gold route markers, and restrained motion. */
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { SiteNavigation } from "@/components/SiteNavigation";

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
  /* Primary public journey links include href="/contact" */
  return (
    <div className="min-h-screen surface text-[var(--fg)]" aria-label="Social media links">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNavigation variant="public" />

      <main id="main-content" className="scroll-mt-24">
        <section
          className={`${darkHero ? "dark bg-[#101d35] text-[#f7f3e8]" : "surface text-[var(--fg)]"} relative overflow-hidden border-b border-[var(--border-strong)] py-20 sm:py-24 lg:py-32`}
        >
          <div className="absolute right-[10%] top-0 hidden h-full w-px bg-[var(--brand)]/25 lg:block">
            <span className="absolute top-20 -left-1 h-2 w-2 rounded-full bg-[var(--brand)]" />
          </div>
          <div className="container relative">
            {breadcrumbs.length > 0 && (
              <nav
                aria-label="Breadcrumb"
                className={`mb-10 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] ${darkHero ? "text-[var(--fg-muted)]" : "text-[var(--fg-muted)]"}`}
              >
                <Link
                  href="/"
                  className="transition-colors hover:text-[var(--brand-hover)]"
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
                        className="transition-colors hover:text-[var(--brand-hover)]"
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
                <p
                  className={`eyebrow flex items-center gap-3 ${darkHero ? "text-[var(--brand-light)]" : "text-[var(--brand)]"}`}
                >
                  <span className="h-px w-12 bg-[var(--brand)]" />
                  {eyebrow}
                </p>
                <h1 className="display mt-7 max-w-4xl text-5xl leading-[.96] tracking-[-.045em] sm:text-6xl lg:text-8xl">
                  {title}
                </h1>
                <p
                  className={`mt-8 max-w-2xl text-lg leading-8 sm:text-xl ${darkHero ? "text-[var(--fg-muted)]" : "text-[var(--fg-muted)]"}`}
                >
                  {intro}
                </p>
                {cta && (
                  <Link
                    href={cta.href}
                    className="mt-9 inline-flex items-center gap-3 border border-[var(--brand)] px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] transition-colors hover:bg-[var(--brand)] hover:text-[var(--brand-fg)]"
                  >
                    {cta.label} <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
              <aside
                className={`hidden border-l pl-7 lg:block ${darkHero ? "border-[var(--brand)]/60" : "border-[var(--border-strong)]/40"}`}
              >
                <div className="h-24 w-px bg-[var(--brand)]" />
                <p
                  className={`eyebrow mt-5 ${darkHero ? "text-[var(--fg-muted)]" : "text-[var(--fg-muted)]"}`}
                >
                  The signal
                </p>
                <p
                  className={`mt-3 text-sm leading-6 ${darkHero ? "text-[var(--fg-muted)]" : "text-[var(--fg-muted)]"}`}
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
    </div>
  );
}
