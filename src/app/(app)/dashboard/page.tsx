"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowRight,
  Plus,
  Search,
  Home,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { DEMO_RECORDS, DEMO_INTERACTIONS, DEMO_STATS, DEMO_TEAM, STATUS_MAP, FLAG_MAP } from "@/lib/demo-data";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const STAT_CARDS = [
  {
    label: "Total Records",
    value: DEMO_STATS.total_records,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    change: "+12 this month",
  },
  {
    label: "Active",
    value: DEMO_STATS.active_records,
    icon: Activity,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    change: `${Math.round((DEMO_STATS.active_records / DEMO_STATS.total_records) * 100)}% of total`,
  },
  {
    label: "Sheltered",
    value: DEMO_STATS.sheltered,
    icon: Home,
    color: "text-blue-600",
    bg: "bg-blue-50",
    change: "+5 this week",
  },
  {
    label: "Active Flags",
    value: DEMO_STATS.active_flags,
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    change: "Needs attention",
  },
];

const RECENT_INTERACTIONS = DEMO_INTERACTIONS.slice(0, 5);
const FLAGGED_RECORDS = DEMO_RECORDS.filter((r) => (r.active_flags?.length ?? 0) > 0).slice(0, 4);
const FOLLOW_UP_RECORDS = DEMO_RECORDS.filter((r) => r.status === "follow_up").slice(0, 4);

const QUICK_ACTIONS = [
  { label: "New Record", icon: Plus, href: "/records/new", description: "Add a new client record" },
  { label: "Search Records", icon: Search, href: "/search", description: "Find clients fast" },
  { label: "View All Records", icon: Users, href: "/records", description: "Browse all records" },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Welcome back, Alex — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button className="gap-2" onClick={() => router.push("/records")}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Record</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium text-[var(--muted-foreground)] mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{stat.change}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => router.push("/interactions")}>
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {RECENT_INTERACTIONS.map((interaction) => {
                  const record = DEMO_RECORDS.find((r) => r.id === interaction.record_id);
                  const author = DEMO_TEAM.find((u) => u.id === interaction.author_id);
                  if (!record) return null;

                  return (
                    <button
                      key={interaction.id}
                      onClick={() => router.push(`/records/${record.id}`)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
                    >
                      <Avatar name={record.full_name} size="sm" className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-sm font-medium">{record.full_name}</span>
                          <span className="text-[10px] text-[var(--muted-foreground)] capitalize">
                            · {interaction.type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                          {interaction.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {author?.full_name} · {formatRelativeTime(interaction.created_at)}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={record.status} className="flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-md bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{action.label}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">{action.description}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-[var(--muted-foreground)] ml-auto flex-shrink-0" />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(Object.entries(STATUS_MAP) as [string, { label: string; color: string; bg: string }][]).map(([key, config]) => {
                  const count = DEMO_RECORDS.filter((r) => r.status === key).length;
                  const pct = Math.round((count / DEMO_RECORDS.length) * 100);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{count}</span>
                      </div>
                      <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", config.bg.split(" ")[0].replace("bg-", "bg-").replace("50", "400"))}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flagged + Follow-up records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Flagged */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Active Alerts ({FLAGGED_RECORDS.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {FLAGGED_RECORDS.map((record) => (
                <button
                  key={record.id}
                  onClick={() => router.push(`/records/${record.id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
                >
                  <Avatar name={record.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{record.full_name}</p>
                    <p className="text-[10px] text-red-600 truncate">
                      {record.active_flags?.[0] && FLAG_MAP[record.active_flags[0].type]?.label}
                    </p>
                  </div>
                  <StatusBadge status={record.status} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Follow-up needed */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Follow-Up Needed ({FOLLOW_UP_RECORDS.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {FOLLOW_UP_RECORDS.map((record) => (
                <button
                  key={record.id}
                  onClick={() => router.push(`/records/${record.id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
                >
                  <Avatar name={record.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{record.full_name}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                      {record.assigned_team ?? "Unassigned"} · {formatRelativeTime(record.updated_at)}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                </button>
              ))}

              {FOLLOW_UP_RECORDS.length === 0 && (
                <div className="flex items-center gap-2 py-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-sm">All caught up!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEMO_TEAM.filter((u) => u.id !== "usr_current").map((member) => {
              const memberInteractions = DEMO_INTERACTIONS.filter((i) => i.author_id === member.id);
              const assignedRecords = DEMO_RECORDS.filter((r) => r.assigned_user_id === member.id);
              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)]">
                  <Avatar name={member.full_name} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] capitalize">{member.role}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                      {assignedRecords.length} records · {memberInteractions.length} interactions
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
