import { useEffect, useState, useMemo } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ArrowUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";

type NavItem = { label: string; href: string; active?: boolean };

export const siteNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "School Solutions", href: "/school-solutions" },
  { label: "Courses", href: "/courses" },
  { label: "Psychometrics", href: "/psychometrics" },
  { label: "Self Assessment", href: "/assessment" },
  { label: "CareerPath", href: "/careerpath" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
  { label: "Dashboard", href: "/dashboard" },
];

type SiteNavigationProps = {
  variant?: "home" | "public";
  dark?: boolean;
  compact?: boolean;
};

export function SiteNavigation({ variant = "public", dark = true, compact = false }: SiteNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(compact);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const userDisplay = isAuthenticated ? user?.email || user?.name || "Signed in" : null;

  useEffect(() => {
    const onScroll = () => {
      const compactMode = window.scrollY > 28;
      setIsCompact(compactMode);
      setShowBackToTop(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [menuOpen]);

  const userRole = user?.role?.toLowerCase();
  const workspaceHref =
    userRole === "admin"
      ? "/admin/overview"
      : userRole === "staff"
        ? "/staff"
        : "/dashboard";

  const headerTone = dark
    ? "border-white/15 bg-[var(--background)]/95 backdrop-blur-md text-[var(--text-on-dark)] shadow-[0_4px_20px_rgba(7,17,35,.12)]"
    : "border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md text-[var(--foreground)] shadow-[0_4px_20px_rgba(8,15,26,.06)]";

  const navText = dark ? "text-[var(--muted-on-dark)] hover:text-[var(--gold)]" : "text-[var(--muted-foreground)] hover:text-[var(--gold)]";
  const activeText = dark ? "text-[var(--gold)]" : "text-[var(--gold)]";
  const pillButton = dark
    ? "border border-[var(--gold)] text-[var(--text-on-dark)] hover:bg-[var(--gold)] hover:text-[var(--navy-deep)]"
    : "border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy-deep)]";
  const secondaryButton = dark
    ? "border border-white/20 text-[var(--muted-on-dark)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
    : "border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]";
  const compactNavClass = `text-[9px] font-black uppercase tracking-[.08em] transition-colors`;

  const mainNavItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "School Solutions", href: "/school-solutions" },
      { label: "Courses", href: "/courses" },
      { label: "Psychometrics", href: "/psychometrics" },
      { label: "Self Assessment", href: "/assessment" },
      { label: "CareerPath", href: "/careerpath" },
      { label: "Resources", href: "/resources" },
    ];
    if (isAuthenticated && user?.role) {
      items.push({
        label: "My Space",
        href: workspaceHref,
      });
    }
    return items.map(item => ({
      ...item,
      active: location === item.href || location.startsWith(`${item.href}/`),
    }));
  }, [isAuthenticated, user?.role, workspaceHref, location]);

  return (
    <>
      <header
        data-sticky-navigation
        data-compact={isCompact}
        className={`sticky top-0 z-50 border-b transition-all duration-200 ${headerTone} ${isCompact ? "shadow-[0_8px_30px_rgba(7,17,35,.18)]" : ""} overflow-x-hidden`}
      >
        <div className={`container flex items-center justify-between gap-3 transition-[min-height,padding] duration-200 sm:gap-4 ${isCompact ? "min-h-14 py-1.5" : "min-h-16 py-2 sm:py-3"}`}>
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Profound IQ Consulting home">
            <BrandLogo context="public page" compact={isCompact} className="border border-[var(--gold)]/70" />
          </Link>

          <nav id="site-navigation" className="scrollbar-hide hidden items-center gap-5 text-[10px] font-black uppercase tracking-[.14em] md:flex" aria-label="Primary navigation">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={`whitespace-nowrap transition-colors ${item.active ? activeText : navText}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            {!isAuthenticated && (
              <>
                <Link href="/auth?mode=login" className={`hidden border px-1 py-1 text-[9px] font-black uppercase tracking-[.12em] md:inline-flex ${secondaryButton}`} style={{ fontSize: '9px', padding: '2px 4px' }}>
                  Sign in
                </Link>
                <Link href="/auth?mode=register" className={`hidden border px-1 py-1 text-[9px] font-black uppercase tracking-[.12em] md:inline-flex ${secondaryButton}`} style={{ fontSize: '9px', padding: '2px 4px' }}>
                  Sign up
                </Link>
              </>
            )}
            <Link href="/contact" className={`hidden items-center gap-0.5 px-1.5 py-1 text-[9px] font-black uppercase tracking-[.1em] transition-colors md:inline-flex ${pillButton}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
              Start a conversation <ArrowUpRight size={10} />
            </Link>
          </div>

          <button
            type="button"
            className={`inline-flex h-9 w-9 items-center justify-center border md:hidden ${dark ? "border-white/20" : "border-[var(--border)]"}`}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <nav id="site-navigation-mobile" className={`border-t px-4 py-5 shadow-[0_16px_30px_rgba(7,17,35,.18)] md:hidden ${dark ? "border-white/10 bg-[var(--background)]/95 backdrop-blur-md" : "border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md"}`} aria-label="Mobile navigation">
            <div className="container flex flex-col gap-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`border-b px-1 py-3 text-[10px] font-black uppercase tracking-[.12em] transition-colors ${item.active ? activeText : dark ? "border-white/10 text-[var(--muted-on-dark)] hover:text-[var(--gold)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--gold)]"}`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-3 flex flex-wrap items-center gap-1">
                {!isAuthenticated && (
                  <>
                    <Link href="/auth?mode=login" onClick={() => setMenuOpen(false)} className={`inline-flex items-center gap-0.5 border px-1.5 py-1 text-[9px] font-black uppercase tracking-[.1em] ${pillButton}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                      Sign in
                    </Link>
                    <Link href="/auth?mode=register" onClick={() => setMenuOpen(false)} className={`inline-flex items-center gap-0.5 border px-1.5 py-1 text-[9px] font-black uppercase tracking-[.1em] ${secondaryButton}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                      Sign up
                    </Link>
                  </>
                )}
                <Link href="/contact" onClick={() => setMenuOpen(false)} className={`inline-flex items-center gap-0.5 border px-1.5 py-1 text-[9px] font-black uppercase tracking-[.1em] ${pillButton}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                  Start a conversation <ArrowUpRight size={10} />
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {showBackToTop && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-sm text-[var(--foreground)] shadow-md transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
        >
          <ArrowUp size={16} />
        </button>
      )}
      {isAuthenticated && userDisplay && (
        <div
          data-signed-in-banner
          className="sticky top-16 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md px-4 py-2 text-center text-xs font-medium text-[var(--gold)] md:px-6"
          role="status"
          aria-live="polite"
        >
          Signed in as {userDisplay}
        </div>
      )}
    </>
  );
}