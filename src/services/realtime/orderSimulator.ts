import { createMockOrder } from "@/data/mocks/seed";
import { orderRepository } from "@/services/api/orderRepository";
import { REALTIME_MAX_INTERVAL_MS, REALTIME_MIN_INTERVAL_MS } from "@/constants/orders";
import type { Order } from "@/types";

/**
 * Mock realtime order feed. Swap the body of `schedule()` for a WebSocket/SSE
 * subscription later — the public contract (a callback invoked with each new
 * `Order`, and a stop function) stays the same either way.
 */
export function startOrderSimulator(restaurantId: string, onOrder: (order: Order) => void): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  let seed = Math.floor(Math.random() * 1000);

  function schedule() {
    const delay = REALTIME_MIN_INTERVAL_MS + Math.random() * (REALTIME_MAX_INTERVAL_MS - REALTIME_MIN_INTERVAL_MS);
    timer = setTimeout(() => {
      if (stopped) return;
      seed += 1;
      const order = createMockOrder(seed, restaurantId, orderRepository.nextOrderNumber(), "new");
      orderRepository.pushIncoming(order);
      onOrder(order);
      schedule();
    }, delay);
  }

  schedule();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
