import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <AuthShell title="RECOVER.EXE" heading="FORGOT PASSWORD" sub="Enter your email and we'll send a reset link.">
      <ForgotForm />
      <p className="mt-5 text-center text-sm text-dim">
        <Link href="/login" className="hover:text-mint hover:underline">← Back to log in</Link>
      </p>
    </AuthShell>
  );
}
