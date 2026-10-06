import type { NextRequest } from "next/server";
import { decodeSelection, evaluateSelection, parseRgb, sanitizeBuildName } from "@/lib/pc-engine";
import { renderShareCard } from "@/lib/share-card";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const summary = evaluateSelection(decodeSelection(sp.get("parts")));
  const by = sp.get("by");
  const n = Number(sp.get("n"));
  return renderShareCard(
    {
      summary,
      rgb: parseRgb(sp.get("rgb")),
      name: sanitizeBuildName(sp.get("name")),
      by: by && /^[a-z0-9_]{3,20}$/i.test(by) ? by : null,
      number: Number.isInteger(n) && n > 0 ? n : null,
    },
    { "Cache-Control": "public, max-age=86400, immutable" },
  );
}
