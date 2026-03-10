import { NextResponse } from 'next/server';

const KEY = "T7SU8L-HF23HP-Y9W6L9-5O2S";

export async function GET() {
  try {
    const r = await fetch(`https://api.n2yo.com/rest/v1/satellite/positions/48274/0/0/0/1?apiKey=${KEY}`, { cache: 'no-store' });
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: true }, { status: 500 });
  }
}