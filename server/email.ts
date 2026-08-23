import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { AssessmentReport } from "../shared/assessment";
import { getTopCareerPathStrengths, type CareerPathReport } from "../shared/careerPath";
import { buildSubPathwayComparisonSvg } from "../shared/reportComparisonVisual";
import { renderEmailTemplate, renderEmailTemplateHtml } from "../shared/emailTemplate";
import { renderAssessmentReportPdf, renderCareerPathReportPdf } from "./reportPdf";
import { claimAssessmentReportEmail, markAssessmentReportEmailSent, releaseAssessmentReportEmailClaim, claimCareerPathReportEmail, markCareerPathReportEmailSent, releaseCareerPathReportEmailClaim } from "./db";

type SmtpEnv = { SMTP_HOST?: string; SMTP_PORT?: string; SMTP_USER?: string; SMTP_PASSWORD?: string; SMTP_FROM?: string; SMTP_FROM_NAME?: string };

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  fromName: string;
};

let transporter: Transporter | null = null;

export function getSmtpConfig(env: SmtpEnv = process.env as SmtpEnv): SmtpConfig {
  const host = env.SMTP_HOST?.trim();
  const port = Number(env.SMTP_PORT ?? 587);
  const user = env.SMTP_USER?.trim();
  const password = env.SMTP_PASSWORD;
  const from = env.SMTP_FROM?.trim() || user;
  const fromName = env.SMTP_FROM_NAME?.trim() || "Profound IQ Consulting";
  if (!host || !Number.isInteger(port) || port <= 0 || !user || !password || !from) throw new Error("SMTP report delivery is not configured.");
  return { host, port, user, password, from, fromName };
}

function getTransporter(): Transporter {
  if (!transporter) {
    const config = getSmtpConfig();
    transporter = nodemailer.createTransport({ host: config.host, port: config.port, secure: config.port === 465, auth: { user: config.user, pass: config.password } });
  }
  return transporter;
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
  const pdf = await renderCareerPathReportPdf({ attemptId: input.attemptId, participantName: input.participantName, createdAt: input.createdAt, report: input.report });
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

export async function sendAssessmentReportEmail(input: { attemptId: number; participantName: string; email: string; createdAt: Date | string; report: AssessmentReport }): Promise<void> {
  const config = getSmtpConfig();
  const pdf = await renderAssessmentReportPdf({ attemptId: input.attemptId, participantName: input.participantName, createdAt: input.createdAt, report: input.report });
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
