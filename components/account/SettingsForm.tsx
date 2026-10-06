"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { PixelInput, PixelSelect, PixelTextarea } from "@/components/ui/PixelInput";
import { useToast } from "@/components/ui/PixelToast";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { AVATARS } from "@/data/avatars";
import { COMPONENTS } from "@/data/components";
import { deleteAccount, signOut, updateProfile } from "@/lib/db/actions";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { PublicProfile } from "@/types/db";

export function SettingsForm({ profile, email }: { profile: PublicProfile; email: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [avatar, setAvatar] = useState(profile.avatar);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy("profile");
    const res = await updateProfile({
      username: String(fd.get("username") ?? ""),
      avatar,
      bio: String(fd.get("bio") ?? ""),
      favoriteComponent: String(fd.get("favorite") ?? "") || null,
    });
    setBusy(null);
    if (res.ok) { toast({ tone: "success", title: "PROFILE SAVED" }); router.refresh(); }
    else toast({ tone: "error", title: "SAVE FAILED", message: res.error });
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const pw = String(new FormData(form).get("password") ?? "");
    if (pw.length < 8) return toast({ tone: "error", title: "PASSWORD TOO SHORT", message: "Use at least 8 characters." });
    setBusy("password");
    const { error } = (await getBrowserSupabase()?.auth.updateUser({ password: pw })) ?? { error: new Error("Offline") };
    setBusy(null);
    if (error) toast({ tone: "error", title: "PASSWORD NOT CHANGED", message: error.message });
    else { form.reset(); toast({ tone: "success", title: "PASSWORD UPDATED" }); }
  }

  async function logout() {
    setBusy("logout");
    await signOut().catch(() => {});
    await getBrowserSupabase()?.auth.signOut({ scope: "local" }).catch(() => {});
    // Full reload so every server component re-renders logged out.
    window.location.assign("/");
  }

  async function destroy() {
    setBusy("delete");
    const res = await deleteAccount();
    setBusy(null);
    if (!res.ok) return toast({ tone: "error", title: "DELETE FAILED", message: res.error });
    await getBrowserSupabase()?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <RetroWindow title="PROFILE.CFG" footerLeft="Public profile information">
        <form onSubmit={saveProfile} className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold">PROFILE</h2>
          <PixelInput label="Username" name="username" defaultValue={profile.username} required minLength={3} maxLength={20} pattern="[a-z0-9_]{3,20}" hint="3–20 characters: a–z, 0–9, _" autoComplete="username" />
          <fieldset>
            <legend className="px-label">Avatar</legend>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {AVATARS.map((a) => (
                <button key={a.id} type="button" onClick={() => setAvatar(a.id)} aria-pressed={avatar === a.id} aria-label={a.name}
                  className={cn("border-2 p-1", avatar === a.id ? "border-mint bg-mint/10" : "border-line hover:border-line-strong")}>
                  <PixelAvatar id={a.id} size={44} className="mx-auto" />
                </button>
              ))}
            </div>
          </fieldset>
          <PixelTextarea label="Bio" name="bio" defaultValue={profile.bio} maxLength={160} rows={3} hint="Up to 160 characters." />
          <PixelSelect label="Favourite component" name="favorite" defaultValue={profile.favoriteComponent ?? ""}>
            <option value="">— none —</option>
            {COMPONENTS.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.category.toUpperCase()})</option>)}
          </PixelSelect>
          <button type="submit" className="px-btn px-btn-mint self-start" disabled={busy === "profile"}>{busy === "profile" ? "SAVING..." : "[ SAVE PROFILE ]"}</button>
        </form>
      </RetroWindow>

      <RetroWindow title="SECURITY.CFG" footerLeft="Private">
        <h2 className="text-2xl font-bold">ACCOUNT</h2>
        {email ? <p className="mt-2 text-sm text-dim">Signed in as <span className="text-ink">{email}</span> — never shown publicly.</p> : null}
        <form onSubmit={changePassword} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1"><PixelInput label="New password" name="password" type="password" autoComplete="new-password" minLength={8} required /></div>
          <button type="submit" className="px-btn" disabled={busy === "password"}>CHANGE PASSWORD</button>
        </form>
        <div className="px-divider my-5" />
        <button type="button" onClick={logout} className="px-btn px-btn-ghost" disabled={busy === "logout"}>[ LOG OUT ]</button>
      </RetroWindow>

      <RetroWindow title="DANGER_ZONE.CFG" footerLeft="This cannot be undone">
        <h2 className="text-2xl font-bold text-red">DELETE ACCOUNT</h2>
        <p className="mt-2 text-sm text-dim">Permanently deletes your account, profile, builds, likes and challenge entries.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1"><PixelInput label='Type "DELETE" to confirm' name="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" /></div>
          <button type="button" className="px-btn px-btn-danger" disabled={confirmText !== "DELETE" || busy === "delete"} onClick={destroy}>{busy === "delete" ? "DELETING..." : "DELETE FOREVER"}</button>
        </div>
      </RetroWindow>
    </div>
  );
}
