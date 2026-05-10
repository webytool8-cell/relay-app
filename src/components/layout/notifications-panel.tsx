"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Check, AlertTriangle, MessageSquare, Users, ArrowRightLeft } from "lucide-react";
import { useRecords } from "@/contexts/records-context";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_CONFIG = {
  flag: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
  interaction: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
  assignment: { icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
  status: { icon: ArrowRightLeft, color: "text-emerald-500", bg: "bg-emerald-50" },
};

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const router = useRouter();
  const { notifications, markAllRead, unreadCount } = useRecords();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  function handleNotifClick(recordId: string) {
    onClose();
    router.push(`/records/${recordId}`);
  }

  return (
    <div ref={panelRef}
      className="absolute right-0 top-full mt-1 w-80 sm:w-96 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7 gap-1">
              <Check className="h-3 w-3" /> Mark read
            </Button>
          )}
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border)]">
        {notifications.length === 0 && (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">No notifications</div>
        )}
        {notifications.map((notif) => {
          const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.interaction;
          const Icon = config.icon;
          return (
            <button
              key={notif.id}
              onClick={() => handleNotifClick(notif.record_id)}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors",
                !notif.read && "bg-blue-50/40 dark:bg-blue-950/20"
              )}
            >
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{notif.record_name}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{formatRelativeTime(notif.created_at)}</p>
              </div>
              {!notif.read && <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
