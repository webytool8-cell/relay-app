"use client";

import { useState, useMemo, useCallback } from "react";
import { DEMO_RECORDS } from "@/lib/demo-data";

type SearchResult = (typeof DEMO_RECORDS)[number];

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

function scoreRecord(record: SearchResult, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const tokens = tokenize(q);
  let score = 0;

  const fields = [
    { text: record.full_name, weight: 10 },
    { text: record.preferred_name ?? "", weight: 8 },
    { text: record.aliases.join(" "), weight: 7 },
    { text: record.status, weight: 4 },
    { text: record.gender ?? "", weight: 3 },
    { text: record.program ?? "", weight: 3 },
    { text: record.assigned_team ?? "", weight: 2 },
    { text: record.notes ?? "", weight: 2 },
    { text: Object.values(record.metadata as { [k: string]: unknown }).map(String).join(" "), weight: 2 },
    { text: record.org_record_id ?? "", weight: 5 },
  ];

  for (const token of tokens) {
    for (const { text, weight } of fields) {
      if (!text) continue;
      const t = text.toLowerCase();

      if (t === token) {
        score += weight * 3;
      } else if (t.startsWith(token)) {
        score += weight * 2;
      } else if (t.includes(token)) {
        score += weight;
      } else {
        // Fuzzy: all chars of token appear in order in text
        let qi = 0;
        for (let i = 0; i < t.length && qi < token.length; i++) {
          if (t[i] === token[qi]) qi++;
        }
        if (qi === token.length) score += weight * 0.5;
      }
    }
  }

  return score;
}

const RECENT_STORAGE_KEY = "relay:recent-searches";
const RECENT_PROFILES_KEY = "relay:recent-profiles";

function getRecent(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(key: string, value: string) {
  if (typeof window === "undefined") return;
  const existing = getRecent(key).filter((v) => v !== value);
  localStorage.setItem(key, JSON.stringify([value, ...existing].slice(0, 8)));
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentProfiles, setRecentProfiles] = useState<string[]>([]);

  const loadRecents = useCallback(() => {
    setRecentSearches(getRecent(RECENT_STORAGE_KEY));
    setRecentProfiles(getRecent(RECENT_PROFILES_KEY));
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    return DEMO_RECORDS.map((r) => ({ record: r, score: scoreRecord(r, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ record }) => record)
      .slice(0, 8);
  }, [query]);

  function commitSearch(q: string) {
    if (q.trim()) {
      saveRecent(RECENT_STORAGE_KEY, q.trim());
      setRecentSearches(getRecent(RECENT_STORAGE_KEY));
    }
  }

  function visitProfile(id: string) {
    saveRecent(RECENT_PROFILES_KEY, id);
    setRecentProfiles(getRecent(RECENT_PROFILES_KEY));
  }

  const recentProfileRecords = useMemo(() => {
    return recentProfiles
      .map((id) => DEMO_RECORDS.find((r) => r.id === id))
      .filter(Boolean) as SearchResult[];
  }, [recentProfiles]);

  return {
    query,
    setQuery,
    results,
    recentSearches,
    recentProfileRecords,
    commitSearch,
    visitProfile,
    loadRecents,
  };
}
