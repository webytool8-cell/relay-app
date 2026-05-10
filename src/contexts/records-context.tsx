"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
} from "react";
import { DEMO_RECORDS, DEMO_INTERACTIONS, DEMO_TEAM } from "@/lib/demo-data";
import type { Interaction, Flag } from "@/types/database";

// ── Types ────────────────────────────────────────────────────────────────────

export type AppRecord = {
  id: string;
  organization_id: string;
  full_name: string;
  preferred_name: string | null;
  aliases: string[];
  dob: string | null;
  approximate_age: number | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  org_record_id: string | null;
  photo_url: string | null;
  status: string;
  assigned_user_id: string | null;
  assigned_user: { id: string; full_name: string } | null;
  assigned_team: string | null;
  program: string | null;
  notes: string | null;
  metadata: { [k: string]: unknown };
  created_at: string;
  updated_at: string;
  active_flags: Flag[];
};

export type AppInteraction = Interaction;

export type AppNotification = {
  id: string;
  type: "flag" | "interaction" | "assignment" | "status";
  record_id: string;
  record_name: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type NewRecordData = Omit<AppRecord, "id" | "organization_id" | "created_at" | "updated_at" | "active_flags">;

// ── Storage keys ─────────────────────────────────────────────────────────────

const R_KEY = "relay:records-v2";
const I_KEY = "relay:interactions-v2";
const N_KEY = "relay:notifications-v2";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_RECORDS: AppRecord[] = DEMO_RECORDS as AppRecord[];
const SEED_INTERACTIONS: AppInteraction[] = DEMO_INTERACTIONS;
const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "flag", record_id: "rec_003", record_name: "Robert Washington", message: "High Risk flag added — lost contact", read: false, created_at: "2024-11-05T11:00:00Z" },
  { id: "n2", type: "flag", record_id: "rec_001", record_name: "James Mitchell", message: "Medical Concern flag added — leg injury", read: false, created_at: "2024-11-18T09:00:00Z" },
  { id: "n3", type: "status", record_id: "rec_002", record_name: "Sarah Chen", message: "Status changed to Sheltered", read: false, created_at: "2024-11-10T16:00:00Z" },
  { id: "n4", type: "interaction", record_id: "rec_004", record_name: "Angela Torres", message: "Priority Follow-Up flag added", read: true, created_at: "2024-11-01T09:00:00Z" },
  { id: "n5", type: "assignment", record_id: "rec_005", record_name: "Michael Johnson", message: "Assigned to David Kim", read: true, created_at: "2024-10-15T10:00:00Z" },
];

// ── Context ───────────────────────────────────────────────────────────────────

interface RecordsContextValue {
  records: AppRecord[];
  interactions: AppInteraction[];
  notifications: AppNotification[];
  unreadCount: number;
  getRecord: (id: string) => AppRecord | undefined;
  getInteractions: (recordId: string) => AppInteraction[];
  addRecord: (data: NewRecordData) => AppRecord;
  updateRecord: (id: string, updates: Partial<AppRecord>) => void;
  changeStatus: (id: string, status: string, authorId?: string) => void;
  assignWorker: (id: string, workerId: string) => void;
  addInteraction: (data: Omit<AppInteraction, "id" | "created_at">) => AppInteraction;
  addFlag: (data: Omit<Flag, "id" | "created_at">) => void;
  resolveFlag: (flagId: string, recordId: string) => void;
  markAllRead: () => void;
}

const RecordsContext = createContext<RecordsContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<AppRecord[]>(SEED_RECORDS);
  const [interactions, setInteractions] = useState<AppInteraction[]>(SEED_INTERACTIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRecords(load(R_KEY, SEED_RECORDS));
    setInteractions(load(I_KEY, SEED_INTERACTIONS));
    setNotifications(load(N_KEY, SEED_NOTIFICATIONS));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) save(R_KEY, records); }, [records, hydrated]);
  useEffect(() => { if (hydrated) save(I_KEY, interactions); }, [interactions, hydrated]);
  useEffect(() => { if (hydrated) save(N_KEY, notifications); }, [notifications, hydrated]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const getRecord = useCallback((id: string) => records.find((r) => r.id === id), [records]);
  const getInteractions = useCallback((recordId: string) =>
    interactions.filter((i) => i.record_id === recordId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ), [interactions]);

  function pushNotif(notif: Omit<AppNotification, "id">) {
    const n: AppNotification = { ...notif, id: `n_${Date.now()}` };
    setNotifications((prev) => [n, ...prev].slice(0, 30));
  }

  const addRecord = useCallback((data: NewRecordData): AppRecord => {
    const record: AppRecord = {
      ...data,
      id: `rec_${Date.now()}`,
      organization_id: "org_001",
      active_flags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRecords((prev) => [record, ...prev]);
    pushNotif({ type: "interaction", record_id: record.id, record_name: record.full_name, message: "New record created", read: false, created_at: record.created_at });
    return record;
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<AppRecord>) => {
    setRecords((prev) => prev.map((r) =>
      r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
    ));
  }, []);

  const addInteraction = useCallback((data: Omit<AppInteraction, "id" | "created_at">): AppInteraction => {
    const interaction: AppInteraction = {
      ...data,
      id: `int_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setInteractions((prev) => [interaction, ...prev]);
    return interaction;
  }, []);

  const changeStatus = useCallback((id: string, status: string, authorId = "usr_current") => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    const oldStatus = record.status;
    updateRecord(id, { status });
    addInteraction({
      record_id: id, organization_id: "org_001", author_id: authorId,
      type: "status_change", content: `Status changed from "${oldStatus}" to "${status}"`,
      tags: [], metadata: { from: oldStatus, to: status },
    });
    pushNotif({ type: "status", record_id: id, record_name: record.full_name, message: `Status changed to ${status}`, read: false, created_at: new Date().toISOString() });
  }, [records, updateRecord, addInteraction]);

  const assignWorker = useCallback((id: string, workerId: string) => {
    const record = records.find((r) => r.id === id);
    const worker = DEMO_TEAM.find((u) => u.id === workerId);
    if (!record || !worker) return;
    updateRecord(id, {
      assigned_user_id: workerId,
      assigned_user: { id: workerId, full_name: worker.full_name },
    });
    addInteraction({
      record_id: id, organization_id: "org_001", author_id: "usr_current",
      type: "assignment", content: `Assigned to ${worker.full_name}`,
      tags: [], metadata: { worker_id: workerId },
    });
    pushNotif({ type: "assignment", record_id: id, record_name: record.full_name, message: `Assigned to ${worker.full_name}`, read: false, created_at: new Date().toISOString() });
  }, [records, updateRecord, addInteraction]);

  const addFlag = useCallback((data: Omit<Flag, "id" | "created_at">) => {
    const flag: Flag = { ...data, id: `flg_${Date.now()}`, created_at: new Date().toISOString() };
    setRecords((prev) => prev.map((r) =>
      r.id === data.record_id ? { ...r, active_flags: [flag, ...r.active_flags], updated_at: new Date().toISOString() } : r
    ));
    const record = records.find((r) => r.id === data.record_id);
    addInteraction({
      record_id: data.record_id, organization_id: "org_001", author_id: "usr_current",
      type: "flag", content: `Flag added: ${flag.label}${flag.description ? ` — ${flag.description}` : ""}`,
      tags: [], metadata: {},
    });
    pushNotif({ type: "flag", record_id: data.record_id, record_name: record?.full_name ?? "", message: `${flag.label} flag added`, read: false, created_at: flag.created_at });
  }, [records, addInteraction]);

  const resolveFlag = useCallback((flagId: string, recordId: string) => {
    setRecords((prev) => prev.map((r) =>
      r.id === recordId
        ? { ...r, active_flags: r.active_flags.map((f) => f.id === flagId ? { ...f, resolved: true } : f).filter((f) => !f.resolved), updated_at: new Date().toISOString() }
        : r
    ));
    addInteraction({
      record_id: recordId, organization_id: "org_001", author_id: "usr_current",
      type: "flag", content: "Flag resolved", tags: [], metadata: { resolved: true },
    });
  }, [addInteraction]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <RecordsContext.Provider value={{
      records, interactions, notifications, unreadCount,
      getRecord, getInteractions,
      addRecord, updateRecord, changeStatus, assignWorker,
      addInteraction, addFlag, resolveFlag, markAllRead,
    }}>
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error("useRecords must be used inside RecordsProvider");
  return ctx;
}
