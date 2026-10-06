import { getBuild } from "@/lib/db/queries";
import { evaluateSelection } from "@/lib/pc-engine";
import { CARD_SIZE, renderShareCard } from "@/lib/share-card";

export const size = CARD_SIZE;
export const contentType = "image/png";
export const alt = "RH PC LAB build card";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const b = await getBuild((await params).id);
  if (!b) return renderShareCard({ summary: evaluateSelection({}), rgb: "mint", name: "SYSTEM NOT FOUND" });
  return renderShareCard({ summary: evaluateSelection(b.selection), rgb: b.rgb, name: b.name, by: b.owner.username, number: b.number });
}
