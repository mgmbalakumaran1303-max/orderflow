import { formatEuro } from "@/utils/format";
import type { OrderItem as OrderItemType } from "@/types";

export function OrderItem({ item }: { item: OrderItemType }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div>
        <p className="text-sm font-medium">
          {item.quantity}x {item.name}
        </p>
        {item.notes ? <p className="text-xs text-muted">{item.notes}</p> : null}
      </div>
      <p className="text-sm text-muted">{formatEuro(item.price * item.quantity)}</p>
    </div>
  );
}
