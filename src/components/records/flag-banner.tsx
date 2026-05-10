"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { Flag } from "@/types/database";
import { cn } from "@/lib/utils";
import { FLAG_MAP } from "@/lib/demo-data";

interface FlagBannerProps {
  flags: Flag[];
}

export function FlagBanner({ flags }: FlagBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeFlags = flags.filter((f) => !f.resolved && !dismissed.has(f.id));

  if (activeFlags.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {activeFlags.map((flag) => {
        const config = FLAG_MAP[flag.type] ?? FLAG_MAP.custom;
        return (
          <div
            key={flag.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              config.bg,
              config.color
            )}
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{config.label}</p>
              {flag.description && (
                <p className="text-xs mt-0.5 opacity-80">{flag.description}</p>
              )}
            </div>
            <button
              onClick={() => setDismissed((s) => new Set([...s, flag.id]))}
              className="flex-shrink-0 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
