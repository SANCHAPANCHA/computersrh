import { FEED_DEFAULT_LIMIT, getXFeed } from "@/lib/x-feed/feed";

export async function GET(req: Request) {
  const limit = Number(new URL(req.url).searchParams.get("limit")) || FEED_DEFAULT_LIMIT;
  const feed = await getXFeed(limit);
  return Response.json(feed, {
    // Lets a CDN absorb polling traffic; the DB lock bounds real X API calls.
    headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" },
  });
}
