"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const KEY = "lyfe-age-verified";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("age") === "ok") localStorage.setItem(KEY, "yes");
      if (localStorage.getItem(KEY) !== "yes") setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  const confirm = () => {
    try {
      localStorage.setItem(KEY, "yes");
    } catch {
      /* private mode: the gate returns next visit */
    }
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-navy-2/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="card w-full max-w-md p-7 text-center shadow-2xl sm:p-9">
        <Image src="/lyfe-logo.png" alt="Lyfe Peptides" width={96} height={64} className="mx-auto h-14 w-auto" />
        <h2 id="age-title" className="mt-5 text-2xl font-extrabold text-navy">
          Are you 18 or older?
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          Our products are sold for laboratory research only. They are not for human or animal consumption and
          are not approved by Health Canada for personal use.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button onClick={confirm} className="btn btn-solid" autoFocus>
            Yes, I am 18+
          </button>
          <a href="https://www.google.com" className="btn btn-line">
            No, leave
          </a>
        </div>
        <p className="mt-5 text-xs text-faint">By entering you confirm the products are for research use.</p>
      </div>
    </div>
  );
}
