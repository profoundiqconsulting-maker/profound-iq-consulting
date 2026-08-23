import { ChevronDown, ChevronRight, Menu, Settings2, UserCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";

const serviceLabels = { assessment: "Self Assessment", careerpath: "CareerPath" } as const;

export function TransformationNav({ active }: { active: "assessment" | "careerpath" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const activeLabel = serviceLabels[active];
  const closeMenus = () => { setMenuOpen(false); setProfileOpen(false); };

  useEffect(() => {
    if (!profileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setProfileOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [profileOpen]);

  const switchService = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    closeMenus();
    const navigate = () => { window.location.href = href; };
    if ("startViewTransition" in document) (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(navigate);
    else navigate();
  };

  return <header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8]">
    <div className="container flex items-center justify-between gap-5 py-4 sm:py-5">
      <Link href="/" className="shrink-0" aria-label="Profound IQ Consulting home"><BrandLogo context="assessment" compactOnMobile /></Link>
      <nav className="hidden items-center gap-5 text-[10px] font-black uppercase tracking-[.14em] md:flex" aria-label="Transformation services navigation">
        <Link href="/" className="text-[#c1cad7] transition-colors hover:text-[#c9a34e]">Home</Link>
        <a href="/assessment" onClick={(event) => switchService(event, "/assessment")} className={active === "assessment" ? "text-[#c9a34e]" : "text-[#c1cad7] hover:text-[#c9a34e]"}>Self Assessment</a>
        <a href="/careerpath" onClick={(event) => switchService(event, "/careerpath")} className={active === "careerpath" ? "text-[#c9a34e]" : "text-[#c1cad7] hover:text-[#c9a34e]"}>CareerPath</a>
        <a href="/#contact" className="text-[#c1cad7] transition-colors hover:text-[#c9a34e]">Contact</a>
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        {isAuthenticated ? <div className="relative"><button type="button" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen} aria-haspopup="menu" className="inline-flex items-center gap-2 border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]"><UserCircle2 size={15} /> {user?.name || "Profile"}<ChevronDown size={13} /></button>{profileOpen && <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 border border-[#c9a34e]/60 bg-[#f7f3e8] p-2 text-[#16243d] shadow-xl"><p className="border-b border-[#16243d]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">{user?.name || "Your workspace"}</p><Link href="/dashboard" onClick={closeMenus} className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]">Saved progress <ChevronRight size={13} className="ml-auto" /></Link><Link href="/dashboard?tab=certificates" onClick={closeMenus} className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]">Certificates <ChevronRight size={13} className="ml-auto" /></Link><Link href="/settings" onClick={closeMenus} className="flex items-center gap-2 px-3 py-3 text-xs hover:bg-[#ead9ae]"><Settings2 size={14} /> Settings <ChevronRight size={13} className="ml-auto" /></Link></div>}</div> : <button type="button" onClick={() => startLogin()} className="border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]">Sign in</button>}
      </div>
      <button type="button" className="md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    <div className="border-t border-white/10 bg-[#0d1a2f] px-5 py-2 sm:px-6"><div className="container flex items-center gap-2 text-[9px] font-black uppercase tracking-[.14em] text-[#8f9db3]" aria-label="Breadcrumb"><Link href="/" className="hover:text-[#c9a34e]">Transformation Services</Link><ChevronRight size={12} className="text-[#c9a34e]" /><span className="text-[#f7f3e8]">{activeLabel}</span></div></div>
    {menuOpen && <nav className="border-t border-white/10 bg-[#101d35] px-5 py-5 md:hidden" aria-label="Mobile transformation services navigation"><div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[.14em]"><Link href="/" onClick={closeMenus} className="text-[#c1cad7]">Home</Link><a href="/assessment" onClick={(event) => switchService(event, "/assessment")} className={active === "assessment" ? "text-[#c9a34e]" : "text-[#c1cad7]"}>Self Assessment</a><a href="/careerpath" onClick={(event) => switchService(event, "/careerpath")} className={active === "careerpath" ? "text-[#c9a34e]" : "text-[#c1cad7]"}>CareerPath</a><a href="/#contact" onClick={closeMenus} className="text-[#c1cad7]">Contact</a>{isAuthenticated ? <><Link href="/dashboard" onClick={closeMenus} className="text-[#c9a34e]">Saved progress</Link><Link href="/dashboard?tab=certificates" onClick={closeMenus} className="text-[#c9a34e]">Certificates</Link><Link href="/settings" onClick={closeMenus} className="text-[#c9a34e]">Settings</Link></> : <button type="button" className="text-left text-[#c9a34e]" onClick={() => { closeMenus(); startLogin(); }}>Sign in</button>}</div></nav>}
  </header>;
}
