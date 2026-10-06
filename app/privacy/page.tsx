import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage file="PRIVACY.TXT" title="PRIVACY" updated="October 2026">
      <p>RH PC LAB is a small, unofficial community project. This page explains, in plain language, what data the lab uses.</p>
      <section>
        <h2>Your email</h2>
        <p>Your email address is used only for authentication: signing in, verifying your account and resetting your password. It is <strong>never displayed publicly</strong> and is not shown on your profile, builds or share cards.</p>
      </section>
      <section>
        <h2>Public profile information</h2>
        <p>The following is public so the community features work:</p>
        <ul>
          <li>your username, chosen pixel avatar and bio</li>
          <li>your favourite component (if you pick one)</li>
          <li>builds you mark as public, their scores and likes</li>
          <li>achievements you unlock and daily challenge entries</li>
        </ul>
        <p>Builds you mark as private are visible only to you.</p>
      </section>
      <section>
        <h2>Storage</h2>
        <p>Accounts and builds are stored with Supabase (database and authentication). Your in-progress build, sound preference and any build waiting to be saved are kept in your browser&apos;s local storage.</p>
      </section>
      <section>
        <h2>No wallets, no tracking pixels</h2>
        <p>The lab doesn&apos;t ask for wallets, keys or payment details, and doesn&apos;t sell data.</p>
      </section>
      <section>
        <h2>Deleting your account</h2>
        <p>You can permanently delete your account at any time from <strong>Settings → Delete account</strong>. This removes your profile, builds, likes and challenge entries.</p>
      </section>
    </LegalPage>
  );
}
