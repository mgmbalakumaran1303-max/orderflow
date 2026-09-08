import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/StatusBadge";
import { notificationRepository } from "@/services/api/searchRepository";
import type { AppNotification } from "@/types";

export function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<AppNotification[]>([]);

  useEffect(() => {
    void notificationRepository.list().then(setNotes);
  }, []);

  return (
    <div>
      <PageHeader title={t("notifications.title")} />
      <Card padding={false}>
        {notes.length === 0 ? (
          <EmptyState icon={<Bell className="h-8 w-8" />} title={t("notifications.empty")} description="" />
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <button type="button" className="text-left" onClick={() => navigate(note.href)}>
                <p className="text-sm font-medium">{note.title}</p>
                <p className="text-xs text-muted">{note.body}</p>
              </button>
              <div className="flex items-center gap-2">
                <Badge tone={note.read ? "neutral" : "info"}>{note.read ? t("notifications.read") : t("notifications.unread")}</Badge>
                {!note.read ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await notificationRepository.markRead(note.id);
                      setNotes((prev) => prev.map((item) => (item.id === note.id ? { ...item, read: true } : item)));
                    }}
                  >
                    {t("notifications.markRead")}
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
