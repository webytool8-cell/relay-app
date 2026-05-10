"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal, Flag, Users } from "lucide-react";
import { DEMO_RECORDS, DEMO_STATUSES } from "@/lib/demo-data";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type SortKey = "name" | "updated" | "status";

export default function RecordsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<"list" | "grid">("list");

  const filtered = useMemo(() => {
    let records = [...DEMO_RECORDS];

    if (statusFilter) records = records.filter((r) => r.status === statusFilter);

    if (query.trim()) {
      const q = query.toLowerCase();
      records = records.filter((r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.preferred_name?.toLowerCase().includes(q) ||
        r.aliases.some((a) => a.toLowerCase().includes(q)) ||
        r.org_record_id?.toLowerCase().includes(q) ||
        r.program?.toLowerCase().includes(q)
      );
    }

    if (sort === "name") records.sort((a, b) => a.full_name.localeCompare(b.full_name));
    else if (sort === "updated") records.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    else if (sort === "status") records.sort((a, b) => a.status.localeCompare(b.status));

    return records;
  }, [query, statusFilter, sort]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DEMO_RECORDS.forEach((r) => {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Records</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            {DEMO_RECORDS.length} total records
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Record</span>
        </Button>
      </div>

      {/* Status summary pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter("")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            statusFilter === ""
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent"
              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]"
          }`}
        >
          All ({DEMO_RECORDS.length})
        </button>
        {DEMO_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(statusFilter === s.value ? "" : s.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s.value
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]"
            }`}
          >
            {s.label} ({statusCounts[s.value] ?? 0})
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter records..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 px-2 text-xs rounded-lg border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-[var(--foreground)]"
        >
          <option value="updated">Last Updated</option>
          <option value="name">Name A-Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Records */}
      <div className="space-y-1.5">
        {filtered.map((record) => (
          <button
            key={record.id}
            onClick={() => router.push(`/records/${record.id}`)}
            className="w-full flex items-center gap-3 p-3.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] transition-colors text-left group"
          >
            <Avatar name={record.full_name} size="md" />

            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-sm truncate">{record.full_name}</span>
                  {record.preferred_name && record.preferred_name !== record.full_name && (
                    <span className="text-[10px] text-[var(--muted-foreground)] hidden sm:inline">
                      &ldquo;{record.preferred_name}&rdquo;
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                  {record.org_record_id && <span>#{record.org_record_id}</span>}
                  {record.gender && <span>· {record.gender}</span>}
                  {record.approximate_age && <span>· ~{record.approximate_age}y</span>}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                {record.assigned_user ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={record.assigned_user.full_name} size="sm" />
                    <span className="truncate">{record.assigned_user.full_name}</span>
                  </div>
                ) : (
                  <span className="text-[var(--muted-foreground)]">Unassigned</span>
                )}
              </div>

              <div className="hidden sm:block text-xs text-[var(--muted-foreground)]">
                {record.program && <div className="truncate">{record.program}</div>}
                <div className="text-[10px] mt-0.5">{formatRelativeTime(record.updated_at)}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 flex-shrink-0">
              <StatusBadge status={record.status} />
              {record.active_flags && record.active_flags.length > 0 && (
                <span className="text-[10px] text-red-500 flex items-center gap-0.5 font-medium">
                  <Flag className="h-2.5 w-2.5" />
                  {record.active_flags.length}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No records match</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
