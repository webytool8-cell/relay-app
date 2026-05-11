"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, Calendar, Hash, User, Users, Briefcase,
  Edit, MoreHorizontal, Flag as FlagIcon, CheckCircle2, Plus,
} from "lucide-react";
import { useRecords } from "@/contexts/records-context";
import { DEMO_STATUSES, STATUS_MAP, FLAG_MAP, DEMO_TEAM } from "@/lib/demo-data";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TimelineFeed } from "@/components/records/timeline-feed";
import { FlagBanner } from "@/components/records/flag-banner";
import { NewEditRecordModal } from "@/components/records/new-edit-record-modal";
import { LogInteractionModal } from "@/components/records/log-interaction-modal";
import { AddFlagModal } from "@/components/records/add-flag-modal";

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function RecordPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getRecord, getInteractions, changeStatus, assignWorker, resolveFlag } = useRecords();

  const [editOpen, setEditOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [logType, setLogType] = useState("note");
  const [flagOpen, setFlagOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [workerMenuOpen, setWorkerMenuOpen] = useState(false);

  const record = getRecord(id);

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
        <p className="text-lg font-semibold mb-2">Record not found</p>
        <Button onClick={() => router.push("/records")}>Back to Records</Button>
      </div>
    );
  }

  const interactions = getInteractions(id);
  const metadata = record.metadata as { veteran?: boolean; wheelchair?: boolean; housing_voucher?: boolean; language?: string; case_priority?: string };

  function openLog(type: string) { setLogType(type); setLogOpen(true); }

  return (
    <>
      {/* Sticky header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium text-sm truncate">{record.full_name}</span>
          {record.org_record_id && <span className="text-xs text-[var(--muted-foreground)] hidden sm:inline">#{record.org_record_id}</span>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Inline status change */}
          <div className="relative">
            <button onClick={() => setStatusMenuOpen((v) => !v)}>
              <StatusBadge status={record.status} className="cursor-pointer hover:opacity-80" />
            </button>
            {statusMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                <p className="text-[10px] text-[var(--muted-foreground)] px-3 py-1.5 font-medium uppercase tracking-wide">Change Status</p>
                {DEMO_STATUSES.map((s) => (
                  <button key={s.value} onClick={() => { changeStatus(id, s.value); setStatusMenuOpen(false); }}
                    className={cn("w-full text-left px-3 py-2 text-sm hover:bg-[var(--accent)] transition-colors flex items-center gap-2",
                      record.status === s.value && "font-medium")}>
                    <span className={cn("h-2 w-2 rounded-full flex-shrink-0", s.color)} />
                    {s.label}
                    {record.status === s.value && <span className="ml-auto text-[10px] text-[var(--muted-foreground)]">current</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5 hidden sm:flex">
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Flags */}
        {record.active_flags.length > 0 && (
          <FlagBanner flags={record.active_flags} recordId={id} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Identity card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-col items-center text-center mb-4">
                <Avatar name={record.full_name} size="xl" className="mb-3" />
                <h2 className="text-lg font-semibold">{record.full_name}</h2>
                {record.preferred_name && record.preferred_name !== record.full_name && (
                  <p className="text-sm text-[var(--muted-foreground)]">&ldquo;{record.preferred_name}&rdquo;</p>
                )}
                {record.aliases.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {record.aliases.map((a) => <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>)}
                  </div>
                )}
              </div>

              <Separator className="my-3" />

              <div className="divide-y divide-[var(--border)]">
                {record.dob
                  ? <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(record.dob)} />
                  : <InfoRow icon={Calendar} label="Approx. Age" value={record.approximate_age ? `~${record.approximate_age} years` : null} />
                }
                <InfoRow icon={User} label="Gender" value={record.gender} />
                <InfoRow icon={Phone} label="Phone" value={record.phone} />
                <InfoRow icon={Mail} label="Email" value={record.email} />
                <InfoRow icon={Hash} label="Record ID" value={record.org_record_id} />
              </div>

              {(metadata.veteran || metadata.wheelchair || metadata.housing_voucher || metadata.language || metadata.case_priority) && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium mb-2">Attributes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {metadata.veteran && <Badge variant="secondary">Veteran</Badge>}
                      {metadata.wheelchair && <Badge variant="secondary">Wheelchair</Badge>}
                      {metadata.housing_voucher && <Badge variant="secondary">Housing Voucher</Badge>}
                      {metadata.language && <Badge variant="outline" className="text-[10px]">{metadata.language}</Badge>}
                      {metadata.case_priority && <Badge variant="warning">Priority: {metadata.case_priority}</Badge>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Assignment card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="text-sm font-semibold mb-3">Assignment</h3>

              {/* Worker with inline change */}
              <div className="py-2">
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium mb-1.5">Assigned Worker</p>
                <div className="relative">
                  <button onClick={() => setWorkerMenuOpen((v) => !v)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {record.assigned_user
                      ? <><Avatar name={record.assigned_user.full_name} size="sm" /><span className="text-sm">{record.assigned_user.full_name}</span></>
                      : <span className="text-sm text-[var(--muted-foreground)]">Unassigned — click to assign</span>
                    }
                  </button>
                  {workerMenuOpen && (
                    <div className="absolute left-0 top-full mt-1 w-52 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50 py-1">
                      <p className="text-[10px] text-[var(--muted-foreground)] px-3 py-1.5 font-medium uppercase tracking-wide">Assign Worker</p>
                      <button onClick={() => { assignWorker(id, ""); setWorkerMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)]">
                        Unassign
                      </button>
                      {DEMO_TEAM.map((u) => (
                        <button key={u.id} onClick={() => { assignWorker(id, u.id); setWorkerMenuOpen(false); }}
                          className={cn("w-full text-left px-3 py-2 text-sm hover:bg-[var(--accent)] flex items-center gap-2",
                            record.assigned_user_id === u.id && "font-medium")}>
                          <Avatar name={u.full_name} size="sm" />{u.full_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {record.assigned_team && (
                <div className="flex items-center gap-2 py-2 border-t border-[var(--border)]">
                  <Users className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Team</p>
                    <p className="text-sm mt-0.5">{record.assigned_team}</p>
                  </div>
                </div>
              )}

              {record.program && (
                <div className="flex items-center gap-2 py-2 border-t border-[var(--border)]">
                  <Briefcase className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Program</p>
                    <p className="text-sm mt-0.5">{record.program}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => openLog("call")}>
                  <Phone className="h-3.5 w-3.5" /> Log Call
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => openLog("note")}>
                  <Plus className="h-3.5 w-3.5" /> Add Note
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => openLog("referral")}>
                  <Users className="h-3.5 w-3.5" /> Referral
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => openLog("placement")}>
                  <Briefcase className="h-3.5 w-3.5" /> Placement
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5 text-xs col-span-2" onClick={() => setFlagOpen(true)}>
                  <FlagIcon className="h-3.5 w-3.5" /> Add Flag
                </Button>
              </div>
            </div>

            {/* Record info */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="text-sm font-semibold mb-3">Record Info</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Created</p>
                  <p className="text-sm mt-0.5">{formatDate(record.created_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Last Updated</p>
                  <p className="text-sm mt-0.5">{formatRelativeTime(record.updated_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Interactions</p>
                  <p className="text-sm mt-0.5">{interactions.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Active Flags</p>
                  <p className="text-sm mt-0.5">{record.active_flags.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {record.notes && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">Notes</h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} className="text-xs gap-1">
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line">{record.notes}</p>
              </div>
            )}

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <TimelineFeed interactions={interactions} recordId={id} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewEditRecordModal open={editOpen} onClose={() => setEditOpen(false)} record={record} />
      <LogInteractionModal open={logOpen} onClose={() => setLogOpen(false)} recordId={id} recordName={record.full_name} defaultType={logType} />
      <AddFlagModal open={flagOpen} onClose={() => setFlagOpen(false)} recordId={id} recordName={record.full_name} />
    </>
  );
}
