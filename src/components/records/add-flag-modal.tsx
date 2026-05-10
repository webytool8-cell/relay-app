"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRecords } from "@/contexts/records-context";
import { FLAG_MAP } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const FLAG_TYPES = [
  { value: "high_risk", label: "High Risk", icon: "⚠️", desc: "Immediate safety concern" },
  { value: "medical", label: "Medical Concern", icon: "🏥", desc: "Health issue needs attention" },
  { value: "escalated", label: "Escalated", icon: "🔺", desc: "Requires supervisor review" },
  { value: "priority", label: "Priority Follow-Up", icon: "⭐", desc: "Time-sensitive action needed" },
  { value: "custom", label: "Custom", icon: "🏷️", desc: "Other concern" },
];

interface AddFlagModalProps {
  open: boolean;
  onClose: () => void;
  recordId: string;
  recordName: string;
}

export function AddFlagModal({ open, onClose, recordId, recordName }: AddFlagModalProps) {
  const { addFlag } = useRecords();
  const [type, setType] = useState("high_risk");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setType("high_risk"); setDescription(""); }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 250));

    const flagType = FLAG_MAP[type] ?? FLAG_MAP.custom;
    addFlag({
      record_id: recordId, organization_id: "org_001", author_id: "usr_current",
      type: type as never, label: flagType.label,
      description: description.trim() || null, resolved: false,
    });

    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Flag" description={recordName} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium block mb-2">Flag Type</label>
          <div className="space-y-2">
            {FLAG_TYPES.map((f) => (
              <button key={f.value} type="button" onClick={() => setType(f.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                  type === f.value
                    ? "border-[var(--primary)] bg-[var(--accent)]"
                    : "border-[var(--border)] hover:bg-[var(--accent)]"
                )}>
                <span className="text-lg">{f.icon}</span>
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{f.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5">Description (optional)</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context about this flag..." rows={3} />
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="destructive" disabled={saving}>{saving ? "Adding..." : "Add Flag"}</Button>
        </div>
      </form>
    </Modal>
  );
}
