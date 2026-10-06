import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/layout/Providers";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkyBackground } from "@/components/layout/SkyBackground";
import { getViewer } from "@/lib/db/queries";
import { DISCLAIMER, siteUrl } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "./globals.css";

const pixelify = localFont({
  src: [
    { path: "../assets/fonts/PixelifySans-Regular.ttf", weight: "400" },
    { path: "../assets/fonts/PixelifySans-Bold.ttf", weight: "700" },
  ],
  variable: "--font-pixelify",
  display: "swap",
});
const silkscreen = localFont({ src: "../assets/fonts/Silkscreen-Regular.ttf", variable: "--font-silkscreen", display: "swap" });
const spaceMono = localFont({ src: "../assets/fonts/SpaceMono-Regular.ttf", variable: "--font-spacemono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "RH PC LAB — Build your dream rig", template: "%s · RH PC LAB" },
  description: `Build. Customize. Score. Share. A retro PC-building game. ${DISCLAIMER}`,
  openGraph: { title: "RH PC LAB", description: "BUILD YOUR DREAM RIG. Build. Customize. Score. Share.", siteName: "RH PC LAB", type: "website" },
  twitter: { card: "summary_large_image", title: "RH PC LAB", description: "BUILD YOUR DREAM RIG." },
};

export const viewport: Viewport = { themeColor: "#1a1b4e" };

// Every page reads the auth session, so never prerender.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const authEnabled = isSupabaseConfigured();
  return (
    <html lang="en" className={`${pixelify.variable} ${silkscreen.variable} ${spaceMono.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main" className="sr-only z-[200] bg-mint px-3 py-2 text-navy-900 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <SkyBackground />
        <Providers viewer={viewer} authEnabled={authEnabled}>
          <SiteHeader viewer={viewer} authEnabled={authEnabled} />
          <main id="main" className="relative z-10 flex-1 px-3 pt-6 sm:px-5 sm:pt-10">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
