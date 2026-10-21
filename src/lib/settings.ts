// Live store settings: defaults from lib/site.ts, overridden by rows the admin saved. Server only.
import { db, parse } from "./db";
import { SITE, type SiteSettings } from "./site";

export function getSettings(): SiteSettings {
  const rows = db().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const saved: Partial<SiteSettings> = {};
  for (const r of rows) {
    if (r.key in SITE) (saved as Record<string, unknown>)[r.key] = parse(r.value, undefined);
  }
  return { ...SITE, ...Object.fromEntries(Object.entries(saved).filter(([, v]) => v !== undefined)) };
}

export function saveSettings(patch: Partial<SiteSettings>) {
  const up = db().prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  db().transaction(() => {
    for (const [k, v] of Object.entries(patch)) if (k in SITE && v !== undefined) up.run(k, JSON.stringify(v));
  })();
}
