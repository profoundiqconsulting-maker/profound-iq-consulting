/* Profound IQ Consulting — server-backed editorial detail page with honest draft/published status. */
import { ArrowLeft, ArrowUpRight, Clock3, FileText } from "lucide-react";
import { Link, useRoute } from "wouter";
import { PublicPageShell } from "@/components/PublicPageShell";
import { ScrollReveal, ScrollRevealGroup } from "@/components/ScrollReveal";
import { trpc } from "@/lib/trpc";

export default function InsightArticle() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";
  const articleQuery = trpc.insights.article.useQuery(
    { slug },
    { enabled: Boolean(slug) }
  );
  const article = articleQuery.data;

  if (articleQuery.isLoading)
    return (
      <PublicPageShell
        eyebrow="05 / Insights"
        title="Loading the insight."
        intro="Preparing the editorial view."
        breadcrumbs={[
          { label: "Resources", href: "/resources" },
          { label: "Insights", href: "/blog" },
          { label: "Loading" },
        ]}
        cta={{ label: "Return to Insights", href: "/blog" }}
      >
        <section className="bg-[#f7f3e8] py-20">
          <div className="container text-sm text-[#657084]">
            Loading the approved editorial record…
          </div>
        </section>
      </PublicPageShell>
    );
  if (!article || articleQuery.isError)
    return (
      <PublicPageShell
        eyebrow="05 / Insights"
        title="This insight is still taking shape."
        intro="The article you requested is not available in the current editorial preview."
        breadcrumbs={[
          { label: "Resources", href: "/resources" },
          { label: "Insights", href: "/blog" },
          { label: "Not found" },
        ]}
        cta={{ label: "Return to Insights", href: "/blog" }}
      >
        <section className="bg-[#f7f3e8] py-20">
          <div className="container">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#7d5e1e] underline underline-offset-4"
            >
              <ArrowLeft size={16} /> Back to Insights
            </Link>
          </div>
        </section>
      </PublicPageShell>
    );

  return (
    <PublicPageShell
      eyebrow={`${article.index} / ${article.category}`}
      title={<>{article.title}</>}
      intro={article.excerpt}
      breadcrumbs={[
        { label: "Resources", href: "/resources" },
        { label: "Insights", href: "/blog" },
        { label: article.title },
      ]}
      cta={{ label: "Discuss this topic", href: "/contact" }}
    >
      <section className="bg-[#f7f3e8] py-12 lg:py-16">
        <div className="container">
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-5 text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">
              <span className="inline-flex items-center gap-2 text-[#7d5e1e]">
                <FileText size={15} /> {article.status}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={15} /> {article.readTime}
              </span>
              <Link
                href="/blog"
                className="ml-auto inline-flex items-center gap-2 text-[#7d5e1e] underline underline-offset-4 transition-colors hover:text-[#7d5e1e]"
              >
                <ArrowLeft size={15} /> All Insights
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
      {article.socialImageUrl && (
        <section className="bg-[#fffaf0] pt-14 lg:pt-20">
          <div className="container max-w-4xl">
            <img
              src={article.socialImageUrl}
              alt=""
              className="aspect-[1.91/1] w-full object-cover"
              width={1200}
              height={628}
            />
          </div>
        </section>
      )}
      <section className="bg-[#fffaf0] py-20 lg:py-32">
        <div className="container grid gap-16 lg:grid-cols-[.6fr_1.4fr] lg:gap-20">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ScrollReveal>
              <div className="border-l-2 border-[#c9a34e] bg-white/70 p-7 backdrop-blur-sm">
                <p className="eyebrow text-[#7d5e1e]">A question to carry</p>
                <p className="mt-5 text-lg font-semibold leading-8 text-[#16243d]">
                  {article.accent}
                </p>
                <p className="mt-6 text-sm leading-7 text-[#657084]">
                  {article.status === "Published"
                    ? "An approved Profound IQ editorial insight."
                    : "Draft content for layout review. Publication status will be updated after editorial approval."}
                </p>
              </div>
            </ScrollReveal>
          </aside>
          <article className="max-w-3xl">
            <ScrollRevealGroup className="space-y-16">
              {article.sections.map((section, index) => (
                <section
                  key={section.heading}
                  className="border-b border-[#16243d]/10 pb-12 last:border-0"
                >
                  <p className="eyebrow text-[#7d5e1e]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="display mt-6 text-4xl leading-tight text-[#16243d] sm:text-5xl">
                    {section.heading}
                  </h2>
                  <div className="mt-7 space-y-6 text-base leading-8 text-[#4a566a]">
                    {section.paragraphs.map(paragraph => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </ScrollRevealGroup>
            <div className="mt-14 flex flex-wrap gap-4 border-t border-[#16243d]/10 pt-9">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#16243d] px-6 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                Discuss this topic <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/courses"
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#16243d]/20 px-6 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-all hover:-translate-y-1 hover:border-[#c9a34e] hover:text-[#7d5e1e]"
              >
                Explore courses <ArrowUpRight size={15} />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </PublicPageShell>
  );
}
