"use client";

import { AlertTriangle, X, CheckCircle2 } from "lucide-react";
import type { Flag } from "@/types/database";
import { cn } from "@/lib/utils";
import { FLAG_MAP } from "@/lib/demo-data";
import { useRecords } from "@/contexts/records-context";

interface FlagBannerProps {
  flags: Flag[];
  recordId: string;
}

export function FlagBanner({ flags, recordId }: FlagBannerProps) {
  const { resolveFlag } = useRecords();
  if (flags.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {flags.map((flag) => {
        const config = FLAG_MAP[flag.type] ?? FLAG_MAP.custom;
        return (
          <div key={flag.id} className={cn("flex items-start gap-3 p-3 rounded-lg border", config.bg, config.color)}>
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{config.label}</p>
              {flag.description && <p className="text-xs mt-0.5 opacity-80">{flag.description}</p>}
            </div>
            <button
              onClick={() => resolveFlag(flag.id, recordId)}
              className="flex-shrink-0 flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
              title="Mark as resolved"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Resolve</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
