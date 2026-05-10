"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, ArrowRight, X, Hash, Flag, ChevronRight } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useSearch } from "@/hooks/use-search";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { FLAG_MAP } from "@/lib/demo-data";

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  let result = text;
  for (const token of tokens) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
  }
  return result;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const {
    query, setQuery, results,
    recentSearches, recentProfileRecords,
    commitSearch, visitProfile, loadRecents,
  } = useSearch();

  const showResults = query.trim().length > 0;
  const items = showResults ? results : recentProfileRecords.slice(0, 5);

  useEffect(() => {
    if (open) {
      loadRecents();
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, loadRecents, setQuery]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = useCallback((recordId: string) => {
    commitSearch(query);
    visitProfile(recordId);
    onClose();
    router.push(`/records/${recordId}`);
  }, [query, commitSearch, visitProfile, onClose, router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, items.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && items[activeIndex]) handleSelect(items[activeIndex].id);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/*
        Desktop: centered modal
        Mobile: bottom sheet anchored to bottom of screen
      */}
      <div
        className={cn(
          "absolute bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden",
          // Mobile: full-width bottom sheet
          "inset-x-0 bottom-0 rounded-t-2xl",
          // Desktop: centered modal
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-[10vh]",
          "sm:w-full sm:max-w-2xl sm:rounded-xl",
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
        </div>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, alias, ID, notes, attributes..."
            className="flex-1 bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-base sm:text-sm outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:flex h-5 items-center rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 text-[10px] font-mono text-[var(--muted-foreground)]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results area */}
        <div ref={listRef} className="overflow-y-auto max-h-[55vh] sm:max-h-[60vh]">
          {/* Section label */}
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
                  {recentProfileRecords.length > 0 ? "Recently viewed" : "Start typing to search"}
                </span>
              </>
            )}
          </div>

          {/* No results */}
          {items.length === 0 && showResults && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">No records found</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 opacity-70">
                Try &ldquo;jhon&rdquo;, &ldquo;veteran Brooklyn&rdquo;, or &ldquo;wheelchair&rdquo;
              </p>
            </div>
          )}

          {/* Result rows */}
          <ul>
            {items.map((record, i) => (
              <li key={record.id}>
                <button
                  data-index={i}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 text-left transition-colors",
                    i === activeIndex ? "bg-[var(--accent)]" : "hover:bg-[var(--accent)]"
                  )}
                  onClick={() => handleSelect(record.id)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <Avatar name={record.full_name} size="md" className="flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    {/* Name row */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span
                        className="text-sm font-medium"
                        dangerouslySetInnerHTML={{ __html: highlightText(record.full_name, query) }}
                      />
                      {record.preferred_name && record.preferred_name !== record.full_name && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          &ldquo;{record.preferred_name}&rdquo;
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {record.org_record_id && (
                        <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-0.5">
                          <Hash className="h-2.5 w-2.5" />{record.org_record_id}
                        </span>
                      )}
                      {record.assigned_team && (
                        <span className="text-[10px] text-[var(--muted-foreground)]">{record.assigned_team}</span>
                      )}
                      {record.program && (
                        <span className="text-[10px] text-[var(--muted-foreground)]">· {record.program}</span>
                      )}
                    </div>

                    {/* Aliases */}
                    {query && record.aliases.length > 0 && (
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {record.aliases.map((a) => (
                          <span key={a} className="text-[10px] text-[var(--muted-foreground)] italic">
                            aka &ldquo;{a}&rdquo;
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Matched note snippet */}
                    {query && record.notes && record.notes.toLowerCase().includes(query.toLowerCase().split(/\s+/)[0]) && (
                      <p
                        className="text-[10px] text-[var(--muted-foreground)] mt-0.5 line-clamp-1 italic"
                        dangerouslySetInnerHTML={{ __html: highlightText(record.notes.slice(0, 100), query) }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={record.status} />
                    {record.active_flags && record.active_flags.length > 0 && (
                      <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                        <Flag className="h-2.5 w-2.5" />
                        {FLAG_MAP[record.active_flags[0].type]?.label ?? record.active_flags[0].label}
                      </span>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0 ml-1" />
                </button>
              </li>
            ))}
          </ul>

          {/* Recent searches */}
          {!showResults && recentSearches.length > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-3">
              <p className="text-xs text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Recent searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — desktop only */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-t border-[var(--border)] bg-[var(--muted)]">
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
            Try &ldquo;veteran Brooklyn&rdquo; · &ldquo;jhon&rdquo; · &ldquo;wheelchair&rdquo;
          </span>
        </div>

        {/* Mobile close button */}
        <div className="sm:hidden px-4 py-3 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-[var(--muted)] text-sm text-[var(--muted-foreground)] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
