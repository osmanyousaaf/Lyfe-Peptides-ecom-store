import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CodeTicket from "@/components/account/CodeTicket";
import WelcomeCelebration from "@/components/account/WelcomeCelebration";
import { ArrowRight, MailIcon } from "@/components/icons";
import { currentCustomerId } from "@/lib/customer-session";
import { getAccount, signupCoupon } from "@/lib/customers";
import { safeNext } from "@/lib/google-auth";
import { mailConfigured } from "@/lib/mail";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const id = await currentCustomerId();
  const account = id ? getAccount(id) : undefined;
  if (!account) redirect("/account/signin");
  const coupon = signupCoupon(account);
  let next = safeNext((await searchParams).next, "/shop");
  if (next.startsWith("/account")) next = "/shop";
  const first = account.name.split(" ")[0] || "there";
  const expires = coupon?.expiresAt
    ? new Date(`${coupon.expiresAt}T12:00:00Z`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(115deg,#f7f9fc_0%,#eef3f9_45%,#e3eaf4_100%)]">
      <WelcomeCelebration code={coupon?.state === "active" ? coupon.code : null} label={coupon ? `${coupon.value}% off` : ""} />
      <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_30%,#000_10%,transparent_70%)]" aria-hidden />
      <span className="orb left-[10%] top-[10%] h-72 w-72 bg-accent/25" aria-hidden />
      <span className="orb bottom-0 right-[10%] h-80 w-80 bg-[#7aa2e3]/30 [animation-delay:-6s]" aria-hidden />
      <div className="wrap relative mx-auto max-w-2xl py-14 text-center sm:py-20">
        <p className="rise eyebrow justify-center">You&rsquo;re in</p>
        <h1 className="display rise mt-4 text-navy" style={{ animationDelay: "60ms" }}>
          Welcome, <span className="grad-text">{first}</span>
        </h1>
        <p className="rise mx-auto mt-4 max-w-[46ch] text-[1.0625rem] text-muted" style={{ animationDelay: "120ms" }}>
          {coupon
            ? `Here's your ${coupon.value}% off code. It's already in your cart, and works once while you're signed in.`
            : "Your account is ready."}
        </p>
        {coupon && (
          <div className="mt-9 text-left">
            <CodeTicket code={coupon.code} percent={coupon.value} expires={expires} state={coupon.state} animate />
          </div>
        )}
        <p className="rise mt-5 inline-flex items-center gap-2 text-sm text-muted" style={{ animationDelay: "900ms" }}>
          <MailIcon className="h-4 w-4 text-accent" />
          {mailConfigured() ? `We also emailed it to ${account.email}.` : `A copy will be emailed to ${account.email} once store email is set up.`}
        </p>
        <div className="rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "1000ms" }}>
          <Link href={next} className="btn btn-solid shine group rounded-full">
            Start shopping <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/account" className="btn btn-line rounded-full">
            My account
          </Link>
        </div>
      </div>
    </section>
  );
}
