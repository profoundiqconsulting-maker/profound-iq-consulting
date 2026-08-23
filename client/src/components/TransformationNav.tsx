import { ChevronDown, ChevronRight, Menu, Moon, Search, Settings2, Sun, UserCircle2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";
import { useTheme } from "@/contexts/ThemeContext";

const serviceLabels = { assessment: "Self Assessment", careerpath: "CareerPath" } as const;
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
];

export function TransformationNav({ active }: { active: "assessment" | "careerpath" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [certificateAvailable, setCertificateAvailable] = useState(() => window.localStorage.getItem("piq-new-certificate-available") === "true");
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const activeLabel = serviceLabels[active];
  const closeMenus = () => { setMenuOpen(false); setProfileOpen(false); setSearchOpen(false); };
  const results = useMemo(() => { const normalized = query.trim().toLowerCase(); return normalized ? searchItems.filter((item) => `${item.label} ${item.service}`.toLowerCase().includes(normalized)).slice(0, 6) : []; }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setProfileOpen(false); setSearchOpen(false); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); window.setTimeout(() => document.getElementById("transformation-search")?.focus(), 0); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onStorage = () => setCertificateAvailable(window.localStorage.getItem("piq-new-certificate-available") === "true");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const switchService = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault(); closeMenus();
    const navigate = () => { window.location.href = href; };
    if ("startViewTransition" in document) (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(navigate); else navigate();
  };

  return <header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8]">
    <div className="container flex items-center justify-between gap-4 py-4 sm:py-5">
      <Link href="/" className="shrink-0" aria-label="Profound IQ Consulting home"><BrandLogo context="assessment" compactOnMobile /></Link>
      <nav className="hidden items-center gap-5 text-[10px] font-black uppercase tracking-[.14em] md:flex" aria-label="Transformation services navigation"><Link href="/" className="text-[#c1cad7] hover:text-[#c9a34e]">Home</Link><a href="/assessment" onClick={(event) => switchService(event, "/assessment")} className={active === "assessment" ? "text-[#c9a34e]" : "text-[#c1cad7] hover:text-[#c9a34e]"}>Self Assessment</a><a href="/careerpath" onClick={(event) => switchService(event, "/careerpath")} className={active === "careerpath" ? "text-[#c9a34e]" : "text-[#c1cad7] hover:text-[#c9a34e]"}>CareerPath</a><a href="/#contact" className="text-[#c1cad7] hover:text-[#c9a34e]">Contact</a></nav>
      <div className="hidden items-center gap-2 md:flex"><div className="relative"><button type="button" onClick={() => setSearchOpen((current) => !current)} aria-label="Search Transformation Services" aria-expanded={searchOpen} className="inline-flex items-center gap-2 border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]"><Search size={14} /> Search</button>{searchOpen && <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 border border-[#c9a34e]/60 bg-[#f7f3e8] p-3 text-[#16243d] shadow-xl"><div className="flex items-center gap-2 border border-[#16243d]/20 px-3"><Search size={14} className="text-[#7d5e1e]" /><input id="transformation-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modules or topics" aria-label="Search modules or topics" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><kbd className="text-[9px] text-[#657084]">ESC</kbd></div>{query && <div className="mt-2" role="listbox" aria-label="Search results">{results.length ? results.map((item) => <a key={`${item.service}-${item.label}`} href={item.href} onClick={(event) => switchService(event, item.href)} className="block px-3 py-3 text-xs hover:bg-[#ead9ae]"><span className="block font-semibold">{item.label}</span><span className="mt-1 block text-[10px] uppercase tracking-[.12em] text-[#7d5e1e]">{item.service}</span></a>) : <p className="px-3 py-3 text-xs text-[#657084]">No matching topics yet.</p>}</div>}</div>}</div>{isAuthenticated ? <div className="relative"><button type="button" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen} aria-haspopup="menu" className="relative inline-flex items-center gap-2 border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]"><UserCircle2 size={15} /> {user?.name || "Profile"}<ChevronDown size={13} />{certificateAvailable && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#c9a34e] ring-2 ring-[#101d35]" aria-label="New certificate available" />}</button>{profileOpen && <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 border border-[#c9a34e]/60 bg-[#f7f3e8] p-2 text-[#16243d] shadow-xl"><p className="border-b border-[#16243d]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">{user?.name || "Your profile"}</p><Link href="/dashboard" onClick={closeMenus} className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]">Saved progress <ChevronRight size={13} className="ml-auto" /></Link><Link href="/dashboard?tab=certificates" onClick={() => { window.localStorage.removeItem("piq-new-certificate-available"); setCertificateAvailable(false); closeMenus(); }} className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]">Certificates {certificateAvailable && <span className="ml-auto rounded-full bg-[#c9a34e] px-1.5 py-0.5 text-[9px] font-black">NEW</span>} {!certificateAvailable && <ChevronRight size={13} className="ml-auto" />}</Link><Link href="/settings" onClick={closeMenus} className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"><Settings2 size={14} /> Settings <ChevronRight size={13} className="ml-auto" /></Link>{switchable && <button type="button" onClick={toggleTheme} className="flex w-full items-center gap-2 px-3 py-3 text-left text-xs hover:bg-[#ead9ae]">{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} Use {theme === "dark" ? "light" : "dark"} theme <span className="ml-auto text-[10px] text-[#7d5e1e]">{theme === "dark" ? "Dark" : "Light"}</span></button>}</div>}</div> : <button type="button" onClick={() => startLogin()} className="border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]">Sign in</button>}</div>
      <button type="button" className="md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    <div className="border-t border-white/10 bg-[#0d1a2f] px-5 py-2 sm:px-6"><div className="container flex items-center gap-2 text-[9px] font-black uppercase tracking-[.14em] text-[#8f9db3]" aria-label="Breadcrumb"><Link href="/" className="hover:text-[#c9a34e]">Transformation Services</Link><ChevronRight size={12} className="text-[#c9a34e]" /><span className="text-[#f7f3e8]">{activeLabel}</span></div></div>
    {menuOpen && <nav className="border-t border-white/10 bg-[#101d35] px-5 py-5 md:hidden" aria-label="Mobile transformation services navigation"><div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[.14em]"><Link href="/" onClick={closeMenus} className="text-[#c1cad7]">Home</Link><a href="/assessment" onClick={(event) => switchService(event, "/assessment")} className={active === "assessment" ? "text-[#c9a34e]" : "text-[#c1cad7]"}>Self Assessment</a><a href="/careerpath" onClick={(event) => switchService(event, "/careerpath")} className={active === "careerpath" ? "text-[#c9a34e]" : "text-[#c1cad7]"}>CareerPath</a><a href="/#contact" onClick={closeMenus} className="text-[#c1cad7]">Contact</a>{isAuthenticated ? <><Link href="/dashboard" onClick={closeMenus} className="text-[#c9a34e]">Saved progress</Link><Link href="/dashboard?tab=certificates" onClick={closeMenus} className="text-[#c9a34e]">Certificates</Link><Link href="/settings" onClick={closeMenus} className="text-[#c9a34e]">Settings</Link>{switchable && <button type="button" onClick={toggleTheme} className="flex items-center gap-2 text-left text-[#c9a34e]">{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} Use {theme === "dark" ? "light" : "dark"} theme</button>}</> : <button type="button" className="text-left text-[#c9a34e]" onClick={() => { closeMenus(); startLogin(); }}>Sign in</button>}</div></nav>}
  </header>;
}
