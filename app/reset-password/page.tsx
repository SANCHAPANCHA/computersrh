import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/ResetForm";
import { Notice } from "@/components/ui/States";
import { getViewer } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPage() {
  const viewer = await getViewer();
  return (
    <AuthShell title="RESET.EXE" heading="NEW PASSWORD" sub="Choose a new password for your account.">
      {viewer ? <ResetForm /> : <Notice tone="error" title="LINK EXPIRED">Open the reset link from your email again, or request a new one.</Notice>}
    </AuthShell>
  );
}
