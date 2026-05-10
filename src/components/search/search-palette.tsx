"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, User, ArrowRight, X, Hash } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useSearch } from "@/hooks/use-search";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { FLAG_MAP } from "@/lib/demo-data";

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { query, setQuery, results, recentSearches, recentProfileRecords, commitSearch, visitProfile, loadRecents } =
    useSearch();

  const showResults = query.trim().length > 0;
  const items = showResults ? results : recentProfileRecords.slice(0, 5);

  useEffect(() => {
    if (open) {
      loadRecents();
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, loadRecents, setQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (recordId: string) => {
      commitSearch(query);
      visitProfile(recordId);
      onClose();
      router.push(`/records/${recordId}`);
    },
    [query, commitSearch, visitProfile, onClose, router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && items[activeIndex]) {
      handleSelect(items[activeIndex].id);
    }
  }

  function highlightText(text: string, query: string) {
    if (!query.trim()) return text;
    const tokens = query.trim().toLowerCase().split(/\s+/);
    let result = text;
    for (const token of tokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(
        new RegExp(`(${escaped})`, "gi"),
        "<mark>$1</mark>"
      );
    }
    return result;
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Palette */}
      <div
        className="relative w-full max-w-2xl bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
          <Search className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, alias, ID, location, notes..."
            className="flex-1 bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:flex h-5 items-center rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 text-[10px] font-mono text-[var(--muted-foreground)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Section header */}
          <div className="px-4 py-2 flex items-center gap-2">
            {showResults ? (
              <>
                <Search className="h-3 w-3 text-[var(--muted-foreground)]" />
                <span className="text-xs text-[var(--muted-foreground)]">
                  {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                </span>
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 text-[var(--muted-foreground)]" />
                <span className="text-xs text-[var(--muted-foreground)]">
                  {recentProfileRecords.length > 0 ? "Recently viewed" : "No recent activity"}
                </span>
              </>
            )}
          </div>

          {items.length === 0 && showResults && (
            <div className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
              No records found for &ldquo;{query}&rdquo;
            </div>
          )}

          {items.length === 0 && !showResults && (
            <div className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
              Start typing to search records
            </div>
          )}

          <ul>
            {items.map((record, i) => (
              <li key={record.id}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    i === activeIndex
                      ? "bg-[var(--accent)]"
                      : "hover:bg-[var(--accent)]"
                  )}
                  onClick={() => handleSelect(record.id)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <Avatar name={record.full_name} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-sm font-medium truncate"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(record.full_name, query),
                        }}
                      />
                      {record.preferred_name && record.preferred_name !== record.full_name && (
                        <span className="text-xs text-[var(--muted-foreground)] truncate">
                          &ldquo;{record.preferred_name}&rdquo;
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {record.org_record_id && (
                        <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-0.5">
                          <Hash className="h-2.5 w-2.5" />
                          {record.org_record_id}
                        </span>
                      )}
                      {record.assigned_team && (
                        <span className="text-[10px] text-[var(--muted-foreground)] truncate">
                          {record.assigned_team}
                        </span>
                      )}
                      {record.program && (
                        <span className="text-[10px] text-[var(--muted-foreground)] truncate">
                          · {record.program}
                        </span>
                      )}
                    </div>

                    {/* Aliases shown in search results */}
                    {query && record.aliases.length > 0 && (
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {record.aliases.map((alias) => (
                          <span key={alias} className="text-[10px] text-[var(--muted-foreground)] italic">
                            aka &ldquo;{alias}&rdquo;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={record.status} />
                    {record.active_flags && record.active_flags.length > 0 && (
                      <span className="text-[10px] text-red-600 font-medium">
                        {FLAG_MAP[record.active_flags[0].type]?.icon} {record.active_flags[0].label}
                      </span>
                    )}
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 text-[var(--muted-foreground)] flex-shrink-0 ml-1" />
                </button>
              </li>
            ))}
          </ul>

          {/* Recent searches */}
          {!showResults && recentSearches.length > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-2">
              <p className="text-xs text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Recent searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-xs px-2 py-1 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[var(--border)] bg-[var(--muted)]">
          <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
            <kbd className="rounded border border-[var(--border)] px-1 bg-[var(--background)] font-mono">↑↓</kbd> navigate
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
            <kbd className="rounded border border-[var(--border)] px-1 bg-[var(--background)] font-mono">↵</kbd> open
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
            <kbd className="rounded border border-[var(--border)] px-1 bg-[var(--background)] font-mono">ESC</kbd> close
          </span>
          <div className="flex-1" />
          <span className="text-[10px] text-[var(--muted-foreground)]">
            Tip: try &ldquo;veteran Brooklyn&rdquo; or &ldquo;wheelchair&rdquo;
          </span>
        </div>
      </div>
    </div>
  );
}
