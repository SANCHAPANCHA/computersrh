import { getXFeed } from "@/lib/x-feed/feed";

export async function GET() {
  const feed = await getXFeed();
  return Response.json(feed, {
    // Lets a CDN absorb polling traffic; the DB lock bounds real X API calls.
    headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" },
  });
}
