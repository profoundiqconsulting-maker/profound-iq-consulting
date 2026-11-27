"use client";

/* Profound IQ Consulting — Executive footer.
 * Clean typography, generous whitespace, restrained palette,
 * semantic HTML, accessible navigation.
 */
import { useEffect, useState } from "react";
import { ArrowRight, Mail, Phone, MapPin, Clock, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Platform",
    items: [
      { label: "Home", href: "/" },
      { label: "Courses", href: "/courses" },
      { label: "Self Assessment", href: "/assessment" },
      { label: "Psychometrics", href: "/psychometrics" },
      { label: "CareerPath", href: "/careerpath" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About", href: "/#about" },
      { label: "Our Approach", href: "/#approach" },
      { label: "Case Studies", href: "/#case-studies" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    label: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Nairobi, Kenya",
    body: "Westlands Office Park, 4th Floor",
  },
  {
    icon: Phone,
    label: "+254 700 000 000",
    body: "Mon–Fri, 8:30am–5:30pm EAT",
  },
  {
    icon: Mail,
    label: "hello@profoundiq.com",
    body: "Typically responds within 24 hours",
  },
];

const SOCIALS = [
  { label: "LinkedIn", href: "https://linkedin.com/company/profound-iq" },
  { label: "Twitter", href: "https://twitter.com/profoundiq" },
  { label: "Instagram", href: "https://instagram.com/profoundiq" },
];

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  const [newsletter, setNewsletter] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (event: React.FormEvent) => {
    event.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer
      className="border-t border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--fg)]"
      role="contentinfo"
    >
      <div className="container py-12 sm:py-16 lg:py-20">
        <div className="grid gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
          {/* Brand + mission */}
          <div className="lg:col-span-2">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10">
              <div className="flex-shrink-0">
                <Link href="/" aria-label="Profound IQ Consulting home">
                  <BrandLogo compact className="h-12 w-16 sm:h-16 sm:w-20" />
                </Link>
              </div>
              <p className="max-w-[32rem] text-[var(--fg-muted)] leading-relaxed">
                Helping organisations and individuals unlock clarity,
                capability, and career momentum through evidence-based
                assessment and applied learning.
              </p>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-4">
              {SOCIALS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--fg-muted)] transition-all hover:border-[var(--brand)] hover:text-[var(--brand)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30"
                >
                  <ChevronRight size={14} className="shrink-0" />
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation groups */}
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="flex flex-col">
              <h3
                className="mb-4 text-xs font-black uppercase tracking-wider text-[var(--fg-muted)]"
              >
                {group.label}
              </h3>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {group.items.map(item => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--fg)] transition-colors hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/20 rounded px-2 py-1"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact + newsletter */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex flex-col gap-3">
              <h3
                className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--fg-muted)]"
              >
                Get in touch
              </h3>
              {CONTACT_INFO.map(contact => (
                <div
                  key={contact.label}
                  className="flex items-start gap-3"
                >
                  <contact.icon
                    size={16}
                    className="shrink-0 text-[var(--brand)] mt-0.5"
                  />
                  <div className="text-sm leading-relaxed">
                    <div className="text-[var(--fg)] font-medium">
                      {contact.label}
                    </div>
                    <div className="text-[var(--fg-muted)] text-xs mt-0.5">
                      {contact.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-[24rem]">
              <h3
                className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--fg-muted)]"
              >
                Stay informed
              </h3>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-2">
                Subscribe for course updates, assessment insights, and
                career resources.
              </p>
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={newsletter}
                  onChange={e => setNewsletter(e.target.value)}
                  required
                  className="flex-1 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] disabled:opacity-60 disabled:pointer-events-none"
                />
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={subscribed}
                >
                  {subscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </form>
              {subscribed && (
                <p className="text-xs text-[var(--success)]">
                  Thanks — you&rsquo;re on the list.
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-8">
          <p className="text-xs text-[var(--fg-muted)]">
            &copy; {CURRENT_YEAR} Profound IQ Consulting. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[var(--fg-muted)]">
            <Link href="/privacy" className="hover:text-[var(--brand)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--brand)] transition-colors">
              Terms
            </Link>
            <Link href="/accessibility" className="hover:text-[var(--brand)] transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Separator() {
  return (
    <hr
      className="border-none h-[1px] bg-[var(--border-strong)] my-0"
      aria-hidden="true"
    />
  );
}
