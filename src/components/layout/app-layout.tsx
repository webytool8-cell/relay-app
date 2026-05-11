"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { useUser } from "@/contexts/user-context";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchBar = document.querySelector("[data-search-trigger]") as HTMLElement;
        searchBar?.click();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-6 w-6 rounded-full border-2 border-[var(--border)] border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav title={title} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
