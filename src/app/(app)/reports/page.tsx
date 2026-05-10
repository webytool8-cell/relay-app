"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart2, TrendingUp, Users, AlertTriangle, Activity, ArrowRight } from "lucide-react";
import { useRecords } from "@/contexts/records-context";
import { DEMO_TEAM, STATUS_MAP } from "@/lib/demo-data";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";

export default function ReportsPage() {
  const router = useRouter();
  const { records, interactions } = useRecords();

  const statusBreakdown = useMemo(() => {
    return Object.entries(STATUS_MAP).map(([key, config]) => {
      const count = records.filter((r) => r.status === key).length;
      const pct = records.length > 0 ? Math.round((count / records.length) * 100) : 0;
      return { key, label: config.label, color: config.color, bg: config.bg, count, pct };
    });
  }, [records]);

  const workerStats = useMemo(() => {
    return DEMO_TEAM.map((member) => {
      const assigned = records.filter((r) => r.assigned_user_id === member.id).length;
      const interactionCount = interactions.filter((i) => i.author_id === member.id).length;
      return { ...member, assigned, interactionCount };
    }).sort((a, b) => b.interactionCount - a.interactionCount);
  }, [records, interactions]);

  const interactionTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    interactions.forEach((i) => { counts[i.type] = (counts[i.type] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count, pct: Math.round((count / interactions.length) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [interactions]);

  const flaggedRecords = useMemo(() =>
    records.filter((r) => r.active_flags.length > 0),
    [records]
  );

  const recentActivity = useMemo(() =>
    [...interactions]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8),
    [interactions]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <BarChart2 className="h-5 w-5" /> Reports
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Summary of records, interactions, and team activity
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Records", value: records.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Interactions", value: interactions.length, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Flags", value: flaggedRecords.length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Team Members", value: DEMO_TEAM.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className={cn("p-2 rounded-lg w-fit mb-2", s.bg)}>
                <Icon className={cn("h-4 w-4", s.color)} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {statusBreakdown.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-xs font-medium", s.color)}>{s.label}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{s.count} ({s.pct}%)</span>
                </div>
                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", s.bg.replace("50", "400").replace("bg-", "bg-"))}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Interaction types */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Interaction Types
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {interactionTypes.map((t) => (
              <div key={t.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium capitalize">{t.type.replace("_", " ")}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{t.count} ({t.pct}%)</span>
                </div>
                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-all"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
            {interactionTypes.length === 0 && (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">No interactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Worker performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Worker Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {workerStats.map((w) => (
                <div key={w.id} className="flex items-center gap-3">
                  <Avatar name={w.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium truncate">{w.full_name}</span>
                      <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">{w.interactionCount} interactions</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-[var(--muted-foreground)]">{w.assigned} assigned</span>
                      <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-400"
                          style={{ width: `${interactions.length > 0 ? Math.round((w.interactionCount / interactions.length) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active flags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" /> Active Flags ({flaggedRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {flaggedRecords.length === 0 ? (
              <p className="text-sm text-emerald-600 flex items-center gap-2 py-2">
                All clear — no active flags
              </p>
            ) : (
              <div className="space-y-2">
                {flaggedRecords.slice(0, 6).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => router.push(`/records/${r.id}`)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
                  >
                    <Avatar name={r.full_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.full_name}</p>
                      <p className="text-[10px] text-red-600">{r.active_flags.length} flag{r.active_flags.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StatusBadge status={r.status} />
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Recent Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {recentActivity.map((i) => {
              const record = records.find((r) => r.id === i.record_id);
              const author = DEMO_TEAM.find((u) => u.id === i.author_id);
              return (
                <button
                  key={i.id}
                  onClick={() => record && router.push(`/records/${record.id}`)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
                >
                  <Avatar name={author?.full_name ?? "Alex"} size="sm" className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {record && <span className="text-sm font-medium">{record.full_name}</span>}
                      <span className="text-xs text-[var(--muted-foreground)] capitalize">· {i.type.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{i.content}</p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] flex-shrink-0">{formatRelativeTime(i.created_at)}</span>
                </button>
              );
            })}
            {recentActivity.length === 0 && (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">No activity yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
