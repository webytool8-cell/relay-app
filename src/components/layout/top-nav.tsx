"use client";

import { useState } from "react";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchPalette } from "@/components/search/search-palette";

interface TopNavProps {
  title?: string;
}

export function TopNav({ title }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(false);

  function toggleDark() {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  }

  return (
    <>
      <header className="flex items-center gap-2 h-14 px-3 sm:px-4 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-30">
        {/* Search trigger — expands to fill space on mobile */}
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

        {/* Actions — always visible, compact on mobile */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => {}}>
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleDark}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
