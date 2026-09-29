import {
  ChevronDown,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Settings2,
  Sun,
  UserCircle2,
  X,
} from "lucide-react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import { useTheme } from "@/contexts/ThemeContext";


const serviceLabels = {
  assessment: "Self Assessment",
  careerpath: "CareerPath",
  psychometrics: "Psychometrics",
  courses: "Courses",
} as const;
const searchItems = [
  {
    label: "Clarity and direction",
    service: "Self Assessment",
    href: "/assessment",
  },
  {
    label: "Leadership and influence",
    service: "Self Assessment",
    href: "/assessment",
  },
  {
    label: "Learning and adaptability",
    service: "Self Assessment",
    href: "/assessment",
  },
  {
    label: "Career pathway and talent fit",
    service: "CareerPath",
    href: "/careerpath",
  },
  { label: "Pure Sciences", service: "CareerPath", href: "/careerpath" },
  { label: "Applied Sciences", service: "CareerPath", href: "/careerpath" },
  { label: "Technical Studies", service: "CareerPath", href: "/careerpath" },
  {
    label: "Languages and Humanities",
    service: "CareerPath",
    href: "/careerpath",
  },
  { label: "Arts and Sports", service: "CareerPath", href: "/careerpath" },
  { label: "Psychometric testing", service: "Psychometrics", href: "/psychometrics" },
  { label: "Career personality", service: "Psychometrics", href: "/psychometrics" },
  { label: "Leadership potential", service: "Psychometrics", href: "/psychometrics" },
];

export function TransformationNav({
  active,
}: {
  active: "assessment" | "careerpath" | "psychometrics" | "courses";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
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
  });
  const [certificateAvailable, setCertificateAvailable] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("piq-new-certificate-available") === "true"
  );
  const { user, isAuthenticated, loading } = useAuth();
  const { theme, setTheme, switchable } = useTheme();
  
  const activeLabel =
    active === "assessment"
      ? "Self Assessment"
      : active === "careerpath"
        ? "CareerPath"
        : active === "courses"
          ? "Courses"
          : "Psychometrics";
  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  };
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? searchItems
          .filter(item =>
            `${item.label} ${item.service}`.toLowerCase().includes(normalized)
          )
          .slice(0, 6)
      : [];
  }, [query]);
  useEffect(() => {
    setSelectedSearchIndex(0);
  }, [query]);
  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setSelectedSearchIndex(index => (index + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setSelectedSearchIndex(
        index => (index - 1 + results.length) % results.length
      );
    } else if (event.key === "Enter" && results[selectedSearchIndex]) {
      event.preventDefault();
      recordSearch(results[selectedSearchIndex].label);
      const href = results[selectedSearchIndex].href;
      closeMenus();
      window.location.href = href;
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setSearchOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        window.setTimeout(
          () => document.getElementById("transformation-search")?.focus(),
          0
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const shareCertificate = async () => {
    const shareData = {
      title: "Profound IQ completion certificate",
      text: "I earned a Profound IQ Consulting completion certificate.",
      url: `${PUBLISHED_SITE_ORIGIN}/dashboard?tab=certificates`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        toast.success("Certificate share text copied");
      } else throw new Error("Sharing is unavailable in this browser.");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError")
        toast.error("Could not share certificate", {
          description:
            error instanceof Error
              ? error.message
              : "Try opening Certificates from your profile.",
        });
    }
  };

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
          onClick: () => {
            void shareCertificate();
          },
        },
      });
      window.localStorage.setItem("piq-certificate-toast-seen", "true");
    }
  }, [certificateAvailable]);

  useEffect(() => {
    const onStorage = () =>
      setCertificateAvailable(
        window.localStorage.getItem("piq-new-certificate-available") === "true"
      );
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
    window.localStorage.setItem("piq-recent-searches", JSON.stringify(next));
  };
  const selectSearch = (value: string) => {
    setQuery(value);
    window.dispatchEvent(
      new CustomEvent("piq-search-query", { detail: value })
    );
    setSearchOpen(true);
    recordSearch(value);
  };
  const switchService = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    event.preventDefault();
    closeMenus();
    const navigate = () => {
      window.location.href = href;
    };
    if ("startViewTransition" in document)
      (
        document as Document & {
          startViewTransition: (callback: () => void) => void;
        }
      ).startViewTransition(navigate);
    else navigate();
  };

  return (
    <header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8]">
      <div className="container flex items-center justify-between gap-4 py-4 sm:py-5">
        <Link
          href="/"
          className="shrink-0"
          aria-label="Profound IQ Consulting home"
        >
          <BrandLogo context="assessment" compactOnMobile />
        </Link>
        <nav
          className="hidden items-center gap-5 text-[10px] font-black uppercase tracking-[.14em] md:flex"
          aria-label="Transformation services navigation"
        >
          <Link href="/" className="text-[#c1cad7] hover:text-[#c9a34e]">
            Home
          </Link>
          <a
            href="/courses"
            onClick={event => switchService(event, "/courses")}
            className={
              active === "courses"
                ? "text-[#c9a34e]"
                : "text-[#c1cad7] hover:text-[#c9a34e]"
            }
          >
            Courses
          </a>
          <a
            href="/assessment"
            onClick={event => switchService(event, "/assessment")}
            className={
              active === "assessment"
                ? "text-[#c9a34e]"
                : "text-[#c1cad7] hover:text-[#c9a34e]"
            }
          >
            {"Self Assessment"}
          </a>
          <a
            href="/careerpath"
            onClick={event => switchService(event, "/careerpath")}
            className={
              active === "careerpath"
                ? "text-[#c9a34e]"
                : "text-[#c1cad7] hover:text-[#c9a34e]"
            }
          >
            {"CareerPath"}
          </a>
          <a
            href="/psychometrics"
            onClick={event => switchService(event, "/psychometrics")}
            className={
              active === "psychometrics"
                ? "text-[#c9a34e]"
                : "text-[#c1cad7] hover:text-[#c9a34e]"
            }
          >
            {"Psychometrics"}
          </a>
          <Link href="/dashboard" className="text-[#c1cad7] hover:text-[#c9a34e]">
            My Space
          </Link>
          <a href="/#contact" className="text-[#c1cad7] hover:text-[#c9a34e]">
            {"Contact"}
          </a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen(current => !current)}
              aria-label="Search Transformation Services"
              aria-expanded={searchOpen}
              className="inline-flex items-center gap-2 border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]"
            >
              <Search size={14} /> Search
            </button>
            {searchOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 border border-[#c9a34e]/60 bg-[#f7f3e8] p-3 text-[#16243d] shadow-xl">
                <div className="flex items-center gap-2 border border-[#16243d]/20 px-3">
                  <Search size={14} className="text-[#7d5e1e]" />
                  <input
                    id="transformation-search"
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
                      results[selectedSearchIndex]
                        ? `search-result-${selectedSearchIndex}`
                        : undefined
                    }
                     placeholder="Search modules or topics"
                     aria-label="Search modules or topics"
                     className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                   />
                  <kbd className="text-[9px] text-[#657084]">ESC</kbd>
                </div>
                {!query && recentSearches.length > 0 && (
                  <div
                    className="mt-3"
                    role="listbox"
                    aria-label="Recent searches"
                  >
                    <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                      Recent searches
                    </p>
                    {recentSearches.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => selectSearch(item)}
                        className="block w-full px-3 py-2 text-left text-xs hover:bg-[#ead9ae]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
                {query && (
                  <div
                    className="mt-2"
                    role="listbox"
                    aria-label="Search results"
                  >
                    {results.length ? (
                      results.map((item, index) => (
                        <a
                          key={`${item.service}-${item.label}`}
                          id={`search-result-${index}`}
                          role="option"
                          aria-selected={index === selectedSearchIndex}
                          href={item.href}
                          onMouseEnter={() => setSelectedSearchIndex(index)}
                          onClick={event => {
                            recordSearch(item.label);
                            switchService(event, item.href);
                          }}
                          className={`block px-3 py-3 text-xs hover:bg-[#ead9ae] ${index === selectedSearchIndex ? "bg-[#ead9ae]" : ""}`}
                        >
                          <span className="block font-semibold">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-[10px] uppercase tracking-[.12em] text-[#7d5e1e]">
                            {item.service}
                          </span>
                        </a>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-xs text-[#657084]">
                        No matching topics yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(current => !current)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="relative inline-flex items-center gap-2 border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]"
              >
                <UserCircle2 size={15} /> {user?.name || "Profile"}
                <ChevronDown size={13} />
                {certificateAvailable && (
                  <span
                    className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#c9a34e] ring-2 ring-[#101d35]"
                    aria-label="New certificate available"
                  />
                )}
              </button>
              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 border border-[#c9a34e]/60 bg-[#f7f3e8] p-2 text-[#16243d] shadow-xl"
                >
                  <p className="border-b border-[#16243d]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                    {user?.name || "Your profile"}
                  </p>
                  <Link
                    href="/dashboard"
                    onClick={closeMenus}
                    className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"
                  >
                    Saved progress{" "}
                    <ChevronRight size={13} className="ml-auto" />
                  </Link>
                  <Link
                    href="/dashboard?tab=certificates"
                    onClick={() => {
                      window.localStorage.removeItem(
                        "piq-new-certificate-available"
                      );
                      setCertificateAvailable(false);
                      closeMenus();
                    }}
                    className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"
                  >
                    My Certificates{" "}
                    {certificateAvailable && (
                      <span className="ml-auto rounded-full bg-[#c9a34e] px-1.5 py-0.5 text-[9px] font-black">
                        NEW
                      </span>
                    )}{" "}
                    {!certificateAvailable && (
                      <ChevronRight size={13} className="ml-auto" />
                    )}
                  </Link>
                  <Link
                    href="/dashboard?download=score-summary"
                    onClick={closeMenus}
                    className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"
                  >
                    <span>Download score summary</span>
                    <ChevronRight size={13} className="ml-auto" />
                  </Link>
                  <Link
                    href="/settings"
                    onClick={closeMenus}
                    className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"
                  >
                    <Settings2 size={14} /> Settings{" "}
                    <ChevronRight size={13} className="ml-auto" />
                  </Link>
                  {switchable && (
                    <div className="border-t border-[#16243d]/10 px-3 py-3">
                      <p className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                        Theme
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setTheme("light")}
                          className={`flex-1 px-2 py-2 text-[10px] ${theme === "light" ? "bg-[#16243d] text-[#f7f3e8]" : "bg-[#ead9ae]"}`}
                        >
                          <Sun size={12} className="mx-auto" />
                          Light
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme("dark")}
                          className={`flex-1 px-2 py-2 text-[10px] ${theme === "dark" ? "bg-[#16243d] text-[#f7f3e8]" : "bg-[#ead9ae]"}`}
                        >
                          <Moon size={12} className="mx-auto" />
                          Dark
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme("auto")}
                          className={`flex-1 px-2 py-2 text-[10px] ${theme === "auto" ? "bg-[#c9a34e] text-[#16243d]" : "bg-[#ead9ae]"}`}
                        >
                          Auto
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startLogin()}
              className="border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]"
            >
              Sign in
            </button>
          )}
        </div>
        <button
          type="button"
          className="md:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(current => !current)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className="border-t border-white/10 bg-[#0d1a2f] px-5 py-2 sm:px-6">
        <div
          className="container flex items-center gap-2 text-[9px] font-black uppercase tracking-[.14em] text-[#8f9db3]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#c9a34e]">
            Transformation Services
          </Link>
          <ChevronRight size={12} className="text-[#c9a34e]" />
          <span className="text-[#f7f3e8]">{activeLabel}</span>
        </div>
      </div>
      {menuOpen && (
        <nav
          className="border-t border-white/10 bg-[#101d35] px-5 py-5 md:hidden"
          aria-label="Mobile transformation services navigation"
        >
          <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[.14em]">
            <Link href="/" onClick={closeMenus} className="text-[#c1cad7]">
              Home
            </Link>
            <a
              href="/courses"
              onClick={event => switchService(event, "/courses")}
              className={
                active === "courses" ? "text-[#c9a34e]" : "text-[#c1cad7]"
              }
            >
              Courses
            </a>
            <a
              href="/assessment"
              onClick={event => switchService(event, "/assessment")}
              className={
                active === "assessment" ? "text-[#c9a34e]" : "text-[#c1cad7]"
              }
            >
              {"Self Assessment"}
            </a>
            <a
              href="/careerpath"
              onClick={event => switchService(event, "/careerpath")}
              className={
                active === "careerpath" ? "text-[#c9a34e]" : "text-[#c1cad7]"
              }
            >
              {"CareerPath"}
            </a>
            <a
              href="/psychometrics"
              onClick={event => switchService(event, "/psychometrics")}
              className={
                active === "psychometrics"
                  ? "text-[#c9a34e]"
                  : "text-[#c1cad7]"
              }
            >
              {"Psychometrics"}
            </a>
            <Link href="/dashboard" onClick={closeMenus} className="text-[#c9a34e]">
              My Space
            </Link>
            <a href="/#contact" onClick={closeMenus} className="text-[#c1cad7]">
              {"Contact"}
            </a>
            {!loading &&
              (isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMenus}
                    className="text-[#c9a34e]"
                  >
                    Saved progress
                  </Link>
                  <Link
                    href="/dashboard?tab=certificates"
                    onClick={closeMenus}
                    className="text-[#c9a34e]"
                  >
                    My Certificates
                  </Link>
                  <Link
                    href="/dashboard?download=score-summary"
                    onClick={closeMenus}
                    className="text-[#c9a34e]"
                  >
                    Download score summary
                  </Link>
                  <Link
                    href="/settings"
                    onClick={closeMenus}
                    className="text-[#c9a34e]"
                  >
                    Settings
                  </Link>
                  {switchable && (
                    <div className="flex items-center gap-2 text-[#c9a34e]">
                      <span>Theme:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setTheme(
                            theme === "light"
                              ? "dark"
                              : theme === "dark"
                                ? "auto"
                                : "light"
                          )
                        }
                        className="font-black"
                      >
                        {theme === "auto"
                          ? "Auto"
                          : theme === "dark"
                            ? "Dark"
                            : "Light"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="text-left text-[#c9a34e]"
                  onClick={() => {
                    closeMenus();
                    startLogin();
                  }}
                >
                  Sign in
                </button>
              ))}
          </div>
        </nav>
      )}
    </header>
  );
}
