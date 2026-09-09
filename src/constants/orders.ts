// Centralized order-related configuration. Kept separate from UI so it can be
// swapped for values coming from a backend config endpoint later.

/** Minutes since an order was created before it is flagged as "waiting too long". */
export const WAITING_TIME_WARNING_THRESHOLD_MIN = 10;

/** Minutes since an order was created before the waiting badge escalates to critical. */
export const WAITING_TIME_CRITICAL_THRESHOLD_MIN = 20;

/** How often the mock realtime order simulator may add a new incoming order. */
export const REALTIME_MIN_INTERVAL_MS = 25_000;
export const REALTIME_MAX_INTERVAL_MS = 55_000;

/** Toast/notification auto-dismiss handled centrally in uiStore; polling cadence for connection checks. */
export const CONNECTION_POLL_INTERVAL_MS = 30_000;
