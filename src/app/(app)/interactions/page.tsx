"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Phone, Share2, Home, ArrowRightLeft, Flag } from "lucide-react";
import { DEMO_INTERACTIONS, DEMO_RECORDS, DEMO_TEAM } from "@/lib/demo-data";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";

const TYPE_ICONS = {
  note: MessageSquare,
  call: Phone,
  referral: Share2,
  placement: Home,
  status_change: ArrowRightLeft,
  flag: Flag,
  assignment: MessageSquare,
  other: MessageSquare,
};

export default function InteractionsPage() {
  const router = useRouter();

  const enriched = DEMO_INTERACTIONS.map((i) => ({
    ...i,
    record: DEMO_RECORDS.find((r) => r.id === i.record_id),
    author: DEMO_TEAM.find((u) => u.id === i.author_id),
  })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Interactions</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          All team interactions across records
        </p>
      </div>

      <div className="space-y-2">
        {enriched.map((interaction) => {
          const Icon = TYPE_ICONS[interaction.type] ?? MessageSquare;
          return (
            <button
              key={interaction.id}
              onClick={() => interaction.record && router.push(`/records/${interaction.record.id}`)}
              className="w-full flex items-start gap-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] transition-colors text-left"
            >
              <div className="h-9 w-9 rounded-full bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {interaction.record && (
                    <span className="font-medium text-sm">{interaction.record.full_name}</span>
                  )}
                  <span className="text-xs text-[var(--muted-foreground)] capitalize">
                    · {interaction.type.replace("_", " ")}
                  </span>
                  {interaction.record && (
                    <StatusBadge status={interaction.record.status} />
                  )}
                </div>

                <p className="text-sm text-[var(--foreground)] line-clamp-2 leading-relaxed">
                  {interaction.content}
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[var(--muted-foreground)]">
                  {interaction.author && (
                    <div className="flex items-center gap-1">
                      <Avatar name={interaction.author.full_name} size="sm" />
                      <span>{interaction.author.full_name}</span>
                    </div>
                  )}
                  <span title={formatDateTime(interaction.created_at)}>
                    · {formatRelativeTime(interaction.created_at)}
                  </span>
                  {interaction.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded bg-[var(--muted)]">{tag}</span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
