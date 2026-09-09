import type { ChannelId } from "@/types";

/**
 * The only order channels OrderFlow currently integrates with. Centralized so the
 * dashboard channel chart, order filters, and channel management page never drift.
 */
export const ORDER_CHANNELS: ChannelId[] = ["uber-eats", "lieferando", "wolt", "website", "ai-telephone"];

/** Translation key (under `orders.sources`) for each channel. */
export const CHANNEL_LABEL_KEY: Record<ChannelId, string> = {
  "uber-eats": "uberEats",
  lieferando: "lieferando",
  wolt: "wolt",
  website: "website",
  "ai-telephone": "aiTelephone",
};

/** Design-token tone used for badges/legends/icons per channel — no ad-hoc colors. */
export const CHANNEL_TONE: Record<ChannelId, "primary" | "success" | "warning" | "info" | "danger"> = {
  "uber-eats": "primary",
  lieferando: "success",
  wolt: "info",
  website: "warning",
  "ai-telephone": "danger",
};

export function sourceLabelKey(source: ChannelId): string {
  return `orders.sources.${CHANNEL_LABEL_KEY[source]}`;
}
