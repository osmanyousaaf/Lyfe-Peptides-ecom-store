"use client";

import { useEffect, useState } from "react";
import type { LiveData } from "@/lib/analytics-view";

const POLL_MS = 5000;

const ago = (s: number) => (s < 10 ? "just now" : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`);

// "N visitors right now", refreshed every few seconds while the tab is open
export default function LivePanel({ initial, compact = false }: { initial: LiveData; compact?: boolean }) {
  const [data, setData] = useState(initial);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/admin/analytics/live", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const next = (await res.json()) as LiveData;
        if (alive) {
          setData(next);
          setStale(false);
        }
      } catch {
        if (alive) setStale(true);
      }
    };
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const count = data.count;

  if (compact) {
    return (
      <span className="flex items-center gap-2.5">
        <Pulse on={count > 0} />
        <span className="num text-[1.75rem] font-extrabold leading-none text-navy">{count}</span>
        <span className="text-sm font-semibold text-muted">{count === 1 ? "visitor" : "visitors"} on the site now</span>
      </span>
    );
  }

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-navy p-5 text-white sm:p-6" aria-live="polite">
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <span className="orb -right-16 -top-16 h-56 w-56 bg-accent/30" aria-hidden />
      <div className="relative flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
          <Pulse on={count > 0} dark /> Live now
        </p>
        <p className="text-[0.6875rem] text-white/45">{stale ? "Reconnecting…" : "Updates every 5s"}</p>
      </div>

      <p className="relative mt-4 flex items-baseline gap-3">
        <span key={count} className="num rise text-[3.5rem] font-extrabold leading-none tracking-tight [animation-duration:400ms]">
          {count}
        </span>
        <span className="text-sm font-semibold text-white/70">
          {count === 1 ? "visitor" : "visitors"} on the site right now
        </span>
      </p>
      <p className="relative mt-1 text-xs text-white/50">
        <span className="num font-semibold text-white/80">{data.viewsLast30m}</span> page views in the last 30 minutes
      </p>

      <div className="relative mt-5 flex-1">
        {data.visitors.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
            Nobody is browsing at the moment. Open the store in another tab and you&rsquo;ll appear here within seconds.
          </p>
        ) : (
          <ul className="noscroll grid max-h-[260px] grid-cols-[minmax(0,1fr)] gap-1.5 overflow-y-auto">
            {data.visitors.map((v, i) => (
              <li key={`${v.path}-${i}`} className="rise flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2 [animation-duration:300ms]">
                <span className="text-lg leading-none" aria-hidden>{v.flag}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{v.path}</span>
                  <span className="block truncate text-xs text-white/55">
                    {v.place} · {v.device}
                  </span>
                </span>
                <span className="shrink-0 text-[0.6875rem] text-white/45">{ago(v.secondsAgo)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Pulse({ on, dark = false }: { on: boolean; dark?: boolean }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {on && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75" />}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${on ? "bg-accent" : dark ? "bg-white/30" : "bg-faint"}`} />
    </span>
  );
}
