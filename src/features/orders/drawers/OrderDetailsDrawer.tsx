import { useMemo, useState } from "react";
import { AlertTriangle, MapPin, Navigation, Phone, Printer, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/drawers/Drawer";
import { StatusBadge, Badge } from "@/components/ui/StatusBadge";
import { SourceIcon } from "@/components/ui/SourceIcon";
import { sourceLabelKey } from "@/constants/channels";
import { WaitingBadge } from "@/components/ui/WaitingBadge";
import { OrderItem } from "@/components/ui/OrderItem";
import { Timeline } from "@/components/ui/Timeline";
import { ConfirmModal, Modal } from "@/components/modals/Modal";
import { FormField, Select, TextArea, TextInput } from "@/components/ui/FormField";
import { DrawerSkeleton } from "@/components/ui/Skeleton";
import { useOrderStore } from "@/stores/orderStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";
import { formatEuro, formatRelative, itemCountLabel } from "@/utils/format";
import { canTransition } from "@/utils/orderMachine";
import { useTranslation } from "react-i18next";
import type { OrderItem as OrderItemType, OrderStatus } from "@/types";

const reasons = ["Item unavailable", "Restaurant busy", "Delivery issue", "Technical issue", "Other"];

const paymentTone: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
  "not-required": "neutral",
};

const printTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  idle: "neutral",
  printing: "warning",
  printed: "success",
  failed: "danger",
};

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
  const setPrintStatus = useOrderStore((s) => s.setPrintStatus);
  const confirmAiReview = useOrderStore((s) => s.confirmAiReview);
  const toast = useUiStore((s) => s.toast);
  const printerAvailable = useSettingsStore((s) => s.printer.available);
  const [busy, setBusy] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [readyOpen, setReadyOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [reprintOpen, setReprintOpen] = useState(false);
  const [printFail, setPrintFail] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [rejectStep, setRejectStep] = useState<0 | 1 | 2>(0);
  const [reason, setReason] = useState(reasons[0]);
  const [other, setOther] = useState("");
  const [callOpen, setCallOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [aiReviewOpen, setAiReviewOpen] = useState(false);
  const [aiConfirmOpen, setAiConfirmOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState<OrderItemType[]>([]);

  const needsAiReview = Boolean(order?.aiReview?.required && !order.aiReview.reviewed);

  const actions = useMemo(() => {
    if (!order) return [];
    type Action = { label: string; variant: "primary" | "danger" | "secondary"; onClick: () => void };
    const list: Action[] = [];
    if (needsAiReview) {
      list.push({
        label: t("orders.review"),
        variant: "primary",
        onClick: () => {
          setAiDraft(order.items.map((item) => ({ ...item })));
          setAiReviewOpen(true);
        },
      });
      if (canTransition(order.status, "cancelled")) {
        list.push({ label: t("orders.reject"), variant: "danger", onClick: () => setRejectStep(1) });
      }
      return list;
    }
    if (canTransition(order.status, "preparing")) {
      list.push({ label: t("orders.accept"), variant: "primary", onClick: () => setAcceptOpen(true) });
    }
    if (canTransition(order.status, "ready")) {
      list.push({ label: t("orders.markReady"), variant: "primary", onClick: () => setReadyOpen(true) });
    }
    if (canTransition(order.status, "completed")) {
      list.push({ label: t("orders.complete"), variant: "primary", onClick: () => setCompleteOpen(true) });
    }
    if (order.status === "preparing" || order.status === "ready") {
      list.push({ label: t("orders.print"), variant: "secondary", onClick: () => setPrintOpen(true) });
    }
    if (order.status === "completed") {
      list.push({ label: t("orders.reprint"), variant: "secondary", onClick: () => setReprintOpen(true) });
    }
    if (canTransition(order.status, "cancelled")) {
      list.push({ label: t("orders.reject"), variant: "danger", onClick: () => setRejectStep(1) });
    }
    return list;
  }, [order, needsAiReview, t]);

  async function move(status: OrderStatus, success: string, rejectReason?: string) {
    if (!order) return;
    setBusy(true);
    try {
      await transition(order.number, status, rejectReason);
      toast(status === "cancelled" ? "error" : "success", success);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : t("orders.updateError"));
    } finally {
      setBusy(false);
    }
  }

  async function print(isReprint: boolean) {
    if (!order) return;
    setPrinting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setPrinting(false);
    if (!printerAvailable) {
      await setPrintStatus(order.number, "failed");
      setPrintFail(true);
      toast("error", t("orders.printerUnavailable"));
      return;
    }
    await setPrintStatus(order.number, "printed");
    setPrintOpen(false);
    setReprintOpen(false);
    toast("success", isReprint ? t("orders.reprinted") : t("orders.printed"));
  }

  async function confirmAiCorrection() {
    if (!order) return;
    setBusy(true);
    try {
      await confirmAiReview(order.number, aiDraft);
      toast("success", t("orders.aiReviewed", { number: order.number }));
    } finally {
      setBusy(false);
      setAiConfirmOpen(false);
      setAiReviewOpen(false);
    }
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
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">Order #{order.number}</h2>
                  <StatusBadge status={order.status} />
                  {order.status !== "completed" && order.status !== "cancelled" ? <WaitingBadge createdAt={order.createdAt} /> : null}
                </div>
                <p className="mt-1 text-sm text-muted">{t("orders.received", { time: formatRelative(order.createdAt) })}</p>
              </div>
              <button type="button" aria-label={t("common.close")} onClick={onClose} className="text-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {order.issues.length > 0 ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/40 bg-danger-muted p-3 text-sm text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  {order.issues.map((code) => (
                    <p key={code}>{t(`orders.issueCodes.${code}`)}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {needsAiReview ? (
              <div className="mb-4 rounded-xl border border-danger/40 bg-danger-muted p-3 text-sm text-danger">
                <p className="font-medium">{t("orders.aiReviewBadge")}</p>
                <p className="mt-0.5 text-xs opacity-90">{t("orders.aiReviewHint")}</p>
              </div>
            ) : null}

            <section className="mb-5 flex flex-wrap items-center gap-2">
              <SourceIcon source={order.source} />
              <Badge tone="neutral">
                {order.fulfilment === "pickup" ? t("orders.pickup") : t("orders.delivery")}
              </Badge>
              <Badge tone={paymentTone[order.paymentStatus]}>{t(`orders.paymentStatuses.${order.paymentStatus}`)}</Badge>
              <Badge tone={printTone[order.printStatus]}>{t(`orders.printStatuses.${order.printStatus}`)}</Badge>
            </section>

            <section className="mb-5 rounded-xl border border-border bg-card p-3">
              <p className="mb-1 text-xs uppercase tracking-wide text-subtle">{t("orders.customer")}</p>
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

            {order.fulfilment === "delivery" ? (
              <section className="mb-5 rounded-xl border border-border bg-card p-3">
                <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-subtle">
                  <MapPin className="h-3.5 w-3.5" /> {t("orders.deliveryAddress")}
                </p>
                {order.deliveryAddress ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.deliveryAddress.line1}</p>
                      <p className="text-sm text-muted">{order.deliveryAddress.city}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {order.deliveryAddress.zone ? `${t("orders.deliveryZone")}: ${order.deliveryAddress.zone}` : null}
                        {order.deliveryAddress.zone && order.deliveryAddress.etaMinutes ? " · " : null}
                        {order.deliveryAddress.etaMinutes ? `${t("orders.eta")}: ${order.deliveryAddress.etaMinutes} min` : null}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setNavOpen(true)}>
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-danger">{t("orders.noAddress")}</p>
                )}
              </section>
            ) : null}

            <section className="mb-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-subtle">{t("orders.items")}</p>
              <div className="rounded-xl border border-border bg-card px-3">
                {order.items.map((item) => (
                  <OrderItem key={item.id} item={item} />
                ))}
                <div className="flex justify-between border-t border-border py-3 text-sm font-semibold">
                  <span>{t("orders.total")}</span>
                  <span>{formatEuro(order.total)}</span>
                </div>
              </div>
            </section>

            {order.notes ? (
              <section className="mb-5">
                <p className="mb-2 text-xs uppercase tracking-wide text-subtle">{t("orders.notes")}</p>
                <p className="rounded-xl border border-border bg-card p-3 text-sm">{order.notes}</p>
              </section>
            ) : null}

            {order.printStatus === "failed" ? (
              <section className="mb-5 flex items-center justify-between rounded-xl border border-danger/40 bg-danger-muted p-3 text-sm text-danger">
                <span className="flex items-center gap-2"><Printer className="h-4 w-4" /> {t(`orders.printStatuses.failed`)}</span>
                <Button size="sm" variant="danger" onClick={() => void print(order.status === "completed")}>
                  {t("orders.retryPrint")}
                </Button>
              </section>
            ) : null}

            <section>
              <p className="mb-3 text-xs uppercase tracking-wide text-subtle">{t("orders.timeline")}</p>
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
              <p>{t(sourceLabelKey(order.source))}</p>
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
        cancelLabel={t("common.cancel")}
        extra={<Printer className="h-4 w-4 text-muted" />}
        onCancel={() => setPrintOpen(false)}
        onConfirm={() => void print(false)}
      />
      <ConfirmModal
        open={reprintOpen}
        title={t("dialogs.reprintTitle")}
        description={t("dialogs.reprintBody")}
        confirmLabel={printing ? t("common.loading") : t("orders.reprint")}
        cancelLabel={t("common.cancel")}
        extra={<Printer className="h-4 w-4 text-muted" />}
        onCancel={() => setReprintOpen(false)}
        onConfirm={() => void print(true)}
      />
      <ConfirmModal
        open={printFail}
        title={t("orders.printerUnavailable")}
        description={t("orders.printerUnavailable")}
        confirmLabel={t("common.retry")}
        cancelLabel={t("common.cancel")}
        onCancel={() => {
          setPrintFail(false);
          setPrintOpen(false);
          setReprintOpen(false);
        }}
        onConfirm={() => {
          setPrintFail(false);
          void print(reprintOpen);
        }}
      />
      <ConfirmModal
        open={callOpen}
        title={t("dialogs.callTitle")}
        description={`${order?.customer.name ?? ""} · ${order?.customer.phone ?? ""}`}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setCallOpen(false)}
        onConfirm={() => {
          toast("info", t("orders.calling", { phone: order?.customer.phone }));
          setCallOpen(false);
        }}
      />
      <ConfirmModal
        open={navOpen}
        title={t("dialogs.navTitle")}
        description={order?.deliveryAddress ? `${order.deliveryAddress.line1}, ${order.deliveryAddress.city}` : ""}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
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
        cancelLabel={t("common.cancel")}
        variant="danger"
        onCancel={() => setRejectStep(0)}
        onConfirm={async () => {
          await move("cancelled", t("orders.rejected", { number: order?.number }), reason === "Other" ? other : reason);
          setRejectStep(0);
        }}
      />

      <Modal open={aiReviewOpen} title={t("orders.editOrder")} onClose={() => setAiReviewOpen(false)} width="max-w-lg">
        {order ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 p-3 text-sm">
              <ShoppingBag className="h-4 w-4 text-muted" />
              <span>{order.customer.name} · {order.customer.phone}</span>
            </div>
            {order.fulfilment === "delivery" ? (
              <p className="text-sm text-muted">
                {t("orders.deliveryAddress")}: {order.deliveryAddress ? `${order.deliveryAddress.line1}, ${order.deliveryAddress.city}` : t("orders.noAddress")}
              </p>
            ) : (
              <p className="text-sm text-muted">{t("orders.pickup")}</p>
            )}
            <div className="space-y-2">
              {aiDraft.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[1fr_72px_88px] items-center gap-2 rounded-lg border border-border p-2">
                  <span className="text-sm">{item.name}</span>
                  <TextInput
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const quantity = Math.max(1, Number(e.target.value) || 1);
                      setAiDraft((prev) => prev.map((row, i) => (i === index ? { ...row, quantity } : row)));
                    }}
                  />
                  <span className="text-right text-sm text-muted">{formatEuro(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>{t("orders.total")}</span>
              <span>{formatEuro(aiDraft.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAiReviewOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={() => setAiConfirmOpen(true)}>{t("orders.confirmOrder")}</Button>
            </div>
          </div>
        ) : null}
      </Modal>
      <ConfirmModal
        open={aiConfirmOpen}
        title={t("dialogs.aiConfirmTitle")}
        description={t("dialogs.aiConfirmBody")}
        confirmLabel={t("orders.confirmOrder")}
        cancelLabel={t("common.cancel")}
        loading={busy}
        onCancel={() => setAiConfirmOpen(false)}
        onConfirm={() => void confirmAiCorrection()}
      />
    </>
  );
}
