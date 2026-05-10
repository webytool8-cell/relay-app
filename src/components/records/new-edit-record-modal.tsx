"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRecords, type AppRecord, type NewRecordData } from "@/contexts/records-context";
import { DEMO_TEAM, DEMO_STATUSES } from "@/lib/demo-data";

interface NewEditRecordModalProps {
  open: boolean;
  onClose: () => void;
  record?: AppRecord;
  onSaved?: (record: AppRecord) => void;
}

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];
const PROGRAM_OPTIONS = ["Street Outreach", "Emergency Shelter", "Rapid Rehousing", "Transitional Housing", "Permanent Supportive Housing", "Young Adult Program", "Case Management"];

export function NewEditRecordModal({ open, onClose, record, onSaved }: NewEditRecordModalProps) {
  const { addRecord, updateRecord } = useRecords();
  const isEdit = !!record;

  const blank: NewRecordData = {
    full_name: "", preferred_name: null, aliases: [], dob: null, approximate_age: null,
    gender: null, phone: null, email: null, org_record_id: null, photo_url: null,
    status: "active", assigned_user_id: null, assigned_user: null, assigned_team: null,
    program: null, notes: null, metadata: {},
  };

  const [form, setForm] = useState<NewRecordData>(blank);
  const [aliasInput, setAliasInput] = useState("");
  const [veteran, setVeteran] = useState(false);
  const [wheelchair, setWheelchair] = useState(false);
  const [housingVoucher, setHousingVoucher] = useState(false);
  const [language, setLanguage] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (open) {
      if (record) {
        const meta = record.metadata as { veteran?: boolean; wheelchair?: boolean; housing_voucher?: boolean; language?: string };
        setForm({
          full_name: record.full_name, preferred_name: record.preferred_name,
          aliases: record.aliases, dob: record.dob, approximate_age: record.approximate_age,
          gender: record.gender, phone: record.phone, email: record.email,
          org_record_id: record.org_record_id, photo_url: record.photo_url,
          status: record.status, assigned_user_id: record.assigned_user_id,
          assigned_user: record.assigned_user, assigned_team: record.assigned_team,
          program: record.program, notes: record.notes, metadata: record.metadata,
        });
        setVeteran(!!meta.veteran);
        setWheelchair(!!meta.wheelchair);
        setHousingVoucher(!!meta.housing_voucher);
        setLanguage(meta.language ?? "");
      } else {
        setForm(blank);
        setVeteran(false); setWheelchair(false); setHousingVoucher(false); setLanguage("");
      }
      setAliasInput(""); setErrors({});
    }
  }, [open, record]);

  function set(field: keyof NewRecordData, value: unknown) {
    setForm((f) => ({ ...f, [field]: value || null }));
  }

  function addAlias() {
    const a = aliasInput.trim();
    if (a && !form.aliases.includes(a)) {
      setForm((f) => ({ ...f, aliases: [...f.aliases, a] }));
    }
    setAliasInput("");
  }

  function removeAlias(a: string) {
    setForm((f) => ({ ...f, aliases: f.aliases.filter((x) => x !== a) }));
  }

  function handleWorkerChange(workerId: string) {
    const worker = DEMO_TEAM.find((u) => u.id === workerId);
    setForm((f) => ({
      ...f,
      assigned_user_id: workerId || null,
      assigned_user: worker ? { id: worker.id, full_name: worker.full_name } : null,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: { [k: string]: string } = {};
    if (!form.full_name.trim()) errs.full_name = "Name is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const metadata = { ...(form.metadata as object), veteran, wheelchair, housing_voucher: housingVoucher, language: language || undefined };
    const data = { ...form, metadata };

    let saved: AppRecord;
    if (isEdit && record) {
      updateRecord(record.id, data);
      saved = { ...record, ...data, updated_at: new Date().toISOString() };
    } else {
      saved = addRecord(data);
    }

    setSaving(false);
    onSaved?.(saved);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Record" : "New Record"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identity */}
        <section>
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium block mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="First Last" />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Preferred Name</label>
              <Input value={form.preferred_name ?? ""} onChange={(e) => set("preferred_name", e.target.value)} placeholder="Nickname" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Record ID</label>
              <Input value={form.org_record_id ?? ""} onChange={(e) => set("org_record_id", e.target.value)} placeholder="e.g. CLT-0042" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Date of Birth</label>
              <Input type="date" value={form.dob ?? ""} onChange={(e) => set("dob", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Approx. Age</label>
              <Input type="number" min={0} max={120} value={form.approximate_age ?? ""} onChange={(e) => set("approximate_age", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 45" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Gender</label>
              <select value={form.gender ?? ""} onChange={(e) => set("gender", e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                <option value="">Select...</option>
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            {/* Aliases */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium block mb-1.5">Aliases / Street Names</label>
              <div className="flex gap-2">
                <Input value={aliasInput} onChange={(e) => setAliasInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAlias(); } }}
                  placeholder="Add alias, press Enter" />
                <Button type="button" variant="outline" size="sm" onClick={addAlias}>Add</Button>
              </div>
              {form.aliases.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.aliases.map((a) => (
                    <span key={a} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--muted)] text-xs">
                      {a}
                      <button type="button" onClick={() => removeAlias(a)} className="text-[var(--muted-foreground)] hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-[var(--border)] pt-4">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5">Phone</label>
              <Input type="tel" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="555-0100" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Email</label>
              <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
        </section>

        {/* Assignment */}
        <section className="border-t border-[var(--border)] pt-4">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Assignment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                {DEMO_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Assigned Worker</label>
              <select value={form.assigned_user_id ?? ""} onChange={(e) => handleWorkerChange(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                <option value="">Unassigned</option>
                {DEMO_TEAM.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Team</label>
              <Input value={form.assigned_team ?? ""} onChange={(e) => set("assigned_team", e.target.value)} placeholder="e.g. Outreach Team A" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Program</label>
              <select value={form.program ?? ""} onChange={(e) => set("program", e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-[var(--input)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                <option value="">None</option>
                {PROGRAM_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Attributes */}
        <section className="border-t border-[var(--border)] pt-4">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Attributes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {[["veteran", veteran, setVeteran], ["wheelchair", wheelchair, setWheelchair], ["housing_voucher", housingVoucher, setHousingVoucher]].map(([label, val, setter]) => (
              <label key={String(label)} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={val as boolean} onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)} className="rounded" />
                <span className="text-sm capitalize">{String(label).replace("_", " ")}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Language</label>
            <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. English, Spanish" />
          </div>
        </section>

        {/* Notes */}
        <section className="border-t border-[var(--border)] pt-4">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Notes</h3>
          <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
            placeholder="Background info, context, location details..." rows={3} />
        </section>

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : isEdit ? "Save Changes" : "Create Record"}</Button>
        </div>
      </form>
    </Modal>
  );
}
