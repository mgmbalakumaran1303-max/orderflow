import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { LanguageSelect } from "@/components/layout/LanguageSelect";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-4 flex justify-end gap-2">
          <LanguageSelect />
          <ThemeToggle />
        </div>
        <h1 className="text-xl font-semibold">{t("auth.forgotTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{t("auth.forgotBody")}</p>
        <Link to="/login" className="mt-6 inline-block">
          <Button>{t("auth.backToLogin")}</Button>
        </Link>
      </div>
    </div>
  );
}
