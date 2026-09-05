import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, TextInput } from "@/components/ui/FormField";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useUiStore } from "@/stores/uiStore";
import { ConfirmModal } from "@/components/modals/Modal";

export function RestaurantPage() {
  const selected = useRestaurantStore((s) => s.selected);
  const updateCurrent = useRestaurantStore((s) => s.updateCurrent);
  const toast = useUiStore((s) => s.toast);
  const askUnsaved = useUiStore((s) => s.askUnsaved);
  const [form, setForm] = useState(selected);
  const [saveOpen, setSaveOpen] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(selected);

  useEffect(() => setForm(selected), [selected]);

  useEffect(() => {
    const onNav = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onNav);
    return () => window.removeEventListener("beforeunload", onNav);
  }, [dirty]);

  if (!form) return null;
  const set = (key: keyof typeof form, value: string | number) => setForm({ ...form, [key]: value });

  return (
    <div>
      <PageHeader
        title="Restaurant"
        description="Opening hours, contact details and tax configuration."
        actions={
          <Button
            onClick={() => {
              if (dirty) setSaveOpen(true);
            }}
            disabled={!dirty}
          >
            Save Changes
          </Button>
        }
      />
      <Card className="max-w-2xl space-y-4">
        <FormField label="Restaurant Name">
          <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>
        <FormField label="Address">
          <TextInput value={form.address} onChange={(e) => set("address", e.target.value)} />
        </FormField>
        <FormField label="Phone">
          <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </FormField>
        <FormField label="Email">
          <TextInput value={form.email} onChange={(e) => set("email", e.target.value)} />
        </FormField>
        <FormField label="Opening Hours">
          <TextInput value={form.openingHours} onChange={(e) => set("openingHours", e.target.value)} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Currency">
            <TextInput value={form.currency} onChange={(e) => set("currency", e.target.value)} />
          </FormField>
          <FormField label="Timezone">
            <TextInput value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
          </FormField>
          <FormField label="Tax %">
            <TextInput type="number" value={form.taxRate} onChange={(e) => set("taxRate", Number(e.target.value))} />
          </FormField>
        </div>
        {dirty ? (
          <Button variant="ghost" onClick={() => askUnsaved({ onStay: () => undefined, onDiscard: () => setForm(selected) })}>
            Discard unsaved changes
          </Button>
        ) : null}
      </Card>
      <ConfirmModal
        open={saveOpen}
        title="Save restaurant settings?"
        description="These details will be used on receipts and customer channels."
        confirmLabel="Save Changes"
        onCancel={() => setSaveOpen(false)}
        onConfirm={async () => {
          await updateCurrent(form);
          setSaveOpen(false);
          toast("success", "Restaurant updated");
        }}
      />
    </div>
  );
}
