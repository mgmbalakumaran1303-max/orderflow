import { useState } from "react";
import { ConfirmModal } from "@/components/modals/Modal";
import { useUiStore } from "@/stores/uiStore";

export function ConfirmHost() {
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
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave?"
        confirmLabel="Discard Changes"
        cancelLabel="Stay"
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
