"use client";

import { useState } from "react";
import { Zap, Mail, ArrowRight, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Mode = "email" | "magic";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Demo: just redirect to dashboard after brief delay
    await new Promise((r) => setTimeout(r, 1000));

    if (mode === "magic") {
      setSent(true);
    } else {
      if (email && password) {
        router.push("/dashboard");
      } else {
        setError("Please enter your email and password.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[var(--primary)] mb-4">
            <Zap className="h-6 w-6 text-[var(--primary-foreground)]" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Relay</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Client intelligence & coordination platform
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
          {/* Mode tabs */}
          <div className="flex gap-1 bg-[var(--muted)] rounded-lg p-1 mb-5">
            <button
              onClick={() => setMode("email")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === "email"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              Password
            </button>
            <button
              onClick={() => setMode("magic")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === "magic"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Mail className="h-3.5 w-3.5" />
              Magic Link
            </button>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-1">Check your email</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => { setSent(false); setEmail(""); }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                  required
                  autoComplete="email"
                />
              </div>

              {mode === "email" && (
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full gap-2 mt-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === "magic" ? "Send Magic Link" : "Sign In"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Demo access */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">
            Want to explore without an account?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <Zap className="h-3.5 w-3.5" />
            Enter Demo Mode
          </Button>
        </div>

        <p className="text-center text-[10px] text-[var(--muted-foreground)] mt-6">
          Protected by organization-level access control · Relay v1.0
        </p>
      </div>
    </div>
  );
}
