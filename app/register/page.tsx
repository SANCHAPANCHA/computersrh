import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPageForm } from "@/components/auth/AuthPageForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { getViewer } from "@/lib/db/queries";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  if (await getViewer()) redirect(next);
  return (
    <AuthShell title="REGISTER.EXE" heading="JOIN THE LAB" sub="Create a free RH PC LAB account to save and share your rigs.">
      <AuthPageForm mode="register" next={next} />
    </AuthShell>
  );
}
