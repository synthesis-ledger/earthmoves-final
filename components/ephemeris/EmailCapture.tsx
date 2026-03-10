"use client";

import { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("sending");

    try {
      // Replace with your email service endpoint:
      // Buttondown: POST https://api.buttondown.com/v1/subscribers
      // Or any endpoint that accepts { email }
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="eph-email-capture">
      <div className="eph-email-inner">
        <h3 className="eph-email-heading">The Monthly Ephemeris</h3>
        <p className="eph-email-text">
          One briefing per month, timed to the sky. Upcoming celestial events,
          what the instruments will show, and one deeper read.
        </p>
        {status === "done" ? (
          <p className="eph-email-success">Welcome aboard. First briefing arrives before the next major event.</p>
        ) : (
          <form onSubmit={handleSubmit} className="eph-email-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="eph-email-input"
              required
              aria-label="Email address"
            />
            <button
              type="submit"
              className="eph-email-btn"
              disabled={status === "sending"}
            >
              {status === "sending" ? "…" : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="eph-email-error">Something went wrong. Try again.</p>
        )}
        <p className="eph-email-note">12 emails a year. No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}
