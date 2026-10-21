"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// First-party, cookie-free analytics: page views, time on page, meaningful clicks and a
// presence heartbeat for the admin's "visitors right now". Nothing is sent when the browser
// asks not to be tracked (Do Not Track / Global Privacy Control).

const ENDPOINT = "/api/track";
const SESSION_IDLE_MS = 30 * 60_000;
const HEARTBEAT_MS = 20_000;

type Payload = Record<string, unknown>;

function send(body: Payload) {
  const json = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([json], { type: "text/plain" }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch(ENDPOINT, { method: "POST", body: json, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

function optedOut(): boolean {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  const w = window as Window & { doNotTrack?: string };
  return n.globalPrivacyControl === true || n.doNotTrack === "1" || w.doNotTrack === "1" || n.msDoNotTrack === "1";
}

function visitorId(): string {
  try {
    let id = localStorage.getItem("lyfe-vid");
    if (!id) {
      id = newId();
      localStorage.setItem("lyfe-vid", id);
    }
    return id;
  } catch {
    return memory.vid ?? (memory.vid = newId());
  }
}

// a session ends after 30 minutes without activity; returns whether this call started one
function session(): { id: string; fresh: boolean } {
  const now = Date.now();
  try {
    const raw = sessionStorage.getItem("lyfe-sid");
    const s = raw ? (JSON.parse(raw) as { id: string; last: number }) : null;
    const fresh = !s || now - s.last > SESSION_IDLE_MS;
    const id = fresh ? newId() : s!.id;
    sessionStorage.setItem("lyfe-sid", JSON.stringify({ id, last: now }));
    return { id, fresh };
  } catch {
    const fresh = !memory.sid || now - (memory.last ?? 0) > SESSION_IDLE_MS;
    if (fresh) memory.sid = newId();
    memory.last = now;
    return { id: memory.sid!, fresh };
  }
}
const memory: { vid?: string; sid?: string; last?: number } = {};

const SOCIAL = /(^|\.)(instagram|facebook|fb|tiktok|youtube|youtu|x|twitter)\.(com|be|me)$/i;
const tidy = (s: string | null | undefined, max = 60) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// turn a click into an event worth counting, or nothing
function classify(el: Element): { e: string; l: string } | null {
  const tagged = el.closest<HTMLElement>("[data-track]");
  if (tagged?.dataset.track) {
    const raw = tagged.dataset.track;
    const cut = raw.indexOf(":");
    const [e, l] = cut > 0 ? [raw.slice(0, cut), raw.slice(cut + 1)] : ["click", raw];
    return { e, l: tidy(l) };
  }
  const target = el.closest<HTMLElement>("a, button, [role=button]");
  if (!target) return null;
  const aria = target.getAttribute("aria-label") ?? "";
  const text = tidy(target.innerText || target.textContent) || tidy(aria);
  const card = target.closest("article")?.querySelector("h3, h2")?.textContent;

  // "Add GHK-Cu 100 mg to cart", "Add to cart", "Add · $85.00"
  const add = aria.match(/^Add (.+) to cart$/i);
  if (add) return { e: "add_to_cart", l: tidy(add[1]) };
  if (/^(add to cart|add\b|added)/i.test(text) && !/add (option|item|value|block|a |an )/i.test(text)) {
    return { e: "add_to_cart", l: tidy(card || document.title.split("|")[0]) };
  }
  if (/check ?out/i.test(text) || /check ?out/i.test(aria)) return { e: "checkout", l: tidy(text || aria) };

  if (target instanceof HTMLAnchorElement && target.href) {
    let url: URL;
    try {
      url = new URL(target.href, location.href);
    } catch {
      return null;
    }
    if (url.protocol === "mailto:") return { e: "click", l: "Email link" };
    if (url.protocol === "tel:") return { e: "click", l: "Phone link" };
    if (url.host !== location.host) {
      const host = url.hostname.replace(/^www\./, "");
      return SOCIAL.test(host) ? { e: "social", l: host.split(".")[0] } : { e: "outbound", l: host };
    }
    if (url.pathname.startsWith("/product/")) return { e: "product_click", l: tidy(card || text || url.pathname.slice(9)) };
  }
  return text ? { e: "click", l: text } : null;
}

export default function Tracker() {
  const pathname = usePathname();
  const state = useRef<{
    path: string | null;
    visibleSince: number;
    spent: number;
    sid: string;
    vid: string;
    off: boolean;
    referrerSent: boolean;
  }>({
    referrerSent: false,
    path: null,
    visibleSince: 0,
    spent: 0,
    sid: "",
    vid: "",
    off: true,
  });

  // one-time wiring: ids, heartbeat, hide/leave, click delegation
  useEffect(() => {
    const st = state.current;
    if (optedOut()) return;
    st.off = false;
    st.vid = visitorId();

    const base = () => ({ v: st.vid, s: session().id, p: st.path });
    const flushTime = (gone = false) => {
      if (!st.path) return;
      const now = Date.now();
      const d = st.spent + (document.visibilityState === "visible" && st.visibleSince ? now - st.visibleSince : 0);
      send({ t: "leave", ...base(), d, gone });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (st.visibleSince) st.spent += Date.now() - st.visibleSince;
        st.visibleSince = 0;
        if (st.path) send({ t: "leave", ...base(), d: st.spent });
      } else {
        st.visibleSince = Date.now();
        if (st.path) send({ t: "ping", ...base() });
      }
    };
    const onHide = () => flushTime(true);
    const beat = window.setInterval(() => {
      if (document.visibilityState === "visible" && st.path) send({ t: "ping", ...base() });
    }, HEARTBEAT_MS);

    const onClick = (ev: MouseEvent) => {
      if (!st.path || !(ev.target instanceof Element)) return;
      const hit = classify(ev.target);
      if (hit) send({ t: "event", ...base(), e: hit.e, l: hit.l });
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      window.clearInterval(beat);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  // a page view on every route change (the query string isn't part of the path)
  useEffect(() => {
    const st = state.current;
    if (st.off || !pathname || pathname.startsWith("/admin")) return;
    if (st.path === pathname) return;

    // close out time on the previous page
    if (st.path) {
      const d = st.spent + (st.visibleSince ? Date.now() - st.visibleSince : 0);
      send({ t: "leave", v: st.vid, s: session().id, p: st.path, d });
    }
    st.path = pathname;
    st.spent = 0;
    st.visibleSince = document.visibilityState === "visible" ? Date.now() : 0;

    const { id } = session();
    // the referrer belongs to the first view after a full page load, not to client navigations
    const referrer = st.referrerSent ? "" : document.referrer;
    st.referrerSent = true;
    const q = new URLSearchParams(location.search);
    // give the new page a moment to set its title; skip if the visitor already moved on
    window.setTimeout(() => {
      if (st.path !== pathname) return;
      send({
        t: "view",
        v: st.vid,
        s: id,
        p: pathname,
        ti: document.title,
        r: referrer,
        us: q.get("utm_source"),
        um: q.get("utm_medium"),
        uc: q.get("utm_campaign"),
      });
    }, 250);
  }, [pathname]);

  return null;
}
