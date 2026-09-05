import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { ConfirmHost } from "@/components/modals/ConfirmHost";
import { HelpCenterModal } from "@/components/modals/HelpCenterModal";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const applyTheme = useSettingsStore((s) => s.applyTheme);

  useEffect(() => {
    hydrate();
    applyTheme();
  }, [hydrate, applyTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastViewport />
      <ConfirmHost />
      <HelpCenterModal />
    </QueryClientProvider>
  );
}
