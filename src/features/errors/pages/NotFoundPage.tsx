import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold">{t("errors.notFoundTitle")}</h1>
      <p className="text-sm text-muted">{t("errors.notFoundBody")}</p>
      <Button onClick={() => navigate("/dashboard")}>{t("errors.goDashboard")}</Button>
    </div>
  );
}

export function UnauthorizedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold">{t("errors.unauthorizedTitle")}</h1>
      <Button variant="secondary" onClick={() => navigate(-1)}>
        {t("common.goBack")}
      </Button>
    </div>
  );
}
