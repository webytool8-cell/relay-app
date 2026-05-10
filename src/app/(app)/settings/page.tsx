"use client";

import { useState } from "react";
import { User, Building2, Shield, Bell, Palette, Database, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DEMO_STATUSES } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "statuses", label: "Custom Statuses", icon: Palette },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Manage your account and organization preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  activeSection === id
                    ? "bg-[var(--accent)] font-medium"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold mb-4">Profile Settings</h2>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar name="Alex Rivera" size="xl" />
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
                      Full Name
                    </label>
                    <Input defaultValue="Alex Rivera" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
                      Email
                    </label>
                    <Input defaultValue="alex@acme.org" type="email" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
                      Role
                    </label>
                    <Input defaultValue="Admin" disabled />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
                      Organization
                    </label>
                    <Input defaultValue="Acme Outreach Org" disabled />
                  </div>
                </div>

                <Button className="mt-4">Save Changes</Button>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Security</h3>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
            </div>
          )}

          {activeSection === "organization" && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Organization Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
                    Organization Name
                  </label>
                  <Input defaultValue="Acme Outreach Org" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
                    Slug
                  </label>
                  <Input defaultValue="acme-outreach" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </div>
          )}

          {activeSection === "statuses" && (
            <div>
              <h2 className="text-sm font-semibold mb-4">Custom Statuses</h2>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                Configure the status options available for records in your organization.
              </p>
              <div className="space-y-2 mb-4">
                {DEMO_STATUSES.map((s) => (
                  <div
                    key={s.value}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]"
                  >
                    <div className={cn("h-3 w-3 rounded-full", s.color)} />
                    <span className="text-sm flex-1">{s.label}</span>
                    <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm">+ Add Status</Button>
            </div>
          )}

          {activeSection === "permissions" && (
            <div>
              <h2 className="text-sm font-semibold mb-4">Role Permissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 font-medium text-[var(--muted-foreground)]">Permission</th>
                      <th className="text-center py-2 font-medium text-[var(--muted-foreground)]">Viewer</th>
                      <th className="text-center py-2 font-medium text-[var(--muted-foreground)]">Worker</th>
                      <th className="text-center py-2 font-medium text-[var(--muted-foreground)]">Supervisor</th>
                      <th className="text-center py-2 font-medium text-[var(--muted-foreground)]">Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["View Records", true, true, true, true],
                      ["Edit Records", false, true, true, true],
                      ["Add Notes", false, true, true, true],
                      ["Manage Flags", false, false, true, true],
                      ["Export Data", false, false, true, true],
                      ["Manage Users", false, false, false, true],
                      ["Org Settings", false, false, false, true],
                    ].map(([label, ...perms]) => (
                      <tr key={String(label)} className="border-b border-[var(--border)]">
                        <td className="py-2.5 text-[var(--foreground)]">{String(label)}</td>
                        {perms.map((p, i) => (
                          <td key={i} className="py-2.5 text-center">
                            {p ? (
                              <span className="text-emerald-600">✓</span>
                            ) : (
                              <span className="text-[var(--muted-foreground)]">–</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Notifications</h2>
              {[
                "New flag on assigned record",
                "Status change on assigned record",
                "New note on assigned record",
                "Record assigned to me",
                "Weekly activity summary",
              ].map((label) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-sm">{label}</span>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-5 bg-[var(--muted)] peer-checked:bg-[var(--primary)] rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
              <Button className="mt-2">Save Preferences</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
