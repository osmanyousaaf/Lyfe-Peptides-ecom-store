import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/account/AccountButton";
import CodeTicket from "@/components/account/CodeTicket";
import { ArrowRight, BagIcon, ExternalIcon, LogoutIcon, TruckIcon } from "@/components/icons";
import { currentCustomerId } from "@/lib/customer-session";
import { accountOrders, getAccount, signupCoupon } from "@/lib/customers";
import { formatPrice } from "@/lib/format";
import { placeLabel } from "@/lib/geo";
import { isUpload } from "@/lib/img";
import { STATUS_LABEL, trackingUrl, type OrderStatus } from "@/lib/orders";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

const day = (iso: string) =>
  new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

const TONE: Record<string, string> = {
  paid: "bg-accent/10 text-accent-deep",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-green/10 text-green",
  cancelled: "bg-surface-2 text-muted",
  refunded: "bg-red-50 text-red-700",
  pending: "bg-surface-2 text-muted",
};
// order progress shown as a 4-step track
const STEPS = ["paid", "processing", "shipped", "delivered"];

export default async function AccountPage() {
  const id = await currentCustomerId();
  const account = id ? getAccount(id) : undefined;
  if (!account) redirect("/account/signin?next=/account");
  const coupon = signupCoupon(account);
  const orders = accountOrders(account);
  const first = account.name.split(" ")[0] || account.email.split("@")[0];

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="dot-grid-light pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_80%_30%,#000,transparent_70%)]" aria-hidden />
        <span className="orb -right-16 top-0 h-80 w-80 bg-accent/30" aria-hidden />
        <div className="wrap relative flex flex-wrap items-center gap-5 py-10 sm:py-14">
          <span className="rise rounded-full bg-[conic-gradient(from_180deg,var(--accent),#ff9a4d,var(--accent))] p-[3px]">
            <span className="block rounded-full bg-navy p-[3px]">
              <Avatar name={account.name || account.email} picture={account.picture} className="h-16 w-16 text-2xl sm:h-20 sm:w-20" />
            </span>
          </span>
          <div className="rise min-w-0 flex-1" style={{ animationDelay: "80ms" }}>
            <p className="text-sm font-semibold text-white/60">My account</p>
            <h1 className="mt-1 text-[clamp(1.75rem,1.3rem+2vw,2.75rem)] font-extrabold leading-tight tracking-tight">
              Hi, <span className="text-accent">{first}</span>
            </h1>
            <p className="mt-1 truncate text-sm text-white/65">
              {account.email} · member since {day(account.createdAt)}
              {account.country ? ` · ${placeLabel(account)}` : ""}
            </p>
          </div>
          <form action="/api/auth/logout" method="post" className="rise" style={{ animationDelay: "140ms" }}>
            <button className="btn btn-sm rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15">
              <LogoutIcon className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </section>

      <div className="wrap grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-14">
        <section id="orders" className="min-w-0 scroll-mt-40">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="head text-navy">Your orders</h2>
            <span className="num text-sm font-semibold text-muted">{orders.length} total</span>
          </div>
          {orders.length === 0 ? (
            <div className="card grid place-items-center rounded-3xl px-6 py-14 text-center" data-reveal>
              <span className="grid h-16 w-16 place-items-center rounded-full bg-surface">
                <BagIcon className="float h-8 w-8 text-navy" />
              </span>
              <p className="mt-4 text-lg font-bold text-navy">No orders yet</p>
              <p className="mt-1 max-w-[36ch] text-sm text-muted">
                {coupon?.state === "active" ? `Your ${coupon.value}% code is waiting. It's applied in your cart automatically.` : "Orders you place while signed in show up here with live tracking."}
              </p>
              <Link href="/shop" className="btn btn-solid shine group mt-6 rounded-full">
                Start shopping <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <ul className="grid gap-4">
              {orders.map((o, i) => {
                const track = trackingUrl(o.carrier, o.trackingNumber);
                const step = STEPS.indexOf(o.status);
                return (
                  <li key={o.id} className="card rounded-3xl p-5 sm:p-6" data-reveal style={{ ["--d" as string]: `${Math.min(i, 6) * 60}ms` }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="num text-lg font-extrabold text-navy">{o.number}</p>
                        <p className="text-sm text-muted">{day(o.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${TONE[o.status] ?? TONE.pending}`}>
                          {STATUS_LABEL[o.status as OrderStatus] ?? o.status}
                        </span>
                        <span className="num text-lg font-extrabold text-navy">{formatPrice(o.totalCents)}</span>
                      </div>
                    </div>
                    {step >= 0 && (
                      <ol className="mt-5 grid grid-cols-4 gap-1.5" aria-label="Order progress">
                        {STEPS.map((s, k) => (
                          <li key={s} className="text-[0.6875rem] font-semibold">
                            <span className={`block h-1.5 rounded-full ${k <= step ? "bg-accent" : "bg-surface-2"}`} />
                            <span className={`mt-1.5 block ${k <= step ? "text-navy" : "text-faint"}`}>{STATUS_LABEL[s as OrderStatus]}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {o.items.slice(0, 6).map((it, k) => (
                        <div key={k} className="flex items-center gap-2 rounded-2xl bg-surface py-1.5 pl-1.5 pr-3">
                          <span className="relative h-10 w-10 overflow-hidden rounded-xl bg-white">
                            {it.image && <Image src={it.image} alt="" fill sizes="40px" unoptimized={isUpload(it.image)} className="blend object-cover" />}
                          </span>
                          <span className="text-xs leading-tight">
                            <span className="block font-bold text-navy">{it.name}</span>
                            <span className="text-muted">
                              ×{it.qty}
                              {it.variantLabel ? ` · ${it.variantLabel}` : ""}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {(track || o.trackingNumber) && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line px-4 py-3 text-sm">
                        <TruckIcon className="h-5 w-5 text-accent" />
                        <span className="flex-1">
                          <span className="font-bold text-navy">{o.carrier ?? "Tracking"}</span>{" "}
                          <span className="num text-muted">{o.trackingNumber}</span>
                        </span>
                        {track && (
                          <a href={track} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-accent-deep hover:underline">
                            Track package <ExternalIcon className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="grid content-start gap-5">
          <div id="code" className="scroll-mt-40" data-reveal>
            <h2 className="mb-3 text-lg font-extrabold text-navy">Your discount</h2>
            {coupon ? (
              <CodeTicket code={coupon.code} percent={coupon.value} expires={coupon.expiresAt ? day(coupon.expiresAt) : null} state={coupon.state} />
            ) : (
              <p className="card rounded-2xl p-5 text-sm text-muted">No personal code on this account.</p>
            )}
          </div>
          <div className="card rounded-3xl p-5" data-reveal style={{ ["--d" as string]: "80ms" }}>
            <h2 className="text-lg font-extrabold text-navy">Profile</h2>
            <dl className="mt-3 grid gap-3 text-sm">
              {[
                ["Name", account.name || "—"],
                ["Email", account.email],
                ["Signed in with", account.provider === "google" ? "Google" : "Development sign-in"],
                ["Member since", day(account.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                  <dt className="text-muted">{k}</dt>
                  <dd className="truncate text-right font-semibold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
