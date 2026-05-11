"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type AppUser = {
  id: string;
  full_name: string;
  email: string;
  role: "viewer" | "worker" | "supervisor" | "admin";
  avatar_url: string | null;
};

const DEMO_USER: AppUser = {
  id: "usr_current",
  full_name: "Alex Rivera",
  email: "alex@acme.org",
  role: "admin",
  avatar_url: null,
};

const STORAGE_KEY = "relay:current-user";

interface UserContextValue {
  user: AppUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInDemo: () => void;
  signOut: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Auto sign in as demo user on first load
        setUser(DEMO_USER);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
      }
    } catch {
      setUser(DEMO_USER);
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, _password: string): Promise<{ error?: string }> => {
    // Demo: any non-empty email/password works
    if (!email.trim()) return { error: "Email is required." };

    // Build a user from the email
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      full_name: name,
      email,
      role: "worker",
      avatar_url: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return {};
  }, []);

  const signInDemo = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, signIn, signInDemo, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
