"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRecords } from "@/contexts/records-context";

const TYPES = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call Logged" },
  { value: "referral", label: "Referral Made" },
  { value: "placement", label: "Placement" },
  { value: "other", label: "Other" },
];

interface LogInteractionModalProps {
  open: boolean;
  onClose: () => void;
  recordId: string;
  recordName: string;
  defaultType?: string;
}

export function LogInteractionModal({ open, onClose, recordId, recordName, defaultType = "note" }: LogInteractionModalProps) {
  const { addInteraction } = useRecords();
  const [type, setType] = useState(defaultType);
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setType(defaultType); setContent(""); setTagInput(""); setLocation(""); }
  }, [open, defaultType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 250));

    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    const metadata: Record<string, string> = {};
    if (location.trim()) metadata.location = location.trim();

    addInteraction({
      record_id: recordId, organization_id: "org_001", author_id: "usr_current",
      type: type as never, content: content.trim(), tags, metadata: metadata as never,
    });

    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Interaction" description={recordName} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium block mb-1.5">Type</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  type === t.value ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5">Details <span className="text-red-500">*</span></label>
          <Textarea autoFocus value={content} onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === "call" ? "Who was called, outcome, voicemail left..." :
              type === "referral" ? "Referred to what service, contact info..." :
              type === "placement" ? "Location, room number, intake details..." :
              "What happened, what was discussed..."
            }
            rows={4} />
        </div>

        {(type === "call" || type === "note") && (
          <div>
            <label className="text-xs font-medium block mb-1.5">Location (optional)</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Penn Station, Harlem" />
          </div>
        )}

        <div>
          <label className="text-xs font-medium block mb-1.5">Tags (comma-separated)</label>
          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g. outreach, declined-shelter, phone" />
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || !content.trim()}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </Modal>
  );
}
