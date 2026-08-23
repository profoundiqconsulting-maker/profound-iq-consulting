import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLogo } from "@/components/BrandLogo";

export function TransformationNav({ active }: { active: "assessment" | "careerpath" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const closeMenu = () => setMenuOpen(false);
  return <header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8]">
    <div className="container flex items-center justify-between gap-5 py-4 sm:py-5">
      <Link href="/" className="shrink-0" aria-label="Profound IQ Consulting home"><BrandLogo context="assessment" compactOnMobile /></Link>
      <nav className="hidden items-center gap-5 text-[10px] font-black uppercase tracking-[.14em] md:flex" aria-label="Transformation services navigation">
        <Link href="/" className="text-[#c1cad7] transition-colors hover:text-[#c9a34e]">Home</Link>
        <Link href="/assessment" className={active === "assessment" ? "text-[#c9a34e]" : "text-[#c1cad7] hover:text-[#c9a34e]"}>Self Assessment</Link>
        <Link href="/careerpath" className={active === "careerpath" ? "text-[#c9a34e]" : "text-[#c1cad7] hover:text-[#c9a34e]"}>CareerPath</Link>
        <a href="/#contact" className="text-[#c1cad7] transition-colors hover:text-[#c9a34e]">Contact</a>
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        {isAuthenticated ? <Link href="/dashboard" className="border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]">{user?.name ? "My workspace" : "Workspace"}</Link> : <button type="button" onClick={() => startLogin()} className="border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] hover:border-[#c9a34e] hover:text-[#c9a34e]">Sign in</button>}
      </div>
      <button type="button" className="md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    {menuOpen && <nav className="border-t border-white/10 bg-[#101d35] px-5 py-5 md:hidden" aria-label="Mobile transformation services navigation"><div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[.14em]"><Link href="/" onClick={closeMenu} className="text-[#c1cad7]">Home</Link><Link href="/assessment" onClick={closeMenu} className={active === "assessment" ? "text-[#c9a34e]" : "text-[#c1cad7]"}>Self Assessment</Link><Link href="/careerpath" onClick={closeMenu} className={active === "careerpath" ? "text-[#c9a34e]" : "text-[#c1cad7]"}>CareerPath</Link><a href="/#contact" onClick={closeMenu} className="text-[#c1cad7]">Contact</a>{isAuthenticated ? <Link href="/dashboard" onClick={closeMenu} className="text-[#c9a34e]">My workspace</Link> : <button type="button" className="text-left text-[#c9a34e]" onClick={() => { closeMenu(); startLogin(); }}>Sign in</button>}</div></nav>}
  </header>;
}
