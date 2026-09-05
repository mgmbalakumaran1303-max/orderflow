import { BookOpen, Headphones, Printer, Radio, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Modal } from "@/components/modals/Modal";
import { useUiStore } from "@/stores/uiStore";

const topics = [
  { icon: BookOpen, title: "Getting Started", body: "Sign in, pick a restaurant, and review today’s incoming orders on the dashboard." },
  { icon: ShoppingBag, title: "Orders", body: "Open an order from the list to accept, reject, mark ready, complete, or print without leaving the page." },
  { icon: UtensilsCrossed, title: "Menu", body: "Edit categories, prices, variants and availability. Saving publishes changes to customers." },
  { icon: Printer, title: "Printer", body: "Configure the kitchen printer in Settings. Use Test Print if tickets are not arriving." },
  { icon: Radio, title: "Channels", body: "Connect Uber Eats, Wolt, WhatsApp and website orders. Disable a channel to pause incoming tickets." },
  { icon: Headphones, title: "Contact Support", body: "Email support@orderflow.app or call +49 30 000 111. Include the order number when reporting issues." },
];

export function HelpCenterModal() {
  const open = useUiStore((s) => s.helpOpen);
  const setOpen = useUiStore((s) => s.setHelpOpen);
  return (
    <Modal open={open} title="Help Center" onClose={() => setOpen(false)} width="max-w-lg">
      <div className="space-y-3">
        {topics.map((topic) => (
          <div key={topic.title} className="rounded-lg border border-border bg-surface-2 p-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium">
              <topic.icon className="h-4 w-4 text-primary" />
              {topic.title}
            </div>
            <p className="text-sm text-muted">{topic.body}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
