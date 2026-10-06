"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PixelInput } from "@/components/ui/PixelInput";
import { Notice } from "@/components/ui/States";
import { useToast } from "@/components/ui/PixelToast";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function ResetForm() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get("password") ?? "");
    if (pw.length < 8) return setError("Use at least 8 characters.");
    if (pw !== fd.get("confirm")) return setError("Passwords don't match.");
    setBusy(true);
    const { error: err } = (await getBrowserSupabase()?.auth.updateUser({ password: pw })) ?? { error: new Error("Offline") };
    setBusy(false);
    if (err) return setError(err.message);
    toast({ tone: "success", title: "PASSWORD UPDATED" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error ? <Notice tone="error" title="RESET FAILED">{error}</Notice> : null}
      <PixelInput label="New password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      <PixelInput label="Confirm password" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
      <button type="submit" className="px-btn px-btn-mint" disabled={busy}>{busy ? "SAVING..." : "[ SET PASSWORD ]"}</button>
    </form>
  );
}
