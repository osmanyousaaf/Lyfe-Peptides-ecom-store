import { dashboard } from "@/lib/dashboard";
import { BarList } from "@/components/admin/charts";
import { Card, Empty, PageHeader, timeAgo } from "@/components/admin/ui";

export default async function MessagesPage() {
  const d = await dashboard(30);
  const topics = new Map<string, number>();
  for (const m of d.messages) topics.set(m.topic, (topics.get(m.topic) ?? 0) + 1);

  return (
    <>
      <PageHeader title="Messages" sub="Requests sent through Lyra on the Contact page" sample={d.sample} range={false} />
      <div className="grid gap-6 px-5 pb-12 pt-4 sm:px-8 xl:grid-cols-[1.4fr_0.6fr]">
        <Card title={`Inbox (${d.messages.length})`}>
          {d.messages.length ? (
            <ul className="space-y-3">
              {d.messages.slice(0, 100).map((m) => (
                <li key={m.email + m.at} className="rounded-xl border border-[#e4e8ef] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[#12233f]">
                      {m.name} <span className="font-normal text-[#5b6b82]">· {m.email}{m.phone ? ` · ${m.phone}` : ""}</span>
                    </p>
                    <span className="text-xs text-[#8d99ab]">{timeAgo(m.at)}</span>
                  </div>
                  <span className="mt-2 inline-block rounded-full bg-[#f1f4f8] px-2.5 py-1 text-xs font-semibold text-[#5b6b82]">{m.topic}</span>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#33445e]">{m.message}</p>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`}
                    className="mt-3 inline-block rounded-lg bg-[#12233f] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Reply by email
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Messages from the Contact page appear here." />
          )}
        </Card>
        <Card title="By topic">
          <BarList items={[...topics.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)} f="int" empty="No messages yet" />
        </Card>
      </div>
    </>
  );
}
