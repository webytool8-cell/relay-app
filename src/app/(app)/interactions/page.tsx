"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Phone, Share2, Home, ArrowRightLeft, Flag, Search } from "lucide-react";
import { useRecords } from "@/contexts/records-context";
import { DEMO_TEAM } from "@/lib/demo-data";
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

const TYPE_LABELS: Record<string, string> = {
  note: "Note",
  call: "Call",
  referral: "Referral",
  placement: "Placement",
  status_change: "Status Change",
  flag: "Flag",
  assignment: "Assignment",
  other: "Other",
};

export default function InteractionsPage() {
  const router = useRouter();
  const { interactions, records } = useRecords();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const enriched = useMemo(() => {
    return interactions
      .map((i) => ({
        ...i,
        record: records.find((r) => r.id === i.record_id),
        author: DEMO_TEAM.find((u) => u.id === i.author_id),
      }))
      .filter((i) => {
        if (typeFilter && i.type !== typeFilter) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          return (
            i.record?.full_name.toLowerCase().includes(q) ||
            i.content.toLowerCase().includes(q) ||
            i.author?.full_name.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [interactions, records, query, typeFilter]);

  const types = useMemo(() => {
    const seen = new Set<string>();
    interactions.forEach((i) => seen.add(i.type));
    return Array.from(seen);
  }, [interactions]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Interactions</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          {enriched.length} of {interactions.length} interactions
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search interactions..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 px-2 text-xs rounded-lg border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-[var(--foreground)]"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {enriched.map((interaction) => {
          const Icon = TYPE_ICONS[interaction.type as keyof typeof TYPE_ICONS] ?? MessageSquare;
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
                    · {TYPE_LABELS[interaction.type] ?? interaction.type}
                  </span>
                  {interaction.record && (
                    <StatusBadge status={interaction.record.status} />
                  )}
                </div>

                <p className="text-sm text-[var(--foreground)] line-clamp-2 leading-relaxed">
                  {interaction.content}
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-1">
                    <Avatar name={interaction.author?.full_name ?? "Alex Rivera"} size="sm" />
                    <span>{interaction.author?.full_name ?? "Alex Rivera"}</span>
                  </div>
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
        {enriched.length === 0 && (
          <div className="text-center py-16 text-sm text-[var(--muted-foreground)]">
            No interactions match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
