"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Pages that aren't the homepage should always show "scrolled" style
  const isHome = pathname === "/";
  const showScrolled = !isHome || scrolled;

  useEffect(() => {
    if (!isHome) return; // Only track scroll on homepage
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeMobile = () => setMobileOpen(false);

  // Prefix hash links with / when not on homepage
  const href = (hash: string) => (isHome ? hash : `/${hash}`);

  return (
    <>
      <nav className={`em-nav${showScrolled ? " scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          <Image
            src="/em-logo-white.png"
            alt="Earth Moves"
            width={160}
            height={32}
            style={{ height: "auto", width: "clamp(120px, 12vw, 160px)" }}
            priority
          />
        </Link>
        <div className="nav-links">
          <Link href={href("#instruments")}>Instruments</Link>
          <Link href={href("#philosophy")}>Philosophy</Link>
          <Link
            href="/ephemeris"
            className={pathname.startsWith("/ephemeris") ? "active" : ""}
          >
            Ephemeris
          </Link>
          <Link href={href("#store")}>Store</Link>
          <Link href={href("#talk")}>TEDx Talk</Link>
        </div>
        <button
          className="hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <Link href={href("#instruments")} onClick={closeMobile}>Instruments</Link>
        <Link href={href("#philosophy")} onClick={closeMobile}>Philosophy</Link>
        <Link href="/ephemeris" onClick={closeMobile}>Ephemeris</Link>
        <Link href={href("#store")} onClick={closeMobile}>Store</Link>
        <Link href={href("#talk")} onClick={closeMobile}>TEDx Talk</Link>
      </div>
    </>
  );
}
