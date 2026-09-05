import { Globe, MessageCircle, ShoppingBag } from "lucide-react";
import type { OrderSource } from "@/types";
import { sourceLabel } from "@/utils/format";

export function SourceIcon({ source }: { source: OrderSource }) {
  const map = {
    "uber-eats": { bg: "bg-emerald-500/15 text-emerald-400", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
    wolt: { bg: "bg-sky-500/15 text-sky-400", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
    whatsapp: { bg: "bg-green-500/15 text-green-400", icon: <MessageCircle className="h-3.5 w-3.5" /> },
    website: { bg: "bg-blue-500/15 text-blue-400", icon: <Globe className="h-3.5 w-3.5" /> },
    other: { bg: "bg-slate-500/15 text-slate-300", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  };
  const item = map[source];
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${item.bg}`}>{item.icon}</span>
      {sourceLabel(source)}
    </span>
  );
}
