"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-6 grid gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold text-navy">Password</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="h-12 rounded-xl border border-line bg-surface px-4 outline-none transition focus:border-navy focus:bg-white"
        />
      </label>
      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>}
      <button disabled={pending} className="btn btn-navy h-12 rounded-xl">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
