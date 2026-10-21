import Image from "next/image";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-navy-2 p-4">
      <div className="dot-grid-light pointer-events-none absolute inset-0" aria-hidden />
      <span className="orb left-[10%] top-[15%] h-80 w-80 bg-accent/30" aria-hidden />
      <span className="orb bottom-[10%] right-[10%] h-96 w-96 bg-[#4f7bd9]/30 [animation-delay:-6s]" aria-hidden />
      <div className="rise relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]">
        <div className="flex items-center gap-3">
          <Image src="/lyfe-logo.png" alt="" width={60} height={40} className="h-10 w-auto" />
          <div className="leading-tight">
            <p className="font-extrabold text-navy">Lyfe Admin</p>
            <p className="text-xs text-muted">Store control panel</p>
          </div>
        </div>
        <h1 className="mt-8 text-2xl font-extrabold text-navy">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Enter the admin password to manage the store.</p>
        <LoginForm next={next ?? ""} />
      </div>
    </div>
  );
}
