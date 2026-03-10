// ═══════════════════════════════════════════════════════════════════════
// /app/ephemeris/[slug]/page.tsx — Individual article page
// Server Component: full SSR for SEO + AEO crawlability
// ═══════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getArticle,
  getAllArticles,
  getRelatedArticles,
  generateArticleSchema,
  generateFaqSchema,
  generateBreadcrumbSchema,
  COLUMNS,
} from "@/lib/ephemeris";
import EmailCapture from "@/components/ephemeris/emailcapture";
import EphemerisCard from "@/components/ephemeris/ephemeriscard";
import "../../earth-moves.css";
import "../ephemeris.css";

const BASE_URL = "https://earthmoves.space";

// ─── STATIC PARAMS (pre-render all articles at build time) ────────────
export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.meta.slug }));
}

// ─── METADATA (title, description, OG, Twitter) ──────────────────────
// In Next.js 15, params is a Promise that must be awaited
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const article = getArticle(params.slug);
  if (!article) return { title: "Article Not Found" };

  const url = `${BASE_URL}/ephemeris/${article.meta.slug}`;
  return {
    title: `${article.meta.title} — The Ephemeris | Earth Moves`,
    description: article.meta.description,
    keywords: article.meta.keywords,
    authors: [{ name: article.meta.author }],
    openGraph: {
      title: article.meta.title,
      description: article.meta.description,
      url,
      siteName: "Earth Moves",
      type: "article",
      publishedTime: article.meta.date,
      modifiedTime: article.meta.updated || article.meta.date,
      authors: [article.meta.author],
      images: article.meta.image
        ? [{ url: `${BASE_URL}${article.meta.image}`, alt: article.meta.imageAlt || article.meta.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.meta.title,
      description: article.meta.description,
      images: article.meta.image ? [`${BASE_URL}${article.meta.image}`] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────

export default async function ArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  // MUST await params in Next.js 15
  const params = await props.params;
  const article = getArticle(params.slug);
  
  if (!article) notFound();

  const related = getRelatedArticles(article, 3);
  const columnKey = article.meta.column as keyof typeof COLUMNS;
  const column = COLUMNS[columnKey] || COLUMNS["natural-time"];

  // Schema.org JSON-LD
  const articleSchema = generateArticleSchema(article, BASE_URL);
  const breadcrumbSchema = generateBreadcrumbSchema(article, BASE_URL);
  const faqSchema = article.meta.faq?.length
    ? generateFaqSchema(article.meta.faq)
    : null;

  const publishDate = new Date(article.meta.date);
  const formattedDate = publishDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="stars" />

      {/* ═══ NAV ═══ */}
      <nav className="em-nav scrolled">
        <Link href="/" className="nav-logo">
          <Image src="/em-logo-white.png" alt="Earth Moves" width={480} height={96} style={{ height: "auto", width: "clamp(120px, 12vw, 160px)" }} priority />
        </Link>
        <div className="nav-links">
          <Link href="/#instruments">Instruments</Link>
          <Link href="/#philosophy">Philosophy</Link>
          <Link href="/ephemeris">Ephemeris</Link>
          <Link href="/#store">Store</Link>
        </div>
      </nav>

      <article className="eph-article">
        {/* ─── BREADCRUMBS ─── */}
        <nav className="eph-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="eph-bc-sep">›</span>
          <Link href="/ephemeris">The Ephemeris</Link>
          <span className="eph-bc-sep">›</span>
          <span className="eph-bc-current">{article.meta.title}</span>
        </nav>

        {/* ─── ARTICLE HEADER ─── */}
        <header className="eph-header">
          <div className="eph-column-tag" style={{ color: column.color, borderColor: column.color + "40" }}>
            {column.label}
          </div>
          <h1 className="eph-title">{article.meta.title}</h1>
          <p className="eph-description">{article.meta.description}</p>
          <div className="eph-meta-row">
            <time dateTime={article.meta.date}>{formattedDate}</time>
            {article.meta.updated && article.meta.updated !== article.meta.date && (
              <span className="eph-updated">Updated {new Date(article.meta.updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            )}
            <span className="eph-dot">·</span>
            <span>{article.readingTime} min read</span>
            <span className="eph-dot">·</span>
            <span>{article.meta.author}</span>
          </div>
        </header>

        {/* ─── HERO IMAGE ─── */}
        {article.meta.image && (
          <figure className="eph-hero-figure">
            <img
              src={article.meta.image}
              alt={article.meta.imageAlt || article.meta.title}
              className="eph-hero-img"
              loading="eager"
            />
            {article.meta.imageCredit && (
              <figcaption className="eph-hero-credit">
                Image: {article.meta.imageCredit}
              </figcaption>
            )}
          </figure>
        )}

        {/* ─── ARTICLE BODY ─── */}
        <div
          className="eph-body"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {/* ─── FAQ SECTION ─── */}
        {article.meta.faq && article.meta.faq.filter(f => f?.q && f?.a).length > 0 && (
          <section className="eph-faq">
            <h2 className="eph-h2">Frequently Asked Questions</h2>
            {article.meta.faq.filter(f => f?.q && f?.a).map((item, i) => (
              <details key={i} className="eph-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </section>
        )}

        {/* ─── INSTRUMENT LINK ─── */}
        {article.meta.instrument && article.meta.instrument !== "none" && (
          <div className="eph-instrument-cta">
            <div className="eph-instrument-cta-inner">
              <span className="eph-instrument-icon">
                {article.meta.instrument === "watch" ? "⊙" : "◎"}
              </span>
              <div>
                <p className="eph-instrument-cta-text">
                  See this live on the Earth Moves {article.meta.instrument === "watch" ? "Watch" : "Calendar"}
                </p>
                <Link
                  href={article.meta.instrument === "watch" ? "/watch" : "/calendar"}
                  className="eph-instrument-link"
                >
                  Open {article.meta.instrument === "watch" ? "Watch" : "Calendar"} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─── EMAIL CAPTURE ─── */}
        <EmailCapture />

        {/* ─── RELATED ARTICLES ─── */}
        {related.length > 0 && (
          <section className="eph-related">
            <h2 className="eph-related-heading">Continue Reading</h2>
            <div className="eph-related-grid">
              {related.map((r) => (
                <EphemerisCard key={r.meta.slug} article={r} compact />
              ))}
            </div>
          </section>
        )}
      </article>

      {/* ═══ FOOTER ═══ */}
      <footer className="em-footer">
        <div className="f-brand">
          <Image src="/em-logo-white.png" alt="Earth Moves" width={480} height={96} style={{ height: "auto", width: 120, opacity: 0.8 }} />
        </div>
        <div className="f-links">
          <Link href="/watch">Watch</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/ephemeris">Ephemeris</Link>
          <a href="https://earthmoves.space/store">Store</a>
        </div>
        <span className="f-copy">© 2026 Earth Moves AS</span>
      </footer>
    </>
  );
}