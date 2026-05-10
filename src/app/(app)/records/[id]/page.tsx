"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Hash,
  User,
  Users,
  Briefcase,
  Tag,
  Edit,
  MoreHorizontal,
  MapPin,
} from "lucide-react";
import { DEMO_RECORDS, DEMO_INTERACTIONS, DEMO_STATUSES, STATUS_MAP } from "@/lib/demo-data";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { TimelineFeed } from "@/components/records/timeline-feed";
import { FlagBanner } from "@/components/records/flag-banner";
import { Separator } from "@/components/ui/separator";

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

  const record = DEMO_RECORDS.find((r) => r.id === id);
  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
        <p className="text-lg font-semibold mb-2">Record not found</p>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">The record #{id} does not exist or you don&apos;t have access.</p>
        <Button onClick={() => router.push("/records")}>Back to Records</Button>
      </div>
    );
  }

  const interactions = DEMO_INTERACTIONS.filter((i) => i.record_id === id);
  const metadata = record.metadata as Record<string, boolean | string | number | null | undefined>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium text-sm truncate">{record.full_name}</span>
          {record.org_record_id && (
            <span className="text-xs text-[var(--muted-foreground)]">#{record.org_record_id}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={record.status} />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Flags */}
        {record.active_flags && record.active_flags.length > 0 && (
          <FlagBanner flags={record.active_flags} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: Identity + details */}
          <div className="lg:col-span-1 space-y-4">
            {/* Identity card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-col items-center text-center mb-5">
                <Avatar name={record.full_name} size="xl" className="mb-3" />
                <h2 className="text-lg font-semibold">{record.full_name}</h2>
                {record.preferred_name && record.preferred_name !== record.full_name && (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    &ldquo;{record.preferred_name}&rdquo;
                  </p>
                )}
                {record.aliases.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {record.aliases.map((alias) => (
                      <Badge key={alias} variant="outline" className="text-[10px]">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-3">
                  <StatusBadge status={record.status} />
                </div>
              </div>

              <Separator className="my-3" />

              <div className="divide-y divide-[var(--border)]">
                <InfoRow icon={Calendar} label="Date of Birth" value={record.dob ? formatDate(record.dob) : undefined} />
                {!record.dob && record.approximate_age && (
                  <InfoRow icon={Calendar} label="Approximate Age" value={`~${record.approximate_age} years`} />
                )}
                <InfoRow icon={User} label="Gender" value={record.gender} />
                <InfoRow icon={Phone} label="Phone" value={record.phone} />
                <InfoRow icon={Mail} label="Email" value={record.email} />
                <InfoRow icon={Hash} label="Record ID" value={record.org_record_id} />
              </div>

              <Separator className="my-3" />

              {/* Custom attributes */}
              <div>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium mb-2">Attributes</p>
                <div className="flex flex-wrap gap-1.5">
                  {metadata.veteran && <Badge variant="secondary">Veteran</Badge>}
                  {metadata.wheelchair && <Badge variant="secondary">Wheelchair</Badge>}
                  {metadata.housing_voucher && <Badge variant="secondary">Housing Voucher</Badge>}
                  {metadata.language && (
                    <Badge variant="outline" className="text-[10px]">
                      {String(metadata.language)}
                    </Badge>
                  )}
                  {metadata.case_priority && (
                    <Badge variant="warning">Priority: {String(metadata.case_priority)}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="text-sm font-semibold mb-3">Assignment</h3>
              <div className="divide-y divide-[var(--border)]">
                {record.assigned_user && (
                  <div className="flex items-center gap-2 py-2">
                    <Users className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Worker</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Avatar name={record.assigned_user.full_name} size="sm" />
                        <span className="text-sm">{record.assigned_user.full_name}</span>
                      </div>
                    </div>
                  </div>
                )}
                {record.assigned_team && (
                  <div className="flex items-center gap-2 py-2">
                    <Users className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Team</p>
                      <p className="text-sm mt-0.5">{record.assigned_team}</p>
                    </div>
                  </div>
                )}
                {record.program && (
                  <div className="flex items-center gap-2 py-2">
                    <Briefcase className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Program</p>
                      <p className="text-sm mt-0.5">{record.program}</p>
                    </div>
                  </div>
                )}
                {!record.assigned_user && !record.assigned_team && !record.program && (
                  <p className="text-sm text-[var(--muted-foreground)] py-2">Unassigned</p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Phone className="h-3.5 w-3.5" />
                  Log Call
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Edit className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs col-span-2">
                  <Tag className="h-3.5 w-3.5" />
                  Add Flag
                </Button>
              </div>
            </div>
          </div>

          {/* Right column: Notes + Timeline */}
          <div className="lg:col-span-2 space-y-4">
            {/* Notes */}
            {record.notes && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <h3 className="text-sm font-semibold mb-2">Notes</h3>
                <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                  {record.notes}
                </p>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <TimelineFeed interactions={interactions} recordId={id} />
            </div>

            {/* Metadata */}
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
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Organization</p>
                  <p className="text-sm mt-0.5">Acme Outreach Org</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium">Interactions</p>
                  <p className="text-sm mt-0.5">{interactions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
