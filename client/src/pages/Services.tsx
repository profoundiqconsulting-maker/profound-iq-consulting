/* Profound IQ Consulting — Executive Observatory Services page: service clarity, audience fit, and implementation-led conversion. */
import {
  ArrowUpRight,
  BrainCircuit,
  GraduationCap,
  Laptop,
  Search,
  School,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { PublicPageShell } from "@/components/PublicPageShell";
import { ScrollReveal } from "@/components/ScrollReveal";

type Service = {
  title: string;
  tag: string;
  body: string;
  icon: LucideIcon;
  audience: string;
  href: string;
};

const services: Service[] = [
  {
    title: "School Excellence & Improvement Programme",
    tag: "Institutional performance",
    body: "Help schools strengthen teaching, leadership, learner experience, and the systems that make improvement sustainable.",
    icon: School,
    audience: "School owners, directors, and principals",
    href: "/school-solutions",
  },
  {
    title: "International Curriculum Consulting",
    tag: "Curriculum and pedagogy",
    body: "Connect curriculum intent to classroom practice through thoughtful planning, alignment, review, and professional support.",
    icon: GraduationCap,
    audience: "International schools and education institutions",
    href: "/contact",
  },
  {
    title: "Teacher Professional Development",
    tag: "Capability building",
    body: "Equip educators with practical approaches, reflective tools, and modern learning experiences that translate into daily practice.",
    icon: UsersRound,
    audience: "Teachers, academic teams, and school leaders",
    href: "/courses",
  },
  {
    title: "Career Guidance & Psychometric Assessment",
    tag: "Personal direction",
    body: "Use structured self-knowledge, career interests, and fit insights to support clearer decisions for learners and professionals.",
    icon: BrainCircuit,
    audience: "Students, professionals, and career practitioners",
    href: "/psychometrics",
  },
  {
    title: "School Leadership Development",
    tag: "Leadership in practice",
    body: "Build the strategic, relational, and decision-making capabilities leaders need to move people and institutions forward.",
    icon: UsersRound,
    audience: "Current and emerging education leaders",
    href: "/courses",
  },
  {
    title: "Digital & AI Education Solutions",
    tag: "Future-ready learning",
    body: "Explore responsible digital learning and AI-enabled approaches that improve access, efficiency, and the learner experience.",
    icon: Laptop,
    audience: "Organizations planning modern learning systems",
    href: "/contact",
  },
];

const process = [
  [
    "01",
    "Listen",
    "We understand the context, the people involved, the friction points, and the outcome that matters.",
  ],
  [
    "02",
    "Frame",
    "We turn the brief into a clear pathway with practical priorities, relevant evidence, and an achievable sequence.",
  ],
  [
    "03",
    "Build",
    "We deliver consulting, learning, assessment, or research experiences designed for real-world adoption.",
  ],
  [
    "04",
    "Sustain",
    "We leave teams with clearer practice, reusable tools, and a stronger basis for their next decision.",
  ],
] as const;

const faqs = [
  [
    "Can a school engage Profound IQ for a focused challenge?",
    "Yes. The engagement can begin with a defined need such as curriculum alignment, teacher development, leadership support, or a broader school-improvement programme.",
  ],
  [
    "Do you work with organizations outside Kenya?",
    "The platform and consulting model are designed for online delivery and international education contexts. Contact the team to discuss your location and requirements.",
  ],
  [
    "Can an organization request a tailored professional learning experience?",
    "Yes. Share your audience, desired outcome, timeframe, and current context through the inquiry form so the team can recommend an appropriate pathway.",
  ],
];

export default function Services() {
  return (
    <PublicPageShell
      eyebrow="02 / Consulting services"
      title={
        <>
          Practical solutions for{" "}
          <em className="font-normal text-[#c9a34e]">meaningful progress.</em>
        </>
      }
      intro="From school improvement and curriculum consulting to leadership development, assessment, and digital learning, Profound IQ helps people and institutions turn insight into action."
      breadcrumbs={[{ label: "Services" }]}
      cta={{ label: "Discuss your context", href: "/contact" }}
    >
      <section className="bg-[#f7f3e8] py-24 lg:py-32">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow text-[#7d5e1e]">The portfolio</p>
            <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
              Choose the work that moves your question forward.
            </h2>
            <p className="mt-7 text-lg leading-8 text-[#4a566a]">
              Every service is shaped around a real audience, a defined context,
              and a practical change to be made.
            </p>
          </div>
          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            {services.map(
              ({ title, tag, body, icon: Icon, audience, href }, index) => (
                <ScrollReveal key={title} delay={index * 70}>
                  <article className="public-card-link group border border-[#16243d]/10 bg-white/60 p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#c9a34e] hover:bg-white hover:shadow-lg sm:p-9">
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-sm bg-[#16243d] text-[#c9a34e]">
                        <Icon size={24} />
                      </div>
                      <span className="text-[10px] font-black tracking-[.16em] text-[#7d5e1e]">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-8 text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                      {tag}
                    </p>
                    <h3 className="mt-4 max-w-lg text-2xl font-semibold leading-tight">
                      {title}
                    </h3>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-[#657084]">
                      {body}
                    </p>
                    <div className="mt-8 flex flex-col gap-5 border-t border-[#16243d]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-[#657084]">
                        For {audience}
                      </span>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-colors group-hover:text-[#7d5e1e]"
                      >
                        Learn more <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </article>
                </ScrollReveal>
              )
            )}
          </div>
        </div>
      </section>
      <section className="bg-[#172844] py-24 text-[#f7f3e8] lg:py-32">
        <div className="container grid gap-16 lg:grid-cols-[.6fr_1.4fr] lg:gap-20 lg:items-start">
          <div>
            <p className="eyebrow text-[#c9a34e]">How we work</p>
            <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
              A clear process, not a black box.
            </h2>
            <p className="mt-7 text-base leading-8 text-[#c1cad7]">
              The work is collaborative, evidence-informed, and designed to make
              the next decision easier.
            </p>
          </div>
          <div className="space-y-px border-y border-[#c9a34e]/20">
            {process.map(([index, title, body], stepIndex) => (
              <ScrollReveal key={index} delay={stepIndex * 65}>
                <article className="group grid gap-6 border-b border-[#c9a34e]/20 py-9 transition-colors hover:border-[#c9a34e]/60 sm:grid-cols-[60px_1fr] sm:items-start last:border-b-0">
                  <span className="text-xs font-black tracking-[.18em] text-[#c9a34e]">
                    {index}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold leading-tight">
                      {title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-8 text-[#c1cad7]">
                      {body}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#fffaf0] py-24 lg:py-32">
        <div className="container grid gap-16 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
          <div>
            <p className="eyebrow text-[#7d5e1e]">Questions, answered</p>
            <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
              Start with the context you have.
            </h2>
          </div>
          <div className="divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group cursor-pointer py-6">
                <summary className="flex list-none items-start justify-between gap-5 text-base font-semibold text-[#16243d] transition-colors hover:text-[#7d5e1e]">
                  {question}
                  <span className="mt-0.5 shrink-0 text-2xl font-normal text-[#7d5e1e] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pt-5 text-sm leading-8 text-[#657084]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#f7f3e8] py-20">
        <div className="container flex flex-col items-start justify-between gap-8 border-t border-[#16243d]/10 pt-12 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-[#7d5e1e]">Next step</p>
            <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">
              Tell us what needs to change.
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center gap-3 bg-[#c9a34e] px-6 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#101d35] transition-all hover:-translate-y-1 hover:shadow-lg hover:bg-[#d4b563]"
          >
            Book a conversation <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
