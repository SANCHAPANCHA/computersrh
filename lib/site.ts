export const SITE_NAME = "RH PC LAB";
export const DISCLAIMER = "An unofficial community-made project inspired by Computers RH.";
export const NOT_AFFILIATED = "Not affiliated with or endorsed by Computers RH or Robinhood.";
export const COMPUTERS_RH_URL = "https://www.computersrh.xyz/";
export const COMPUTERS_RH_X = "https://x.com/ComputersRh";

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function xShareUrl(score: number, url: string): string {
  const text = `I just built a ${score}/100 PC in RH PC LAB 🖥️\n\nBuild yours:\n${url}\n\nUnofficial community project inspired by @ComputersRh`;
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}
