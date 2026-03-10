// ═══════════════════════════════════════════════════════════════════════
// /app/ephemeris/page.tsx — The Ephemeris index (magazine home)
// ═══════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllArticles, COLUMNS, EphemerisColumn } from "@/lib/ephemeris";
import EphemerisCard from "@/components/ephemeris/EphemerisCard";
import EmailCapture from "@/components/ephemeris/EmailCapture";
import "../earth-moves.css";
import "./ephemeris.css";

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

  // Group remaining by column
  const byColumn: Partial<Record<EphemerisColumn, typeof articles>> = {};
  for (const a of rest) {
    if (!byColumn[a.meta.column]) byColumn[a.meta.column] = [];
    byColumn[a.meta.column]!.push(a);
  }

  return (
    <>
      <div className="stars" />

      {/* ═══ NAV ═══ */}
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
        {/* ─── HEADER ─── */}
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

        {/* ─── FEATURED ARTICLE ─── */}
        {featured && (
          <section className="eph-featured">
            <EphemerisCard article={featured} featured />
          </section>
        )}

        {/* ─── COLUMN SECTIONS ─── */}
        {(Object.keys(COLUMNS) as EphemerisColumn[]).map((col) => {
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
                  <EphemerisCard key={a.meta.slug} article={a} />
                ))}
              </div>
            </section>
          );
        })}

        {/* ─── ALL ARTICLES (archive) ─── */}
        {rest.length > 4 && (
          <section className="eph-archive">
            <h2 className="eph-archive-heading">All Articles</h2>
            <div className="eph-archive-grid">
              {articles.map((a) => (
                <EphemerisCard key={a.meta.slug} article={a} compact />
              ))}
            </div>
          </section>
        )}

        {/* ─── EMAIL CAPTURE ─── */}
        <EmailCapture />
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="em-footer">
        <Link href="/" className="f-brand"><Image src="/em-logo-white.png" alt="Earth Moves" width={480} height={96} style={{ height: "auto", width: 120, opacity: 0.8 }} /></Link>
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
