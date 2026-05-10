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
        "flex flex-col h-full border-r",
        "w-[var(--sidebar-width)] flex-shrink-0",
        "bg-[#0d0d1a] border-[#1e1e35]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[#1e1e35]">
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-indigo-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-white">Relay</span>
      </div>

      {/* Org switcher */}
      <div className="px-3 py-3 border-b border-[#1e1e35]">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors text-left">
          <div className="h-5 w-5 rounded bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">A</span>
          </div>
          <span className="text-xs font-medium flex-1 truncate text-gray-300">Acme Outreach Org</span>
          <ChevronDown className="h-3 w-3 text-gray-500 flex-shrink-0" />
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
                      ? "bg-indigo-600/20 text-white font-medium border border-indigo-600/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-indigo-400" : "")} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[#1e1e35]">
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-white/5 transition-colors">
          <Avatar name="Alex Rivera" size="sm" />
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-medium truncate text-gray-200">Alex Rivera</p>
            <p className="text-[10px] text-gray-500 truncate">Admin</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
