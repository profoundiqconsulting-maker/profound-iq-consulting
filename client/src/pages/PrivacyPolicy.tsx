import { ChevronDown, ShieldCheck } from "lucide-react";
import { SiteNavigation } from "@/components/SiteNavigation";

const sections = [
  [
    "information-we-collect",
    "Information we collect",
    "We may collect information you provide when you register, enroll in a course, submit an inquiry, complete an assessment, request a report, or contact support. This can include your name, email address, account details, learning activity, assessment responses, and communication preferences.",
  ],
  [
    "how-we-use-information",
    "How we use information",
    "We use information to provide courses, assessments, reports, certificates, support, account security, payment reconciliation, analytics, and requested communications. Assessment responses are used to generate the report or learning experience you request and to improve the relevance of recommended next steps.",
  ],
  [
    "payments",
    "Payments",
    "Payments are processed through Paystack. Profound IQ Consulting does not request or store your full card number, PIN, or other sensitive payment credentials on this website. Transaction references and payment status may be retained to confirm access, receipts, staged course payments, and report or certificate availability.",
  ],
  [
    "authentication-and-security",
    "Authentication and security",
    "The platform may support email credentials and approved social sign-in providers. We use session controls, rate limiting, audit records, and security monitoring to protect accounts. You are responsible for keeping your password and active sessions secure and for reporting activity you do not recognize.",
  ],
  [
    "reports-certificates-and-sharing",
    "Reports, certificates, and sharing",
    "Reports and certificates are made available according to the access and payment conditions shown in the platform. If you choose to download, email, forward, or share a result, the requested recipient or social platform will receive the information necessary for that action. Temporary shared links may expire or be revoked.",
  ],
  [
    "cookies-and-analytics",
    "Cookies and analytics",
    "The website may use essential cookies or browser storage to maintain sessions, save assessment progress, remember preferences, and provide core functionality. We may record product analytics such as assessment starts, payment completions, report downloads, course activity, and voluntary sharing events. Where available, you can manage relevant preferences in your account or browser.",
  ],
  [
    "retention-and-deletion",
    "Retention and deletion",
    "We retain account, transaction, learning, assessment, and audit information for as long as reasonably necessary to provide services, maintain records, resolve disputes, protect the platform, and meet applicable obligations. You may contact us to request an account review or deletion where applicable; some transaction and security records may need to be retained.",
  ],
  [
    "third-party-services",
    "Third-party services",
    "The platform may rely on service providers for hosting, authentication, payments, email delivery, storage, analytics, and social sharing. Those providers process information under their own terms and privacy practices. We aim to disclose only the information needed for the requested service.",
  ],
  [
    "your-choices",
    "Your choices",
    "You may review or update available account details, notification preferences, connected profile-picture settings, saved progress, and sharing choices through the platform. You may also contact us with questions about access, correction, deletion, or a communication preference.",
  ],
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <SiteNavigation variant="public" />
      <section className="container max-w-6xl py-16 sm:py-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-[var(--brand)]">
            <ShieldCheck size={20} />
            <p className="text-[10px] font-black uppercase tracking-[.16em]">
              Trust and transparency
            </p>
          </div>
          <h1 className="display mt-5 text-5xl leading-[.95] sm:text-7xl">
            Privacy Policy.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#657084]">
            How Profound IQ Consulting handles information across
            transformational learning, assessments, reports, certificates,
            payments, and support.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[.14em] text-[var(--brand)]">
            {"Effective date"}: 26 August 2026
          </p>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr] lg:items-start">
          <aside
            className="top-6 lg:sticky"
            aria-label="Privacy Policy contents"
          >
            <details className="group border border-[#16243d]/15 bg-[#fffaf0] lg:open">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)] lg:pointer-events-none">
                <span>On this page</span>
                <ChevronDown
                  size={15}
                  className="transition-transform group-open:rotate-180 lg:hidden"
                />
              </summary>
              <nav className="border-t border-[#16243d]/10 p-4 lg:border-t-0 lg:pt-0">
                <ol className="space-y-1">
                  {sections.map(([id, title], index) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="flex gap-3 py-2 text-xs leading-5 text-[#657084] transition-colors hover:text-[var(--brand)]"
                      >
                        <span className="font-black text-[var(--brand)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{title}</span>
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="#questions"
                      className="flex gap-3 py-2 text-xs leading-5 text-[#657084] transition-colors hover:text-[var(--brand)]"
                    >
                      <span className="font-black text-[var(--brand)]">10</span>
                      <span>{"Questions or requests?"}</span>
                    </a>
                  </li>
                </ol>
              </nav>
            </details>
          </aside>
          <div className="min-w-0 border-t border-[#16243d]/15">
            {sections.map(([id, title, body], index) => (
              <section
                id={id}
                key={id}
                className="scroll-mt-8 border-b border-[#16243d]/10 py-8 sm:scroll-mt-10"
              >
                <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:gap-10">
                  <p className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#526078]">
                      {body}
                    </p>
                  </div>
                </div>
              </section>
            ))}
            <section
              id="questions"
              className="scroll-mt-8 border border-[var(--brand)]/50 bg-[#fffaf0] p-6 sm:scroll-mt-10 sm:p-8"
            >
              <h2 className="text-2xl font-semibold">
                {"Questions or requests?"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#526078]">
                For privacy questions, account requests, or clarification about
                a report or certificate, contact{" "}
                <a
                  href="mailto:admin@profoundiqconsulting.com"
                  className="font-semibold text-[#8b691d] underline underline-offset-4"
                >
                  admin@profoundiqconsulting.com
                </a>{" "}
                or WhatsApp{" "}
                <a
                  href="https://wa.me/254727374055"
                  className="font-semibold text-[#8b691d] underline underline-offset-4"
                >
                  +254 727 374 055
                </a>
                .
              </p>
              <p className="mt-4 text-xs leading-6 text-[#657084]">
                This page provides general information about the website’s
                practices. Specific terms shown during a transaction,
                assessment, course, or organization request may also apply.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
