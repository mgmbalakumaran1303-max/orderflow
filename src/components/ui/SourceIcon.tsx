import { Bot, Globe, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OrderSource } from "@/types";
import { sourceLabelKey } from "@/constants/channels";

const iconMap: Record<OrderSource, { bg: string; icon: React.ReactNode }> = {
  "uber-eats": { bg: "bg-emerald-500/15 text-emerald-400", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  lieferando: { bg: "bg-orange-500/15 text-orange-400", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  wolt: { bg: "bg-sky-500/15 text-sky-400", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  website: { bg: "bg-blue-500/15 text-blue-400", icon: <Globe className="h-3.5 w-3.5" /> },
  "ai-telephone": { bg: "bg-violet-500/15 text-violet-400", icon: <Bot className="h-3.5 w-3.5" /> },
};

export function SourceIcon({ source }: { source: OrderSource }) {
  const { t } = useTranslation();
  const item = iconMap[source];
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${item.bg}`}>{item.icon}</span>
      {t(sourceLabelKey(source))}
    </span>
  );
}
