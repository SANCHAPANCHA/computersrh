import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { COMPUTERS_RH_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage file="TERMS.TXT" title="TERMS" updated="October 2026">
      <section>
        <h2>Unofficial fan project</h2>
        <p>
          <strong>RH PC LAB is an unofficial community-made project inspired by <a className="text-mint hover:underline" href={COMPUTERS_RH_URL} target="_blank" rel="noopener noreferrer">Computers RH</a>.</strong>{" "}
          It is not affiliated with, endorsed by, or operated by Computers RH or Robinhood.
        </p>
      </section>
      <section>
        <h2>Fictional game content</h2>
        <p>All components, rarities, scores and values in RH PC LAB are fictional game data. They are not real products, official Computers RH items, or real market prices.</p>
      </section>
      <section>
        <h2>Off-chain</h2>
        <p>RH PC LAB is an off-chain web application. Builds are not tokens or NFTs, and nothing in the lab involves wallets, cryptocurrency or transactions.</p>
      </section>
      <section>
        <h2>Be kind</h2>
        <p>Keep usernames, bios and build names friendly. Offensive content or impersonation (including of Computers RH or Robinhood) may be removed.</p>
      </section>
      <section>
        <h2>As-is</h2>
        <p>The lab is provided as-is by community volunteers, without guarantees of availability. Features may change or reset.</p>
      </section>
    </LegalPage>
  );
}
