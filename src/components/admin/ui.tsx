import { Suspense } from "react";
import { RangePicker, SampleControls, SignOut } from "./shell";

export const rangeOf = (v?: string) => (v === "7" ? 7 : v === "90" ? 90 : 30);

export function timeAgo(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export function PageHeader({ title, sub, sample, range = true }: { title: string; sub: string; sample: boolean; range?: boolean }) {
  return (
    <header className="space-y-4 px-5 pb-2 pt-7 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-extrabold tracking-tight text-[#12233f]">{title}</h1>
          <p className="mt-1 text-sm text-[#5b6b82]">{sub}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!sample && <SampleControls on={false} />}
          {range && (
            <Suspense>
              <RangePicker />
            </Suspense>
          )}
          <div className="rounded-xl bg-[#0d1e38] lg:hidden">
            <SignOut />
          </div>
        </div>
      </div>
      {sample && <SampleControls on />}
    </header>
  );
}

export function Card({ title, sub, children, className = "", action }: { title: string; sub?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-[#e4e8ef] bg-white p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-[#12233f]">{title}</h2>
          {sub && <p className="mt-0.5 text-sm text-[#5b6b82]">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const PILL: Record<string, string> = {
  Active: "bg-[#e8f0fb] text-[#1f4f99]",
  Abandoned: "bg-[#fff1e6] text-[#9a3f05]",
  Purchased: "bg-[#e7f6ec] text-[#1f7a3d]",
  Paid: "bg-[#e7f6ec] text-[#1f7a3d]",
  "In stock": "bg-[#e7f6ec] text-[#1f7a3d]",
  "Sold out": "bg-[#fdecec] text-[#b42318]",
};
const DOT: Record<string, string> = { Active: "●", Abandoned: "◐", Purchased: "✓", Paid: "✓", "In stock": "✓", "Sold out": "✕" };

// status pills always carry a symbol + word, never colour alone
export function Pill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${PILL[status] ?? "bg-[#eef1f5] text-[#5b6b82]"}`}>
      <span aria-hidden>{DOT[status] ?? "•"}</span>
      {status}
    </span>
  );
}

export const money = (cents: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);

export function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-[#d5dce6] px-4 py-10 text-center text-sm text-[#8d99ab]">{text}</p>;
}
