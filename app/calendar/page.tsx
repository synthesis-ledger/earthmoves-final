"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// EARTH MOVES Ã¢â‚¬â€ CALENDAR v6.2  "The Instrument"
// "Time is not numbers on a screen. It is a planet moving through the void."
//
// v6.2 Ã¢â‚¬â€ ZODIAC CONSTELLATION RING:
//   Ã¢Å“Â¦ 12 zodiac PNG images at correct ecliptic positions beyond Mars orbit
//   Ã¢Å“Â¦ Active constellation brightens when opposite the Sun
//   Ã¢Å“Â¦ "Towards Milky Way Core" arrow near Sagittarius
//   Ã¢Å“Â¦ Orbit scaled to fit full zodiac ring (aR / 2.1)
//   Ã¢Å“Â¦ Zodiac enabled by default
//   (all v6.1 features preserved)
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ ISO WEEK NUMBER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function getISOWeek(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ REALISTIC ORBITAL DATA (AU & Years) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ KEPLERIAN ELLIPSE POINT Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function orbitalPoint(date: Date, cx: number, cy: number, aR: number, bR: number, focusOffset: number) {
  const M = meanAnomaly(date);
  const Ev = eccentricAnomaly(M, ECCENTRICITY);
  const nu = trueAnomaly(Ev, ECCENTRICITY);
  const r = heliocentricR(nu, SEMI_MAJOR, ECCENTRICITY);
  const angle = nu - Math.PI / 2;
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 8 FYRTÃƒâ€¦RN Ã¢â‚¬â€ Lighthouses Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const FYRTARN = [
  { name: "Perihelion", date: "01-03", color: "#FFD060", glyph: "Ã¢â€”â€°" },
  { name: "Imbolc",     date: "02-02", color: "#A0C8FF", glyph: "Ã¢Ââ€ž" },
  { name: "Equinox",    date: "03-20", color: "#60DDA0", glyph: "Ã¢Å¡â€“" },
  { name: "Beltane",    date: "05-01", color: "#FF9060", glyph: "Ã¢Å“Â¦" },
  { name: "Solstice",   date: "06-21", color: "#FFE040", glyph: "Ã¢Ëœâ‚¬" },
  { name: "Lammas",     date: "08-01", color: "#FFA040", glyph: "Ã¢Å“Â¦" },
  { name: "Equinox",    date: "09-22", color: "#60DDA0", glyph: "Ã¢Å¡â€“" },
  { name: "Solstice",   date: "12-21", color: "#8080FF", glyph: "Ã¢ËœÂ½" },
];

const METEOR_ARCS = [
  { name: "Perseids",  color: "#FF8040", angle: 140, width: 18, peak: "08-12" },
  { name: "Geminids",  color: "#9060FF", angle: 258, width: 22, peak: "12-14" },
  { name: "Lyrids",    color: "#40DDFF", angle: 32,  width: 14, peak: "04-22" },
  { name: "Orionids",  color: "#FFB040", angle: 208, width: 16, peak: "10-21" },
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ ZODIAC IMAGE POSITIONS (day-of-year midpoints for each sign) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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
interface CalAttendee {
  name: string;
  email: string;
  status: "accepted" | "declined" | "tentative" | "pending";
}

interface DialIn {
  number: string;
  pin: string;
}

interface CalEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  virtualLink: string;
  dialIns: DialIn[];
  attendees: CalAttendee[];
  organizer: string;
  description: string;
  reminders: number[];
  showAs: "busy" | "free" | "tentative" | "out-of-office";
  category: string;
  color: string;
  privacy: "public" | "private";
  recurrence: string;
  earthKm?: number;
}

const EVENT_COLORS = [
  "#5B8DD9", "#60C080", "#E06060", "#C080E0",
  "#E0A040", "#40C0C0", "#FF8060", "#A0D060",
];

const SAMPLE_EVENTS: CalEvent[] = [
  {
    id: "ev1", title: "Team Strategy Review",
    date: dateKey(new Date()), startTime: "09:00", endTime: "10:00",
    allDay: false, location: "Conference Room A", virtualLink: "https://zoom.us/j/123",
    dialIns: [{ number: "+47 21 98 76 54", pin: "123456" }],
    attendees: [
      { name: "Brage Johansen", email: "bragewj@gmail.com", status: "accepted" },
      { name: "Lars Horpestad", email: "lars@aithinklab.com", status: "accepted" },
    ],
    organizer: "Brage Johansen", description: "Q1 product strategy alignment session.",
    reminders: [15, 60], showAs: "busy", category: "Work",
    color: "#5B8DD9", privacy: "public", recurrence: "none",
  },
  {
    id: "ev2", title: "Deep Work Block",
    date: dateKey(new Date()), startTime: "11:00", endTime: "13:00",
    allDay: false, location: "", virtualLink: "",
    dialIns: [], attendees: [], organizer: "Lars Horpestad",
    description: "Focus time Ã¢â‚¬â€ Earth Moves v5 development.",
    reminders: [5], showAs: "out-of-office", category: "Focus",
    color: "#60C080", privacy: "private", recurrence: "none",
  },
];

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ SETTINGS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ MOMENTS CONTENT Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const MOMENT_POOL = [
  (km: string) => `Since you opened this, Earth has carried you ${km} km forward.`,
  () => "Mid-day is your peak daylight window. Schedule your most important work in the light.",
  (km: string) => `Earth has moved ${km} km since you started. Every meeting is also a journey.`,
  () => "Perihelion week: Earth is moving at its fastest. January is a high-velocity month.",
  () => "The Perseids peak in mid-August. Earth crosses the debris trail every year, same week.",
  () => "At 107,000 km/h, your next hour-long meeting will carry you 107,000 km through space.",
  () => "Shortest day in the northern hemisphere: December 21. Plan morning syncs around the light.",
  () => "Earth is now closer to the Sun than in July Ã¢â‚¬â€ about 5 million km closer.",
  () => "Geminids meteor shower peaks December 14. One of the strongest of the year.",
  (km: string) => `${km} km and counting. The planet doesn't wait Ã¢â‚¬â€ neither should your priorities.`,
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

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
//  MINI WATCH Ã¢â‚¬â€ Ported from Earth Moves v3.5 watch
//  Uses local /day.jpg + /night.jpg textures (same /public folder)
//  Stripped: no aurora, tides, satellites, empathy cities, meteors
//  Kept: globe, terminator, hour markers, clock hand, digital time,
//        moon phase icon, pole indicator
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

// Globe texture cache builder (from watch v3.5, simplified Ã¢â‚¬â€ no clouds)
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
  oc.addColorStop(0, "#1c4868");
  oc.addColorStop(.5, "#1c3f5c");
  oc.addColorStop(1, "#142640");
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
      const dayBoost = (1 - blend) * 0.20;
      const nightLift = blend * 0.65;
      const boostFactor = 1.0 + dayBoost + nightLift;
      r = Math.min(255, r * boostFactor + (1 - blend) * 14);
      g = Math.min(255, g * boostFactor * (1 - blend * 0.04) + (1 - blend) * 10);
      b = Math.min(255, b * boostFactor * (1 + blend * 0.03) + (1 - blend) * 16);

      const idx = (py * size + px) * 4;
      data[idx] = Math.round(r); data[idx + 1] = Math.round(g);
      data[idx + 2] = Math.round(b); data[idx + 3] = 255;
    }
  }

  ctx.putImageData(buf, 0, 0);
  return cache;
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
//  MINI WATCH COMPONENT Ã¢â‚¬â€ Full watch-quality in 220Ãƒâ€”220
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ LAYER 0: Deep space background Ã¢â€â‚¬Ã¢â€â‚¬
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ LAYER 2: Earth globe Ã¢â€â‚¬Ã¢â€â‚¬
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ LAYER 7: Atmosphere glow Ã¢â€â‚¬Ã¢â€â‚¬
    const ag2 = c.createRadialGradient(cx, cy, eR - 2, cx, cy, eR + 14);
    ag2.addColorStop(0, "rgba(55,125,250,0)");
    ag2.addColorStop(.42, "rgba(55,125,250,.038)");
    ag2.addColorStop(.68, "rgba(45,105,215,.052)");
    ag2.addColorStop(1, "rgba(25,55,140,0)");
    c.fillStyle = ag2;
    c.beginPath(); c.arc(cx, cy, eR + 14, 0, TAU); c.fill();

    // Ã¢â€â‚¬Ã¢â€â‚¬ LAYER 8: Clock hand Ã¢â€â‚¬Ã¢â€â‚¬
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ LAYER 9: Vernier precision rings + hour markers Ã¢â€â‚¬Ã¢â€â‚¬
    // Multiple concentric hairline rings for chronometer feel
    const vI = wR * ZM.VERNIER_INNER;
    const vO = wR * ZM.VERNIER_OUTER;
    const moonTrackR = wR * ZM.MOON_TRACK;

    // Hairline concentric rings (3 rings, varying opacity)
    [vI, (vI + vO) * 0.5, vO].forEach((r, idx) => {
      c.strokeStyle = `rgba(100,130,175,${idx === 1 ? 0.06 : 0.1})`;
      c.lineWidth = 0.3;
      c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke();
    });

    // Dedicated moon orbital track Ã¢â‚¬â€ very faint ring
    c.strokeStyle = "rgba(180,190,210,0.06)";
    c.lineWidth = 0.4;
    c.beginPath(); c.arc(cx, cy, moonTrackR, 0, TAU); c.stroke();

    // Bezel ring (outermost)
    c.strokeStyle = "rgba(115,145,195,.15)"; c.lineWidth = .6;
    c.beginPath(); c.arc(cx, cy, bz, 0, TAU); c.stroke();

    // Fine graduation tick marks Ã¢â‚¬â€ every 15 minutes
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
          // Quarter-hour ticks Ã¢â‚¬â€ very fine
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
        c.fillStyle = isMaj ? "rgba(210,225,250,.85)" : "rgba(165,185,215,.52)";
        c.font = `${isMaj ? 300 : 200} ${S * (isMaj ? .030 : .022)}px 'DM Sans',system-ui`;
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(h.toString().padStart(2, "0"), nx, ny);
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Moon fixed lower-left like your image
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ LAYER 12: Digital time + date Ã¢â‚¬â€ CENTERED "Mega Time" Ã¢â€â‚¬Ã¢â€â‚¬
    const dH = lt.getHours().toString().padStart(2, "0");
    const dM = lt.getMinutes().toString().padStart(2, "0");

    // Scrim: soft radial backdrop for contrast over any terrain
    const scrim = c.createRadialGradient(cx, cy, 0, cx, cy, S * .18);
    scrim.addColorStop(0, "rgba(0,4,14,.52)");
    scrim.addColorStop(.55, "rgba(0,4,14,.28)");
    scrim.addColorStop(1, "rgba(0,4,14,0)");
    c.fillStyle = scrim; c.beginPath(); c.arc(cx, cy, S * .18, 0, TAU); c.fill();

    // Large centered time + clean date Ã¢â‚¬â€ matches image exactly
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


// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
//  EVENT PANEL Ã¢â‚¬â€ Full Outlook-style
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function EventPanel({ event, onClose, onSave, onDelete }: {
  event: CalEvent | null;
  onClose: () => void;
  onSave: (ev: CalEvent) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<CalEvent | null>(null);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState("");

  useEffect(() => { setDraft(event ? { ...event } : null); }, [event]);

  if (!draft) return null;

  const set = (k: keyof CalEvent, v: unknown) => setDraft(d => d ? { ...d, [k]: v } : d);

  const detectPlatform = (url: string) => {
    if (url.includes("zoom.us")) return "Zoom";
    if (url.includes("teams.microsoft")) return "Teams";
    if (url.includes("meet.google")) return "Meet";
    if (url.includes("webex")) return "Webex";
    return "Join";
  };

  const earthKm = (() => {
    if (draft.startTime && draft.endTime) {
      const [sh, sm] = draft.startTime.split(":").map(Number);
      const [eh, em] = draft.endTime.split(":").map(Number);
      const mins = Math.abs((eh * 60 + em) - (sh * 60 + sm));
      return Math.round((mins / 60) * 107280 / 1000) * 1000;
    }
    return 0;
  })();

  const P: React.CSSProperties = {
    position: "fixed", top: 0, right: 0, bottom: 0,
    width: 400, background: "rgba(6,10,22,0.97)",
    backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(50,80,140,0.3)",
    display: "flex", flexDirection: "column", zIndex: 100,
    fontFamily: "'DM Sans',system-ui", color: "rgba(200,220,255,0.88)",
    overflowY: "auto",
  };
  const inputStyle: React.CSSProperties = {
    background: "rgba(15,25,55,0.7)", border: "1px solid rgba(50,80,140,0.35)",
    borderRadius: 6, color: "rgba(200,220,255,0.88)", padding: "7px 10px",
    fontSize: 12, fontFamily: "'DM Sans',system-ui", width: "100%", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, color: "rgba(100,130,180,0.6)", textTransform: "uppercase",
    letterSpacing: "1.5px", marginBottom: 4, display: "block",
  };
  const fieldBlock: React.CSSProperties = { marginBottom: 14 };

  return (
    <div style={P}>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(30,50,100,0.3)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, color: "rgba(80,120,200,0.5)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Event Details</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(120,150,200,0.5)", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>Ãƒâ€”</button>
        </div>
        <input value={draft.title} onChange={e => set("title", e.target.value)} placeholder="Add title"
          style={{ ...inputStyle, fontSize: 16, fontWeight: 300, marginTop: 10, letterSpacing: 0.3 }} />
      </div>
      <div style={{ padding: "16px 20px", flex: 1 }}>
        <div style={{ ...fieldBlock, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div><span style={labelStyle}>Date</span><input type="date" value={draft.date} onChange={e => set("date", e.target.value)} style={inputStyle} /></div>
          <div><span style={labelStyle}>Start</span><input type="time" value={draft.startTime} onChange={e => set("startTime", e.target.value)} style={inputStyle} /></div>
          <div><span style={labelStyle}>End</span><input type="time" value={draft.endTime} onChange={e => set("endTime", e.target.value)} style={inputStyle} /></div>
        </div>
        {earthKm > 0 && (
          <div style={{ ...fieldBlock, padding: "8px 11px", background: "rgba(20,40,100,0.3)", borderRadius: 6, border: "1px solid rgba(40,70,140,0.2)", fontSize: 10, color: "rgba(96,165,250,0.6)", fontFamily: "'DM Sans',system-ui" }}>
            Ã°Å¸Å’Â Earth travels ~{earthKm.toLocaleString()} km during this meeting
          </div>
        )}
        <div style={{ ...fieldBlock, display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={draft.allDay} onChange={e => set("allDay", e.target.checked)} style={{ accentColor: "#5B8DD9" }} />
            <span style={{ fontSize: 11, color: "rgba(140,170,220,0.65)" }}>All day</span>
          </label>
        </div>
        <div style={fieldBlock}><span style={labelStyle}>Location</span>
          <input value={draft.location} onChange={e => set("location", e.target.value)} placeholder="Add location" style={inputStyle} />
          {draft.location && <button style={{ fontSize: 9, color: "rgba(96,165,250,0.5)", background: "none", border: "none", cursor: "pointer", padding: "2px 0", marginTop: 2 }}
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(draft.location)}`, "_blank")}>Open in Maps Ã¢â€ â€™</button>}
        </div>
        <div style={fieldBlock}><span style={labelStyle}>Virtual Link</span>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={draft.virtualLink} onChange={e => set("virtualLink", e.target.value)} placeholder="Zoom / Teams / Meet URL" style={{ ...inputStyle, flex: 1 }} />
            {draft.virtualLink && <button onClick={() => window.open(draft.virtualLink, "_blank")}
              style={{ background: "rgba(30,80,180,0.3)", border: "1px solid rgba(50,120,220,0.3)", borderRadius: 6, color: "rgba(140,185,255,0.8)", cursor: "pointer", padding: "0 10px", fontSize: 10, whiteSpace: "nowrap" }}>{detectPlatform(draft.virtualLink)} Ã¢â€ â€™</button>}
          </div>
        </div>
        {draft.dialIns.length > 0 && <div style={fieldBlock}><span style={labelStyle}>Dial-in</span>
          {draft.dialIns.map((d, i) => <div key={i} style={{ fontSize: 11, color: "rgba(160,190,240,0.65)", fontFamily: "'DM Sans',system-ui", marginBottom: 3 }}>{d.number}{d.pin ? ` Ã‚Â· PIN: ${d.pin}` : ""}</div>)}
        </div>}
        <div style={fieldBlock}><span style={labelStyle}>Attendees</span>
          {draft.attendees.map((att, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", marginBottom: 4, background: "rgba(15,25,55,0.5)", borderRadius: 5, border: "1px solid rgba(40,60,120,0.25)" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `hsl(${att.name.charCodeAt(0) * 15 % 360},40%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(200,220,255,0.8)", fontWeight: 500, flexShrink: 0 }}>{att.name.charAt(0)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "rgba(190,215,255,0.82)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</div>
                <div style={{ fontSize: 9, color: "rgba(80,110,170,0.5)", fontFamily: "'DM Sans',system-ui" }}>{att.email}</div>
              </div>
              <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.5px",
                color: att.status === "accepted" ? "rgba(80,200,120,0.7)" : att.status === "declined" ? "rgba(200,80,80,0.6)" : att.status === "tentative" ? "rgba(200,160,60,0.65)" : "rgba(100,130,180,0.45)" }}>{att.status}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input value={newAttendeeEmail} onChange={e => setNewAttendeeEmail(e.target.value)} placeholder="Add attendee email" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => { if (!newAttendeeEmail) return; const name = newAttendeeEmail.split("@")[0]; setDraft(d => d ? { ...d, attendees: [...d.attendees, { name, email: newAttendeeEmail, status: "pending" }] } : d); setNewAttendeeEmail(""); }}
              style={{ background: "rgba(30,70,160,0.3)", border: "1px solid rgba(50,100,200,0.3)", borderRadius: 6, color: "rgba(120,170,255,0.7)", cursor: "pointer", padding: "0 12px", fontSize: 11 }}>+</button>
          </div>
        </div>
        <div style={fieldBlock}><span style={labelStyle}>Organizer</span><input value={draft.organizer} onChange={e => set("organizer", e.target.value)} style={inputStyle} /></div>
        <div style={fieldBlock}><span style={labelStyle}>Description / Agenda</span><textarea value={draft.description} onChange={e => set("description", e.target.value)} placeholder="Add notes, agenda items, linksÃ¢â‚¬Â¦" style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} /></div>
        <div style={{ ...fieldBlock, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><span style={labelStyle}>Show As</span><select value={draft.showAs} onChange={e => set("showAs", e.target.value as CalEvent["showAs"])} style={inputStyle}>
            {(["busy","free","tentative","out-of-office"] as const).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1).replace("-"," ")}</option>)}
          </select></div>
          <div><span style={labelStyle}>Privacy</span><select value={draft.privacy} onChange={e => set("privacy", e.target.value as CalEvent["privacy"])} style={inputStyle}><option value="public">Public</option><option value="private">Private Ã°Å¸â€â€™</option></select></div>
        </div>
        <div style={fieldBlock}><span style={labelStyle}>Recurrence</span>
          <select value={draft.recurrence} onChange={e => set("recurrence", e.target.value)} style={inputStyle}>
            <option value="none">None</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Monthly</option>
            <option value="fullmoon">Every Full Moon</option><option value="equinox">Every Equinox</option><option value="solstice">Every Solstice</option><option value="perihelion">Every Perihelion week</option>
          </select>
        </div>
        <div style={fieldBlock}><span style={labelStyle}>Color</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {EVENT_COLORS.map(col => <button key={col} onClick={() => set("color", col)} style={{ width: 22, height: 22, borderRadius: 4, background: col, border: draft.color === col ? "2px solid white" : "2px solid transparent", cursor: "pointer", padding: 0 }} />)}
          </div>
        </div>
        <div style={fieldBlock}><span style={labelStyle}>Reminders</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[5,15,30,60,1440].map(mins => { const label = mins<60?`${mins}m`:mins===60?"1h":"1d"; const active = draft.reminders.includes(mins);
              return <button key={mins} onClick={() => set("reminders", active ? draft.reminders.filter(r=>r!==mins) : [...draft.reminders,mins])}
                style={{ padding: "3px 9px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                  background: active?"rgba(40,90,200,0.35)":"rgba(15,25,55,0.7)",
                  border: active?"1px solid rgba(80,130,240,0.5)":"1px solid rgba(40,60,120,0.3)",
                  color: active?"rgba(160,200,255,0.9)":"rgba(100,130,180,0.5)" }}>{label}</button>;
            })}
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(30,50,100,0.3)", display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => { onSave(draft); onClose(); }} style={{ flex: 1, padding: "8px", borderRadius: 6, background: "rgba(40,100,220,0.35)", border: "1px solid rgba(60,130,255,0.35)", color: "rgba(160,200,255,0.9)", cursor: "pointer", fontSize: 11, letterSpacing: "0.5px" }}>Save</button>
        <button onClick={() => { onSave({ ...draft, id: Date.now().toString() }); onClose(); }} style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(20,40,80,0.5)", border: "1px solid rgba(40,70,140,0.3)", color: "rgba(120,160,220,0.6)", cursor: "pointer", fontSize: 11 }}>Duplicate</button>
        <button onClick={() => { onDelete(draft.id); onClose(); }} style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(80,20,20,0.4)", border: "1px solid rgba(140,40,40,0.3)", color: "rgba(220,120,120,0.7)", cursor: "pointer", fontSize: 11 }}>Delete</button>
      </div>
    </div>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
//  SETTINGS PANEL (unchanged from v5.5)
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
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
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(120,150,200,0.5)", cursor: "pointer", fontSize: 18, padding: 0 }}>Ãƒâ€”</button>
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
          {([["showLunarWave","Lunar Wave","12.5 visible cycles of the moon"],["showFyrtarn","8 FyrtÃƒÂ¥rn Anchors","The lighthouses of the year"],["showSolarBreath","Solar Breath","Solstice pulse Ã¢â‚¬â€ working capacity"],["showMeteorArcs","Meteor Debris Arcs","Perseids, Geminids, Lyrids, Orionids"],["showZodiac","Zodiac Constellations","12 ecliptic sign images"]] as [keyof Settings, string, string][]).map(([k, label, sub]) => (
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

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
//  PANIC GRID VIEW (unchanged)
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function GridView({ selectedDate, onSelectDate, events }: { selectedDate: Date; onSelectDate: (d: Date) => void; events: CalEvent[] }) {
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const year = viewMonth.getFullYear(), month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(), todayKey = dateKey(today);
  const cells: (Date | null)[] = [];
  const startOffset = (firstDay + 6) % 7;
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  const eventsForDay = (d: Date) => events.filter(e => e.date === dateKey(d));

  return (
    <div style={{ flex: 1, padding: "0 20px", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingTop: 8 }}>
        <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} style={{ background: "none", border: "1px solid rgba(40,65,120,0.3)", borderRadius: 5, color: "rgba(120,160,220,0.6)", cursor: "pointer", padding: "4px 10px", fontSize: 12 }}>Ã¢â‚¬Â¹</button>
        <span style={{ fontSize: 14, color: "rgba(190,215,255,0.8)", letterSpacing: "0.5px" }}>{viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} style={{ background: "none", border: "1px solid rgba(40,65,120,0.3)", borderRadius: 5, color: "rgba(120,160,220,0.6)", cursor: "pointer", padding: "4px 10px", fontSize: 12 }}>Ã¢â‚¬Âº</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 6 }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, color: "rgba(80,110,170,0.45)", letterSpacing: "1px", textTransform: "uppercase", paddingBottom: 4 }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const dk = dateKey(d), isToday = dk === todayKey, isSelected = dk === dateKey(selectedDate), evs = eventsForDay(d);
          return (
            <button key={dk} onClick={() => onSelectDate(d)} style={{ padding: "6px 4px", borderRadius: 6, cursor: "pointer",
              background: isSelected ? "rgba(40,90,200,0.3)" : isToday ? "rgba(30,60,140,0.2)" : "rgba(10,18,40,0.4)",
              border: isSelected ? "1px solid rgba(60,130,255,0.4)" : isToday ? "1px solid rgba(40,80,180,0.3)" : "1px solid rgba(20,35,75,0.3)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 12, color: isToday ? "rgba(160,200,255,0.95)" : isSelected ? "rgba(180,210,255,0.85)" : "rgba(140,170,220,0.6)" }}>{d.getDate()}</span>
              {evs.length > 0 && <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>{evs.slice(0,3).map(ev => <div key={ev.id} style={{ width: 4, height: 4, borderRadius: "50%", background: ev.color }} />)}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
//  MAIN COMPONENT
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
export default function EarthMovesCalendar() {
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>(SAMPLE_EVENTS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const viewMode = "orbital" as const;
const viewModeTransition = "orbital" as const;
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [showMilestonePanel, setShowMilestonePanel] = useState(false);
const [newMilestone, setNewMilestone] = useState({ name: "", description: "", date: new Date().toISOString().slice(0, 10) });
  const [milestones, setMilestones] = useState<{ id: string; name: string; description: string; date: string }[]>([]);
  const [activeEvent, setActiveEvent] = useState<CalEvent | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [momentIdx, setMomentIdx] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInfoTip, setShowInfoTip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mini Watch state
  const [watchHourMode, setWatchHourMode] = useState<"min" | "mid">("min");
  const [watchSouthPole, setWatchSouthPole] = useState(false);

  // Odometer
  const startTimeRef = useRef(Date.now());
  const [kmTraveled, setKmTraveled] = useState(0);

  // Orbital canvas container
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });

  // Canvas refs Ã¢â‚¬â€ three layers
  const cvStarsRef = useRef<HTMLCanvasElement>(null);
  const cvOrbitRef = useRef<HTMLCanvasElement>(null);
  const cvHudRef = useRef<HTMLCanvasElement>(null);

  // Star field (cached)
  const starsRef = useRef<{ x: number; y: number; r: number; a: number }[]>([]);
  const starsBuiltRef = useRef<{ w: number; h: number } | null>(null);

  // Orbital pre-compute cache
  const orbitCacheRef = useRef<{ year: number; pts: { x: number; y: number; r: number; nu: number; speed: number }[] } | null>(null);

  // Zodiac constellation images
  const zodiacImgsRef = useRef<Record<string, HTMLImageElement>>({});

  const afRef = useRef<number>(0);
  const hoverDateRef = useRef<string | null>(null);
  const fyrtarnProximityRef = useRef<Record<string, number>>({});

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ MOUNT Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ MOBILE DETECTION Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ ZODIAC IMAGE LOADING Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    ZODIAC_SIGNS.forEach(z => {
      if (zodiacImgsRef.current[z.file]) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `/${z.file}.png`;
      img.onload = () => { zodiacImgsRef.current[z.file] = img; };
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

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ LIVE SPACE WEATHER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CLOCK + ODOMETER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    const t = setInterval(() => { const n = new Date(); setNow(n); setKmTraveled((Date.now() - startTimeRef.current) / 3600000 * 107280); }, 1000);
    return () => clearInterval(t);
  }, []);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ MOMENT ROTATION Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    const freq = settings.momentFrequency === "frequent" ? 20000 : settings.momentFrequency === "balanced" ? 45000 : 99999999;
    const t = setInterval(() => setMomentIdx(i => i + 1), freq);
    return () => clearInterval(t);
  }, [settings.momentFrequency]);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ RESIZE OBSERVER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

// Ã¢â€â‚¬Ã¢â€â‚¬ ORBITAL GEOMETRY Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const orbitGeometry = useMemo(() => {
  const { w, h } = containerSize;
  const PAD = 60;
  // Scale so Mars orbit + month labels + zodiac images all fit
  let maxR = (Math.min(w, h) / 2 - PAD);
  const aR = Math.max(85, maxR / 2.1); // Ã¢â€ Â minimum 85px on mobile Ã¢â‚¬â€ never negative, never tiny
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
  const dayEventsForSelected = useMemo(() => events.filter(e => e.date === dateKey(selectedDate)), [events, selectedDate]);

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

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CANVAS LAYERS (unchanged orbital rendering) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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
    if (settings.showZodiac) {
      const { cx, cy, aR, bR } = orbitGeometry;
      const zodiacR = aR * 1.85; // beyond Mars orbit + month labels
      const imgSize = Math.max(34, Math.min(58, aR * 0.192)); // +20% per design spec Ã¢â‚¬â€ grand celestial bezel
      const solData = solar(now);
      const nightRa = ((solData.orbitalAngle / 360) * 24 + 12) % 24;

            ZODIAC_SIGNS.forEach(z => {
        // Position: midDay maps to angle on the calendar ring
        const angle = ((z.midDay / 365) * 360 - 90) * DEG;
        const zx = cx + zodiacR * Math.cos(angle);
        const zy = cy + zodiacR * (bR / aR) * Math.sin(angle);

        // Brightness: active constellation (opposite sun) is brighter
        const signRaCenter = (z.midDay / 365) * 24;
        const raDiff = Math.abs(((signRaCenter - nightRa + 12) % 24) - 12);
        const isActive = raDiff < 2;
        const alpha = isActive ? 1.0 : 0.88;   // boosted brilliance per design spec

        // Draw image if loaded (white-on-black PNG Ã¢â‚¬â€ use "screen" blending)
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

        // Label below image Ã¢â‚¬â€ pure white
        c.fillStyle = `rgba(255,255,255,${isActive ? 0.95 : 0.75})`;
        c.font = `${isActive ? 500 : 400} ${Math.max(7, imgSize * 0.22)}px 'DM Mono',monospace`;
        c.textAlign = "center"; c.textBaseline = "top";
        c.fillText(z.name, zx, zy + imgSize / 2 + 3);
      });

      // Ã¢â€â‚¬Ã¢â€â‚¬ "TOWARDS MILKY WAY CORE" arrow near Sagittarius Ã¢â€â‚¬Ã¢â€â‚¬
      const sagIdx = ZODIAC_SIGNS.findIndex(z => z.name === "Sagittarius");
      if (sagIdx >= 0) {
        const sagAngle = ((ZODIAC_SIGNS[sagIdx].midDay / 365) * 360 - 90) * DEG;
        const arrowStartR = zodiacR + imgSize / 2 + 12;
        const arrowEndR = arrowStartR + 30;
        const asx = cx + arrowStartR * Math.cos(sagAngle);
        const asy = cy + arrowStartR * (bR / aR) * Math.sin(sagAngle);
        const aex = cx + arrowEndR * Math.cos(sagAngle);
        const aey = cy + arrowEndR * (bR / aR) * Math.sin(sagAngle);

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

        // Label
        const labelR = arrowEndR + 8;
        const lbx = cx + labelR * Math.cos(sagAngle);
        const lby = cy + labelR * (bR / aR) * Math.sin(sagAngle);
        c.fillStyle = "rgba(255,255,255,0.15)";
        c.font = "6px 'DM Mono',monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.save(); c.translate(lbx, lby); c.rotate(sagAngle + Math.PI / 2);
        c.fillText("MILKY WAY CORE Ã¢â€ â€™", 0, 0);
        c.restore();
      }
    }
  }, [containerSize, settings.showZodiac, orbitGeometry]);

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

                // Draw Orbit Path Ã¢â‚¬â€ Mars gets visible rust ring, others gossamer (safe for mobile)
        const pxR = Math.max(1, pOrbitR);
        const pyR = Math.max(1, pOrbitR * (bR / aR));
        c.beginPath();
        c.ellipse(sunX, sunY, pxR, pyR, 0, 0, TAU);
        if (name === "earth") {
          c.strokeStyle = "rgba(96,165,250,0.06)"; c.lineWidth = 0.5;
        } else if (name === "mars") {
          c.strokeStyle = "rgba(200,130,80,0.18)"; c.lineWidth = 0.8;
          c.stroke();
          // Second pass: faint outer glow for Mars orbit
          c.beginPath();
          c.ellipse(sunX, sunY, pOrbitR, pOrbitR * (bR / aR), 0, 0, TAU);
          c.strokeStyle = "rgba(200,130,80,0.06)"; c.lineWidth = 4;
        } else {
          c.strokeStyle = "rgba(160,170,200,0.06)"; c.lineWidth = 0.4;
        }
        c.stroke();

        // EARTH HANDLED BY HUD; SKIP DRAWING BODY HERE
        if (name === "earth") return;

        // Position based on realistic orbital period p
        const angle = (yearFrac / data.p) * TAU - Math.PI / 2;
        const px = sunX + pOrbitR * Math.cos(angle);
        const py = sunY + pOrbitR * (bR / aR) * Math.sin(angle);

        // Planet Glow & Body
        const pSize = 2.5;
        const pulse = 0.7 + 0.3 * Math.sin(t / 2000);
        const glow = c.createRadialGradient(px, py, 0, px, py, pSize * 3);
        glow.addColorStop(0, `${data.color}${Math.floor(pulse * 60).toString(16)}`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        
        c.beginPath(); c.arc(px, py, pSize * 3, 0, TAU);
        c.fillStyle = glow; c.fill();
        c.beginPath(); c.arc(px, py, pSize, 0, TAU);
        c.fillStyle = data.color; c.fill();

        // Blueprint Label
        c.font = "7px 'DM Mono',monospace"; c.textAlign = "center";
        c.fillStyle = "rgba(200,220,255,0.5)";
        c.fillText(name.toUpperCase(), px, py + 12);
      });
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ EARTH'S ORBIT Ã¢â‚¬â€ variable thickness, bold near Earth position Ã¢â€â‚¬Ã¢â€â‚¬
    const earthDoy = Math.floor((Number(now) - Number(new Date(now.getFullYear(), 0, 0))) / 86400000);
    const earthIdx = Math.min(earthDoy - 1, orbitPts.length - 1);

    // Outer glow layer (very faint, wide)
    c.beginPath(); orbitPts.forEach((p,i) => { if (i===0) c.moveTo(p.x,p.y); else c.lineTo(p.x,p.y); }); c.closePath();
    c.strokeStyle = "rgba(30,80,180,0.04)"; c.lineWidth = 14; c.stroke();

    // Variable thickness segments Ã¢â‚¬â€ bright near Earth, fading away
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ GRADUATION MARKS Ã¢â‚¬â€ white ||||| gauge ticks around orbit Ã¢â€â‚¬Ã¢â€â‚¬
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

      // Daily tick marks Ã¢â‚¬â€ every day = one graduation
      for (let d = 0; d < 365; d++) {
        const dayAngle = ((d / 365) * 360 - 90) * DEG;
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ MILESTONE RADIAL LINES TO SUN Ã¢â‚¬â€ white star-like crossing lines Ã¢â€â‚¬Ã¢â€â‚¬
    if (settings.showFyrtarn) {
      const sunX2 = cx - orbitGeometry.focusOffset;
      const sunY2 = cy;
      fyrtarnDates.forEach(f => {
        const doy = Math.floor((Number(f.dateObj) - Number(new Date(f.dateObj.getFullYear(), 0, 0))) / 86400000);
        const ptIdx = Math.min(doy - 1, orbitPts.length - 1);
        if (ptIdx < 0) return;
        const p = orbitPts[ptIdx];

        // Parse milestone color
        const hexR2 = parseInt(f.color.slice(1, 3), 16);
        const hexG2 = parseInt(f.color.slice(3, 5), 16);
        const hexB2 = parseInt(f.color.slice(5, 7), 16);

        // Radial line from orbit to sun Ã¢â‚¬â€ gradient white/colored
        const lineGrad = c.createLinearGradient(p.x, p.y, sunX2, sunY2);
        lineGrad.addColorStop(0, `rgba(${hexR2},${hexG2},${hexB2},0.4)`);
        lineGrad.addColorStop(0.3, `rgba(255,255,255,0.15)`);
        lineGrad.addColorStop(1, "rgba(255,240,200,0)");
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(sunX2, sunY2);
        c.strokeStyle = lineGrad;
        c.lineWidth = 0.6;
        c.stroke();

        // Small cross/star mark at intersection with orbit
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ USER MILESTONE WHITE RADIAL LINES Ã¢â€â‚¬Ã¢â€â‚¬
    {
      const sunX3 = cx - orbitGeometry.focusOffset;
      const sunY3 = cy;
      milestones.forEach(m => {
        const mDate = new Date(m.date + "T00:00:00");
        if (mDate.getFullYear() !== now.getFullYear()) return;
        const doy = Math.floor((Number(mDate) - Number(new Date(mDate.getFullYear(), 0, 0))) / 86400000);
        const ptIdx = Math.min(Math.max(0, doy - 1), orbitPts.length - 1);
        const p = orbitPts[ptIdx];
        if (!p) return;

        // Thin solid white line from orbit point to Sun
        const lineGrad = c.createLinearGradient(p.x, p.y, sunX3, sunY3);
        lineGrad.addColorStop(0, "rgba(255,255,255,0.55)");
        lineGrad.addColorStop(0.35, "rgba(255,255,255,0.18)");
        lineGrad.addColorStop(1, "rgba(255,255,255,0)");
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(sunX3, sunY3);
        c.strokeStyle = lineGrad;
        c.lineWidth = 0.8;
        c.stroke();

        // Small white diamond at orbit intersection
        const angle = Math.atan2(p.y - cy, p.x - cx);
        const dSize = 4;
        c.fillStyle = "rgba(255,255,255,0.65)";
        c.beginPath();
        c.moveTo(p.x + dSize * Math.cos(angle), p.y + dSize * Math.sin(angle));
        c.lineTo(p.x + dSize * 0.5 * Math.cos(angle + Math.PI / 2), p.y + dSize * 0.5 * Math.sin(angle + Math.PI / 2));
        c.lineTo(p.x - dSize * Math.cos(angle), p.y - dSize * Math.sin(angle));
        c.lineTo(p.x - dSize * 0.5 * Math.cos(angle + Math.PI / 2), p.y - dSize * 0.5 * Math.sin(angle + Math.PI / 2));
        c.closePath();
        c.fill();

        // Label
        const labelR2 = 14;
        const perpA = angle + Math.PI / 2;
        c.fillStyle = "rgba(255,255,255,0.52)";
        c.font = "500 7px 'DM Mono',monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(m.name.toUpperCase(), p.x + labelR2 * Math.cos(perpA), p.y + labelR2 * Math.sin(perpA));
      });
    }

            // Ã¢â€â‚¬Ã¢â€â‚¬ ORBITAL MOTION ARROW Ã¢â‚¬â€ shows direction of Earth's movement Ã¢â€â‚¬Ã¢â€â‚¬
    {
      const arrowIdx = Math.min(earthIdx + 15, orbitPts.length - 1);
      const arrowPrev = orbitPts[Math.max(0, arrowIdx - 2)];
      const arrowTip = orbitPts[arrowIdx];
      if (arrowTip && arrowPrev) {
        const dx = arrowTip.x - arrowPrev.x;
        const dy = arrowTip.y - arrowPrev.y;
        const arrowAngle = Math.atan2(dy, dx);
        const tipX = arrowTip.x;
        const tipY = arrowTip.y;
        const wingLen = 8;

        // Arrow head Ã¢â‚¬â€ subtle white, reduced opacity per spec
        c.save();
        c.globalAlpha = 0.55;
        c.beginPath();
        c.moveTo(tipX, tipY);
        c.lineTo(tipX - wingLen * Math.cos(arrowAngle - 0.4), tipY - wingLen * Math.sin(arrowAngle - 0.4));
        c.moveTo(tipX, tipY);
        c.lineTo(tipX - wingLen * Math.cos(arrowAngle + 0.4), tipY - wingLen * Math.sin(arrowAngle + 0.4));
        c.strokeStyle = "#ffffff";
        c.lineWidth = 1.8;
        c.lineCap = "round";
        c.stroke();

        // "Ã¢â€ â€™ ORBIT" label Ã¢â‚¬â€ subdued white
        c.globalAlpha = 0.45;
        c.fillStyle = "#ffffff";
        c.font = "600 7px 'DM Mono',monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        const labelOff = 17;
        const perpAngle = arrowAngle + Math.PI / 2;
        c.fillText("Ã¢â€ â€™ ORBIT", tipX + labelOff * Math.cos(perpAngle), tipY + labelOff * Math.sin(perpAngle));
        c.restore();
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ FADED ARC PATCHES Ã¢â‚¬â€ milestones as spectral glows on the orbit path
    if (settings.showFyrtarn) {
      const todayDoyForFyt = Math.floor((Number(now)-Number(new Date(now.getFullYear(),0,0)))/86400000);
      const sunX = orbitGeometry.cx-orbitGeometry.focusOffset; const sunY = orbitGeometry.cy;

      fyrtarnDates.forEach(f => {
        const doy = Math.floor((Number(f.dateObj)-Number(new Date(f.dateObj.getFullYear(),0,0)))/86400000);
        const ptIdx = Math.min(doy-1,orbitPts.length-1);
        if (ptIdx<0) return;

        const daysDiff = Math.abs(doy-todayDoyForFyt);
        const proximity = Math.max(0,1-daysDiff/22);

        // Parse color
        const hexR = parseInt(f.color.slice(1,3),16);
        const hexG = parseInt(f.color.slice(3,5),16);
        const hexB = parseInt(f.color.slice(5,7),16);

        // Draw faded arc patch: Ã‚Â·Ã‚Â·Ã‚Â·::||::Ã‚Â·Ã‚Â·Ã‚Â· on orbit path (~10 days each side)
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

        // Sun beam when very close
        if (daysDiff<=5) {
          const p = orbitPts[ptIdx];
          const beamAlpha = 0.18+0.42*(1-daysDiff/5);
          c.beginPath(); c.moveTo(p.x,p.y); c.lineTo(sunX,sunY);
          const beamGrad = c.createLinearGradient(p.x,p.y,sunX,sunY);
          beamGrad.addColorStop(0,`rgba(${hexR},${hexG},${hexB},${beamAlpha})`);
          beamGrad.addColorStop(1,"rgba(255,240,180,0)");
          c.strokeStyle = beamGrad; c.lineWidth = 0.7; c.stroke();
        }

        // Label Ã¢â‚¬â€ always visible, small caps, offset outward from orbit
        const p = orbitPts[ptIdx];
        const lAngle = Math.atan2(p.y-cy,p.x-cx);
        const labelDist = 18 + 6 * proximity;
        const lx = p.x+Math.cos(lAngle)*labelDist;
        const ly = p.y+Math.sin(lAngle)*labelDist;
        const labelAlpha = 0.35 + 0.5 * proximity;
        c.fillStyle = `rgba(${hexR},${hexG},${hexB},${labelAlpha})`;
        c.font = `${300 + Math.round(proximity * 200)} ${8+2*proximity}px 'DM Mono',monospace`;
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(f.name.toUpperCase(), lx, ly);
      });
    }

    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const marsOrbitR = aR * 1.52; // Mars orbit radius
    const monthLabelR = marsOrbitR + 22; // labels just outside Mars orbit
    // Month divider ticks
    for (let m = 0; m < 12; m++) {
      const tickAngle = (m * 30 - 90) * DEG;
      c.beginPath();
      c.moveTo(cx + (marsOrbitR + 6) * Math.cos(tickAngle), cy + (marsOrbitR + 6) * Math.sin(tickAngle));
      c.lineTo(cx + (marsOrbitR + 14) * Math.cos(tickAngle), cy + (marsOrbitR + 14) * Math.sin(tickAngle));
      c.strokeStyle = "rgba(80,110,165,0.2)"; c.lineWidth = 0.7; c.stroke();
    }
    // Month labels Ã¢â‚¬â€ positioned on single circular axis
    for (let m = 0; m < 12; m++) { const midAngle = ((m*30+15)-90)*DEG; const lx = cx+monthLabelR*Math.cos(midAngle); const ly = cy+monthLabelR*Math.sin(midAngle); c.save(); c.translate(lx,ly); c.rotate(midAngle+Math.PI/2); const isCur = m===now.getMonth(); c.fillStyle = isCur ? "rgba(220,235,255,0.88)" : "rgba(160,180,220,0.6)"; c.font = `${isCur?500:300} ${isCur?11:10}px 'DM Sans',system-ui`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(months[m],0,0); c.restore(); }

    // Meeting blobs removed per v4 spec Ã¢â‚¬â€ orbital view is purely astronomical

    // FyrtÃƒÂ¥rn dots removed Ã¢â‚¬â€ replaced by arc patches above

    { const p = selectedPos; c.beginPath(); c.arc(p.x,p.y,5,0,TAU); c.strokeStyle = "rgba(200,220,255,0.6)"; c.lineWidth = 1.5; c.stroke(); c.beginPath(); c.arc(p.x,p.y,2,0,TAU); c.fillStyle = "rgba(200,220,255,0.8)"; c.fill(); }

    // Shooting stars + aurora + sapphire veil (preserved)
    { const isActiveMeteor = settings.showMeteorArcs && METEOR_ARCS.some(ma => Math.abs(sol.orbitalAngle-ma.angle)<ma.width*2); const spawnProb = isActiveMeteor?0.005:0.0008;
      if (Math.random()<spawnProb) { const activeArc = METEOR_ARCS.find(ma => Math.abs(sol.orbitalAngle-ma.angle)<ma.width*2); const sColor = activeArc?activeArc.color:"#ffffff"; const edgeAngle = Math.random()*TAU; const edgeDist = aR*1.35; _meteorStreaks.push({ x: cx+edgeDist*Math.cos(edgeAngle), y: cy+edgeDist*Math.sin(edgeAngle), vx: Math.cos(Math.atan2(cy-(cy+edgeDist*Math.sin(edgeAngle)),cx-(cx+edgeDist*Math.cos(edgeAngle)))+(Math.random()-0.5)*0.8)*(200+Math.random()*140), vy: Math.sin(Math.atan2(cy-(cy+edgeDist*Math.sin(edgeAngle)),cx-(cx+edgeDist*Math.cos(edgeAngle)))+(Math.random()-0.5)*0.8)*(200+Math.random()*140), born: t, life: 280+Math.random()*120, color: sColor }); }
      _meteorStreaks = _meteorStreaks.filter(s => t-s.born<s.life);
      _meteorStreaks.forEach(s => { const age = (t-s.born)/s.life; const elapsed = (t-s.born)/1000; const hx = s.x+s.vx*elapsed; const hy = s.y+s.vy*elapsed; const tailLen = 16*(1-age); const tx = hx-s.vx*tailLen/200; const ty = hy-s.vy*tailLen/200; const hexC = s.color.replace(/^#(..)(..)(..)/, (_,r,g,b) => `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},`); const mg = c.createLinearGradient(tx,ty,hx,hy); mg.addColorStop(0,hexC+"0)"); mg.addColorStop(0.5,hexC+`${(1-age)*0.45})`); mg.addColorStop(1,hexC+`${(1-age)*0.75})`); c.beginPath(); c.moveTo(tx,ty); c.lineTo(hx,hy); c.strokeStyle = mg; c.lineWidth = 1.1*(1-age); c.stroke(); c.beginPath(); c.arc(hx,hy,0.9,0,TAU); c.fillStyle = `rgba(255,250,240,${(1-age)*0.9})`; c.fill(); });
    }

    if (_globalKp >= 3) { c.save(); c.globalCompositeOperation = "screen"; const kpAmp = Math.min(14,_globalKp*1.8); const innerRadii = [aR*0.45,aR*0.52,aR*0.59]; innerRadii.forEach((baseR,ribbonIdx) => { c.beginPath(); orbitPts.forEach((op,i) => { const angle = Math.atan2(op.y-cy,op.x-cx); const waveOffset = _smoothNoise(i*0.03+t/4000+ribbonIdx*2.1)*kpAmp; const r2 = baseR+waveOffset; const px = cx+r2*Math.cos(angle); const py = cy+r2*Math.sin(angle); if (i===0) c.moveTo(px,py); else c.lineTo(px,py); }); c.closePath(); const opacity = Math.min(0.18,(_globalKp-2)*0.025); c.strokeStyle = (ribbonIdx<2||_globalKp<6)?`rgba(40,220,120,${opacity})`:`rgba(160,80,255,${opacity})`; c.lineWidth = 1.2; c.stroke(); }); c.restore(); }

    { const { w: vW, h: vH } = containerSize; const veil = c.createRadialGradient(cx,cy,Math.min(vW,vH)*0.28,cx,cy,Math.max(vW,vH)*0.65); veil.addColorStop(0,"rgba(0,0,0,0)"); veil.addColorStop(0.7,"rgba(2,4,12,0)"); veil.addColorStop(1,"rgba(2,4,12,0.55)"); c.fillStyle = veil; c.fillRect(0,0,vW,vH); }
  }, [now, sol, lun, containerSize, orbitGeometry, orbitPts, earthPos, selectedPos, events, fyrtarnDates, milestones, settings]);

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
    c.beginPath(); c.arc(p.x,p.y,7,0,TAU); const earthCore = c.createRadialGradient(p.x-2,p.y-2,0,p.x,p.y,7); earthCore.addColorStop(0,"#60A5FA"); earthCore.addColorStop(0.5,"#2563EB"); earthCore.addColorStop(1,"#1E40AF"); c.fillStyle = earthCore; c.fill(); c.strokeStyle = "rgba(200,230,255,0.4)"; c.lineWidth = 0.8; c.stroke();

    // Tiny moon circling Earth dot Ã¢â‚¬â€ KEPT VISIBLE
    const lunAngle = lun.phase*TAU-Math.PI/2; const lunOrbitR = 14; const lx = p.x+lunOrbitR*Math.cos(lunAngle); const ly = p.y+lunOrbitR*Math.sin(lunAngle); c.beginPath(); c.arc(lx,ly,2.5,0,TAU); c.fillStyle = `rgba(200,210,230,${0.4+0.4*lun.illum})`; c.fill();

    const sunX = orbitGeometry.cx-orbitGeometry.focusOffset; const sunY = orbitGeometry.cy;
    { const windNorm = Math.max(0,Math.min(1,(_solarWindSpeed-300)/500)); const coronaR = 14+14*windNorm; const pulseRate = 1200-400*windNorm; const coronaPulse = 0.8+0.2*Math.sin(t/pulseRate); const coronaAlpha = windNorm<0.3?0.45*coronaPulse:windNorm<0.7?0.52*coronaPulse:0.62*coronaPulse; const sunGlow = c.createRadialGradient(sunX,sunY,0,sunX,sunY,coronaR); sunGlow.addColorStop(0,`rgba(255,240,180,${coronaAlpha})`); sunGlow.addColorStop(0.5,`rgba(255,200,80,${coronaAlpha*0.28})`); sunGlow.addColorStop(1,"rgba(255,180,60,0)"); c.beginPath(); c.arc(sunX,sunY,coronaR,0,TAU); c.fillStyle = sunGlow; c.fill(); c.beginPath(); c.arc(sunX,sunY,5,0,TAU); c.fillStyle = "rgba(255,240,180,0.75)"; c.fill(); }

    // Solar flare flash Ã¢â‚¬â€ expanding ring across entire canvas
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

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ RAF LOOP Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const draw = useCallback(() => {
    if (containerSize.w < 10 || containerSize.h < 10) { afRef.current = requestAnimationFrame(draw); return; }
    if (starsBuiltRef.current?.w !== containerSize.w) drawStarLayer();
    drawOrbitalLayer(); drawHudLayer();
    afRef.current = requestAnimationFrame(draw);
  }, [containerSize, drawStarLayer, drawOrbitalLayer, drawHudLayer]);

  useEffect(() => {
    if (viewMode !== "orbital") return;
    afRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(afRef.current);
  }, [draw, viewMode]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX-rect.left; const my = e.clientY-rect.top;
    let minDist = Infinity, bestIdx = -1;
    orbitPts.forEach((p,i) => { const d = Math.sqrt((p.x-mx)**2+(p.y-my)**2); if (d<minDist&&d<28) { minDist = d; bestIdx = i; } });
    if (bestIdx >= 0) { const d = new Date(now.getFullYear(),0,bestIdx+1); setSelectedDate(d); const dk = dateKey(d); const evs = events.filter(e => e.date === dk); if (evs.length>0) { setActiveEvent(evs[0]); setShowEventPanel(true); } }
  }, [orbitPts, now, events]);

  // Moment triggers
  const prevKmMilestoneRef = useRef(0);
  useEffect(() => { if (settings.momentFrequency==="off") return; const kmMilestones = [100000,500000,1000000,5000000]; for (const m of kmMilestones) { if (prevKmMilestoneRef.current<m&&kmTraveled>=m) { setMomentIdx(i=>i+1); prevKmMilestoneRef.current = m; break; } } }, [kmTraveled, settings.momentFrequency]);

  const momentText = useMemo(() => { if (settings.momentFrequency==="off") return ""; return getMoment(kmTraveled, momentIdx); }, [kmTraveled, momentIdx, settings.momentFrequency]);
  const kmFormatted = kmTraveled >= 1e6 ? `${(kmTraveled/1e6).toFixed(2)}M km` : kmTraveled >= 1000 ? `${(kmTraveled/1000).toFixed(1)}k km` : `${Math.round(kmTraveled).toLocaleString()} km`;

  const nextFyrtarn = useMemo(() => {
    const todayMs = now.getTime();
    return fyrtarnDates.map(f => ({ ...f, diff: f.dateObj.getTime()-todayMs })).filter(f => f.diff>0).sort((a,b) => a.diff-b.diff)[0];
  }, [fyrtarnDates, now]);

  const moonPhaseText = useMemo(() => {
    const p = lun.phase;
    if (p<0.03||p>0.97) return "Ã°Å¸Å’â€˜ New Moon"; if (p<0.22) return "Ã°Å¸Å’â€™ Waxing Crescent"; if (p<0.28) return "Ã°Å¸Å’â€œ First Quarter";
    if (p<0.47) return "Ã°Å¸Å’â€ Waxing Gibbous"; if (p<0.53) return "Ã°Å¸Å’â€¢ Full Moon"; if (p<0.72) return "Ã°Å¸Å’â€“ Waning Gibbous";
    if (p<0.78) return "Ã°Å¸Å’â€” Last Quarter"; return "Ã°Å¸Å’Ëœ Waning Crescent";
  }, [lun.phase]);

  const canvasStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" };

  const newEventTemplate: CalEvent = {
    id: Date.now().toString(), title: "", date: dateKey(selectedDate), startTime: "09:00", endTime: "10:00",
    allDay: false, location: "", virtualLink: "", dialIns: [], attendees: [], organizer: "",
    description: "", reminders: [15], showAs: "busy", category: "Work", color: "#5B8DD9", privacy: "public", recurrence: "none",
  };

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

  // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
  //  RENDER
  // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#000000", fontFamily: "'DM Sans',system-ui", color: "rgba(200,220,255,0.88)", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header removed per v4 spec Ã¢â‚¬â€ branding moved to orbital view */}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ MAIN BODY Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flex: 1, overflow: isMobile ? "auto" : "hidden" }}>

        {/* On mobile, orbital view comes first */}
                  {isMobile && (
          <div ref={containerRef} style={{ width: "100%", height: "48vh", position: "relative", flexShrink: 0 }}>
            {showOnboarding && (
              <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", animation: "onboardFade 4.2s ease forwards" }}>
                <div style={{ background: "rgba(6,10,22,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(50,80,140,0.25)", borderRadius: 12, padding: "12px 20px", display: "flex", gap: 16, alignItems: "center" }}>
                  {[{ icon: "Ã°Å¸Å’Â", label: "Click orbit to navigate" }, { icon: "Ã¢Ëœâ€°", label: "Planets in motion" }, { icon: "Ã¢Å“Â¦", label: "Milestone arcs", color: "rgba(150,170,220,0.5)" }].map(item => (
                    <div key={item.label} style={{ textAlign: "center" }}><div style={{ fontSize: 14, marginBottom: 2, color: item.color || "inherit" }}>{item.icon}</div><div style={{ fontSize: 8, color: "rgba(120,150,200,0.65)", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{item.label}</div></div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ position: "absolute", inset: 0 }}>
              <canvas ref={cvStarsRef} style={{ ...canvasStyle, zIndex: 1 }} />
              <canvas ref={cvOrbitRef} style={{ ...canvasStyle, zIndex: 2 }} />
              <canvas ref={cvHudRef} onClick={handleCanvasClick} style={{ ...canvasStyle, zIndex: 3, cursor: "crosshair" }} />

              {isMounted && <div style={{ position: "absolute", bottom: 8, left: 12, zIndex: 10 }}>
                <div style={{ fontSize: 8, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(60,90,140,0.3)" }}>Earth Moves</div>
              </div>}
                            {/* Settings gear removed per request */}
              {isMounted && <div style={{ position: "absolute", bottom: 8, right: 12, zIndex: 10, fontSize: 8, color: "rgba(96,165,250,0.3)", fontVariantNumeric: "tabular-nums" }}>{kmFormatted}</div>}
            </div>
          </div>
        )}

        {/* LEFT PANEL Ã¢â‚¬â€ Date card + Controls (Mini Watch desktop only) */}
        <div style={{ width: isMobile ? "100%" : 260, flexShrink: 0, borderRight: isMobile ? "none" : "1px solid rgba(110,140,190,.12)", borderTop: isMobile ? "1px solid rgba(110,140,190,.12)" : "none", display: "flex", flexDirection: "column", background: "rgba(4,8,18,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", overflowY: "auto", ...(isMobile ? { maxHeight: "none" } : {}) }}>

          {/* Mini Watch Ã¢â‚¬â€ Desktop only */}
          {!isMobile && (
          <div style={{ padding: "14px 15px 10px", display: "flex", justifyContent: "center", borderBottom: "1px solid rgba(110,140,190,.10)" }}>
            <div style={{ position: "relative" }}>
                            <div style={{ width: 220, height: 220, borderRadius: "50%", boxShadow: "0 0 55px rgba(30,70,180,0.35), inset 0 0 70px rgba(255,255,255,0.09), 0 0 140px rgba(8,28,75,0.75)", overflow: "hidden", border: "1px solid rgba(190,205,240,0.22)" }}>
                {isMounted ? (
                  <MiniWatch now={now} lat={settings.latitude} lon={settings.longitude} southPole={watchSouthPole} hourMode={watchHourMode} />
                ) : (
                  <div style={{ width: 220, height: 220, borderRadius: "50%", background: "#0d2245", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(50,80,140,0.4)", fontSize: 11 }}>LoadingÃ¢â‚¬Â¦</div>
                )}
              </div>
              {/* Sapphire halo */}
                            <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid rgba(225,235,255,0.25)", boxShadow: "0 0 28px rgba(200,215,255,0.18), inset 0 0 20px rgba(255,255,255,0.08)", pointerEvents: "none" }} />
            </div>
          </div>
          )}

          {/* Control buttons Ã¢â‚¬â€ Desktop: 2-col grid / Mobile: compact action bar */}
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(110,140,190,.10)" }}>
            {isMobile ? (
              <div style={{ display: "flex", gap: 6 }}>
                <a href="/" target="_blank" rel="noopener noreferrer" style={{ ...wBtnStyle(false), textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 40, width: "30%", flexShrink: 0, background: "rgba(8,12,25,.92)", border: "1px solid rgba(110,140,190,.28)", color: "rgba(140,185,255,.75)" }}>Watch <span style={{ fontSize: 11, opacity: 0.7 }}>Ã¢â€ â€”</span></a>
                <button onClick={() => setShowMilestonePanel(true)}
                  style={{ ...wBtnStyle(false), flex: 1, textAlign: "center", background: "rgba(8,12,25,.88)", border: "1px solid rgba(110,140,190,.22)", color: "rgba(160,210,255,.7)", padding: "8px 14px", fontSize: 10, minHeight: 40 }}>
                  + Schedule Milestone
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <a href="/" target="_blank" rel="noopener noreferrer" style={{ ...wBtnStyle(false), textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 36, background: "rgba(8,12,25,.92)", border: "1px solid rgba(110,140,190,.28)", color: "rgba(140,185,255,.75)" }}>Watch <span style={{ fontSize: 11, opacity: 0.7 }}>Ã¢â€ â€”</span></a>
                <button onClick={() => setShowMilestonePanel(true)}
                  style={{ ...wBtnStyle(false), textAlign: "center", background: "rgba(8,12,25,.88)", border: "1px solid rgba(110,140,190,.22)", color: "rgba(160,210,255,.7)", fontSize: 10, minHeight: 36 }}>
                  + Schedule Milestone
                </button>
                <button onClick={() => setWatchHourMode("min")} style={wBtnStyle(watchHourMode === "min")}>Hours Min</button>
                <button onClick={() => setWatchHourMode("mid")} style={wBtnStyle(watchHourMode === "mid")}>Hours Mid</button>
                <button onClick={() => setWatchSouthPole(false)} style={wBtnStyle(!watchSouthPole)}>North Pole</button>
                <button onClick={() => setWatchSouthPole(true)} style={wBtnStyle(watchSouthPole)}>South Pole</button>
              </div>
            )}
          </div>

          {/* Sol System Date Card */}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "rgba(100,130,180,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>
                {isMounted ? selectedDate.toLocaleDateString("en-US", { weekday: "long" }) : ""}
              </div>
              <div style={{ fontSize: 28, fontWeight: 200, color: "rgba(210,225,255,0.92)", letterSpacing: "2px", fontVariantNumeric: "tabular-nums", fontFamily: "'DM Sans',system-ui" }}>
                SOL {String(solDay).padStart(3, "0")}
                <span style={{ fontSize: 13, color: "rgba(100,130,180,0.4)", marginLeft: 4, fontWeight: 300 }}>/ {solTotal}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(80,110,165,0.45)", letterSpacing: 0.5, marginTop: 3 }}>
                {isMounted ? `${selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} Ã¢â‚¬â€ Week ${getISOWeek(selectedDate)}` : ""}
              </div>
              {/* Time readout Ã¢â‚¬â€ DM Sans primary time */}
              <div style={{ fontSize: 36, fontWeight: 200, color: "rgba(255,255,255,.88)", letterSpacing: "2px", fontFamily: "'DM Sans',system-ui", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                {isMounted ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--"}
              </div>
            </div>

            {/* Daylight bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(80,110,165,0.5)", marginBottom: 4, letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}><span>Daylight</span><span>{dayLength.toFixed(1)}h</span></div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(20,35,75,0.6)", overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", 
                  width: `${Math.min(100, Math.max(0, Math.round((dayLength / 24) * 100)))}%`, 
                  background: "linear-gradient(90deg,rgba(255,180,60,0.5),rgba(255,220,100,0.7))", 
                  borderRadius: 2 
                }} />
              </div>
            </div>

            {/* Moon Ã¢â‚¬â€ illumination progress bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(80,110,165,0.5)", marginBottom: 4, letterSpacing: "1px", textTransform: "uppercase" }}>
                <span>{moonPhaseText.replace(/[^\w\s]/g, "").trim()}</span>
                <span>{Math.round(lun.illum * 100)}%</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(20,35,75,0.6)", overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", 
                  width: `${Math.round(lun.illum * 100)}%`, 
                  background: "linear-gradient(90deg,rgba(160,170,200,0.3),rgba(220,225,240,0.65))", 
                  borderRadius: 2 
                }} />
              </div>
            </div>

            {/* Next Anchor Ã¢â‚¬â€ glassmorphism */}
                        {nextFyrtarn && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(8,12,25,.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(110,140,190,.22)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.35)", marginBottom: 14 }}>
                <div style={{ fontSize: 8.5, color: "rgba(205,220,255,0.9)", textTransform: "uppercase", letterSpacing: "1.8px", marginBottom: 4, fontWeight: 500 }}>Next Anchor</div>
                <div style={{ fontSize: 12, color: nextFyrtarn.color, letterSpacing: "0.4px" }}>{nextFyrtarn.glyph} {nextFyrtarn.name}</div>
                <div style={{ fontSize: 9.5, color: "rgba(220,230,255,0.95)", marginTop: 3, fontVariantNumeric: "tabular-nums" }}>{Math.ceil(nextFyrtarn.diff / 86400000)} days</div>
              </div>
            )}

            {/* Next Milestones + User Milestones Ã¢â‚¬â€ glassmorphism */}
            <div>
                            <div style={{ fontSize: 8.5, color: "rgba(195,210,245,0.65)", textTransform: "uppercase", letterSpacing: "1.8px", marginBottom: 8, fontFamily: "'DM Sans',system-ui", fontWeight: 500 }}>Upcoming</div>
              {(() => {
                // Merge fyrtarn dates + user milestones into one sorted list
                const fyrtarnItems = fyrtarnDates
                  .filter(f => f.dateObj.getTime() > now.getTime())
                  .map(f => ({ type: "fyrtarn" as const, name: f.name, glyph: f.glyph, color: f.color, dateObj: f.dateObj, daysAway: Math.ceil((f.dateObj.getTime() - now.getTime()) / 86400000) }));
                const milestoneItems = milestones
                  .map(m => {
                    const d = new Date(m.date + "T00:00:00");
                    return { type: "milestone" as const, name: m.name, glyph: "Ã¢â€”â€¡", color: "#ffffff", dateObj: d, daysAway: Math.ceil((d.getTime() - now.getTime()) / 86400000) };
                  })
                  .filter(m => m.daysAway > 0);
                return [...fyrtarnItems, ...milestoneItems]
                  .sort((a, b) => a.daysAway - b.daysAway)
                  .slice(0, 6)
                  .map((item, idx) => (
                                        <div key={`upcoming-${idx}`} style={{ padding: "8px 12px", marginBottom: 6, borderRadius: 10, background: "rgba(8,12,25,.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${item.type === "milestone" ? "rgba(255,255,255,.18)" : "rgba(110,140,190,.18)"}`, fontSize: 10, letterSpacing: "0.3px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                      <div style={{ color: item.color, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12 }}>{item.glyph}</span>
                        <span style={{ textTransform: "uppercase", letterSpacing: "1px", fontSize: 9 }}>{item.name}</span>
                                                <span style={{ marginLeft: "auto", fontSize: 9.5, color: "rgba(210,225,255,0.85)", fontVariantNumeric: "tabular-nums" }}>{item.daysAway}d</span>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>

        {/* CENTER Ã¢â‚¬â€ Orbital (desktop only; mobile uses the section above) */}
                {!isMobile && (
        <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden", touchAction: "none" }} onWheel={(e) => e.preventDefault()}>
          {showOnboarding && (
            <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", animation: "onboardFade 4.2s ease forwards" }}>
              <div style={{ background: "rgba(6,10,22,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(50,80,140,0.25)", borderRadius: 12, padding: "16px 28px", display: "flex", gap: 28, alignItems: "center" }}>
                {[{ icon: "Ã°Å¸Å’Â", label: "Earth's orbit Ã‚Â· click to navigate" }, { icon: "Ã¢Ëœâ€°", label: "Sun at focus Ã‚Â· planets in motion" }, { icon: "Ã¢Å“Â¦", label: "Milestones Ã‚Â· spectral arcs", color: "rgba(150,170,220,0.5)" }].map(item => (
                  <div key={item.label} style={{ textAlign: "center" }}><div style={{ fontSize: 18, marginBottom: 4, color: item.color || "inherit" }}>{item.icon}</div><div style={{ fontSize: 9, color: "rgba(120,150,200,0.65)", fontFamily: "'DM Sans',system-ui", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{item.label}</div></div>
                ))}
              </div>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, opacity: viewModeTransition===viewMode?1:0, transition: "opacity 300ms ease" }}>
          <>
            <canvas ref={cvStarsRef} style={{ ...canvasStyle, zIndex: 1 }} />
            <canvas ref={cvOrbitRef} style={{ ...canvasStyle, zIndex: 2 }} />
            <canvas ref={cvHudRef} onClick={handleCanvasClick} style={{ ...canvasStyle, zIndex: 3, cursor: "crosshair" }} />

            {/* Branding Ã¢â‚¬â€ bottom-left engraving */}
            {isMounted && <div style={{ position: "absolute", bottom: 16, left: 20, zIndex: 10 }}>
              <div style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(60,90,140,0.25)" }}>Earth Moves</div>
              <div style={{ fontSize: 7, letterSpacing: "1.5px", color: "rgba(40,65,110,0.18)", marginTop: 1 }}>ORBITAL CALENDAR</div>
            </div>}

                        {/* Settings gear removed per request */}

            {/* Bottom-right Ã¢â‚¬â€ info icon + distance */}
            {isMounted && <div style={{ position: "absolute", bottom: 16, right: 20, zIndex: 10, display: "flex", alignItems: "flex-end", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "rgba(96,165,250,0.35)", letterSpacing: "0.3px", fontVariantNumeric: "tabular-nums" }}>{kmFormatted}</div>
                <div style={{ fontSize: 7, color: "rgba(40,65,110,0.25)", letterSpacing: "0.3px" }}>traveled this session</div>
              </div>
              <button 
                onClick={() => setShowInfoTip(v => !v)}
                style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(15,25,55,0.4)", border: "1px solid rgba(50,80,140,0.25)", color: "rgba(80,120,200,0.45)", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
              >Ã¢â€œËœ</button>
            </div>}

            {/* Info tooltip */}
            {showInfoTip && isMounted && (
              <div style={{ position: "absolute", bottom: 48, right: 20, zIndex: 20, maxWidth: 280, padding: "10px 14px", borderRadius: 8, background: "rgba(8,14,30,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(50,80,140,0.2)" }}>
                <div style={{ fontSize: 10, color: "rgba(160,190,240,0.65)", lineHeight: 1.6, letterSpacing: "0.2px", fontStyle: "italic" }}>{momentText}</div>
                <button onClick={() => setShowInfoTip(false)} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "rgba(80,110,165,0.4)", cursor: "pointer", fontSize: 12, padding: 0 }}>Ãƒâ€”</button>
              </div>
            )}
          </>
          </div>
        </div>
        )}
      </div>

      {/* Footer removed per v4 spec Ã¢â‚¬â€ km + tips moved to orbital overlay */}

            {showEventPanel && <EventPanel event={activeEvent} onClose={() => { setShowEventPanel(false); setActiveEvent(null); }} onSave={ev => setEvents(es => { const existing = es.find(e => e.id===ev.id); return existing ? es.map(e => e.id===ev.id?ev:e) : [...es, ev]; })} onDelete={id => setEvents(es => es.filter(e => e.id!==id))} />}
      {showSettings && <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />}

      {showMilestonePanel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,4,12,0.85)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) { setShowMilestonePanel(false); setNewMilestone({ name: "", description: "", date: new Date().toISOString().slice(0, 10) }); } }}>
          <div style={{ width: 400, maxWidth: "90vw", background: "rgba(8,12,25,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(110,140,190,0.22)", borderRadius: 16, padding: "24px 28px" }}>
            <div style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(160,208,128,0.7)", marginBottom: 20, fontFamily: "'DM Sans',system-ui" }}>Schedule Milestone</div>
            <input
              placeholder="Milestone name"
              value={newMilestone.name}
              onChange={e => setNewMilestone(m => ({...m, name: e.target.value}))}
              style={{ width: "100%", background: "rgba(15,25,55,0.5)", border: "1px solid rgba(110,140,190,0.2)", borderRadius: 10, padding: "10px 14px", color: "rgba(220,230,255,0.9)", fontSize: 13, marginBottom: 12, letterSpacing: "0.3px", fontFamily: "'DM Sans',system-ui" }}
            />
            <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
              <input
                type="date"
                value={newMilestone.date}
                onChange={e => setNewMilestone(m => ({...m, date: e.target.value}))}
                style={{ flex: 1, background: "rgba(15,25,55,0.5)", border: "1px solid rgba(60,100,180,0.2)", borderRadius: 5, padding: "10px 12px", color: "rgba(220,230,255,0.9)", fontSize: 12 }}
              />
              <div style={{ fontSize: 13, color: "rgba(96,165,250,0.65)", fontVariantNumeric: "tabular-nums", letterSpacing: "1px", minWidth: 80, textAlign: "right" }}>
                SOL {(() => {
                  const d = new Date(newMilestone.date + "T00:00:00");
                  const start = new Date(d.getFullYear(), 0, 0);
                  return String(Math.floor((Number(d) - Number(start)) / 86400000)).padStart(3, "0");
                })()}
              </div>
            </div>
            <textarea
              placeholder="Description (optional)"
              value={newMilestone.description}
              onChange={e => setNewMilestone(m => ({...m, description: e.target.value}))}
              style={{ width: "100%", height: 90, background: "rgba(15,25,55,0.5)", border: "1px solid rgba(60,100,180,0.2)", borderRadius: 5, padding: "10px 12px", color: "rgba(200,215,245,0.8)", fontSize: 12, resize: "vertical", lineHeight: 1.5 }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => { setShowMilestonePanel(false); setNewMilestone({ name: "", description: "", date: new Date().toISOString().slice(0, 10) }); }}
                style={{ flex: 1, padding: "9px", background: "rgba(8,12,25,0.8)", border: "1px solid rgba(110,140,190,0.2)", borderRadius: 16, color: "rgba(160,180,210,0.6)", fontSize: 11, cursor: "pointer", letterSpacing: "1px", fontFamily: "'DM Sans',system-ui" }}>CANCEL</button>
              <button onClick={() => {
                if (newMilestone.name) {
                  setMilestones(prev => [...prev, { id: Date.now().toString(), name: newMilestone.name, description: newMilestone.description, date: newMilestone.date }]);
                }
                setShowMilestonePanel(false);
                setNewMilestone({ name: "", description: "", date: new Date().toISOString().slice(0, 10) });
              }} style={{ flex: 1, padding: "9px", background: "rgba(60,140,80,0.25)", border: "1px solid rgba(80,180,120,0.3)", borderRadius: 16, color: "rgba(140,255,180,0.85)", fontSize: 11, cursor: "pointer", fontWeight: 500, letterSpacing: "1px", fontFamily: "'DM Sans',system-ui" }}>SCHEDULE</button>
            </div>
          </div>
        </div>
      )}

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
