/* Profound IQ Consulting — Executive Observatory Resources page: editorial discovery without fabricated publications, authors, or performance claims. */
import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  FileSearch,
  Mic2,
  ScrollText,
} from "lucide-react";
import { Link } from "wouter";
import { PublicPageShell } from "@/components/PublicPageShell";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SocialSharing } from "@/components/SocialSharing";
import PaystackInlineModal from "@/components/PaystackInlineModal";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const resourceTypes = [
  {
    title: "Guides",
    body: "Practical frameworks for thinking through learning, leadership, school improvement, and professional growth.",
    icon: BookOpen,
    href: "/courses",
  },
  {
    title: "Research and surveys",
    body: "Structured ways to listen, gather evidence, and turn important questions into informed decisions.",
    icon: FileSearch,
    href: "/services",
  },
  {
    title: "Webinars and conversations",
    body: "A future home for focused conversations about education, leadership, curriculum, and the changing world of work.",
    icon: Mic2,
    href: "/contact",
  },
  {
    title: "Educational insights",
    body: "Short, useful observations that connect evidence and practice without adding unnecessary jargon.",
    icon: ScrollText,
    href: "/blog",
  },
];

export default function Resources() {
  const { user, isAuthenticated } = useAuth();
  const resources = trpc.resources.listPublished.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const [paymentResource, setPaymentResource] = useState<{ id: number; title: string; price: number; currency: string; reference?: string; accessCode?: string } | null>(null);
  const initializePayment = trpc.resources.initializePayment.useMutation({
    onSuccess: data => {
      setPaymentResource(prev => prev ? { ...prev, reference: data.reference, accessCode: data.accessCode } : prev);
    },
    onError: error => toast.error(error.message),
  });
  const verifyPayment = trpc.resources.verifyPayment.useMutation({
    onSuccess: data => {
      if (data.paid && data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
        toast.success("Payment verified. Download started.");
      }
      setPaymentResource(null);
    },
    onError: error => toast.error(error.message),
  });
  const [purchasedIds, setPurchasedIds] = useState<number[]>([]);

  const handlePurchase = async (resource: { id: number; title: string; price: number; currency: string }) => {
    if (!isAuthenticated) {
      window.location.href = "/auth?mode=login";
      return;
    }
    setPaymentResource(resource);
    initializePayment.mutate({ resourceId: resource.id });
  };

  const handlePaymentSuccess = (reference: string) => {
    if (!paymentResource) return;
    verifyPayment.mutate({ reference });
  };

  return (
    <PublicPageShell
      eyebrow="04 / Resources"
      title={
        <>
          Useful thinking for the{" "}
          <em className="font-normal text-[#8b6914]">next decision.</em>
        </>
      }
      intro="Explore the ideas, learning pathways, and practical tools that help people and institutions move from reflection to purposeful action."
      breadcrumbs={[{ label: "Resources" }]}
      cta={{ label: "Explore professional courses", href: "/courses" }}
    >
      <section className="bg-[#f7f3e8] py-24 lg:py-32">
        <ScrollReveal>
          <div className="container grid gap-16 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
            <div>
              <p className="eyebrow text-[#7d5e1e]">A growing library</p>
              <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                Make room for better questions.
              </h2>
            </div>
            <div className="space-y-7 text-base leading-8 text-[#4a566a]">
              <p>
                Resources are most useful when they help someone do something:
                frame a challenge, understand a learner, guide a conversation,
                or choose a next step.
              </p>
              <p>
                This library is being developed around the same principles as
                our consulting and courses: clear language, applied insight, and
                a respect for the complexity of real contexts.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {resources.isLoading ? (
        <section className="bg-white py-24 lg:py-32">
          <div className="container">
            <div className="mb-12">
              <p className="eyebrow text-[#7d5e1e]">Resource library</p>
              <h2 className="display mt-5 text-4xl leading-[.98] tracking-[-.045em] sm:text-5xl">
                Curated materials
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-48 animate-pulse rounded-xl border border-[#16243d]/10 bg-[#f7f3e8]" />
              ))}
            </div>
          </div>
        </section>
      ) : (resources.data ?? []).length > 0 ? (
        <section className="bg-white py-24 lg:py-32">
          <div className="container">
            <div className="mb-12">
              <p className="eyebrow text-[#7d5e1e]">Resource library</p>
              <h2 className="display mt-5 text-4xl leading-[.98] tracking-[-.045em] sm:text-5xl">
                Curated materials
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(resources.data ?? [])
                .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder)
                .map((resource: { id: number; title: string; description: string; category: string; price: number; currency: string; fileUrl?: string | null }, index: number) => (
                  <ScrollReveal key={resource.id} delay={index * 70}>
                    <article className="group border border-[#16243d]/10 bg-[#f7f3e8] p-8 transition-all duration-200 hover:border-[#c9a34e] hover:bg-white hover:shadow-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#16243d] text-[#c9a34e]">
                          <BookOpen size={22} />
                        </div>
                        <span className="text-[10px] font-black tracking-[.16em] text-[#7d5e1e]">
                          {resource.category}
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-semibold leading-tight">
                        {resource.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#657084]">
                        {resource.description}
                      </p>
                      {resource.fileUrl && (
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          {(resource.price ?? 0) > 0 ? (
                            <>
                              <span className="text-sm font-semibold text-[#16243d]">
                                {resource.currency} {resource.price?.toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePurchase({ id: resource.id, title: resource.title, price: resource.price ?? 0, currency: resource.currency ?? "KES" })}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white transition-all hover:bg-[#0f172a]"
                              >
                                Purchase
                              </button>
                            </>
                          ) : (
                            <a
                              href={resource.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white transition-all hover:bg-[#0f172a]"
                            >
                              Download <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      )}
                      <SocialSharing
                        url={resource.fileUrl || `${window.location.origin}/resources`}
                        title={resource.title}
                        text={resource.description}
                        platforms={["linkedin", "x", "facebook", "whatsapp", "copy"]}
                        className="mt-4"
                      />
                    </article>
                  </ScrollReveal>
                ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white py-24 lg:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-[#7d5e1e]">Resource library</p>
              <h2 className="display mt-5 text-4xl leading-[.98] tracking-[-.045em] sm:text-5xl">
                Curated materials
              </h2>
              <p className="mt-6 text-base leading-7 text-[#657084]">
                The resource library is being developed. In the meantime, explore our professional courses or suggest a topic for the team.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-6 py-3 text-[10px] font-black uppercase tracking-[.12em] text-white transition-all hover:bg-[#0f172a]"
                >
                  Explore courses <ArrowUpRight size={14} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#16243d]/25 px-6 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition-all hover:border-[#c9a34e] hover:text-[#7d5e1e]"
                >
                  Suggest a topic <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#fffaf0] py-24 lg:py-32">
        <div className="container">
          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {resourceTypes.map(({ title, body, icon: Icon, href }, index) => (
              <ScrollReveal key={title} delay={index * 70}>
                <article className="public-card-link group border border-[#16243d]/10 bg-white/60 p-8 transition-all duration-200 hover:border-[#c9a34e] hover:bg-white hover:shadow-lg sm:p-9">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-sm bg-[#16243d] text-[#c9a34e]">
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-black tracking-[.16em] text-[#7d5e1e]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-9 text-xl font-semibold leading-tight">
                    {title}
                  </h3>
                  <p className="mt-5 max-w-lg text-sm leading-7 text-[#657084]">
                    {body}
                  </p>
                  <Link
                    href={title === "Educational insights" ? "/blog" : href}
                    className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-colors group-hover:text-[#7d5e1e]"
                  >
                    Explore this pathway <ArrowUpRight size={14} />
                  </Link>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#172844] py-24 text-[#f7f3e8] lg:py-32">
        <ScrollReveal>
          <div className="container grid gap-16 lg:grid-cols-[.6fr_1.4fr] lg:gap-20 lg:items-start">
            <div>
              <p className="eyebrow text-[#8b6914]">For now</p>
              <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                Start with a guided experience.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Link
                href="/assessment"
                className="group border border-[#c9a34e]/40 bg-[#1b3152]/60 p-8 transition-all hover:border-[#c9a34e] hover:bg-[#254263] backdrop-blur-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#8b6914]">
                  Personal insight
                </p>
                <h3 className="mt-6 text-lg font-semibold leading-tight">
                  Take the Self Assessment
                </h3>
                <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#8b6914] group-hover:text-[#f7f3e8]">
                  Begin <ArrowUpRight size={14} />
                </span>
              </Link>
              <Link
                href="/contact"
                className="group border border-white/20 bg-[#1b3152]/40 p-8 transition-all hover:border-[#c9a34e] hover:bg-[#254263] backdrop-blur-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#8b6914]">
                  Organizational insight
                </p>
                <h3 className="mt-6 text-lg font-semibold leading-tight">
                  Talk to a consultant
                </h3>
                <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#8b6914] group-hover:text-[#f7f3e8]">
                  Start a conversation <ArrowUpRight size={14} />
                </span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
      {paymentResource && (
        <PaystackInlineModal
          open={!!paymentResource.reference}
          product={{
            accessCode: paymentResource.accessCode ?? "",
            reference: paymentResource.reference || "",
            amountKes: paymentResource.price,
            productName: paymentResource.title,
            productType: "resource",
            resourceId: paymentResource.id,
          }}
          customerEmail={user?.email || ""}
          onClose={() => setPaymentResource(null)}
          onSuccess={handlePaymentSuccess}
          onError={(message: string) => {
            toast.error(message);
            setPaymentResource(null);
          }}
        />
      )}
    </PublicPageShell>
  );
}
