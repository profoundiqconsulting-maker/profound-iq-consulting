/* Profound IQ Consulting — Executive Observatory Resources page: editorial discovery without fabricated publications, authors, or performance claims. */
import {
  ArrowUpRight,
  BookOpen,
  FileSearch,
  Mic2,
  ScrollText,
} from "lucide-react";
import { Link } from "wouter";
import { PublicPageShell } from "@/components/PublicPageShell";
import { ScrollReveal } from "@/components/ScrollReveal";

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
  return (
    <PublicPageShell
      eyebrow="04 / Resources"
      title={
        <>
          Useful thinking for the{" "}
          <em className="font-normal text-[#c9a34e]">next decision.</em>
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
              <p className="eyebrow text-[#a27e2e]">A growing library</p>
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
      <section className="bg-[#fffaf0] py-24 lg:py-32">
        <div className="container">
          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {resourceTypes.map(({ title, body, icon: Icon, href }, index) => (
              <ScrollReveal key={title} delay={index * 70}>
                <article className="public-card-link group border border-[#16243d]/10 bg-white/60 p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#c9a34e] hover:bg-white hover:shadow-lg sm:p-9">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-sm bg-[#16243d] text-[#c9a34e]">
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-black tracking-[.16em] text-[#a27e2e]">
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
                    className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-colors group-hover:text-[#a27e2e]"
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
              <p className="eyebrow text-[#c9a34e]">For now</p>
              <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                Start with a guided experience.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Link
                href="/assessment"
                className="group border border-[#c9a34e]/40 bg-[#1b3152]/60 p-8 transition-all hover:border-[#c9a34e] hover:bg-[#254263] backdrop-blur-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e]">
                  Personal insight
                </p>
                <h3 className="mt-6 text-lg font-semibold leading-tight">
                  Take the Self Assessment
                </h3>
                <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e] group-hover:text-[#f7f3e8]">
                  Begin <ArrowUpRight size={14} />
                </span>
              </Link>
              <Link
                href="/contact"
                className="group border border-white/20 bg-[#1b3152]/40 p-8 transition-all hover:border-[#c9a34e] hover:bg-[#254263] backdrop-blur-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e]">
                  Organizational insight
                </p>
                <h3 className="mt-6 text-lg font-semibold leading-tight">
                  Talk to a consultant
                </h3>
                <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e] group-hover:text-[#f7f3e8]">
                  Start a conversation <ArrowUpRight size={14} />
                </span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </PublicPageShell>
  );
}
