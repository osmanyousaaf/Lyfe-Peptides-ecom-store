import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import SettingsForm from "@/components/admin/content/SettingsForm";
import { googleConfigured } from "@/lib/google-auth";
import { mailConfigured } from "@/lib/mail";
import { DATA_DIR, UPLOAD_DIR } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

function size(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function dbSize(): number {
  return ["lyfe.db", "lyfe.db-wal"].reduce((n, f) => {
    try {
      return n + fs.statSync(path.join(DATA_DIR, f)).size;
    } catch {
      return n;
    }
  }, 0);
}

export default function Settings() {
  const settings = getSettings();
  let uploads = 0;
  try {
    uploads = fs.readdirSync(UPLOAD_DIR).length;
  } catch {
    /* folder not created yet */
  }
  const env = {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    webhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    claude: Boolean(process.env.ANTHROPIC_API_KEY),
    google: googleConfigured(),
    mail: mailConfigured(),
  };

  return (
    <>
      <PageHeader title="Settings" description="Store details, shipping rules and what customers see across the site." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SettingsForm settings={settings} />

        <div className="grid content-start gap-6">
          <Card title="Connections">
            <ul className="grid gap-4 text-sm">
              <Status label="Stripe payments" on={env.stripe} hint={env.stripe ? "Checkout is live." : "Add STRIPE_SECRET_KEY to .env.local to take payments."} />
              <Status label="Stripe webhook" on={env.webhook} hint={env.webhook ? "Paid orders are recorded automatically." : "Add STRIPE_WEBHOOK_SECRET so paid orders are saved even if the customer closes the tab."} />
              <Status
                label="Google sign-in"
                on={env.google}
                hint={env.google ? "Customers can create accounts with Google." : "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. Until then sign-up is off (a test sign-in works in development)."}
              />
              <Status
                label="Email (SMTP)"
                on={env.mail}
                hint={env.mail ? `Sign-up codes are emailed from ${process.env.MAIL_FROM || process.env.SMTP_USER}.` : "Add SMTP_HOST, SMTP_USER and SMTP_PASS (a Gmail app password works). Codes still show on the account page."}
              />
              <Status label="Claude chat" on={env.claude} hint={env.claude ? "The assistant answers with Claude." : "Add ANTHROPIC_API_KEY. Until then the chat uses its built-in answers."} />
            </ul>
          </Card>

          <Card title="Data">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-faint">Database</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-ink">{path.join(DATA_DIR, "lyfe.db")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Size</dt>
                <dd className="num font-semibold">{size(dbSize())}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Uploaded images</dt>
                <dd className="num font-semibold">{uploads}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-surface p-3 text-xs leading-relaxed text-muted">
              Back up the whole <span className="font-mono">data</span> folder regularly. It holds every order, product, post and upload.
            </p>
          </Card>

          <Card title="Admin password">
            <ol className="grid list-decimal gap-1.5 pl-4 text-sm text-muted">
              <li>Open <span className="font-mono text-ink">.env.local</span> in the project folder.</li>
              <li>Change <span className="font-mono text-ink">ADMIN_PASSWORD=</span> to a new password.</li>
              <li>Restart the server.</li>
              <li>
                To sign out every device too, also change <span className="font-mono text-ink">ADMIN_SECRET=</span> to a new random value.
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}

function Status({ label, on, hint }: { label: string; on: boolean; hint: string }) {
  return (
    <li>
      <span className="flex items-center justify-between gap-2">
        <span className="font-semibold text-navy">{label}</span>
        <Badge tone={on ? "green" : "orange"}>{on ? "Connected" : "Not set"}</Badge>
      </span>
      <span className="mt-1 block text-xs text-muted">{hint}</span>
    </li>
  );
}
