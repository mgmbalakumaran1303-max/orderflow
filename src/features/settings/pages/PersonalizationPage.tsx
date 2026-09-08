import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LanguageSelect } from "@/components/layout/LanguageSelect";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useSettingsStore } from "@/stores/settingsStore";

export function PersonalizationPage() {
  const { t } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: t("navigation.settings"), to: "/settings" },
          { label: t("personalization.title") },
        ]}
      />
      <PageHeader title={t("personalization.title")} description={t("personalization.subtitle")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-base font-semibold">{t("personalization.language")}</h2>
          <p className="text-sm text-muted">
            {t("personalization.currentLanguage")}: {t(`languages.${language}`)}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm">{t("personalization.change")}</span>
            <LanguageSelect />
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-base font-semibold">{t("personalization.appearance")}</h2>
          <p className="text-sm text-muted">
            {t("personalization.currentTheme")}: {theme === "light" ? t("personalization.light") : t("personalization.dark")}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm">{t("personalization.change")}</span>
            <ThemeToggle />
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <p className="text-xs text-muted">{t("personalization.preview")}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm">{t("common.save")}</Button>
              <Button size="sm" variant="secondary">
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
