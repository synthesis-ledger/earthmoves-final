import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { getAllArticles, COLUMNS, ephemeriscolumn } from "@/lib/ephemeris";
// Casing: Variable name must be Capitalized, Path must be lowercase
import EphemerisCard from "@/components/ephemeris/ephemeriscard";
import EmailCapture from "@/components/ephemeris/emailcapture";
import "../earth-moves.css";
import "./ephemeris.css";

function SectionDivider() {
  return (
    <div className="eph-section-divider">
      <div className="eph-divider-line" />
      <Image
        src="/images/em-logo-white.png"
        alt=""
        width={60}
        height={12}
        className="eph-divider-logo"
        aria-hidden
      />
      <div className="eph-divider-line" />
    </div>
  );
}

const BASE_URL = "https://earthmoves.space";

export const metadata: Metadata = {
  title: "The Ephemeris — Earth Moves",
  description:
    "Astronomical briefings, orbital insights, and natural time philosophy. The editorial voice of Earth Moves — connecting nature, space and time.",
  openGraph: {
    title: "The Ephemeris — Earth Moves",
    description: "Astronomical briefings, orbital insights, and natural time philosophy.",
    url: `${BASE_URL}/ephemeris`,
    siteName: "Earth Moves",
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/ephemeris`,
    types: { "application/rss+xml": `${BASE_URL}/ephemeris/feed.xml` },
  },
};

export default function EphemerisIndex() {
  const articles = getAllArticles();
  const featured = articles[0];
  const rest = articles.slice(1);

  const byColumn: Partial<Record<ephemeriscolumn, typeof articles>> = {};
  for (const a of rest) {
    if (!byColumn[a.meta.column]) byColumn[a.meta.column] = [];
    byColumn[a.meta.column]!.push(a);
  }

  const activeColumns = (Object.keys(COLUMNS) as ephemeriscolumn[]).filter(
    (col) => (byColumn[col]?.length ?? 0) > 0
  );

  const featuredDate = featured
    ? new Date(featured.meta.date).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "";
  const featuredCol = featured ? COLUMNS[featured.meta.column] : null;

  return (
    <>
      <div className="stars" />

      <nav className="em-nav scrolled">
        <Link href="/" className="nav-logo">
          {/* Path updated to /images/ */}
          <Image src="/images/em-logo-white.png" alt="Earth Moves" width={480} height={96} style={{ height: "auto", width: "clamp(120px, 12vw, 160px)" }} priority />
        </Link>
        <div className="nav-links">
          <Link href="/#instruments">Instruments</Link>
          <Link href="/#philosophy">Philosophy</Link>
          <Link href="/ephemeris" className="active">Ephemeris</Link>
          <Link href="/#store">Store</Link>
        </div>
      </nav>

      <main className="eph-index">
        <header className="eph-index-header">
          <span className="section-label">The Ephemeris</span>
          <h1>Astronomical Briefings &amp; Natural Time</h1>
          <p className="eph-index-sub">
            The editorial voice of Earth Moves. Orbital insights, space weather
            dispatches, and essays on reconnecting with the rhythm of the cosmos.
          </p>
          <Link href="/ephemeris/feed.xml" className="eph-rss-link">
            RSS Feed
          </Link>
        </header>

        {/* ── HERO ARTICLE ─────────────────────────────────────────── */}
        {featured && (
          <section className="eph-hero-banner">
            {featured.meta.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.meta.image}
                alt=""
                className="eph-hero-bg"
                aria-hidden
              />
            )}
            <div className="eph-hero-overlay" />
            <Link href={`/ephemeris/${featured.meta.slug}`} className="eph-hero-content">
              {featuredCol && (
                <span className="eph-hero-tag" style={{ color: featuredCol.color }}>
                  {featuredCol.label}
                </span>
              )}
              <h2 className="eph-hero-title">{featured.meta.title}</h2>
              <p className="eph-hero-desc">{featured.meta.description}</p>
              <div className="eph-hero-meta">
                <time>{featuredDate}</time>
                <span className="eph-dot">·</span>
                <span>{featured.readingTime} min read</span>
                <span className="eph-hero-arrow">→</span>
              </div>
            </Link>
          </section>
        )}

        {/* ── CATEGORY SECTIONS ────────────────────────────────────── */}
        {activeColumns.map((col, idx) => {
          const colArticles = byColumn[col]!;
          const colData = COLUMNS[col];
          const count = colArticles.length;
          const gridClass =
            count === 1 ? "eph-column-grid--solo" :
            count === 2 ? "eph-column-grid--duo" :
            "eph-column-grid--multi";

          return (
            <Fragment key={col}>
              {idx > 0 && <SectionDivider />}
              <section className="eph-column-section">
                <div
                  className="eph-column-header"
                  style={{ borderLeft: `4px solid ${colData.color}` }}
                >
                  <div>
                    <h2 className="eph-column-name">{colData.label}</h2>
                    <p className="eph-column-desc">{colData.description}</p>
                  </div>
                </div>
                <div className={gridClass}>
                  {colArticles.slice(0, 4).map((a) => (
                    <EphemerisCard
                      key={a.meta.slug}
                      article={a}
                      landscape={count === 1}
                    />
                  ))}
                </div>
              </section>
            </Fragment>
          );
        })}

        {/* ── ALL ARTICLES MASONRY ──────────────────────────────────── */}
        {articles.length > 0 && (
          <>
            <SectionDivider />
            <section className="eph-archive">
              <h2 className="eph-archive-heading">All Articles</h2>
              <div className="eph-archive-masonry">
                {articles.map((a, i) => (
                  <EphemerisCard
                    key={a.meta.slug}
                    article={a}
                    compact={i % 3 !== 0}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        <EmailCapture />
      </main>

      <footer className="em-footer">
        <Link href="/" className="f-brand">
          {/* Path updated to /images/ */}
          <Image src="/images/em-logo-white.png" alt="Earth Moves" width={480} height={96} style={{ height: "auto", width: 120, opacity: 0.8 }} />
        </Link>
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