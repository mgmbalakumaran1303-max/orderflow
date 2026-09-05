import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput } from "@/components/ui/FormField";
import { ApiError } from "@/services/api/apiClient";
import { useAuthStore } from "@/stores/authStore";

export function LoginPage() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@restaurant.com");
  const [password, setPassword] = useState("password123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      if (!remember) {
        /* session still stored for prototype; remember is UI-complete */
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Unable to reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-[380px] rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            OF
          </div>
          <h1 className="text-xl font-semibold tracking-[0.18em]">ORDERFLOW</h1>
          <p className="mt-1 text-sm text-muted">Restaurant Admin Portal</p>
        </div>
        <div className="space-y-4">
          <FormField label="Email" error={!email && error ? "Required" : undefined}>
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </FormField>
          <FormField label="Password">
            <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </FormField>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <button type="button" className="text-primary" onClick={() => setError("Password reset is not enabled in this prototype.")}>
              Forgot password
            </button>
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            SIGN IN
          </Button>
        </div>
      </form>
    </div>
  );
}
