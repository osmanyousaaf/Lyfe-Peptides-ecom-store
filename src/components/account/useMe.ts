"use client";

import { useEffect, useState } from "react";

export type Me =
  | { signedIn: false }
  | {
      signedIn: true;
      name: string;
      firstName: string;
      email: string;
      picture: string;
      code: { code: string; label: string; usable: boolean } | null;
    };

// one request per page load, shared by every component that asks
let cached: Promise<Me> | null = null;

export function loadMe(fresh = false): Promise<Me> {
  if (!cached || fresh) {
    cached = fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Me>) : ({ signedIn: false } as Me)))
      .catch(() => ({ signedIn: false }) as Me);
  }
  return cached;
}

// undefined while loading
export function useMe(): Me | undefined {
  const [me, setMe] = useState<Me | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadMe().then((m) => live && setMe(m));
    return () => {
      live = false;
    };
  }, []);
  return me;
}

// where Google should send the visitor back to: the page they're on
export function signInHref(path?: string): string {
  const here = path ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  return `/api/auth/google/start?next=${encodeURIComponent(here)}`;
}

const AUTO_KEY = "lyfe-code-autoapplied";

// Applies the customer's personal code to the cart once; if they remove it, it stays removed.
export function shouldAutoApply(code: string): boolean {
  try {
    if (localStorage.getItem(AUTO_KEY) === code) return false;
    localStorage.setItem(AUTO_KEY, code);
    return true;
  } catch {
    return false;
  }
}
