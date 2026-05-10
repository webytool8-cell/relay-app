"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  Building2,
  BarChart3,
  Settings,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/records", label: "Records", icon: Users },
  { href: "/interactions", label: "Interactions", icon: MessageSquare },
  { href: "/organizations", label: "Organizations", icon: Building2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[var(--card)] border-r border-[var(--border)]",
        "w-[var(--sidebar-width)] flex-shrink-0",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[var(--border)]">
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-[var(--primary)]">
          <Zap className="h-4 w-4 text-[var(--primary-foreground)]" />
        </div>
        <span className="font-semibold text-sm tracking-tight">Relay</span>
      </div>

      {/* Org switcher */}
      <div className="px-3 py-3 border-b border-[var(--border)]">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--accent)] transition-colors text-left">
          <div className="h-5 w-5 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">A</span>
          </div>
          <span className="text-xs font-medium flex-1 truncate">Acme Outreach Org</span>
          <ChevronDown className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-[var(--accent)] font-medium text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[var(--border)]">
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-[var(--accent)] transition-colors">
          <Avatar name="Alex Rivera" size="sm" />
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-medium truncate">Alex Rivera</p>
            <p className="text-[10px] text-[var(--muted-foreground)] truncate">Admin</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
