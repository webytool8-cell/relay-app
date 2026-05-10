"use client";

import { Building2, Users, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { DEMO_TEAM } from "@/lib/demo-data";
import { useRecords } from "@/contexts/records-context";

const DEMO_ORGS = [
  {
    id: "org_001",
    name: "Relay Demo Organization",
    type: "Primary",
    address: "123 Mission Street, San Francisco, CA 94103",
    phone: "(415) 555-0100",
    email: "admin@relay-demo.org",
    website: "relay-demo.org",
    description: "The primary organization managing this Relay instance. All records and interactions are scoped to this org.",
    active: true,
  },
  {
    id: "org_002",
    name: "Westside Outreach Coalition",
    type: "Partner",
    address: "456 Market St, San Francisco, CA 94102",
    phone: "(415) 555-0200",
    email: "info@westside-outreach.org",
    website: "westside-outreach.org",
    description: "Partner organization providing street outreach and emergency shelter services.",
    active: true,
  },
  {
    id: "org_003",
    name: "Bay Area Housing First",
    type: "Referral",
    address: "789 Howard St, San Francisco, CA 94103",
    phone: "(415) 555-0300",
    email: "referrals@bahf.org",
    website: "bahf.org",
    description: "Permanent supportive housing placement and case management for chronically homeless individuals.",
    active: true,
  },
  {
    id: "org_004",
    name: "Community Health Alliance",
    type: "Medical",
    address: "321 Folsom St, San Francisco, CA 94107",
    phone: "(415) 555-0400",
    email: "clinic@cha-sf.org",
    website: "cha-sf.org",
    description: "Medical and behavioral health services for unhoused individuals. Accepts warm referrals.",
    active: false,
  },
];

const TYPE_COLORS: Record<string, string> = {
  Primary: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Partner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Referral: "bg-blue-100 text-blue-700 border-blue-200",
  Medical: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function OrganizationsPage() {
  const { records } = useRecords();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Organizations</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Partner organizations, referral networks, and service providers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {DEMO_ORGS.map((org) => (
          <Card key={org.id} className={!org.active ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[var(--muted-foreground)]" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm leading-tight">{org.name}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${TYPE_COLORS[org.type] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {org.type}
                      </span>
                      {!org.active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border bg-gray-100 text-gray-500 border-gray-200">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{org.description}</p>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{org.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{org.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{org.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{org.website}</span>
                </div>
              </div>

              {org.id === "org_001" && (
                <div className="pt-2 border-t border-[var(--border)]">
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wide font-medium mb-2">
                    {records.length} records · {DEMO_TEAM.length} team members
                  </p>
                  <div className="flex -space-x-1.5">
                    {DEMO_TEAM.slice(0, 5).map((u) => (
                      <Avatar key={u.id} name={u.full_name} size="sm" className="ring-2 ring-[var(--card)]" />
                    ))}
                    {DEMO_TEAM.length > 5 && (
                      <div className="h-6 w-6 rounded-full bg-[var(--muted)] ring-2 ring-[var(--card)] flex items-center justify-center">
                        <span className="text-[9px] font-medium text-[var(--muted-foreground)]">+{DEMO_TEAM.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team section */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" /> Team Members
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_TEAM.map((member) => {
            const assigned = records.filter((r) => r.assigned_user_id === member.id).length;
            return (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <Avatar name={member.full_name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{member.full_name}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] capitalize">{member.role}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{assigned} assigned records</p>
                </div>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">
                  {member.id === "usr_current" ? "You" : "Staff"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
