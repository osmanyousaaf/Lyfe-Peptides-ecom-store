"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError((await res.json().catch(() => ({}))).error || "Sign-in failed.");
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-svh place-items-center bg-[radial-gradient(circle_at_20%_10%,#1d3b68_0%,#0d1e38_55%)] p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
        <Image src="/lyfe-logo.png" alt="Lyfe Peptides" width={96} height={64} className="h-12 w-auto" />
        <h1 className="mt-6 text-2xl font-extrabold text-[#12233f]">Admin sign in</h1>
        <p className="mt-1 text-sm text-[#5b6b82]">Store dashboard for Lyfe Peptides.</p>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-semibold text-[#12233f]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            autoFocus
            className="h-12 w-full rounded-xl border border-[#e4e8ef] px-4 outline-none focus:border-[#12233f] focus:ring-4 focus:ring-[#12233f]/5"
          />
        </label>
        {error && <p className="mt-2 text-sm text-[#b42318]">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-solid mt-5 w-full">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
