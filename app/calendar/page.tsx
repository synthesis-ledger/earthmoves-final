"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════
// EARTH MOVES — CALENDAR v6.2  "The Instrument"
// "Time is not numbers on a screen. It is a planet moving through the void."
//
// v6.2 — ZODIAC CONSTELLATION RING:
//   ✦ 12 zodiac PNG images at correct ecliptic positions beyond Mars orbit
//   ✦ Active constellation brightens when opposite the Sun
//   ✦ "Towards Milky Way Core" arrow near Sagittarius
//   ✦ Orbit scaled to fit full zodiac ring (aR / 2.1)
//   ✦ Zodiac enabled by default
//   (all v6.1 features preserved)
// ═══════════════════════════════════════════════════════════════════════

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const TAU = Math.PI * 2;

let _globalKp = 0;
let _usnoCache: { year: number; data: Record<string, { month: number; day: number }[]> } | null = null;

let _issLat = 51.6; let _issLon = 0.0;
let _solarWindSpeed = 400; let _solarWindBz = 0;
let _xrayFlux = 0; let _lastFlareFlashMs = 0;
let _meteorStreaks: { x: number; y: number; vx: number; vy: number; born: number; life: number; color: string }[] = [];
let _dustParticles: { angle: number; r: number; speed: number; a: number }[] = [];
let _dustInit = false;

function _smoothNoise(x: number): number {
  const i = Math.floor(x), f = x - i;
  const a = Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
  const b = Math.abs(Math.sin((i + 1) * 127.1 + 311.7) * 43758.5453) % 1;
  const t = f * f * (3 - 2 * f);
  return a + (b - a) * t;
}

// ─── ISO WEEK NUMBER ──────────────────────────────────────────────────
function getISOWeek(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// ─── REALISTIC ORBITAL DATA (AU & Years) ─────────────────────────────
const ECCENTRICITY = 0.0167;
const SEMI_MAJOR = 1.0;
const PLANET_DATA = {
  mercury: { a: 0.39,  p: 0.24,  color: "#A5A5A5" },
  venus:   { a: 0.72,  p: 0.62,  color: "#E3BB76" },
  earth:   { a: 1.00,  p: 1.00,  color: "#60A5FA" },
  mars:    { a: 1.52,  p: 1.88,  color: "#EF4444" },
};

function jd(d: Date) { return d.getTime() / 86400000 + 2440587.5; }
function jc(j: number) { return (j - 2451545.0) / 36525.0; }

function solar(date: Date) {
  const J = jd(date), T = jc(J);
  const L0 = (280.46646 + T * (36000.76983 + T * 3.032e-4)) % 360;
  const M = (357.52911 + T * (35999.05029 - T * 1.537e-4)) % 360;
  const Mr = M * DEG;
  const C = (1.914602 - T * (0.004817 + T * 1.4e-5)) * Math.sin(Mr)
    + (0.019993 - T * 1.01e-4) * Math.sin(2 * Mr) + 2.89e-4 * Math.sin(3 * Mr);
  const sLon = (L0 + C) % 360;
  const obl = 23.439 - 4e-7 * (J - 2451545.0);
  const dec = Math.asin(Math.sin(obl * DEG) * Math.sin(sLon * DEG)) * RAD;
  const RA = Math.atan2(Math.cos(obl * DEG) * Math.sin(sLon * DEG), Math.cos(sLon * DEG)) * RAD;
  const GMST = (280.46061837 + 360.98564736629 * (J - 2451545.0)) % 360;
  const subLon = ((RA - GMST) % 360 + 540) % 360 - 180;
  const orbitalAngle = ((sLon % 360) + 360) % 360;
  return { dec, subLon, GMST, orbitalAngle };
}

function lunar(date: Date) {
  const J = jd(date), T = jc(J);
  const Lp = (218.3164477 + 481267.88123421 * T) % 360;
  const D = (297.8501921 + 445267.1114034 * T) % 360;
  const M = (357.5291092 + 35999.0502909 * T) % 360;
  const Mp = (134.9633964 + 477198.8675055 * T) % 360;
  const F = (93.272095 + 483202.0175233 * T) % 360;
  const lc = 6.289 * Math.sin(Mp * DEG) + 1.274 * Math.sin((2 * D - Mp) * DEG)
    + 0.658 * Math.sin(2 * D * DEG) + 0.214 * Math.sin(2 * Mp * DEG) - 0.186 * Math.sin(M * DEG);
  const mLon = ((Lp + lc) % 360 + 360) % 360;
  const mLat = 5.128 * Math.sin(F * DEG) + 0.281 * Math.sin((Mp + F) * DEG);
  const s = solar(date);
  const subLon = ((mLon - s.GMST) % 360 + 540) % 360 - 180;
  const phase = (((D % 360) + 360) % 360) / 360;
  const illum = (1 - Math.cos(D % 360 * DEG)) / 2;
  return { lon: subLon, lat: mLat, phase, illum };
}

function meanAnomaly(date: Date) {
  const dayOfY = (Number(date) - Number(new Date(date.getFullYear(), 0, 1))) / 86400000 + 1;
  return ((dayOfY - 3) / 365.25) * TAU;
}

function eccentricAnomaly(M: number, e: number, iters = 8) {
  let E = M;
  for (let i = 0; i < iters; i++) E = M + e * Math.sin(E);
  return E;
}

function trueAnomaly(Ev: number, e: number) {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(Ev / 2), Math.sqrt(1 - e) * Math.cos(Ev / 2));
}

function heliocentricR(nu: number, a: number, e: number) {
  return a * (1 - e * e) / (1 + e * Math.cos(nu));
}

function orbitSpeed(r_AU: number) {
  const GM = 1.327e11, r = r_AU * 1.496e8, a = SEMI_MAJOR * 1.496e8;
  return Math.sqrt(GM * (2 / r - 1 / a));
}

function getDayLength(lat: number, date: Date) {
  const doy = (Number(date) - Number(new Date(date.getFullYear(), 0, 0))) / 86400000;
  const dec = 23.45 * Math.sin(DEG * (360 / 365) * (doy - 80));
  const cosH = -Math.tan(lat * DEG) * Math.tan(dec * DEG);
  if (cosH <= -1) return 24;
  if (cosH >= 1) return 0;
  return (2 / 15) * Math.acos(cosH) * RAD;
}

function weekNum(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const ys = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((Number(d) - Number(ys)) / 86400000) + 1) / 7);
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ─── KEPLERIAN ELLIPSE POINT ─────────────────────────────────────────
function orbitalPoint(date: Date, cx: number, cy: number, aR: number, bR: number, focusOffset: number) {
  const M = meanAnomaly(date);
  const Ev = eccentricAnomaly(M, ECCENTRICITY);
  const nu = trueAnomaly(Ev, ECCENTRICITY);
  const r = heliocentricR(nu, SEMI_MAJOR, ECCENTRICITY);
  const angle = -nu - Math.PI / 2;
  const x = cx - focusOffset * Math.cos(0) + (r / SEMI_MAJOR) * aR * Math.cos(angle);
  const y = cy + (r / SEMI_MAJOR) * bR * Math.sin(angle);
  return { x, y, r, nu, speed: orbitSpeed(r) };
}

function precomputeOrbit(year: number, cx: number, cy: number, aR: number, bR: number, focusOffset: number) {
  const pts: { x: number; y: number; r: number; nu: number; speed: number }[] = [];
  const baseDate = new Date(year, 0, 1);
  for (let i = 0; i < 366; i++) {
    const d = new Date(baseDate);
    d.setDate(i + 1);
    pts.push(orbitalPoint(d, cx, cy, aR, bR, focusOffset));
  }
  return pts;
}

// ─── 8 FYRTÅRN — Lighthouses ─────────────────────────────────────────
const FYRTARN = [
  { name: "Perihelion", date: "01-03", color: "#FFD060", glyph: "◉" },
  { name: "Imbolc",     date: "02-02", color: "#A0C8FF", glyph: "❄" },
  { name: "Equinox",    date: "03-20", color: "#60DDA0", glyph: "⚖" },
  { name: "Beltane",    date: "05-01", color: "#FF9060", glyph: "✦" },
  { name: "Apogalaxy",  date: "06-17", color: "#B464FF", glyph: "◎" },
  { name: "Solstice",   date: "06-21", color: "#FFE040", glyph: "☀" },
  { name: "Lammas",     date: "08-01", color: "#FFA040", glyph: "✦" },
  { name: "Equinox",    date: "09-22", color: "#60DDA0", glyph: "⚖" },
  { name: "Perigalaxy", date: "12-17", color: "#B464FF", glyph: "◎" },
  { name: "Solstice",   date: "12-21", color: "#8080FF", glyph: "☽" },
];

const METEOR_ARCS = [
  { name: "Perseids",  color: "#FF8040", angle: 140, width: 18, peak: "08-12" },
  { name: "Geminids",  color: "#9060FF", angle: 258, width: 22, peak: "12-14" },
  { name: "Lyrids",    color: "#40DDFF", angle: 32,  width: 14, peak: "04-22" },
  { name: "Orionids",  color: "#FFB040", angle: 208, width: 16, peak: "10-21" },
];

// ─── METEOR SHOWER DUST BANDS (orbital ring) ──────────────────────────
const METEOR_SHOWER_BANDS = [
  { name: "Lyrids",        peakDoy: 112, halfWidth: 2 }, // Apr 22
  { name: "Eta Aquariids", peakDoy: 126, halfWidth: 2 }, // May 6
  { name: "Perseids",      peakDoy: 224, halfWidth: 2 }, // Aug 12
  { name: "Orionids",      peakDoy: 294, halfWidth: 2 }, // Oct 21
  { name: "Leonids",       peakDoy: 321, halfWidth: 2 }, // Nov 17
  { name: "Geminids",      peakDoy: 348, halfWidth: 2 }, // Dec 14
];

const ZODIAC_BLUEPRINT = [
  { name: "Aries",       ra_center: 2.5,
    stars: [[2.12,23.46],[1.91,20.81],[1.89,19.29]],
    lines: [[0,1],[1,2]] },
  { name: "Taurus",      ra_center: 4.7,
    stars: [[4.60,16.51],[5.44,28.61],[4.48,19.18],[3.79,24.11],[5.63,21.14]],
    lines: [[0,1],[0,2],[2,3],[0,4]] },
  { name: "Gemini",      ra_center: 7.5,
    stars: [[7.58,31.89],[7.76,28.03],[6.63,16.40],[7.34,22.01],[7.07,20.57]],
    lines: [[0,1],[1,3],[3,4],[4,2]] },
  { name: "Cancer",      ra_center: 8.6,
    stars: [[8.97,11.86],[8.74,18.15],[8.72,21.47],[8.28,9.19]],
    lines: [[3,0],[0,1],[1,2]] },
  { name: "Leo",         ra_center: 10.8,
    stars: [[10.14,11.97],[11.82,14.57],[10.33,19.84],[11.24,20.52],[9.76,23.77],[10.28,23.41]],
    lines: [[0,2],[2,5],[5,4],[0,3],[3,1],[2,3]] },
  { name: "Virgo",       ra_center: 13.4,
    stars: [[13.42,-11.16],[12.69,-1.45],[11.84,1.76],[13.00,10.96],[12.93,3.40]],
    lines: [[0,1],[1,4],[4,2],[1,3]] },
  { name: "Libra",       ra_center: 15.2,
    stars: [[14.85,-16.04],[15.28,-9.38],[15.59,-14.79]],
    lines: [[0,1],[1,2],[2,0]] },
  { name: "Scorpio",     ra_center: 16.9,
    stars: [[16.01,-22.62],[16.49,-26.43],[16.84,-34.29],[17.42,-43.00],[17.79,-40.13],[16.09,-19.81]],
    lines: [[5,0],[0,1],[1,2],[2,4],[4,3]] },
  { name: "Sagittarius", ra_center: 19.1,
    stars: [[18.10,-30.42],[18.35,-29.83],[18.47,-25.42],[18.35,-34.38],[18.76,-36.76],[19.04,-29.88]],
    lines: [[0,1],[1,2],[1,5],[5,3],[3,4]] },
  { name: "Capricorn",   ra_center: 21.1,
    stars: [[20.30,-12.51],[20.35,-14.78],[21.67,-16.66],[21.79,-16.12]],
    lines: [[0,1],[1,2],[2,3],[3,0]] },
  { name: "Aquarius",    ra_center: 22.3,
    stars: [[22.09,-0.32],[21.53,-5.57],[22.37,-1.39],[22.91,-15.82],[20.79,-9.50]],
    lines: [[4,1],[1,0],[0,2],[2,3]] },
  { name: "Pisces",      ra_center: 1.0,
    stars: [[2.03,2.76],[1.52,15.35],[23.99,6.86],[23.06,3.82],[23.28,3.28]],
    lines: [[0,1],[3,2],[2,0],[4,3]] },
];

// ─── ZODIAC IMAGE POSITIONS (day-of-year midpoints for each sign) ────
const ZODIAC_SIGNS = [
  { name: "Capricorn",   file: "capricorn",   midDay: 5 },
  { name: "Aquarius",    file: "aquarius",    midDay: 35 },
  { name: "Pisces",      file: "pisces",      midDay: 64 },
  { name: "Aries",       file: "aries",       midDay: 95 },
  { name: "Taurus",      file: "taurus",      midDay: 125 },
  { name: "Gemini",      file: "gemini",      midDay: 156 },
  { name: "Cancer",      file: "cancer",      midDay: 188 },
  { name: "Leo",         file: "leo",         midDay: 219 },
  { name: "Virgo",       file: "virgo",       midDay: 250 },
  { name: "Libra",       file: "libra",       midDay: 281 },
  { name: "Scorpio",     file: "scorpio",     midDay: 311 },
  { name: "Sagittarius", file: "sagittarius", midDay: 341 },
];
interface Milestone {
  id: string;
  shortName: string;    // max 12 chars
  description: string;  // max 100 chars
  date: string;         // "DD.MM" format
  repetition: "Annual" | "One-Time";
}

// ─── SETTINGS ────────────────────────────────────────────────────────
interface Settings {
  timeFormat: "24h" | "12h";
  hemisphere: "auto" | "north" | "south";
  globeQuality: "nasa" | "fallback";
  labelDensity: "minimal" | "balanced" | "full";
  momentFrequency: "frequent" | "balanced" | "off";
  showLunarWave: boolean;
  showFyrtarn: boolean;
  showSolarBreath: boolean;
  showMeteorArcs: boolean;
  showZodiac: boolean;
  latitude: number;
  longitude: number;
  panicAlwaysVisible: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  timeFormat: "24h",
  hemisphere: "auto",
  globeQuality: "nasa",
  labelDensity: "minimal",
  momentFrequency: "balanced",
  showLunarWave: true,
  showFyrtarn: true,
  showSolarBreath: true,
  showMeteorArcs: false,
  showZodiac: true,
  latitude: 59.0,
  longitude: 5.7,
  panicAlwaysVisible: false,
};

// ─── MOMENTS CONTENT ─────────────────────────────────────────────────
const MOMENT_POOL = [
  (km: string) => `Since you opened this, Earth has carried you ${km} km forward.`,
  () => "Mid-day is your peak daylight window. Schedule your most important work in the light.",
  (km: string) => `Earth has moved ${km} km since you started. Every meeting is also a journey.`,
  () => "Perihelion week: Earth is moving at its fastest. January is a high-velocity month.",
  () => "The Perseids peak in mid-August. Earth crosses the debris trail every year, same week.",
  () => "At 107,000 km/h, your next hour-long meeting will carry you 107,000 km through space.",
  () => "Shortest day in the northern hemisphere: December 21. Plan morning syncs around the light.",
  () => "Earth is now closer to the Sun than in July — about 5 million km closer.",
  () => "Geminids meteor shower peaks December 14. One of the strongest of the year.",
  (km: string) => `${km} km and counting. The planet doesn't wait — neither should your priorities.`,
  () => "Solstice week: day length reaches its annual extreme. A natural inflection point.",
  () => "Equinox: exactly 12 hours of daylight everywhere on Earth today.",
];

function getMoment(kmTraveled: number, idx: number): string {
  const km = kmTraveled >= 1e6
    ? `${(kmTraveled / 1e6).toFixed(2)}M`
    : kmTraveled >= 1000
    ? `${(kmTraveled / 1000).toFixed(1)}k`
    : Math.round(kmTraveled).toLocaleString();
  const fn = MOMENT_POOL[idx % MOMENT_POOL.length];
  return fn(km);
}

// ═══════════════════════════════════════════════════════════════════
//  MINI WATCH — Ported from Earth Moves v3.5 watch
//  Uses local /day.jpg + /night.jpg textures (same /public folder)
//  Stripped: no aurora, tides, satellites, empathy cities, meteors
//  Kept: globe, terminator, hour markers, clock hand, digital time,
//        moon phase icon, pole indicator
// ═══════════════════════════════════════════════════════════════════

const MINI_TEX_W = 1024;
const MINI_TEX_H = 512;

// Spatial hierarchy (adapted for mini watch)
const ZM = {
  EARTH: 0.82, ATMOS: 0.87, BUFFER_IN: 0.89,
  HOUR_RING: 0.88, TICK_OUTER: 0.96, BEZEL: 1.00,
  MOON_TRACK: 0.855, // dedicated thin orbital track for moon
  MOON_ORBIT: 0.855,
  VERNIER_INNER: 0.875, VERNIER_OUTER: 0.965,
};

// Inverse astronaut lens warp (from watch v3.5)
function invertWarp(target: number): number {
  if (target <= 0) return 0;
  if (target >= 1) return 1;
  let d = Math.pow(target, 1.0 / 0.82);
  for (let i = 0; i < 4; i++) {
    const exp = 0.82 + 0.12 * d * d;
    const f = Math.pow(d, exp) - target;
    const lnD = d > 1e-10 ? Math.log(d) : -23;
    const df = Math.pow(d, exp) * (exp / d + 0.24 * d * lnD);
    if (Math.abs(df) < 1e-12) break;
    d = Math.max(0, Math.min(1.3, d - f / df));
  }
  return d;
}

// Pole-aware hour angle (from watch v3.5)
function hourAngleForWatch(h: number, south: boolean): number {
  return south ? h * (Math.PI / 12) : (h - 12) * (Math.PI / 12);
}

// Globe texture cache builder (from watch v3.5, simplified — no clouds)
function buildGlobeCacheMini(
  dayPx: Uint8ClampedArray | null,
  nightPx: Uint8ClampedArray | null,
  texW: number,
  texH: number,
  eR: number,
  sun: { subLon: number },
  utcH: number,
  south: boolean
): HTMLCanvasElement {
  const size = Math.ceil(eR * 2);
  const cache = document.createElement("canvas");
  cache.width = size; cache.height = size;
  const ctx = cache.getContext("2d")!;

  // Ocean base
  const oc = ctx.createRadialGradient(eR, eR, 0, eR, eR, eR);
  oc.addColorStop(0, "#1e5a80");
  oc.addColorStop(.5, "#1e4d70");
  oc.addColorStop(1, "#163050");
  ctx.fillStyle = oc;
  ctx.beginPath(); ctx.arc(eR, eR, eR, 0, TAU); ctx.fill();

  if (!dayPx || !nightPx) return cache;

  const buf = ctx.createImageData(size, size);
  const data = buf.data;

  const d_ = new Date();
  const dayOfYear = (Number(d_) - Number(new Date(d_.getFullYear(), 0, 0))) / 86400000;
  const sDec = 23.45 * Math.sin(DEG * (360 / 365) * (dayOfYear - 80));

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px - eR, dy = -(py - eR);
      const rawDist = Math.sqrt(dx * dx + dy * dy);
      const distRatio = rawDist / eR;
      const warpedRatio = distRatio > 0 ? Math.pow(distRatio, 0.82 + 0.12 * distRatio * distRatio) : 0;
      const dist = warpedRatio * eR;
      if (dist > eR - 1) continue;

      let lat, lon;
      if (south) {
        lat = -(90 - (dist / eR) * 95);
        const ca = Math.atan2(dy, dx);
        lon = ((ca * (12 / Math.PI) - utcH) * 15);
      } else {
        lat = 90 - (dist / eR) * 95;
        const ca = Math.atan2(dy, dx);
        lon = ((ca + Math.PI) * (12 / Math.PI) - utcH) * 15;
      }
      lon = ((lon % 360) + 540) % 360 - 180;

      const u = (lon + 180) / 360;
      const v = (90 - lat) / 180;
      const tx = Math.min(texW - 1, Math.floor(u * texW));
      const ty = Math.min(texH - 1, Math.floor(v * texH));
      const dIdx = (ty * texW + tx) * 4;

      const phi = lat * DEG, delta = sDec * DEG, hAngle = (lon - sun.subLon) * DEG;
      const cosZ = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(hAngle);
      const z = Math.acos(Math.max(-1, Math.min(1, cosZ))) * RAD;

      // Smoothstep terminator blend
      const blendRaw = Math.max(0, Math.min(1, (z - 90) / 18));
      const blend = blendRaw * blendRaw * (3 - 2 * blendRaw);

      const dr = dayPx[dIdx], dg = dayPx[dIdx + 1], db = dayPx[dIdx + 2];
      const nr = nightPx[dIdx], ng = nightPx[dIdx + 1], nb = nightPx[dIdx + 2];

      let r = dr * (1 - blend) + nr * blend;
      let g = dg * (1 - blend) + ng * blend;
      let b = db * (1 - blend) + nb * blend;

      // Warm horizon glow near sunset
      if (z > 88 && z < 96) {
        const wf = 1 - Math.abs(z - 92) / 4;
        r = Math.min(255, r + wf * 22);
        g = Math.min(255, g + wf * 8);
        b = Math.max(0, b - wf * 5);
      }

      // Smooth brightness curve
      const dayBoost = (1 - blend) * 0.35;
      const nightLift = blend * 0.45;
      const boostFactor = 1.0 + dayBoost + nightLift;
      r = Math.min(255, r * boostFactor + (1 - blend) * 22);
      g = Math.min(255, g * boostFactor * (1 - blend * 0.04) + (1 - blend) * 16);
      b = Math.min(255, b * boostFactor * (1 + blend * 0.03) + (1 - blend) * 20);

      const idx = (py * size + px) * 4;
      data[idx] = Math.round(r); data[idx + 1] = Math.round(g);
      data[idx + 2] = Math.round(b); data[idx + 3] = 255;
    }
  }

  ctx.putImageData(buf, 0, 0);
  return cache;
}

// ════════════════════════════════════════════════════════════════════
//  MINI WATCH COMPONENT — Full watch-quality in 220×220
// ════════════════════════════════════════════════════════════════════
function MiniWatch({ now, lat, lon, southPole, hourMode }: {
  now: Date; lat: number; lon: number;
  southPole: boolean; hourMode: "min" | "mid";
}) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const afRef = useRef<number>(0);
  const dayPxRef = useRef<Uint8ClampedArray | null>(null);
  const nightPxRef = useRef<Uint8ClampedArray | null>(null);
  const globeCacheRef = useRef<HTMLCanvasElement | null>(null);
  const globeCacheTimeRef = useRef<number>(0);
  const lastRadiusRef = useRef<number>(0);
  const texReadyRef = useRef<boolean>(false);

  // Load local textures on mount
  useEffect(() => {
    let cancelled = false;
    const loadTex = (url: string): Promise<Uint8ClampedArray> => new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const oc = document.createElement("canvas");
        oc.width = MINI_TEX_W; oc.height = MINI_TEX_H;
        const ctx = oc.getContext("2d")!;
        ctx.drawImage(img, 0, 0, MINI_TEX_W, MINI_TEX_H);
        res(ctx.getImageData(0, 0, MINI_TEX_W, MINI_TEX_H).data);
      };
      img.onerror = rej;
      img.src = url;
    });

    Promise.all([loadTex("/day.jpg"), loadTex("/night.jpg")])
      .then(([day, night]) => {
        if (cancelled) return;
        dayPxRef.current = day;
        nightPxRef.current = night;
        texReadyRef.current = true;
        globeCacheRef.current = null;
        globeCacheTimeRef.current = 0;
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  // Invalidate globe cache when pole changes
  useEffect(() => {
    globeCacheRef.current = null;
    globeCacheTimeRef.current = 0;
  }, [southPole]);

  // Render loop
  const render = useCallback(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const S = 220; // fixed size
    cv.width = S * dpr; cv.height = S * dpr;
    const c = cv.getContext("2d")!;
    c.scale(dpr, dpr);

    const cx = S / 2, cy = S / 2;
    const wR = S * 0.44;
    const eR = wR * ZM.EARTH;
    const bfI = wR * ZM.BUFFER_IN;
    const tO = wR * ZM.TICK_OUTER;
    const bz = wR * ZM.BEZEL;
    const mO = wR * ZM.MOON_ORBIT;

    const utcH = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    const sun = solar(now);
    const mn = lunar(now);
    const sp = southPole;

    c.clearRect(0, 0, S, S);

    // Rebuild globe cache every 30s
    if (texReadyRef.current && Math.abs(eR - lastRadiusRef.current) > 2) {
      globeCacheRef.current = null;
      globeCacheTimeRef.current = 0;
      lastRadiusRef.current = eR;
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (texReadyRef.current &&
        (!globeCacheRef.current || nowSec - globeCacheTimeRef.current >= 30)) {
      globeCacheRef.current = buildGlobeCacheMini(
        dayPxRef.current, nightPxRef.current,
        MINI_TEX_W, MINI_TEX_H, eR, sun, utcH, sp
      );
      globeCacheTimeRef.current = nowSec;
    }

    // ── LAYER 0: Deep space background ──
    c.fillStyle = "#000000";
    c.fillRect(0, 0, S, S);
    const bg = c.createRadialGradient(cx, cy, wR * 0.18, cx, cy, S * 0.6);
    bg.addColorStop(0, "#060810");
    bg.addColorStop(0.5, "#020306");
    bg.addColorStop(1, "#000000");
    c.fillStyle = bg;
    c.fillRect(0, 0, S, S);

    // Subtle stars (fixed for mini)
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 127.1 + 311.7) * 43758.5453 % S + S) % S;
      const sy = ((i * 269.5 + 183.3) * 28741.1927 % S + S) % S;
      const br = 0.08 + ((i * 73.1 + 17.3) * 19283.7 % 1) * 0.35;
      c.fillStyle = `rgba(195,210,240,${br})`;
      c.beginPath(); c.arc(sx, sy, 0.5, 0, TAU); c.fill();
    }

    // ── LAYER 2: Earth globe ──
    c.save();
    const drawR = eR * 1.045;
    c.beginPath(); c.arc(cx, cy, drawR, 0, TAU); c.clip();

    if (globeCacheRef.current) {
      c.drawImage(globeCacheRef.current, cx - eR, cy - eR);

      // Atmospheric Fresnel limb (day-side sapphire halo)
      const sunAngleOnGlobe = sp
        ? -(utcH + sun.subLon / 15) * (Math.PI / 12)
        : Math.PI - (utcH + sun.subLon / 15) * (Math.PI / 12);
      c.save();
      c.globalCompositeOperation = 'screen';
      for (let i = 0; i < 48; i++) {
        const theta = (i / 48) * TAU;
        const sunAlignment = Math.cos(theta - sunAngleOnGlobe);
        if (sunAlignment < -0.1) continue;
        const intensity = Math.max(0, sunAlignment) * 0.09 + 0.025;
        const px = cx + eR * Math.cos(theta);
        const py = cy + eR * Math.sin(theta);
        const fg = c.createRadialGradient(px, py, 0, px, py, eR * 0.06);
        fg.addColorStop(0, `rgba(120,180,255,${intensity})`);
        fg.addColorStop(0.4, `rgba(80,150,240,${intensity * 0.5})`);
        fg.addColorStop(1, 'rgba(60,120,220,0)');
        c.fillStyle = fg;
        c.beginPath(); c.arc(px, py, eR * 0.06, 0, TAU); c.fill();
      }
      c.restore();
    } else {
      // Fallback: solid ocean
      const oc = c.createRadialGradient(cx, cy, 0, cx, cy, eR);
      oc.addColorStop(0, "#1a3a6a");
      oc.addColorStop(1, "#0d2245");
      c.fillStyle = oc;
      c.beginPath(); c.arc(cx, cy, eR, 0, TAU); c.fill();
    }

    // Glass glint
    c.save();
    const gA = Math.PI * (11 / 12);
    const gR = eR * .5;
    const gCx = cx + gR * Math.cos(gA), gCy = cy - gR * Math.sin(gA);
    const gLen = eR * .45;
    const gg = c.createRadialGradient(gCx, gCy, 0, gCx, gCy, gLen * .7);
    gg.addColorStop(0, "rgba(255,255,255,.045)");
    gg.addColorStop(.4, "rgba(255,255,255,.018)");
    gg.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gg;
    c.beginPath(); c.arc(gCx, gCy, gLen * .7, 0, TAU); c.fill();
    c.restore();

    c.restore(); // end Earth clip

    // ── LAYER 7: Atmosphere glow ──
    const ag2 = c.createRadialGradient(cx, cy, eR - 2, cx, cy, eR + 14);
    ag2.addColorStop(0, "rgba(55,125,250,0)");
    ag2.addColorStop(.42, "rgba(55,125,250,.038)");
    ag2.addColorStop(.68, "rgba(45,105,215,.052)");
    ag2.addColorStop(1, "rgba(25,55,140,0)");
    c.fillStyle = ag2;
    c.beginPath(); c.arc(cx, cy, eR + 14, 0, TAU); c.fill();

    // ── LAYER 8: Clock hand ──
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lt = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    const lH = lt.getHours() + lt.getMinutes() / 60 + lt.getSeconds() / 3600;
    const hA = -hourAngleForWatch(lH, sp);

    c.save();
    c.strokeStyle = "rgba(255,255,255,.55)";
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(cx + S * .015 * Math.cos(hA), cy + S * .015 * Math.sin(hA));
    c.lineTo(cx + tO * .98 * Math.cos(hA), cy + tO * .98 * Math.sin(hA));
    c.stroke();
    // Tip glow
    const tipGx = cx + tO * .98 * Math.cos(hA), tipGy = cy + tO * .98 * Math.sin(hA);
    const tipG = c.createRadialGradient(tipGx, tipGy, 0, tipGx, tipGy, S * .006);
    tipG.addColorStop(0, "rgba(255,255,255,.4)");
    tipG.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = tipG; c.beginPath(); c.arc(tipGx, tipGy, S * .006, 0, TAU); c.fill();
    c.restore();

    // Pole indicator removed for clean premium look

    // ── LAYER 9: Vernier precision rings + hour markers ──
    // Multiple concentric hairline rings for chronometer feel
    const vI = wR * ZM.VERNIER_INNER;
    const vO = wR * ZM.VERNIER_OUTER;
    const moonTrackR = wR * ZM.MOON_TRACK;

    // Hairline concentric rings (3 rings, varying opacity)
    [vI, (vI + vO) * 0.5, vO].forEach((r, idx) => {
      c.strokeStyle = `rgba(100,130,175,${idx === 1 ? 0.06 : 0.22})`;
      c.lineWidth = 0.3;
      c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke();
    });

    // Dedicated moon orbital track — very faint ring
    c.strokeStyle = "rgba(180,190,210,0.06)";
    c.lineWidth = 0.4;
    c.beginPath(); c.arc(cx, cy, moonTrackR, 0, TAU); c.stroke();

    // Bezel ring (outermost)
    c.strokeStyle = "rgba(115,145,195,.32)"; c.lineWidth = .6;
    c.beginPath(); c.arc(cx, cy, bz, 0, TAU); c.stroke();

    // Fine graduation tick marks — every 15 minutes
    for (let h = 0; h < 24; h++) {
      for (let q = 0; q < 4; q++) {
        const time = h + q / 4;
        const a = -hourAngleForWatch(time, sp);
        const isHour = q === 0;
        const isCardinal = isHour && (h % 6 === 0);
        const isEvenHour = isHour && (h % 2 === 0);

        // Determine tick length and style
        let tickStart: number, tickEnd: number, tickAlpha: number, tickWidth: number;
        if (isCardinal) {
          tickStart = vI - S * 0.008;
          tickEnd = vO + S * 0.003;
          tickAlpha = 0.5;
          tickWidth = 1.2;
        } else if (isHour) {
          tickStart = vI;
          tickEnd = vO;
          tickAlpha = isEvenHour ? 0.25 : 0.15;
          tickWidth = isEvenHour ? 0.8 : 0.5;
        } else {
          // Quarter-hour ticks — very fine
          tickStart = vI + (vO - vI) * 0.5;
          tickEnd = vO - S * 0.003;
          tickAlpha = 0.07;
          tickWidth = 0.3;
        }

        c.strokeStyle = `rgba(160,180,220,${tickAlpha})`;
        c.lineWidth = tickWidth;
        c.beginPath();
        c.moveTo(cx + tickStart * Math.cos(a), cy + tickStart * Math.sin(a));
        c.lineTo(cx + tickEnd * Math.cos(a), cy + tickEnd * Math.sin(a));
        c.stroke();
      }
    }

    // Hour number labels + icons
    for (let h = 0; h < 24; h++) {
      const a = -hourAngleForWatch(h, sp);
      const maj = h % 6 === 0;
      const even = h % 2 === 0;
      const isIcon = h === 6 || h === 12;
      const isMinLabel = h === 0 || h === 18;
      const showLabel = isIcon ? false : hourMode === "mid" ? even : isMinLabel;

      const nR = tO + S * .024;
      const nx = cx + nR * Math.cos(a), ny = cy + nR * Math.sin(a);

      if (h === 12) {
        // White Sun icon
        const sr = S * .011;
        const sg = c.createRadialGradient(nx, ny, 0, nx, ny, sr * 3);
        sg.addColorStop(0, "rgba(255,255,255,.12)");
        sg.addColorStop(.5, "rgba(255,255,255,.04)");
        sg.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = sg; c.beginPath(); c.arc(nx, ny, sr * 3, 0, TAU); c.fill();
        c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 1.0;
        c.beginPath(); c.arc(nx, ny, sr, 0, TAU); c.stroke();
        c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 0.5;
        for (let r = 0; r < 8; r++) {
          const ra = r * Math.PI / 4;
          c.beginPath();
          c.moveTo(nx + sr * 1.4 * Math.cos(ra), ny + sr * 1.4 * Math.sin(ra));
          c.lineTo(nx + sr * 2.0 * Math.cos(ra), ny + sr * 2.0 * Math.sin(ra));
          c.stroke();
        }
      } else if (h === 6) {
        // Orbital Vector arrow
        const nLen = S * .020;
        const wingSpan = S * .008;
        c.save();
        c.translate(nx, ny);
        c.rotate(a);
        c.strokeStyle = "rgba(255,255,255,.85)";
        c.lineWidth = 1.0;
        c.lineCap = "round"; c.lineJoin = "round";
        c.beginPath();
        c.moveTo(-wingSpan, -nLen * 0.25);
        c.lineTo(nLen * 0.5, 0);
        c.lineTo(-wingSpan, nLen * 0.25);
        c.moveTo(-nLen * 0.4, 0);
        c.lineTo(nLen * 0.5, 0);
        c.stroke();
        c.restore();
      } else if (showLabel) {
        const isMaj = maj;
        c.fillStyle = isMaj ? "rgba(225,238,255,.95)" : "rgba(165,185,215,.52)";
        c.font = `${isMaj ? 300 : 200} ${S * (isMaj ? .030 : .022)}px 'DM Sans',system-ui`;
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(h.toString().padStart(2, "0"), nx, ny);
      }
    }

    // ── Moon fixed lower-left like your image
    const moonR = wR * 0.61;
    const moonAngle = 2.05; // lower-left position
    const mx = cx + moonR * Math.cos(moonAngle);
    const my = cy + moonR * Math.sin(moonAngle);
    const mS = S * 0.022; // smaller moon for precision feel

    // Moon disk (grey base)
    c.save();
    c.beginPath(); c.arc(mx, my, mS, 0, TAU);
    const ms = c.createRadialGradient(mx - mS * .2, my - mS * .2, 0, mx, my, mS);
    ms.addColorStop(0, "#c8ccd8");
    ms.addColorStop(.4, "#a8acba");
    ms.addColorStop(1, "#8a8e9c");
    c.fillStyle = ms; c.fill();

    // Phase shadow overlay
    const ph = mn.phase;
    if (ph < 0.5) {
      const shadowGrad = c.createLinearGradient(mx + mS, my, mx - mS * (1 - ph * 2), my);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0)");
      shadowGrad.addColorStop(.4, `rgba(0,0,8,${(1 - ph * 2) * .45})`);
      shadowGrad.addColorStop(1, "rgba(0,0,8,0.95)");
      c.fillStyle = shadowGrad;
      c.beginPath(); c.arc(mx, my, mS, 0, TAU); c.fill();
    } else {
      const shadowGrad = c.createLinearGradient(mx - mS, my, mx + mS * (ph * 2 - 1), my);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0)");
      shadowGrad.addColorStop(.4, `rgba(0,0,8,${(ph * 2 - 1) * .45})`);
      shadowGrad.addColorStop(1, "rgba(0,0,8,0.95)");
      c.fillStyle = shadowGrad;
      c.beginPath(); c.arc(mx, my, mS, 0, TAU); c.fill();
    }

    // Subtle rim
    c.strokeStyle = "rgba(255,255,255,.22)";
    c.lineWidth = .6;
    c.beginPath(); c.arc(mx, my, mS, 0, TAU); c.stroke();
    c.restore();

    // ── LAYER 12: Digital time + date — CENTERED "Mega Time" ──
    const dH = lt.getHours().toString().padStart(2, "0");
    const dM = lt.getMinutes().toString().padStart(2, "0");

    // Scrim: soft radial backdrop for contrast over any terrain
    const scrim = c.createRadialGradient(cx, cy, 0, cx, cy, S * .18);
    scrim.addColorStop(0, "rgba(0,4,14,.52)");
    scrim.addColorStop(.55, "rgba(0,4,14,.28)");
    scrim.addColorStop(1, "rgba(0,4,14,0)");
    c.fillStyle = scrim; c.beginPath(); c.arc(cx, cy, S * .18, 0, TAU); c.fill();

    // Large centered time + clean date — matches image exactly
    c.fillStyle = "#ffffff";
    c.font = `200 ${S * 0.178}px 'DM Sans',system-ui`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(`${dH}:${dM}`, cx, cy - S * 0.008);

    const ds = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    c.fillStyle = "rgba(230,240,255,0.88)";
    c.font = `300 ${S * 0.029}px 'DM Sans',system-ui`;
    c.fillText(ds, cx, cy + S * 0.075);

    afRef.current = requestAnimationFrame(render);
  }, [now, lat, lon, southPole, hourMode]);

  useEffect(() => {
    afRef.current = requestAnimationFrame(render);
    return () => { if (afRef.current) cancelAnimationFrame(afRef.current); };
  }, [render]);

  return (
    <canvas
      ref={cvRef}
      style={{ width: 220, height: 220, borderRadius: "50%" }}
    />
  );
}


// ════════════════════════════════════════════════════════════════════
//  SETTINGS PANEL (unchanged from v5.5)
// ════════════════════════════════════════════════════════════════════
function SettingsPanel({ settings, onChange, onClose }: {
  settings: Settings; onChange: (s: Settings) => void; onClose: () => void;
}) {
  const [tab, setTab] = useState<"display"|"cycles"|"integrations"|"location"|"advanced">("display");
  const set = (k: keyof Settings, v: unknown) => onChange({ ...settings, [k]: v });
  const tabs = ["display","cycles","integrations","location","advanced"] as const;
  const P: React.CSSProperties = { position: "fixed", top: 0, right: 0, bottom: 0, width: 360, background: "rgba(6,10,22,0.97)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(50,80,140,0.3)", display: "flex", flexDirection: "column", zIndex: 100, fontFamily: "'DM Sans',system-ui", color: "rgba(200,220,255,0.88)", overflowY: "auto" };
  const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(25,40,80,0.4)" };
  const labelSt: React.CSSProperties = { fontSize: 12, color: "rgba(170,200,250,0.75)" };
  const sublabelSt: React.CSSProperties = { fontSize: 9, color: "rgba(80,110,165,0.5)", marginTop: 2 };
  const toggleStyle = (on: boolean): React.CSSProperties => ({ width: 34, height: 18, borderRadius: 9, background: on ? "rgba(50,120,240,0.6)" : "rgba(20,30,60,0.7)", border: on ? "1px solid rgba(80,150,255,0.5)" : "1px solid rgba(40,60,120,0.4)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 });
  const thumbStyle = (on: boolean): React.CSSProperties => ({ position: "absolute", top: 2, left: on ? 16 : 2, width: 12, height: 12, borderRadius: "50%", background: on ? "rgba(160,200,255,0.9)" : "rgba(80,100,140,0.6)", transition: "left 0.2s" });
  const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (<button onClick={onToggle} style={toggleStyle(value)}><div style={thumbStyle(value)} /></button>);
  const inputSt: React.CSSProperties = { background: "rgba(15,25,55,0.7)", border: "1px solid rgba(50,80,140,0.35)", borderRadius: 5, color: "rgba(200,220,255,0.88)", padding: "5px 8px", fontSize: 11, fontFamily: "'DM Sans',system-ui", outline: "none", width: 80 };
  const sectionHead: React.CSSProperties = { fontSize: 9, color: "rgba(80,110,165,0.5)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 14, marginBottom: 4 };

  return (
    <div style={P}>
      <div style={{ padding: "18px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "rgba(80,120,200,0.5)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Settings</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(120,150,200,0.5)", cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 2, marginBottom: 16, flexWrap: "wrap" }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "4px 9px", borderRadius: 4, cursor: "pointer", fontSize: 9, textTransform: "capitalize", letterSpacing: "0.5px", background: tab===t?"rgba(40,90,200,0.35)":"rgba(15,25,55,0.6)", border: tab===t?"1px solid rgba(60,130,255,0.4)":"1px solid rgba(30,50,100,0.3)", color: tab===t?"rgba(160,200,255,0.9)":"rgba(100,130,180,0.5)" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ padding: "0 20px 20px", flex: 1 }}>
        {tab === "display" && (<>
          <div style={sectionHead}>Time & Format</div>
          <div style={rowStyle}><div><div style={labelSt}>Time format</div></div><select value={settings.timeFormat} onChange={e => set("timeFormat", e.target.value)} style={{ ...inputSt, width: "auto" }}><option value="24h">24-hour</option><option value="12h">12-hour AM/PM</option></select></div>
          <div style={rowStyle}><div><div style={labelSt}>Hemisphere</div><div style={sublabelSt}>Affects globe orientation</div></div><select value={settings.hemisphere} onChange={e => set("hemisphere", e.target.value)} style={{ ...inputSt, width: "auto" }}><option value="auto">Auto</option><option value="north">North</option><option value="south">South</option></select></div>
          <div style={sectionHead}>Visual Weight</div>
          <div style={rowStyle}><div><div style={labelSt}>Label density</div></div><select value={settings.labelDensity} onChange={e => set("labelDensity", e.target.value)} style={{ ...inputSt, width: "auto" }}><option value="minimal">Minimal</option><option value="balanced">Balanced</option><option value="full">Full</option></select></div>
          <div style={rowStyle}><div><div style={labelSt}>Moment frequency</div><div style={sublabelSt}>Footer insights</div></div><select value={settings.momentFrequency} onChange={e => set("momentFrequency", e.target.value)} style={{ ...inputSt, width: "auto" }}><option value="frequent">Frequent</option><option value="balanced">Balanced</option><option value="off">Off</option></select></div>
        </>)}
        {tab === "cycles" && (<>
          <div style={sectionHead}>Orbital Features</div>
          {([["showLunarWave","Lunar Wave","12.5 visible cycles of the moon"],["showFyrtarn","8 Fyrtårn Anchors","The lighthouses of the year"],["showSolarBreath","Solar Breath","Solstice pulse — working capacity"],["showMeteorArcs","Meteor Debris Arcs","Perseids, Geminids, Lyrids, Orionids"],["showZodiac","Zodiac Constellations","12 ecliptic sign images"]] as [keyof Settings, string, string][]).map(([k, label, sub]) => (
            <div key={k} style={rowStyle}><div><div style={labelSt}>{label}</div><div style={sublabelSt}>{sub}</div></div><Toggle value={settings[k] as boolean} onToggle={() => set(k, !settings[k])} /></div>
          ))}
        </>)}
        {tab === "integrations" && (<>
          <div style={sectionHead}>Calendar Sync</div>
          {[["Google Calendar","Bi-directional sync"],["Microsoft Outlook / Office 365","Bi-directional sync"],["Apple iCloud (CalDAV)","Read/write access"]].map(([name, desc]) => (
            <div key={name} style={rowStyle}><div><div style={labelSt}>{name}</div><div style={sublabelSt}>{desc}</div></div><button style={{ padding: "4px 10px", borderRadius: 5, fontSize: 9, background: "rgba(20,50,120,0.35)", border: "1px solid rgba(50,100,200,0.3)", color: "rgba(120,170,255,0.65)", cursor: "pointer" }}>Connect</button></div>
          ))}
          <div style={sectionHead}>Status Sync</div>
          {[["Slack status","Auto-set status from calendar"],["Microsoft Teams","Auto-set presence from calendar"]].map(([name, desc]) => (
            <div key={name} style={rowStyle}><div><div style={labelSt}>{name}</div><div style={sublabelSt}>{desc}</div></div><Toggle value={false} onToggle={() => {}} /></div>
          ))}
        </>)}
        {tab === "location" && (<>
          <div style={sectionHead}>Your Location</div>
          <div style={rowStyle}><div style={labelSt}>Latitude</div><input type="number" value={settings.latitude} onChange={e => set("latitude", parseFloat(e.target.value))} style={inputSt} min={-90} max={90} step={0.1} /></div>
          <div style={rowStyle}><div style={labelSt}>Longitude</div><input type="number" value={settings.longitude} onChange={e => set("longitude", parseFloat(e.target.value))} style={inputSt} min={-180} max={180} step={0.1} /></div>
        </>)}
        {tab === "advanced" && (<>
          <div style={sectionHead}>Interface</div>
          <div style={rowStyle}><div><div style={labelSt}>Panic button always visible</div><div style={sublabelSt}>Show grid toggle in header</div></div><Toggle value={settings.panicAlwaysVisible} onToggle={() => set("panicAlwaysVisible", !settings.panicAlwaysVisible)} /></div>
        </>)}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function EarthMovesCalendar() {
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const viewMode = "orbital" as const;
  const viewModeTransition = "orbital" as const;
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("em_milestones") || "[]"); } catch { return []; }
  });
  const [newMilestone, setNewMilestone] = useState<{ shortName: string; description: string; date: string; repetition: "Annual" | "One-Time" }>({ shortName: "", description: "", date: "", repetition: "Annual" });
  const [showSettings, setShowSettings] = useState(false);
  const [momentIdx, setMomentIdx] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInfoTip, setShowInfoTip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [watchSouthPole, setWatchSouthPole] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  // Odometer
  const startTimeRef = useRef(Date.now());
  const [kmTraveled, setKmTraveled] = useState(0);
  const [zodiacLoaded, setZodiacLoaded] = useState(0);
  const [zodiacOn, setZodiacOn] = useState(false);
  const [celticOn, setCelticOn] = useState(false);
  const [meteorOn, setMeteorOn] = useState(false);
  const [seasonsOn, setSeasonsOn] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; title: string; body: string } | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [clickedMilestone, setClickedMilestone] = useState<{ id: string; x: number; y: number } | null>(null);
  const [solTooltipVisible, setSolTooltipVisible] = useState(false);

  // Orbital canvas container
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });

  // Canvas refs — three layers
  const cvStarsRef = useRef<HTMLCanvasElement>(null);
  const cvOrbitRef = useRef<HTMLCanvasElement>(null);
  const cvHudRef = useRef<HTMLCanvasElement>(null);

  // Star field (cached)
  const starsRef = useRef<{ x: number; y: number; r: number; a: number }[]>([]);
  const starsBuiltRef = useRef<{ w: number; h: number } | null>(null);

  // Orbital pre-compute cache
  const orbitCacheRef = useRef<{ year: number; pts: { x: number; y: number; r: number; nu: number; speed: number }[] } | null>(null);

  // Cross-layer label collision registry — written by drawOrbitalLayer, read by drawHudLayer
  const labelBBoxRef = useRef<{ x: number; y: number }[]>([]);

  // Zodiac constellation images
  const zodiacImgsRef = useRef<Record<string, HTMLImageElement>>({});

  const afRef = useRef<number>(0);
  const hoverDateRef = useRef<string | null>(null);
  const fyrtarnProximityRef = useRef<Record<string, number>>({});

  // ─── MOUNT ───────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    try {
      if (!localStorage.getItem("em_onboarded")) {
        setShowOnboarding(true);
        setTimeout(() => { setShowOnboarding(false); localStorage.setItem("em_onboarded", "1"); }, 4200);
      }
    } catch (_) {}

    // Auto-detect hemisphere for watch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        if (pos.coords.latitude < -10) setWatchSouthPole(true);
      }, () => {});
    }
  }, []);

  // ─── MOBILE DETECTION ─────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ─── MILESTONE PERSISTENCE ────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem("em_milestones", JSON.stringify(milestones)); } catch (_) {}
  }, [milestones]);

  // ─── ZODIAC TOGGLE — invalidate star layer so drawStarLayer re-runs ──
  useEffect(() => { starsBuiltRef.current = null; }, [zodiacOn]);

  // ─── ZODIAC IMAGE LOADING ────────────────────────────────────────
  useEffect(() => {
    ZODIAC_SIGNS.forEach(z => {
      if (zodiacImgsRef.current[z.file]) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `/${z.file}.png`;
      img.onload = () => { zodiacImgsRef.current[z.file] = img; setZodiacLoaded(n => n + 1); };
    });
  }, []);

  useEffect(() => {
    const year = now.getFullYear();
    if (!_usnoCache || _usnoCache.year !== year) {
      fetch(`https://aa.usno.navy.mil/api/seasons?year=${year}`)
        .then(res => res.json()).then(data => {
          const d = data.data;
          _usnoCache = { year, data: { perihelion: d.perihelion ?? [], vernal_equinox: d.vernal_equinox ?? [], summer_solstice: d.summer_solstice ?? [], autumnal_equinox: d.autumnal_equinox ?? [], winter_solstice: d.winter_solstice ?? [] } };
        }).catch(() => {});
    }
    fetch(`https://services.swpc.noaa.gov/json/planetary_k_index_1m.json`)
      .then(res => res.json()).then(data => { const last = data[data.length - 1]; _globalKp = last?.kp_index ?? 0; }).catch(() => {});
  }, [now.getFullYear()]);

  // ─── LIVE SPACE WEATHER ─────────────────────────────────────────
  useEffect(() => {
    const fetchLiveSpace = () => {
      fetch("https://api.wheretheiss.at/v1/satellites/25544")
        .then(r => r.json()).then(d => { if (d.latitude !== undefined) { _issLat = d.latitude; _issLon = d.longitude; } })
        .catch(() => { const tSec = Date.now() / 1000, p = 92.9 * 60, ph = (tSec % p) / p; _issLat = 51.6 * Math.sin(ph * TAU * 1.1); _issLon = ((ph * 360 + (tSec / 86400) * 360) % 360) - 180; });
      fetch("https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json")
        .then(r => r.json()).then(data => { const last = data[data.length - 1]; if (last) { _solarWindSpeed = last.proton_speed ?? last.speed ?? 400; _solarWindBz = last.bz_gsm ?? last.Bz ?? 0; } }).catch(() => {});
      fetch("https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json")
        .then(r => r.json()).then(data => { const last = data[data.length - 1]; if (last) { _xrayFlux = last.flux ?? last.energy ?? 0; if (_xrayFlux > 1e-5 && (Date.now() - _lastFlareFlashMs > 120000)) _lastFlareFlashMs = Date.now(); } }).catch(() => {});
    };
    fetchLiveSpace();
    const iv = setInterval(fetchLiveSpace, 10000);
    return () => clearInterval(iv);
  }, []);

  // ─── CLOCK + ODOMETER ────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => { const n = new Date(); setNow(n); setKmTraveled((Date.now() - startTimeRef.current) / 3600000 * 107280); }, 1000);
    return () => clearInterval(t);
  }, []);

  // ─── MOMENT ROTATION ─────────────────────────────────────────────
  useEffect(() => {
    const freq = settings.momentFrequency === "frequent" ? 20000 : settings.momentFrequency === "balanced" ? 45000 : 99999999;
    const t = setInterval(() => setMomentIdx(i => i + 1), freq);
    return () => clearInterval(t);
  }, [settings.momentFrequency]);

  // ─── RESIZE OBSERVER ─────────────────────────────────────────────
  // Re-attaches when isMobile toggles (fixes mobile blank canvas + zoom bug)
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ w: rect.width, h: rect.height });
      starsBuiltRef.current = null;
    }
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ w: width, h: height });
          starsBuiltRef.current = null;
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

// ── ORBITAL GEOMETRY ─────────────────────────────────────────────────
const orbitGeometry = useMemo(() => {
  const { w, h } = containerSize;
  const PAD = 60;
  // Scale so Mars orbit + month labels + zodiac images all fit
  let maxR = (Math.min(w, h) / 2 - PAD);
  const aR = Math.max(85, maxR / 2.1); // ← minimum 85px on mobile — never negative, never tiny
  const bR = aR * Math.sqrt(1 - ECCENTRICITY * ECCENTRICITY);
  const focusOffset = aR * ECCENTRICITY;
  const cx = w / 2;
  const cy = h / 2;
  return { cx, cy, aR, bR, focusOffset, baseScale: aR };
}, [containerSize]);

  const orbitPts = useMemo(() => {
    const year = now.getFullYear();
    const { cx, cy, aR, bR, focusOffset } = orbitGeometry;
    if (orbitCacheRef.current?.year === year && Math.abs(orbitCacheRef.current.pts[0].x - cx) < 1) return orbitCacheRef.current.pts;
    const pts = precomputeOrbit(year, cx, cy, aR, bR, focusOffset);
    orbitCacheRef.current = { year, pts };
    return pts;
  }, [now, orbitGeometry]);

  const earthPos = useMemo(() => { const { cx, cy, aR, bR, focusOffset } = orbitGeometry; return orbitalPoint(now, cx, cy, aR, bR, focusOffset); }, [now, orbitGeometry]);
  const selectedPos = useMemo(() => { const { cx, cy, aR, bR, focusOffset } = orbitGeometry; return orbitalPoint(selectedDate, cx, cy, aR, bR, focusOffset); }, [selectedDate, orbitGeometry]);

  const sol = useMemo(() => solar(now), [now]);
  const lun = useMemo(() => lunar(now), [now]);
  const dayLength = useMemo(() => getDayLength(settings.latitude, selectedDate), [settings.latitude, selectedDate]);
  const wk = useMemo(() => weekNum(selectedDate), [selectedDate]);
  const solDay = useMemo(() => {
    const start = new Date(selectedDate.getFullYear(), 0, 0);
    return Math.floor((Number(selectedDate) - Number(start)) / 86400000);
  }, [selectedDate]);
  const solTotal = useMemo(() => {
    const yr = selectedDate.getFullYear();
    return (yr % 4 === 0 && (yr % 100 !== 0 || yr % 400 === 0)) ? 366 : 365;
  }, [selectedDate]);

  const southPole = useMemo(() => {
    if (settings.hemisphere === "south") return true;
    if (settings.hemisphere === "north") return false;
    return settings.latitude < 0;
  }, [settings.hemisphere, settings.latitude]);

  const fyrtarnDates = useMemo(() => {
    const year = now.getFullYear();
    const usno = _usnoCache?.year === year ? _usnoCache.data : null;
    const usnoMap: Record<string, { month: number; day: number } | undefined> = {
      "Perihelion": usno?.perihelion?.[0], "Equinox_03": usno?.vernal_equinox?.[0],
      "Solstice_06": usno?.summer_solstice?.[0], "Equinox_09": usno?.autumnal_equinox?.[0], "Solstice_12": usno?.winter_solstice?.[0],
    };
    return FYRTARN.map(f => {
      const key = f.name === "Equinox" ? `Equinox_${f.date.slice(0,2)}` : f.name === "Solstice" ? `Solstice_${f.date.slice(0,2)}` : f.name;
      const override = usnoMap[key];
      if (override) return { ...f, dateObj: new Date(year, override.month - 1, override.day) };
      const [m, d] = f.date.split("-").map(Number);
      return { ...f, dateObj: new Date(year, m - 1, d) };
    });
  }, [now]);

  const CELTIC_NAMES = ["Imbolc", "Beltane", "Lammas"];
  const visibleFyrtarnDates = useMemo(
    () => celticOn ? fyrtarnDates : fyrtarnDates.filter(f => !CELTIC_NAMES.includes(f.name)),
    [fyrtarnDates, celticOn]
  );

  // ─── CANVAS LAYERS (unchanged orbital rendering) ─────────────────
  const drawStarLayer = useCallback(() => {
    const cv = cvStarsRef.current; if (!cv) return;
    const { w, h } = containerSize; cv.width = w; cv.height = h;
    const c = cv.getContext("2d")!; c.clearRect(0, 0, w, h);
    const bg = c.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
    bg.addColorStop(0, "#060810"); bg.addColorStop(0.5, "#020306"); bg.addColorStop(1, "#000000");
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    if (!starsBuiltRef.current || starsBuiltRef.current.w !== w) {
      starsRef.current = [];
      const count = Math.round(w * h / 2000);
      for (let i = 0; i < count; i++) starsRef.current.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()<0.92 ? Math.random()*0.7+0.15 : Math.random()*1.2+0.8, a: Math.random()*0.6+0.2, phase: Math.random()*TAU } as { x:number;y:number;r:number;a:number;phase:number });
      starsBuiltRef.current = { w, h };
    }
    const tStar = now.getTime();
    starsRef.current.forEach(s => {
      const sAny = s as { x:number;y:number;r:number;a:number;phase:number };
      const twinkle = 0.6 + 0.4 * Math.sin(tStar / 1800 + (sAny.phase ?? 0));
      const alpha = s.a * twinkle;
      const temp = (sAny.phase ?? 0) % 3;
      const col = temp < 1 ? `rgba(200,215,245,${alpha})` : temp < 2 ? `rgba(255,230,205,${alpha*0.9})` : `rgba(180,200,230,${alpha*0.85})`;
      c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fillStyle = col; c.fill();
    });
    const mw = c.createLinearGradient(w*0.1, h*0.2, w*0.9, h*0.8);
    mw.addColorStop(0, "rgba(120,140,200,0)"); mw.addColorStop(0.5, "rgba(120,140,200,0.022)"); mw.addColorStop(1, "rgba(120,140,200,0)");
    c.fillStyle = mw; c.fillRect(0, 0, w, h);
    { const { cx, cy, aR } = orbitGeometry;
      if (!_dustInit) { for (let i = 0; i < 40; i++) _dustParticles.push({ angle: Math.random()*TAU, r: aR*(1.15+Math.random()*0.35), speed: 0.00002+Math.random()*0.00003, a: 0.04+Math.random()*0.08 }); _dustInit = true; }
      _dustParticles.forEach(dp => { dp.r += dp.speed; if (dp.r > aR*1.55) dp.r = aR*1.15; const dx = cx+dp.r*Math.cos(dp.angle); const dy = cy+dp.r*Math.sin(dp.angle); c.beginPath(); c.arc(dx,dy,0.5,0,TAU); c.fillStyle = `rgba(160,180,220,${dp.a})`; c.fill(); });
    }
    if (zodiacOn) {
      const { cx, cy, aR, bR } = orbitGeometry;
      const zodiacR = aR * 1.85; // beyond Mars orbit + month labels
      const imgSize = Math.max(34, Math.min(58, aR * 0.192)); // +20% per design spec — grand celestial bezel
      const solData = solar(now);
      const nightRa = ((solData.orbitalAngle / 360) * 24 + 12) % 24;

            ZODIAC_SIGNS.forEach(z => {
        // Position: midDay maps to angle on the calendar ring
        const angle = (-(z.midDay / 365) * 360 - 90) * DEG;
        const zx = cx + zodiacR * Math.cos(angle);
        const zy = cy + zodiacR * (bR / aR) * Math.sin(angle);

        // Brightness: active constellation (opposite sun) is brighter
        const signRaCenter = (z.midDay / 365) * 24;
        const raDiff = Math.abs(((signRaCenter - nightRa + 12) % 24) - 12);
        const isActive = raDiff < 2;
        const alpha = isActive ? 1.0 : 0.88;   // boosted brilliance per design spec

        // Draw image if loaded (white-on-black PNG — use "screen" blending)
        const img = zodiacImgsRef.current[z.file];
        if (img && img.complete) {
          c.save();
          c.globalCompositeOperation = "screen";
          c.globalAlpha = alpha;
          c.filter = "brightness(1.85) contrast(1.35) saturate(0.9)"; // pure white + crystal clear
          c.drawImage(img, zx - imgSize / 2, zy - imgSize / 2, imgSize, imgSize);
          c.filter = "none";
          c.restore();
        } else {
          // Fallback: small dot
          c.beginPath(); c.arc(zx, zy, 2, 0, TAU);
          c.fillStyle = `rgba(255,255,255,${alpha})`; c.fill();
        }

        // Label below image — pure white
        c.fillStyle = `rgba(255,255,255,${isActive ? 0.95 : 0.75})`;
        c.font = `${isActive ? 500 : 400} ${Math.max(7, imgSize * 0.22)}px 'DM Mono',monospace`;
        c.textAlign = "center"; c.textBaseline = "top";
        c.fillText(z.name, zx, zy + imgSize / 2 + 3);
      });

    }

    // ── "TOWARDS MILKY WAY CORE" arrow — always visible ──
    { const { cx, cy, aR, bR } = orbitGeometry;
      const sagIdx = ZODIAC_SIGNS.findIndex(z => z.name === "Sagittarius");
      if (sagIdx >= 0) {
        const sagAngle = (-(ZODIAC_SIGNS[sagIdx].midDay / 365) * 360 - 90) * DEG;
        const baseR = zodiacOn ? aR * 1.85 + Math.max(34, Math.min(58, aR * 0.192)) / 2 + 12 : aR * 1.55;
        const arrowStartR = baseR;
        const arrowEndR = arrowStartR + 30;
        const asx = cx + arrowStartR * Math.cos(sagAngle);
        const asy = cy + arrowStartR * (bR / aR) * Math.sin(sagAngle);
        const aex = cx + arrowEndR * Math.cos(sagAngle);
        const aey = cy + arrowEndR * (bR / aR) * Math.sin(sagAngle);
        c.save();
        c.globalAlpha = 0.85;
        // Arrow shaft
        c.beginPath(); c.moveTo(asx, asy); c.lineTo(aex, aey);
        c.strokeStyle = "rgba(255,255,255,0.18)"; c.lineWidth = 0.8; c.stroke();
        // Arrowhead
        const headAngle = Math.atan2(aey - asy, aex - asx);
        const headLen = 5;
        c.beginPath();
        c.moveTo(aex, aey);
        c.lineTo(aex - headLen * Math.cos(headAngle - 0.4), aey - headLen * Math.sin(headAngle - 0.4));
        c.moveTo(aex, aey);
        c.lineTo(aex - headLen * Math.cos(headAngle + 0.4), aey - headLen * Math.sin(headAngle + 0.4));
        c.strokeStyle = "rgba(255,255,255,0.22)"; c.lineWidth = 0.8; c.lineCap = "round"; c.stroke();
        // "MILKY WAY CORE →" label
        const labelR = arrowEndR + 8;
        const lbx = cx + labelR * Math.cos(sagAngle);
        const lby = cy + labelR * (bR / aR) * Math.sin(sagAngle);
        c.fillStyle = "rgba(255,255,255,0.15)";
        c.font = "6px 'DM Mono',monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.save(); c.translate(lbx, lby); c.rotate(sagAngle + Math.PI / 2);
        c.fillText("MILKY WAY CORE →", 0, 0);
        c.restore();
        // "720,000 km/h" speed label — 14px past arrowhead
        const speedLx = cx + (arrowEndR + 14) * Math.cos(sagAngle);
        const speedLy = cy + (arrowEndR + 14) * (bR / aR) * Math.sin(sagAngle);
        c.fillStyle = "rgba(200,220,255,0.72)";
        c.font = "9px 'DM Mono',monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.save(); c.translate(speedLx, speedLy); c.rotate(sagAngle + Math.PI / 2);
        c.fillText("720,000 km/h", 0, 0);
        c.restore();
        c.restore();
      }
    }
  }, [containerSize, zodiacOn, orbitGeometry]);

  // The orbital layer and HUD layer
  const drawOrbitalLayer = useCallback(() => {
    const cv = cvOrbitRef.current; if (!cv) return;
    const { w, h } = containerSize; cv.width = w; cv.height = h;
    const c = cv.getContext("2d")!; c.clearRect(0, 0, w, h);
    const { cx, cy, aR, bR } = orbitGeometry; const t = now.getTime();
    if (orbitPts.length < 100) return;

    if (settings.showMeteorArcs) { METEOR_ARCS.forEach(ma => { const arcAngle = (ma.angle-90)*DEG; const arcR = aR*1.20; const startAngle = arcAngle-(ma.width/2)*DEG; const endAngle = arcAngle+(ma.width/2)*DEG; const isNear = Math.abs(sol.orbitalAngle-ma.angle)<ma.width*1.5; const glow = isNear?0.42:0.13; c.beginPath(); c.arc(cx,cy,arcR,startAngle,endAngle); c.strokeStyle = ma.color.replace(/^#(..)(..)(..)/, (_,r,g,b) => `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},${glow})`); c.lineWidth = isNear?7:4; c.stroke(); }); }

          if (settings.showSolarBreath) { const currentDayLen = getDayLength(settings.latitude, now); const doy = Math.floor((Number(now)-Number(new Date(now.getFullYear(),0,0)))/86400000); const summerBreath = Math.sin((doy-172)*DEG*15); let breathR = Math.max(1, aR*1.06); const capacityFactor = currentDayLen/24; const windFactor = Math.max(0, Math.min(1, (_solarWindSpeed - 300) / 500)); const baseOpacity = 0.008+0.035*capacityFactor+0.02*windFactor; const breathPulse = 1 + 0.1 * windFactor * Math.sin(t / (1200 - 400 * windFactor)); const glowWidth = (1.5+4*capacityFactor*Math.max(0,summerBreath)+2*windFactor)*breathPulse; c.beginPath(); c.ellipse(cx,cy,breathR,Math.max(1,breathR*(bR/aR)),0,0,TAU); c.strokeStyle = `rgba(70,130,220,${baseOpacity})`; c.lineWidth = glowWidth; c.stroke(); }

    { 
      const sunX = cx - orbitGeometry.focusOffset; 
      const sunY = cy; 
      const yearFrac = (Number(now) - Number(new Date(now.getFullYear(), 0, 0))) / (365.25 * 86400000);

      // RENDER ALL PLANETS (inner system only)
      Object.entries(PLANET_DATA).forEach(([name, data]) => {
        const pOrbitR = orbitGeometry.aR * data.a;

                // Draw Orbit Path — Mars gets visible rust ring, others gossamer (safe for mobile)
        const pxR = Math.max(1, pOrbitR);
        const pyR = Math.max(1, pOrbitR * (bR / aR));
        c.beginPath();
        c.ellipse(sunX, sunY, pxR, pyR, 0, 0, TAU);
        if (name === "earth") {
          c.strokeStyle = "rgba(96,165,250,0.06)"; c.lineWidth = 0.5;
        } else if (name === "mars") {
          c.strokeStyle = "rgba(200,130,80,0.36)"; c.lineWidth = 1.2;
          c.stroke();
          // Second pass: faint outer glow for Mars orbit
          c.beginPath();
          c.ellipse(sunX, sunY, pOrbitR, pOrbitR * (bR / aR), 0, 0, TAU);
          c.strokeStyle = "rgba(200,130,80,0.12)"; c.lineWidth = 6;
        } else if (name === "mercury") {
          c.strokeStyle = "rgba(200,200,210,0.60)"; c.lineWidth = 1.4;
        } else if (name === "venus") {
          c.strokeStyle = "rgba(255,220,140,0.60)"; c.lineWidth = 1.4;
        } else {
          c.strokeStyle = "rgba(160,170,200,0.55)"; c.lineWidth = 1.4;
        }
        c.stroke();

        // ── CCW DIRECTION CHEVRON at 12 o'clock of orbit ring ──
        if (name === "mercury" || name === "venus" || name === "mars") {
          const tipX = sunX;
          const tipY = sunY - pyR; // topmost point of ellipse
          const chevLen = 3;
          c.save();
          c.beginPath();
          c.moveTo(tipX + chevLen * Math.cos(0.4), tipY + chevLen * Math.sin(0.4));
          c.lineTo(tipX, tipY);
          c.lineTo(tipX + chevLen * Math.cos(-0.4), tipY + chevLen * Math.sin(-0.4));
          c.strokeStyle = "rgba(255,255,255,0.45)";
          c.lineWidth = 1; c.lineCap = "round"; c.lineJoin = "round";
          c.stroke();
          c.restore();
        }

        // EARTH HANDLED BY HUD; SKIP DRAWING BODY HERE
        if (name === "earth") return;

        // Mars orbit label
        if (name === "mars") {
          const marsLabelAngle = (-45) * DEG;
          const marsLabelR = pOrbitR + 12;
          const mlx = sunX + marsLabelR * Math.cos(marsLabelAngle);
          const mly = sunY + marsLabelR * (bR/aR) * Math.sin(marsLabelAngle);
          const tangA2 = marsLabelAngle + Math.PI / 2;
          const arrowLen = 8;
          c.save();
          c.strokeStyle = "rgba(255,120,80,0.80)"; c.lineWidth = 1.2; c.lineCap = "round";
          c.beginPath();
          c.moveTo(mlx - arrowLen * Math.cos(tangA2), mly - arrowLen * Math.sin(tangA2));
          c.lineTo(mlx + arrowLen * Math.cos(tangA2), mly + arrowLen * Math.sin(tangA2));
          const hL = 6;
          c.moveTo(mlx + arrowLen * Math.cos(tangA2), mly + arrowLen * Math.sin(tangA2));
          c.lineTo(mlx + arrowLen * Math.cos(tangA2) - hL * Math.cos(tangA2 - 0.5), mly + arrowLen * Math.sin(tangA2) - hL * Math.sin(tangA2 - 0.5));
          c.moveTo(mlx + arrowLen * Math.cos(tangA2), mly + arrowLen * Math.sin(tangA2));
          c.lineTo(mlx + arrowLen * Math.cos(tangA2) - hL * Math.cos(tangA2 + 0.5), mly + arrowLen * Math.sin(tangA2) - hL * Math.sin(tangA2 + 0.5));
          c.stroke();
          c.restore();
        }

        // Position based on realistic orbital period p
        const angle = -(yearFrac / data.p) * TAU - Math.PI / 2;
        const px = sunX + pOrbitR * Math.cos(angle);
        const py = sunY + pOrbitR * (bR / aR) * Math.sin(angle);

        // Planet Body (no redundant glow halo for Mercury/Venus)
        const isMercuryOrVenus = name === "mercury" || name === "venus";
        const pSize = isMercuryOrVenus ? 3.0 : 2.5;
        c.beginPath(); c.arc(px, py, pSize, 0, TAU);
        c.fillStyle = data.color; c.fill();

        // Blueprint Label
        const labelOpacity = isMercuryOrVenus ? 0.90 : 0.5;
        const labelSize = isMercuryOrVenus ? 12 : 7;
        c.font = `${labelSize}px 'DM Mono',monospace`; c.textAlign = "center";
        c.fillStyle = `rgba(200,220,255,${labelOpacity})`;
        c.fillText(name.toUpperCase(), px, py + pSize + 10);
      });
    }

    // ── EARTH'S ORBIT — variable thickness, bold near Earth position ──
    const earthDoy = Math.floor((Number(now) - Number(new Date(now.getFullYear(), 0, 0))) / 86400000);
    const earthIdx = Math.min(earthDoy - 1, orbitPts.length - 1);

    // Outer glow layer (very faint, wide)
    c.beginPath(); orbitPts.forEach((p,i) => { if (i===0) c.moveTo(p.x,p.y); else c.lineTo(p.x,p.y); }); c.closePath();
    c.strokeStyle = "rgba(30,80,180,0.04)"; c.lineWidth = 14; c.stroke();

    // Variable thickness segments — bright near Earth, fading away
    for (let i = 0; i < orbitPts.length - 1; i++) {
      const p0 = orbitPts[i], p1 = orbitPts[i + 1];
      // Distance from Earth position (wrapping around year)
      let segDist = Math.abs(i - earthIdx);
      if (segDist > orbitPts.length / 2) segDist = orbitPts.length - segDist;
      const proximity = Math.exp(-segDist * segDist / 2500); // gaussian falloff

      const baseAlpha = 0.12 + 0.55 * proximity;
      const lineW = 0.6 + 2.2 * proximity;

      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.strokeStyle = `rgba(70,140,255,${baseAlpha})`;
      c.lineWidth = lineW;
      c.stroke();
    }

    // Subtle inner glow near Earth
    if (earthIdx >= 0 && earthIdx < orbitPts.length) {
      const ep = orbitPts[earthIdx];
      const glowGrad = c.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, 45);
      glowGrad.addColorStop(0, "rgba(96,165,250,0.12)");
      glowGrad.addColorStop(1, "rgba(96,165,250,0)");
      c.beginPath(); c.arc(ep.x, ep.y, 45, 0, TAU);
      c.fillStyle = glowGrad; c.fill();
    }

    // ── GRADUATION MARKS — white ||||| gauge ticks around orbit ──
    {
      const sunX = cx - orbitGeometry.focusOffset;
      const sunY = cy;
      const gaugeR = aR * 1.04; // just outside Earth's orbit
      const gaugeInner = aR * 1.02;

      // Thin continuous ring (the gauge baseline)
      c.beginPath();
      c.ellipse(cx, cy, gaugeR, gaugeR * (bR / aR), 0, 0, TAU);
      c.strokeStyle = "rgba(180,200,230,0.08)";
      c.lineWidth = 0.4;
      c.stroke();

      // Daily tick marks — every day = one graduation
      for (let d = 0; d < 365; d++) {
        const dayAngle = (-(d / 365) * 360 - 90) * DEG;
        const isWeekStart = d % 7 === 0;
        const isMonthStart = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334].includes(d);

        let tickInner: number, tickOuter: number, tickAlpha: number, tickWidth: number;
        if (isMonthStart) {
          tickInner = gaugeInner - 4;
          tickOuter = gaugeR + 4;
          tickAlpha = 0.35;
          tickWidth = 0.8;
        } else if (isWeekStart) {
          tickInner = gaugeInner;
          tickOuter = gaugeR + 2;
          tickAlpha = 0.18;
          tickWidth = 0.5;
        } else {
          tickInner = gaugeInner + 1;
          tickOuter = gaugeR;
          tickAlpha = 0.08;
          tickWidth = 0.3;
        }

        c.beginPath();
        c.moveTo(cx + tickInner * Math.cos(dayAngle), cy + tickInner * (bR/aR) * Math.sin(dayAngle));
        c.lineTo(cx + tickOuter * Math.cos(dayAngle), cy + tickOuter * (bR/aR) * Math.sin(dayAngle));
        c.strokeStyle = `rgba(200,215,240,${tickAlpha})`;
        c.lineWidth = tickWidth;
        c.stroke();
      }
    }

    // ── JAN 1 MARKER ──
    { const jan1 = orbitPts[0];
      if (jan1) {
        const jan1Angle = Math.atan2(jan1.y - cy, jan1.x - cx);
        const tix = jan1.x, tiy = jan1.y;
        const tox = jan1.x + 10 * Math.cos(jan1Angle), toy = jan1.y + 10 * Math.sin(jan1Angle);
        c.beginPath(); c.moveTo(tix, tiy); c.lineTo(tox, toy);
        c.strokeStyle = "rgba(255,255,255,0.50)"; c.lineWidth = 1; c.lineCap = "butt"; c.stroke();
        // Label 14px past tick end (10 + 14 = 24px from orbit point)
        const lx = jan1.x + 24 * Math.cos(jan1Angle);
        const ly = jan1.y + 24 * Math.sin(jan1Angle);
        c.fillStyle = "rgba(255,255,255,0.50)";
        c.font = "9px 'DM Mono',monospace"; c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText("Jan 1", lx, ly);
      }
    }

    // ── EARTH ORBIT ARROW + LABEL (top-right, ~March position) ──
    { const orbitLabelAngle = (-60) * DEG; // ~top-right March area
      const arrowR = aR * 1.07;
      const ax1 = cx + arrowR * Math.cos(orbitLabelAngle - 0.06);
      const ay1 = cy + arrowR * (bR/aR) * Math.sin(orbitLabelAngle - 0.06);
      const ax2 = cx + arrowR * Math.cos(orbitLabelAngle + 0.06);
      const ay2 = cy + arrowR * (bR/aR) * Math.sin(orbitLabelAngle + 0.06);
      const tangentAngle = Math.atan2(ay2 - ay1, ax2 - ax1);
      const midX = (ax1 + ax2) / 2; const midY = (ay1 + ay2) / 2;
      // Arrow
      c.save();
      c.strokeStyle = "rgba(255,255,255,0.75)"; c.lineWidth = 1.2; c.lineCap = "round";
      c.beginPath(); c.moveTo(ax1, ay1); c.lineTo(ax2, ay2); c.stroke();
      const hLen = 8;
      c.beginPath();
      c.moveTo(ax2, ay2);
      c.lineTo(ax2 - hLen * Math.cos(tangentAngle - 0.5), ay2 - hLen * Math.sin(tangentAngle - 0.5));
      c.moveTo(ax2, ay2);
      c.lineTo(ax2 - hLen * Math.cos(tangentAngle + 0.5), ay2 - hLen * Math.sin(tangentAngle + 0.5));
      c.stroke();
      c.restore();
    }

    // ── ORBIT OF EARTH LABEL — subtle, ~4 o'clock position ──
    {
      const p4 = orbitPts[Math.min(242, orbitPts.length - 1)]; // ~Aug 31, lower-right
      if (p4) {
        const outAngle = Math.atan2(p4.y - cy, p4.x - cx);
        const lx = p4.x + 18 * Math.cos(outAngle);
        const ly = p4.y + 18 * Math.sin(outAngle);
        c.fillStyle = "rgba(255,255,255,0.45)";
        c.font = "9px 'DM Mono',monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText("Orbit of Earth", lx, ly);
      }
    }

    // ── SUN LABEL ──
    { const sunX = cx - orbitGeometry.focusOffset; const sunY = cy;
      c.fillStyle = "rgba(255,220,100,0.85)";
      c.font = "11px 'DM Mono',monospace"; c.textAlign = "center"; c.textBaseline = "top";
      c.fillText("SUN", sunX, sunY + 18);
    }

    // ── MILESTONE CROSS MARKS — tick at orbit intersection ──
    if (settings.showFyrtarn) {
      visibleFyrtarnDates.forEach(f => {
        if (!seasonsOn && (f.name === "Equinox" || f.name === "Solstice")) return;
        const doy = Math.floor((Number(f.dateObj) - Number(new Date(f.dateObj.getFullYear(), 0, 0))) / 86400000);
        const ptIdx = Math.min(doy - 1, orbitPts.length - 1);
        if (ptIdx < 0) return;
        const p = orbitPts[ptIdx];
        const hexR2 = parseInt(f.color.slice(1, 3), 16);
        const hexG2 = parseInt(f.color.slice(3, 5), 16);
        const hexB2 = parseInt(f.color.slice(5, 7), 16);
        const crossSize = 5;
        const angle = Math.atan2(p.y - cy, p.x - cx);
        c.beginPath();
        c.moveTo(p.x - crossSize * Math.cos(angle + Math.PI / 2), p.y - crossSize * Math.sin(angle + Math.PI / 2));
        c.lineTo(p.x + crossSize * Math.cos(angle + Math.PI / 2), p.y + crossSize * Math.sin(angle + Math.PI / 2));
        c.strokeStyle = `rgba(${hexR2},${hexG2},${hexB2},0.5)`;
        c.lineWidth = 0.8;
        c.stroke();
      });
    }

    // ── USER MILESTONES — colored dots on orbit ring ──
    if (milestones.length > 0) {
      milestones.forEach(m => {
        const parts = m.date.split(".");
        if (parts.length !== 2) return;
        const dd = parseInt(parts[0], 10), mm2 = parseInt(parts[1], 10);
        if (isNaN(dd) || isNaN(mm2)) return;
        const d = new Date(now.getFullYear(), mm2 - 1, dd);
        const doy = Math.floor((Number(d) - Number(new Date(d.getFullYear(), 0, 0))) / 86400000);
        const ptIdx = Math.min(Math.max(0, doy - 1), orbitPts.length - 1);
        const p = orbitPts[ptIdx];
        if (!p) return;

        const angle = Math.atan2(p.y - cy, p.x - cx);

        // Colored dot on orbit
        c.beginPath();
        c.arc(p.x, p.y, 4, 0, TAU);
        c.fillStyle = "rgba(255,200,80,0.88)";
        c.fill();
        c.strokeStyle = "rgba(255,225,130,0.5)";
        c.lineWidth = 0.8;
        c.stroke();

        // shortName label outside ring — collision-avoid against fyrtarn labels
        let labelDist = 18;
        for (let attempt = 0; attempt < 6; attempt++) {
          const tlx = p.x + Math.cos(angle) * labelDist;
          const tly = p.y + Math.sin(angle) * labelDist;
          const hasCollision = labelBBoxRef.current.some(l => Math.sqrt((tlx-l.x)**2+(tly-l.y)**2) < 30);
          if (!hasCollision) break;
          labelDist += 14;
        }
        const lx = p.x + Math.cos(angle) * labelDist;
        const ly = p.y + Math.sin(angle) * labelDist;
        labelBBoxRef.current.push({x: lx, y: ly});
        c.fillStyle = "rgba(255,255,255,0.80)";
        c.font = "500 11px 'DM Mono',monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(m.shortName.toUpperCase(), lx, ly);
      });
    }

    // ── EARTH DIRECTION CHEVRON — tangential to orbit at current position ──
    {
      const prevPt = orbitPts[Math.max(0, earthIdx - 1)];
      const nextPt = orbitPts[Math.min(orbitPts.length - 1, earthIdx + 1)];
      const ep = orbitPts[earthIdx];
      if (ep && prevPt && nextPt) {
        const dx = nextPt.x - prevPt.x;
        const dy = nextPt.y - prevPt.y;
        const travelAngle = Math.atan2(dy, dx);
        const chevLen = 8;
        c.save();
        c.beginPath();
        c.moveTo(ep.x - chevLen * Math.cos(travelAngle - 0.4), ep.y - chevLen * Math.sin(travelAngle - 0.4));
        c.lineTo(ep.x, ep.y);
        c.lineTo(ep.x - chevLen * Math.cos(travelAngle + 0.4), ep.y - chevLen * Math.sin(travelAngle + 0.4));
        c.strokeStyle = "rgba(255,255,255,0.75)";
        c.lineWidth = 1.2; c.lineCap = "round"; c.lineJoin = "round";
        c.stroke();
        c.restore();
      }
    }

    // ── FADED ARC PATCHES — milestones as spectral glows on the orbit path
    if (settings.showFyrtarn) {
      const todayDoyForFyt = Math.floor((Number(now)-Number(new Date(now.getFullYear(),0,0)))/86400000);
      const drawnLabels: {x:number; y:number}[] = [];
      labelBBoxRef.current = []; // reset cross-layer registry

      visibleFyrtarnDates.forEach(f => {
        if (!seasonsOn && (f.name === "Equinox" || f.name === "Solstice")) return;
        const doy = Math.floor((Number(f.dateObj)-Number(new Date(f.dateObj.getFullYear(),0,0)))/86400000);
        const ptIdx = Math.min(doy-1,orbitPts.length-1);
        if (ptIdx<0) return;

        const daysDiff = Math.abs(doy-todayDoyForFyt);
        const proximity = Math.max(0,1-daysDiff/22);

        // Parse color
        const hexR = parseInt(f.color.slice(1,3),16);
        const hexG = parseInt(f.color.slice(3,5),16);
        const hexB = parseInt(f.color.slice(5,7),16);

        // Draw faded arc patch: ···::||::··· on orbit path (~10 days each side)
        const SPREAD = 12; // days each side
        for (let d = -SPREAD; d <= SPREAD; d++) {
          const idx = Math.min(Math.max(0, ptIdx + d), orbitPts.length - 2);
          const p0 = orbitPts[idx], p1 = orbitPts[idx + 1];
          if (!p0 || !p1) continue;

          // Intensity peaks at center, fades to edges (gaussian-like)
          const dist = Math.abs(d) / SPREAD;
          const intensity = Math.exp(-dist * dist * 3.5);
          const baseAlpha = 0.06 + 0.5 * intensity;
          const lineW = 1.5 + 5 * intensity;

          c.beginPath();
          c.moveTo(p0.x, p0.y);
          c.lineTo(p1.x, p1.y);
          c.strokeStyle = `rgba(${hexR},${hexG},${hexB},${baseAlpha})`;
          c.lineWidth = lineW;
          c.stroke();
        }

        // Label — collision-prevented, base offset at least aR*0.08
        const p = orbitPts[ptIdx];
        const lAngle = Math.atan2(p.y-cy,p.x-cx);
        const baseOffset = Math.max(18 + 6 * proximity, aR * 0.08);
        let labelDist = baseOffset;
        for (let attempt = 0; attempt < 6; attempt++) {
          const tlx = p.x + Math.cos(lAngle) * labelDist;
          const tly = p.y + Math.sin(lAngle) * labelDist;
          let collision = false;
          for (const prev of drawnLabels) {
            if (Math.sqrt((tlx-prev.x)**2+(tly-prev.y)**2) < 28) { collision = true; break; }
          }
          if (!collision) break;
          labelDist += 18;
        }
        const lx = p.x+Math.cos(lAngle)*labelDist;
        const ly = p.y+Math.sin(lAngle)*labelDist;
        drawnLabels.push({x: lx, y: ly});
        labelBBoxRef.current.push({x: lx, y: ly}); // register for cross-layer collision
        const labelAlpha = 0.95;
        c.fillStyle = `rgba(${hexR},${hexG},${hexB},${labelAlpha})`;
        c.font = `500 ${Math.round((10+2*proximity)*1.25)}px 'DM Mono',monospace`;
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(f.name.toUpperCase(), lx, ly);
      });
    }

    // ── METEOR SHOWER DUST BANDS ──
    if (meteorOn) {
      const HALF = 2; // days each side (~4 degrees)
      METEOR_SHOWER_BANDS.forEach(ms => {
        const ptIdx = Math.min(Math.max(0, ms.peakDoy - 1), orbitPts.length - 2);
        // Draw arc band on orbit path with outward offset
        for (let d = -HALF; d <= HALF; d++) {
          const idx = Math.min(Math.max(0, ptIdx + d), orbitPts.length - 2);
          const p0 = orbitPts[idx], p1 = orbitPts[idx + 1];
          if (!p0 || !p1) continue;
          const dist = Math.abs(d) / HALF;
          const intensity = Math.exp(-dist * dist * 2.5);
          const alpha = 0.10 + 0.38 * intensity;
          const lineW = 1.2 + 4.0 * intensity;
          // Offset outward from orbit center
          const midX = (p0.x + p1.x) / 2, midY = (p0.y + p1.y) / 2;
          const outAngle = Math.atan2(midY - cy, midX - cx);
          const off = 7;
          const ox = Math.cos(outAngle) * off, oy = Math.sin(outAngle) * off;
          c.beginPath();
          c.moveTo(p0.x + ox, p0.y + oy);
          c.lineTo(p1.x + ox, p1.y + oy);
          c.strokeStyle = `rgba(215,222,242,${alpha})`;
          c.lineWidth = lineW;
          c.lineCap = "round";
          c.stroke();
        }
        // Label: radially outward from peak point
        const p = orbitPts[ptIdx];
        const lAngle = Math.atan2(p.y - cy, p.x - cx);
        const labelDist = 20;
        const lx = p.x + Math.cos(lAngle) * labelDist;
        const ly = p.y + Math.sin(lAngle) * labelDist;
        c.fillStyle = "rgba(200,210,238,0.55)";
        c.font = "500 7px 'DM Mono',monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(ms.name.toUpperCase(), lx, ly);
      });
    }

    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const marsOrbitR = aR * 1.52; // Mars orbit radius
    const monthLabelR = marsOrbitR + 22; // labels just outside Mars orbit
    // Month divider ticks
    for (let m = 0; m < 12; m++) {
      const tickAngle = (-m * 30 - 90) * DEG;
      c.beginPath();
      c.moveTo(cx + (marsOrbitR + 6) * Math.cos(tickAngle), cy + (marsOrbitR + 6) * Math.sin(tickAngle));
      c.lineTo(cx + (marsOrbitR + 14) * Math.cos(tickAngle), cy + (marsOrbitR + 14) * Math.sin(tickAngle));
      c.strokeStyle = "rgba(80,110,165,0.2)"; c.lineWidth = 0.7; c.stroke();
    }
    // Month labels — positioned on single circular axis
    for (let m = 0; m < 12; m++) { const midAngle = (-(m*30+15)-90)*DEG; const lx = cx+monthLabelR*Math.cos(midAngle); const ly = cy+monthLabelR*Math.sin(midAngle); c.save(); c.translate(lx,ly); c.rotate(midAngle+Math.PI/2); const isCur = m===now.getMonth(); c.fillStyle = isCur ? "rgba(220,235,255,0.95)" : "rgba(160,180,220,0.95)"; c.font = `${isCur?500:400} ${isCur?15:14}px 'DM Sans',system-ui`; c.letterSpacing = "2px"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(months[m],0,0); c.restore(); }

    // Meeting blobs removed per v4 spec — orbital view is purely astronomical

    // Fyrtårn dots removed — replaced by arc patches above

    { const p = selectedPos; c.beginPath(); c.arc(p.x,p.y,5,0,TAU); c.strokeStyle = "rgba(200,220,255,0.6)"; c.lineWidth = 1.5; c.stroke(); c.beginPath(); c.arc(p.x,p.y,2,0,TAU); c.fillStyle = "rgba(200,220,255,0.8)"; c.fill(); }

    // Shooting stars + aurora + sapphire veil (preserved)
    { const isActiveMeteor = settings.showMeteorArcs && METEOR_ARCS.some(ma => Math.abs(sol.orbitalAngle-ma.angle)<ma.width*2); const spawnProb = isActiveMeteor?0.005:0.0008;
      if (Math.random()<spawnProb) { const activeArc = METEOR_ARCS.find(ma => Math.abs(sol.orbitalAngle-ma.angle)<ma.width*2); const sColor = activeArc?activeArc.color:"#ffffff"; const edgeAngle = Math.random()*TAU; const edgeDist = aR*1.35; _meteorStreaks.push({ x: cx+edgeDist*Math.cos(edgeAngle), y: cy+edgeDist*Math.sin(edgeAngle), vx: Math.cos(Math.atan2(cy-(cy+edgeDist*Math.sin(edgeAngle)),cx-(cx+edgeDist*Math.cos(edgeAngle)))+(Math.random()-0.5)*0.8)*(200+Math.random()*140), vy: Math.sin(Math.atan2(cy-(cy+edgeDist*Math.sin(edgeAngle)),cx-(cx+edgeDist*Math.cos(edgeAngle)))+(Math.random()-0.5)*0.8)*(200+Math.random()*140), born: t, life: 280+Math.random()*120, color: sColor }); }
      _meteorStreaks = _meteorStreaks.filter(s => t-s.born<s.life);
      _meteorStreaks.forEach(s => { const age = (t-s.born)/s.life; const elapsed = (t-s.born)/1000; const hx = s.x+s.vx*elapsed; const hy = s.y+s.vy*elapsed; const tailLen = 16*(1-age); const tx = hx-s.vx*tailLen/200; const ty = hy-s.vy*tailLen/200; const hexC = s.color.replace(/^#(..)(..)(..)/, (_,r,g,b) => `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},`); const mg = c.createLinearGradient(tx,ty,hx,hy); mg.addColorStop(0,hexC+"0)"); mg.addColorStop(0.5,hexC+`${(1-age)*0.45})`); mg.addColorStop(1,hexC+`${(1-age)*0.75})`); c.beginPath(); c.moveTo(tx,ty); c.lineTo(hx,hy); c.strokeStyle = mg; c.lineWidth = 1.1*(1-age); c.stroke(); c.beginPath(); c.arc(hx,hy,0.9,0,TAU); c.fillStyle = `rgba(255,250,240,${(1-age)*0.9})`; c.fill(); });
    }

    if (_globalKp >= 3) { c.save(); c.globalCompositeOperation = "screen"; const kpAmp = Math.min(14,_globalKp*1.8); const innerRadii = [aR*0.45,aR*0.52,aR*0.59]; innerRadii.forEach((baseR,ribbonIdx) => { c.beginPath(); orbitPts.forEach((op,i) => { const angle = Math.atan2(op.y-cy,op.x-cx); const waveOffset = _smoothNoise(i*0.03+t/4000+ribbonIdx*2.1)*kpAmp; const r2 = baseR+waveOffset; const px = cx+r2*Math.cos(angle); const py = cy+r2*Math.sin(angle); if (i===0) c.moveTo(px,py); else c.lineTo(px,py); }); c.closePath(); const opacity = Math.min(0.18,(_globalKp-2)*0.025); c.strokeStyle = (ribbonIdx<2||_globalKp<6)?`rgba(40,220,120,${opacity})`:`rgba(160,80,255,${opacity})`; c.lineWidth = 1.2; c.stroke(); }); c.restore(); }

    { const { w: vW, h: vH } = containerSize; const veil = c.createRadialGradient(cx,cy,Math.min(vW,vH)*0.28,cx,cy,Math.max(vW,vH)*0.65); veil.addColorStop(0,"rgba(0,0,0,0)"); veil.addColorStop(0.7,"rgba(2,4,12,0)"); veil.addColorStop(1,"rgba(2,4,12,0.55)"); c.fillStyle = veil; c.fillRect(0,0,vW,vH); }
  }, [now, sol, lun, containerSize, orbitGeometry, orbitPts, earthPos, selectedPos, visibleFyrtarnDates, milestones, settings, meteorOn, seasonsOn]);

  const drawHudLayer = useCallback(() => {
    const cv = cvHudRef.current; if (!cv) return;
    const { w, h } = containerSize; cv.width = w; cv.height = h;
    const c = cv.getContext("2d")!; c.clearRect(0, 0, w, h);
    const { cx, cy } = orbitGeometry; const p = earthPos; const t = now.getTime();

    const tailLen = 6+8*((p.speed-orbitSpeed(SEMI_MAJOR*(1+ECCENTRICITY)))/(orbitSpeed(SEMI_MAJOR*(1-ECCENTRICITY))-orbitSpeed(SEMI_MAJOR*(1+ECCENTRICITY))));
    const todayDoy = Math.floor((Number(now)-Number(new Date(now.getFullYear(),0,0)))/86400000);
    for (let i = 1; i <= tailLen; i++) { const prevIdx = Math.max(0,todayDoy-i); const pp = orbitPts[prevIdx]; if (!pp) continue; c.beginPath(); c.arc(pp.x,pp.y,1.5-i*0.1,0,TAU); c.fillStyle = `rgba(96,165,250,${(1-i/tailLen)*0.4})`; c.fill(); }

    const speedFactor = (p.speed-orbitSpeed(SEMI_MAJOR*(1+ECCENTRICITY)))/(orbitSpeed(SEMI_MAJOR*(1-ECCENTRICITY))-orbitSpeed(SEMI_MAJOR*(1+ECCENTRICITY)));
    const pulseFreq = 900-300*speedFactor;
    const glowBreath = 18+8*speedFactor+4*Math.sin(t/pulseFreq);
    const earthGlow = c.createRadialGradient(p.x,p.y,0,p.x,p.y,glowBreath); earthGlow.addColorStop(0,`rgba(96,165,250,${0.45+0.2*speedFactor})`); earthGlow.addColorStop(0.5,"rgba(50,120,220,0.2)"); earthGlow.addColorStop(1,"rgba(30,80,200,0)"); c.beginPath(); c.arc(p.x,p.y,glowBreath,0,TAU); c.fillStyle = earthGlow; c.fill();
    // Earth: dark realistic layered render
    { const eR = 7;
      // Ocean base — deep navy
      c.save();
      c.beginPath(); c.arc(p.x, p.y, eR, 0, TAU); c.clip();
      c.beginPath(); c.arc(p.x, p.y, eR, 0, TAU);
      c.fillStyle = "#0d3d6b"; c.fill();
      // Landmass patches — muted green
      c.fillStyle = "#1e5c2e";
      c.beginPath(); c.arc(p.x - 1, p.y - 2, 3.5, 0.2, 2.2); c.fill();
      c.beginPath(); c.arc(p.x + 2, p.y + 1, 2.8, 3.5, 5.8); c.fill();
      c.beginPath(); c.arc(p.x - 2, p.y + 2, 2.2, 1.0, 3.4); c.fill();
      // Terminator shadow — right-half dark overlay
      c.fillStyle = "rgba(0,0,0,0.3)";
      c.beginPath(); c.arc(p.x, p.y, eR, -Math.PI / 2, Math.PI / 2); c.fill();
      c.restore();
      // Atmosphere glow — starts at edge of sphere, fades to 11px
      const atmoGrad = c.createRadialGradient(p.x, p.y, eR, p.x, p.y, 11);
      atmoGrad.addColorStop(0, "rgba(80,160,255,0.35)");
      atmoGrad.addColorStop(1, "rgba(80,160,255,0)");
      c.beginPath(); c.arc(p.x, p.y, 11, 0, TAU); c.fillStyle = atmoGrad; c.fill();
    }

    // Moon orbiting Earth dot
    { const moonAngle = lun.phase * TAU;
      const moonOrbitR = 13;
      const mx = p.x + moonOrbitR * Math.cos(moonAngle);
      const my = p.y + moonOrbitR * Math.sin(moonAngle);
      // Faint orbit ring
      c.beginPath(); c.arc(p.x, p.y, moonOrbitR, 0, TAU);
      c.strokeStyle = "rgba(255,255,255,0.15)"; c.lineWidth = 0.6; c.stroke();
      // Moon glow
      const moonGlow = c.createRadialGradient(mx, my, 0, mx, my, 5);
      moonGlow.addColorStop(0, "rgba(255,255,255,0.4)");
      moonGlow.addColorStop(1, "rgba(255,255,255,0)");
      c.beginPath(); c.arc(mx, my, 5, 0, TAU); c.fillStyle = moonGlow; c.fill();
      // Moon body
      c.beginPath(); c.arc(mx, my, 2.5, 0, TAU);
      c.fillStyle = "rgba(255,255,255,0.9)"; c.fill();
    }

    // EARTH label — radially outward, 14px from dot, collision-avoid against orbital labels
    { const eAngle = Math.atan2(p.y - cy, p.x - cx);
      let labelX = p.x + 14 * Math.cos(eAngle);
      let labelY = p.y + 14 * Math.sin(eAngle);
      for (let attempt = 0; attempt < 6; attempt++) {
        const hasCollision = labelBBoxRef.current.some(l => Math.sqrt((labelX-l.x)**2+(labelY-l.y)**2) < 30);
        if (!hasCollision) break;
        labelX += 14 * Math.cos(eAngle);
        labelY += 14 * Math.sin(eAngle);
      }
      c.save();
      c.fillStyle = "rgba(255,255,255,0.85)";
      c.font = "10px 'DM Sans',system-ui";
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("Earth", labelX, labelY);
      c.restore();
    }

    const sunX = orbitGeometry.cx-orbitGeometry.focusOffset; const sunY = orbitGeometry.cy;
    { const windNorm = Math.max(0,Math.min(1,(_solarWindSpeed-300)/500)); const coronaR = 14+14*windNorm; const pulseRate = 1200-400*windNorm; const coronaPulse = 0.8+0.2*Math.sin(t/pulseRate); const coronaAlpha = windNorm<0.3?0.45*coronaPulse:windNorm<0.7?0.52*coronaPulse:0.62*coronaPulse; const sunGlow = c.createRadialGradient(sunX,sunY,0,sunX,sunY,coronaR); sunGlow.addColorStop(0,`rgba(255,240,180,${coronaAlpha})`); sunGlow.addColorStop(0.5,`rgba(255,200,80,${coronaAlpha*0.28})`); sunGlow.addColorStop(1,"rgba(255,180,60,0)"); c.beginPath(); c.arc(sunX,sunY,coronaR,0,TAU); c.fillStyle = sunGlow; c.fill(); c.beginPath(); c.arc(sunX,sunY,5,0,TAU); c.fillStyle = "rgba(255,240,180,0.75)"; c.fill(); }

    // Solar flare flash — expanding ring across entire canvas
    if (_lastFlareFlashMs > 0) {
      const flareAge = (t - _lastFlareFlashMs) / 1000; // seconds
      if (flareAge < 4.0) {
        const progress = flareAge / 4.0;
        const maxR = Math.max(w, h) * 0.7;
        const ringR = progress * maxR;
        const ringAlpha = (1 - progress) * 0.12;
        c.save(); c.globalCompositeOperation = "screen";
        c.beginPath(); c.arc(sunX, sunY, ringR, 0, TAU);
        c.strokeStyle = `rgba(255,200,80,${ringAlpha})`; c.lineWidth = 3 * (1 - progress); c.stroke();
        c.beginPath(); c.arc(sunX, sunY, ringR * 0.95, 0, TAU);
        c.strokeStyle = `rgba(255,160,40,${ringAlpha * 0.5})`; c.lineWidth = 6 * (1 - progress); c.stroke();
        c.restore();
      }
    }

    if (settings.labelDensity !== "minimal") { c.fillStyle = "rgba(160,200,255,0.55)"; c.font = "9px 'DM Mono',monospace"; c.textAlign = "center"; c.fillText("NOW",p.x,p.y+24); }
  }, [now, lun, containerSize, orbitGeometry, orbitPts, earthPos, settings.labelDensity]);

  // ─── RAF LOOP ────────────────────────────────────────────────────
  const draw = useCallback(() => {
    if (containerSize.w < 10 || containerSize.h < 10) { afRef.current = requestAnimationFrame(draw); return; }
    if (starsBuiltRef.current?.w !== containerSize.w) drawStarLayer();
    drawOrbitalLayer(); drawHudLayer();
    afRef.current = requestAnimationFrame(draw);
  }, [containerSize, drawStarLayer, drawOrbitalLayer, drawHudLayer, zodiacLoaded]);

  useEffect(() => {
    if (viewMode !== "orbital") return;
    afRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(afRef.current);
  }, [draw, viewMode]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { cx, cy, aR, bR, focusOffset } = orbitGeometry;
    const sunX = cx - focusOffset;
    const sunY = cy;
    const yearFrac = (Number(now) - Number(new Date(now.getFullYear(), 0, 0))) / (365.25 * 86400000);
    type Hit = { dist: number; title: string; body: string };
    let closest: Hit | null = null;
    const check = (x: number, y: number, hitR: number, title: string, body: string) => {
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (dist < hitR && (!closest || dist < closest.dist)) closest = { dist, title, body };
    };
    check(sunX, sunY, 20, "☉ THE SUN", "Our star at the orbital focus · 4.6 billion years old · 1.4 million km diameter");
    check(earthPos.x, earthPos.y, 20, "⊕ EARTH", `Sol ${solDay} / ${solTotal} · Orbital speed ~${(earthPos.speed / 1000).toFixed(1)} km/s`);
    const planetGlyphs: Record<string, string> = { mercury: "☿", venus: "♀", mars: "♂" };
    const planetBodies: Record<string, string> = {
      mercury: "Orbital period: 88 days · Closest planet to the Sun · Extreme temperature swings",
      venus:   "Orbital period: 225 days · Hottest planet · Dense CO₂ atmosphere · 462°C surface",
      mars:    "Orbital period: 687 days · The Red Planet · Home of Olympus Mons · Two small moons",
    };
    Object.entries(PLANET_DATA).forEach(([name, data]) => {
      if (name === "earth") return;
      const pOrbitR = aR * data.a;
      const angle = -(yearFrac / data.p) * TAU - Math.PI / 2;
      const px = sunX + pOrbitR * Math.cos(angle);
      const py = sunY + pOrbitR * (bR / aR) * Math.sin(angle);
      check(px, py, 20, `${planetGlyphs[name] || ""} ${name.toUpperCase()}`, planetBodies[name] || "");
    });
    const fyrtarnDesc: Record<string, string> = {
      Perihelion: "Earth's closest approach to the Sun · ~147.1 million km",
      Imbolc: "Celtic cross-quarter day · Midpoint of winter · First signs of spring",
      Equinox: "Equal day and night · Sun crosses the celestial equator",
      Beltane: "Celtic fire festival · Midpoint between equinox and solstice",
      Apogalaxy: "Earth farthest from the Milky Way galactic plane",
      Solstice: "Sun at greatest declination · Longest or shortest day of the year",
      Lammas: "Celtic harvest festival · Midpoint of summer",
      Perigalaxy: "Earth closest to the Milky Way galactic plane",
    };
    visibleFyrtarnDates.forEach(f => {
      const doy = Math.floor((Number(f.dateObj) - Number(new Date(f.dateObj.getFullYear(), 0, 0))) / 86400000);
      const ptIdx = Math.min(doy - 1, orbitPts.length - 1);
      if (ptIdx < 0) return;
      const p = orbitPts[ptIdx];
      const dateStr = f.dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });
      check(p.x, p.y, 16, `${f.glyph} ${f.name.toUpperCase()}`, `${dateStr} · ${fyrtarnDesc[f.name] || ""}`);
    });
    const showerInfo: Record<string, string> = {
      Lyrids: "Comet Thatcher · Apr 22 peak · ~20 meteors/hr",
      "Eta Aquariids": "Halley's Comet · May 6 peak · ~50 meteors/hr",
      Perseids: "Comet Swift-Tuttle · Aug 12 peak · ~100 meteors/hr",
      Orionids: "Halley's Comet · Oct 21 peak · ~25 meteors/hr",
      Leonids: "Comet Tempel-Tuttle · Nov 17 peak · ~15 meteors/hr",
      Geminids: "Asteroid 3200 Phaethon · Dec 14 peak · ~120 meteors/hr",
    };
    METEOR_SHOWER_BANDS.forEach(ms => {
      const ptIdx = Math.min(Math.max(0, ms.peakDoy - 1), orbitPts.length - 2);
      const p = orbitPts[ptIdx];
      const outAngle = Math.atan2(p.y - cy, p.x - cx);
      check(p.x + Math.cos(outAngle) * 7, p.y + Math.sin(outAngle) * 7, 16, `✦ ${ms.name.toUpperCase()}`, showerInfo[ms.name] || "Meteor shower");
    });
    if (zodiacOn) {
      const zodiacR = aR * 1.85;
      const imgSize = Math.max(34, Math.min(58, aR * 0.192));
      const signInfo: Record<string, string> = {
        Aries: "Mar 21 – Apr 19 · The Ram · Fire sign",
        Taurus: "Apr 20 – May 20 · The Bull · Earth sign",
        Gemini: "May 21 – Jun 20 · The Twins · Air sign",
        Cancer: "Jun 21 – Jul 22 · The Crab · Water sign",
        Leo: "Jul 23 – Aug 22 · The Lion · Fire sign",
        Virgo: "Aug 23 – Sep 22 · The Maiden · Earth sign",
        Libra: "Sep 23 – Oct 22 · The Scales · Air sign",
        Scorpio: "Oct 23 – Nov 21 · The Scorpion · Water sign",
        Sagittarius: "Nov 22 – Dec 21 · The Archer · Fire sign",
        Capricorn: "Dec 22 – Jan 19 · The Sea Goat · Earth sign",
        Aquarius: "Jan 20 – Feb 18 · The Water Bearer · Air sign",
        Pisces: "Feb 19 – Mar 20 · The Fish · Water sign",
      };
      ZODIAC_SIGNS.forEach(z => {
        const angle = (-(z.midDay / 365) * 360 - 90) * DEG;
        const zx = cx + zodiacR * Math.cos(angle);
        const zy = cy + zodiacR * (bR / aR) * Math.sin(angle);
        check(zx, zy, imgSize / 2 + 4, z.name.toUpperCase(), signInfo[z.name] || "Zodiac sign");
      });
    }
    {
      const sagIdx = ZODIAC_SIGNS.findIndex(z => z.name === "Sagittarius");
      if (sagIdx >= 0) {
        const sagAngle = (-(ZODIAC_SIGNS[sagIdx].midDay / 365) * 360 - 90) * DEG;
        const baseR = zodiacOn ? aR * 1.85 + Math.max(34, Math.min(58, aR * 0.192)) / 2 + 12 : aR * 1.55;
        const amx = cx + (baseR + 15) * Math.cos(sagAngle);
        const amy = cy + (baseR + 15) * (bR / aR) * Math.sin(sagAngle);
        check(amx, amy, 20, "✦ MILKY WAY CORE", "Direction toward the galactic center · Constellation Sagittarius · ~26,000 light-years away");
      }
    }
    if (closest) {
      const TW = 260, TH = 72;
      const { w, h } = containerSize;
      let tx = mx + 14;
      let ty = my - 44;
      if (tx + TW > w - 8) tx = mx - TW - 14;
      if (ty < 8) ty = my + 14;
      if (ty + TH > h - 8) ty = h - TH - 8;
      setTooltip({ x: tx, y: ty, title: (closest as Hit).title, body: (closest as Hit).body });
    } else {
      setTooltip(null);
    }
  }, [orbitGeometry, now, earthPos, solDay, solTotal, orbitPts, visibleFyrtarnDates, zodiacOn, containerSize]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX-rect.left; const my = e.clientY-rect.top;
    // Check milestone dot clicks first
    for (const m of milestones) {
      const parts = m.date.split(".");
      if (parts.length !== 2) continue;
      const dd = parseInt(parts[0], 10), mm2 = parseInt(parts[1], 10);
      if (isNaN(dd) || isNaN(mm2)) continue;
      const d = new Date(now.getFullYear(), mm2 - 1, dd);
      const doy = Math.floor((Number(d) - Number(new Date(d.getFullYear(), 0, 0))) / 86400000);
      const ptIdx = Math.min(Math.max(0, doy - 1), orbitPts.length - 1);
      const p = orbitPts[ptIdx];
      if (!p) continue;
      if (Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2) < 14) {
        setClickedMilestone({ id: m.id, x: mx, y: my });
        return;
      }
    }
    setClickedMilestone(null);
    // Regular orbit date selection
    let minDist = Infinity, bestIdx = -1;
    orbitPts.forEach((p,i) => { const d = Math.sqrt((p.x-mx)**2+(p.y-my)**2); if (d<minDist&&d<28) { minDist = d; bestIdx = i; } });
    if (bestIdx >= 0) { const d = new Date(now.getFullYear(),0,bestIdx+1); setSelectedDate(d); }
  }, [orbitPts, now, milestones]);

  // Moment triggers
  const prevKmMilestoneRef = useRef(0);
  useEffect(() => { if (settings.momentFrequency==="off") return; const kmMilestones = [100000,500000,1000000,5000000]; for (const m of kmMilestones) { if (prevKmMilestoneRef.current<m&&kmTraveled>=m) { setMomentIdx(i=>i+1); prevKmMilestoneRef.current = m; break; } } }, [kmTraveled, settings.momentFrequency]);

  const momentText = useMemo(() => { if (settings.momentFrequency==="off") return ""; return getMoment(kmTraveled, momentIdx); }, [kmTraveled, momentIdx, settings.momentFrequency]);
  const kmFormatted = kmTraveled >= 1e6 ? `${(kmTraveled/1e6).toFixed(2)}M km` : kmTraveled >= 1000 ? `${(kmTraveled/1000).toFixed(1)}k km` : `${Math.round(kmTraveled).toLocaleString()} km`;

  const nextFyrtarn = useMemo(() => {
    const todayMs = now.getTime();
    return visibleFyrtarnDates.map(f => ({ ...f, diff: f.dateObj.getTime()-todayMs })).filter(f => f.diff>0).sort((a,b) => a.diff-b.diff)[0];
  }, [visibleFyrtarnDates, now]);

  const moonPhaseText = useMemo(() => {
    const p = lun.phase;
    if (p<0.03||p>0.97) return "🌑 New Moon"; if (p<0.22) return "🌒 Waxing Crescent"; if (p<0.28) return "🌓 First Quarter";
    if (p<0.47) return "🌔 Waxing Gibbous"; if (p<0.53) return "🌕 Full Moon"; if (p<0.72) return "🌖 Waning Gibbous";
    if (p<0.78) return "🌗 Last Quarter"; return "🌘 Waning Crescent";
  }, [lun.phase]);

  const canvasStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" };

  // Watch button style helper
  const wBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: 16, cursor: "pointer", fontSize: 10,
    fontFamily: "'DM Sans',system-ui", letterSpacing: ".4px", whiteSpace: "nowrap",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    background: active ? "rgba(50,100,200,.28)" : "rgba(8,12,25,.92)",
    border: active ? "1px solid rgba(80,150,255,.45)" : "1px solid rgba(110,140,190,.22)",
    color: active ? "rgba(160,200,255,.9)" : "rgba(160,180,210,.6)",
    transition: "all 0.15s ease",
  });

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#000000", fontFamily: "'DM Sans',system-ui", color: "rgba(200,220,255,0.88)", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── FULL-SCREEN CANVAS ──────────────────────────────── */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }}>
        <canvas ref={cvStarsRef} style={{ ...canvasStyle, zIndex: 1 }} />
        <canvas ref={cvOrbitRef} style={{ ...canvasStyle, zIndex: 2 }} />
        <canvas ref={cvHudRef} onClick={handleCanvasClick} onMouseMove={handleCanvasMouseMove} onMouseLeave={() => setTooltip(null)} style={{ ...canvasStyle, zIndex: 3, cursor: "crosshair" }} />
      </div>

      {/* Onboarding */}
      {showOnboarding && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", animation: "onboardFade 4.2s ease forwards" }}>
          <div style={{ background: "rgba(6,10,22,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(50,80,140,0.25)", borderRadius: 12, padding: "16px 28px", display: "flex", gap: 28, alignItems: "center" }}>
            {[{ icon: "🌍", label: "Earth's orbit · click to navigate" }, { icon: "☉", label: "Sun at focus · planets in motion" }, { icon: "✦", label: "Milestones · spectral arcs", color: "rgba(150,170,220,0.5)" }].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}><div style={{ fontSize: 18, marginBottom: 4, color: item.color || "inherit" }}>{item.icon}</div><div style={{ fontSize: 9, color: "rgba(120,150,200,0.65)", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{item.label}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* ── BOTTOM-LEFT HUD — SOL / date / time / daylight / moon ── */}
      {isMounted && (
        <div style={{ position: "absolute", bottom: 80, left: 24, zIndex: 10 }}>
          <div style={{ fontSize: 10, color: "rgba(100,130,180,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans',system-ui" }}>
            {now.toLocaleDateString("en-US", { weekday: "long" })}
          </div>
          {/* SOL — hoverable for tooltip */}
          <div
            style={{ position: "relative", display: "inline-block", cursor: "default" }}
            onMouseEnter={() => setSolTooltipVisible(true)}
            onMouseLeave={() => setSolTooltipVisible(false)}
          >
            <div style={{ fontSize: 20, fontWeight: 200, color: "rgba(255,255,255,0.92)", letterSpacing: "2px", fontVariantNumeric: "tabular-nums", fontFamily: "'DM Sans',system-ui", lineHeight: 1.1 }}>
              SOL {String(solDay).padStart(3, "0")}
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginLeft: 4, fontWeight: 300 }}>/ {solTotal}</span>
            </div>
            {solTooltipVisible && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 8px)", left: 0,
                zIndex: 50, pointerEvents: "none",
                background: "rgba(6,10,22,0.92)",
                border: "0.7px solid rgba(90,130,195,0.3)",
                borderRadius: 8, padding: "10px 12px",
                maxWidth: 260, width: 260,
                boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
              }}>
                <div style={{ fontWeight: 500, fontSize: 13, fontFamily: "'DM Mono',monospace", color: "rgba(175,205,255,0.95)", marginBottom: 5 }}>What is a Sol?</div>
                <div style={{ fontWeight: 400, fontSize: 11, fontFamily: "'DM Sans',system-ui", color: "rgba(180,200,235,0.80)", lineHeight: 1.55 }}>A Sol is one solar day — the time it takes Earth to complete one full rotation relative to the Sun. One Sol equals 24 hours. Sol {String(solDay).padStart(3, "0")} means today is the {solDay}th day of {now.getFullYear()}. The term Sol is also used on Mars where one Martian Sol lasts 24 hours and 37 minutes — slightly longer than an Earth day.</div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", letterSpacing: 0.5, marginBottom: 4, fontFamily: "'DM Sans',system-ui" }}>
            {now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
          <div style={{ fontSize: 30, fontWeight: 200, color: "rgba(255,255,255,0.90)", letterSpacing: "2px", fontFamily: "'DM Sans',system-ui", marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
            {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
          </div>
          {/* Daylight bar */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "rgba(255,255,255,0.65)", marginBottom: 3, letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", width: 120 }}>
              <span>Daylight</span><span>{dayLength.toFixed(1)}h</span>
            </div>
            <div style={{ height: 2, width: 120, borderRadius: 1, background: "rgba(20,35,75,0.6)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, Math.round((dayLength / 24) * 100)))}%`, background: "linear-gradient(90deg,rgba(255,180,60,0.5),rgba(255,220,100,0.7))", borderRadius: 1 }} />
            </div>
          </div>
          {/* Moon phase */}
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", letterSpacing: "0.5px", fontFamily: "'DM Sans',system-ui" }}>
            {moonPhaseText}
          </div>
        </div>
      )}

      {/* Branding — bottom-left engraving */}
      {isMounted && <div style={{ position: "absolute", bottom: 16, left: 20, zIndex: 10 }}>
        <div style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(60,90,140,0.25)" }}>Earth Moves</div>
        <div style={{ fontSize: 7, letterSpacing: "1.5px", color: "rgba(40,65,110,0.18)", marginTop: 1 }}>ORBITAL CALENDAR</div>
      </div>}

      {/* Bottom-right — distance + info icon */}
      {isMounted && <div style={{ position: "absolute", bottom: 16, right: 20, zIndex: 10, display: "flex", alignItems: "flex-end", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "rgba(96,165,250,0.35)", letterSpacing: "0.3px", fontVariantNumeric: "tabular-nums" }}>{kmFormatted}</div>
          <div style={{ fontSize: 7, color: "rgba(40,65,110,0.25)", letterSpacing: "0.3px" }}>traveled this session</div>
        </div>
        <button
          onClick={() => setShowInfoTip(v => !v)}
          style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(15,25,55,0.4)", border: "1px solid rgba(50,80,140,0.25)", color: "rgba(80,120,200,0.45)", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
        >ⓘ</button>
      </div>}

      {/* Info tooltip */}
      {showInfoTip && isMounted && (
        <div style={{ position: "absolute", bottom: 48, right: 20, zIndex: 20, maxWidth: 280, padding: "10px 14px", borderRadius: 8, background: "rgba(8,14,30,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(50,80,140,0.2)" }}>
          <div style={{ fontSize: 10, color: "rgba(160,190,240,0.65)", lineHeight: 1.6, letterSpacing: "0.2px", fontStyle: "italic" }}>{momentText}</div>
          <button onClick={() => setShowInfoTip(false)} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "rgba(80,110,165,0.4)", cursor: "pointer", fontSize: 12, padding: 0 }}>×</button>
        </div>
      )}

      {/* ── CUSTOMIZE BUTTON + PANEL — bottom center ── */}
      {isMounted && (
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 8, zIndex: 20 }}>
          <button onClick={() => setShowCustomize(v => !v)} style={wBtnStyle(showCustomize)}>
            {showCustomize ? "Close" : "⚙ Customize"}
          </button>
          {showCustomize && (
            <div style={{ background: "rgba(8,12,25,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(65,85,125,0.18)", borderRadius: 12, padding: 16, maxHeight: "55vh", overflowY: "auto", minWidth: 300 }}>
              {/* Toggle buttons */}
              <div style={{ fontSize: 8, color: "rgba(125,145,180,0.45)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 8 }}>View Options</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
                <button onClick={() => setZodiacOn(v => !v)} style={wBtnStyle(zodiacOn)}>Zodiac {zodiacOn ? "On" : "Off"}</button>
                <button onClick={() => setCelticOn(v => !v)} style={wBtnStyle(celticOn)}>Celtic {celticOn ? "On" : "Off"}</button>
                <button onClick={() => setMeteorOn(v => !v)} style={wBtnStyle(meteorOn)}>Meteors {meteorOn ? "On" : "Off"}</button>
                <button onClick={() => setSeasonsOn(v => !v)} style={wBtnStyle(seasonsOn)}>Seasons {seasonsOn ? "On" : "Off"}</button>
              </div>

              {/* Upcoming events */}
              {(() => {
                const fyrtarnItems = visibleFyrtarnDates
                  .filter(f => f.dateObj.getTime() > now.getTime())
                  .map(f => ({ type: "fyrtarn" as const, name: f.name, glyph: f.glyph, color: f.color, dateObj: f.dateObj, daysAway: Math.ceil((f.dateObj.getTime() - now.getTime()) / 86400000) }));
                const milestoneItems = milestones.flatMap(m => {
                  const parts = m.date.split(".");
                  if (parts.length !== 2) return [];
                  const dd = parseInt(parts[0], 10), mm2 = parseInt(parts[1], 10);
                  if (isNaN(dd) || isNaN(mm2)) return [];
                  const yr = now.getFullYear();
                  const d = new Date(yr, mm2 - 1, dd);
                  const daysAway = Math.ceil((d.getTime() - now.getTime()) / 86400000);
                  if (daysAway > 0) return [{ type: "milestone" as const, name: m.shortName, glyph: "◇", color: "#FFD060", dateObj: d, daysAway }];
                  if (m.repetition === "Annual") {
                    const nextY = new Date(yr + 1, mm2 - 1, dd);
                    return [{ type: "milestone" as const, name: m.shortName, glyph: "◇", color: "#FFD060", dateObj: nextY, daysAway: Math.ceil((nextY.getTime() - now.getTime()) / 86400000) }];
                  }
                  return [];
                });
                const combined = [...fyrtarnItems, ...milestoneItems].sort((a, b) => a.daysAway - b.daysAway).slice(0, 6);
                if (combined.length === 0) return null;
                return (
                  <div style={{ borderTop: "1px solid rgba(110,140,190,0.10)", paddingTop: 12, marginTop: 12 }}>
                    <div style={{ fontSize: 8, color: "rgba(195,210,245,0.5)", textTransform: "uppercase", letterSpacing: "1.8px", marginBottom: 8, fontWeight: 500 }}>Upcoming</div>
                    {combined.map((item, idx) => (
                      <div key={`upcoming-${idx}`} style={{ padding: "7px 10px", marginBottom: 5, borderRadius: 8, background: "rgba(8,12,25,.88)", border: `1px solid ${item.type === "milestone" ? "rgba(255,255,255,.18)" : "rgba(110,140,190,.18)"}`, fontSize: 10 }}>
                        <div style={{ color: item.color, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12 }}>{item.glyph}</span>
                          <span style={{ textTransform: "uppercase", letterSpacing: "1px", fontSize: 9 }}>{item.name}</span>
                          <span style={{ marginLeft: "auto", fontSize: 9.5, color: "rgba(210,225,255,0.85)", fontVariantNumeric: "tabular-nums" }}>{item.daysAway}d</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}




      {/* ── FLOATING "+" MILESTONE BUTTON ── */}
      {isMounted && (
        <button
          onClick={() => setShowMilestoneModal(true)}
          style={{ position: "fixed", bottom: 24, right: 24, width: 48, height: 48, borderRadius: "50%", background: "rgba(8,12,25,0.92)", border: "1px solid rgba(90,130,195,0.4)", color: "rgba(175,205,255,0.9)", fontSize: 24, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >+</button>
      )}

      {/* ── ADD MILESTONE MODAL ── */}
      {showMilestoneModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowMilestoneModal(false); }}
        >
          <div style={{ background: "rgba(8,12,25,0.96)", border: "1px solid rgba(90,130,195,0.25)", borderRadius: 16, padding: 24, maxWidth: 360, width: "calc(100% - 48px)", boxShadow: "0 8px 40px rgba(0,0,0,0.7)" }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.92)", marginBottom: 20, fontFamily: "'DM Sans',system-ui" }}>Add Milestone</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                placeholder="Short name"
                maxLength={12}
                value={newMilestone.shortName}
                onChange={e => setNewMilestone(m => ({...m, shortName: e.target.value}))}
                style={{ background: "rgba(15,25,55,0.6)", border: "1px solid rgba(90,130,195,0.25)", borderRadius: 8, padding: "10px 12px", color: "rgba(220,235,255,0.9)", fontSize: 13, outline: "none", fontFamily: "'DM Sans',system-ui" }}
              />
              <textarea
                placeholder="What does this milestone mean?"
                maxLength={100}
                value={newMilestone.description}
                onChange={e => setNewMilestone(m => ({...m, description: e.target.value}))}
                style={{ background: "rgba(15,25,55,0.6)", border: "1px solid rgba(90,130,195,0.25)", borderRadius: 8, padding: "10px 12px", color: "rgba(220,235,255,0.9)", fontSize: 13, outline: "none", resize: "none", height: 72, fontFamily: "'DM Sans',system-ui" }}
              />
              <input
                placeholder="e.g. 15.06"
                value={newMilestone.date}
                onChange={e => setNewMilestone(m => ({...m, date: e.target.value}))}
                style={{ background: "rgba(15,25,55,0.6)", border: "1px solid rgba(90,130,195,0.25)", borderRadius: 8, padding: "10px 12px", color: "rgba(220,235,255,0.9)", fontSize: 13, fontFamily: "'DM Mono',monospace", outline: "none" }}
              />
              <select
                value={newMilestone.repetition}
                onChange={e => setNewMilestone(m => ({...m, repetition: e.target.value as "Annual" | "One-Time"}))}
                style={{ background: "rgba(15,25,55,0.6)", border: "1px solid rgba(90,130,195,0.25)", borderRadius: 8, padding: "10px 12px", color: "rgba(220,235,255,0.9)", fontSize: 13, outline: "none" }}
              >
                <option value="Annual">Annual</option>
                <option value="One-Time">One-Time</option>
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={() => {
                  if (!newMilestone.shortName.trim() || !newMilestone.date.trim()) return;
                  const parts = newMilestone.date.split(".");
                  if (parts.length !== 2 || isNaN(parseInt(parts[0])) || isNaN(parseInt(parts[1]))) return;
                  setMilestones(prev => [...prev, { id: Date.now().toString(), shortName: newMilestone.shortName.trim().slice(0, 12), description: newMilestone.description, date: newMilestone.date.trim(), repetition: newMilestone.repetition }]);
                  setNewMilestone({ shortName: "", description: "", date: "", repetition: "Annual" });
                  setShowMilestoneModal(false);
                }} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(30,80,50,0.5)", border: "1px solid rgba(60,160,100,0.4)", color: "rgba(120,220,160,0.9)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',system-ui" }}>Add</button>
                <button onClick={() => setShowMilestoneModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(15,25,55,0.5)", border: "1px solid rgba(90,130,195,0.2)", color: "rgba(140,165,210,0.7)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',system-ui" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MILESTONE CLICK POPUP ── */}
      {clickedMilestone && (() => {
        const m = milestones.find(x => x.id === clickedMilestone.id);
        if (!m) return null;
        const px = Math.min(clickedMilestone.x + 14, containerSize.w - 230);
        const py = Math.max(clickedMilestone.y - 90, 8);
        return (
          <div style={{ position: "absolute", left: px, top: py, zIndex: 40, background: "rgba(6,10,22,0.96)", border: "0.7px solid rgba(90,130,195,0.3)", borderRadius: 10, padding: "12px 14px", width: 210, boxShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
            <button onClick={() => setClickedMilestone(null)} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "rgba(120,150,200,0.5)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
            <div style={{ fontWeight: 500, fontSize: 12, fontFamily: "'DM Mono',monospace", color: "rgba(255,200,80,0.95)", marginBottom: 4, paddingRight: 16 }}>{m.shortName}</div>
            {m.description && <div style={{ fontSize: 11, color: "rgba(180,200,235,0.75)", lineHeight: 1.5, marginBottom: 8, fontFamily: "'DM Sans',system-ui" }}>{m.description}</div>}
            <div style={{ fontSize: 10, color: "rgba(140,160,200,0.55)", marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>{m.date} · {m.repetition}</div>
            <button onClick={() => { setMilestones(prev => prev.filter(x => x.id !== m.id)); setClickedMilestone(null); }} style={{ width: "100%", padding: "6px", borderRadius: 6, background: "rgba(100,20,20,0.4)", border: "1px solid rgba(200,60,60,0.35)", color: "rgba(255,120,120,0.9)", cursor: "pointer", fontSize: 10, fontFamily: "'DM Sans',system-ui" }}>Delete</button>
          </div>
        );
      })()}

      {/* ── HOVER TOOLTIP ── */}
      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y,
          zIndex: 40, pointerEvents: "none",
          background: "rgba(6,10,22,0.92)",
          border: "0.7px solid rgba(90,130,195,0.3)",
          borderRadius: 8, padding: "10px 12px",
          maxWidth: 260,
          boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontWeight: 500, fontSize: 13, fontFamily: "'DM Mono',monospace", color: "rgba(175,205,255,0.95)", marginBottom: 5, whiteSpace: "nowrap" }}>{tooltip.title}</div>
          <div style={{ fontWeight: 400, fontSize: 11, fontFamily: "'DM Sans',system-ui", color: "rgba(180,200,235,0.80)", lineHeight: 1.55, maxWidth: 240 }}>{tooltip.body}</div>
        </div>
      )}

      {showSettings && <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />}


      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: rgba(4,7,16,0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(25,45,100,0.4); border-radius: 2px; }
        button { font-family: 'DM Sans',system-ui; }
        button:hover { opacity: 0.85; transition: opacity 0.15s; }
        input, select, textarea { font-family: 'DM Sans',system-ui; color-scheme: dark; }
        select option { background: #080f22; }
        @keyframes pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes onboardFade { 0% { opacity: 0; } 10% { opacity: 1; } 75% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}
