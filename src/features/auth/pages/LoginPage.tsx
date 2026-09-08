import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput } from "@/components/ui/FormField";
import { LanguageSelect } from "@/components/layout/LanguageSelect";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ApiError } from "@/services/api/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function LoginPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@restaurant.com");
  const [password, setPassword] = useState("password123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const nextEmailError = !email.trim() ? t("auth.emailRequired") : !email.includes("@") ? t("auth.emailInvalid") : "";
    const nextPasswordError = !password.trim() ? t("auth.passwordRequired") : "";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      if (!remember) {
        /* session still stored for prototype */
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError(t("auth.invalidCredentials"));
      else if (err instanceof ApiError) setError(err.message);
      else setError(t("auth.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 flex justify-end gap-2">
          <LanguageSelect />
          <ThemeToggle />
        </div>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            OF
          </div>
          <h1 className="text-xl font-semibold tracking-[0.18em]">ORDERFLOW</h1>
          <p className="mt-1 text-sm text-muted">{t("navigation.subtitle")}</p>
        </div>
        <div className="space-y-4">
          <FormField label={t("auth.email")} error={emailError}>
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </FormField>
          <FormField label={t("auth.password")} error={passwordError}>
            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              {t("auth.rememberMe")}
            </label>
            <Link to="/forgot-password" className="text-primary">
              {t("auth.forgotPassword")}
            </Link>
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {t("auth.login")}
          </Button>
          <p className="text-center text-xs text-muted">
            {t("personalization.language")}: {t(`languages.${language}`)} · {t("personalization.appearance")}:{" "}
            {theme === "light" ? t("personalization.light") : t("personalization.dark")}
          </p>
        </div>
      </form>
    </div>
  );
}
