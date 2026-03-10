// ═══════════════════════════════════════════════════════════════════════
// /app/api/subscribe/route.ts — Email subscription endpoint
// Wire this to your email service: Buttondown, Resend, ConvertKit, etc.
// ═══════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // ── OPTION 1: Buttondown ($9/mo, clean, API-first) ──
    // const res = await fetch("https://api.buttondown.com/v1/subscribers", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
    //   },
    //   body: JSON.stringify({ email, tags: ["ephemeris"] }),
    // });
    // if (!res.ok) throw new Error("Buttondown error");

    // ── OPTION 2: Resend (free tier, built for devs) ──
    // const res = await fetch("https://api.resend.com/audiences/{audience_id}/contacts", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    //   },
    //   body: JSON.stringify({ email }),
    // });

    // ── OPTION 3: Log to file (development only) ──
    const fs = await import("fs");
    const path = await import("path");
    const logPath = path.join(process.cwd(), "subscribers.log");
    fs.appendFileSync(logPath, `${new Date().toISOString()} ${email}\n`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
