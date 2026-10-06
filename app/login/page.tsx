import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPageForm } from "@/components/auth/AuthPageForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { Notice } from "@/components/ui/States";
import { getViewer } from "@/lib/db/queries";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  if (await getViewer()) redirect(next);
  return (
    <AuthShell title="LOGIN.EXE" heading="LOG IN" sub="Welcome back to the lab.">
      {sp.error ? (
        <div className="mb-4">
          <Notice tone="error" title="LOGIN FAILED">That link is invalid or has expired. Try again.</Notice>
        </div>
      ) : null}
      <AuthPageForm mode="login" next={next} />
    </AuthShell>
  );
}
