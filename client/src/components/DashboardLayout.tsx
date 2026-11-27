import { useAuth } from "@/_core/hooks/useAuth";
import { ExecutiveHeader } from "@/components/ExecutiveHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { Bell, LogOut, PanelLeft, Search, Home, Menu } from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  visibleDashboardNavItems,
  visibleDashboardNavGroups,
} from "./dashboardNavigation";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 220;
const MAX_WIDTH = 400;

export default function DashboardLayout({
  children,
  title,
  role,
}: {
  children: React.ReactNode;
  title?: string;
  role?: "user" | "staff" | "admin";
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    if (!searchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".exec-search-container")) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClick);
    };
  }, [searchOpen]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-8 text-center shadow-sm">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">
              Sign in to continue
            </h1>
            <p className="max-w-sm text-sm leading-6 text-[var(--fg-muted)]">
              Access to this dashboard requires authentication. Continue to
              launch the login flow.
            </p>
          </div>
          <Button asChild size="lg" variant="brand">
            <Link href="/auth?mode=login&returnTo=%2Fdashboard%2Foverview">
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        setSidebarWidth={setSidebarWidth}
        title={title}
        role={role}
        user={user}
      >
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
  title?: string;
  role?: "user" | "staff" | "admin";
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
};

function DashboardLayoutContent({
  children,
  searchOpen,
  setSearchOpen,
  setSidebarWidth,
  title,
  role,
  user,
}: DashboardLayoutContentProps) {
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarLeftRef = useRef(0);
  const isMobile = useIsMobile();

  const normalizedUserRole = user?.role?.toLowerCase();
  const userRole =
    normalizedUserRole === "admin"
      ? "admin"
      : role || normalizedUserRole || "user";
  const menuItems = useMemo(
    () => visibleDashboardNavItems(userRole),
    [userRole]
  );
  const navGroups = useMemo(
    () => visibleDashboardNavGroups(userRole),
    [userRole]
  );
  const activeMenuItem = useMemo(
    () =>
      menuItems.find(
        item => location === item.path || location.startsWith(`${item.path}/`)
      ),
    [location, menuItems]
  );

  const breadcrumbItems = useMemo(() => {
    if (!activeMenuItem || !title) return [];
    if (activeMenuItem.fallbackLabel === title) return [];
    return [
      { label: activeMenuItem.fallbackLabel, href: activeMenuItem.path },
      { label: title },
    ];
  }, [activeMenuItem, title]);

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.round(e.clientX - sidebarLeftRef.current);
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const handleResizerKeyDown = (e: React.KeyboardEvent) => {
    if (isCollapsed) return;
    const step = e.shiftKey ? 20 : 5;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSidebarWidth(prev => Math.max(MIN_WIDTH, prev - step));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSidebarWidth(prev => Math.min(MAX_WIDTH, prev + step));
    }
  };

  return (
    <>
      <div className="relative h-screen" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-[var(--bg)] text-[var(--fg)] h-screen"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
            <div className="flex h-full items-center gap-3 px-3 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed && (
                <Link
                  href="/"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  aria-label="Go to home page"
                >
                  <Home className="h-4 w-4" />
                </Link>
              )}
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--fg)]">
                      {title || "Navigation"}
                    </span>
                    {role && (
                      <span
                        aria-label={`Role: ${role}`}
                        className="inline-flex shrink-0 items-center rounded-full bg-[var(--brand-muted)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-[var(--fg)] ring-1 ring-[var(--brand)]/20"
                      >
                        {role === "admin"
                          ? "Admin"
                          : role === "staff"
                            ? "Staff"
                            : "Learner"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="flex min-h-0 flex-1 gap-0 overflow-y-auto bg-[var(--bg-elevated)]">
            <SidebarMenu className="gap-0 px-1 py-1">
              {navGroups.map(group => {
                const groupItems = menuItems.filter(
                  item => item.group === group.id
                );
                if (!groupItems.length) return null;
                return (
                  <div key={group.id} className="mb-1 last:mb-0">
                    {!isCollapsed && (
                      <p className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--fg-subtle)]">
                        {group.fallbackLabel}
                      </p>
                    )}
                    {groupItems.map(item => {
                      const isActive =
                        location === item.path ||
                        location.startsWith(`${item.path}/`);
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setLocation(item.path)}
                            tooltip={item.fallbackLabel}
                            className={`h-9 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                              isActive
                                ? "bg-[var(--brand-muted)] font-semibold text-[var(--fg)]"
                                : "text-[var(--fg-muted)] hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)]"
                            }`}
                          >
                            <item.icon
                              className={`h-4 w-4 shrink-0 ${
                                isActive
                                  ? "text-[var(--brand)]"
                                  : "text-[var(--fg-subtle)]"
                              }`}
                            />
                            <span
                              className={`truncate ${isActive ? "font-semibold" : ""}`}
                            >
                              {item.fallbackLabel}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-[var(--border)] bg-[var(--bg-elevated)] p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-11 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-[var(--bg-sunken)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-muted)] text-xs font-bold text-[var(--fg)]">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-[var(--fg)]">
                        {user?.name || "-"}
                      </p>
                      <p className="truncate text-xs text-[var(--fg-muted)]">
                        {user?.email || "-"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--fg)]"
              >
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-[var(--fg-muted)] focus:bg-[var(--bg-sunken)] focus:text-[var(--fg)]"
                >
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--border)]" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-[var(--danger)] focus:bg-[var(--danger-muted)] focus:text-[var(--danger)]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          tabIndex={0}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-amber-400/30 transition-colors focus:outline-none focus-visible:bg-amber-400/50 ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            sidebarLeftRef.current =
              sidebarRef.current?.getBoundingClientRect().left ?? 0;
            setIsResizing(true);
          }}
          onKeyDown={handleResizerKeyDown}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-[var(--bg)]">
        <ExecutiveHeader
          breadcrumbs={breadcrumbItems}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          role={role}
          user={user}
          leadingAction={
            isMobile ? (
              <SidebarTrigger className="h-9 w-9 shrink-0 rounded-lg border border-white/20 bg-white/5 text-[#c1cad7] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e]">
                <Menu className="h-4 w-4" aria-hidden="true" />
              </SidebarTrigger>
            ) : undefined
          }
        />
        <div className="min-w-0 flex-1 p-4 text-[var(--fg)] sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </>
  );
}
