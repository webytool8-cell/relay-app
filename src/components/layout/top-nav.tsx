"use client";

import { useState } from "react";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchPalette } from "@/components/search/search-palette";
import { NotificationsPanel } from "./notifications-panel";
import { useRecords } from "@/contexts/records-context";

interface TopNavProps {
  title?: string;
}

export function TopNav({ title }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { unreadCount } = useRecords();

  function toggleDark() {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  }

  return (
    <>
      <header className="flex items-center gap-2 h-14 px-3 sm:px-4 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-30">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] text-sm hover:bg-[var(--accent)] transition-colors flex-1 sm:max-w-sm min-w-0"
        >
          <Search className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left truncate text-xs sm:text-sm">Search records...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-[var(--border)] bg-[var(--background)] px-1.5 text-[10px] font-mono flex-shrink-0">
            ⌘K
          </kbd>
        </button>

        {title && (
          <h1 className="hidden md:block text-sm font-semibold absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setNotifsOpen((v) => !v)}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
            <NotificationsPanel open={notifsOpen} onClose={() => setNotifsOpen(false)} />
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleDark}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
