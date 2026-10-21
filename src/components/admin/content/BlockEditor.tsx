"use client";

import { useRef } from "react";
import type { AnimKey, Block } from "@/lib/blog";
import { MINI_ANIMS, type MiniAnim as MiniKey } from "@/lib/blog-mini";
import { inputCls, textareaCls } from "@/components/admin/ui";
import MiniAnim from "@/components/blog/mini/Mini";
// the mini animations' keyframes, for the live previews
import "@/app/(store)/blog/blog.css";

// Blocks carry a client-only key so React keeps focus while reordering.
export type EditBlock = Block & { key: string };

export const ANIM_OPTIONS: { value: AnimKey; label: string }[] = [
  { value: "vial", label: "Vial (powder dissolving)" },
  { value: "pen", label: "Dual chamber pen" },
  { value: "hplc", label: "HPLC chromatogram" },
  { value: "coa", label: "COA scan" },
  { value: "storage", label: "Cold storage" },
];

export const RUO_BLOCK: Block = {
  type: "callout",
  tone: "warn",
  title: "For research use only",
  text: "Lyfe Peptides products are sold as laboratory reference materials. They are not for human or animal consumption and are not approved by Health Canada for personal use. Nothing in this article is medical advice.",
};

const ADD: { type: Block["type"]; label: string; make: () => Block }[] = [
  { type: "summary", label: "Summary", make: () => ({ type: "summary", text: "" }) },
  { type: "point", label: "Key point", make: () => ({ type: "point", title: "", text: "", anim: "purity-peak" }) },
  { type: "h2", label: "Heading", make: () => ({ type: "h2", id: "", text: "" }) },
  { type: "p", label: "Paragraph", make: () => ({ type: "p", text: "" }) },
  { type: "ul", label: "Bullet list", make: () => ({ type: "ul", items: [""] }) },
  { type: "ol", label: "Numbered list", make: () => ({ type: "ol", items: [""] }) },
  { type: "callout", label: "Callout", make: () => ({ type: "callout", tone: "note", title: "", text: "" }) },
  { type: "figure", label: "Animation", make: () => ({ type: "figure", anim: "hplc", caption: "" }) },
  { type: "table", label: "Table", make: () => ({ type: "table", head: ["Column 1", "Column 2"], rows: [["", ""]] }) },
];

const LABEL: Record<Block["type"], string> = {
  summary: "Summary",
  point: "Key point",
  h2: "Heading",
  p: "Paragraph",
  ul: "Bullet list",
  ol: "Numbered list",
  callout: "Callout",
  figure: "Animation",
  table: "Table",
};

let seq = 0;
export const withKey = (b: Block): EditBlock => ({ ...b, key: `b${Date.now().toString(36)}${++seq}` });

export default function BlockEditor({ blocks, onChange, error }: { blocks: EditBlock[]; onChange: (b: EditBlock[]) => void; error?: string }) {
  const listRef = useRef<HTMLOListElement>(null);

  const update = (i: number, patch: Partial<Block>) =>
    onChange(blocks.map((b, j) => (j === i ? ({ ...b, ...patch } as EditBlock) : b)));
  const remove = (i: number) => onChange(blocks.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const next = blocks.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const insert = (at: number, b: Block) => {
    const next = blocks.slice();
    next.splice(at, 0, withKey(b));
    onChange(next);
    // focus the new block's first field
    requestAnimationFrame(() => {
      listRef.current?.children[at]?.querySelector<HTMLElement>("input, textarea, select")?.focus();
    });
  };

  return (
    <div>
      {blocks.length === 0 && (
        <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          The article is empty. Add a heading or paragraph to start.
        </p>
      )}
      <ol ref={listRef} className="grid gap-3">
        {blocks.map((b, i) => (
          <li key={b.key} className="group rounded-2xl border border-line bg-white transition focus-within:border-navy/40 focus-within:shadow-[0_10px_30px_-22px_rgb(19_41_75/0.6)]">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2">
              <span className="num grid h-6 min-w-6 place-items-center rounded-md bg-surface px-1 text-[0.6875rem] font-bold text-muted">{i + 1}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-faint">{LABEL[b.type]}</span>
              {b.type === "h2" && b.text && <span className="truncate text-xs text-faint">#{slug(b.text)}</span>}
              <span className="ml-auto flex items-center gap-1">
                <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</IconBtn>
                <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}>↓</IconBtn>
                <IconBtn label="Delete block" onClick={() => remove(i)} danger>✕</IconBtn>
              </span>
            </div>
            <div className="p-3">
              <BlockFields block={b} onChange={(patch) => update(i, patch)} />
            </div>
          </li>
        ))}
      </ol>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface/60 p-3">
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-faint">Add block</p>
        <div className="flex flex-wrap gap-2">
          {ADD.map((a) => (
            <button key={a.type} type="button" onClick={() => insert(blocks.length, a.make())} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy transition hover:border-navy">
              + {a.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => insert(blocks.length, RUO_BLOCK)}
            className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent-deep transition hover:border-accent"
          >
            + &ldquo;Research use only&rdquo; notice
          </button>
        </div>
        <p className="mt-2 px-1 text-xs text-muted">Wrap words in **double asterisks** for bold. Links aren&rsquo;t supported inside blocks.</p>
      </div>
    </div>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-lg text-sm font-bold transition disabled:opacity-25 ${
        danger ? "text-faint hover:bg-red-50 hover:text-red-600" : "text-muted hover:bg-surface hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}

// grow a textarea with its content
const grow = (e: React.FormEvent<HTMLTextAreaElement>) => {
  const t = e.currentTarget;
  t.style.height = "auto";
  t.style.height = `${t.scrollHeight + 2}px`;
};

function BlockFields({ block: b, onChange }: { block: EditBlock; onChange: (patch: Partial<Block>) => void }) {
  switch (b.type) {
    case "summary":
      return (
        <textarea value={b.text} onChange={(e) => onChange({ text: e.target.value })} onInput={grow} rows={2} placeholder="The article in one or two sentences" className={textareaCls} />
      );
    case "point":
      return (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
          <div className="grid content-start gap-2">
            <input value={b.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Key point title" className={`${inputCls} font-bold text-navy`} />
            <textarea value={b.text} onChange={(e) => onChange({ text: e.target.value })} onInput={grow} rows={3} placeholder="One to three short sentences" className={textareaCls} />
            <MiniPicker value={b.anim} onChange={(anim) => onChange({ anim })} />
          </div>
          <div className="aspect-square rounded-xl bg-surface p-2" aria-hidden>
            <MiniAnim anim={b.anim} />
          </div>
        </div>
      );
    case "h2":
      return <input value={b.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Section heading" className={`${inputCls} text-base font-bold text-navy`} />;
    case "p":
      return <textarea value={b.text} onChange={(e) => onChange({ text: e.target.value })} onInput={grow} rows={4} placeholder="Write a paragraph…" className={textareaCls} />;
    case "ul":
    case "ol":
      return <ListFields items={b.items} ordered={b.type === "ol"} onChange={(items) => onChange({ items })} />;
    case "callout":
      return (
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            {(["note", "tip", "warn"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={b.tone === t}
                onClick={() => onChange({ tone: t })}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  b.tone === t ? (t === "warn" ? "bg-accent text-white" : t === "tip" ? "bg-green text-white" : "bg-navy text-white") : "bg-surface text-muted hover:text-navy"
                }`}
              >
                {t === "note" ? "Note" : t === "tip" ? "Tip" : "Warning"}
              </button>
            ))}
          </div>
          <input value={b.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Callout title" className={`${inputCls} font-semibold`} />
          <textarea value={b.text} onChange={(e) => onChange({ text: e.target.value })} onInput={grow} rows={3} placeholder="Callout text" className={textareaCls} />
        </div>
      );
    case "figure":
      return (
        <div className="grid gap-2 sm:grid-cols-[220px_1fr]">
          <select value={b.anim} onChange={(e) => onChange({ anim: e.target.value as AnimKey })} className={inputCls}>
            {ANIM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input value={b.caption} onChange={(e) => onChange({ caption: e.target.value })} placeholder="Caption under the animation" className={inputCls} />
        </div>
      );
    case "table":
      return <TableFields head={b.head} rows={b.rows} onChange={(head, rows) => onChange({ head, rows })} />;
  }
}

// small previews of every mini animation; the chosen one is outlined
function MiniPicker({ value, onChange }: { value: MiniKey; onChange: (k: MiniKey) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-bold uppercase tracking-wider text-faint">Animation</legend>
      <div className="flex flex-wrap gap-1.5">
        {MINI_ANIMS.map((m) => (
          <button
            key={m.key}
            type="button"
            title={m.label}
            aria-label={m.label}
            aria-pressed={value === m.key}
            onClick={() => onChange(m.key)}
            className={`h-11 w-11 rounded-lg border bg-white p-0.5 transition ${value === m.key ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-navy/40"}`}
          >
            <MiniAnim anim={m.key} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ListFields({ items, ordered, onChange }: { items: string[]; ordered: boolean; onChange: (items: string[]) => void }) {
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  return (
    <div className="grid gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="num mt-3 w-5 shrink-0 text-right text-xs font-bold text-faint">{ordered ? `${i + 1}.` : "•"}</span>
          <input
            value={it}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const next = items.slice();
                next.splice(i + 1, 0, "");
                onChange(next);
                const row = e.currentTarget.parentElement;
                requestAnimationFrame(() => row?.nextElementSibling?.querySelector("input")?.focus());
              } else if (e.key === "Backspace" && !it && items.length > 1) {
                e.preventDefault();
                const row = e.currentTarget.parentElement;
                onChange(items.filter((_, j) => j !== i));
                requestAnimationFrame(() => row?.previousElementSibling?.querySelector("input")?.focus());
              }
            }}
            placeholder="List item"
            className={inputCls}
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} disabled={items.length === 1} className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-faint hover:bg-red-50 hover:text-red-600 disabled:opacity-25" aria-label="Remove item">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="ml-7 justify-self-start text-xs font-bold text-accent-deep hover:underline">
        + Add item <span className="font-normal text-faint">(or press Enter)</span>
      </button>
    </div>
  );
}

function TableFields({ head, rows, onChange }: { head: string[]; rows: string[][]; onChange: (head: string[], rows: string[][]) => void }) {
  const cols = head.length;
  return (
    <div className="grid gap-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-1">
          <thead>
            <tr>
              {head.map((h, c) => (
                <th key={c} className="p-0">
                  <input value={h} onChange={(e) => onChange(head.map((x, j) => (j === c ? e.target.value : x)), rows)} placeholder={`Header ${c + 1}`} className={`${inputCls} h-9 bg-surface font-bold`} />
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {head.map((_, c) => (
                  <td key={c} className="p-0">
                    <input
                      value={r[c] ?? ""}
                      onChange={(e) => onChange(head, rows.map((row, j) => (j === ri ? head.map((__, k) => (k === c ? e.target.value : row[k] ?? "")) : row)))}
                      className={`${inputCls} h-9`}
                    />
                  </td>
                ))}
                <td className="p-0">
                  <button type="button" onClick={() => onChange(head, rows.filter((_, j) => j !== ri))} className="grid h-9 w-8 place-items-center rounded-lg text-faint hover:bg-red-50 hover:text-red-600" aria-label="Remove row">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 text-xs font-bold">
        <button type="button" onClick={() => onChange(head, [...rows, head.map(() => "")])} className="text-accent-deep hover:underline">+ Row</button>
        <button type="button" disabled={cols >= 8} onClick={() => onChange([...head, `Column ${cols + 1}`], rows.map((r) => [...r, ""]))} className="text-accent-deep hover:underline disabled:opacity-40">+ Column</button>
        <button type="button" disabled={cols <= 1} onClick={() => onChange(head.slice(0, -1), rows.map((r) => r.slice(0, cols - 1)))} className="text-muted hover:underline disabled:opacity-40">− Last column</button>
      </div>
    </div>
  );
}
