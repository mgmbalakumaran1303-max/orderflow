import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "@/components/modals/Modal";
import { useUiStore } from "@/stores/uiStore";

export function ConfirmHost() {
  const { t } = useTranslation();
  const confirm = useUiStore((s) => s.confirm);
  const close = useUiStore((s) => s.closeConfirm);
  const unsaved = useUiStore((s) => s.unsavedPrompt);
  const closeUnsaved = useUiStore((s) => s.closeUnsaved);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        extra={confirm?.extra}
        confirmLabel={confirm?.confirmLabel}
        cancelLabel={confirm?.cancelLabel}
        variant={confirm?.variant}
        loading={loading}
        onCancel={close}
        onConfirm={async () => {
          if (!confirm) return;
          setLoading(true);
          try {
            await confirm.onConfirm();
            close();
          } finally {
            setLoading(false);
          }
        }}
      />
      <ConfirmModal
        open={Boolean(unsaved)}
        title={t("dialogs.unsavedTitle")}
        description={t("dialogs.unsavedBody")}
        confirmLabel={t("common.discard")}
        cancelLabel={t("common.stay")}
        variant="danger"
        onCancel={() => {
          unsaved?.onStay();
          closeUnsaved();
        }}
        onConfirm={() => {
          unsaved?.onDiscard();
          closeUnsaved();
        }}
      />
    </>
  );
}
