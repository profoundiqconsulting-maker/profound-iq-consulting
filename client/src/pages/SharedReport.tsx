import { AlertCircle, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { getDimensionReflectionPoints } from "@shared/assessment";
import { BrandLogo } from "@/components/BrandLogo";
import { useLocale } from "@/contexts/LocaleContext";

export default function SharedReport() {
  const { t } = useLocale();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const result = trpc.sharedReport.get.useQuery(
    { token },
    { enabled: token.length >= 32, retry: false }
  );
  if (!token || result.isError)
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <header className="border-b border-[#16243d]/15 bg-[#101d35] py-5">
          <div className="container">
            <BrandLogo />
          </div>
        </header>
        <main className="container py-24">
          <div className="mx-auto max-w-xl border-l-2 border-red-700 bg-red-50 p-6 text-red-900">
            <AlertCircle className="mb-4" />
            <h1 className="display text-4xl">
              This report link is unavailable.
            </h1>
            <p className="mt-4 text-sm leading-6">
              The link may have expired, been revoked, or been copied
              incorrectly. Ask the report owner to generate a new private link.
            </p>
          </div>
        </main>
      </div>
    );
  if (result.isLoading)
    return (
      <div className="min-h-screen bg-[#f7f3e8] p-8 text-[#16243d]">
        Loading shared report…
      </div>
    );
  const data = result.data;
  if (!data) return null;
  const report = data.report;
  const lens = data.roleLens;
  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <header className="border-b border-[#16243d]/15 bg-[#101d35] py-5">
        <div className="container flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-[.14em] text-[#c1cad7] hover:text-[#c9a34e]"
          >
            {t("backToSite")}
          </Link>
        </div>
      </header>
      <main className="container py-10 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow text-[#a27e2e]">
            Shared with you · {data.participantName}
          </p>
          <h1 className="display mt-4 text-5xl">
            A considered <em className="font-normal text-[#a27e2e]">signal.</em>
          </h1>
          <p className="mt-4 text-sm text-[#657084]">
            Generated {new Date(data.createdAt).toLocaleDateString()} · Link
            expires {new Date(data.expiresAt).toLocaleDateString()}
          </p>
          <section className="mt-10 border border-[#c9a34e] bg-[#16243d] p-6 text-[#f7f3e8] sm:p-8">
            <p className="eyebrow text-[#c9a34e]">{lens.label}</p>
            <h2 className="display mt-3 text-2xl">
              Tailored context for this conversation
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#c1cad7]">
              {lens.context}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {lens.priorities.map(item => (
                <p
                  key={item}
                  className="border-l border-[#c9a34e] pl-3 text-sm leading-6 text-[#c1cad7]"
                >
                  {item}
                </p>
              ))}
            </div>
            <p className="eyebrow mt-8 text-[#c9a34e]">Executive summary</p>
            <h2 className="display mt-3 text-3xl">
              {report.executiveSummary?.headline ??
                `${report.overallBand}: a practical view of the current capability pattern`}
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[#c1cad7]">
              {report.executiveSummary?.overview ??
                "Use this report as a professional development conversation starter."}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {(report.executiveSummary?.priorities ?? report.focusAreas).map(
                item => (
                  <p
                    key={item}
                    className="border-l border-[#c9a34e] pl-3 text-sm leading-6 text-[#c1cad7]"
                  >
                    {item}
                  </p>
                )
              )}
            </div>
          </section>
          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            {report.dimensions.map(dimension => (
              <article
                key={dimension.key}
                className="border-t border-[#16243d]/20 pt-4"
              >
                <div className="flex justify-between">
                  <h2 className="font-bold">{dimension.label}</h2>
                  <span className="display text-2xl text-[#a27e2e]">
                    {dimension.score}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#4a566a]">
                  {dimension.readout}
                </p>
                <div className="mt-4 border-l border-[#c9a34e]/60 pl-3">
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#a27e2e]">
                    Reflection prompts
                  </p>
                  <ul className="mt-2 space-y-2 text-xs leading-5 text-[#4a566a]">
                    {getDimensionReflectionPoints(dimension).map(item => (
                      <li key={item}>→ {item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </section>
          <section className="mt-10 grid gap-8 border-t border-[#16243d]/20 pt-8 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-[#a27e2e]">
                {lens.label} reflection prompts
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#4a566a]">
                {lens.reflectionPoints.map(item => (
                  <li key={item} className="border-l border-[#c9a34e] pl-3">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="eyebrow mt-8 text-[#a27e2e]">General reflection</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#4a566a]">
                {report.reflectionPoints.map(item => (
                  <li key={item} className="border-l border-[#c9a34e] pl-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#16243d] p-6 text-[#c1cad7]">
              <ShieldCheck className="mb-4 text-[#c9a34e]" />
              <p className="eyebrow text-[#c9a34e]">Important context</p>
              <ul className="mt-4 space-y-3 text-sm leading-6">
                {report.importantContext.map(item => (
                  <li key={item}>＋ {item}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Shared links are intentionally read-only and never expose raw answers or payment references.
void SharedReport;
