"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/admin/actions";
import {
  BagIcon,
  BoxIcon,
  ChartIcon,
  CloseIcon,
  DocIcon,
  ExternalIcon,
  GridIcon,
  GearIcon,
  InboxIcon,
  LogoutIcon,
  MailIcon,
  MenuIcon,
  TagIcon,
  UsersIcon,
  VialIcon,
} from "@/components/icons";

export type ShellCounts = { orders: number; messages: number; lowStock: number; live: number };

const NAV = [
  {
    group: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", Icon: GridIcon },
      { href: "/admin/analytics", label: "Analytics", Icon: ChartIcon, count: "live" as const },
    ],
  },
  {
    group: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", Icon: BagIcon, count: "orders" as const },
      { href: "/admin/customers", label: "Customers", Icon: UsersIcon },
      { href: "/admin/coupons", label: "Coupons", Icon: TagIcon },
    ],
  },
  {
    group: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", Icon: VialIcon },
      { href: "/admin/inventory", label: "Inventory", Icon: BoxIcon, count: "lowStock" as const },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", Icon: DocIcon },
      { href: "/admin/messages", label: "Messages", Icon: InboxIcon, count: "messages" as const },
      { href: "/admin/subscribers", label: "Subscribers", Icon: MailIcon },
    ],
  },
  { group: "Store", items: [{ href: "/admin/settings", label: "Settings", Icon: GearIcon }] },
];

export default function AdminShell({ counts, children }: { counts: ShellCounts; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-10 w-14 place-items-center rounded-xl bg-white">
          <Image src="/lyfe-logo.png" alt="" width={48} height={32} className="h-7 w-auto" />
        </span>
        <span className="leading-tight">
          <span className="block font-extrabold text-white">Lyfe Admin</span>
          <span className="block text-xs text-white/50">Store control panel</span>
        </span>
      </Link>
      <nav className="noscroll flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin">
        {NAV.map((g) => (
          <div key={g.group} className="mt-4">
            <p className="px-3 pb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white/35">{g.group}</p>
            {g.items.map(({ href, label, Icon, ...rest }) => {
              const on = active(href);
              const n = "count" in rest && rest.count ? counts[rest.count] : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    on ? "bg-white text-navy shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${on ? "text-accent" : ""}`} />
                  <span className="flex-1">{label}</span>
                  {n > 0 && (
                    <span className={`num rounded-full px-2 py-0.5 text-[0.6875rem] font-bold ${on ? "bg-accent text-white" : "bg-accent/90 text-white"}`}>
                      {n}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="grid gap-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
          <ExternalIcon className="h-[18px] w-[18px]" /> View store
        </a>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
            <LogoutIcon className="h-[18px] w-[18px]" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-navy-2 lg:block">{sidebar}</aside>

      {/* phone and tablet: top bar + drawer */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl text-navy hover:bg-surface" aria-label="Open admin menu">
          <MenuIcon className="h-6 w-6" />
        </button>
        <span className="font-extrabold text-navy">Lyfe Admin</span>
        <span className="w-10" />
      </div>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-navy-2/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute inset-y-0 left-0 w-72 bg-navy-2 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <button onClick={() => setOpen(false)} className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10" aria-label="Close admin menu">
            <CloseIcon className="h-5 w-5" />
          </button>
          {sidebar}
        </aside>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
