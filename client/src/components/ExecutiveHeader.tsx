/* Profound IQ Consulting — Executive Header Redesign
   Top-level nav: Home, About, School Solutions, Resources, Contacts, My Space
   Sub menu: Courses, Psychometrics, CareerPath, Self Assessment, Sign in, Enroll
   Sub-header: Sign out for authenticated users
   Fully responsive, no horizontal overflow, executive/professional aesthetic.
*/
import { useEffect, useState } from "react";
import { LogOut, Menu, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector } from "@/components/LanguageSelector";

const primaryNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "School Solutions", href: "/school-solutions" },
  { label: "Resources", href: "/resources" },
  { label: "Contacts", href: "/contact" },
];

const subMenuItems = [
  { label: "Courses", href: "/courses" },
  { label: "Psychometrics", href: "/psychometrics" },
  { label: "CareerPath", href: "/careerpath" },
  { label: "Self Assessment", href: "/assessment" },
  { label: "Sign in", href: "/auth?mode=login" },
  { label: "Enroll", href: "/auth?mode=register" },
];

type ExecutiveHeaderProps = {
  variant?: "home" | "public" | "dashboard";
  dark?: boolean;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ExecutiveHeader({ variant = "public", dark = true }: ExecutiveHeaderProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isItemActive = (href: string) => {
    const [pathOnly] = href.split("?");
    return location === href || location.startsWith(`${pathOnly}/`);
  };

  const headerTone = dark
    ? "border-b border-white/[0.06] bg-[#0a1426]/95 text-[#f7f3e8] shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(7,17,35,0.18)] supports-[backdrop-filter]:bg-[#0a1426]/75"
    : "border-b border-[#16243d]/[0.06] bg-white/95 text-[#16243d] shadow-[0_1px_0_rgba(22,36,61,0.04),0_8px_24px_rgba(8,15,26,0.06)] supports-[backdrop-filter]:bg-white/75";

  const subHeaderTone = dark
    ? "border-b border-white/[0.04] bg-[#070f1f]/90 text-[#c1cad7] supports-[backdrop-filter]:bg-[#070f1f]/70"
    : "border-b border-[#16243d]/[0.06] bg-[#f7f3e8]/90 text-[#4a566a] supports-[backdrop-filter]:bg-[#f7f3e8]/70";

  useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header data-executive-header data-compact={isCompact} className={cn("sticky top-0 z-50 backdrop-blur-xl transition-all duration-200 ease-out", headerTone)}>
      <div className={cn("mx-auto flex w-full max-w-[1480px] items-center gap-2 px-3 transition-all duration-200 sm:gap-3 sm:px-5 lg:gap-4 lg:px-8", isCompact ? "min-h-[54px]" : "min-h-[60px]")}>
        <Link href="/" className="flex shrink-0 items-center" aria-label="Profound IQ Consulting home">
          <BrandLogo context="public page" compact={isCompact} className="border border-[#c9a34e]/60 transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(201,163,78,0.18)]" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center lg:flex" aria-label="Primary">
          <div className="flex items-center gap-0.5 xl:gap-1">
            {primaryNavItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-10 items-center rounded-md px-3 text-[13px] font-medium tracking-tight transition-colors duration-150",
                    active ? (dark ? "text-[#c9a34e]" : "text-[#a27e2e]") : (dark ? "text-[#c1cad7] hover:text-[#f7f3e8]" : "text-[#4a566a] hover:text-[#16243d]")
                  )}
                >
                  <span className="relative">
                    {item.label}
                    <span
                      className={cn("absolute -bottom-1 left-0 right-0 h-px origin-left bg-[#c9a34e] transition-transform duration-200 ease-out", active ? "scale-x-100" : "scale-x-0 hover:scale-x-100")}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}

            <Link
              href={isAuthenticated ? "/dashboard" : "/myspace"}
              aria-current={(isItemActive("/dashboard") || isItemActive("/myspace")) ? "page" : undefined}
              className={cn(
                "relative inline-flex h-10 items-center rounded-md px-3 text-[13px] font-medium tracking-tight transition-colors duration-150",
                (isItemActive("/dashboard") || isItemActive("/myspace")) ? (dark ? "text-[#c9a34e]" : "text-[#a27e2e]") : (dark ? "text-[#c1cad7] hover:text-[#f7f3e8]" : "text-[#4a566a] hover:text-[#16243d]")
              )}
            >
              <span className="relative">
                My Space
                <span
                  className={cn("absolute -bottom-1 left-0 right-0 h-px origin-left bg-[#c9a34e] transition-transform duration-200 ease-out", (isItemActive("/dashboard") || isItemActive("/myspace")) ? "scale-x-100" : "scale-x-0 hover:scale-x-100")}
                  aria-hidden="true"
                />
              </span>
            </Link>

            {/* Sub menu */}
            <nav className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-white/10" aria-label="Sub menu">
              {subMenuItems.map((item) => {
                const active = isItemActive(item.href);
                const isAuth = item.href.startsWith("/auth");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-3 text-[11px] font-semibold tracking-tight transition-colors duration-150",
                      isAuth && !isAuthenticated ? (dark ? "bg-[#c9a34e] text-[#0a1426] hover:bg-[#d4b35c]" : "bg-[#0a1426] text-white hover:bg-[#16243d]") : active ? (dark ? "text-[#c9a34e]" : "text-[#a27e2e]") : (dark ? "text-[#c1cad7] hover:text-[#f7f3e8]" : "text-[#4a566a] hover:text-[#16243d]")
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </nav>

        {/* Sub menu */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Sub menu">
          {subMenuItems.map((item) => {
            const active = isItemActive(item.href);
            const isAuth = item.href.startsWith("/auth");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 text-[11px] font-semibold tracking-tight transition-colors duration-150",
                  isAuth && !isAuthenticated ? (dark ? "bg-[#c9a34e] text-[#0a1426] hover:bg-[#d4b35c]" : "bg-[#0a1426] text-white hover:bg-[#16243d]") : active ? (dark ? "text-[#c9a34e]" : "text-[#a27e2e]") : (dark ? "text-[#c1cad7] hover:text-[#f7f3e8]" : "text-[#4a566a] hover:text-[#16243d]")
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="hidden md:inline-flex">
            <LanguageSelector compact />
          </span>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150 lg:hidden",
              dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"
            )}
          >
            {mobileMenuOpen ? <X size={18} strokeWidth={2} aria-hidden="true" /> : <Menu size={18} strokeWidth={2} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Sub-header auth bar — desktop only */}
      <div className={cn("hidden lg:block", subHeaderTone)}>
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-end gap-3 px-8 py-1.5 text-[12px]">
          {isAuthenticated ? (
            <>
              <span className={cn("text-[11px]", dark ? "text-[#8f9db3]" : "text-[#657084]")}>
                Signed in as <span className="font-semibold text-[#c9a34e]">{user?.name}</span>
              </span>
              <span className={cn("h-3 w-px", dark ? "bg-white/10" : "bg-[#16243d]/10")} aria-hidden="true" />
              <button
                type="button"
                onClick={() => logout()}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-150",
                  dark ? "text-[#c1cad7] hover:text-[#f7f3e8]" : "text-[#4a566a] hover:text-[#16243d]"
                )}
              >
                <LogOut size={12} strokeWidth={2} aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t transition-all duration-300 ease-out lg:hidden",
          dark ? "border-white/8 bg-[#0a1426]" : "border-[#16243d]/8 bg-white",
          mobileMenuOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-5 lg:px-8">
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <Search size={15} strokeWidth={2} className={dark ? "text-[#a27e2e]" : "text-[#a27e2e]"} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search…"
              className={cn("h-10 w-full rounded-md border bg-transparent px-3 text-sm tracking-tight outline-none", dark ? "border-white/12 placeholder:text-[#8f9db3]" : "border-[#16243d]/15 placeholder:text-[#657084]")}
            />
          </div>

          <nav className="grid grid-cols-1 gap-1" aria-label="Primary mobile">
            {primaryNavItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-md px-3.5 text-sm font-medium tracking-tight transition-colors duration-150",
                    active ? (dark ? "border-[#c9a34e]/50 bg-[#c9a34e]/10 text-[#c9a34e]" : "border-[#a27e2e]/50 bg-[#a27e2e]/10 text-[#a27e2e]") : (dark ? "border border-white/8 text-[#c1cad7] hover:border-white/20 hover:bg-white/5 hover:text-[#f7f3e8]" : "border border-[#16243d]/10 text-[#4a566a] hover:border-[#16243d]/25 hover:bg-white hover:text-[#16243d]")
                  )}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-3">
            <p className={cn("mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em]", dark ? "text-[#8f9db3]" : "text-[#657084]")}>
              Quick links
            </p>
            <nav className="grid grid-cols-1 gap-1" aria-label="Sub menu mobile">
              {subMenuItems.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-md px-3.5 text-sm font-medium tracking-tight transition-colors duration-150",
                      active ? (dark ? "border-[#c9a34e]/50 bg-[#c9a34e]/10 text-[#c9a34e]" : "border-[#a27e2e]/50 bg-[#a27e2e]/10 text-[#a27e2e]") : (dark ? "border border-white/8 text-[#c1cad7] hover:border-white/20 hover:bg-white/5 hover:text-[#f7f3e8]" : "border border-[#16243d]/10 text-[#4a566a] hover:border-[#16243d]/25 hover:bg-white hover:text-[#16243d]")
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-3">
            <Link
              href={isAuthenticated ? "/dashboard" : "/myspace"}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex h-12 items-center gap-3 rounded-md px-3.5 text-sm font-medium tracking-tight transition-colors duration-150",
                (isItemActive("/dashboard") || isItemActive("/myspace")) ? (dark ? "border-[#c9a34e]/50 bg-[#c9a34e]/10 text-[#c9a34e]" : "border-[#a27e2e]/50 bg-[#a27e2e]/10 text-[#a27e2e]") : (dark ? "border border-white/8 text-[#c1cad7] hover:border-white/20 hover:bg-white/5 hover:text-[#f7f3e8]" : "border border-[#16243d]/10 text-[#4a566a] hover:border-[#16243d]/25 hover:bg-white hover:text-[#16243d]")
              )}
            >
              My Space
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(22,36,61,0.06)" }}>
            <LanguageSelector compact onSelect={() => setMobileMenuOpen(false)} />
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold tracking-tight",
                  dark ? "border border-white/15 text-[#f7f3e8] hover:bg-white/5" : "border border-[#16243d]/20 text-[#16243d] hover:bg-[#16243d]/[0.04]"
                )}
              >
                <LogOut size={14} strokeWidth={2} aria-hidden="true" />
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
