import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

const primaryNavItems = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "School Solutions", href: "/school-solutions" },
  { label: "Courses", href: "/courses" },
  { label: "Assessment", href: "/assessment" },
  { label: "Career Path", href: "/careerpath" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
  { label: "My Space", href: "/dashboard" },
];

export function SiteNavigation() {
  const [isCompact, setIsCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const isItemActive = (href: string) => {
    const [pathOnly] = href.split("?");
    return location === href || location.startsWith(`${pathOnly}/`);
  };

  useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-sticky-navigation
      data-compact={isCompact}
      className="sticky top-0 z-50"
    >
      <nav aria-label="Primary">
        {primaryNavItems.map(item => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
            />
          );
        })}
        <Link href="/dashboard" />
        <Link
          href={isAuthenticated ? "/dashboard" : "/auth?mode=login"}
        />
      </nav>
      <button
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setMenuOpen(open => !open)}
      />
      <button aria-label="Back to top" />
    </header>
  );
}
