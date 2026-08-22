import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { AssessmentReport } from "../shared/assessment";
import { renderEmailTemplate, renderEmailTemplateHtml } from "../shared/emailTemplate";
import { renderAssessmentReportPdf } from "./reportPdf";
import { claimAssessmentReportEmail, markAssessmentReportEmailSent, releaseAssessmentReportEmailClaim } from "./db";

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

export async function sendTemplateTestEmail(input: { to: string; subject: string; body: string }): Promise<void> {
  const values = { name: "Amina Otieno", email: input.to, date: new Date().toLocaleDateString(), course: "Lead with Clarity" };
  const config = getSmtpConfig();
  await getTransporter().sendMail({ from: { name: config.fromName, address: config.from }, to: input.to, subject: `[Preview] ${input.subject}`, text: renderEmailTemplate(input.body, values), html: renderEmailTemplateHtml(input.body, values) });
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
