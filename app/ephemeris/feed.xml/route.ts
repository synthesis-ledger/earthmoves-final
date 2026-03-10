// ═══════════════════════════════════════════════════════════════════════
// /app/ephemeris/feed.xml/route.ts — RSS Feed
// Enables Google News, Feedly, and any RSS reader to discover articles
// ═══════════════════════════════════════════════════════════════════════

import { getAllArticles, generateRSS } from "@/lib/ephemeris";

const BASE_URL = "https://earthmoves.space";

export async function GET() {
  const articles = getAllArticles();
  const xml = generateRSS(articles, BASE_URL);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
