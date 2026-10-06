"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PixelInput } from "@/components/ui/PixelInput";
import { Notice } from "@/components/ui/States";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type AuthMode = "register" | "login";

interface Props {
  mode: AuthMode;
  next: string;
  /** Called once a session exists. Defaults to navigating to `next`. */
  onAuthed?: () => Promise<void> | void;
  /** Called when sign-up needs email verification first. */
  onNeedsVerification?: (email: string) => void;
  onModeChange?: (m: AuthMode) => void;
  showUsername?: boolean;
  submitLabel?: string;
}

export function AuthForm({ mode, next, onAuthed, onNeedsVerification, onModeChange, showUsername, submitLabel }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const sb = getBrowserSupabase();

  async function done() {
    if (onAuthed) await onAuthed();
    else {
      router.push(next);
      router.refresh();
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sb) return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const username = String(fd.get("username") ?? "").trim().toLowerCase();
    setError(null);
    if (mode === "register" && password.length < 8) return setError("Password must be at least 8 characters.");
    if (username && !/^[a-z0-9_]{3,20}$/.test(username)) return setError("Username: 3–20 characters, a–z, 0–9 or _.");
    setBusy(true);
    try {
      if (mode === "register") {
        const { data, error: err } = await sb.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`, data: username ? { username } : undefined },
        });
        if (err) throw err;
        if (data.session) await done();
        else if (onNeedsVerification) onNeedsVerification(email);
        else setSentTo(email);
      } else {
        const { error: err } = await sb.auth.signInWithPassword({ email, password });
        if (err) throw err;
        await done();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (!sb) {
    return (
      <Notice tone="warn" title="ACCOUNTS OFFLINE">
        This lab hasn&apos;t been connected to Supabase yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable email accounts.
      </Notice>
    );
  }

  if (sentTo) {
    return (
      <Notice tone="success" title="CHECK YOUR INBOX">
        We sent a verification link to <span className="text-ink">{sentTo}</span>. Click it to activate your account. If you already have an account, log in instead.
      </Notice>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <Notice tone="error" title={mode === "login" ? "LOGIN FAILED" : "SIGN-UP FAILED"}>
          {error}
        </Notice>
      ) : null}
      {mode === "register" && showUsername ? (
        <PixelInput label="Username (optional)" name="username" autoComplete="username" placeholder="pixelbuilder" maxLength={20} hint="Public. You can change it later." />
      ) : null}
      <PixelInput label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" hint={mode === "register" ? "Used to sign in. Never shown publicly." : undefined} />
      <PixelInput label="Password" name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 8 : undefined} placeholder="••••••••" />
      {mode === "login" ? (
        <Link href="/forgot-password" className="-mt-2 self-end text-xs text-dim underline-offset-4 hover:text-mint hover:underline">
          Forgot password?
        </Link>
      ) : null}
      <button type="submit" disabled={busy} className={cn("px-btn px-btn-mint mt-1 w-full")}>
        {busy ? "CONNECTING..." : submitLabel ?? (mode === "register" ? "[ CREATE ACCOUNT ]" : "[ LOG IN ]")}
      </button>
      <div className="px-divider pt-3 text-center text-sm text-dim">
        {mode === "register" ? "Already have an account?" : "New to the lab?"}
        {onModeChange ? (
          <button type="button" onClick={() => { setError(null); onModeChange(mode === "register" ? "login" : "register"); }} className="px-btn px-btn-ghost px-btn-sm ml-3">
            {mode === "register" ? "[ LOG IN ]" : "[ CREATE ACCOUNT ]"}
          </button>
        ) : (
          <Link href={`${mode === "register" ? "/login" : "/register"}?next=${encodeURIComponent(next)}`} className="px-btn px-btn-ghost px-btn-sm ml-3">
            {mode === "register" ? "[ LOG IN ]" : "[ CREATE ACCOUNT ]"}
          </Link>
        )}
      </div>
    </form>
  );
}
