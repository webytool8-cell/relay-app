"use client";

import { useState, useMemo, useCallback } from "react";
import { DEMO_RECORDS } from "@/lib/demo-data";

export type SearchResult = (typeof DEMO_RECORDS)[number];

// Levenshtein distance for typo tolerance
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? dp[j - 1] : 1 + Math.min(dp[j - 1], dp[j], prev);
      dp[j - 1] = prev;
      prev = val;
    }
    dp[b.length] = prev;
  }
  return dp[b.length];
}

function scoreToken(token: string, field: string, weight: number): number {
  if (!field) return 0;
  const f = field.toLowerCase();
  const t = token.toLowerCase();

  // Exact word match
  if (f === t) return weight * 4;
  // Starts with token
  if (f.startsWith(t)) return weight * 3;
  // Word within field starts with token
  if (f.split(/\s+/).some((w) => w.startsWith(t))) return weight * 2.5;
  // Contains token
  if (f.includes(t)) return weight * 1.5;
  // Typo tolerance: levenshtein ≤ 1 for tokens ≥ 4 chars, ≤ 2 for ≥ 6 chars
  const dist = levenshtein(t, f.slice(0, t.length + 2));
  const threshold = t.length >= 6 ? 2 : t.length >= 4 ? 1 : 0;
  if (dist <= threshold) return weight * 1;
  // Fuzzy subsequence
  let qi = 0;
  for (let i = 0; i < f.length && qi < t.length; i++) {
    if (f[i] === t[qi]) qi++;
  }
  if (qi === t.length) return weight * 0.4;

  return 0;
}

// Detect age query like "age 46", "~60", "60 year"
function parseAgeQuery(q: string): number | null {
  const m = q.match(/(?:age\s*|~|\b)(\d{1,3})(?:\s*y(?:ear)?s?)?(?:\b|$)/i);
  return m ? parseInt(m[1], 10) : null;
}

export function scoreRecord(record: SearchResult, query: string): number {
  const q = query.trim();
  if (!q) return 0;

  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;

  const fields = [
    { text: record.full_name, weight: 10 },
    { text: record.preferred_name ?? "", weight: 9 },
    { text: record.aliases.join(" "), weight: 8 },
    { text: record.org_record_id ?? "", weight: 7 },
    { text: record.status, weight: 3 },
    { text: record.gender ?? "", weight: 3 },
    { text: record.program ?? "", weight: 4 },
    { text: record.assigned_team ?? "", weight: 3 },
    { text: record.notes ?? "", weight: 2 },
    { text: Object.values(record.metadata as { [k: string]: unknown }).map(String).join(" "), weight: 3 },
    { text: record.phone ?? "", weight: 5 },
  ];

  // Age query boost
  const ageQuery = parseAgeQuery(q);
  if (ageQuery !== null && record.approximate_age) {
    const diff = Math.abs(record.approximate_age - ageQuery);
    if (diff === 0) score += 15;
    else if (diff <= 2) score += 8;
    else if (diff <= 5) score += 3;
  }

  for (const token of tokens) {
    let tokenScore = 0;
    for (const { text, weight } of fields) {
      tokenScore += scoreToken(token, text, weight);
    }
    // All tokens must contribute something for multi-word queries
    if (tokenScore === 0 && tokens.length > 1) return 0;
    score += tokenScore;
  }

  return score;
}

const RECENT_SEARCHES_KEY = "relay:recent-searches";
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
    setRecentSearches(getRecent(RECENT_SEARCHES_KEY));
    setRecentProfiles(getRecent(RECENT_PROFILES_KEY));
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    return DEMO_RECORDS
      .map((r) => ({ record: r, score: scoreRecord(r, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ record }) => record)
      .slice(0, 8);
  }, [query]);

  function commitSearch(q: string) {
    if (q.trim()) {
      saveRecent(RECENT_SEARCHES_KEY, q.trim());
      setRecentSearches(getRecent(RECENT_SEARCHES_KEY));
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
