import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import { BrandLogo } from "@/components/BrandLogo";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Auth() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen bg-[#101d35] text-[#f7f3e8]">
      <header className="border-b border-white/10">
        <div className="container flex items-center justify-between py-6">
          <Link href="/" aria-label="Profound IQ Consulting home"><BrandLogo context="home" className="border border-[#c9a34e]/70" /></Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-[.16em] text-[#c9d1df] hover:text-[#c9a34e]">Back to site</Link>
        </div>
      </header>
      <section className="container grid min-h-[calc(100vh-90px)] items-center gap-14 py-16 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow text-[#c9a34e]">Private access / your next chapter</p>
          <h1 className="display mt-5 text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl">Enter your <em className="font-normal text-[#c9a34e]">workspace.</em></h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-[#c1cad7]">Sign in to continue your assessment journey, review reports, manage your profile, and keep your development work in one secure place.</p>
        </div>
        <div className="border border-[#c9a34e]/60 bg-[#f7f3e8] p-7 text-[#16243d] shadow-2xl sm:p-10">
          <div className="flex items-center gap-3 border-b border-[#16243d]/15 pb-6"><LockKeyhole className="text-[#a27e2e]" size={20} /><div><p className="eyebrow text-[#a27e2e]">Secure account access</p><h2 className="display mt-2 text-3xl">Choose your entry point.</h2></div></div>
          {loading ? <p className="mt-8 text-sm text-[#657084]">Checking your session…</p> : user ? <div className="mt-8"><p className="text-sm leading-7 text-[#4a566a]">You are signed in as <strong>{user.email ?? user.name}</strong>.</p><Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 bg-[#16243d] px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8]">Open workspace <ArrowRight size={14} /></Link></div> : <div className="mt-8 grid gap-4 sm:grid-cols-2"><button type="button" onClick={() => startLogin()} className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] transition-colors hover:bg-[#243b61]">Sign in <ArrowRight size={14} /></button><button type="button" onClick={() => startLogin()} className="inline-flex items-center justify-center gap-2 border border-[#16243d]/30 px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-colors hover:border-[#c9a34e]">Create account <ArrowRight size={14} /></button></div>}
          <div className="mt-8 border-t border-[#16243d]/15 pt-6 text-xs leading-6 text-[#657084]"><p className="flex items-start gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#a27e2e]" />New accounts are provisioned automatically in the secure database after the first successful sign-in.</p><p className="mt-3">Both actions use the same protected OAuth flow; no password is stored by Profound IQ Consulting.</p></div>
        </div>
      </section>
    </main>
  );
}
