"use client";

import { useState, type FormEvent } from "react";
import { PixelInput } from "@/components/ui/PixelInput";
import { Notice } from "@/components/ui/States";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sb = getBrowserSupabase();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sb) return;
    setBusy(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const { error: err } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  if (!sb) return <Notice tone="warn" title="ACCOUNTS OFFLINE">Supabase is not configured.</Notice>;
  if (sent) return <Notice tone="success" title="CHECK YOUR INBOX">If that email has an account, a reset link is on its way.</Notice>;
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error ? <Notice tone="error" title="RESET FAILED">{error}</Notice> : null}
      <PixelInput label="Email" name="email" type="email" required autoComplete="email" />
      <button type="submit" className="px-btn px-btn-mint" disabled={busy}>{busy ? "SENDING..." : "[ SEND RESET LINK ]"}</button>
    </form>
  );
}
