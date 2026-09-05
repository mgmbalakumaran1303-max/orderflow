import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, TextInput, Toggle } from "@/components/ui/FormField";
import { ConfirmModal } from "@/components/modals/Modal";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/utils/format";

const sections = ["General", "Notifications", "Orders", "Printer", "Users & Roles", "Security", "Appearance"] as const;
type Section = (typeof sections)[number];

export function SettingsPage() {
  const settings = useSettingsStore();
  const toast = useUiStore((s) => s.toast);
  const [section, setSection] = useState<Section>("General");
  const [printOpen, setPrintOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Settings"
        actions={
          <Button
            onClick={() => {
              settings.save();
              toast("success", "Settings saved");
            }}
          >
            Save settings
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Card padding={false}>
          {sections.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={cn("w-full px-4 py-2.5 text-left text-sm", section === item ? "bg-primary-muted text-primary" : "hover:bg-card-hover")}
            >
              {item}
            </button>
          ))}
        </Card>
        <Card className="space-y-4">
          {section === "General" && (
            <>
              <p className="text-sm text-muted">Workspace defaults for ORDERFLOW.</p>
              <Button variant="danger" onClick={() => setResetOpen(true)}>Reset Settings</Button>
            </>
          )}
          {section === "Notifications" && (
            <>
              <Row label="New order notification" checked={settings.notifications.newOrder} onChange={(newOrder) => settings.patch({ notifications: { ...settings.notifications, newOrder } })} />
              <Row label="Sound" checked={settings.notifications.sound} onChange={(sound) => settings.patch({ notifications: { ...settings.notifications, sound } })} />
              <Row label="Desktop notification" checked={settings.notifications.desktop} onChange={(desktop) => settings.patch({ notifications: { ...settings.notifications, desktop } })} />
              <Row label="Order status notification" checked={settings.notifications.status} onChange={(status) => settings.patch({ notifications: { ...settings.notifications, status } })} />
              <Row label="Low capacity warning" checked={settings.notifications.lowCapacity} onChange={(lowCapacity) => settings.patch({ notifications: { ...settings.notifications, lowCapacity } })} />
            </>
          )}
          {section === "Orders" && (
            <>
              <Row label="Auto accept orders" checked={settings.orders.autoAccept} onChange={(autoAccept) => settings.patch({ orders: { ...settings.orders, autoAccept } })} />
              <Row label="Auto print orders" checked={settings.orders.autoPrint} onChange={(autoPrint) => settings.patch({ orders: { ...settings.orders, autoPrint } })} />
              <Row label="Allow cancellation" checked={settings.orders.allowCancellation} onChange={(allowCancellation) => settings.patch({ orders: { ...settings.orders, allowCancellation } })} />
              <FormField label="Default preparation time (minutes)">
                <TextInput type="number" value={settings.orders.prepTimeMinutes} onChange={(e) => settings.patch({ orders: { ...settings.orders, prepTimeMinutes: Number(e.target.value) } })} />
              </FormField>
              <FormField label="Order timeout (minutes)">
                <TextInput type="number" value={settings.orders.timeoutMinutes} onChange={(e) => settings.patch({ orders: { ...settings.orders, timeoutMinutes: Number(e.target.value) } })} />
              </FormField>
            </>
          )}
          {section === "Printer" && (
            <>
              <FormField label="Printer name">
                <TextInput value={settings.printer.name} onChange={(e) => settings.patch({ printer: { ...settings.printer, name: e.target.value } })} />
              </FormField>
              <FormField label="Connection type">
                <TextInput value={settings.printer.connectionType} onChange={(e) => settings.patch({ printer: { ...settings.printer, connectionType: e.target.value } })} />
              </FormField>
              <FormField label="Receipt format">
                <TextInput value={settings.printer.receiptFormat} onChange={(e) => settings.patch({ printer: { ...settings.printer, receiptFormat: e.target.value } })} />
              </FormField>
              <Row label="Auto print" checked={settings.printer.autoPrint} onChange={(autoPrint) => settings.patch({ printer: { ...settings.printer, autoPrint } })} />
              <Row label="Printer available" checked={settings.printer.available} onChange={(available) => settings.patch({ printer: { ...settings.printer, available } })} />
              <Button variant="secondary" onClick={() => setPrintOpen(true)}>Test Print</Button>
            </>
          )}
          {section === "Users & Roles" && <p className="text-sm text-muted">Manage staff from the Users page. Roles: Admin, Manager, Staff, Viewer.</p>}
          {section === "Security" && <p className="text-sm text-muted">Sessions persist in localStorage for this prototype. Use Logout from the profile menu.</p>}
          {section === "Appearance" && (
            <div className="flex gap-2">
              <Button variant={settings.theme === "dark" ? "primary" : "secondary"} onClick={() => settings.setTheme("dark")}>Dark Mode</Button>
              <Button variant={settings.theme === "light" ? "primary" : "secondary"} onClick={() => settings.setTheme("light")}>Light Mode</Button>
            </div>
          )}
        </Card>
      </div>
      <ConfirmModal
        open={printOpen}
        title="Print test receipt?"
        description="A test ticket will be sent to the configured printer."
        confirmLabel="Print"
        onCancel={() => setPrintOpen(false)}
        onConfirm={() => {
          setPrintOpen(false);
          toast(settings.printer.available ? "success" : "error", settings.printer.available ? "Test print sent" : "Printer unavailable.");
        }}
      />
      <ConfirmModal
        open={resetOpen}
        title="Reset Settings?"
        description="All portal preferences will return to defaults."
        confirmLabel="Reset Settings"
        variant="danger"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          settings.reset();
          setResetOpen(false);
          toast("warning", "Settings reset");
        }}
      />
    </div>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
      <span className="text-sm">{label}</span>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
