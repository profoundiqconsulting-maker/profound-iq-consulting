/* Profound IQ Consulting — Executive header navigation and authentication. */
import { useEffect, useState } from "react";
import { LogOut, Menu, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const primaryNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Self Assessment", href: "/assessment" },
  { label: "Career Path", href: "/careerpath" },
  { label: "Courses", href: "/courses" },
  { label: "Psychometrics", href: "/psychometrics" },
  { label: "School Solutions", href: "/school-solutions" },
  { label: "Resources", href: "/resources" },
  { label: "Contacts", href: "/contact" },
  { label: "My Space", href: "/dashboard" },
];

type ExecutiveHeaderProps = {
  variant?: "home" | "public" | "dashboard";
  dark?: boolean;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ExecutiveHeader({
  variant = "public",
  dark = true,
}: ExecutiveHeaderProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isItemActive = (href: string) => {
    const [pathOnly] = href.split("?");
    return location === href || location.startsWith(`${pathOnly}/`);
  };

  const navigateItems = primaryNavItems;

  const headerTone = dark
    ? "border-b border-white/[0.06] bg-[#0a1426]/95 text-[#f7f3e8] shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(7,17,35,0.18)] supports-[backdrop-filter]:bg-[#0a1426]/75"
    : "border-b border-[#16243d]/[0.06] bg-white/95 text-[#16243d] shadow-[0_1px_0_rgba(22,36,61,0.04),0_8px_24px_rgba(8,15,26,0.06)] supports-[backdrop-filter]:bg-white/75";

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
    <header
      data-executive-header
      data-compact={isCompact}
      className={cn(
        "sticky top-0 z-50 backdrop-blur-xl transition-all duration-200 ease-out",
        headerTone
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1480px] items-center gap-2 px-3 transition-all duration-200 sm:gap-3 sm:px-5 lg:gap-4 lg:px-8",
          isCompact ? "min-h-[54px]" : "min-h-[60px]"
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Profound IQ Consulting home"
        >
          <BrandLogo
            context="public page"
            compact={isCompact}
            className="border border-[#c9a34e]/60 transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(201,163,78,0.18)]"
          />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center xl:flex"
          aria-label="Primary"
        >
          <div className="flex items-center gap-0.5 xl:gap-1">
            {navigateItems.map(item => {
              const isMySpace = item.href === "/dashboard";
              const active = isMySpace
                ? isItemActive("/dashboard") || isItemActive("/myspace")
                : isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={isMySpace && !isAuthenticated ? "/myspace" : item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-10 items-center rounded-md px-3 text-[13px] font-medium tracking-tight transition-colors duration-150",
                    active
                      ? dark
                        ? "text-[#c9a34e]"
                        : "text-[#a27e2e]"
                      : dark
                        ? "text-[#c1cad7] hover:text-[#f7f3e8]"
                        : "text-[#4a566a] hover:text-[#16243d]"
                  )}
                >
                  <span className="relative">
                    {item.label}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 right-0 h-px origin-left bg-[#c9a34e] transition-transform duration-200 ease-out",
                        active ? "scale-x-100" : "scale-x-0 hover:scale-x-100"
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hidden xl:flex items-center gap-2 ml-2 pl-2 border-l border-white/10 text-left"
                  >
                    <span className="text-[11px] text-[#8f9db3]">
                      Signed in as{" "}
                      <span className="font-semibold text-[#c9a34e]">
                        {user?.name ?? "User"}
                      </span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => logout()}
                    className="cursor-pointer"
                  >
                    <LogOut size={14} className="mr-2" aria-hidden="true" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <nav
                className="hidden xl:flex items-center gap-1 ml-2 pl-2 border-l border-white/10"
                aria-label="Account"
              >
                <Link
                  href="/auth?mode=login"
                  className="inline-flex h-8 items-center rounded-md px-3 text-[11px] font-semibold tracking-tight text-[#c1cad7] transition-colors duration-150 hover:text-[#f7f3e8]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="inline-flex h-8 items-center rounded-md px-3 text-[11px] font-semibold tracking-tight bg-[#c9a34e] text-[#0a1426] transition-colors duration-150 hover:bg-[#d4b35c]"
                >
                  Sign Up
                </Link>
              </nav>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(open => !open)}
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150 xl:hidden",
              dark
                ? "text-[#c1cad7] hover:bg-white/5 hover:text-[#f7f3e8]"
                : "text-[#4a566a] hover:bg-[#16243d]/[0.04] hover:text-[#16243d]"
            )}
          >
            {mobileMenuOpen ? (
              <X size={18} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu size={18} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t transition-all duration-300 ease-out xl:hidden",
          dark ? "border-white/8 bg-[#0a1426]" : "border-[#16243d]/8 bg-white",
          mobileMenuOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-5 lg:px-8">
          <div className="mb-4 flex items-center gap-2 xl:hidden">
            <Search
              size={15}
              strokeWidth={2}
              className={dark ? "text-[#a27e2e]" : "text-[#a27e2e]"}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search…"
              className={cn(
                "h-10 w-full rounded-md border bg-transparent px-3 text-sm tracking-tight outline-none",
                dark
                  ? "border-white/12 placeholder:text-[#8f9db3]"
                  : "border-[#16243d]/15 placeholder:text-[#657084]"
              )}
            />
          </div>

          <nav className="grid grid-cols-1 gap-1" aria-label="Primary mobile">
            {navigateItems.map(item => {
              const isMySpace = item.href === "/dashboard";
              const active = isMySpace
                ? isItemActive("/dashboard") || isItemActive("/myspace")
                : isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={isMySpace && !isAuthenticated ? "/myspace" : item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-md px-3.5 text-sm font-medium tracking-tight transition-colors duration-150",
                    active
                      ? dark
                        ? "border-[#c9a34e]/50 bg-[#c9a34e]/10 text-[#c9a34e]"
                        : "border-[#a27e2e]/50 bg-[#a27e2e]/10 text-[#a27e2e]"
                      : dark
                        ? "border border-white/8 text-[#c1cad7] hover:border-white/20 hover:bg-white/5 hover:text-[#f7f3e8]"
                        : "border border-[#16243d]/10 text-[#4a566a] hover:border-[#16243d]/25 hover:bg-white hover:text-[#16243d]"
                  )}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div
            className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4"
            style={{
              borderColor: dark
                ? "rgba(255,255,255,0.06)"
                : "rgba(22,36,61,0.06)",
            }}
          >
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold tracking-tight",
                      dark
                        ? "border border-white/15 text-[#f7f3e8] hover:bg-white/5"
                        : "border border-[#16243d]/20 text-[#16243d] hover:bg-[#16243d]/[0.04]"
                    )}
                  >
                    <span className="text-[11px] text-[#8f9db3]">
                      Signed in as{" "}
                      <span className="font-semibold text-[#c9a34e]">
                        {user?.name ?? "User"}
                      </span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="cursor-pointer"
                  >
                    <LogOut size={14} className="mr-2" aria-hidden="true" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/auth?mode=login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "inline-flex h-11 items-center rounded-md px-4 text-sm font-semibold tracking-tight",
                    dark
                      ? "text-[#c1cad7] hover:text-[#f7f3e8]"
                      : "text-[#4a566a] hover:text-[#16243d]"
                  )}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-11 items-center rounded-md bg-[#c9a34e] px-4 text-sm font-semibold tracking-tight text-[#0a1426] transition-colors hover:bg-[#d4b35c]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
