import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="em-footer">
      <Link href="/" className="f-brand">
        <Image
          src="/em-logo-white.png"
          alt="Earth Moves"
          width={120}
          height={24}
          style={{ height: "auto", width: 120, opacity: 0.8 }}
        />
      </Link>
      <div className="f-links">
        <Link href="/watch">Watch</Link>
        <Link href="/calendar">Calendar</Link>
        <Link href="/ephemeris">Ephemeris</Link>
        <a href="https://earthmoves.space/store">Store</a>
        <a
          href="https://www.youtube.com/watch?v=5YKttXvoBZk"
          target="_blank"
          rel="noopener noreferrer"
        >
          TEDx Talk
        </a>
      </div>
      <span className="f-copy">Ã‚Â© 2026 Earth Moves AS</span>
    </footer>
  );
}
