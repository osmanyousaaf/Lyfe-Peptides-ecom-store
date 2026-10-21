// Outgoing email over SMTP (a Gmail account with an app password works). Server only.
// Every attempt is logged in the emails table so the admin can see what went out.
import nodemailer, { type Transporter } from "nodemailer";
import { db } from "./db";

export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transport: Transporter | null = null;
function transporter(): Transporter {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export type Mail = { to: string; subject: string; html: string; text: string; kind?: string };

// Never throws: returns whether it was sent. Without SMTP settings it logs "skipped".
export async function sendMail(m: Mail): Promise<{ sent: boolean; error?: string }> {
  const log = db().prepare("INSERT INTO emails (to_email, subject, kind, status, error) VALUES (?, ?, ?, ?, ?)");
  if (!mailConfigured()) {
    log.run(m.to, m.subject, m.kind ?? "", "skipped", "SMTP is not configured");
    if (process.env.NODE_ENV !== "production") console.info(`[mail skipped] to ${m.to}: ${m.subject}\n${m.text}`);
    return { sent: false, error: "Email isn't set up yet." };
  }
  try {
    await transporter().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: m.to,
      subject: m.subject,
      html: m.html,
      text: m.text,
    });
    log.run(m.to, m.subject, m.kind ?? "", "sent", null);
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Send failed";
    log.run(m.to, m.subject, m.kind ?? "", "failed", error);
    return { sent: false, error };
  }
}
