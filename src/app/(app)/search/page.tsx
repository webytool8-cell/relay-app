"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { DEMO_RECORDS, DEMO_STATUSES } from "@/lib/demo-data";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";

type FilterState = {
  status: string;
  gender: string;
  team: string;
  hasFlags: boolean;
};

function scoreRecord(record: (typeof DEMO_RECORDS)[number], query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const tokens = q.split(/\s+/);
  let score = 0;
  const fields = [
    { text: record.full_name, w: 10 },
    { text: record.preferred_name ?? "", w: 8 },
    { text: record.aliases.join(" "), w: 7 },
    { text: record.notes ?? "", w: 2 },
    { text: record.org_record_id ?? "", w: 5 },
    { text: record.assigned_team ?? "", w: 2 },
    { text: record.program ?? "", w: 3 },
    { text: Object.values(record.metadata as { [k: string]: unknown }).map(String).join(" "), w: 2 },
  ];
  for (const token of tokens) {
    for (const { text, w } of fields) {
      const t = text.toLowerCase();
      if (t.includes(token)) score += w;
      else {
        let qi = 0;
        for (let i = 0; i < t.length && qi < token.length; i++) {
          if (t[i] === token[qi]) qi++;
        }
        if (qi === token.length) score += w * 0.4;
      }
    }
  }
  return score;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    gender: "",
    team: "",
    hasFlags: false,
  });

  const teams = Array.from(new Set(DEMO_RECORDS.map((r) => r.assigned_team).filter(Boolean)));

  const filtered = useMemo(() => {
    let records = [...DEMO_RECORDS];

    if (filters.status) records = records.filter((r) => r.status === filters.status);
    if (filters.gender) records = records.filter((r) => r.gender?.toLowerCase() === filters.gender);
    if (filters.team) records = records.filter((r) => r.assigned_team === filters.team);
    if (filters.hasFlags) records = records.filter((r) => (r.active_flags?.length ?? 0) > 0);

    if (query.trim()) {
      records = records
        .map((r) => ({ r, score: scoreRecord(r, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ r }) => r);
    } else {
      records = records.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    return records;
  }, [query, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function highlightText(text: string) {
    if (!query.trim()) return text;
    const tokens = query.trim().toLowerCase().split(/\s+/);
    let result = text;
    for (const token of tokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
    }
    return result;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-1">Search Records</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Search by name, alias, ID, notes, location, or attributes
        </p>
      </div>

      {/* Search + filters bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "veteran Brooklyn" · "wheelchair Harlem" · "jhon" · "declined shelter"'
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-[var(--input)] bg-[var(--background)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="gap-2 flex-shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="h-4 w-4 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="mb-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full h-8 px-2 text-xs rounded border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
            >
              <option value="">All statuses</option>
              {DEMO_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
              className="w-full h-8 px-2 text-xs rounded border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Team</label>
            <select
              value={filters.team}
              onChange={(e) => setFilters((f) => ({ ...f, team: e.target.value }))}
              className="w-full h-8 px-2 text-xs rounded border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
            >
              <option value="">All teams</option>
              {teams.map((t) => (
                <option key={t!} value={t!}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasFlags}
                onChange={(e) => setFilters((f) => ({ ...f, hasFlags: e.target.checked }))}
                className="rounded"
              />
              <span className="text-xs">Has active flags</span>
            </label>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ status: "", gender: "", team: "", hasFlags: false })}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] mt-1"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--muted-foreground)]">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          {query.trim() && ` matching "${query}"`}
        </p>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.map((record) => (
          <button
            key={record.id}
            onClick={() => router.push(`/records/${record.id}`)}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] transition-colors text-left group"
          >
            <Avatar name={record.full_name} size="md" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span
                  className="font-medium text-sm"
                  dangerouslySetInnerHTML={{ __html: highlightText(record.full_name) }}
                />
                {record.preferred_name && record.preferred_name !== record.full_name && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    &ldquo;{record.preferred_name}&rdquo;
                  </span>
                )}
                {record.aliases.length > 0 && (
                  <span className="text-xs text-[var(--muted-foreground)] italic">
                    aka {record.aliases.slice(0, 2).join(", ")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] flex-wrap">
                {record.org_record_id && <span>#{record.org_record_id}</span>}
                {record.gender && <span>{record.gender}</span>}
                {record.approximate_age && <span>~{record.approximate_age}y</span>}
                {record.program && <span>· {record.program}</span>}
                {record.assigned_user && <span>· {record.assigned_user.full_name}</span>}
                <span className="text-[var(--muted-foreground)]">· {formatRelativeTime(record.updated_at)}</span>
              </div>

              {record.notes && query.trim() && (
                <p
                  className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: highlightText(record.notes) }}
                />
              )}
            </div>

            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <StatusBadge status={record.status} />
              {record.active_flags && record.active_flags.length > 0 && (
                <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                  <Flag className="h-2.5 w-2.5" />
                  {record.active_flags.length} flag{record.active_flags.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-[var(--muted-foreground)]">No records found</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Try different keywords or clear your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
