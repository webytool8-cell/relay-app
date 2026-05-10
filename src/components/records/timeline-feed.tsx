"use client";

import { useState } from "react";
import {
  MessageSquare,
  ArrowRightLeft,
  Phone,
  Share2,
  Home,
  Flag as FlagIcon,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import type { Interaction } from "@/types/database";
import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_TEAM } from "@/lib/demo-data";

const TYPE_CONFIG = {
  note: { icon: MessageSquare, label: "Note", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  status_change: { icon: ArrowRightLeft, label: "Status Change", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
  assignment: { icon: MoreHorizontal, label: "Assignment", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
  call: { icon: Phone, label: "Call Logged", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  referral: { icon: Share2, label: "Referral", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  placement: { icon: Home, label: "Placement", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  flag: { icon: FlagIcon, label: "Flag Added", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  other: { icon: MoreHorizontal, label: "Other", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
};

interface TimelineFeedProps {
  interactions: Interaction[];
  recordId: string;
}

export function TimelineFeed({ interactions, recordId }: TimelineFeedProps) {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [localInteractions, setLocalInteractions] = useState<Interaction[]>(interactions);

  function handleAddNote() {
    if (!noteText.trim()) return;
    const newInteraction: Interaction = {
      id: `int_${Date.now()}`,
      record_id: recordId,
      organization_id: "org_001",
      author_id: "usr_current",
      type: "note",
      content: noteText.trim(),
      tags: [],
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setLocalInteractions([newInteraction, ...localInteractions]);
    setNoteText("");
    setShowNote(false);
  }

  function getAuthorName(authorId: string): string {
    return DEMO_TEAM.find((u) => u.id === authorId)?.full_name ?? "Unknown";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Timeline</h3>
        <Button size="sm" variant="outline" onClick={() => setShowNote(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Note
        </Button>
      </div>

      {/* Add note form */}
      {showNote && (
        <div className="mb-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <Textarea
            autoFocus
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write a note..."
            className="mb-2"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setShowNote(false); setNoteText(""); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
              Save Note
            </Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
        <ul className="space-y-4 pl-10">
          {localInteractions.map((interaction) => {
            const config = TYPE_CONFIG[interaction.type] ?? TYPE_CONFIG.other;
            const Icon = config.icon;
            const authorName = getAuthorName(interaction.author_id);

            return (
              <li key={interaction.id} className="relative">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute -left-[26px] top-1 h-5 w-5 rounded-full border-2 border-[var(--background)] flex items-center justify-center",
                    interaction.type === "note" ? "bg-blue-100" :
                    interaction.type === "flag" ? "bg-red-100" :
                    interaction.type === "placement" ? "bg-blue-100" :
                    "bg-[var(--muted)]"
                  )}
                >
                  <Icon className={cn("h-2.5 w-2.5", config.color)} />
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                  <div className="flex items-start gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Avatar name={authorName} size="sm" />
                      <span className="text-xs font-medium">{authorName}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", config.bg, config.color)}>
                        {config.label}
                      </span>
                    </div>
                    <time
                      className="text-[10px] text-[var(--muted-foreground)] flex-shrink-0"
                      title={formatDateTime(interaction.created_at)}
                    >
                      {formatRelativeTime(interaction.created_at)}
                    </time>
                  </div>

                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                    {interaction.content}
                  </p>

                  {interaction.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {interaction.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {localInteractions.length === 0 && (
        <div className="text-center py-8 text-sm text-[var(--muted-foreground)]">
          No interactions yet
        </div>
      )}
    </div>
  );
}
