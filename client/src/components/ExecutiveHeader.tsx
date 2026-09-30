import { useAuth } from "@/_core/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface ExecutiveHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
  role?: "user" | "staff" | "admin";
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}

export function ExecutiveHeader({
  breadcrumbs,
  searchOpen,
  setSearchOpen,
  role,
  user,
}: ExecutiveHeaderProps) {
  const { logout } = useAuth();
  const [notifications] = useState([
    { id: 1, title: "Weekly export ready", time: "2h ago", read: false },
    { id: 2, title: "3 failed deliveries", time: "5h ago", read: false },
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="hidden items-center gap-2 sm:flex">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  )}
                  {crumb.href && index < breadcrumbs.length - 1 ? (
                    <Link
                      href={crumb.href}
                      className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate-900" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <label htmlFor="global-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <Input
                id="global-search"
                type="search"
                placeholder="Search..."
                className="h-9 w-56 pl-9 text-sm"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:hidden"
            onClick={() => setSearchOpen?.(!searchOpen)}
            aria-label="Toggle search"
            aria-expanded={searchOpen}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative"
                aria-label={`Notifications, ${notifications.filter(n => !n.read).length} unread`}
              >
                <Bell className="h-4 w-4 text-slate-700" aria-hidden="true" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white">
                    <span className="sr-only">Unread notifications</span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80" aria-label="Notifications">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
              </div>
              <DropdownMenuSeparator />
              {notifications.map(notification => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-1 ${notification.read ? "" : "bg-slate-50"}`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                    {!notification.read && (
                      <span className="sr-only">Unread</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{notification.time}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 pl-1 pr-2"
                aria-label="User menu"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-slate-700 md:inline">
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" aria-label="User menu">
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-slate-200 bg-white p-4 sm:hidden">
          <div className="relative">
            <label htmlFor="mobile-search" className="sr-only">
              Search
            </label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <Input
              id="mobile-search"
              type="search"
              placeholder="Search..."
              className="h-10 w-full pl-9"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
