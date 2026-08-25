import { MessageCircle } from "lucide-react";

const whatsappUrl = "https://wa.me/254727374055?text=Hello%20Profound%20IQ%20Consulting%2C%20I%20need%20quick%20support.";

export function WhatsAppSupportWidget() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Profound IQ Consulting on WhatsApp"
      title="WhatsApp quick support · Monday to Saturday, office hours"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#062411] shadow-[0_12px_28px_rgba(0,0,0,.28)] transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f3e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] active:scale-95"
    >
      <MessageCircle size={25} strokeWidth={2.25} />
      <span className="sr-only">WhatsApp quick support, Monday to Saturday during office hours</span>
    </a>
  );
}
