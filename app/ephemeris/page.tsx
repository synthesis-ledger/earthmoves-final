// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// /app/ephemeris/page.tsx Ã¢â‚¬â€ The Ephemeris index (magazine home)
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllArticles, COLUMNS, ephemeriscolumn } from "@/lib/ephemeris";
import ephemeriscard from "@/components/ephemeris/ephemeriscard";
import emailcapture from "@/components/ephemeris/emailcapture";
import "../earth-moves.css";
import "./ephemeris.css";

const BASE_URL = "https://earthmoves.space";

export const metadata: Metadata = {
  title: "The Ephemeris Ã¢â‚¬â€ Earth Moves",
  description:
    "Astronomical briefings, orbital insights, and natural time philosophy. The editorial voice of Earth Moves Ã¢â‚¬â€ connecting nature, space and time.",
  openGraph: {
    title: "The Ephemeris Ã¢â‚¬â€ Earth Moves",
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

  // Group remaining by column
  const byColumn: Partial<Record<ephemeriscolumn, typeof articles>> = {};
  for (const a of rest) {
    if (!byColumn[a.meta.column]) byColumn[a.meta.column] = [];
    byColumn[a.meta.column]!.push(a);
  }

  return (
    <>
      <div className="stars" />

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â NAV Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <nav className="em-nav scrolled">
        <Link href="/" className="nav-logo">
          <Image src="/em-logo-white.png" alt="Earth Moves" width={480} height={96} style={{ height: "auto", width: "clamp(120px, 12vw, 160px)" }} priority />
        </Link>
        <div className="nav-links">
          <Link href="/#instruments">Instruments</Link>
          <Link href="/#philosophy">Philosophy</Link>
          <Link href="/ephemeris" className="active">Ephemeris</Link>
          <Link href="/#store">Store</Link>
        </div>
      </nav>

      <main className="eph-index">
        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ HEADER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ FEATURED ARTICLE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {featured && (
          <section className="eph-featured">
            <ephemeriscard article={featured} featured />
          </section>
        )}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ COLUMN SECTIONS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {(Object.keys(COLUMNS) as ephemeriscolumn[]).map((col) => {
          const colArticles = byColumn[col];
          if (!colArticles?.length) return null;
          const colData = COLUMNS[col];

          return (
            <section key={col} className="eph-column-section">
              <div className="eph-column-header">
                <div className="eph-column-indicator" style={{ background: colData.color }} />
                <div>
                  <h2 className="eph-column-name">{colData.label}</h2>
                  <p className="eph-column-desc">{colData.description}</p>
                </div>
              </div>
              <div className="eph-column-grid">
                {colArticles.slice(0, 4).map((a) => (
                  <ephemeriscard key={a.meta.slug} article={a} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ ALL ARTICLES (archive) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {rest.length > 4 && (
          <section className="eph-archive">
            <h2 className="eph-archive-heading">All Articles</h2>
            <div className="eph-archive-grid">
              {articles.map((a) => (
                <ephemeriscard key={a.meta.slug} article={a} compact />
              ))}
            </div>
          </section>
        )}

        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ EMAIL CAPTURE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <emailcapture />
      </main>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â FOOTER Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <footer className="em-footer">
        <Link href="/" className="f-brand"><Image src="/em-logo-white.png" alt="Earth Moves" width={480} height={96} style={{ height: "auto", width: 120, opacity: 0.8 }} /></Link>
        <div className="f-links">
          <Link href="/watch">Watch</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/ephemeris">Ephemeris</Link>
          <a href="https://earthmoves.space/store">Store</a>
        </div>
        <span className="f-copy">Ã‚Â© 2026 Earth Moves AS</span>
      </footer>
    </>
  );
}
