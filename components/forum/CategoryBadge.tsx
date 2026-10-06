import { PixelBadge } from "@/components/ui/PixelBadge";
import { FORUM_COLORS, FORUM_LABELS, type ForumCategory } from "@/types/forum";

export function CategoryBadge({ category }: { category: ForumCategory }) {
  return <PixelBadge color={FORUM_COLORS[category]}>{FORUM_LABELS[category]}</PixelBadge>;
}
