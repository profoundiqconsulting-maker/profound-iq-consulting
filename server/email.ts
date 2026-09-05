import nodemailer from "nodemailer";
import type { AssessmentReport } from "../shared/assessment";
import { getTopCareerPathStrengths, type CareerPathReport } from "../shared/careerPath";
import { buildSubPathwayComparisonSvg } from "../shared/reportComparisonVisual";
import { renderEmailTemplate, renderEmailTemplateHtml } from "../shared/emailTemplate";
import { renderAssessmentReportPdf, renderCareerPathReportPdf, renderPsychometricReportPdf } from "./reportPdf";
import { claimAssessmentReportEmail, markAssessmentReportEmailSent, releaseAssessmentReportEmailClaim, claimCareerPathReportEmail, markCareerPathReportEmailSent, releaseCareerPathReportEmailClaim, claimPsychometricReportEmail, markPsychometricReportEmailSent, markPsychometricReportEmailFailed } from "./db";
import { notifyOwner } from "./_core/notification";
import type { PsychometricReport } from "../shared/psychometrics";
import { getGeneratedCopy } from "../shared/generatedLocalization";
import { PUBLISHED_SITE_ORIGIN } from "../shared/siteOrigin";

type SmtpEnv = { SMTP_HOST?: string; SMTP_PORT?: string; SMTP_USER?: string; SMTP_PASSWORD?: string; SMTP_FROM?: string; SMTP_FROM_NAME?: string; RESEND_API_KEY?: string; EMAIL_FROM?: string };
type MailAttachment = { filename?: string; content?: string | Buffer; contentType?: string };
type MailOptions = { from?: string | { name?: string; address: string }; to?: string | string[]; subject?: string; text?: string; html?: string; attachments?: MailAttachment[] };
type MailTransport = { sendMail: (options: MailOptions) => Promise<unknown>; verify: () => Promise<void> };

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  fromName: string;
};

let transporter: MailTransport | null = null;

export function getSmtpConfig(env: SmtpEnv = process.env as SmtpEnv): SmtpConfig {
  const resendApiKey = env.RESEND_API_KEY?.trim();
  const configuredHost = env.SMTP_HOST?.trim();
  const usingResend = Boolean(resendApiKey && (!configuredHost || configuredHost === "smtp.resend.com"));
  const host = configuredHost || (usingResend ? "smtp.resend.com" : undefined);
  const port = Number(env.SMTP_PORT ?? (usingResend ? 465 : 587));
  const user = env.SMTP_USER?.trim() || (usingResend ? "resend" : undefined);
  const password = env.SMTP_PASSWORD?.trim() || (usingResend ? resendApiKey : undefined);
  const from = env.SMTP_FROM?.trim() || env.EMAIL_FROM?.trim() || user;
  const fromName = env.SMTP_FROM_NAME?.trim() || "Profound IQ Consulting";
  if (!host || !Number.isInteger(port) || port <= 0 || !user || !password || !from) throw new Error("SMTP report delivery is not configured.");
  return { host, port, user, password, from, fromName };
}

function getTransporter(): MailTransport {
  if (!transporter) {
    const config = getSmtpConfig();
    const smtpTransport = nodemailer.createTransport({ host: config.host, port: config.port, secure: config.port === 465, auth: { user: config.user, pass: config.password } });
    transporter = { sendMail: (options) => smtpTransport.sendMail(options), verify: async () => { await smtpTransport.verify(); } };
  }
  return transporter!;
}

export async function verifySmtpConnection(): Promise<void> {
  await getTransporter().verify();
}

export async function emailAssessmentReportIfNeeded(input: { attemptId: number; participantName: string; email: string; createdAt: Date | string; report: AssessmentReport; reportEmailStatus?: string | null; reportEmailSentAt?: Date | string | null }): Promise<boolean> {
  if (input.reportEmailStatus === "sent" || input.reportEmailSentAt) return false;
  const claimed = await claimAssessmentReportEmail(input.attemptId);
  if (!claimed) return false;
  try {
    await sendAssessmentReportEmail(input);
    await markAssessmentReportEmailSent(input.attemptId);
    return true;
  } catch (error) {
    await releaseAssessmentReportEmailClaim(input.attemptId);
    throw error;
  }
}

export async function sendScheduledExportNotification(input: { status: "success" | "failed"; recipients?: string[]; reportUrl?: string; rowCount?: number; errorMessage?: string }): Promise<void> {
  const config = getSmtpConfig();
  const recipients = input.recipients?.filter(Boolean) ?? [];
  const to = recipients.length ? recipients : [config.from];
  const subject = input.status === "success" ? "Profound IQ weekly enrollment export generated" : "Profound IQ weekly enrollment export failed";
  const message = input.status === "success"
    ? `The weekly enrollment export was generated successfully with ${input.rowCount ?? 0} row(s). Download it from the admin dashboard: ${input.reportUrl ?? "open the dashboard"}.`
    : `The weekly enrollment export could not be generated. Error: ${input.errorMessage ?? "Unknown export error"}`;
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to, subject, text: message, html: `<div style="font-family:Arial,sans-serif;color:#16243d"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(message)}</p></div>` });
}

export async function sendFailedLoginAlert(input: { recipients: string[]; identifier: string; failedCount: number }): Promise<void> {
  const config = getSmtpConfig();
  const recipients = input.recipients.filter(Boolean);
  if (!recipients.length) return;
  const subject = "Profound IQ security alert: repeated failed login attempts";
  const message = `We detected ${input.failedCount} failed login attempts for the identifier ${input.identifier}. Review your account and consider changing your password if this activity was not expected.`;
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: recipients, subject, text: message, html: `<div style="font-family:Arial,sans-serif;color:#16243d"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(message)}</p><p>This alert does not reveal the source network or password details.</p></div>` });
}

export async function sendNewsletterDigestEmail(input: { to: string; articles: Array<{ title: string; excerpt: string; category: string; slug: string }>; unsubscribeUrl: string }): Promise<void> {
  const config = getSmtpConfig();
  const safeUnsubscribeUrl = escapeHtml(input.unsubscribeUrl);
  const items = input.articles.map((article) => `<article style="border-top:1px solid #d8cfba;padding:18px 0"><div style="color:#a27e2e;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">${escapeHtml(article.category)}</div><h2 style="margin:8px 0;font-size:22px">${escapeHtml(article.title)}</h2><p style="line-height:1.6;color:#4a566a">${escapeHtml(article.excerpt)}</p><a href="${PUBLISHED_SITE_ORIGIN}/blog/${encodeURIComponent(article.slug)}" style="color:#7d5e1e;font-weight:700">Read the insight →</a></article>`).join("");
  const subject = "Profound IQ Insights: ideas for purposeful progress";
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: input.to, subject, text: `New Profound IQ Insights\n\n${input.articles.map((article) => `${article.title}\n${article.excerpt}\n${PUBLISHED_SITE_ORIGIN}/blog/${article.slug}`).join("\n\n")}\n\nUnsubscribe: ${input.unsubscribeUrl}`, html: `<div style="margin:0 auto;max-width:680px;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">INSIGHTS / BI-WEEKLY EDITION</div></div><div style="padding:28px"><p>Useful ideas about education, leadership, learning design, and professional growth.</p>${items}<p style="font-size:13px;color:#657084;border-top:1px solid #d8cfba;padding-top:18px">You are receiving this because you confirmed your Profound IQ Insights subscription. <a href="${safeUnsubscribeUrl}" style="color:#7d5e1e">Unsubscribe</a>.</p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px">Profound IQ Consulting · Transformational learning</div></div>` });
}

export async function sendNewsletterConfirmationEmail(input: { to: string; confirmationUrl: string; unsubscribeUrl: string }): Promise<void> {
  const config = getSmtpConfig();
  const safeConfirmationUrl = escapeHtml(input.confirmationUrl);
  const safeUnsubscribeUrl = escapeHtml(input.unsubscribeUrl);
  const subject = "Confirm your Profound IQ Insights subscription";
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: input.to, subject, text: `You requested Profound IQ Consulting Insights. Confirm your subscription here:\n${input.confirmationUrl}\n\nIf you did not request this, ignore this email. You can unsubscribe here: ${input.unsubscribeUrl}`, html: `<div style="margin:0 auto;max-width:680px;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">INSIGHTS / CONFIRMATION</div></div><div style="padding:28px"><p>You requested useful ideas from Profound IQ Consulting.</p><p>Confirm your email address to receive Insights updates.</p><p><a href="${safeConfirmationUrl}" style="display:inline-block;background:#c9a34e;color:#16243d;padding:13px 18px;text-decoration:none;font-weight:700">Confirm subscription</a></p><p style="font-size:13px;color:#657084">This confirmation link expires in 48 hours. If you did not request this, ignore this message. You can also <a href="${safeUnsubscribeUrl}" style="color:#7d5e1e">unsubscribe</a>.</p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px">Profound IQ Consulting · Transformational learning</div></div>` });
}

export async function sendPasswordResetEmail(input: { to: string; name: string; resetUrl: string }): Promise<void> {
  const config = getSmtpConfig();
  const subject = "Reset your Profound IQ password";
  const safeName = escapeHtml(input.name);
  const safeUrl = escapeHtml(input.resetUrl);
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: input.to, subject, text: `Hello ${input.name},\n\nUse this link to reset your Profound IQ password. It expires in 30 minutes and can be used once:\n${input.resetUrl}\n\nIf you did not request this, you can ignore this message.`, html: `<div style="font-family:Arial,sans-serif;color:#16243d"><p>Hello ${safeName},</p><p>Use the link below to reset your Profound IQ password. It expires in 30 minutes and can be used once.</p><p><a href="${safeUrl}">Reset password</a></p><p>If you did not request this, you can ignore this message.</p></div>` });
}

export async function sendAssessmentResumeEmail(input: { to: string; name: string; resumeUrl: string; expiresAt: Date }): Promise<void> {
  const config = getSmtpConfig();
  const subject = "Continue your Profound IQ assessment";
  const safeName = escapeHtml(input.name);
  const safeUrl = escapeHtml(input.resumeUrl);
  const expiry = input.expiresAt.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
  await getTransporter().sendMail({
    from: { name: config.fromName, address: config.from },
    to: input.to,
    subject,
    text: `Hello ${input.name},\n\nYou can continue your Profound IQ assessment using this secure link:\n${input.resumeUrl}\n\nThis link expires on ${expiry}. Keep it private; it contains access to your saved progress.\n\nProfound IQ Consulting`,
    html: `<div style="margin:0 auto;max-width:680px;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">ASSESSMENT / CONTINUE LATER</div></div><div style="padding:28px"><p>Hello ${safeName},</p><p>Your saved assessment progress is ready to continue.</p><p><a href="${safeUrl}" style="display:inline-block;background:#c9a34e;color:#16243d;padding:13px 18px;text-decoration:none;font-weight:700">Continue assessment</a></p><p style="font-size:13px;color:#657084">This private link expires on ${escapeHtml(expiry)}. Keep it private; it provides access to your saved progress.</p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px">Profound IQ Consulting · Transformational learning</div></div>`,
  });
}

export async function sendTemplateTestEmail(input: { to: string; subject: string; body: string }): Promise<void> {
  const values = { name: "Amina Otieno", email: input.to, date: new Date().toLocaleDateString(), course: "Lead with Clarity" };
  const config = getSmtpConfig();
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: input.to, subject: `[Preview] ${input.subject}`, text: renderEmailTemplate(input.body, values), html: renderEmailTemplateHtml(input.body, values) });
}

export async function emailCareerPathReportIfNeeded(input: { attemptId: number; participantName: string; email: string; createdAt: Date | string; report: CareerPathReport; personalNotes?: string | null; receiptTitle?: string | null; reportEmailStatus?: string | null; reportEmailSentAt?: Date | string | null }): Promise<boolean> {
  if (input.reportEmailStatus === "sent" || input.reportEmailSentAt) return false;
  const claimed = await claimCareerPathReportEmail(input.attemptId);
  if (!claimed) return false;
  try {
    await sendCareerPathReportEmail(input);
    await markCareerPathReportEmailSent(input.attemptId);
    return true;
  } catch (error) {
    await releaseCareerPathReportEmailClaim(input.attemptId);
    throw error;
  }
}

export async function sendCareerPathReportEmail(input: { attemptId: number; participantName: string; email: string; createdAt: Date | string; report: CareerPathReport; personalNotes?: string | null; receiptTitle?: string | null }): Promise<void> {
  const config = getSmtpConfig();
  const pdf = await renderCareerPathReportPdf({ attemptId: input.attemptId, participantName: input.participantName, email: input.email, createdAt: input.createdAt, report: input.report });
  const coachingVisual = Buffer.from(buildSubPathwayComparisonSvg({ rows: input.report.subPathways.map((item) => ({ label: item.label, score: item.score })), generatedAt: new Date(input.createdAt).toLocaleDateString("en-KE") }));
  const topStrengths = getTopCareerPathStrengths(input.report).map((item) => `${item.label} (${item.score}/100)`);
  const strengthsSummary = topStrengths.length ? `Your top strengths signals are ${topStrengths.join(", ")}. Use these as starting points for reflection and conversation, not as fixed labels.` : "Your report contains a coaching visual to support reflection and conversation.";
  const personalNote = input.personalNotes?.trim() ? `Personal note from you:\n${input.personalNotes.trim()}` : "";
  const safePersonalNote = input.personalNotes?.trim() ? `<p><strong>Your personal note</strong></p><p style="white-space:pre-wrap">${escapeHtml(input.personalNotes.trim())}</p>` : "";
  await getTransporter().sendMail({
    from: { name: config.fromName, address: config.from },
    to: input.email,
    subject: input.receiptTitle?.trim() ? `${input.receiptTitle.trim()} · Profound IQ CareerPath` : "Your Profound IQ CareerPath report",
    text: `PROFOUND IQ CONSULTING\nCAREERPATH / LEARNER INSIGHT\n--------------------------------\nHello ${input.participantName},\n\nYour Profound IQ CareerPath report and coaching visual are attached. Use them to explore subjects, projects and conversations before choosing your next direction.\n\n${strengthsSummary}${personalNote ? `\n\n${personalNote}` : ""}\n\nThis educational guidance tool is not a diagnosis and does not determine a career.\n\n--------------------------------\nProfound IQ Consulting · Transformational learning`,
    html: `<div style="margin:0 auto;max-width:680px;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">CAREERPATH / LEARNER INSIGHT</div></div><div style="padding:28px"><p>Hello ${escapeHtml(input.participantName)},</p><p>Your Profound IQ CareerPath report and coaching visual are attached. Use them to explore subjects, projects and conversations before choosing your next direction.</p><div style="border-left:3px solid #c9a34e;padding:12px 16px;background:#fff"><p>${escapeHtml(strengthsSummary)}</p>${safePersonalNote}</div><p><em>This educational guidance tool is not a diagnosis and does not determine a career.</em></p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px;line-height:1.6"><strong style="color:#f7f3e8">Profound IQ Consulting</strong><br/>Transformational learning · Educational guidance · Online / global reach</div></div>`,
    attachments: [{ filename: `profound-iq-careerpath-${input.attemptId}.pdf`, content: pdf, contentType: "application/pdf" }, { filename: `profound-iq-careerpath-${input.attemptId}-coaching-visual.svg`, content: coachingVisual, contentType: "image/svg+xml" }],
  });
}

export async function emailPsychometricReportIfNeeded(input: { attemptId: number; participantName: string; email: string; createdAt: Date | string; report: PsychometricReport; reportEmailStatus?: string | null; reportEmailSentAt?: Date | string | null; verificationUrl: string }): Promise<boolean> {
  if (input.reportEmailStatus === "sent" || input.reportEmailSentAt) return false;
  const claimed = await claimPsychometricReportEmail(input.attemptId);
  if (!claimed) return false;
  try { await sendPsychometricReportEmail(input); await markPsychometricReportEmailSent(input.attemptId); return true;   } catch (error) { await markPsychometricReportEmailFailed(input.attemptId); void notifyOwner({ title: "Psychometric report email failed", content: `Delivery failed for ${input.report.title} · attempt ${input.attemptId} · recipient ${input.email}. ${error instanceof Error ? error.message.slice(0, 500) : "Provider returned an unknown error."}` }).catch((notificationError) => console.warn("[PsychometricEmail] Admin alert failed:", notificationError)); throw error; }
}

export async function sendPsychometricReportEmail(input: { attemptId: number; participantName: string; email: string; createdAt: Date | string; report: PsychometricReport; verificationUrl: string }): Promise<void> {
  const config = getSmtpConfig();
  const pdf = await renderPsychometricReportPdf({ attemptId: input.attemptId, participantName: input.participantName, email: input.email, createdAt: input.createdAt, report: input.report, verificationUrl: input.verificationUrl });
  const subject = `Your Profound IQ ${input.report.title} report`;
  const safeName = escapeHtml(input.participantName);
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: input.email, subject, text: `Hello ${input.participantName},\n\nYour paid Profound IQ psychometric report is attached. Use it as an educational development conversation starter, not as a diagnosis or standalone high-stakes decision.\n\nVerify this report: ${input.verificationUrl}\n\nProfound IQ Consulting`, html: `<div style="margin:0 auto;max-width:680px;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">PSYCHOMETRIC ASSESSMENT SUITE</div></div><div style="padding:28px"><p>Hello ${safeName},</p><p>Your paid psychometric report is attached and ready for reflection, coaching, and learning conversations.</p><p><a href="${escapeHtml(input.verificationUrl)}" style="color:#7d5e1e;font-weight:700">Verify this report</a></p><p><em>This educational profile is not a clinical diagnosis or a standalone basis for employment, admission, promotion, or other high-stakes decisions.</em></p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px">Profound IQ Consulting · Transformational learning</div></div>`, attachments: [{ filename: `profound-iq-${input.report.testSlug}-${input.attemptId}.pdf`, content: pdf, contentType: "application/pdf" }] });
}

export async function sendAssessmentReportEmail(input: { attemptId: number; participantName: string; email: string; createdAt: Date | string; report: AssessmentReport }): Promise<void> {
  const config = getSmtpConfig();
  const pdf = await renderAssessmentReportPdf({ attemptId: input.attemptId, participantName: input.participantName, email: input.email, createdAt: input.createdAt, report: input.report });
  await getTransporter().sendMail({
    from: { name: config.fromName, address: config.from },
    to: input.email,
    subject: "Your Profound IQ assessment report",
    text: `Hello ${input.participantName},\n\nYour Profound IQ assessment report is attached. Use it as a starting point for reflection and purposeful action.\n\nThis educational self-assessment is not a clinical, psychological, employment, or medical diagnosis.\n\nProfound IQ Consulting`,
    html: `<p>Hello ${escapeHtml(input.participantName)},</p><p>Your Profound IQ assessment report is attached. Use it as a starting point for reflection and purposeful action.</p><p><em>This educational self-assessment is not a clinical, psychological, employment, or medical diagnosis.</em></p><p>Profound IQ Consulting</p>`,
    attachments: [{ filename: `profound-iq-assessment-${input.attemptId}.pdf`, content: pdf, contentType: "application/pdf" }],
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export async function sendCourseCertificateEmail(input: { recipientName: string; email: string; courseTitle: string; certificateNumber: string; certificateSvg: string; locale?: string }) {
  const copy = getGeneratedCopy(input.locale);
  const config = getSmtpConfig();
  const safeName = escapeHtml(input.recipientName);
  const safeCourse = escapeHtml(input.courseTitle);
  const subject = `${copy.certificateOfCompletion} · ${input.courseTitle}`;
  await getTransporter().sendMail({
    from: { name: config.fromName, address: config.from },
    to: input.email,
    subject,
    text: `Hello ${input.recipientName},\n\nCongratulations on completing ${input.courseTitle}. Your branded certificate of completion is attached. Credential: ${input.certificateNumber}.\n\nProfound IQ Consulting · Transformational learning`,
    html: `<div style="max-width:680px;margin:0 auto;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">CERTIFICATE OF COMPLETION</div></div><div style="padding:28px"><p>Hello ${safeName},</p><p>Congratulations on completing <strong>${safeCourse}</strong>. Your professional certificate is attached and will remain available in your learner dashboard.</p><p style="border-left:3px solid #c9a34e;padding:12px 16px;background:#fff">Credential: <strong>${escapeHtml(input.certificateNumber)}</strong></p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px">Profound IQ Consulting · Transformational learning · Online / global reach</div></div>`,
    attachments: [{ filename: `profound-iq-${input.certificateNumber}.svg`, content: input.certificateSvg, contentType: "image/svg+xml" }],
  });
}

export async function sendOrganizationReviewRequestEmail(input: { organizationName: string; organizationEmail: string; learnerName: string; courseTitle: string; certificateNumber: string; locale?: string }): Promise<void> {
  const config = getSmtpConfig();
  const subject = `Profound IQ certificate review request · ${input.learnerName}`;
  const safeOrganization = escapeHtml(input.organizationName);
  const safeRespondent = escapeHtml(input.learnerName);
  const safeCourse = escapeHtml(input.courseTitle);
  const safeCertificate = escapeHtml(input.certificateNumber);
  await getTransporter().sendMail({
    from: { name: config.fromName, address: config.from },
    to: input.organizationEmail,
    subject,
    text: `Hello ${input.organizationName},\n\n${input.learnerName} has requested that your organization review their Profound IQ certificate for ${input.courseTitle}. Certificate: ${input.certificateNumber}. Profound IQ will confirm the request before any report access is granted.\n\nProfound IQ Consulting`,
    html: `<div style="max-width:680px;margin:0 auto;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">ORGANIZATION REVIEW REQUEST</div></div><div style="padding:28px"><p>Hello ${safeOrganization},</p><p><strong>${safeRespondent}</strong> has requested that your organization review their completed course certificate for <strong>${safeCourse}</strong>.</p><p style="border-left:3px solid #c9a34e;padding:12px 16px;background:#fff">Certificate: <strong>${safeCertificate}</strong></p><p>Profound IQ will confirm the request before any report access is granted.</p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px">Profound IQ Consulting · Transformational learning · Online / global reach</div></div>`,
  });
}

export async function sendWeeklyPsychometricAnalyticsEmail(input: { recipients: string[]; reportPdf: Buffer; fromDate: string; toDate: string; attemptCount: number }): Promise<void> {
  const config = getSmtpConfig();
  const recipients = input.recipients.filter(Boolean);
  if (!recipients.length) return;
  const subject = `Profound IQ weekly psychometric analytics · ${input.toDate}`;
  const message = `Attached is the weekly psychometric analytics report for ${input.fromDate} to ${input.toDate}. It covers ${input.attemptCount} assessment attempt(s), conversion, and report-email delivery outcomes.`;
  await getTransporter().sendMail({
    from: { name: config.fromName, address: config.from },
    to: recipients,
    subject,
    text: message,
    html: `<div style="font-family:Arial,sans-serif;color:#16243d"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(message)}</p><p>Review the live observatory for profile-level detail and delivery follow-up.</p></div>`,
    attachments: [{ filename: `psychometric-analytics-${input.toDate}.pdf`, content: input.reportPdf, contentType: "application/pdf" }],
  });
}

export async function sendCourseAccessAnalyticsReportEmail(input: { recipient: string; pdf: Buffer; filename: string; fromDate?: string; toDate?: string }): Promise<void> {
  const config = getSmtpConfig();
  const recipient = input.recipient.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error("A valid stakeholder email address is required.");
  const subject = `Profound IQ learning access report${input.fromDate || input.toDate ? ` · ${input.fromDate ?? "All time"}–${input.toDate ?? "Today"}` : ""}`;
  const message = "Attached is the branded Profound IQ Learning Access Observatory report for stakeholder review.";
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: [recipient], subject, text: message, html: `<div style="font-family:Arial,sans-serif;color:#16243d"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(message)}</p><p>Generated from persisted access and payment records.</p></div>`, attachments: [{ filename: input.filename, content: input.pdf, contentType: "application/pdf" }] });
}


export async function sendInstructorFeedbackEmail(input: { recipient: string; learnerName?: string | null; courseSlug: string; lessonId: string; feedback: string }): Promise<void> {
  const config = getSmtpConfig();
  const recipient = input.recipient.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error("A valid learner email address is required.");
  const safeName = escapeHtml(input.learnerName || "Respondent");
  const safeCourse = escapeHtml(input.courseSlug);
  const safeLesson = escapeHtml(input.lessonId);
  const safeFeedback = escapeHtml(input.feedback);
  const subject = "New instructor feedback is ready in your Profound IQ workspace";
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: [recipient], subject, text: `Hello ${input.learnerName || "Respondent"},\n\nAn instructor has posted new feedback on your saved response in ${input.courseSlug}, ${input.lessonId}.\n\nFeedback:\n${input.feedback}\n\nOpen your workspace to continue learning.`, html: `<div style="max-width:680px;margin:0 auto;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">INSTRUCTOR FEEDBACK</div></div><div style="padding:28px"><p>Hello ${safeName},</p><p>Your instructor has posted new feedback on a saved lesson response.</p><p style="border-left:3px solid #c9a34e;padding:12px 16px;background:#fff"><strong>${safeCourse}</strong><br>${safeLesson}</p><p style="border-left:3px solid #2f6f78;padding:12px 16px;background:#edf4ee">${safeFeedback}</p><p>Open your Profound IQ workspace to review the guidance and continue learning.</p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px">Profound IQ Consulting · Transformational learning · Online / global reach</div></div>` });
}


export async function sendWeeklyCourseLessonReviewAnalyticsEmail(input: { recipients: string[]; reportPdf: Buffer; fromDate: string; toDate: string; reviewedResponses: number; needsReviewResponses: number }): Promise<void> {
  const config = getSmtpConfig();
  const recipients = input.recipients.filter(Boolean);
  if (!recipients.length) return;
  const subject = `Profound IQ weekly instructor review analytics · ${input.toDate}`;
  const message = `Attached is the review analytics report for ${input.fromDate} to ${input.toDate}. It covers ${input.reviewedResponses} reviewed response(s) and ${input.needsReviewResponses} response(s) still needing review.`;
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: recipients, subject, text: message, html: `<div style="font-family:Arial,sans-serif;color:#16243d"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(message)}</p><p>The report includes response aging, reviewer workload, course summaries, module summaries, and daily activity.</p></div>`, attachments: [{ filename: `review-analytics-${input.toDate}.pdf`, content: input.reportPdf, contentType: "application/pdf" }] });
}

export async function sendPaymentReceiptEmail(input: { to: string; participantName: string; reference: string; productName: string; amountKes: number; paidAt: Date | string; productType: "assessment" | "psychometric" | "careerpath" | "course_stage"; courseSlug?: string; enrollmentId?: number }): Promise<void> {
  const config = getSmtpConfig();
  const safeName = escapeHtml(input.participantName || "Respondent");
  const safeProduct = escapeHtml(input.productName);
  const safeReference = escapeHtml(input.reference);
  const safeAmount = `KES ${input.amountKes.toLocaleString()}`;
  const safeDate = new Date(input.paidAt).toLocaleString();
  const subject = `Payment receipt · ${safeProduct} · Profound IQ Consulting`;
  const origin = PUBLISHED_SITE_ORIGIN;
  let verificationUrl = `${origin}/dashboard`;
  if (input.productType === "assessment") verificationUrl = `${origin}/assessment?reference=${encodeURIComponent(input.reference)}`;
  else if (input.productType === "psychometric") verificationUrl = `${origin}/psychometrics?reference=${encodeURIComponent(input.reference)}`;
  else if (input.productType === "careerpath") verificationUrl = `${origin}/careerpath?reference=${encodeURIComponent(input.reference)}`;
  else if (input.productType === "course_stage" && input.courseSlug) verificationUrl = `${origin}/courses/${encodeURIComponent(input.courseSlug)}`;
  const text = `Hello ${safeName},\n\nThank you for your payment of ${safeAmount} for ${safeProduct}.\n\nTransaction reference: ${safeReference}\nPaid on: ${safeDate}\n\nView your purchase: ${verificationUrl}\n\nIf you have any questions, reply to this email or contact our support team.\n\nProfound IQ Consulting · Transformational learning`;
  const html = `<div style="max-width:680px;margin:0 auto;background:#f7f3e8;color:#16243d;font-family:Arial,sans-serif"><div style="background:#101d35;color:#f7f3e8;padding:24px 28px;border-top:6px solid #c9a34e"><div style="font-size:12px;letter-spacing:3px;font-weight:700">PROFOUND IQ CONSULTING</div><div style="margin-top:8px;color:#c9a34e;font-size:11px;letter-spacing:2px">PAYMENT RECEIPT</div></div><div style="padding:28px"><p>Hello ${safeName},</p><p>Thank you for your purchase. Your payment has been confirmed and your access is being updated.</p><div style="border:1px solid #d8cfba;background:#fff;padding:20px;margin:20px 0"><p style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#a27e2e;margin:0 0 12px">Transaction details</p><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="border-bottom:1px solid #eee"><td style="padding:8px 0;color:#657084">Product</td><td style="padding:8px 0;text-align:right;font-weight:600">${safeProduct}</td></tr><tr style="border-bottom:1px solid #eee"><td style="padding:8px 0;color:#657084">Amount paid</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#a27e2e">${safeAmount}</td></tr><tr style="border-bottom:1px solid #eee"><td style="padding:8px 0;color:#657084">Reference</td><td style="padding:8px 0;text-align:right;font-family:monospace">${safeReference}</td></tr><tr><td style="padding:8px 0;color:#657084">Date</td><td style="padding:8px 0;text-align:right">${safeDate}</td></tr></table></div><p style="margin:0"><a href="${verificationUrl}" style="display:inline-block;background:#16243d;color:#f7f3e8;padding:12px 24px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px">VIEW YOUR PURCHASE</a></p><p style="margin-top:24px;font-size:13px;color:#657084">Keep this receipt for your records. If you did not authorize this transaction, contact us immediately.</p></div><div style="background:#16243d;color:#c1cad7;padding:18px 28px;font-size:12px">Profound IQ Consulting · Transformational learning · Online / global reach</div></div>`;
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: [input.to], subject, text, html });
}
