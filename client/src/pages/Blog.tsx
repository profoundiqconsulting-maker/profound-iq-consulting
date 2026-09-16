/* Profound IQ Consulting — Executive Observatory Insights page: transparent editorial pathways with preview-only content. */
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Lightbulb,
  MessageSquareText,
  Search,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";
import { PublicPageShell } from "@/components/PublicPageShell";
import { ScrollReveal, ScrollRevealGroup } from "@/components/ScrollReveal";
import { trpc } from "@/lib/trpc";
import { insightArticles } from "@shared/insightsArticles";

const themes = [
  {
    label: "Education leadership",
    title: "Leading change without losing the human centre.",
    body: "A future series on the decisions, conversations, and habits that help education leaders move institutions forward.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Learning design",
    title: "From curriculum intent to lived learning.",
    body: "A practical exploration of how pedagogy, professional learning, and learner experience connect in real settings.",
    icon: BookOpen,
  },
  {
    label: "Professional growth",
    title: "Clarity, capability, and the next version of your work.",
    body: "Ideas for learners and professionals building self-awareness, confidence, and purposeful momentum.",
    icon: Lightbulb,
  },
];

export const articlePreviews = insightArticles.map(
  ({ index, category, title, excerpt, readTime, accent }) => ({
    index,
    category,
    title,
    excerpt,
    readTime,
    accent,
  })
);

export function getVisibleInsightsPreviews<T>(items: T[], limit: number) {
  return items.slice(0, Math.max(1, Math.floor(limit)));
}

export function filterInsightsPreviews(
  items: typeof articlePreviews,
  query: string,
  category: string
) {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter(article => {
    const matchesCategory =
      category === "All topics" || article.category === category;
    const searchable =
      `${article.title} ${article.category} ${article.excerpt} ${article.accent}`.toLowerCase();
    return (
      matchesCategory &&
      (!normalizedQuery || searchable.includes(normalizedQuery))
    );
  });
}

export const contributors = [
  {
    initials: "PIQ",
    title: "Editorial contributor",
    role: "Placeholder profile · education and leadership",
    bio: "Reserved for an approved contributor introduction, areas of practice, and links to published work.",
  },
  {
    initials: "PIQ",
    title: "Practice contributor",
    role: "Placeholder profile · learning and professional growth",
    bio: "Reserved for a concise professional profile once the contributor, biography, and editorial permissions are confirmed.",
  },
];

export default function Blog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const [articleLimit, setArticleLimit] = useState(3);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterEmailTouched, setNewsletterEmailTouched] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const newsletter = trpc.newsletter.subscribe.useMutation();
  const categories = useMemo(
    () => [
      "All topics",
      ...Array.from(new Set(articlePreviews.map(article => article.category))),
    ],
    []
  );
  const insightsSearch = trpc.insights.search.useQuery({
    search: query.trim() || undefined,
    category: category === "All topics" ? undefined : category,
    page: 1,
    pageSize: 50,
  });
  const filteredArticles = insightsSearch.data?.rows ?? [];
  const visibleArticles = getVisibleInsightsPreviews(
    filteredArticles,
    articleLimit
  );
  const newsletterEmailIsValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(
    newsletterEmail.trim()
  );

  const submitNewsletter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterEmailTouched(true);
    if (!newsletterEmailIsValid) return;
    setNewsletterError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    newsletter.mutate(
      {
        email: String(form.get("newsletterEmail")),
        consent: true,
        source: "insights",
      },
      {
        onSuccess: () => {
          setNewsletterSubmitted(true);
          formElement.reset();
        },
        onError: error =>
          setNewsletterError(
            error.message ||
              "We could not save your subscription. Please try again."
          ),
      }
    );
  };

  return (
    <PublicPageShell
      eyebrow="05 / Insights"
      title={
        <>
          The thinking behind{" "}
          <em className="font-normal text-[#c9a34e]">the work.</em>
        </>
      }
      intro="A developing editorial space for useful ideas about education, leadership, professional growth, curriculum, and the changing world of work."
      breadcrumbs={[
        { label: "Resources", href: "/resources" },
        { label: "Insights" },
      ]}
      cta={{ label: "Suggest a conversation", href: "/contact" }}
    >
      <section className="bg-[#f7f3e8] py-24 lg:py-32">
        <ScrollReveal>
          <div className="container grid gap-16 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
            <div>
              <p className="eyebrow text-[#7d5e1e]">An honest library</p>
              <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                Good insight should be useful before it is impressive.
              </h2>
            </div>
            <div className="space-y-7 text-base leading-8 text-[#4a566a]">
              <p>
                The Profound IQ editorial space is being developed around the
                questions our learners, clients, and partners are already
                asking. Each piece will aim to clarify a challenge and make the
                next conversation more productive.
              </p>
              <div className="flex items-start gap-5 border-l-2 border-[#c9a34e] bg-white/70 p-6 text-sm leading-7 text-[#16243d] backdrop-blur-sm">
                <MessageSquareText
                  size={20}
                  className="mt-1 shrink-0 text-[#7d5e1e]"
                />
                <span>
                  These are{" "}
                  <strong>layout previews, not published articles</strong>.
                  Explore how the library could work or{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-[#7d5e1e] underline decoration-[#c9a34e] underline-offset-4"
                  >
                    suggest a topic
                  </Link>{" "}
                  for the team.
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="bg-[#fffaf0] py-24 lg:py-32">
        <div className="container">
          <ScrollReveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow text-[#7d5e1e]">
                  Preview the editorial grid
                </p>
                <h2 className="display mt-5 max-w-3xl text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                  Useful ideas, presented with room to think.
                </h2>
              </div>
              <span className="inline-flex shrink-0 border border-[#c9a34e]/60 px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                Preview only
              </span>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="grid gap-2 text-sm font-semibold text-[#16243d]">
              <span className="sr-only">Search Insights previews</span>
              <span className="flex items-center gap-2 border border-[#16243d]/15 bg-white/75 px-4">
                <Search size={17} className="text-[#7d5e1e]" />
                <input
                  value={query}
                  onChange={event => {
                    setQuery(event.target.value);
                    setArticleLimit(3);
                  }}
                  placeholder="Search preview topics"
                  className="min-h-12 w-full bg-transparent text-base font-normal outline-none placeholder:text-[#657084] focus:outline-none"
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#16243d]">
              <span className="sr-only">Filter Insights by category</span>
              <select
                value={category}
                onChange={event => {
                  setCategory(event.target.value);
                  setArticleLimit(3);
                }}
                className="min-h-12 border border-[#16243d]/15 bg-white/75 px-4 text-base font-normal outline-none focus:border-[#c9a34e]"
              >
                {categories.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-[#657084]">
            <span>
              {filteredArticles.length} of {insightsSearch.data?.total ?? 0}{" "}
              preview articles shown
            </span>
            {(query || category !== "All topics") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All topics");
                  setArticleLimit(3);
                }}
                className="font-bold text-[#7d5e1e] underline underline-offset-4"
              >
                Clear filters
              </button>
            )}
          </div>
          {insightsSearch.isLoading ? (
            <div
              className="mt-8 border-l-2 border-[#c9a34e] bg-white/70 p-6 text-[#16243d]"
              role="status"
            >
              <p className="font-semibold">Searching the Insights library…</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div
              className="mt-8 border-l-2 border-[#c9a34e] bg-white/70 p-6 text-[#16243d]"
              role="status"
            >
              <p className="font-semibold">
                No preview articles match those filters.
              </p>
              <p className="mt-2 text-sm leading-6 text-[#657084]">
                Try another keyword or return to all topics.
              </p>
            </div>
          ) : (
            <ScrollRevealGroup className="mt-8 grid gap-4 lg:grid-cols-3">
              {visibleArticles.map(article => (
                <article
                  key={article.slug}
                  className="flex min-h-[360px] flex-col border border-[#16243d]/15 bg-white/70 p-7 sm:p-8"
                >
                  <div className="flex items-start justify-between">
                    <p className="eyebrow text-[#7d5e1e]">{article.category}</p>
                    <span className="text-[10px] font-black tracking-[.16em] text-[#657084]">
                      {article.index}
                    </span>
                  </div>
                  <p className="mt-8 text-xs font-semibold italic text-[#7d5e1e]">
                    {article.accent}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold leading-tight text-[#16243d]">
                    {article.title}
                  </h3>
                  <p className="mt-4 flex-1 text-base leading-7 text-[#657084]">
                    {article.excerpt}
                  </p>
                  <div className="mt-7 flex items-center justify-between border-t border-[#16243d]/10 pt-5 text-[10px] font-black uppercase tracking-[.13em] text-[#657084]">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={14} /> {article.readTime}
                    </span>
                    <span className="text-[#7d5e1e]">Preview only</span>
                  </div>
                </article>
              ))}
            </ScrollRevealGroup>
          )}
          {filteredArticles.length > articleLimit && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setArticleLimit(limit => limit + 3)}
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#16243d]/25 px-5 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-all hover:-translate-y-0.5 hover:border-[#c9a34e] hover:bg-white"
              >
                Load more Insights <ArrowUpRight size={15} />
              </button>
            </div>
            )}
            <div className="mt-8 rounded-xl border border-[#c9a34e]/40 bg-[#c9a34e]/5 p-6 text-center">
              <p className="text-sm font-semibold text-[#16243d]">
                These are preview cards, not published articles.
              </p>
              <p className="mt-2 text-sm text-[#657084]">
                Full articles are being developed.{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-[#7d5e1e] underline decoration-[#c9a34e] underline-offset-4"
                >
                  Suggest a topic
                </Link>{" "}
                or explore our{" "}
                <Link
                  href="/courses"
                  className="font-semibold text-[#7d5e1e] underline decoration-[#c9a34e] underline-offset-4"
                >
                  professional courses
                </Link>{" "}
                in the meantime.
              </p>
            </div>

          <ScrollReveal>
            <div className="mt-20 border-t border-[#16243d]/10 pt-16">
              <div className="grid gap-12 lg:grid-cols-[.6fr_1.4fr] lg:gap-20 lg:items-start">
                <div>
                  <p className="eyebrow text-[#7d5e1e]">
                    Stay close to the work
                  </p>
                  <h3 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                    A considered note when there is something worth sharing.
                  </h3>
                  <p className="mt-7 text-base leading-8 text-[#657084]">
                    Subscribe for future Profound IQ insights on education,
                    leadership, professional growth, curriculum, and the
                    changing world of work. We will only use your email for this
                    newsletter and you can unsubscribe later.
                  </p>
                </div>
                <form
                  onSubmit={submitNewsletter}
                  className="border border-[#16243d]/10 bg-white/75 p-8 sm:p-9 backdrop-blur-sm"
                >
                  <label className="grid gap-2 text-sm font-semibold text-[#16243d]">
                    Email address
                    <input
                      name="newsletterEmail"
                      type="email"
                      required
                      autoComplete="email"
                      value={newsletterEmail}
                      onChange={event => {
                        setNewsletterEmail(event.target.value);
                        setNewsletterSubmitted(false);
                      }}
                      onBlur={() => setNewsletterEmailTouched(true)}
                      aria-invalid={
                        newsletterEmailTouched && !newsletterEmailIsValid
                      }
                      aria-describedby="newsletter-email-hint"
                      placeholder="you@example.com"
                      className="min-h-12 border border-[#16243d]/20 bg-[#fffaf0] px-4 text-base font-normal outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/25"
                    />
                    <span
                      id="newsletter-email-hint"
                      className={`text-xs font-normal ${newsletterEmailTouched && !newsletterEmailIsValid ? "text-[#8b4f63]" : "text-[#657084]"}`}
                    >
                      {newsletterEmailTouched && !newsletterEmailIsValid
                        ? "Enter a valid email address."
                        : "Use an address you check regularly."}
                    </span>
                  </label>
                  <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-[#657084]">
                    <input
                      name="newsletterConsent"
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 accent-[#16243d]"
                    />
                    I agree to receive the Profound IQ Insights newsletter. Read
                    the{" "}
                    <a
                      href="/privacy-policy"
                      className="font-semibold text-[#16243d] underline decoration-[#c9a34e] underline-offset-4"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                  {newsletterError && (
                    <p
                      className="mt-4 border-l-2 border-[#8b4f63] bg-[#fbf0f3] p-3 text-sm text-[#8b4f63]"
                      role="alert"
                    >
                      {newsletterError}
                    </p>
                  )}
                  {newsletterSubmitted ? (
                    <div
                      className="newsletter-success mt-5 flex items-start gap-3 border-l-2 border-[#6c8b62] bg-[#eef5ea] p-4 text-sm leading-6 text-[#29452c]"
                      role="status"
                    >
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                      <span>
                        Thank you. Your Insights subscription is recorded.
                      </span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={newsletter.isPending}
                      className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 bg-[#16243d] px-5 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] transition-all hover:-translate-y-0.5 hover:bg-[#c9a34e] hover:text-[#101d35] disabled:cursor-wait disabled:opacity-70"
                    >
                      {newsletter.isPending
                        ? "Saving subscription…"
                        : "Subscribe to Insights"}{" "}
                      <ArrowUpRight size={15} />
                    </button>
                  )}
                </form>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-[#172844] py-24 text-[#f7f3e8] lg:py-32">
        <div className="container">
          <ScrollReveal>
            <div className="grid gap-16 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
              <div>
                <p className="eyebrow text-[#c9a34e]">Contributor profiles</p>
                <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                  A human voice behind every useful idea.
                </h2>
              </div>
              <p className="max-w-lg text-base leading-8 text-[#c1cad7]">
                These profile cards are placeholders for the approved people who
                will contribute to the editorial space. No contributor identity,
                credential, or publication history is being presented as real
                until it is supplied and confirmed.
              </p>
            </div>
          </ScrollReveal>
          <ScrollRevealGroup className="mt-16 grid gap-5 md:grid-cols-2">
            {contributors.map(contributor => (
              <article
                key={contributor.title}
                className="public-card-link border border-[#c9a34e]/30 bg-[#1b3152]/60 p-8 backdrop-blur-sm sm:p-9"
              >
                <div className="flex items-start gap-5">
                  <div
                    className="inline-flex h-16 w-16 shrink-0 items-center justify-center border border-[#c9a34e]/50 bg-[#101d35] text-sm font-black tracking-[.1em] text-[#c9a34e]"
                    aria-label="Contributor profile placeholder"
                  >
                    <UserRound size={20} />
                  </div>
                  <div>
                    <p className="eyebrow text-[#c9a34e]">{contributor.role}</p>
                    <h3 className="mt-2 text-lg font-semibold">
                      {contributor.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-7 text-[#c1cad7]">
                  {contributor.bio}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e]">
                  Profile details to be added <ArrowUpRight size={14} />
                </span>
              </article>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>

      <section className="bg-[#f7f3e8] py-24 lg:py-32">
        <div className="container">
          <ScrollReveal>
            <div className="grid gap-16 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
              <div>
                <p className="eyebrow text-[#7d5e1e]">Editorial themes</p>
                <h2 className="display mt-5 text-5xl leading-[.98] tracking-[-.045em] sm:text-6xl">
                  Start with a question worth carrying forward.
                </h2>
              </div>
              <p className="max-w-lg text-base leading-8 text-[#4a566a]">
                Until the first articles are approved and published, these
                themes show how readers can move from a useful question to a
                relevant experience.
              </p>
            </div>
          </ScrollReveal>
          <ScrollRevealGroup className="mt-16 grid gap-5 lg:grid-cols-3">
            {themes.map(({ label, title, body, icon: Icon }, index) => (
              <article
                key={title}
                className="public-card-link group border border-[#16243d]/10 bg-white/60 p-8 transition-all hover:-translate-y-1 hover:border-[#c9a34e] hover:bg-white hover:shadow-lg sm:p-9"
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon size={26} className="text-[#7d5e1e]" />
                  <span className="text-[10px] font-black tracking-[.16em] text-[#657084]">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-8 text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                  {label} · Coming soon
                </p>
                <h3 className="mt-4 text-xl font-semibold leading-tight">
                  {title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-[#657084]">{body}</p>
                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-colors group-hover:text-[#7d5e1e]"
                >
                  Request an update <ArrowUpRight size={14} />
                </Link>
              </article>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>
      <section className="bg-[#172844] py-20 text-[#f7f3e8] lg:py-24">
        <ScrollReveal>
          <div className="container flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow text-[#c9a34e]">Learn in the meantime</p>
              <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">
                Choose an experience, not just a headline.
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex shrink-0 items-center justify-center gap-3 border border-[#c9a34e] px-6 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] transition-all hover:bg-[#c9a34e] hover:text-[#101d35]"
            >
              Explore courses <ArrowUpRight size={15} />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </PublicPageShell>
  );
}
