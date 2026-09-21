import { useEffect, useState } from "react";
import { ArrowUp, ArrowUpRight, Menu, X, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export const siteNavItems = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "School solutions", href: "/school-solutions" },
  { label: "Courses", href: "/courses" },
  { label: "Insights", href: "/blog" },
  { label: "Self Assessment", href: "/assessment" },
  { label: "CareerPath", href: "/careerpath" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
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
  const { unreadCount } = useUnreadCount(isAuthenticated ? 30000 : 60000, isAuthenticated);

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

  const navigateItems = siteNavItems.map((item) => ({
    ...item,
    active: location === item.href || location.startsWith(`${item.href}/`),
  }));

  const headerTone = dark
    ? "border-white/15 bg-[#101d35]/95 text-[#f7f3e8] shadow-[0_10px_30px_rgba(7,17,35,.16)] supports-[backdrop-filter]:bg-[#101d35]/80"
    : "border-[#16243d]/10 bg-[#f7f3e8]/95 text-[#16243d] shadow-[0_10px_30px_rgba(8,15,26,.08)] supports-[backdrop-filter]:bg-[#f7f3e8]/85";

  const navText = dark ? "text-[#c9d1df] hover:text-[#c9a34e]" : "text-[#4a566a] hover:text-[#a27e2e]";
  const activeText = dark ? "text-[#c9a34e]" : "text-[#a27e2e]";
  const pillButton = dark
    ? "border border-[#c9a34e] text-[#f7f3e8] hover:bg-[#c9a34e] hover:text-[#101d35]"
    : "border border-[#16243d]/20 text-[#16243d] hover:bg-[#16243d] hover:text-[#f7f3e8]";
  const secondaryButton = dark
    ? "border border-white/20 text-[#c9d1df] hover:border-[#c9a34e] hover:text-[#c9a34e]"
    : "border border-[#16243d]/20 text-[#16243d] hover:border-[#a27e2e] hover:text-[#a27e2e]";

  return (
    <>
      <header
        data-sticky-navigation
        data-compact={isCompact}
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-200 ${headerTone} ${isCompact ? "shadow-[0_14px_34px_rgba(7,17,35,.24)]" : ""} overflow-x-hidden`}
      >
        <div className={`container flex items-center justify-between gap-4 transition-[min-height,padding] duration-200 sm:gap-5 ${isCompact ? "min-h-16 py-2" : "min-h-20 py-3 sm:py-4"}`}>
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Profound IQ Consulting home">
            <BrandLogo context="public page" compact={isCompact} className="border border-[#c9a34e]/70" />
          </Link>

          <nav id="site-navigation" className="hidden items-center gap-4 lg:flex xl:gap-5" aria-label="Primary navigation">
            {navigateItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={`text-[10px] font-black uppercase tracking-[.12em] transition-colors ${item.active ? activeText : navText}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSelector compact />
            {isAuthenticated && (
              <Link href="/dashboard/communication" className={`relative inline-flex items-center justify-center border p-2.5 ${dark ? "border-white/20 text-[#c9d1df] hover:text-[#c9a34e]" : "border-[#16243d]/20 text-[#16243d] hover:text-[#a27e2e]"}`} aria-label={`Messages, ${unreadCount} unread`}>
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#c9a34e] px-1 text-[9px] font-black text-[#101d35]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {variant === "home" ? (
              <>
                {isAuthenticated ? (
                  <Link href="/dashboard" className={`hidden border px-3 py-3 text-[10px] font-black uppercase tracking-[.12em] xl:inline-flex ${secondaryButton}`}>
                    {user?.name ? "My workspace" : "Workspace"}
                  </Link>
                ) : (
                  <>
                    <Link href="/auth?mode=login" className="hidden px-2 py-3 text-[10px] font-black uppercase tracking-[.12em] xl:inline-flex text-[#c9d1df] hover:text-[#c9a34e]">
                      Sign in
                    </Link>
                    <Link href="/auth?mode=register" className={`hidden border px-3 py-3 text-[10px] font-black uppercase tracking-[.12em] xl:inline-flex ${secondaryButton}`}>
                      Create account
                    </Link>
                  </>
                )}
              </>
            ) : (
              <Link href={isAuthenticated ? "/dashboard" : "/auth?mode=login"} className={`hidden border px-3 py-3 text-[10px] font-black uppercase tracking-[.12em] xl:inline-flex ${secondaryButton}`}>
                {isAuthenticated ? "My Space" : "Sign in"}
              </Link>
            )}

            <Link href="/contact" className={`hidden items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] transition-colors 2xl:inline-flex ${pillButton}`}>
              Start a conversation <ArrowUpRight size={14} />
            </Link>
          </div>

          <button
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center border lg:hidden ${dark ? "border-white/20" : "border-[#16243d]/20"}`}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <nav id="site-navigation-mobile" className={`border-t px-4 py-5 shadow-[0_16px_30px_rgba(7,17,35,.18)] lg:hidden ${dark ? "border-white/10 bg-[#101d35]" : "border-[#16243d]/10 bg-[#f7f3e8]"}`} aria-label="Mobile navigation">
            <div className="container flex flex-col gap-1">
              {navigateItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`border-b px-1 py-4 text-[11px] font-black uppercase tracking-[.14em] transition-colors ${item.active ? activeText : dark ? "border-white/10 text-[#d6dce6] hover:text-[#c9a34e]" : "border-[#16243d]/10 text-[#16243d] hover:text-[#a27e2e]"}`}
                >
                  {item.label}
                </Link>
              ))}

               <div className="mt-4 flex flex-wrap items-center gap-3">
                  <LanguageSelector compact onSelect={() => setMenuOpen(false)} />
                  {isAuthenticated && (
                    <Link href="/dashboard/communication" onClick={() => setMenuOpen(false)} className={`relative inline-flex items-center gap-2 border px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] ${pillButton}`}>
                      <Bell size={14} />
                      Messages
                      {unreadCount > 0 && (
                        <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#101d35] px-1 text-[9px] font-black text-[#c9a34e]">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                  {isAuthenticated ? (
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={`inline-flex items-center gap-2 border px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] ${pillButton}`}>
                      My workspace
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth?mode=login" onClick={() => setMenuOpen(false)} className={`inline-flex items-center gap-2 border px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] ${pillButton}`}>
                        Sign in
                      </Link>
                      <Link href="/auth?mode=register" onClick={() => setMenuOpen(false)} className={`inline-flex items-center gap-2 border px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] ${secondaryButton}`}>
                        Create account
                      </Link>
                    </>
                  )}
                  <Link href="/contact" onClick={() => setMenuOpen(false)} className={`inline-flex items-center gap-2 border px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] ${pillButton}`}>
                    Contact <ArrowUpRight size={14} />
                  </Link>
                </div>
            </div>
          </nav>
        )}
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
