import { Badge, type Tone } from "@/components/admin/ui";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders";

export const STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: "gray",
  paid: "orange",
  processing: "blue",
  shipped: "violet",
  delivered: "green",
  cancelled: "gray",
  refunded: "red",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
