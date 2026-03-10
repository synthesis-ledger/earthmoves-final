"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./earth-moves.css";

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Article type for homepage Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
interface HomeArticle {
  title: string;
  slug: string;
  column: string;
  columnColor: string;
  description: string;
  date: string;
  readingTime: number;
  image?: string;
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Fallback data matching real articles Ã¢â‚¬â€ ensures variants always render
  const FALLBACK_ARTICLES: HomeArticle[] = [
    { title: "8 FyrtÃƒÂ¥rn Anchors: Earth's Orbital Celebrations Ã¢â‚¬â€ Solstices, Equinoxes & Cross-Quarters", slug: "eight-fyrtarn-anchors", column: "Natural Time", columnColor: "#6BCB77", description: "Earth Moves identifies 8 astronomical anchors marking our orbital journey: Perihelion, Imbolc, Vernal Equinox, Beltane, Summer Solstice, Lammas, Autumnal Equinox, and Winter Solstice.", date: "2026-03-09", readingTime: 5 },
    { title: "Aurora Borealis & Australis: Complete Guide to Causes, Colors & Viewing Tips", slug: "aurora-borealis-australis-explained", column: "Space Weather", columnColor: "#60A5FA", description: "What causes Aurora Borealis and Australis? Solar wind particles excite oxygen for green/red glows. Best viewing: Kp 3+, midnight, dark skies.", date: "2026-03-09", readingTime: 4 },
    { title: "Carrington Event: The Solar Storm That Could Destroy the Power Grid", slug: "carrington-event-solar-storm", column: "Space Weather", columnColor: "#60A5FA", description: "What if a Carrington-level solar storm hit today? The 1859 event fried telegraphs; now it could cost trillions and collapse modern infrastructure.", date: "2026-03-09", readingTime: 4 },
    { title: "The Sleeping Satellite: Understanding Earth's Moon", slug: "the-sleeping-satellite-moon", column: "Natural Time", columnColor: "#6BCB77", description: "The Moon orbits Earth in 29.5 days, tidally locked so we always see the same face. It creates tides, stabilises Earth's tilt, and shaped the evolution of life.", date: "2026-03-09", readingTime: 5 },
    { title: "Coronal Mass Ejections: When the Sun Hurls Billions of Tons at Earth", slug: "coronal-mass-ejections-explained", column: "Space Weather", columnColor: "#60A5FA", description: "A CME is a massive plasma eruption from the Sun Ã¢â‚¬â€ 1-10 billion tonnes travelling at up to 3,000 km/s. When Earth-directed, they drive aurora and geomagnetic storms.", date: "2026-03-09", readingTime: 4 },
  ];

  const [latestArticles, setLatestArticles] = useState<HomeArticle[]>(FALLBACK_ARTICLES);

  useEffect(() => {
    fetch("/api/articles/latest")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.articles && data.articles.length > 0) {
          console.log(`[Homepage] Loaded ${data.articles.length} articles from API`);
          setLatestArticles(data.articles);
        } else {
          console.log("[Homepage] API returned empty, using fallback");
        }
      })
      .catch((err) => {
        console.warn("[Homepage] Article fetch failed, using fallback:", err);
      });
  }, []);

  const closeMobile = () => setMobileOpen(false);
  const arts = latestArticles;

  return (
    <>
      <div className="stars" />

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â NAV Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <nav className={`em-nav${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          <Image src="/em-logo-white.png" alt="Earth Moves" width={160} height={32} style={{ height: "auto", width: "clamp(120px, 12vw, 160px)" }} priority />
        </Link>
        <div className="nav-links">
          <Link href="#instruments">Instruments</Link>
          <Link href="#philosophy">Philosophy</Link>
          <Link href="/ephemeris">Ephemeris</Link>
          <Link href="#store">Store</Link>
          <Link href="#talk">TEDx Talk</Link>
        </div>
        <button className="hamburger" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <Link href="#instruments" onClick={closeMobile}>Instruments</Link>
        <Link href="#philosophy" onClick={closeMobile}>Philosophy</Link>
        <Link href="/ephemeris" onClick={closeMobile}>Ephemeris</Link>
        <Link href="#store" onClick={closeMobile}>Store</Link>
        <Link href="#talk" onClick={closeMobile}>TEDx Talk</Link>
      </div>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â HERO Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="hero">
        <div className="hero-bg">
          <Image src="/images/hero-earth.jpg" alt="Earth from space" fill priority quality={90} style={{ objectFit: "cover" }} />
        </div>
        <div className="hero-content">
          <h1>Earth Moves</h1>
          <p className="hero-sub">Connecting Nature, Space and Time</p>
          <p className="hero-author">Brage W. Johansen</p>
        </div>
        <div className="hero-scroll"><span>Explore</span><div className="scroll-line" /></div>
      </section>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â PHILOSOPHY Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="philosophy" id="philosophy">
        <span className="section-label reveal">A New Concept of Time</span>
        <blockquote className="reveal reveal-delay-1">
          How we perceive time and think about our place on Earth is very
          important. It shapes our lives and our perspective on human and nature.
          Seeing time and the nearby solar system in context can provide new
          mental insight.
        </blockquote>
        <cite className="reveal reveal-delay-2">Ã¢â‚¬â€ The Earth Moves Philosophy</cite>
      </section>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â INSTRUMENTS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="instruments" id="instruments">
        <div className="instruments-header">
          <span className="section-label reveal">Online Instruments</span>
          <h2 className="reveal reveal-delay-1">Experience Time as Earth</h2>
        </div>
        <div className="instruments-grid">
          <div className="instrument-card reveal">
            <Image className="instrument-img" src="/images/watch-instrument.png" alt="Earth Moves Watch Ã¢â‚¬â€ Live polar projection with real-time day/night cycle" width={600} height={600} />
            <div className="instrument-body">
              <h3>The Watch</h3>
              <p>A 24-hour timepiece following Earth&apos;s rotation. See your location on a live polar projection with real-time day and night, the Moon&apos;s position, cities illuminated, and the ISS orbiting overhead Ã¢â‚¬â€ all moving as Earth truly does.</p>
              <Link href="/watch" className="btn-instrument">View Online Instrument <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg></Link>
            </div>
          </div>
          <div className="instrument-card reveal reveal-delay-1">
            <Image className="instrument-img" src="/images/calendar-instrument.png" alt="Earth Moves Calendar Ã¢â‚¬â€ Orbital view with zodiac constellations" width={600} height={600} />
            <div className="instrument-body">
              <h3>The Calendar</h3>
              <p>An orbital calendar displaying Earth&apos;s precise position around the Sun. Track equinoxes, solstices, and celestial events through an immersive visualization with zodiac constellations, planetary positions, and real-time astronomical data.</p>
              <Link href="/calendar" className="btn-instrument">View Online Instrument <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg></Link>
            </div>
          </div>
        </div>
      </section>


      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â THE EPHEMERIS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <VariantG arts={arts} />


      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â FEATURES Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="features" id="features">
        <div className="features-header">
          <span className="section-label reveal">Why Earth Moves</span>
          <h2 className="reveal reveal-delay-1">Reconnect with the rhythm of nature</h2>
        </div>
        <div className="features-grid">
          <Feature icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>} title="Get Grounded" text='Earth Moves is "a priori" Ã¢â‚¬â€ a foundational truth. The Earth moves around the Sun. That is why we have time. Know where you are on the planet.' />
          <Feature icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3a6 6 0 016 6c0 5-6 9-6 9s-6-4-6-9a6 6 0 016-6z" /><circle cx="12" cy="9" r="2" /></svg>} title="Align with Nature" text="Nature follows the Earth's seasons around the Sun. No biological process takes exactly one second. Events take a moment, a day, a season." delay={1} />
          <Feature icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>} title="Understand Near Space" text="When you have a model of the Moon, Earth, and Sun on your wrist, you gain a correct model of what is happening around you in the cosmos." delay={2} />
          <Feature icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 6v6l4 2" /></svg>} title="Reduce Stress" text="The industrial clock is meant to control. With Earth Moves, perhaps you decide to follow the Sun's rhythm Ã¢â‚¬â€ to bed earlier, and rise with the light." />
          <Feature icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>} title="In Rhythm with the Tides" text="Earth is always moving, shaping life's flow. This reflects nature's cycles, the planetary pulse, the endless dance and ebb together with the Moon." delay={1} />
          <Feature icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>} title="Space Weather Tracking" text="Monitor solar activity, geomagnetic storms, and space weather conditions. Track meteor showers and near-Earth objects with live NASA data integration." delay={2} />
        </div>
      </section>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
           HOMEPAGE STORE REPLACEMENT
           
           Replace the current store banner section in app/page.tsx:
           
           DELETE THIS:
           Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
           <section id="store" className="store-section">
             <div className="store-banner reveal" style={{ ... }}>
               <Image src="/images/store-banner.jpg" ... />
             </div>
           </section>
           
           PASTE THIS INSTEAD:
           Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      
            <section id="store" style={{
              padding: "clamp(5rem, 10vw, 8rem) clamp(1.5rem, 4vw, 4rem)",
              position: "relative", zIndex: 1, overflow: "hidden",
            }}>
              {/* Atmospheric glow */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 800, height: 800, borderRadius: "50%", pointerEvents: "none",
                background: "radial-gradient(circle, rgba(201,169,110,.03), transparent 60%)",
              }} />
      
              <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div className="reveal" style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
                  <span className="section-label">The Collection</span>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                    fontWeight: 300, color: "var(--text-primary)",
                    margin: ".5rem 0 .5rem", lineHeight: 1.1,
                  }}>
                    Celestial mechanics,<br />
                    <span style={{ fontStyle: "italic" }}>on your wrist.</span>
                  </h2>
                  <p style={{
                    fontSize: ".88rem", color: "var(--text-secondary)",
                    maxWidth: 480, margin: ".5rem auto 0", lineHeight: 1.7,
                  }}>
                    Automatic mechanical watches displaying the Moon, tides, and
                    Earth&apos;s rotation Ã¢â‚¬â€ as they truly are. Norwegian designed.
                  </p>
                </div>
      
                {/* Two watch cards */}
                <div className="reveal" style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "clamp(1rem, 2vw, 2rem)",
                }}>
                  {/* Copernicus */}
                  <Link href="/watches" style={{
                    textDecoration: "none", color: "inherit",
                    borderRadius: 20, overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "linear-gradient(160deg, rgba(15,22,42,.6), rgba(6,10,19,.95))",
                    transition: "all .5s cubic-bezier(.23, 1, .32, 1)",
                    display: "block",
                  }}>
                    <div style={{ overflow: "hidden", aspectRatio: "16/10" }}>
                      <Image
                        src="/images/copernicus-front.png"
                        alt="Earth Moves Copernicus"
                        width={1920} height={1200}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s" }}
                      />
                    </div>
                    <div style={{ padding: "clamp(1.25rem, 2vw, 2rem)" }}>
                      <h3 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                        fontWeight: 300, lineHeight: 1.1,
                        margin: "0 0 .3rem", color: "var(--text-primary)",
                      }}>Copernicus</h3>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: ".9rem", fontStyle: "italic",
                        color: "var(--text-secondary)", margin: "0 0 1rem",
                      }}>The lunar system on your wrist.</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: ".65rem", color: "var(--text-dim)", letterSpacing: ".04em",
                        }}>$1,200 USD Ã‚Â· 41mm Ã‚Â· Automatic</span>
                        <span style={{
                          fontSize: ".72rem", color: "var(--gold)", letterSpacing: ".04em",
                        }}>View Ã¢â€ â€™</span>
                      </div>
                    </div>
                  </Link>
      
                  {/* Oceanic */}
                  <Link href="/watches" style={{
                    textDecoration: "none", color: "inherit",
                    borderRadius: 20, overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "linear-gradient(160deg, rgba(15,22,42,.6), rgba(6,10,19,.95))",
                    transition: "all .5s cubic-bezier(.23, 1, .32, 1)",
                    display: "block",
                  }}>
                    <div style={{ overflow: "hidden", aspectRatio: "16/10" }}>
                      <Image
                        src="/images/oceanic-front.png"
                        alt="Earth Moves Oceanic"
                        width={1920} height={1200}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s" }}
                      />
                    </div>
                    <div style={{ padding: "clamp(1.25rem, 2vw, 2rem)" }}>
                      <h3 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                        fontWeight: 300, lineHeight: 1.1,
                        margin: "0 0 .3rem", color: "var(--text-primary)",
                      }}>Oceanic</h3>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: ".9rem", fontStyle: "italic",
                        color: "var(--text-secondary)", margin: "0 0 1rem",
                      }}>Synch with nature, ocean and space.</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: ".65rem", color: "var(--text-dim)", letterSpacing: ".04em",
                        }}>$1,200 USD Ã‚Â· 41mm Ã‚Â· Moon &amp; Tide</span>
                        <span style={{
                          fontSize: ".72rem", color: "var(--gold)", letterSpacing: ".04em",
                        }}>View Ã¢â€ â€™</span>
                      </div>
                    </div>
                  </Link>
                </div>
      
                {/* CTA */}
                <div className="reveal" style={{ textAlign: "center", marginTop: "2.5rem" }}>
                  <Link href="/watches" style={{
                    display: "inline-flex", alignItems: "center", gap: ".5rem",
                    fontSize: ".78rem", fontWeight: 600,
                    letterSpacing: ".1em", textTransform: "uppercase",
                    color: "var(--deep)", textDecoration: "none",
                    padding: ".75rem 2.5rem", borderRadius: 8,
                    background: "linear-gradient(135deg, var(--gold), #d4b86a)",
                    transition: "all .3s",
                  }}>
                    Explore The Collection
                  </Link>
                  <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: ".6rem", color: "var(--text-dim)",
                    marginTop: "1rem", letterSpacing: ".06em",
                  }}>
                    PRE-ORDER NOW Ã‚Â· FREE WORLDWIDE SHIPPING
                  </p>
                </div>
              </div>
      
              <style>{`
                #store a[href="/watches"]:hover {
                  border-color: rgba(201,169,110,.2) !important;
                  transform: translateY(-3px);
                  box-shadow: 0 16px 48px rgba(0,0,0,.35);
                }
                #store a[href="/watches"]:hover img {
                  transform: scale(1.03);
                }
                @media (max-width: 768px) {
                  #store .reveal > div[style*="grid-template-columns"] {
                    grid-template-columns: 1fr !important;
                  }
                }
              `}</style>
            </section>
      

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TED TALK Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="tedtalk" id="talk">
        <a href="https://www.youtube.com/watch?v=5YKttXvoBZk" target="_blank" rel="noopener noreferrer" className="tedtalk-visual reveal">
          <Image src="/images/tedx-talk.webp" alt="Brage Johansen TEDx Talk Ã¢â‚¬â€ A Natural Concept of Time" width={800} height={450} style={{ width: "100%", height: "auto", display: "block" }} />
          <div className="tedtalk-play"><div className="play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19" /></svg></div></div>
        </a>
        <div className="tedtalk-text reveal reveal-delay-1">
          <span className="section-label">TEDx Fredrikstad</span>
          <h2>A Natural Concept&nbsp;of&nbsp;Time</h2>
          <p>In this TEDx talk, Brage W. Johansen presents his philosophy on how our perception of time has become disconnected from nature. He introduces Earth Moves as a bridge between human constructs and cosmic cycles Ã¢â‚¬â€ reconnecting us to time as it was meant to be experienced.</p>
          <a href="https://www.youtube.com/watch?v=5YKttXvoBZk" target="_blank" rel="noopener noreferrer" className="btn-watch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19" /></svg> Watch the Talk
          </a>
        </div>
      </section>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â NEWSLETTER Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="reveal" style={{
        padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)",
        maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1,
      }}>
        <span className="section-label">The Monthly Ephemeris</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300, color: "var(--text-primary)", margin: ".5rem 0 .75rem" }}>
          One briefing per month, timed to the sky
        </h2>
        <p style={{ fontSize: ".88rem", color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 auto 1.5rem", maxWidth: 480 }}>
          Upcoming celestial events, what the instruments will show, and one deeper read. Twelve emails a year. No spam.
        </p>
        <NewsletterForm />
      </section>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â FOOTER Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <footer className="em-footer">
        <Link href="/" className="f-brand"><Image src="/em-logo-white.png" alt="Earth Moves" width={480} height={96} style={{ height: "auto", width: 120, opacity: 0.8 }} /></Link>
        <div className="f-links">
          <Link href="/watch">Watch</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/ephemeris">Ephemeris</Link>
          <a href="https://earthmoves.space/store">Store</a>
          <a href="https://www.youtube.com/watch?v=5YKttXvoBZk" target="_blank" rel="noopener noreferrer">TEDx Talk</a>
        </div>
        <span className="f-copy">Ã‚Â© 2026 Earth Moves AS</span>
      </footer>
    </>
  );
}


/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   THE EPHEMERIS Ã¢â‚¬â€ "The Bento" (dashboard grid, varied card sizes)
   Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */

function VariantG({ arts }: { arts: HomeArticle[] }) {
  const fmtLong = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const fmtShort = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <section id="ephemeris" style={{
      padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 4rem)",
      maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1,
    }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 5vw, 3.5rem)" }}>
        <span className="section-label">The Ephemeris</span>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
          fontWeight: 300, color: "var(--text-primary)", margin: ".5rem 0 .6rem", lineHeight: 1.15,
        }}>
          Briefings from the Cosmos
        </h2>
        <p style={{ fontSize: ".85rem", color: "var(--text-dim)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6, letterSpacing: ".02em" }}>
          Where precision science meets philosophical wonder
        </p>
      </div>

      {arts.length >= 5 ? (
        <div className="reveal eph-g-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoRows: "minmax(120px, auto)", gap: "clamp(.75rem, 1.5vw, 1.25rem)",
        }}>
          {/* Featured Ã¢â‚¬â€ spans 7 cols, 2 rows */}
          <Link href={`/ephemeris/${arts[0].slug}`} className="eph-g-card eph-g-feat" style={{
            gridColumn: "1 / 8", gridRow: "1 / 3",
            textDecoration: "none", color: "inherit", borderRadius: 20, overflow: "hidden",
            border: "1px solid var(--border)",
            background: "linear-gradient(145deg, rgba(15,22,42,.7), rgba(6,10,19,.95))",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            position: "relative", transition: "all .4s", minHeight: 360,
          }}>
            {arts[0].image && (
              <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: .3 }}>
                <img src={arts[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,10,19,.98) 20%, rgba(6,10,19,.4) 70%, transparent)" }} />
              </div>
            )}
            <div style={{ position: "relative", zIndex: 1, padding: "2rem 2.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".75rem" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: arts[0].columnColor, boxShadow: `0 0 8px ${arts[0].columnColor}50` }} />
                <span style={{ fontSize: ".55rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: arts[0].columnColor }}>{arts[0].column}</span>
                <span style={{ fontSize: ".55rem", color: "var(--text-dim)", fontFamily: "'DM Mono', monospace", marginLeft: "auto" }}>Featured</span>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", fontWeight: 300, lineHeight: 1.15, margin: "0 0 .75rem", color: "var(--text-primary)" }}>
                {arts[0].title}
              </h3>
              <p style={{ fontSize: ".88rem", color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 1rem", maxWidth: 500 }}>
                {arts[0].description}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: ".65rem", color: "var(--text-dim)" }}>
                  {fmtLong(arts[0].date)} Ã‚Â· {arts[0].readingTime} min
                </span>
                <span style={{ fontSize: ".72rem", color: "var(--gold)", letterSpacing: ".04em" }}>Read Ã¢â€ â€™</span>
              </div>
            </div>
          </Link>

          {/* Top-right */}
          <Link href={`/ephemeris/${arts[1].slug}`} className="eph-g-card" style={{
            gridColumn: "8 / 13", gridRow: "1 / 2",
            textDecoration: "none", color: "inherit", borderRadius: 16, overflow: "hidden",
            border: "1px solid var(--border)", padding: "1.5rem",
            background: "linear-gradient(160deg, rgba(15,22,42,.6), rgba(6,10,19,.9))",
            display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "all .4s",
          }}>
            <div>
              <span style={{ fontSize: ".55rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: arts[1].columnColor }}>{arts[1].column}</span>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 400, lineHeight: 1.25, margin: ".4rem 0 .5rem", color: "var(--text-primary)" }}>{arts[1].title}</h4>
              <p style={{ fontSize: ".78rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{arts[1].description}</p>
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: ".6rem", color: "var(--text-dim)", marginTop: ".75rem" }}>{arts[1].readingTime} min read</span>
          </Link>

          {/* Bottom-right */}
          <Link href={`/ephemeris/${arts[2].slug}`} className="eph-g-card" style={{
            gridColumn: "8 / 13", gridRow: "2 / 3",
            textDecoration: "none", color: "inherit", borderRadius: 16, overflow: "hidden",
            border: "1px solid var(--border)", padding: "1.5rem",
            background: "linear-gradient(160deg, rgba(15,22,42,.6), rgba(6,10,19,.9))",
            display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "all .4s",
          }}>
            <div>
              <span style={{ fontSize: ".55rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: arts[2].columnColor }}>{arts[2].column}</span>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 400, lineHeight: 1.25, margin: ".4rem 0 .5rem", color: "var(--text-primary)" }}>{arts[2].title}</h4>
              <p style={{ fontSize: ".78rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{arts[2].description}</p>
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: ".6rem", color: "var(--text-dim)", marginTop: ".75rem" }}>{arts[2].readingTime} min read</span>
          </Link>

          {/* Bottom row Ã¢â‚¬â€ two equal cards */}
          {arts.slice(3, 5).map((a) => (
            <Link key={a.slug} href={`/ephemeris/${a.slug}`} className="eph-g-card eph-g-bottom" style={{
              gridColumn: "span 6",
              textDecoration: "none", color: "inherit", borderRadius: 16,
              border: "1px solid var(--border)", padding: "1.5rem 1.75rem",
              background: "linear-gradient(160deg, rgba(15,22,42,.5), rgba(6,10,19,.85))",
              display: "flex", flexDirection: "column", transition: "all .4s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".5rem" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: a.columnColor }} />
                <span style={{ fontSize: ".55rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: a.columnColor }}>{a.column}</span>
              </div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 400, lineHeight: 1.25, margin: "0 0 .5rem", color: "var(--text-primary)" }}>{a.title}</h4>
              <p style={{ fontSize: ".82rem", color: "var(--text-secondary)", lineHeight: 1.65, margin: "0 0 auto", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{a.description}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: ".75rem" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: ".6rem", color: "var(--text-dim)" }}>{fmtShort(a.date)} Ã‚Â· {a.readingTime} min</span>
                <span style={{ fontSize: ".65rem", color: "var(--gold)", letterSpacing: ".04em" }}>Read Ã¢â€ â€™</span>
              </div>
            </Link>
          ))}
        </div>
      ) : <EphemerisFallback />}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link href="/ephemeris" className="reveal eph-g-cta" style={{
          fontSize: ".75rem", letterSpacing: ".12em", textTransform: "uppercase",
          color: "var(--gold)", textDecoration: "none",
          padding: ".65rem 2rem", border: "1px solid rgba(201,169,110,.25)", borderRadius: 10,
          display: "inline-block", transition: "all .3s",
        }}>
          Explore All Briefings
        </Link>
      </div>

      <style>{`
        .eph-g-card:hover { border-color: rgba(201,169,110,.25) !important; transform: translateY(-3px); box-shadow: 0 12px 48px rgba(0,0,0,.4); }
        .eph-g-cta:hover { background: rgba(201,169,110,.08); border-color: rgba(201,169,110,.4) !important; }
        @media (max-width: 768px) {
          .eph-g-grid { grid-template-columns: 1fr !important; grid-auto-rows: auto !important; }
          .eph-g-grid > * { grid-column: 1 / -1 !important; grid-row: auto !important; }
          .eph-g-feat { min-height: 280px !important; }
        }
      `}</style>
    </section>
  );
}


/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   SHARED COMPONENTS
   Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */

function EphemerisFallback() {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <p style={{ fontSize: ".92rem", color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 1.5rem" }}>
        Orbital insights, space weather dispatches, and essays on reconnecting with the rhythm of the cosmos.
      </p>
      <Link href="/ephemeris" className="btn-instrument">
        Read The Ephemeris <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </Link>
    </div>
  );
}

function Feature({ icon, title, text, delay }: { icon: React.ReactNode; title: string; text: string; delay?: number }) {
  const delayCls = delay ? ` reveal-delay-${delay}` : "";
  return (
    <div className={`feature reveal${delayCls}`}>
      <div className="feature-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setStatus(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch { setStatus("error"); }
  };
  if (status === "done") return <p style={{ color: "#6BCB77", fontSize: ".88rem" }}>Welcome aboard. First briefing arrives before the next major event.</p>;
  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: ".5rem", maxWidth: 400, margin: "0 auto" }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required style={{ flex: 1, padding: ".7rem 1rem", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(15,22,42,.8)", color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif", fontSize: ".88rem", outline: "none" }} />
        <button type="submit" disabled={status === "sending"} style={{ padding: ".7rem 1.5rem", borderRadius: 8, border: "1px solid rgba(201,169,110,.4)", background: "rgba(201,169,110,.15)", color: "var(--gold-light)", fontFamily: "'DM Sans', sans-serif", fontSize: ".82rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
          {status === "sending" ? "Ã¢â‚¬Â¦" : "Subscribe"}
        </button>
      </form>
      {status === "error" && <p style={{ color: "#E06060", fontSize: ".78rem", marginTop: ".5rem" }}>Something went wrong. Try again.</p>}
    </>
  );
}
