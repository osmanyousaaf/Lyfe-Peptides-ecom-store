"use client";

import { usePathname } from "next/navigation";

// Shows the storefront's header, footer and overlays everywhere except the admin panel.
export default function SiteChrome({ top, bottom, children }: { top: React.ReactNode; bottom: React.ReactNode; children: React.ReactNode }) {
  const admin = usePathname().startsWith("/admin");
  if (admin) return <>{children}</>;
  return (
    <>
      {top}
      <main>{children}</main>
      {bottom}
    </>
  );
}
