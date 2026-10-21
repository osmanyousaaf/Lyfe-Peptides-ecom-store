"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "./types";

const STORAGE_KEY = "lyfe-cart-v1";
const COUPON_KEY = "lyfe-coupon-v1";

// a discount code the shopper applied; the server re-checks it at checkout
export type AppliedCoupon = { code: string; label: string };

type CartState = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  coupon: AppliedCoupon | null;
  setCoupon: (c: AppliedCoupon | null) => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
      const c = localStorage.getItem(COUPON_KEY);
      if (c) setCoupon(JSON.parse(c));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }, [lines, coupon, hydrated]);

  const add = useCallback<CartState["add"]>((line, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) =>
          l.key === line.key ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [...prev, { ...line, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty } : l))
    );
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCoupon(null);
  }, []);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotalCents = lines.reduce(
      (n, l) => n + l.unitPriceCents * l.qty,
      0
    );
    return {
      lines,
      count,
      subtotalCents,
      isOpen,
      add,
      remove,
      setQty,
      clear,
      coupon,
      setCoupon,
      open: () => setOpen(true),
      close: () => setOpen(false),
    };
  }, [lines, isOpen, add, remove, setQty, clear, coupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
