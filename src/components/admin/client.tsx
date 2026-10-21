"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin-auth";

export function SubmitButton({ children, pendingText = "Saving…", className = "btn btn-navy" }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

// A form bound to an admin server action, with a toast for the result and field errors passed to children.
export function ActionForm({
  action,
  children,
  className,
  redirectTo,
  resetOnSuccess,
}: {
  action: (prev: ActionResult | undefined, form: FormData) => Promise<ActionResult>;
  children: React.ReactNode | ((errors: Record<string, string>) => React.ReactNode);
  className?: string;
  /** navigate here after success; "{id}" is replaced with the result's id */
  redirectTo?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const router = useRouter();
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!state) return;
    if (state.message) toast(state.message, state.ok ? "ok" : "error");
    if (state.ok && redirectTo) router.push(redirectTo.replace("{id}", String(state.id ?? "")));
    else if (state.ok && resetOnSuccess) setKey((k) => k + 1);
  }, [state, redirectTo, resetOnSuccess, router]);

  return (
    <form key={key} action={formAction} className={className}>
      {typeof children === "function" ? children(state?.errors ?? {}) : children}
    </form>
  );
}

// A submit button that asks before running a destructive action.
export function ConfirmButton({ children, confirm, className = "btn btn-line btn-sm" }: { children: React.ReactNode; confirm: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

// ---- toasts ----

type Toast = { id: number; text: string; tone: "ok" | "error" };
const listeners = new Set<(t: Toast) => void>();
let seq = 0;

export function toast(text: string, tone: "ok" | "error" = "ok") {
  const t = { id: ++seq, text, tone };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const on = (t: Toast) => {
      setItems((xs) => [...xs, t]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== t.id)), 3600);
    };
    listeners.add(on);
    return () => {
      listeners.delete(on);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] grid gap-2" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={`rise pointer-events-auto rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgb(13_30_56/0.7)] ${
            t.tone === "ok" ? "bg-navy" : "bg-red-600"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
