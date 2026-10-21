"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/client";
import { Badge, Card, EmptyState, TableWrap, inputCls, td, th } from "@/components/admin/ui";
import { isUpload } from "@/lib/img";
import { adjustStockAction, restockAction, setLowStockAction, setStockAction } from "@/app/admin/(panel)/inventory/actions";

export type InvRow = {
  key: string;
  kind: "product" | "variant";
  id: number;
  productId: number;
  name: string;
  variant: string | null;
  image: string;
  sku: string | null;
  stock: number | null;
  lowStockAt: number;
  status: string;
  onSale: boolean;
  first: boolean;
  count: number;
};

type Filter = "all" | "low" | "out" | "untracked";

const state = (r: InvRow) => (r.stock === null ? "untracked" : r.stock === 0 ? "out" : r.stock <= r.lowStockAt ? "low" : "ok");

export default function InventoryTable({ rows: initial }: { rows: InvRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [qty, setQty] = useState("10");
  const [pending, start] = useTransition();

  // server data wins whenever the page refreshes
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setRows(initial);
  }

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (t && !`${r.name} ${r.variant ?? ""} ${r.sku ?? ""}`.toLowerCase().includes(t)) return false;
      return filter === "all" || state(r) === filter;
    });
  }, [rows, filter, q]);

  const counts = useMemo(() => {
    const c = { all: rows.length, low: 0, out: 0, untracked: 0 };
    rows.forEach((r) => {
      const s = state(r);
      if (s !== "ok") c[s]++;
    });
    return c;
  }, [rows]);

  const patch = (key: string, p: Partial<InvRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)));
  const patchProduct = (productId: number, p: Partial<InvRow>) => setRows((rs) => rs.map((r) => (r.productId === productId ? { ...r, ...p } : r)));

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>, undo?: () => void) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        undo?.();
        toast(res.message ?? "Couldn't save", "error");
      } else {
        if (res.message) toast(res.message);
        router.refresh();
      }
    });

  const setStock = (r: InvRow, stock: number | null) => {
    const before = r.stock;
    patch(r.key, { stock });
    run(() => setStockAction(r.kind, r.id, stock), () => patch(r.key, { stock: before }));
  };
  const bump = (r: InvRow, d: number) => {
    const before = r.stock;
    patch(r.key, { stock: Math.max(0, (r.stock ?? 0) + d) });
    run(() => adjustStockAction(r.kind, r.id, d), () => patch(r.key, { stock: before }));
  };

  const allShownPicked = shown.length > 0 && shown.every((r) => picked.has(r.key));
  const togglePickAll = () =>
    setPicked((p) => {
      const next = new Set(p);
      shown.forEach((r) => (allShownPicked ? next.delete(r.key) : next.add(r.key)));
      return next;
    });

  const restock = () => {
    const n = parseInt(qty, 10);
    const items = rows.filter((r) => picked.has(r.key)).map((r) => ({ kind: r.kind, id: r.id }));
    run(async () => {
      const res = await restockAction(items, n);
      if (res.ok) setPicked(new Set());
      return res;
    });
  };

  const TABS: { k: Filter; label: string }[] = [
    { k: "all", label: "All" },
    { k: "low", label: "Low" },
    { k: "out", label: "Out" },
    { k: "untracked", label: "Not tracked" },
  ];

  return (
    <Card pad={false}>
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <div className="flex rounded-xl bg-surface p-1" role="tablist">
          {TABS.map(({ k, label }) => (
            <button
              key={k}
              role="tab"
              aria-selected={filter === k}
              onClick={() => setFilter(k)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${filter === k ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}
            >
              {label} <span className="num ml-0.5 text-xs text-faint">{counts[k]}</span>
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, option or SKU" className={`${inputCls} max-w-xs flex-1`} aria-label="Search inventory" />
        {pending && <span className="text-xs font-semibold text-faint">Saving…</span>}
      </div>

      {picked.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-navy px-4 py-3 text-white">
          <span className="text-sm font-bold">{picked.size} selected</span>
          <span className="text-sm text-white/70">Restock by</span>
          <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className="num h-9 w-20 rounded-lg border-0 bg-white px-2.5 text-sm text-ink outline-none" aria-label="Units to add" />
          <button onClick={restock} disabled={pending || !(parseInt(qty, 10) > 0)} className="btn btn-solid btn-sm rounded-lg">
            Add units
          </button>
          <button onClick={() => setPicked(new Set())} className="ml-auto text-sm font-semibold text-white/70 hover:text-white">
            Clear
          </button>
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState title="Nothing here" text={filter === "all" ? "No products match that search." : "Nice: nothing in this state right now."} />
      ) : (
        <TableWrap>
          <table className="w-full min-w-[820px]">
            <thead>
              <tr>
                <th className={`${th} w-10`}>
                  <input type="checkbox" checked={allShownPicked} onChange={togglePickAll} className="h-4 w-4 accent-[var(--navy)]" aria-label="Select all shown" />
                </th>
                <th className={th}>Item</th>
                <th className={th}>SKU</th>
                <th className={th}>State</th>
                <th className={th}>On hand</th>
                <th className={th}>Alert at</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const s = state(r);
                return (
                  <tr
                    key={r.key}
                    className={`border-t border-line transition-colors ${s === "out" ? "bg-red-50/70" : s === "low" ? "bg-accent/[0.06]" : "hover:bg-surface/60"}`}
                  >
                    <td className={td}>
                      <input
                        type="checkbox"
                        checked={picked.has(r.key)}
                        onChange={() => setPicked((p) => {
                          const n = new Set(p);
                          if (n.has(r.key)) n.delete(r.key);
                          else n.add(r.key);
                          return n;
                        })}
                        className="h-4 w-4 accent-[var(--navy)]"
                        aria-label={`Select ${r.name} ${r.variant ?? ""}`}
                      />
                    </td>
                    <td className={td}>
                      <Link href={`/admin/products/${r.productId}`} className="group flex items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                          {r.image && <Image src={r.image} alt="" fill sizes="40px" unoptimized={isUpload(r.image)} className="object-cover mix-blend-multiply" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-navy group-hover:text-accent-deep">{r.name}</span>
                          <span className="block truncate text-xs text-muted">
                            {r.variant ?? "Single item"}
                            {r.status === "draft" && " · draft"}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className={`${td} font-mono text-xs text-muted`}>{r.sku || "—"}</td>
                    <td className={td}>
                      <Badge tone={s === "out" ? "red" : s === "low" ? "orange" : s === "ok" ? "green" : "gray"}>
                        {s === "out" ? "Out" : s === "low" ? "Low" : s === "ok" ? "In stock" : "Not tracked"}
                      </Badge>
                    </td>
                    <td className={td}>
                      {r.stock === null ? (
                        <button onClick={() => setStock(r, 0)} className="text-sm font-semibold text-accent-deep hover:underline">
                          Start tracking
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-xl border border-line bg-white">
                            <button onClick={() => bump(r, -1)} disabled={r.stock === 0} className="grid h-9 w-9 place-items-center rounded-l-xl text-navy hover:bg-surface disabled:opacity-30" aria-label="One fewer">
                              −
                            </button>
                            <StockInput value={r.stock} onCommit={(n) => n !== r.stock && setStock(r, n)} />
                            <button onClick={() => bump(r, 1)} className="grid h-9 w-9 place-items-center rounded-r-xl text-navy hover:bg-surface" aria-label="One more">
                              +
                            </button>
                          </div>
                          <button onClick={() => setStock(r, null)} className="text-xs font-semibold text-faint hover:text-navy" title="Stop tracking: never sells out on its own">
                            Untrack
                          </button>
                        </div>
                      )}
                    </td>
                    <td className={td}>
                      {r.first ? (
                        <LowInput
                          value={r.lowStockAt}
                          note={r.count > 1 ? `all ${r.count}` : undefined}
                          onCommit={(n) => {
                            const before = r.lowStockAt;
                            patchProduct(r.productId, { lowStockAt: n });
                            run(() => setLowStockAction(r.productId, n), () => patchProduct(r.productId, { lowStockAt: before }));
                          }}
                        />
                      ) : (
                        <span className="text-xs text-faint">same</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      )}
    </Card>
  );
}

function StockInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [v, setV] = useState(String(value));
  const [last, setLast] = useState(value);
  if (last !== value) {
    setLast(value);
    setV(String(value));
  }
  const commit = () => {
    const n = parseInt(v, 10);
    if (Number.isInteger(n) && n >= 0) onCommit(n);
    else setV(String(value));
  };
  return (
    <input
      type="number"
      min={0}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
      className="num h-9 w-16 border-x border-line bg-transparent text-center text-sm font-bold text-navy outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      aria-label="Units on hand"
    />
  );
}

function LowInput({ value, note, onCommit }: { value: number; note?: string; onCommit: (n: number) => void }) {
  const [v, setV] = useState(String(value));
  return (
    <span className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          const n = parseInt(v, 10);
          if (Number.isInteger(n) && n >= 0 && n !== value) onCommit(n);
          else setV(String(value));
        }}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className="num h-9 w-16 rounded-lg border border-line bg-white px-2 text-center text-sm outline-none focus:border-navy"
        aria-label="Low-stock alert level"
      />
      {note && <span className="text-xs text-faint">{note}</span>}
    </span>
  );
}
