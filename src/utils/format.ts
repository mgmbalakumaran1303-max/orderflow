import { formatDistanceToNow, format } from "date-fns";
import { de, enUS, es, fr, it } from "date-fns/locale";
import type { Locale } from "date-fns";
import i18n from "@/i18n";
import { WAITING_TIME_CRITICAL_THRESHOLD_MIN, WAITING_TIME_WARNING_THRESHOLD_MIN } from "@/constants/orders";
import type { AppLanguage, WaitingSeverity } from "@/types";

const dateFnsLocales: Record<AppLanguage, Locale> = { en: enUS, de, es, fr, it };
const intlLocales: Record<AppLanguage, string> = {
  en: "en-GB",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
};

function currentLanguage(): AppLanguage {
  const lng = i18n.language as AppLanguage;
  return dateFnsLocales[lng] ? lng : "en";
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat(intlLocales[currentLanguage()], {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatRelative(iso: string): string {
  const locale = dateFnsLocales[currentLanguage()];
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale });
}

export function formatDateLabel(date: Date): string {
  return format(date, "EEEE, MMM d, yyyy", { locale: dateFnsLocales[currentLanguage()] });
}

export function formatShortDate(date: Date): string {
  return format(date, "MMM d", { locale: dateFnsLocales[currentLanguage()] });
}

export function roleLabel(role: string): string {
  return i18n.t(`users.roles.${role}`);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function itemCountLabel(count: number): string {
  return i18n.t("orders.itemCount", { count });
}

export function getWaitingMinutes(createdAtIso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(createdAtIso).getTime()) / 60_000));
}

export function getWaitingSeverity(createdAtIso: string): WaitingSeverity {
  const minutes = getWaitingMinutes(createdAtIso);
  if (minutes >= WAITING_TIME_CRITICAL_THRESHOLD_MIN) return "critical";
  if (minutes >= WAITING_TIME_WARNING_THRESHOLD_MIN) return "warning";
  return "normal";
}

export function waitingLabel(createdAtIso: string): string {
  return i18n.t("orders.waitingMinutes", { count: getWaitingMinutes(createdAtIso) });
}
