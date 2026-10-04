import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme?: () => void;
  switchable: boolean;
  effectiveTheme: "light" | "dark";
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (!switchable) return defaultTheme;
    if (typeof window === "undefined") return defaultTheme;
    const stored = window.localStorage.getItem("theme");
    return stored === "light" || stored === "dark" || stored === "auto"
      ? stored
      : defaultTheme;
  });
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false)
  );
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const update = () => setSystemDark(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  const effectiveTheme =
    theme === "auto" ? (systemDark ? "dark" : "light") : theme;
  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (!prefersReducedMotion) root.classList.add("theme-transitioning");
    root.classList.toggle("dark", effectiveTheme === "dark");
    if (switchable) window.localStorage.setItem("theme", theme);
    const timeout = window.setTimeout(
      () => root.classList.remove("theme-transitioning"),
      prefersReducedMotion ? 0 : 280
    );
    return () => window.clearTimeout(timeout);
  }, [effectiveTheme, switchable, theme]);
  const toggleTheme = switchable
    ? () =>
        setTheme(prev =>
          prev === "light" ? "dark" : prev === "dark" ? "auto" : "light"
        )
    : undefined;
  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, switchable, effectiveTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
