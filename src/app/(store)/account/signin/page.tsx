import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GoogleButton from "@/components/account/GoogleButton";
import { CheckIcon, MailIcon, TagIcon, TruckIcon } from "@/components/icons";
import { currentCustomerId } from "@/lib/customer-session";
import { devSignInAllowed, googleConfigured, safeNext } from "@/lib/google-auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; unavailable?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNext(sp.next, "/account");
  if (await currentCustomerId()) redirect(next);
  const pct = getSettings().signupDiscountPercent;
  const google = googleConfigured();
  const dev = devSignInAllowed();

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(115deg,#f7f9fc_0%,#eef3f9_45%,#e3eaf4_100%)]">
      <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,#000_10%,transparent_70%)]" aria-hidden />
      <span className="orb right-[8%] top-[10%] h-72 w-72 bg-accent/25" aria-hidden />
      <div className="wrap relative grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
        <div className="rise">
          <p className="eyebrow">Lyfe account</p>
          <h1 className="display mt-4 max-w-[14ch] text-navy">
            Sign in and save <span className="text-accent-deep">{pct}%</span>
          </h1>
          <p className="mt-4 max-w-[48ch] text-[1.0625rem] leading-relaxed text-muted">
            Create your account with Google in one tap. New accounts get a personal {pct}% code, emailed to your Gmail and
            applied to your cart for you.
          </p>
          <ul className="mt-7 grid gap-3">
            {[
              { Icon: TagIcon, t: `${pct}% off your first order` },
              { Icon: MailIcon, t: "Code sent straight to your Gmail" },
              { Icon: TruckIcon, t: "Order history and live tracking in one place" },
            ].map(({ Icon, t }, i) => (
              <li key={t} className="rise flex items-center gap-3 font-semibold text-navy" style={{ animationDelay: `${120 + i * 80}ms` }}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-accent shadow-sm">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rise card rounded-3xl p-7 shadow-[0_30px_70px_-30px_rgb(19_41_75/0.45)] sm:p-9" style={{ animationDelay: "150ms" }}>
          <h2 className="text-2xl font-extrabold text-navy">Welcome</h2>
          <p className="mt-1 text-sm text-muted">No password to remember. We only use your name, email and photo.</p>
          {sp.error && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
              {sp.error.slice(0, 160)}
            </p>
          )}
          {google ? (
            <GoogleButton next={next} className="mt-6 w-full" />
          ) : (
            <>
              <span className="mt-6 flex h-[52px] w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-line bg-surface font-bold text-faint" aria-disabled>
                Continue with Google
              </span>
              <p className="mt-3 text-sm text-muted">
                {dev
                  ? "Google sign-in isn't connected yet. Use the development sign-in below to try the account flow."
                  : "Sign-in is being set up and will be back shortly. You can still check out as a guest."}
              </p>
            </>
          )}
          {dev && (
            <form action="/api/auth/dev" method="post" className="mt-6 grid gap-3 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-deep">Dev sign-in · development only</p>
              <input type="hidden" name="next" value={next} />
              <input name="name" placeholder="Name" className="h-11 rounded-xl border border-line bg-white px-3.5 text-sm outline-none focus:border-navy" />
              <input name="email" type="email" required placeholder="someone@gmail.com" className="h-11 rounded-xl border border-line bg-white px-3.5 text-sm outline-none focus:border-navy" />
              <button className="btn btn-navy h-11 min-h-0 rounded-xl">Sign in as this email</button>
            </form>
          )}
          <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-faint">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" />
            Products are sold for laboratory research only. By continuing you confirm you&rsquo;re 18 or older.
          </p>
        </div>
      </div>
    </section>
  );
}
