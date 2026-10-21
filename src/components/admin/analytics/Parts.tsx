// Server-rendered analytics pieces: bar lists, the province tile map and the funnel.

// sequential navy ramp, light → dark, for magnitude only; white text from step 4 up
const RAMP = ["#eef3f9", "#d6e2f0", "#adc4e0", "#7d9fcb", "#4f78ad", "#2b5288", "#13294b"];
const rampStep = (v: number, max: number) => (v <= 0 || max <= 0 ? -1 : Math.min(RAMP.length - 1, Math.ceil((v / max) * (RAMP.length - 1))));

export type BarRow = { key: string; label: React.ReactNode; value: number; sub?: React.ReactNode; title?: string };

// a ranked list with thin proportional bars; the number, not the color, carries the value
export function BarList({ rows, empty, unit }: { rows: BarRow[]; empty: string; unit?: string }) {
  if (!rows.length) return <p className="px-5 py-6 text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((n, r) => n + r.value, 0);
  return (
    <ol className="grid gap-1 px-3 py-3">
      {rows.map((r) => (
        <li key={r.key} className="group rounded-xl px-2 py-1.5 transition hover:bg-surface" title={r.title}>
          <div className="flex items-baseline gap-3">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{r.label}</span>
            {r.sub != null && <span className="hidden shrink-0 text-xs text-faint sm:inline">{r.sub}</span>}
            <span className="num w-14 shrink-0 text-right text-sm font-bold text-navy">{r.value.toLocaleString("en-CA")}</span>
            <span className="num w-10 shrink-0 text-right text-xs text-faint">{Math.round((r.value / total) * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-surface-2/70">
            <div className="h-full rounded-full bg-accent/80 transition-[width] duration-700 group-hover:bg-accent" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
          {unit && <span className="sr-only">{unit}</span>}
        </li>
      ))}
    </ol>
  );
}

// provinces and territories laid out roughly where they sit on the map
const TILES: { code: string; name: string; col: number; row: number }[] = [
  { code: "YT", name: "Yukon", col: 0, row: 0 },
  { code: "NT", name: "Northwest Territories", col: 1, row: 0 },
  { code: "NU", name: "Nunavut", col: 2, row: 0 },
  { code: "NL", name: "Newfoundland and Labrador", col: 6, row: 0 },
  { code: "BC", name: "British Columbia", col: 0, row: 1 },
  { code: "AB", name: "Alberta", col: 1, row: 1 },
  { code: "SK", name: "Saskatchewan", col: 2, row: 1 },
  { code: "MB", name: "Manitoba", col: 3, row: 1 },
  { code: "ON", name: "Ontario", col: 4, row: 1 },
  { code: "QC", name: "Quebec", col: 5, row: 1 },
  { code: "PE", name: "Prince Edward Island", col: 6, row: 1 },
  { code: "NB", name: "New Brunswick", col: 5, row: 2 },
  { code: "NS", name: "Nova Scotia", col: 6, row: 2 },
];

export function ProvinceMap({ counts }: { counts: Record<string, number> }) {
  const max = Math.max(0, ...Object.values(counts));
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5" role="img" aria-label="Visitors by province, as a tile map">
        {TILES.map((t) => {
          const v = counts[t.code] ?? 0;
          const s = rampStep(v, max);
          const dark = s >= 4;
          return (
            <div
              key={t.code}
              title={`${t.name}: ${v} visitor${v === 1 ? "" : "s"}`}
              className="group relative flex aspect-square flex-col items-center justify-center rounded-xl text-center ring-1 ring-inset ring-black/5 transition duration-300 hover:z-10 hover:scale-110 hover:shadow-lg"
              style={{
                gridColumn: t.col + 1,
                gridRow: t.row + 1,
                background: s < 0 ? "#f4f7fb" : RAMP[s],
                color: dark ? "#ffffff" : "var(--navy)",
              }}
            >
              <span className="text-[0.6875rem] font-extrabold tracking-wide sm:text-xs">{t.code}</span>
              <span className={`num text-[0.625rem] sm:text-[0.6875rem] ${s < 0 ? "text-faint" : dark ? "text-white/85" : "text-navy/70"}`}>{v}</span>
            </div>
          );
        })}
      </div>
      {/* sequential key */}
      <div className="mt-3 flex items-center gap-2 text-[0.6875rem] text-muted">
        <span>Fewer</span>
        <span className="flex h-2 flex-1 overflow-hidden rounded-full">
          {RAMP.map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </span>
        <span>More{max > 0 ? ` (${max})` : ""}</span>
      </div>
    </div>
  );
}

// each step's share of the first, with the drop from the step before
export function FunnelChart({ steps }: { steps: { step: string; value: number }[] }) {
  const top = steps[0]?.value ?? 0;
  return (
    <ol className="grid gap-2.5">
      {steps.map((s, i) => {
        const pct = top ? (s.value / top) * 100 : 0;
        const prev = i > 0 ? steps[i - 1].value : null;
        const drop = prev ? Math.round(((prev - s.value) / prev) * 100) : null;
        return (
          <li key={s.step}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-navy">
                <span className="num mr-2 text-xs font-bold text-faint">{i + 1}</span>
                {s.step}
              </span>
              <span className="flex items-baseline gap-2">
                {drop != null && drop > 0 && <span className="text-xs font-semibold text-red-600">−{drop}%</span>}
                <span className="num font-bold text-navy">{s.value.toLocaleString("en-CA")}</span>
              </span>
            </div>
            <div className="h-7 overflow-hidden rounded-lg bg-surface">
              <div
                className="flex h-full items-center rounded-lg bg-navy px-2 text-[0.6875rem] font-bold text-white transition-[width] duration-700"
                style={{ width: `${Math.max(top ? 3 : 0, pct)}%`, opacity: 1 - i * 0.12 }}
              >
                {pct >= 12 && `${Math.round(pct)}%`}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// a signed change; for bounce rate (and anything where lower is better) pass `lowerIsBetter`
export function Delta({ now, before, lowerIsBetter = false }: { now: number; before: number; lowerIsBetter?: boolean }) {
  if (now === 0 && before === 0) return <span className="text-xs text-faint">No change</span>;
  if (before === 0) return <span className="text-xs font-semibold text-green">▲ New this period</span>;
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return <span className="text-xs text-faint">Same as before</span>;
  const good = lowerIsBetter ? pct < 0 : pct > 0;
  return (
    <span className={`text-xs font-semibold ${good ? "text-green" : "text-red-600"}`}>
      {pct > 0 ? "▲" : "▼"} {Math.abs(pct)}% <span className="font-normal text-muted">vs previous</span>
    </span>
  );
}
