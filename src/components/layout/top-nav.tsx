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
      <header className="flex items-center gap-3 h-14 px-4 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-30">
        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] text-sm hover:bg-[var(--accent)] transition-colors flex-1 max-w-sm"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search records...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[var(--border)] bg-[var(--background)] px-1.5 text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        <div className="flex-1" />

        {title && (
          <h1 className="hidden md:block text-sm font-semibold absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        )}

        {/* Actions */}
        <Button variant="ghost" size="icon" className="relative" onClick={() => {}}>
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleDark}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
