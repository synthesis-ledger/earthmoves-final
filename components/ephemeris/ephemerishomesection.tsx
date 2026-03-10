// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EphemerisHomeSection â€” Drop into homepage page.tsx
// Shows 3 latest articles in the Earth Moves design language.
// Import and place between Instruments and Features sections.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import Link from "next/link";
import { getAllArticles, COLUMNS } from "@/lib/ephemeris";

export default function EphemerisHomeSection() {
  const articles = getAllArticles().slice(0, 3);
  if (!articles.length) return null;

  return (
    <section className="eph-home" id="ephemeris">
      <div className="eph-home-header">
        <span className="section-label reveal">The Ephemeris</span>
        <h2 className="reveal reveal-delay-1">Astronomical Briefings</h2>
      </div>
      <div className="eph-home-grid">
        {articles.map((a, i) => {
          const col = COLUMNS[a.meta.column];
          const date = new Date(a.meta.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          return (
            <Link
              key={a.meta.slug}
              href={`/ephemeris/${a.meta.slug}`}
              className={`eph-home-card reveal${i > 0 ? ` reveal-delay-${i}` : ""}`}
            >
              {a.meta.image && (
                <div className="eph-home-card-img">
                  <img src={a.meta.image} alt={a.meta.imageAlt || a.meta.title} loading="lazy" />
                </div>
              )}
              <div className="eph-home-card-body">
                <span className="eph-home-card-tag" style={{ color: col.color }}>{col.label}</span>
                <h3>{a.meta.title}</h3>
                <p>{a.meta.description}</p>
                <span className="eph-home-card-date">{date} Â· {a.readingTime} min read</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="eph-home-cta reveal">
        <Link href="/ephemeris" className="btn-instrument">
          View The Ephemeris
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
