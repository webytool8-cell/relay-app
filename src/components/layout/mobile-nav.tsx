"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, Users, MessageSquare, Settings } from "lucide-react";

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/records", label: "Records", icon: Users },
  { href: "/interactions", label: "Activity", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[var(--card)] border-t border-[var(--border)] safe-area-inset-bottom">
      {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
              isActive
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)]"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
