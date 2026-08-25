import { useEffect, useState } from "react";
import { MessageCircle, Minus, Plus } from "lucide-react";

const whatsappUrl = "https://wa.me/254727374055?text=Hello%20Profound%20IQ%20Consulting%2C%20I%20need%20quick%20support.";

function isOfficeOpen(date: Date) {
  const day = date.getDay();
  const hour = date.getHours();
  return day >= 1 && day <= 6 && hour >= 9 && hour < 17;
}

export function WhatsAppSupportWidget() {
  const [minimized, setMinimized] = useState(() => {
    try { return window.localStorage.getItem("profound-whatsapp-minimized") === "true"; } catch { return false; }
  });
  const [online, setOnline] = useState(() => isOfficeOpen(new Date()));

  useEffect(() => {
    const updateStatus = () => setOnline(isOfficeOpen(new Date()));
    updateStatus();
    const timer = window.setInterval(updateStatus, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const setMinimizedState = (value: boolean) => {
    setMinimized(value);
    try { window.localStorage.setItem("profound-whatsapp-minimized", String(value)); } catch { /* Private browsing may block storage. */ }
  };

  if (minimized) {
    return <button type="button" onClick={() => setMinimizedState(false)} aria-label="Show WhatsApp support" title="Show WhatsApp support" className="fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f7f3e8] bg-[#25D366] text-[#062411] shadow-[0_10px_24px_rgba(0,0,0,.25)] transition-all duration-200 hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] active:scale-95"><MessageCircle size={20} /><span className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#f7f3e8] ${online ? "bg-[#0b8f43]" : "bg-[#697386]"}`} /><Plus className="absolute -bottom-1 -right-1 rounded-full bg-[#101d35] p-0.5 text-[#f7f3e8]" size={15} /></button>;
  }

  return <div className="fixed bottom-5 right-5 z-40"><div className="relative"><a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label={`Chat with Profound IQ Consulting on WhatsApp. ${online ? "Online now" : "Offline outside office hours"}.`} title={online ? "WhatsApp support · Online now" : "WhatsApp support · Offline outside office hours"} className="motion-safe:animate-pulse inline-flex min-h-14 items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-[#062411] shadow-[0_12px_28px_rgba(0,0,0,.28)] transition-all duration-200 hover:animate-none hover:-translate-y-1 hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f3e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] active:scale-95"><MessageCircle size={25} strokeWidth={2.25} /><span className="hidden pr-1 text-left sm:block"><strong className="block text-[11px] font-black uppercase tracking-[.12em]">Quick support</strong><span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold"><span className={`h-2 w-2 rounded-full ${online ? "bg-[#0b8f43]" : "bg-[#697386]"}`} />{online ? "Online now" : "Offline · office closed"}</span></span><span className="sr-only">WhatsApp quick support, Monday to Saturday, 9 AM to 5 PM local time</span></a><button type="button" onClick={() => setMinimizedState(true)} aria-label="Minimize WhatsApp support" title="Minimize WhatsApp support" className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#f7f3e8] bg-[#101d35] text-[#f7f3e8] shadow-sm transition-colors hover:bg-[#243653] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"><Minus size={13} /></button></div></div>;
}
