import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/account/SettingsForm";
import { getProfileByUsername, getViewer, getViewerEmail } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/settings");
  const [profile, email] = await Promise.all([getProfileByUsername(viewer.username), getViewerEmail()]);
  if (!profile) redirect("/login");
  return (
    <div className="page-enter mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="kicker">✧ CONTROL PANEL</div>
        <h1 className="h-display mt-2 text-5xl text-cream">SETTINGS</h1>
      </div>
      <SettingsForm profile={profile} email={email} />
    </div>
  );
}
