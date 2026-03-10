// /app/api/articles/latest/route.ts
import { NextResponse } from "next/server";
import { getAllArticles, COLUMNS } from "@/lib/ephemeris";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = getAllArticles().slice(0, 6);

    console.log(`[API /articles/latest] Found ${articles.length} articles`);

    const result = articles.map((a) => ({
      title: a.meta.title,
      slug: a.meta.slug,
      column: COLUMNS[a.meta.column]?.label || a.meta.column,
      columnColor: COLUMNS[a.meta.column]?.color || "#C9A96E",
      description: a.meta.description,
      date: a.meta.date,
      readingTime: a.readingTime,
      image: a.meta.image || null,
    }));

    return NextResponse.json({ articles: result });
  } catch (err) {
    console.error("[API /articles/latest] Error:", err);
    return NextResponse.json({ articles: [], error: String(err) });
  }
}
// force-rebuild-v1
