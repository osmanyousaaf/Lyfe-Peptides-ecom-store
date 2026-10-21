import Link from "next/link";
import type { Metadata } from "next";
import { Badge, Card, EmptyState, PageHeader, formatDate, inputCls, type Tone } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import MarkRead from "@/components/admin/content/MarkRead";
import { getMessage, listMessages, messageCounts, TOPICS, type MessageStatus, type Topic } from "@/lib/inbox";
import { flag, placeLabel } from "@/lib/geo";
import { deleteMessageAction, setMessageStatusAction } from "./actions";

export const metadata: Metadata = { title: "Messages" };

const TABS: { id: MessageStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "archived", label: "Archived" },
];
const TOPIC_TONE: Record<Topic, Tone> = { order: "orange", product: "blue", coa: "violet", wholesale: "green", other: "gray" };

export default async function Messages({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; id?: string }> }) {
  const sp = await searchParams;
  const status: MessageStatus = sp.status === "read" || sp.status === "archived" ? sp.status : "new";
  const q = sp.q ?? "";
  const list = listMessages(status, q);
  const counts = messageCounts();
  const selected = sp.id ? getMessage(Number(sp.id)) : undefined;

  const href = (p: { status?: MessageStatus; id?: number }) => {
    const u = new URLSearchParams();
    const s = p.status ?? status;
    if (s !== "new") u.set("status", s);
    if (q && !p.status) u.set("q", q);
    if (p.id) u.set("id", String(p.id));
    return `/admin/messages${u.size ? `?${u}` : ""}`;
  };
  const here = href({ id: selected?.id });
  const listHref = href({});

  return (
    <>
      <PageHeader title="Messages" description="Everything sent through the contact form." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <nav className="flex gap-1 rounded-xl border border-line bg-white p-1" aria-label="Folders">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={href({ status: t.id })}
              aria-current={status === t.id ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${status === t.id ? "bg-navy text-white" : "text-muted hover:text-navy"}`}
            >
              {t.label}
              <span className={`num rounded-full px-1.5 text-xs ${t.id === "new" && counts.new > 0 && status !== "new" ? "bg-accent text-white" : "opacity-70"}`}>{counts[t.id]}</span>
            </Link>
          ))}
        </nav>
        <form className="ml-auto flex gap-2" role="search">
          {status !== "new" && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Search name, email, text…" className={`${inputCls} h-10 w-64`} aria-label="Search messages" />
          <button className="btn btn-line btn-sm h-10">Search</button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* list: hidden on small screens while a message is open */}
        <Card pad={false} className={selected ? "hidden lg:block" : ""}>
          {list.length === 0 ? (
            <EmptyState
              title={q ? "No messages match" : status === "new" ? "Inbox zero" : `No ${status} messages`}
              text={q ? "Try a different search." : status === "new" ? "New contact-form messages land here." : undefined}
            />
          ) : (
            <ul className="max-h-[70dvh] divide-y divide-line overflow-y-auto">
              {list.map((m) => {
                const on = selected?.id === m.id;
                return (
                  <li key={m.id}>
                    <Link href={href({ id: m.id })} className={`block px-4 py-3.5 transition ${on ? "bg-navy/[0.05]" : "hover:bg-surface"}`} aria-current={on ? "true" : undefined}>
                      <span className="flex items-center gap-2">
                        {m.status === "new" && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                        <span className={`min-w-0 flex-1 truncate text-sm ${m.status === "new" ? "font-extrabold text-navy" : "font-semibold text-ink"}`}>{m.name || m.email}</span>
                        <span className="num shrink-0 text-xs text-faint">{formatDate(m.createdAt)}</span>
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <Badge tone={TOPIC_TONE[m.topic]}>{TOPICS[m.topic]}</Badge>
                        <span className="min-w-0 flex-1 truncate text-xs text-muted">{m.body}</span>
                        <span className="shrink-0 text-sm leading-none" title={placeLabel(m)} aria-label={placeLabel(m)}>
                          {flag(m.country)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* detail */}
        {selected ? (
          <Card pad={false}>
            {selected.status === "new" && <MarkRead id={selected.id} />}
            <div className="border-b border-line p-5">
              <Link href={listHref} className="mb-3 inline-flex text-sm font-semibold text-muted hover:text-navy lg:hidden">
                ← Back to list
              </Link>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge tone={TOPIC_TONE[selected.topic]}>{TOPICS[selected.topic]}</Badge>
                  <h2 className="mt-2 text-xl font-extrabold text-navy">{selected.name || "No name"}</h2>
                  <a href={`mailto:${selected.email}`} className="break-all text-sm font-semibold text-accent-deep hover:underline">
                    {selected.email}
                  </a>
                </div>
                <div className="text-right">
                  <p className="num text-sm text-muted">{formatDate(selected.createdAt, true)}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-navy" title="Looked up from the sender's connection when the message was sent">
                    <span aria-hidden>{flag(selected.country)}</span> {placeLabel(selected)}
                  </p>
                </div>
              </div>
              {selected.orderNumber && (
                <p className="mt-3 text-sm">
                  <span className="text-muted">Order number: </span>
                  <Link href={`/admin/orders?q=${encodeURIComponent(selected.orderNumber)}`} className="num font-bold text-navy hover:underline">
                    {selected.orderNumber}
                  </Link>
                </p>
              )}
            </div>
            <p className="whitespace-pre-wrap break-words p-5 text-[0.9375rem] leading-relaxed text-ink">{selected.body}</p>
            <div className="flex flex-wrap gap-2 border-t border-line p-4">
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: your message to Lyfe Peptides${selected.orderNumber ? ` (order ${selected.orderNumber})` : ""}`)}&body=${encodeURIComponent(`Hi ${selected.name.split(" ")[0] || "there"},\n\n\n\n> ${selected.body.split("\n").join("\n> ")}`)}`}
                className="btn btn-solid btn-sm"
              >
                Reply by email
              </a>
              {/* marking unread goes back to the list, or reopening would mark it read again */}
              <StatusButton id={selected.id} status={selected.status === "read" ? "new" : "read"} back={selected.status === "read" ? listHref : here}>
                {selected.status === "read" ? "Mark unread" : "Mark read"}
              </StatusButton>
              <StatusButton id={selected.id} status={selected.status === "archived" ? "read" : "archived"} back={selected.status === "archived" ? here : listHref}>
                {selected.status === "archived" ? "Move to inbox" : "Archive"}
              </StatusButton>
              <form action={deleteMessageAction} className="ml-auto">
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="back" value={listHref} />
                <ConfirmButton confirm="Delete this message for good?" className="btn btn-line btn-sm text-red-600 hover:border-red-600">
                  Delete
                </ConfirmButton>
              </form>
            </div>
          </Card>
        ) : (
          <Card className="hidden lg:block">
            <EmptyState title="Select a message" text="Pick a message on the left to read it and reply." />
          </Card>
        )}
      </div>
    </>
  );
}

function StatusButton({ id, status, back, children }: { id: number; status: MessageStatus; back: string; children: React.ReactNode }) {
  return (
    <form action={setMessageStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="back" value={back} />
      <button className="btn btn-line btn-sm">{children}</button>
    </form>
  );
}
