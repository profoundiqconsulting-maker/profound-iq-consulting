/* Profound IQ Consulting — Executive Observatory School Solutions page: institution-first pathways with restrained accessible motion. */
import {
  ArrowUpRight,
  BookOpenCheck,
  Building2,
  Check,
  LineChart,
  UsersRound,
} from "lucide-react";
import { Link } from "wouter";
import { PublicPageShell } from "@/components/PublicPageShell";
import { ScrollReveal } from "@/components/ScrollReveal";

const solutionAreas = [
  {
    title: "School improvement",
    body: "Create a practical improvement pathway that connects priorities, people, evidence, and action.",
    icon: LineChart,
  },
  {
    title: "Curriculum and pedagogy",
    body: "Strengthen the relationship between curriculum intent, teacher practice, and the learner experience.",
    icon: BookOpenCheck,
  },
  {
    title: "Leadership development",
    body: "Support school leaders with the strategic, relational, and decision-making capabilities required to lead change.",
    icon: Building2,
  },
  {
    title: "Teacher professional learning",
    body: "Equip educators with applied development experiences that are relevant to the classroom and sustainable over time.",
    icon: UsersRound,
  },
];

const included = [
  "Context and needs discovery",
  "A sequenced improvement or learning pathway",
  "Practical tools for leaders and educators",
  "Clear progress conversations and review points",
  "A handover that supports continued application",
];

export default function SchoolSolutions() {
  return (
    <PublicPageShell
      eyebrow="03 / School solutions"
      title={
        <>
          Helping schools strengthen{" "}
          <em className="font-normal text-[#c9a34e]">
            teaching, leadership, and learner outcomes.
          </em>
        </>
      }
      intro="Profound IQ works with schools and education institutions to make improvement more coherent, professional learning more useful, and leadership more ready for change."
      breadcrumbs={[
        { label: "Services", href: "/services" },
        { label: "School solutions" },
      ]}
      cta={{ label: "Request a school conversation", href: "/contact" }}
    >
      <section className="bg-[#f7f3e8] py-24 lg:py-32">
        <ScrollReveal>
          <div className="container grid gap-16 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
            <div>
              <p className="eyebrow text-[#7d5e1e]">The school context</p>
              <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                Improvement is a connected system.
              </h2>
            </div>
            <div className="space-y-7 text-base leading-8 text-[#4a566a]">
              <p>
                Schools rarely need isolated advice. They need a clearer
                connection between what they want learners to experience, how
                teachers are supported, how leaders make decisions, and how
                progress is understood.
              </p>
              <p>
                Our school-focused work is designed to reduce that distance. We
                help teams name the priority, sequence the work, and build the
                confidence to apply it in the daily life of the institution.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
      <section className="bg-[#fffaf0] py-24 lg:py-32">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-3xl">
              <p className="eyebrow text-[#7d5e1e]">Where we can help</p>
              <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                A practical route from challenge to capability.
              </h2>
            </div>
          </ScrollReveal>
          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {solutionAreas.map(({ title, body, icon: Icon }, index) => (
              <ScrollReveal key={title} delay={index * 70}>
                <article className="public-card-link group border-t-4 border-[#c9a34e] bg-white/70 p-8 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg sm:p-9">
                  <div className="flex items-start justify-between gap-5">
                    <Icon size={26} className="text-[#7d5e1e]" />
                    <span className="text-[10px] font-black tracking-[.16em] text-[#657084]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-9 text-xl font-semibold leading-tight">
                    {title}
                  </h3>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-[#657084]">
                    {body}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#172844] py-24 text-[#f7f3e8] lg:py-32">
        <ScrollReveal>
          <div className="container grid gap-16 lg:grid-cols-[.6fr_1.4fr] lg:gap-20">
            <div>
              <p className="eyebrow text-[#c9a34e]">
                What an engagement can include
              </p>
              <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                Designed around your reality.
              </h2>
              <p className="mt-7 text-base leading-8 text-[#c1cad7]">
                The starting point is a conversation, not a catalogue. The exact
                shape of the work should reflect your people, context,
                timeframe, and desired outcome.
              </p>
            </div>
            <ul className="space-y-px border-y border-[#c9a34e]/20">
              {included.map(item => (
                <li
                  key={item}
                  className="flex gap-5 border-b border-[#c9a34e]/20 py-6 text-sm leading-7 text-[#d6dce6] transition-colors hover:bg-[#1b3152]/50 hover:pl-2 last:border-b-0"
                >
                  <Check size={20} className="mt-0.5 shrink-0 text-[#c9a34e]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </section>
      <section className="bg-[#f7f3e8] py-20">
        <ScrollReveal>
          <div className="container flex flex-col items-start justify-between gap-8 border-t border-[#16243d]/10 pt-12 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow text-[#7d5e1e]">
                For schools ready to move
              </p>
              <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">
                Bring us the question behind the question.
              </h2>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-3 bg-[#16243d] px-6 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              Request a consultation <ArrowUpRight size={15} />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </PublicPageShell>
  );
}
