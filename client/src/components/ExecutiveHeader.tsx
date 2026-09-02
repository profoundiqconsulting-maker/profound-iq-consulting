/* Profound IQ Consulting — Executive Observatory header. Premium, restrained design for executive audiences with global search, primary navigation, pinned favorites, and a More menu for secondary items. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Command,
  Compass,
  Download,
  FilePlus,
  FileText,
  GraduationCap,
  History,
  Inbox,
  LayoutDashboard,
  Library,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { trpc } from "@/lib/trpc";

export type ExecutiveNavItem = {
  label: string;
  href: string;
  description?: string;
  shortcut?: string;
};

export const executivePrimaryNav: ExecutiveNavItem[] = [
  { label: "Dashboard", href: "/dashboard", description: "Workspace overview", shortcut: "D" },
  { label: "Executive Reports", href: "/dashboard?tab=reports", description: "Performance insights", shortcut: "R" },
  { label: "Team Management", href: "/admin", description: "Organization and members", shortcut: "T" },
  { label: "Certificates", href: "/dashboard/certificates", description: "Issued credentials", shortcut: "C" },
];

export const executiveMoreNav: ExecutiveNavItem[] = [
  { label: "About", href: "/about", description: "Company background" },
  { label: "Services", href: "/services", description: "Consulting offerings" },
  { label: "School solutions", href: "/school-solutions", description: "Education programs" },
  { label: "Courses", href: "/courses", description: "Learning catalog" },
  { label: "Self Assessment", href: "/assessment", description: "100-question reflection" },
  { label: "CareerPath", href: "/careerpath", description: "Talent-fit pathways" },
  { label: "Resources", href: "/resources", description: "Insights and guides" },
  { label: "Settings", href: "/settings", description: "Account preferences" },
  { label: "Contact", href: "/contact", description: "Talk to our team" },
];

export const siteNavItems = [...executivePrimaryNav, ...executiveMoreNav];

const FAVORITES_STORAGE_KEY = "piq-header-favorites";

type ExecutiveHeaderProps = {
  variant?: "home" | "public" | "dashboard";
  dark?: boolean;
};

function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "owner";
}

function getInitialLocalFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function relativeTime(value: Date | string | number | null | undefined): string {
  if (!value) return "recently";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

const ICON_MAP: Record<string, typeof Search> = {
  Search,
  BookOpen,
  Award,
  Settings,
  LayoutDashboard,
  BarChart3,
  Users,
  ClipboardCheck,
  TrendingUp,
  Brain,
  Library,
  FileText,
  Building2,
  Briefcase,
  GraduationCap,
  Mail,
  FilePlus,
  Compass,
  Sparkles,
  Inbox,
  Download,
  ShieldCheck,
};

export function ExecutiveHeader({ variant = "public", dark = true }: ExecutiveHeaderProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [localFavorites, setLocalFavorites] = useState<string[]>(getInitialLocalFavorites);
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(searchValue, 180);
  const searchQuery = trpc.search.global.useQuery(
    { query: debouncedQuery, limit: 8 },
    { enabled: searchOpen, staleTime: 30_000 }
  );
  const recentQuery = trpc.search.recent.useQuery(
    { limit: 6 },
    { enabled: isAuthenticated && userMenuOpen, staleTime: 60_000 }
  );
  const serverFavorites = trpc.search.favorites.useQuery(
    undefined,
    { enabled: isAuthenticated, staleTime: 120_000 }
  );
  const addFavoriteMutation = trpc.search.addFavorite.useMutation({
    onSuccess: () => void serverFavorites.refetch(),
  });
  const removeFavoriteMutation = trpc.search.removeFavorite.useMutation({
    onSuccess: () => void serverFavorites.refetch(),
  });
  const logActivityMutation = trpc.search.logActivity.useMutation();
  const quickActionsQuery = trpc.search.quickActions.useQuery(undefined, {
    enabled: isAuthenticated && isAdminRole(user?.role ?? null) && userMenuOpen,
    staleTime: 120_000,
  });

  useEffect(() => {
    const onScroll = () => {
      setIsCompact(window.scrollY > 12);
      setShowBackToTop(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(localFavorites));
    } catch {
      // ignore storage failures
    }
  }, [localFavorites]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(event.target as Node)) setUserMenuOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        setUserMenuOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isItemActive = (href: string) => {
    const [pathOnly] = href.split("?");
    return location === href || location.startsWith(`${pathOnly}/`) || (pathOnly === "/dashboard" && location === "/dashboard");
  };

  const serverFavoriteHrefs = useMemo(
    () => new Set((serverFavorites.data?.favorites ?? []).map((f) => f.href)),
    [serverFavorites.data]
  );

  const isFavorited = (href: string) => {
    if (isAuthenticated) return serverFavoriteHrefs.has(href);
    return localFavorites.includes(href);
  };

  const toggleFavorite = (href: string, label?: string) => {
    if (isAuthenticated) {
      const currentlyFavorited = serverFavoriteHrefs.has(href);
      if (currentlyFavorited) {
        removeFavoriteMutation.mutate({ href });
      } else {
        addFavoriteMutation.mutate({ href, label: label ?? href });
      }
      return;
    }
    setLocalFavorites((current) =>
      current.includes(href) ? current.filter((item) => item !== href) : [...current, href]
    );
  };

  const favoriteItems = useMemo(() => {
    if (isAuthenticated) {
      const serverList = serverFavorites.data?.favorites ?? [];
      return serverList
        .map((entry) => {
          const fromPrimary = executivePrimaryNav.find((item) => item.href === entry.href);
          return fromPrimary ?? { label: entry.label, href: entry.href, description: "" };
        });
    }
    return executivePrimaryNav.filter((item) => localFavorites.includes(item.href));
  }, [isAuthenticated, serverFavorites.data, localFavorites]);

  const visiblePrimaryNav = favoriteItems.length > 0
    ? [
        ...favoriteItems,
        ...executivePrimaryNav.filter((item) => !favoriteItems.some((fav) => fav.href === item.href)),
      ]
    : executivePrimaryNav;

  const searchResults = searchQuery.data?.results ?? [];
  const searchTotalMatches = searchQuery.data?.totalMatches ?? 0;
  const recentItems = recentQuery.data ?? [];
  const quickActions = quickActionsQuery.data?.actions ?? [];
  const isAdmin = isAdminRole(user?.role ?? null);

  useEffect(() => {
    if (searchOpen && debouncedQuery.trim().length > 0) {
      logActivityMutation.mutate({
        activityType: "search",
        title: `Searched: ${debouncedQuery.trim()}`,
        href: "/dashboard",
        metadata: { query: debouncedQuery.trim() },
      });
    }
  }, [searchOpen, debouncedQuery]);

  const headerTone = dark
    ? "border-b border-white/[0.06] bg-[#0a1426]/95 text-[#f7f3e8] shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(7,17,35,0.18)] supports-[backdrop-filter]:bg-[#0a1426]/75"
    : "border-b border-[#16243d]/[0.06] bg-white/95 text-[#16243d] shadow-[0_1px_0_rgba(22,36,61,0.04),0_8px_24px_rgba(8,15,26,0.06)] supports-[backdrop-filter]:bg-white/75";

  const searchPanelTone = dark
    ? "border-white/10 bg-[#0a1426]/98 text-[#f7f3e8]"
    : "border-[#16243d]/10 bg-white/98 text-[#16243d]";

  return (
    <>
      <header
        data-executive-header
        data-compact={isCompact}
        className={`sticky top-0 z-50 backdrop-blur-xl transition-[height,background-color,border-color,box-shadow] duration-200 ease-out ${headerTone} ${isCompact ? "shadow-[0_2px_0_rgba(201,163,78,0.08),0_12px_32px_rgba(7,17,35,0.28)]" : ""}`}
      >
        <div className={`mx-auto flex w-full max-w-[1480px] items-center gap-3 px-4 transition-[min-height] duration-200 sm:gap-4 sm:px-6 lg:gap-6 lg:px-10 ${isCompact ? "min-h-[60px]" : "min-h-[68px]"}`}>
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Profound IQ Consulting home">
            <BrandLogo
              context="public page"
              compact={isCompact}
              className="border border-[#c9a34e]/60 transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(201,163,78,0.18)]"
            />
          </Link>

          <div className="hidden flex-1 items-center lg:flex">
            <div className="relative w-full max-w-[420px]" ref={searchRef}>
              <button
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
                aria-label="Open global search"
                aria-expanded={searchOpen}
                className={`flex h-11 w-full items-center gap-3 rounded-md border px-3.5 text-left text-sm transition-all duration-150 ${
                  dark
                    ? "border-white/10 bg-white/[0.04] text-[#aab5c6] hover:border-white/20 hover:bg-white/[0.06]"
                    : "border-[#16243d]/12 bg-[#f5f1e6]/60 text-[#657084] hover:border-[#16243d]/25 hover:bg-white"
                } ${searchOpen ? (dark ? "border-[#c9a34e]/60 bg-white/[0.08]" : "border-[#a27e2e]/60 bg-white shadow-sm") : ""}`}
              >
                <Search size={16} strokeWidth={2} aria-hidden="true" />
                <span className="flex-1 truncate font-medium tracking-tight">Search reports, members, courses…</span>
                <span className={`inline-flex h-6 items-center gap-1 rounded border px-1.5 text-[10px] font-semibold tracking-wider ${dark ? "border-white/15 text-[#8f9db3]" : "border-[#16243d]/15 text-[#657084]"}`}>
                  <Command size={11} strokeWidth={2.25} aria-hidden="true" /> K
                </span>
              </button>

              <div
                className={`absolute left-0 right-0 top-[calc(100%+8px)] origin-top overflow-hidden rounded-md border shadow-[0_24px_48px_rgba(7,17,35,0.22)] transition-all duration-200 ease-out ${searchPanelTone} ${
                  searchOpen ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"
                }`}
                role="dialog"
                aria-label="Global search"
              >
                <div className={`flex items-center gap-2 border-b px-3.5 py-2.5 ${dark ? "border-white/8" : "border-[#16243d]/8"}`}>
                  <Search size={15} strokeWidth={2} className="text-[#a27e2e]" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search by name, report, or course…"
                    className="h-7 w-full bg-transparent text-sm tracking-tight outline-none placeholder:text-[#8f9db3]"
                    autoFocus={searchOpen}
                  />
                  <kbd className={`inline-flex h-6 items-center rounded border px-1.5 text-[10px] font-semibold ${dark ? "border-white/15 text-[#8f9db3]" : "border-[#16243d]/15 text-[#657084]"}`}>esc</kbd>
                </div>
                <ul className="max-h-[320px] overflow-y-auto p-1.5">
                  {searchQuery.isFetching && searchResults.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-[#8f9db3]">Searching…</li>
                  ) : searchResults.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-[#8f9db3]">No matches found.</li>
                  ) : (
                    searchResults.map((item) => {
                      const Icon = ICON_MAP[item.icon ?? "Search"] ?? Search;
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={() => setSearchOpen(false)}
                            className={`group flex items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors duration-150 ${dark ? "hover:bg-white/[0.06]" : "hover:bg-[#16243d]/[0.04]"}`}
                          >
                            <Icon size={14} strokeWidth={2} className="shrink-0 text-[#c9a34e]" aria-hidden="true" />
                            <span className="flex-1 truncate font-medium tracking-tight">{item.title}</span>
                            <span className={`hidden truncate text-xs font-normal tracking-tight sm:inline ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>{item.description}</span>
                            <span className={`hidden rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:inline ${dark ? "border-white/10 text-[#8f9db3]" : "border-[#16243d]/12 text-[#657084]"}`}>
                              {item.category}
                            </span>
                          </Link>
                        </li>
                      );
                    })
                  )}
                </ul>
                <div className={`flex items-center justify-between border-t px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${dark ? "border-white/8 text-[#8f9db3]" : "border-[#16243d]/8 text-[#657084]"}`}>
                  <span>{searchTotalMatches} {searchTotalMatches === 1 ? "match" : "matches"}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <kbd className={`inline-flex h-5 items-center rounded border px-1 text-[9px] ${dark ? "border-white/15" : "border-[#16243d]/15"}`}>↵</kbd>
                    open
                  </span>
                </div>
              </div>
            </div>
          </div>

          <nav id="primary-navigation" className="hidden items-center gap-1 xl:flex" aria-label="Primary">
            {visiblePrimaryNav.map((item) => {
              const active = isItemActive(item.href);
              const isPinned = isFavorited(item.href);
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium tracking-tight transition-colors duration-150 ${
                      active
                        ? dark
                          ? "text-[#c9a34e]"
                          : "text-[#a27e2e]"
                        : dark
                          ? "text-[#c1cad7] hover:text-[#f7f3e8]"
                          : "text-[#4a566a] hover:text-[#16243d]"
                    }`}
                  >
                    <span className="relative">
                      {item.label}
                      <span
                        className={`absolute -bottom-1.5 left-0 right-0 h-px origin-left bg-[#c9a34e] transition-transform duration-200 ease-out ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleFavorite(item.href, item.label);
                    }}
                    aria-label={isPinned ? `Unpin ${item.label}` : `Pin ${item.label}`}
                    aria-pressed={isPinned}
                    className={`absolute -right-0.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-[#c9a34e] opacity-0 transition-all duration-150 group-hover:opacity-100 focus:opacity-100 ${
                      isPinned ? "opacity-100" : ""
                    } ${dark ? "hover:bg-white/10" : "hover:bg-[#16243d]/8"}`}
                  >
                    <Star size={11} strokeWidth={2.25} fill={isPinned ? "currentColor" : "none"} aria-hidden="true" />
                  </button>
                </div>
              );
            })}

            <div className="relative ml-1" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                className={`inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium tracking-tight transition-colors duration-150 ${
                  dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"
                }`}
              >
                More
                <ChevronDown size={14} strokeWidth={2} className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              <div
                role="menu"
                aria-label="More navigation"
                className={`absolute right-0 top-[calc(100%+8px)] w-[300px] origin-top-right overflow-hidden rounded-md border shadow-[0_24px_48px_rgba(7,17,35,0.22)] transition-all duration-200 ease-out ${searchPanelTone} ${
                  moreOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
              >
                <p className={`px-4 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>
                  More destinations
                </p>
                <ul className="grid grid-cols-1 gap-0.5 p-1.5">
                  {executiveMoreNav.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          role="menuitem"
                          onClick={() => setMoreOpen(false)}
                          className={`flex items-start gap-3 rounded px-2.5 py-2 text-sm transition-colors duration-150 ${
                            active
                              ? dark
                                ? "bg-white/[0.08] text-[#c9a34e]"
                                : "bg-[#a27e2e]/[0.08] text-[#a27e2e]"
                              : dark
                                ? "text-[#c1cad7] hover:bg-white/[0.05] hover:text-[#f7f3e8]"
                                : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"
                          }`}
                        >
                          <span className="mt-0.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" aria-hidden="true" />
                          <span className="flex-1">
                            <span className="block font-medium tracking-tight">{item.label}</span>
                            {item.description ? (
                              <span className={`mt-0.5 block text-[11px] font-normal tracking-tight ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>{item.description}</span>
                            ) : null}
                          </span>
                          <ArrowUpRight size={12} strokeWidth={2} className="mt-1 shrink-0 opacity-60" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors duration-150 lg:hidden ${
                dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"
              }`}
            >
              <Search size={17} strokeWidth={2} aria-hidden="true" />
            </button>

            <span className="hidden md:inline-flex">
              <LanguageSelector compact />
            </span>

            {variant !== "dashboard" && (
              <button
                type="button"
                aria-label="Notifications"
                className={`relative hidden h-11 w-11 items-center justify-center rounded-md transition-colors duration-150 sm:inline-flex ${
                  dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"
                }`}
              >
                <Bell size={17} strokeWidth={2} aria-hidden="true" />
                <span className="absolute right-2 top-2 inline-flex h-1.5 w-1.5 rounded-full bg-[#c9a34e]" aria-hidden="true" />
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className={`inline-flex h-11 items-center gap-2 rounded-md px-2 transition-colors duration-150 ${
                    dark ? "hover:bg-white/5" : "hover:bg-[#16243d]/[0.04]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold tracking-tight ${
                      dark ? "bg-[#c9a34e]/15 text-[#c9a34e]" : "bg-[#a27e2e]/15 text-[#a27e2e]"
                    }`}
                  >
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </span>
                  <ChevronDown size={13} strokeWidth={2} className={`hidden transition-transform duration-200 sm:inline ${userMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>

                <div
                  role="menu"
                  aria-label="User menu"
                  className={`absolute right-0 top-[calc(100%+8px)] w-[340px] origin-top-right overflow-hidden rounded-md border shadow-[0_24px_48px_rgba(7,17,35,0.22)] transition-all duration-200 ease-out ${searchPanelTone} ${
                    userMenuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                  }`}
                >
                  <div className={`flex items-center gap-3 border-b px-4 py-3 ${dark ? "border-white/8" : "border-[#16243d]/8"}`}>
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold tracking-tight ${
                        dark ? "bg-[#c9a34e]/15 text-[#c9a34e]" : "bg-[#a27e2e]/15 text-[#a27e2e]"
                      }`}
                    >
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold tracking-tight">{user?.name ?? "Member"}</p>
                      <p className={`truncate text-xs tracking-tight ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>{user?.email ?? ""}</p>
                    </div>
                    {isAdmin ? (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${dark ? "border-[#c9a34e]/40 bg-[#c9a34e]/10 text-[#c9a34e]" : "border-[#a27e2e]/40 bg-[#a27e2e]/10 text-[#a27e2e]"}`}>
                        <ShieldCheck size={11} strokeWidth={2.25} aria-hidden="true" />
                        Admin
                      </span>
                    ) : null}
                  </div>

                  <ul className="grid gap-0.5 p-1.5">
                    <li>
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors duration-150 ${dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"}`}
                      >
                        <User size={14} strokeWidth={2} aria-hidden="true" />
                        <span className="font-medium tracking-tight">My workspace</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors duration-150 ${dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"}`}
                      >
                        <Settings size={14} strokeWidth={2} aria-hidden="true" />
                        <span className="font-medium tracking-tight">Settings</span>
                      </Link>
                    </li>
                  </ul>

                  {isAdmin && quickActions.length > 0 ? (
                    <div className={`border-t px-2.5 py-2 ${dark ? "border-white/8" : "border-[#16243d]/8"}`}>
                      <p className={`flex items-center gap-1.5 px-1 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#c9a34e]" : "text-[#a27e2e]"}`}>
                        <Sparkles size={10} strokeWidth={2.25} aria-hidden="true" />
                        Quick actions
                      </p>
                      <ul className="grid gap-0.5">
                        {quickActions.slice(0, 4).map((action) => {
                          const ActionIcon = ICON_MAP[action.icon ?? "FilePlus"] ?? FilePlus;
                          return (
                            <li key={action.id}>
                              <Link
                                href={action.href}
                                role="menuitem"
                                onClick={() => {
                                  setUserMenuOpen(false);
                                  logActivityMutation.mutate({
                                    activityType: "quick_action",
                                    title: action.title,
                                    href: action.href,
                                    description: action.description,
                                  });
                                }}
                                className={`flex items-start gap-2.5 rounded px-2 py-1.5 text-sm transition-colors duration-150 ${dark ? "text-[#c1cad7] hover:bg-[#c9a34e]/10 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#a27e2e]/10 hover:text-[#16243d]"}`}
                              >
                                <ActionIcon size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-[#c9a34e]" aria-hidden="true" />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-medium tracking-tight">{action.title}</span>
                                  <span className={`block truncate text-[11px] font-normal tracking-tight ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>{action.description}</span>
                                </span>
                                <ArrowUpRight size={11} strokeWidth={2.25} className="mt-1 shrink-0 opacity-60" aria-hidden="true" />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}

                  {recentItems.length > 0 ? (
                    <div className={`border-t px-2.5 py-2 ${dark ? "border-white/8" : "border-[#16243d]/8"}`}>
                      <p className={`flex items-center gap-1.5 px-1 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>
                        <History size={10} strokeWidth={2.25} aria-hidden="true" />
                        Recent activity
                      </p>
                      <ul className="grid gap-0.5">
                        {recentItems.slice(0, 4).map((item) => (
                          <li key={item.id}>
                            <Link
                              href={item.href ?? "#"}
                              role="menuitem"
                              onClick={() => setUserMenuOpen(false)}
                              className={`flex items-start gap-2.5 rounded px-2 py-1.5 text-sm transition-colors duration-150 ${dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"}`}
                            >
                              <span className={`mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${dark ? "bg-[#c9a34e]" : "bg-[#a27e2e]"}`} aria-hidden="true" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium tracking-tight">{item.title}</span>
                                {item.description ? (
                                  <span className={`block truncate text-[11px] font-normal tracking-tight ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>{item.description}</span>
                                ) : null}
                              </span>
                              <span className={`shrink-0 text-[10px] font-medium tracking-tight ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>{relativeTime(item.createdAt)}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className={`border-t p-1.5 ${dark ? "border-white/8" : "border-[#16243d]/8"}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className={`flex w-full items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors duration-150 ${dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"}`}
                    >
                      <LogOut size={14} strokeWidth={2} aria-hidden="true" />
                      <span className="font-medium tracking-tight">Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth?mode=login"
                className={`hidden h-11 items-center gap-2 rounded-md px-4 text-[13px] font-semibold tracking-tight transition-colors duration-150 md:inline-flex ${
                  dark
                    ? "border border-[#c9a34e]/60 text-[#f7f3e8] hover:bg-[#c9a34e] hover:text-[#0a1426]"
                    : "border border-[#16243d]/20 bg-[#0a1426] text-white hover:bg-[#16243d]"
                }`}
              >
                Sign in
                <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden="true" />
              </Link>
            )}

            <Link
              href="/contact"
              className={`hidden h-11 items-center gap-2 rounded-md px-4 text-[13px] font-semibold tracking-tight transition-all duration-150 xl:inline-flex ${
                dark
                  ? "bg-[#c9a34e] text-[#0a1426] hover:bg-[#d4b35c] hover:shadow-[0_4px_16px_rgba(201,163,78,0.32)]"
                  : "bg-[#0a1426] text-white hover:bg-[#16243d] hover:shadow-[0_4px_16px_rgba(10,20,38,0.18)]"
              }`}
            >
              Start a conversation
              <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenuOpen}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors duration-150 xl:hidden ${
                dark ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"
              }`}
            >
              {mobileMenuOpen ? <X size={18} strokeWidth={2} aria-hidden="true" /> : <Menu size={18} strokeWidth={2} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t transition-all duration-300 ease-out xl:hidden ${
            dark ? "border-white/8 bg-[#0a1426]" : "border-[#16243d]/8 bg-white"
          } ${mobileMenuOpen ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="mx-auto w-full max-w-[1480px] px-4 py-4 sm:px-6 lg:px-10">
            <div className="mb-4 flex items-center gap-2 lg:hidden">
              <Search size={15} strokeWidth={2} className="text-[#a27e2e]" aria-hidden="true" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search…"
                className={`h-10 w-full rounded-md border bg-transparent px-3 text-sm tracking-tight outline-none ${dark ? "border-white/12 placeholder:text-[#8f9db3]" : "border-[#16243d]/15 placeholder:text-[#657084]"}`}
              />
            </div>

            <p className={`mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>
              Primary
            </p>
            <nav className="grid grid-cols-1 gap-1 sm:grid-cols-2" aria-label="Primary mobile">
              {visiblePrimaryNav.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex h-12 items-center justify-between gap-3 rounded-md border px-3.5 text-sm font-medium tracking-tight transition-colors duration-150 ${
                      active
                        ? dark
                          ? "border-[#c9a34e]/50 bg-[#c9a34e]/10 text-[#c9a34e]"
                          : "border-[#a27e2e]/50 bg-[#a27e2e]/10 text-[#a27e2e]"
                        : dark
                          ? "border-white/8 text-[#c1cad7] hover:border-white/20 hover:bg-white/5 hover:text-[#f7f3e8]"
                          : "border-[#16243d]/10 text-[#4a566a] hover:border-[#16243d]/25 hover:bg-white hover:text-[#16243d]"
                    }`}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{item.label}</span>
                      {item.description ? (
                        <span className={`truncate text-[11px] font-normal tracking-tight ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>{item.description}</span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFavorite(item.href, item.label);
                      }}
                      aria-label={isFavorited(item.href) ? `Unpin ${item.label}` : `Pin ${item.label}`}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-[#c9a34e] ${dark ? "hover:bg-white/10" : "hover:bg-[#16243d]/8"}`}
                    >
                      <Star size={14} strokeWidth={2.25} fill={isFavorited(item.href) ? "currentColor" : "none"} aria-hidden="true" />
                    </button>
                  </Link>
                );
              })}
            </nav>

            <p className={`mb-2 mt-5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#8f9db3]" : "text-[#657084]"}`}>
              More
            </p>
            <nav className="grid grid-cols-1 gap-1 sm:grid-cols-2" aria-label="More mobile">
              {executiveMoreNav.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex h-12 items-center justify-between gap-2 rounded-md px-3.5 text-sm font-medium tracking-tight transition-colors duration-150 ${
                      active
                        ? dark
                          ? "bg-white/[0.08] text-[#c9a34e]"
                          : "bg-[#a27e2e]/[0.08] text-[#a27e2e]"
                        : dark
                          ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]"
                          : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <ArrowUpRight size={13} strokeWidth={2} className="shrink-0 opacity-60" aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(22,36,61,0.06)" }}>
              <LanguageSelector compact onSelect={() => setMobileMenuOpen(false)} />
              {!isAuthenticated ? (
                <Link
                  href="/auth?mode=login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold tracking-tight ${dark ? "border border-white/15 text-[#f7f3e8] hover:bg-white/5" : "border border-[#16243d]/20 text-[#16243d] hover:bg-[#16243d]/[0.04]"}`}
                >
                  Sign in
                  <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden="true" />
                </Link>
              ) : null}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`ml-auto inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold tracking-tight ${dark ? "bg-[#c9a34e] text-[#0a1426] hover:bg-[#d4b35c]" : "bg-[#0a1426] text-white hover:bg-[#16243d]"}`}
              >
                Start a conversation
                <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#c9a34e]/60 bg-[#0a1426] text-[#c9a34e] shadow-[0_8px_24px_rgba(7,17,35,0.22)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#c9a34e] hover:text-[#0a1426] hover:shadow-[0_12px_28px_rgba(201,163,78,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e] motion-reduce:transition-none ${showBackToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
      >
        <ArrowUp size={16} strokeWidth={2.25} aria-hidden="true" />
      </button>
    </>
  );
}
