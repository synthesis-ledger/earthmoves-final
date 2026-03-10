// ═══════════════════════════════════════════════════════════════════════
// /app/watches/page.tsx — The Collection (Watch Store Bridge)
// ═══════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../earth-moves.css";
import "./watches.css";

const STORE_URL = "https://earthmoves.one";

export const metadata: Metadata = {
  title: "The Collection — Earth Moves Astronomical Watches",
  description:
    "Copernicus and Oceanic: automatic mechanical watches displaying real celestial mechanics — Moon orbit, tides, and day/night cycles — on your wrist. Norwegian craftsmanship meets cosmic precision.",
  openGraph: {
    title: "The Collection — Earth Moves Watches",
    description:
      "Automatic mechanical watches displaying real celestial mechanics on your wrist.",
    url: "https://earthmoves.space/watches",
    siteName: "Earth Moves",
    type: "website",
  },
};

export default function WatchesPage() {
  return (
    <>
      <div className="stars" />

      {/* ═══ NAV ═══ */}
      <nav className="em-nav scrolled">
        <Link href="/" className="nav-logo">
          <Image
            src="/em-logo-white.png"
            alt="Earth Moves"
            width={480}
            height={96}
            style={{ height: "auto", width: "clamp(120px, 12vw, 160px)" }}
            priority
          />
        </Link>
        <div className="nav-links">
          <Link href="/#instruments">Instruments</Link>
          <Link href="/#philosophy">Philosophy</Link>
          <Link href="/ephemeris">Ephemeris</Link>
          <Link href="/watches" className="active">Collection</Link>
          <Link href="/#talk">TEDx Talk</Link>
        </div>
      </nav>

      {/* ═══ HERO — Video Background ═══ */}
      <section className="w-hero">
        <div className="w-hero-video">
          <video autoPlay loop muted playsInline>
            <source src="/images/watches-hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="w-hero-content">
          <span className="w-hero-label"></span>
          <h1 className="w-hero-title">
            <br /><em></em>
          </h1>
          <p className="w-hero-sub">
            
          </p>
        </div>
      </section>

      {/* ═══ COLLECTION — Two Watch Cards ═══ */}
      <section className="w-collection">
        <span className="w-collection-label section-label"></span>
        <h2 className="w-collection-title">
          <em></em>
        </h2>
        <p className="w-collection-sub">
         
        </p>

        <div className="w-grid">
          {/* ── COPERNICUS ── */}
          <div className="w-card">
            <div className="w-card-img">
              <Image
                src="/images/copernicus-front.png"
                alt="Earth Moves Copernicus — The lunar system on your wrist"
                width={1920}
                height={1200}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="w-card-body">
              <h3 className="w-card-name">Copernicus</h3>
              <p className="w-card-tagline">The lunar system on your wrist.</p>
              <div className="w-card-specs">
                <span className="w-card-spec">24H ROTATION</span>
                <span className="w-card-spec">MOON ORBIT 29.5 DAYS</span>
                <span className="w-card-spec">41 MM</span>
                <span className="w-card-spec">150M WR</span>
                <span className="w-card-spec">AUTOMATIC</span>
              </div>
              <span className="w-card-price">$1,200 USD</span>
              <div className="w-card-actions">
                <a
                  href={`${STORE_URL}/copernicus`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-btn-primary"
                >
                  Pre-order Now
                </a>
                <a href="#copernicus-details" className="w-btn-secondary">
                  Details ↓
                </a>
              </div>
            </div>
          </div>

          {/* ── OCEANIC ── */}
          <div className="w-card">
            <div className="w-card-img">
              <Image
                src="/images/oceanic-front.png"
                alt="Earth Moves Oceanic — Synch with nature, ocean and space"
                width={1920}
                height={1200}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="w-card-body">
              <h3 className="w-card-name">Oceanic</h3>
              <p className="w-card-tagline">Synch with nature, ocean and space.</p>
              <div className="w-card-specs">
                <span className="w-card-spec">24H DAY/NIGHT</span>
                <span className="w-card-spec">MOON &amp; TIDE</span>
                <span className="w-card-spec">41 MM</span>
                <span className="w-card-spec">150M WR</span>
                <span className="w-card-spec">AUTOMATIC</span>
              </div>
              <span className="w-card-price">$1,200 USD</span>
              <div className="w-card-actions">
                <a
                  href={`${STORE_URL}/oceanic`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-btn-primary"
                >
                  Pre-order Now
                </a>
                <a
                  href={`${STORE_URL}/oceanic`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-btn-secondary"
                >
                  Full Details →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PHILOSOPHY STRIP ═══ */}
      <section className="w-philosophy">
        <div style={{ width: 40, height: 1, background: "var(--gold)", margin: "0 auto 2rem", opacity: .4 }} />
        <p className="w-philosophy-quote">
          &ldquo;Time exists because motion exists. The Earth moves. The Moon
          moves. We create mechanical timepieces that connect you to the eternal
          dance of Earth, Moon and tides.&rdquo;
        </p>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: ".65rem", color: "var(--text-dim)", marginTop: "1.5rem", letterSpacing: ".08em" }}>
          — BRAGE W. JOHANSEN, FOUNDER
        </p>
      </section>

      {/* ═══ HOW IT WORKS — COPERNICUS DEEP DIVE ═══ */}
      <section className="w-how" id="copernicus-details">
        <div style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
          <span className="section-label" style={{ display: "block", marginBottom: ".5rem" }}>How It Works</span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 300, color: "var(--text-primary)", margin: 0,
          }}>
            How to read <em style={{ fontStyle: "italic" }}>your Copernicus.</em>
          </h2>
        </div>

        <div className="w-how-grid">
          <div className="w-how-image">
            <Image
              src="/images/copernicus-explained.png"
              alt="Copernicus dial explained — Sun, Moon, Earth, day/night cycle"
              width={1344}
              height={768}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <div className="w-how-features">
            <div className="w-how-feature">
              <h4>Sun always at 12:00</h4>
              <p>The Sun stays fixed at the top — a heliocentric perspective.</p>
            </div>
            <div className="w-how-feature">
              <h4>24h rotation</h4>
              <p>Your place and time on Earth, rotating once every 24 hours.</p>
            </div>
            <div className="w-how-feature">
              <h4>Moon orbits Earth</h4>
              <p>The Moon completes its orbit in 29.5 days, just like in reality.</p>
            </div>
            <div className="w-how-feature">
              <h4>Earth with tidal ellipse</h4>
              <p>The center dial shows Earth and the tidal forces at play.</p>
            </div>
            <div className="w-how-feature">
              <h4>Morning &amp; Evening</h4>
              <p>Day and night are intuitively visible on the dial.</p>
            </div>
            <div className="w-how-feature">
              <h4>Minute hand</h4>
              <p>For better accuracy in everyday timekeeping.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE COMPLETE EXPERIENCE ═══ */}
      <section className="w-unbox">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="section-label" style={{ display: "block", marginBottom: ".5rem" }}>What&apos;s Included</span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 300, color: "var(--text-primary)", margin: 0,
          }}>
            The complete <em style={{ fontStyle: "italic" }}>experience.</em>
          </h2>
        </div>

        <div className="w-unbox-img">
          <Image
            src="/images/copernicus-unboxed.png"
            alt="Copernicus unboxing — watch, extra strap, book, and presentation box"
            width={1824}
            height={1140}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div className="w-unbox-text">
          <p>
            The watch is delivered with an extra strap and a book — <em>Earth&apos;s
            Greatest Moves</em> by Brage W. Johansen. It introduces the foundation for
            the watch and your understanding of Time, Space and Nature.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--text-dim)", fontSize: ".85rem" }}>
            Written north of the Arctic circle, with examples from Norway showing how
            our Time system was created, how Near Earth Astronomy connects to it, and
            why we are entering a new space era.
          </p>
        </div>
      </section>

      {/* ═══ SPECIFICATIONS ═══ */}
      <section className="w-specs">
        <div className="w-specs-header">
          <span className="section-label" style={{ display: "block", marginBottom: ".5rem" }}>Specifications</span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 300, color: "var(--text-primary)", margin: 0,
          }}>
            Technical <em style={{ fontStyle: "italic" }}>Details</em>
          </h2>
        </div>

        <div className="w-specs-grid">
          {/* Copernicus specs */}
          <div className="w-specs-col">
            <h4>Copernicus</h4>
            <div className="w-spec-row">
              <span className="w-spec-label">Reference</span>
              <span className="w-spec-value">Copernicus.v1</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Diameter</span>
              <span className="w-spec-value">41 mm</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Case</span>
              <span className="w-spec-value">Stainless steel</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Movement</span>
              <span className="w-spec-value">Auto, EM915SH</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Water resistance</span>
              <span className="w-spec-value">15 bar / 150 m</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Power reserve</span>
              <span className="w-spec-value">30 hours</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Dial</span>
              <span className="w-spec-value">Ivory, matte</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Strap</span>
              <span className="w-spec-value">Nubuck + rubber</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Lume</span>
              <span className="w-spec-value">Super-LumiNova</span>
            </div>
          </div>

          {/* Oceanic specs */}
          <div className="w-specs-col">
            <h4>Oceanic</h4>
            <div className="w-spec-row">
              <span className="w-spec-label">Reference</span>
              <span className="w-spec-value">Oceanic.v1</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Diameter</span>
              <span className="w-spec-value">41 mm</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Case</span>
              <span className="w-spec-value">Stainless steel</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Movement</span>
              <span className="w-spec-value">Auto, EMOT915</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Water resistance</span>
              <span className="w-spec-value">15 bar / 150 m</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Power reserve</span>
              <span className="w-spec-value">30 hours</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Dial</span>
              <span className="w-spec-value">Blue, semi-gloss</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Strap</span>
              <span className="w-spec-value">Sail cloth</span>
            </div>
            <div className="w-spec-row">
              <span className="w-spec-label">Complication</span>
              <span className="w-spec-value">Moon &amp; Tide</span>
            </div>
          </div>
        </div>

        <p style={{
          textAlign: "center", fontSize: ".75rem", fontStyle: "italic",
          color: "var(--text-dim)", marginTop: "2rem",
        }}>
          Both watches are in final development. Minor specifications may change before production.
        </p>
      </section>

      {/* ═══ BRIDGE TO INSTRUMENTS ═══ */}
      <section style={{
        padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)",
        maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1,
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem",
        }}>
          <Link href="/watch" style={{
            textDecoration: "none", color: "inherit", padding: "2rem",
            borderRadius: 16, border: "1px solid var(--border)",
            background: "linear-gradient(145deg, rgba(15,22,42,.5), transparent)",
            display: "block", transition: "all .4s", textAlign: "center",
          }}>
            <span style={{ fontSize: ".6rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: ".5rem" }}>
              Online Instrument
            </span>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem",
              fontWeight: 300, color: "var(--text-primary)", margin: "0 0 .5rem",
            }}>
              The Watch
            </h3>
            <p style={{ fontSize: ".8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              See what Copernicus shows — live. A digital recreation of the heliocentric dial with real astronomical data.
            </p>
          </Link>
          <Link href="/calendar" style={{
            textDecoration: "none", color: "inherit", padding: "2rem",
            borderRadius: 16, border: "1px solid var(--border)",
            background: "linear-gradient(145deg, rgba(15,22,42,.5), transparent)",
            display: "block", transition: "all .4s", textAlign: "center",
          }}>
            <span style={{ fontSize: ".6rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: ".5rem" }}>
              Online Instrument
            </span>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem",
              fontWeight: 300, color: "var(--text-primary)", margin: "0 0 .5rem",
            }}>
              The Calendar
            </h3>
            <p style={{ fontSize: ".8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Track Earth&apos;s orbit with real-time zodiac constellations, planetary positions, and the 8 orbital beacons.
            </p>
          </Link>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="w-cta">
        <div style={{ width: 40, height: 1, background: "var(--gold)", margin: "0 auto 2.5rem", opacity: .3 }} />
        <h2>
          Look up to space,<br /><em>get down to Earth.</em>
        </h2>
        <p>
          Pre-order your Earth Moves timepiece and wear the cosmos on your wrist.
          Norwegian designed. Astronomically precise. Made for those who look up.
        </p>
        <div className="w-cta-buttons">
          <a
            href={`${STORE_URL}/copernicus`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-btn-primary"
          >
            Pre-order Copernicus
          </a>
          <a
            href={`${STORE_URL}/oceanic`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-btn-primary"
          >
            Pre-order Oceanic
          </a>
        </div>
        <p style={{
          fontFamily: "'DM Mono', monospace", fontSize: ".65rem",
          color: "var(--text-dim)", marginTop: "1.5rem", letterSpacing: ".06em",
        }}>
          $1,200 USD · FREE WORLDWIDE SHIPPING · 2-YEAR WARRANTY
        </p>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="em-footer">
        <Link href="/" className="f-brand">
          <Image
            src="/em-logo-white.png"
            alt="Earth Moves"
            width={480}
            height={96}
            style={{ height: "auto", width: 120, opacity: 0.8 }}
          />
        </Link>
        <div className="f-links">
          <Link href="/watch">Watch</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/ephemeris">Ephemeris</Link>
          <Link href="/watches">Collection</Link>
          <a href={STORE_URL} target="_blank" rel="noopener noreferrer">Store</a>
        </div>
        <span className="f-copy">© 2026 Earth Moves AS</span>
      </footer>
    </>
  );
}
