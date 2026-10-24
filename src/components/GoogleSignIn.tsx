"use client";

import { useEffect, useRef, useState } from "react";

// "Continue with Google" using Google Identity Services. Google returns a signed ID token,
// which /api/subscribe verifies with Google before trusting the email in it.
// Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID (Google Cloud Console > APIs & Services > Credentials >
// OAuth client ID, type "Web application", with your domain under Authorized JavaScript origins).

type GoogleId = {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function loadScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("gsi-client") as HTMLScriptElement | null;
    const s = existing ?? Object.assign(document.createElement("script"), { id: "gsi-client", src: "https://accounts.google.com/gsi/client", async: true });
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error("Google sign-in failed to load")));
    if (!existing) document.head.appendChild(s);
  });
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function GoogleSignIn({ onCredential, disabled }: { onCredential: (credential: string) => void; disabled?: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const cb = useRef(onCredential);
  cb.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID) return;
    let live = true;
    loadScript()
      .then(() => {
        if (!live || !slot.current || !window.google) return;
        window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r) => cb.current(r.credential) });
        window.google.accounts.id.renderButton(slot.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: slot.current.offsetWidth || 320,
        });
        setReady(true);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (!CLIENT_ID) {
    // not configured yet: show the button, disabled, so the layout is final
    return (
      <button type="button" disabled title="Google sign-in needs NEXT_PUBLIC_GOOGLE_CLIENT_ID" className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-line bg-white text-sm font-semibold text-ink opacity-60">
        <GoogleMark /> Continue with Google
      </button>
    );
  }
  return (
    <div className={`relative min-h-[44px] w-full ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <div ref={slot} className="flex w-full justify-center [&>div]:!w-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-full border border-line bg-white text-sm font-semibold text-ink">
          <GoogleMark /> Continue with Google
        </div>
      )}
    </div>
  );
}
