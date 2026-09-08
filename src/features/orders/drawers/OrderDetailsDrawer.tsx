import { useMemo, useState } from "react";
import { MoreHorizontal, Navigation, Phone, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/drawers/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourceIcon } from "@/components/ui/SourceIcon";
import { OrderItem } from "@/components/ui/OrderItem";
import { Timeline } from "@/components/ui/Timeline";
import { ConfirmModal, Modal } from "@/components/modals/Modal";
import { FormField, Select, TextArea } from "@/components/ui/FormField";
import { DrawerSkeleton } from "@/components/ui/Skeleton";
import { useOrderStore } from "@/stores/orderStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";
import { formatEuro, formatRelative, itemCountLabel } from "@/utils/format";
import { sleep } from "@/utils/format";
import { useTranslation } from "react-i18next";
import type { OrderStatus } from "@/types";

const reasons = ["Item unavailable", "Restaurant busy", "Delivery issue", "Technical issue", "Other"];

export function OrderDetailsDrawer({
  orderNumber,
  onClose,
}: {
  orderNumber: number | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const orders = useOrderStore((s) => s.orders);
  const order = orderNumber ? orders.find((item) => item.number === orderNumber) : undefined;
  const transition = useOrderStore((s) => s.transition);
  const toast = useUiStore((s) => s.toast);
  const printerAvailable = useSettingsStore((s) => s.printer.available);
  const [busy, setBusy] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [readyOpen, setReadyOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [printFail, setPrintFail] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [rejectStep, setRejectStep] = useState<0 | 1 | 2>(0);
  const [reason, setReason] = useState(reasons[0]);
  const [other, setOther] = useState("");
  const [callOpen, setCallOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const actions = useMemo(() => {
    if (!order) return [];
    const map: Record<OrderStatus, Array<{ label: string; variant: "primary" | "danger" | "secondary"; onClick: () => void }>> = {
      new: [
        { label: t("orders.accept"), variant: "primary", onClick: () => setAcceptOpen(true) },
        { label: t("orders.reject"), variant: "danger", onClick: () => setRejectStep(1) },
      ],
      preparing: [
        { label: t("orders.markReady"), variant: "primary", onClick: () => setReadyOpen(true) },
        { label: t("orders.print"), variant: "secondary", onClick: () => setPrintOpen(true) },
        { label: t("orders.reject"), variant: "danger", onClick: () => setRejectStep(1) },
      ],
      ready: [
        { label: t("orders.complete"), variant: "primary", onClick: () => setCompleteOpen(true) },
        { label: t("orders.print"), variant: "secondary", onClick: () => setPrintOpen(true) },
      ],
      completed: [{ label: t("orders.print"), variant: "secondary", onClick: () => setPrintOpen(true) }],
      cancelled: [],
    };
    return map[order.status];
  }, [order, t]);

  async function move(status: OrderStatus, success: string, rejectReason?: string) {
    if (!order) return;
    setBusy(true);
    try {
      await transition(order.number, status, rejectReason);
      toast(status === "cancelled" ? "error" : "success", success);
    } catch (error) {
      toast("error", error instanceof Error ? error.message : t("orders.updateError"));
    } finally {
      setBusy(false);
    }
  }

  async function print() {
    setPrinting(true);
    await sleep(800);
    setPrinting(false);
    if (!printerAvailable) {
      setPrintFail(true);
      toast("error", t("orders.printerUnavailable"));
      return;
    }
    setPrintOpen(false);
    toast("success", t("orders.printed"));
  }

  return (
    <>
      <Drawer
        open={Boolean(orderNumber)}
        onClose={onClose}
        footer={
          order ? (
            <div className="flex flex-col gap-2">
              {actions.map((action) => (
                <Button key={action.label} variant={action.variant} onClick={action.onClick} disabled={busy}>
                  {action.label}
                </Button>
              ))}
            </div>
          ) : null
        }
      >
        {!orderNumber ? null : !order ? (
          <DrawerSkeleton />
        ) : order ? (
          <div className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Order #{order.number}</h2>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-sm text-muted">Received {formatRelative(order.createdAt)}</p>
              </div>
              <button type="button" aria-label="Close" onClick={onClose} className="text-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <section className="mb-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-subtle">Source</p>
              <SourceIcon source={order.source} />
            </section>
            <section className="mb-5 rounded-xl border border-border bg-card p-3">
              <p className="mb-1 text-xs uppercase tracking-wide text-subtle">Customer</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted">{order.customer.phone}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setCallOpen(true)}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </section>
            <section className="mb-5 rounded-xl border border-border bg-card p-3">
              <p className="mb-1 text-xs uppercase tracking-wide text-subtle">Delivery Address</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Unter den Linden 10</p>
                  <p className="text-sm text-muted">10117 Berlin, Germany</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setNavOpen(true)}>
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </section>
            <section className="mb-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-subtle">Order Items</p>
              <div className="rounded-xl border border-border bg-card px-3">
                {order.items.map((item) => (
                  <OrderItem key={item.id} item={item} />
                ))}
                <div className="flex justify-between border-t border-border py-3 text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatEuro(order.total)}</span>
                </div>
              </div>
            </section>
            <section>
              <p className="mb-3 text-xs uppercase tracking-wide text-subtle">Timeline</p>
              <Timeline events={order.timeline} />
            </section>
          </div>
        ) : (
          <p className="p-5 text-sm text-muted">Order not found.</p>
        )}
      </Drawer>

      <ConfirmModal
        open={acceptOpen}
        title={t("dialogs.acceptTitle")}
        description={t("dialogs.acceptBody", { number: order?.number })}
        extra={
          order ? (
            <div className="rounded-lg border border-border bg-surface-2 p-3 text-sm">
              <p>{order.source.replace("-", " ")}</p>
              <p>{itemCountLabel(order.items.length)}</p>
              <p>{formatEuro(order.total)}</p>
            </div>
          ) : null
        }
        confirmLabel={t("orders.accept")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setAcceptOpen(false)}
        onConfirm={async () => {
          await move("preparing", t("orders.accepted", { number: order?.number }));
          setAcceptOpen(false);
        }}
      />
      <ConfirmModal
        open={readyOpen}
        title={t("dialogs.readyTitle")}
        description={t("dialogs.readyBody", { number: order?.number })}
        confirmLabel={t("orders.markReady")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setReadyOpen(false)}
        onConfirm={async () => {
          await move("ready", t("orders.readyToast", { number: order?.number }));
          setReadyOpen(false);
        }}
      />
      <ConfirmModal
        open={completeOpen}
        title={t("dialogs.completeTitle")}
        description={t("dialogs.completeBody")}
        confirmLabel={t("orders.complete")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setCompleteOpen(false)}
        onConfirm={async () => {
          await move("completed", t("orders.completedToast", { number: order?.number }));
          setCompleteOpen(false);
        }}
      />
      <ConfirmModal
        open={printOpen && !printFail}
        title={t("dialogs.printTitle")}
        description={t("dialogs.printBody")}
        confirmLabel={printing ? t("common.loading") : t("orders.print")}
        extra={<Printer className="h-4 w-4 text-muted" />}
        onCancel={() => setPrintOpen(false)}
        onConfirm={() => void print()}
      />
      <ConfirmModal
        open={printFail}
        title={t("orders.printerUnavailable")}
        description={t("orders.printerUnavailable")}
        confirmLabel={t("common.retry")}
        onCancel={() => {
          setPrintFail(false);
          setPrintOpen(false);
        }}
        onConfirm={() => {
          setPrintFail(false);
          void print();
        }}
      />
      <ConfirmModal
        open={callOpen}
        title={t("dialogs.callTitle")}
        description={`Call ${order?.customer.name} at ${order?.customer.phone}?`}
        confirmLabel={t("common.confirm")}
        onCancel={() => setCallOpen(false)}
        onConfirm={() => {
          toast("info", t("orders.calling", { phone: order?.customer.phone }));
          setCallOpen(false);
        }}
      />
      <ConfirmModal
        open={navOpen}
        title={t("dialogs.navTitle")}
        description="Unter den Linden 10, Berlin"
        confirmLabel={t("common.confirm")}
        onCancel={() => setNavOpen(false)}
        onConfirm={() => {
          toast("info", t("orders.openingNav"));
          setNavOpen(false);
        }}
      />
      <Modal open={rejectStep === 1} title={t("dialogs.rejectReason")} onClose={() => setRejectStep(0)}>
        <FormField label={t("dialogs.reason")}>
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {reasons.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </FormField>
        {reason === "Other" ? (
          <div className="mt-3">
            <FormField label={t("dialogs.reason")}>
              <TextArea value={other} onChange={(e) => setOther(e.target.value)} />
            </FormField>
          </div>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRejectStep(0)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => setRejectStep(2)}>{t("common.continue")}</Button>
        </div>
      </Modal>
      <ConfirmModal
        open={rejectStep === 2}
        title={t("dialogs.rejectTitle")}
        description={t("dialogs.rejectBody")}
        confirmLabel={t("orders.reject")}
        variant="danger"
        onCancel={() => setRejectStep(0)}
        onConfirm={async () => {
          await move("cancelled", t("orders.rejected", { number: order?.number }), reason === "Other" ? other : reason);
          setRejectStep(0);
        }}
      />
    </>
  );
}

export function OrderRowMenu({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" aria-label="Order actions" className="text-muted hover:text-foreground" onClick={onOpen}>
      <MoreHorizontal className="h-4 w-4" />
    </button>
  );
}
