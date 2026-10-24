"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Overview", icon: "M4 13h6V4H4zM14 20h6V11h-6zM4 20h6v-4H4zM14 7h6V4h-6z" },
  { href: "/admin/orders", label: "Orders", icon: "M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0" },
  { href: "/admin/products", label: "Products", icon: "M12 3l8 4v10l-8 4-8-4V7zM4 7l8 4 8-4M12 11v10" },
  { href: "/admin/carts", label: "Carts", icon: "M3 4h2l2.3 11h10.4L20 8H6M10 20h.01M17 20h.01" },
  { href: "/admin/audience", label: "Audience", icon: "M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18" },
  { href: "/admin/customers", label: "Customers", icon: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2-2.8M4 19v-1a3 3 0 0 1 2-2.8" },
  { href: "/admin/messages", label: "Messages", icon: "M4 5h16v11H9l-5 4z" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function Sidebar({ counts }: { counts: Record<string, number> }) {
  const path = usePathname();
  const range = useSearchParams().get("range");
  const q = range ? `?range=${range}` : "";
  return (
    <aside className="flex flex-col bg-[#0d1e38] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64">
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white">
          <Image src="/lyfe-logo.png" alt="" width={48} height={32} className="h-6 w-auto" />
        </span>
        <span className="leading-tight">
          <span className="block font-extrabold tracking-tight">Lyfe Admin</span>
          <span className="block text-xs text-white/50">Store dashboard</span>
        </span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible" aria-label="Admin">
        {NAV.map((n) => {
          const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
          const badge = counts[n.label];
          return (
            <Link
              key={n.href}
              href={n.href + q}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                active ? "bg-white/10 text-white shadow-[inset_3px_0_0_#f26a12]" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon d={n.icon} />
              {n.label}
              {badge ? <span className="num ml-auto rounded-full bg-[#f26a12] px-2 py-0.5 text-[0.6875rem] font-bold text-white">{badge}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-white/10 p-4 lg:block">
        <Link href="/" target="_blank" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">
          View storefront <span aria-hidden>↗</span>
        </Link>
        <SignOut />
      </div>
    </aside>
  );
}

export function SignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-white/60 hover:bg-white/5 hover:text-white"
    >
      Sign out
    </button>
  );
}

export function RangePicker() {
  const path = usePathname();
  const range = useSearchParams().get("range") ?? "30";
  return (
    <div className="flex rounded-xl border border-[#e4e8ef] bg-white p-1 text-sm font-semibold" role="group" aria-label="Date range">
      {[
        ["7", "7 days"],
        ["30", "30 days"],
        ["90", "90 days"],
      ].map(([v, l]) => (
        <Link key={v} href={`${path}?range=${v}`} aria-current={range === v ? "true" : undefined} className={`rounded-lg px-3 py-1.5 transition ${range === v ? "bg-[#12233f] text-white" : "text-[#5b6b82] hover:text-[#12233f]"}`}>
          {l}
        </Link>
      ))}
    </div>
  );
}

export function SampleControls({ on }: { on: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async (action: "load" | "clear") => {
    setBusy(true);
    await fetch("/api/admin/sample", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setBusy(false);
    router.refresh();
  };
  return on ? (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f5c99f] bg-[#fff4ea] px-5 py-3 text-sm">
      <p className="text-[#8a3b06]">
        <strong>Showing sample data.</strong> These figures are generated for preview and are not real orders or visitors.
      </p>
      <button type="button" disabled={busy} onClick={() => run("clear")} className="rounded-lg bg-[#8a3b06] px-3 py-1.5 font-semibold text-white disabled:opacity-50">
        {busy ? "Clearing…" : "Clear sample data"}
      </button>
    </div>
  ) : (
    <button type="button" disabled={busy} onClick={() => run("load")} className="rounded-xl border border-dashed border-[#c9d3e0] bg-white px-3 py-2 text-sm font-semibold text-[#5b6b82] hover:border-[#12233f] hover:text-[#12233f] disabled:opacity-50">
      {busy ? "Loading…" : "Load sample data"}
    </button>
  );
}
