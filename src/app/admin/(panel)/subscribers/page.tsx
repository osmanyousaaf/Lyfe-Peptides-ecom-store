import Link from "next/link";
import type { Metadata } from "next";
import { Badge, Card, EmptyState, Field, PageHeader, Stat, TableWrap, formatDate, inputCls, td, th, tr } from "@/components/admin/ui";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/client";
import { listSubscribers, subscriberCounts, type Subscriber } from "@/lib/subscribers";
import { flag, placeLabel, regionName, countryName } from "@/lib/geo";
import { addSubscriberAction, deleteSubscriberAction, toggleSubscriberAction } from "./actions";

export const metadata: Metadata = { title: "Subscribers" };

type Filter = "active" | "unsubscribed" | "all";

// "CA:ON" for a province or state, "CA" for a country, "unknown" when no region was found
const placeKey = (s: Pick<Subscriber, "country" | "region">) => (!s.country ? "unknown" : s.region ? `${s.country}:${s.region}` : s.country);
const placeName = (key: string) => {
  if (key === "unknown") return "Local / unknown";
  const [c, r] = key.split(":");
  return r ? `${regionName(c, r)}, ${countryName(c)}` : countryName(c);
};

export default async function Subscribers({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string; place?: string }> }) {
  const sp = await searchParams;
  const filter: Filter = sp.filter === "unsubscribed" || sp.filter === "all" ? sp.filter : "active";
  const q = sp.q ?? "";
  const place = sp.place ?? "";
  const all = listSubscribers(filter, q);
  const list = place ? all.filter((s) => placeKey(s) === place) : all;
  // where active subscribers signed up from
  const places = [...listSubscribers("active").reduce((m, s) => m.set(placeKey(s), (m.get(placeKey(s)) ?? 0) + 1), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const counts = subscriberCounts();
  const recent = listSubscribers("active").filter((s) => Date.now() - Date.parse(`${s.createdAt.replace(" ", "T")}Z`) < 30 * 86400_000).length;
  const tab = (f: Filter) => `/admin/subscribers${f === "active" ? "" : `?filter=${f}`}`;
  const placeHref = (k: string) => {
    const u = new URLSearchParams();
    if (filter !== "active") u.set("filter", filter);
    if (k && k !== place) u.set("place", k);
    return `/admin/subscribers${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="Newsletter sign-ups from the store. Export them to your email tool."
        actions={
          <a href={`/api/admin/subscribers/export?filter=${filter}`} className="btn btn-line btn-sm">
            Export CSV
          </a>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Active" value={counts.active} tone="green" />
        <Stat label="New in 30 days" value={recent} />
        <Stat label="Unsubscribed" value={counts.unsubscribed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <nav className="flex gap-1 rounded-xl border border-line bg-white p-1" aria-label="Filter">
              {(["active", "unsubscribed", "all"] as const).map((f) => (
                <Link
                  key={f}
                  href={tab(f)}
                  aria-current={filter === f ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition ${filter === f ? "bg-navy text-white" : "text-muted hover:text-navy"}`}
                >
                  {f}
                </Link>
              ))}
            </nav>
            <form className="ml-auto flex gap-2" role="search">
              {filter !== "active" && <input type="hidden" name="filter" value={filter} />}
              {place && <input type="hidden" name="place" value={place} />}
              <input name="q" defaultValue={q} placeholder="Search email…" className={`${inputCls} h-10 w-56`} aria-label="Search subscribers" />
              <button className="btn btn-line btn-sm h-10">Search</button>
            </form>
          </div>

          {place && (
            <p className="mb-3 flex items-center gap-2 text-sm text-muted">
              Showing subscribers from <span className="font-bold text-navy">{placeName(place)}</span>
              <Link href={placeHref("")} className="font-semibold text-accent-deep hover:underline">
                Clear
              </Link>
            </p>
          )}
          <Card pad={false}>
            {list.length === 0 ? (
              <EmptyState title={q ? "No subscribers match" : "No subscribers here yet"} text={q ? undefined : "Sign-ups from the newsletter form appear here."} />
            ) : (
              <TableWrap>
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr>
                      <th className={th}>Email</th>
                      <th className={th}>Status</th>
                      <th className={th}>Source</th>
                      <th className={th}>Region</th>
                      <th className={th}>Joined</th>
                      <th className={`${th} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((s) => (
                      <tr key={s.id} className={tr}>
                        <td className={`${td} break-all font-semibold text-navy`}>{s.email}</td>
                        <td className={td}>{s.unsubscribedAt ? <Badge>Unsubscribed</Badge> : <Badge tone="green">Active</Badge>}</td>
                        <td className={`${td} capitalize text-muted`}>{s.source}</td>
                        <td className={`${td} whitespace-nowrap text-muted`}>
                          <span className="mr-1.5" aria-hidden>{flag(s.country)}</span>
                          {placeLabel(s)}
                        </td>
                        <td className={`${td} num whitespace-nowrap text-muted`}>{formatDate(s.createdAt)}</td>
                        <td className={`${td} text-right`}>
                          <div className="flex justify-end gap-1.5">
                            <form action={toggleSubscriberAction}>
                              <input type="hidden" name="id" value={s.id} />
                              <input type="hidden" name="unsubscribe" value={s.unsubscribedAt ? "0" : "1"} />
                              <button className="btn btn-line btn-sm">{s.unsubscribedAt ? "Resubscribe" : "Unsubscribe"}</button>
                            </form>
                            <form action={deleteSubscriberAction}>
                              <input type="hidden" name="id" value={s.id} />
                              <ConfirmButton confirm={`Delete ${s.email}?`} className="btn btn-line btn-sm text-red-600 hover:border-red-600">
                                Delete
                              </ConfirmButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Card>
        </div>

        <div className="grid h-fit gap-6">
        <Card title="Where they signed up from" pad={false}>
          {places.length === 0 ? (
            <p className="px-5 py-5 text-sm text-muted">Regions appear as people sign up.</p>
          ) : (
            <ul className="divide-y divide-line">
              {places.map(([k, n]) => (
                <li key={k}>
                  <Link
                    href={placeHref(k)}
                    aria-current={k === place ? "true" : undefined}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm transition ${k === place ? "bg-accent/10" : "hover:bg-surface"}`}
                  >
                    <span aria-hidden>{flag(k === "unknown" ? null : k.split(":")[0])}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-navy">{placeName(k)}</span>
                    <span className="num font-bold text-navy">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Add a subscriber" className="h-fit">
          <ActionForm action={addSubscriberAction} resetOnSuccess className="grid gap-3">
            {/* plain children: a render function can't be passed from a server component */}
            <Field label="Email">
              <input name="email" type="email" required placeholder="name@lab.ca" className={inputCls} />
            </Field>
            <SubmitButton pendingText="Adding…">Add subscriber</SubmitButton>
            <p className="text-xs text-muted">Only add people who asked to hear from you.</p>
          </ActionForm>
        </Card>
        </div>
      </div>
    </>
  );
}
