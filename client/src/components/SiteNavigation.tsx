import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings2,
  Sun,
  UserCircle2,
  X,
} from "lucide-react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import { useTheme } from "@/contexts/ThemeContext";

type NavItem = {
  label: string;
  href: string;
  section?: string;
};

export const siteNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "School solutions", href: "/school-solutions" },
  { label: "Courses", href: "/courses", section: "courses" },
  {
    label: "Psychometrics",
    href: "/psychometrics",
    section: "psychometrics",
  },
  {
    label: "Self Assessment",
    href: "/assessment",
    section: "assessment",
  },
  { label: "CareerPath", href: "/careerpath", section: "careerpath" },
  { label: "Insights", href: "/blog" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

const primaryNavItems = siteNavItems.filter(item =>
  [
    "/about",
    "/school-solutions",
    "/courses",
    "/psychometrics",
    "/assessment",
    "/careerpath",
  ].includes(item.href)
);

const searchItems = [
  { label: "Clarity and direction", service: "Self Assessment", href: "/assessment" },
  { label: "Leadership and influence", service: "Self Assessment", href: "/assessment" },
  { label: "Learning and adaptability", service: "Self Assessment", href: "/assessment" },
  { label: "Career pathway and talent fit", service: "CareerPath", href: "/careerpath" },
  { label: "Pure Sciences", service: "CareerPath", href: "/careerpath" },
  { label: "Applied Sciences", service: "CareerPath", href: "/careerpath" },
  { label: "Technical Studies", service: "CareerPath", href: "/careerpath" },
  { label: "Languages and Humanities", service: "CareerPath", href: "/careerpath" },
  { label: "Arts and Sports", service: "CareerPath", href: "/careerpath" },
  { label: "Psychometric testing", service: "Psychometrics", href: "/psychometrics" },
  { label: "Career personality", service: "Psychometrics", href: "/psychometrics" },
  { label: "Leadership potential", service: "Psychometrics", href: "/psychometrics" },
];

type Breadcrumb = { label: string; href?: string };
type HeaderVariant = "home" | "public" | "journey" | "workspace";
type SiteUser = NonNullable<ReturnType<typeof useAuth>["user"]>;

type SiteNavigationProps = {
  variant?: HeaderVariant;
  activeSection?: string;
  contextLabel?: string;
  breadcrumbs?: Breadcrumb[];
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
  role?: "user" | "staff" | "admin";
  user?: SiteUser;
  showAuthActions?: boolean;
  actions?: ReactNode;
  leadingAction?: ReactNode;
};

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(
      window.localStorage.getItem("piq-recent-searches") || "[]"
    );
    return Array.isArray(saved)
      ? saved
          .filter((item): item is string => typeof item === "string")
          .slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

export function SiteNavigation({
  variant = "public",
  activeSection,
  contextLabel,
  breadcrumbs = [],
  searchOpen: controlledSearchOpen,
  setSearchOpen: setControlledSearchOpen,
  role,
  user: suppliedUser,
  showAuthActions = true,
  actions,
  leadingAction,
}: SiteNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [localSearchOpen, setLocalSearchOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(readRecentSearches);
  const [certificateAvailable, setCertificateAvailable] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("piq-new-certificate-available") === "true"
  );
  const [location] = useLocation();
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { theme, setTheme, switchable } = useTheme();
  const user = suppliedUser ?? authUser;
  const workspaceSearchOpen = controlledSearchOpen ?? localSearchOpen;
  const setWorkspaceSearchOpen =
    setControlledSearchOpen ?? setLocalSearchOpen;
  const isWorkspace = variant === "workspace";
  const workspaceLabel = breadcrumbs.length
    ? breadcrumbs[breadcrumbs.length - 1].label
    : "My Space";

  const userRole = user?.role?.toLowerCase();
  const workspaceHref =
    userRole === "admin"
      ? "/admin/overview"
      : userRole === "staff"
        ? "/staff"
        : "/dashboard";
  const signupReturnTo =
    typeof window === "undefined"
      ? location
      : `${window.location.pathname}${window.location.search}`;
  const signupHref = `/signup?returnTo=${encodeURIComponent(signupReturnTo)}`;
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? searchItems
          .filter(item =>
            `${item.label} ${item.service}`.toLowerCase().includes(normalized)
          )
          .slice(0, 6)
      : [];
  }, [query]);
  const navItems = useMemo(
    () =>
      primaryNavItems.map(item => ({
        ...item,
        active:
          (activeSection && item.section === activeSection) ||
          location === item.href ||
          location.startsWith(`${item.href}/`),
      })),
    [activeSection, location]
  );

  useEffect(() => {
    const onScroll = () => {
      setIsCompact(window.scrollY > 28);
      setShowBackToTop(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
        setWorkspaceSearchOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setWorkspaceSearchOpen(true);
        window.setTimeout(
          () => document.getElementById("site-search")?.focus(),
          0
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setWorkspaceSearchOpen]);

  useEffect(() => {
    const onStorage = () =>
      setCertificateAvailable(
        window.localStorage.getItem("piq-new-certificate-available") === "true"
      );
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    setSelectedSearchIndex(0);
  }, [query]);

  useEffect(() => {
    if (
      certificateAvailable &&
      window.localStorage.getItem("piq-certificate-toast-seen") !== "true"
    ) {
      toast.success("New certificate awarded", {
        description: "Your completion certificate is ready to view.",
        action: {
          label: "View certificate",
          onClick: () => {
            window.location.href = "/dashboard?tab=certificates";
          },
        },
        cancel: {
          label: "Share",
          onClick: () => void shareCertificate(),
        },
      });
      window.localStorage.setItem("piq-certificate-toast-seen", "true");
    }
  }, [certificateAvailable]);

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setWorkspaceSearchOpen(false);
  };

  const recordSearch = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    const next = [
      cleaned,
      ...recentSearches.filter(
        item => item.toLowerCase() !== cleaned.toLowerCase()
      ),
    ].slice(0, 5);
    setRecentSearches(next);
    try {
      window.localStorage.setItem("piq-recent-searches", JSON.stringify(next));
    } catch {
      // Recent searches remain available for this page session.
    }
  };

  const shareCertificate = async () => {
    const shareData = {
      title: "Profound IQ completion certificate",
      text: "I earned a Profound IQ Consulting completion certificate.",
      url: `${PUBLISHED_SITE_ORIGIN}/dashboard?tab=certificates`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success("Certificate share text copied");
      } else throw new Error("Sharing is unavailable in this browser.");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        toast.error("Could not share certificate", {
          description:
            error instanceof Error
              ? error.message
              : "Try opening Certificates from your profile.",
        });
      }
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown" && searchResults.length) {
      event.preventDefault();
      setSelectedSearchIndex(index => (index + 1) % searchResults.length);
    } else if (event.key === "ArrowUp" && searchResults.length) {
      event.preventDefault();
      setSelectedSearchIndex(
        index => (index - 1 + searchResults.length) % searchResults.length
      );
    } else if (event.key === "Enter" && searchResults[selectedSearchIndex]) {
      event.preventDefault();
      const selected = searchResults[selectedSearchIndex];
      recordSearch(selected.label);
      window.location.href = selected.href;
    }
  };

  const searchPanel = workspaceSearchOpen && (
    <div
      id="site-search-panel"
      className="border-t border-white/10 bg-[#f7f3e8] px-4 py-4 text-[#16243d] shadow-xl sm:px-6"
      role="region"
      aria-label="Search services and topics"
    >
      <div className="container max-w-3xl">
        <div className="flex items-center gap-3 border border-[#16243d]/20 px-3">
          <Search size={16} aria-hidden="true" className="text-[#7d5e1e]" />
          <input
            id="site-search"
            autoFocus
            value={query}
            onChange={event => {
              const next = event.target.value;
              setQuery(next);
              window.dispatchEvent(
                new CustomEvent("piq-search-query", { detail: next })
              );
            }}
            onKeyDown={handleSearchKeyDown}
            aria-activedescendant={
              searchResults[selectedSearchIndex]
                ? `site-search-result-${selectedSearchIndex}`
                : undefined
            }
            aria-label="Search services and topics"
            placeholder="Search assessments, courses, and topics"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e]"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setWorkspaceSearchOpen(false)}
            className="p-2 text-[#657084] hover:text-[#16243d]"
          >
            <X size={16} />
          </button>
        </div>
        {!query && recentSearches.length > 0 && (
          <div className="mt-3" role="listbox" aria-label="Recent searches">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#7d5e1e]">
              Recent searches
            </p>
            {recentSearches.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  window.dispatchEvent(
                    new CustomEvent("piq-search-query", { detail: item })
                  );
                  recordSearch(item);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-[#ead9ae]"
              >
                {item}
              </button>
            ))}
          </div>
        )}
        {query && (
          <div className="mt-2" role="listbox" aria-label="Search results">
            {searchResults.length ? (
              searchResults.map((item, index) => (
                <a
                  key={`${item.service}-${item.label}`}
                  id={`site-search-result-${index}`}
                  role="option"
                  aria-selected={index === selectedSearchIndex}
                  href={item.href}
                  onMouseEnter={() => setSelectedSearchIndex(index)}
                  onClick={() => {
                    recordSearch(item.label);
                    closeMenus();
                  }}
                  className={`block px-3 py-3 text-sm hover:bg-[#ead9ae] ${index === selectedSearchIndex ? "bg-[#ead9ae]" : ""}`}
                >
                  <span className="block font-semibold">{item.label}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[.12em] text-[#7d5e1e]">
                    {item.service}
                  </span>
                </a>
              ))
            ) : (
              <p className="px-3 py-3 text-sm text-[#657084]">
                No matching topics yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <header
        data-sticky-navigation
        data-compact={isCompact}
        className={`sticky top-0 z-50 border-b border-white/10 bg-[#101d35] text-[#f7f3e8] transition-shadow duration-200 ${isCompact ? "shadow-[0_8px_30px_rgba(7,17,35,.28)]" : "shadow-[0_4px_20px_rgba(0,0,0,.12)]"}`}
      >
        <div
          className={`container flex items-center justify-between gap-3 transition-[min-height,padding] duration-200 ${isCompact ? "min-h-14 py-1.5" : "min-h-20 py-3"}`}
        >
          {isWorkspace && leadingAction}
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2.5"
            aria-label="Profound IQ Consulting home"
          >
            <BrandLogo
              context="public page"
              compactOnMobile
              className="border border-[#c9a34e]/70 shadow-none"
            />
            <span className="grid gap-0.5">
              <span className="text-xs font-bold tracking-[.04em] text-[#f7f3e8] sm:text-sm">
                Profound IQ
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#e1e7f0]">
                Consulting
              </span>
            </span>
          </Link>

          {isWorkspace ? (
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pl-2 sm:pl-8">
              <span className="max-w-28 truncate text-[11px] font-semibold text-[#f7f3e8] sm:hidden">
                {workspaceLabel}
              </span>
              <nav
                aria-label="Breadcrumb"
                className="hidden min-w-0 items-center gap-2 text-sm sm:flex"
              >
                {(breadcrumbs.length
                  ? breadcrumbs
                  : [{ label: "My Space", href: workspaceHref }]
                ).map((crumb, index, list) => (
                  <span
                    key={`${crumb.label}-${index}`}
                    className="inline-flex min-w-0 items-center gap-2"
                  >
                    {index > 0 && (
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-[#c9a34e]"
                        aria-hidden="true"
                      />
                    )}
                    {crumb.href && index < list.length - 1 ? (
                      <Link
                        href={crumb.href}
                        className="truncate text-[#e1e7f0] transition-colors hover:text-white"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="truncate font-semibold text-[#f7f3e8]" aria-current="page">
                        {crumb.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
              <div className="relative ml-auto flex shrink-0 items-center gap-2">
                {role && (
                  <span className="hidden rounded-full border border-[#c9a34e]/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#ead9ae] sm:inline-flex">
                    {role === "admin"
                      ? "Admin"
                      : role === "staff"
                        ? "Staff"
                        : "Learner"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setWorkspaceSearchOpen(!workspaceSearchOpen)}
                  aria-label="Search"
                  aria-expanded={workspaceSearchOpen}
                  aria-controls="site-search-panel"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-[#e1e7f0] transition-colors hover:border-[#c9a34e] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35]"
                >
                  <Search size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setProfileOpen(open => !open)}
                  aria-label="Open account menu"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  className="site-navigation-action inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/40 px-2 py-1.5 text-xs text-[#f7f3e8] hover:border-[#c9a34e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35]"
                >
                  <UserCircle2 size={14} aria-hidden="true" />
                  <span className="hidden max-w-32 truncate md:inline">
                    {user?.name || user?.email || "Account"}
                  </span>
                  <ChevronDown size={12} aria-hidden="true" />
                </button>
                {profileOpen && (
                  <div
                    role="menu"
                    aria-label="Account menu"
                    className="absolute right-4 top-[calc(100%-4px)] z-[80] w-56 border border-[#c9a34e]/50 bg-[#f7f3e8] p-2 text-[#16243d] shadow-xl sm:right-6"
                  >
                    <Link
                      href="/settings"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-2 px-3 py-3 text-sm hover:bg-[#ead9ae]"
                    >
                      <Settings2 size={15} /> Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void logout()}
                      className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <nav
                className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[.09em] min-[1366px]:flex 2xl:gap-5"
                aria-label="Primary navigation"
              >
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className={`relative whitespace-nowrap py-2 transition-colors hover:text-white ${item.active ? "text-[#ffe3a3] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#c9a34e]" : "text-[#e1e7f0]"}`}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="relative whitespace-nowrap py-2 transition-colors hover:text-white text-[#e1e7f0]"
                  >
                    My Space
                  </Link>
                ) : null}
              </nav>

              <div className="hidden shrink-0 items-center gap-1.5 min-[1366px]:flex">
                <button
                  type="button"
                  onClick={() => setWorkspaceSearchOpen(!workspaceSearchOpen)}
                  aria-label="Search services and topics"
                  aria-expanded={workspaceSearchOpen}
                  aria-controls="site-search-panel"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-[#e1e7f0] transition-colors hover:border-[#c9a34e] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35]"
                >
                  <Search size={16} aria-hidden="true" />
                </button>
                {isAuthenticated ? "/dashboard" : "/auth?mode=login"}
                {!isAuthenticated && showAuthActions ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth?mode=login"
                      className="rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#e1e7f0] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35]"
                    >
                      Sign in
                    </Link>
                    <Link
                      href={signupHref}
                      className="rounded-full border border-white/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-white transition-colors hover:border-[#c9a34e] hover:text-[#ffe3a3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35]"
                    >
                      Sign up
                    </Link>
                  </div>
                ) : isAuthenticated ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen(open => !open)}
                      aria-expanded={profileOpen}
                      aria-haspopup="menu"
                      className="site-navigation-action relative inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/40 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-[#e1e7f0] transition-colors hover:border-[#c9a34e] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35]"
                    >
                      <UserCircle2 size={14} aria-hidden="true" />
                      <span className="max-w-28 truncate">
                        {user?.name || "My Space"}
                      </span>
                      <ChevronDown size={12} aria-hidden="true" />
                      {certificateAvailable && (
                        <span
                          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#c9a34e] ring-2 ring-[#101d35]"
                          aria-label="New certificate available"
                        />
                      )}
                    </button>
                    {profileOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-[calc(100%+8px)] z-[80] w-60 border border-[#c9a34e]/60 bg-[#f7f3e8] p-2 text-[#16243d] shadow-xl"
                      >
                        <p className="border-b border-[#16243d]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#7d5e1e]">
                          {user?.name || "Your profile"}
                        </p>
                        <Link
                          href={workspaceHref}
                          role="menuitem"
                          onClick={closeMenus}
                          className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"
                        >
                          My Space <ChevronRight size={13} className="ml-auto" />
                        </Link>
                        <Link
                          href="/dashboard?tab=certificates"
                          role="menuitem"
                          onClick={() => {
                            window.localStorage.removeItem(
                              "piq-new-certificate-available"
                            );
                            setCertificateAvailable(false);
                            closeMenus();
                          }}
                          className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"
                        >
                          My Certificates
                          {certificateAvailable && (
                            <span className="ml-auto rounded-full bg-[#c9a34e] px-1.5 py-0.5 text-[9px] font-bold">
                              NEW
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/dashboard?download=score-summary"
                          role="menuitem"
                          onClick={closeMenus}
                          className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"
                        >
                          Download score summary
                        </Link>
                        <Link
                          href="/settings"
                          role="menuitem"
                          onClick={closeMenus}
                          className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"
                        >
                          <Settings2 size={14} /> Settings
                        </Link>
                        {switchable && (
                          <div className="border-t border-[#16243d]/10 px-3 py-3">
                            <p className="mb-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#7d5e1e]">
                              Theme
                            </p>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setTheme("light")}
                                aria-pressed={theme === "light"}
                                className={`flex-1 rounded px-2 py-2 text-[10px] ${theme === "light" ? "bg-[#16243d] text-[#f7f3e8]" : "bg-[#ead9ae]"}`}
                              >
                                <Sun size={12} className="mx-auto" />
                                Light
                              </button>
                              <button
                                type="button"
                                onClick={() => setTheme("dark")}
                                aria-pressed={theme === "dark"}
                                className={`flex-1 rounded px-2 py-2 text-[10px] ${theme === "dark" ? "bg-[#16243d] text-[#f7f3e8]" : "bg-[#ead9ae]"}`}
                              >
                                <Moon size={12} className="mx-auto" />
                                Dark
                              </button>
                              <button
                                type="button"
                                onClick={() => setTheme("auto")}
                                aria-pressed={theme === "auto"}
                                className={`flex-1 rounded px-2 py-2 text-[10px] ${theme === "auto" ? "bg-[#c9a34e] text-[#16243d]" : "bg-[#ead9ae]"}`}
                              >
                                Auto
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
                <Link
                  href="/contact"
                  className="site-navigation-action inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#c9a34e] px-2.5 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-[#16243d] transition-colors hover:bg-[#ead9ae]"
                >
                  Start a conversation                   <ArrowUpRight size={12} />
                </Link>
                {actions}
              </div>

              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:border-[#c9a34e] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] min-[1366px]:hidden"
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={menuOpen}
                aria-controls="site-navigation-mobile"
                onClick={() => setMenuOpen(open => !open)}
              >
                {menuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </>
          )}
        </div>

        {!isWorkspace && menuOpen && (
          <nav
            id="site-navigation-mobile"
            className="max-h-[calc(100dvh-8rem)] overflow-y-auto border-t border-white/20 bg-[#14243d] px-4 py-4 shadow-xl min-[1366px]:hidden sm:px-6"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {siteNavItems
                .filter(item => item.href !== "/" && item.href !== "/contact")
                .map(item => {
                  const active =
                    location === item.href || location.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMenus}
                      className={`min-h-11 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14243d] ${active ? "border-[#c9a34e]/60 bg-[#253653] text-[#ffe3a3]" : "border-transparent text-[#e1e7f0] hover:border-white/15 hover:bg-[#1c2d4b] hover:text-white"}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              {isAuthenticated && (
                <Link
                  href={workspaceHref}
                  onClick={closeMenus}
                  className="min-h-11 rounded-lg border border-[#c9a34e]/60 bg-[#253653] px-3 py-2.5 text-sm font-semibold text-[#ffe3a3] hover:bg-[#304463] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14243d] sm:col-span-2 lg:col-span-3"
                >
                  My Space
                </Link>
              )}
              <button
                type="button"
                onClick={() => setWorkspaceSearchOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 bg-[#1c2d4b] px-3 py-2.5 text-left text-sm font-semibold text-[#f0f3f8] hover:border-white/40 hover:bg-[#263856] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14243d] sm:col-span-2 lg:col-span-3"
              >
                <Search size={16} aria-hidden="true" /> Search
              </button>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/20 pt-4 sm:col-span-2 lg:col-span-3">
                {!isAuthenticated && showAuthActions && (
                  <>
                    <Link
                      href="/auth?mode=login"
                      onClick={closeMenus}
                      className="min-h-11 rounded-full border border-white/50 px-4 py-3 text-xs font-bold uppercase tracking-[.1em] text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14243d]"
                    >
                      Sign in
                    </Link>
                    <Link
                      href={signupHref}
                      onClick={closeMenus}
                      className="min-h-11 rounded-full border border-white/50 px-4 py-3 text-xs font-bold uppercase tracking-[.1em] text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c967] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14243d]"
                    >
                      Sign up
                    </Link>
                  </>
                )}
                <Link
                  href="/contact"
                  onClick={closeMenus}
                  className="site-navigation-action inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#c9a34e] px-3 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-[#16243d] shadow-sm transition-colors hover:bg-[#ead9ae] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe3a3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14243d] sm:w-auto"
                >
                  Start a conversation <ArrowUpRight size={12} />
                </Link>
                {actions}
              </div>
            </div>
          </nav>
        )}

        {contextLabel && !isWorkspace && (
          <div className="border-t border-white/10 bg-[#0d1a2f] px-4 py-2 sm:px-6">
            <div className="container flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#dce4ef]">
              <Link href="/" className="transition-colors hover:text-[#ead9ae]">
                Home
              </Link>
              <ChevronRight size={12} className="text-[#c9a34e]" aria-hidden="true" />
              <span className="text-[#f7f3e8]" aria-current="page">
                {contextLabel}
              </span>
            </div>
          </div>
        )}
        {searchPanel}
      </header>

      {menuOpen && !isWorkspace && (
        <div
          className="fixed inset-0 z-40 bg-[#101d35]/25 min-[1366px]:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {showBackToTop && !isWorkspace && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full border border-[#c9a34e]/50 bg-[#101d35] text-[#f7f3e8] shadow-lg transition-colors hover:bg-[#c9a34e] hover:text-[#16243d]"
        >
          <ArrowUp size={16} />
        </button>
      )}
    </>
  );
}
