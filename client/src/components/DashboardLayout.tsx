import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ArrowLeft, LogOut, PanelLeft, ShieldCheck } from "lucide-react";
import { isQualityControlAdmin } from "@shared/courseAccess";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import {
  dashboardNavGroups,
  visibleDashboardNavItems,
} from "./dashboardNavigation";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

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
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center text-slate-900">
              Sign in to continue
            </h1>
            <p className="text-sm text-slate-600 text-center max-w-sm">
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
        setSidebarWidth={setSidebarWidth}
        title={title}
        role={role}
      >
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  title?: string;
  role?: "user" | "staff" | "admin";
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  title,
  role,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const userRole = role || user?.role || "user";
  const menuItems = visibleDashboardNavItems(userRole);
  const activeMenuItem = menuItems.find(
    item => location === item.path || location.startsWith(`${item.path}/`)
  );

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
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

    const handleMouseUp = () => {
      setIsResizing(false);
    };

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
          <SidebarHeader className="h-16 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3 px-4 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-slate-400" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate text-white">
                    {title || "Navigation"}
                  </span>
                  {isQualityControlAdmin(user) ? (
                    <span
                      aria-label="Quality Control Mode active"
                      title="Quality Control Mode active"
                      className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-400"
                    >
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                      <span>QC Mode</span>
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-slate-900">
            <SidebarMenu className="gap-1 px-3 py-4">
              {dashboardNavGroups.map(group => {
                const groupItems = menuItems.filter(
                  item => item.group === group.id
                );
                if (!groupItems.length) return null;
                return (
                  <div key={group.id} className="mb-4 last:mb-0">
                    {!isCollapsed && (
                      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
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
                            className={`h-11 font-medium transition-all rounded-lg ${
                              isActive
                                ? "bg-amber-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/20"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <item.icon
                              className={`h-5 w-5 ${
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

          <SidebarFooter className="border-t border-slate-800 bg-slate-900 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-800 transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                  <Avatar className="h-9 w-9 border-2 border-amber-500/30">
                    {user?.avatarUrl &&
                      (
                        user.notificationPreferences as
                          | { showAvatar?: boolean }
                          | undefined
                      )?.showAvatar !== false && (
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={`${user.name ?? "User"} profile picture`}
                        />
                      )}
                    <AvatarFallback className="bg-slate-800 text-amber-400 text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-white">
                        {user?.name || "-"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.email || "-"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-white">
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
          <div className="flex border-b border-slate-200 h-14 items-center justify-between bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200" />
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft size={14} aria-hidden="true" /> Back
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-900">
                  {activeMenuItem?.fallbackLabel ?? "Menu"}
                </span>
              </div>
              {isQualityControlAdmin(user) ? (
                <span
                  aria-label="Quality Control Mode active"
                  title="Quality Control Mode active"
                  className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-[.1em] text-amber-600"
                >
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  <span>QC</span>
                </span>
              ) : null}
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
