// Stock movement shared by orders (paid, cancelled, refunded) and the admin.
// Server only. A null stock means "not tracked" and is left alone.
import { db } from "./db";

export type StockLine = { productId: number | null; variantId: number | null; qty: number };

// direction -1 takes stock out (order paid), +1 puts it back (cancelled or refunded)
export function applyOrderStock(lines: StockLine[], direction: -1 | 1) {
  const v = db().prepare("UPDATE variants SET stock = MAX(0, stock + ?) WHERE id = ? AND stock IS NOT NULL");
  const p = db().prepare(
    "UPDATE products SET stock = MAX(0, stock + ?), updated_at = datetime('now') WHERE id = ? AND stock IS NOT NULL"
  );
  db().transaction(() => {
    for (const l of lines) {
      if (l.variantId) v.run(direction * l.qty, l.variantId);
      else if (l.productId) p.run(direction * l.qty, l.productId);
    }
  })();
}
