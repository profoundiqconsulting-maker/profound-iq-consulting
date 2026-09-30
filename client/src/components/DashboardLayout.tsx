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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex w-full max-w-md flex-col items-center gap-8 p-8">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
              Sign in to continue
            </h1>
            <p className="text-center text-sm text-slate-600 max-w-sm">
              Access to this dashboard requires authentication. Continue to
              launch the login flow.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all"
          >
            <Link href="/auth?mode=login&returnTo=%2Fdashboard">
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
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
  setSidebarWidth: (width: number) => void;
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
  const isMobile = useIsMobile();

  const normalizedUserRole = user?.role?.toLowerCase();
  const userRole =
    normalizedUserRole === "admin"
      ? "admin"
      : (role || normalizedUserRole || "user");
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
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
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

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-slate-900 text-white"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-14 border-b border-slate-800 bg-slate-900">
            <div className="flex h-full items-center gap-3 px-3 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-slate-400" />
              </button>
              {!isCollapsed && (
                <Link
                  href="/"
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0"
                  aria-label="Go to home page"
                >
                  <Home className="h-4 w-4 text-slate-400" />
                </Link>
              )}
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white">
                      {title || "Navigation"}
                    </span>
                    {role && (
                      <span
                        aria-label={`Role: ${role}`}
                        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[.1em] ring-1 ring-amber-400/30 bg-amber-400/10 text-amber-400 shrink-0"
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

          <SidebarContent className="gap-0 bg-slate-900">
            <SidebarMenu className="gap-0.5 px-2 py-3">
              {navGroups.map(group => {
                const groupItems = menuItems.filter(
                  item => item.group === group.id
                );
                if (!groupItems.length) return null;
                const isOperationsSticky =
                  group.id === "operations" && userRole === "admin";
                return (
                  <div
                    key={group.id}
                    className={`mb-3 last:mb-0 ${
                      isOperationsSticky
                        ? "sticky bottom-0 bg-slate-900 z-10"
                        : ""
                    }`}
                  >
                    {!isCollapsed && (
                      <p className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
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
                            className={`h-10 font-medium transition-all rounded-lg ${
                              isActive
                                ? "bg-amber-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/20"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <item.icon
                              className={`h-4 w-4 shrink-0 ${
                                isActive
                                  ? "text-slate-900"
                                  : "text-slate-400"
                              }`}
                            />
                            <span className={isActive ? "font-semibold" : ""}>
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
          <SidebarFooter className="border-t border-slate-800 bg-slate-900 p-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-11 w-full items-center gap-3 rounded-lg px-2 hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-white">
                        {user?.name || "-"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {user?.email || "-"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-white">
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-slate-300 focus:text-white focus:bg-slate-800"
                >
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-slate-800"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-amber-500/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-slate-50">
        {isMobile && (
          <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-600 hover:text-slate-900"
              >
                <Home size={14} aria-hidden="true" /> Home
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {activeMenuItem?.fallbackLabel ?? "Menu"}
              </span>
              {role && (
                <span
                  aria-label={`Role: ${role}`}
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[.1em] ring-1 ring-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-400"
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
        {!isMobile && (
          <ExecutiveHeader
            breadcrumbs={breadcrumbItems}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            role={role}
            user={user}
          />
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 text-slate-900">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
