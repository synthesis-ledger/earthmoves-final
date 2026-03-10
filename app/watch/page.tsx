"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════
// EARTH MOVES v3.5 — "True Black Void + Sharp Earth"
// "Time is not numbers on a screen. It is a planet moving through the void."
//
// NEW IN v3.5:
//   • 4× texture resolution (1024×512) — sharper continents + cities
//   • True deep-black cosmos — no blue tint, fills entire square
//   • Black Marble night fix — deep navy/black with crisp orange cities
//   • Earth fills bezel properly (Z.EARTH 0.865) — no thick white rim
//   • Extended Earth clip (drawR) — texture reaches outer visual limb
//   • Tidal peak glow dots removed — clean ellipse only
//   • Silver Veil day-side only — no night-side blue haze
//   • Balanced brightness boost — strong day, gentle night
//   • 820 Blue Noise stars + 420 faint distant fill stars
//
// CARRIED FROM v3.3:
//   • Chronological Flip — corrected polar bezel mapping (N=CCW, S=CW)
//   • White Sun + Orbital Vector — minimalist Copernicus iconography
//   • Digital-Thin Hand — 0.5px pure white chronological needle
//   • NASA VIIRS Cloud Layer — real-time macro weather screen-blended
//   • Atmospheric Limb Fresnel — sapphire halo on day-side horizon
//   • Black Marble stabilization — validated GIBS layer + TIME param
//   • Live NOAA SWPC space weather (K-index + Bz)
//   • Meteor shower calendar with visual activation
//   • Tidal ellipse — continuous gravitational geometry
//   • Astronaut lens — radial coordinate distortion
//   • Night floor 0.25 (airglow emulation)
//   • Blue Noise starfield (Poisson-disk)
//
// Z-SPACE ARCHITECTURE (back to front):
//   Layer 0:  Deep space + Blue Noise starfield + Milky Way haze
//   Layer 1:  Solar wind (behind bezel, K ≥ 4 only) + meteor streaks
//   Layer 2:  Earth — NASA texture + cloud blend OR polygon fallback
//   Layer 3:  City lights (night-side screen composite)
//   Layer 4:  Aurora borealis/australis (NOAA K-index conditional)
//   Layer 5:  Silver Veil + noise overlay
//   Layer 6:  Bézier glass glint (sapphire crystal) + Fresnel limb
//   Layer 7:  Atmosphere glow + M2/S2 tidal ellipses
//   Layer 8:  Satellites, location pins, digital-thin hand
//   Layer 9:  Hour markers, White Sun, Orbital Vector (pole-aware)
//   Layer 10: Moon (outside bezel)
//   Layer 11: HUD tooltip
//   Layer 12: Digital time + status bar
// ═══════════════════════════════════════════════════════════════════════

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const TAU = Math.PI * 2;

// ─── SPATIAL HIERARCHY ────────────────────────────────────────────────
// v3.5: EARTH enlarged from 0.75 → 0.865 so globe fills bezel properly
// at higher texture resolutions. ATMOS and BUFFER_IN scaled accordingly.
const Z = {
  EARTH: 0.82, ATMOS: 0.87, BUFFER_IN: 0.89,
  HOUR_RING: 0.88, TICK_OUTER: 0.96, BEZEL: 1.00,
  MOON_ORBIT: 1.15, DEEP_LIMIT: 1.30,
};

const CFG = {
  MOON_R: 0.042, ISS_DOT: 3, LOC_DOT: 3.2, COAST_W: 0.55,
  WIND_N: 90, AURORA_SEGMENTS: 60, NOISE_OPACITY: 0.045,
  GLOBE_CACHE_SECS: 30,
  TEX_W: 2000, TEX_H: 1000,    // v3.6: 2000×1000 matched equirectangular
  // Fixed physical sizes in pixels — immune to zoom
  DOT_PX: 4,          // ISS, Tiangong, location pins
  GLOW_PX: 14,        // glow halo radius around dots
  LABEL_PX: 11,       // label font size
  ISS_LABEL_PX: 10,   // ISS/CSS label font size
};

// LOCAL TEXTURES (in /public/)
const DAY_TEX = "/day.jpg";
const NIGHT_TEX = "/night.jpg";
const MOON_TEX = "/moon_texture.jpg";

// NASA GIBS cloud layer (VIIRS True Color, 2 days behind for availability)
const GIBS_CLOUD_BASE =
  "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi" +
  "?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1" +
  "&SRS=EPSG:4326&BBOX=-180,-90,180,90&FORMAT=image/jpeg";
const getGibsCloudsUrl = (date: Date) =>
  `${GIBS_CLOUD_BASE}&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&WIDTH=${CFG.TEX_W}&HEIGHT=${CFG.TEX_H}&TIME=${date.toISOString().slice(0, 10)}`;

// ═══════════════════════════════════════════════════════════════════════
//  ASTRONOMY ENGINE
// ═══════════════════════════════════════════════════════════════════════

function jd(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5;
}

function jc(j: number): number {
  return (j - 2451545.0) / 36525.0;
}

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
  return { dec, subLon, GMST };
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

function zenith(lat: number, lon: number, sDec: number, sLon: number): number {
  const a = lat * DEG, b = lon * DEG, c = sDec * DEG, d = sLon * DEG;
  return Math.acos(Math.max(-1, Math.min(1,
    Math.sin(a) * Math.sin(c) + Math.cos(a) * Math.cos(c) * Math.cos(b - d))));
}

// ─── PERLIN-LIKE NOISE ────────────────────────────────────────────────
function smoothNoise(x: number): number {
  const i = Math.floor(x), f = x - i;
  const a = Math.sin(i * 127.1 + 311.7) * 43758.5453 % 1;
  const b = Math.sin((i + 1) * 127.1 + 311.7) * 43758.5453 % 1;
  const t = f * f * (3 - 2 * f);
  return a + (b - a) * t;
}

// ─── METEOR SHOWERS DATA (update once per year) ──────────────────────
const METEOR_SHOWERS = [
  { name: "Lyrids", peak: new Date("2026-04-22"), zhr: 18, active: [4, 30] },
  { name: "η Aquariids", peak: new Date("2026-05-06"), zhr: 50, active: [4, 28] },
  { name: "Perseids", peak: new Date("2026-08-12"), zhr: 100, active: [7, 24] },
  { name: "Draconids", peak: new Date("2026-10-08"), zhr: 10, active: [10, 10] },
  { name: "Orionids", peak: new Date("2026-10-21"), zhr: 20, active: [10, 7] },
  { name: "Leonids", peak: new Date("2026-11-17"), zhr: 15, active: [11, 30] },
  { name: "Geminids", peak: new Date("2026-12-14"), zhr: 150, active: [12, 17] },
  { name: "Ursids", peak: new Date("2026-12-22"), zhr: 10, active: [12, 26] },
];

function getNextMeteorShower(now: Date) {
  return METEOR_SHOWERS
    .map(s => ({ ...s, days: Math.ceil((s.peak.getTime() - now.getTime()) / 86400000) }))
    .sort((a, b) => a.days - b.days)
    .find(s => s.days >= -2 && s.days <= 30) || null;
}

// ─── BLUE NOISE STARFIELD GENERATOR ──────────────────────────────────
interface StarPoint { x: number; y: number; brightness: number; size: number; seed: number; }

function generateBlueNoiseStars(count: number, S: number, bz: number, cx: number, cy: number): StarPoint[] {
  const stars: StarPoint[] = [];
  const cellSize = S / Math.sqrt(count);
  const grid: Map<string, StarPoint> = new Map();

  // Poisson-disk sampling approximation via dart throwing
  let attempts = 0;
  const maxAttempts = count * 30;
  while (stars.length < count && attempts < maxAttempts) {
    attempts++;
    const x = Math.random() * S;
    const y = Math.random() * S;

    const gx = Math.floor(x / cellSize);
    const gy = Math.floor(y / cellSize);
    let tooClose = false;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const key = `${gx + dx},${gy + dy}`;
        const neighbor = grid.get(key);
        if (neighbor) {
          const nd = Math.sqrt((x - neighbor.x) ** 2 + (y - neighbor.y) ** 2);
          if (nd < cellSize * 0.7) { tooClose = true; break; }
        }
      }
      if (tooClose) break;
    }
    if (tooClose) continue;

    const star: StarPoint = {
      x, y,
      brightness: 0.05 + Math.random() * 0.55,
      size: 0.2 + Math.random() * 0.8,
      seed: Math.random() * 100,
    };
    stars.push(star);
    grid.set(`${gx},${gy}`, star);
  }
  return stars;
}

// ─── INVERSE ASTRONAUT LENS ───────────────────────────────────────────
// buildGlobeCache warps: warpedRatio = d^(0.82 + 0.12*d²)
// This inverts it: given target (the linear geo ratio), find d (screen ratio)
function invertWarp(target: number): number {
  if (target <= 0) return 0;
  if (target >= 1) return 1;
  // Initial guess: inverse of d^0.82 ≈ target^(1/0.82)
  let d = Math.pow(target, 1.0 / 0.82);
  // 4 Newton iterations converge to <0.001% error
  for (let i = 0; i < 4; i++) {
    const exp = 0.82 + 0.12 * d * d;
    const f = Math.pow(d, exp) - target;
    // derivative: d^exp * (exp/d + 0.24*d*ln(d))
    const lnD = d > 1e-10 ? Math.log(d) : -23;
    const df = Math.pow(d, exp) * (exp / d + 0.24 * d * lnD);
    if (Math.abs(df) < 1e-12) break;
    d = Math.max(0, Math.min(1.3, d - f / df));
  }
  return d;
}

// ─── POLE-AWARE PROJECTION ────────────────────────────────────────────
function geo2xy(lat: number, lon: number, utcH: number, cx: number, cy: number, eR: number, south = false): { x: number; y: number; r: number } {
  if (south) {
    const linR = Math.max(0, (90 + lat) / 95);
    const r = eR * invertWarp(linR);
    const a = (utcH + lon / 15) * (Math.PI / 12);
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a), r };
  }
  const linR = Math.max(0, (90 - lat) / 95);
  const r = eR * invertWarp(linR);
  const a = (utcH + lon / 15) * (Math.PI / 12) - Math.PI;
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a), r };
}

// v3.3: Corrected Polar Chronological Mapping
function hourAngleFor(h: number, south = false): number {
  return south ? h * (Math.PI / 12) : (h - 12) * (Math.PI / 12);
}

// ─── GLOBE TEXTURE CACHE BUILDER ─────────────────────────────────────
function buildGlobeCache(
  dayPx: Uint8ClampedArray | null,
  nightPx: Uint8ClampedArray | null,
  cloudPx: Uint8ClampedArray | null,
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

  // v3.5: Ocean base — slightly warmer
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
  const sDec = 23.45 * Math.sin((Math.PI / 180) * (360 / 365) * (dayOfYear - 80));

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
      const nIdx = (ty * texW + tx) * 4;

      const phi = lat * DEG, delta = sDec * DEG, hAngle = (lon - sun.subLon) * DEG;
      const cosZ = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(hAngle);
      const z = Math.acos(Math.max(-1, Math.min(1, cosZ))) * RAD;

      let r: number, g: number, b: number;

      // Continuous blend factor: 0 = full day, 1 = full night
      // Uses smoothstep for seamless terminator
      const blendRaw = Math.max(0, Math.min(1, (z - 90) / 18));
      const blend = blendRaw * blendRaw * (3 - 2 * blendRaw); // smoothstep

      const dr = dayPx[dIdx], dg = dayPx[dIdx + 1], db = dayPx[dIdx + 2];
      const nr = nightPx[nIdx], ng = nightPx[nIdx + 1], nb = nightPx[nIdx + 2];

      r = dr * (1 - blend) + nr * blend;
      g = dg * (1 - blend) + ng * blend;
      b = db * (1 - blend) + nb * blend;

      // Warm horizon glow near sunset (z 88-96)
      if (z > 88 && z < 96) {
        const wf = 1 - Math.abs(z - 92) / 4; // peaks at z=92
        r = Math.min(255, r + wf * 22);
        g = Math.min(255, g + wf * 8);
        b = Math.max(0, b - wf * 5);
      }

      const idx = (py * size + px) * 4;

      // v3.6: Screen-blend cloud layer over terrain (day-side only, fades with blend)
      if (cloudPx) {
        const cIdx = (ty * texW + tx) * 4;
        const cr = cloudPx[cIdx], cg = cloudPx[cIdx + 1], cb = cloudPx[cIdx + 2];
        const cloudVis = 0.55 * (1 - blend);  // fades smoothly into night
        const cloudBright = (cr + cg + cb) / 3;
        if (cloudBright > 80 && cloudVis > 0.01) {
          const cf = cloudVis * Math.min(1, (cloudBright - 80) / 175);
          r = r * (1 - cf) + (255 - (255 - r) * (255 - cr) / 255) * cf;
          g = g * (1 - cf) + (255 - (255 - g) * (255 - cg) / 255) * cf;
          b = b * (1 - cf) + (255 - (255 - b) * (255 - cb) / 255) * cf;
        }
      }

      // ───── v3.6 Smooth brightness — continuous day→night curve ─────
      // Day boost fades smoothly into night lift using the blend factor
      const dayBoost = (1 - blend) * 0.20;   // up to +20% on day side
      const nightLift = blend * 0.65;          // up to +65% on night side (city lights)
      const boostFactor = 1.0 + dayBoost + nightLift;
      const addR = (1 - blend) * 14;
      const addG = (1 - blend) * 10;
      const addB = (1 - blend) * 16;

      r = Math.min(255, r * boostFactor + addR);
      g = Math.min(255, g * boostFactor * (1 - blend * 0.04) + addG);
      b = Math.min(255, b * boostFactor * (1 + blend * 0.03) + addB);

      data[idx] = Math.round(r); data[idx + 1] = Math.round(g);
      data[idx + 2] = Math.round(b); data[idx + 3] = 255;
    }
  }

  ctx.putImageData(buf, 0, 0);
  return cache;
}

// ─── COASTLINE DATA ───────────────────────────────────────────────────
const COASTS: Record<string, number[][]> = {
  na: [[83,70],[80,95],[78,110],[76,140],[72,157],[70,165],[68,160],[64,165],[60,165],[55,164],[52,172],[50,170],[48,178],[46,-178],[44,-170],[42,-165],[38,-158],[34,-152],[30,-140],[25,-125],[23,-117],[20,-107],[20,-103],[24,-100],[28,-97],[30,-93],[30,-88],[28,-83],[25,-80],[24,-82],[27,-86],[30,-88],[30,-90],[30,-95],[33,-95],[37,-95],[40,-93],[43,-90],[45,-87],[48,-88],[49,-95],[52,-95],[55,-96],[58,-93],[60,-90],[62,-85],[60,-78],[64,-78],[67,-75],[70,-72],[72,-70],[75,-70],[78,-73],[80,-70],[82,-63],[83,-70],[82,-62],[83,70]],
  eu: [[71,25],[70,30],[67,26],[65,25],[62,22],[60,20],[58,17],[57,12],[55,8],[54,9],[55,12],[54,14],[52,14],[51,12],[50,8],[49,6],[48,5],[47,2],[44,0],[43,-2],[41,-4],[37,-6],[36,-5],[38,-1],[37,0],[38,3],[40,3],[42,5],[43,8],[44,10],[41,14],[40,17],[38,20],[35,24],[36,28],[38,27],[40,25],[42,28],[44,30],[46,30],[48,28],[50,30],[52,24],[54,22],[56,20],[58,22],[60,24],[62,27],[65,28],[68,28],[70,28],[71,25]],
  as: [[72,105],[70,90],[68,77],[66,70],[64,68],[60,60],[57,55],[55,50],[52,48],[50,45],[47,42],[44,40],[42,37],[40,35],[37,36],[35,35],[32,35],[30,33],[28,35],[25,37],[22,40],[18,43],[15,44],[12,45],[10,50],[8,55],[5,60],[3,72],[1,80],[2,95],[5,100],[8,105],[5,108],[1,110],[0,115],[-2,117],[-5,118],[-8,115],[-5,125],[-2,130],[0,132],[3,128],[5,120],[8,118],[12,115],[15,110],[18,108],[20,107],[22,108],[25,110],[28,112],[30,115],[32,118],[35,120],[37,122],[40,123],[42,130],[43,132],[45,135],[43,140],[42,143],[44,145],[48,143],[50,140],[52,140],[54,137],[56,135],[60,140],[62,145],[64,160],[66,170],[68,175],[70,178],[72,175],[73,165],[72,155],[72,140],[73,130],[75,120],[76,110],[75,100],[72,105]],
  af: [[37,-6],[36,-1],[35,0],[34,2],[33,5],[32,8],[30,10],[28,10],[25,12],[22,15],[18,18],[15,18],[12,16],[8,12],[5,10],[3,10],[0,10],[-3,12],[-5,13],[-10,15],[-15,18],[-20,20],[-25,22],[-28,25],[-30,28],[-33,27],[-34,25],[-34,20],[-33,18],[-30,17],[-25,15],[-20,13],[-15,12],[-10,10],[-5,8],[0,5],[5,2],[8,0],[10,-3],[12,-8],[15,-12],[18,-16],[20,-17],[22,-16],[25,-14],[28,-10],[30,-8],[32,-5],[35,-5],[37,-6]],
  sa: [[12,-70],[10,-72],[8,-77],[5,-78],[2,-80],[0,-80],[-2,-81],[-5,-80],[-8,-78],[-10,-77],[-15,-75],[-18,-72],[-20,-70],[-23,-65],[-25,-60],[-28,-55],[-30,-52],[-33,-52],[-35,-55],[-38,-58],[-42,-62],[-45,-65],[-48,-68],[-50,-70],[-52,-72],[-54,-70],[-55,-67],[-54,-64],[-52,-60],[-48,-55],[-45,-50],[-40,-48],[-35,-40],[-30,-38],[-25,-35],[-20,-35],[-15,-38],[-10,-38],[-5,-35],[0,-35],[2,-40],[5,-52],[7,-58],[8,-62],[10,-65],[12,-70]],
  au: [[-12,130],[-14,127],[-16,123],[-18,122],[-20,118],[-22,114],[-25,113],[-28,114],[-30,115],[-32,116],[-34,118],[-35,120],[-36,137],[-37,140],[-38,145],[-37,148],[-35,150],[-33,152],[-30,153],[-27,153],[-25,152],[-22,150],[-20,148],[-18,146],[-16,145],[-14,142],[-12,140],[-12,137],[-15,135],[-14,132],[-12,130]],
  gl: [[84,-30],[83,-24],[82,-20],[80,-18],[78,-17],[76,-18],[74,-20],[72,-22],[70,-25],[68,-30],[66,-35],[65,-40],[64,-44],[63,-50],[64,-52],[66,-54],[68,-53],[70,-52],[72,-50],[74,-48],[76,-45],[78,-40],[80,-35],[82,-30],[84,-30]],
  uk: [[58,-5],[57,-6],[56,-5],[55,-3],[54,-3],[53,-4],[52,-4],[51,-5],[50,-5],[50,-3],[51,-1],[52,0],[53,1],[54,0],[55,-1],[56,-2],[57,-2],[58,-5]],
  jp: [[45,142],[44,145],[43,146],[42,143],[40,140],[38,140],[36,140],[35,137],[34,135],[33,132],[33,130],[34,131],[35,133],[36,136],[37,137],[38,139],[40,140],[42,141],[43,143],[45,142]],
  nz: [[-35,174],[-37,175],[-38,177],[-40,176],[-42,173],[-44,170],[-46,168],[-46,167],[-45,167],[-43,170],[-41,172],[-39,175],[-37,176],[-35,174]],
};

const LAND_FILL: Record<string, string> = {
  na:"#2d6e3c",eu:"#327040",as:"#2e6a38",af:"#5c7e3c",sa:"#387c3e",
  au:"#7c6e3c",gl:"#c8d4de",uk:"#327040",jp:"#327040",nz:"#327040",
};

// ─── CITY LIGHTS ──────────────────────────────────────────────────────
const CITIES: number[][] = [
  [51.5,-.1,5],[48.9,2.3,4],[40.7,-74,5],[34,-118.2,4],[41.9,-87.6,3],
  [35.7,139.7,5],[37.6,127,4],[39.9,116.4,5],[31.2,121.5,5],[22.3,114.2,4],
  [28.6,77.2,5],[19,72.9,5],[13.1,80.3,3],[55.8,37.6,4],[59.3,18.1,2],
  [52.5,13.4,3],[50.1,14.4,2],[48.2,16.4,2],[41.4,2.2,3],[45.5,-73.6,2],
  [43.7,-79.4,3],[-23.5,-46.6,4],[-34.6,-58.4,3],[-33.9,151.2,3],
  [-37.8,145,3],[1.3,103.8,3],[3.1,101.7,2],[14.6,121,3],[13.8,100.5,3],
  [-6.2,106.8,3],[33.4,-112,2],[29.8,-95.4,3],[30,31,3],[-1.3,36.8,2],
  [-26.2,28,2],[6.5,3.4,3],[25.3,55.3,3],[24.7,46.7,2],[35.7,51.4,3],
  [41,29,3],[38,23.7,2],[52.2,21,2],[59.4,24.7,1],[63.4,10.4,1],
  [60.4,5.3,1],[59.9,10.7,2],[55.7,12.6,2],[53.3,-6.3,1],[64.1,-21.9,1],
  [-15.8,-48,2],[-12,-77,2],[4.6,-74.1,2],[19.4,-99.1,4],[10.5,-66.9,2],
  [60.2,24.9,2],[44.4,26.1,2],[44.8,20.5,2],[40.4,-3.7,3],[37.4,-6,2],
  [45.1,7.7,1],[40.9,14.3,2],[38.1,13.4,1],[-33.4,-70.7,2],[-34.9,-56.2,1],
];

// ─── LOCATION DATA ────────────────────────────────────────────────────
const LC = ["#5C9CF5","#6BCB77","#F0A04B","#C084FC","#4ECDC4"];

interface LocEntry { name: string; lat: number; lon: number; }
interface LocEntryWithColor extends LocEntry { color: string; }

const L0: LocEntry[] = [
  {name:"Kyiv",lat:50.4501,lon:30.5234},
  {name:"Houston",lat:29.7604,lon:-95.3584},
  {name:"Shanghai",lat:31.2304,lon:121.4737},
  {name:"New York",lat:40.7128,lon:-74.006},
  {name:"Tokyo",lat:35.6762,lon:139.6503},
];

const LP: LocEntry[] = [
  {name:"London",lat:51.5074,lon:-.1278},{name:"Houston",lat:29.7604,lon:-95.3584},
  {name:"Shanghai",lat:31.2304,lon:121.4737},{name:"New York",lat:40.7128,lon:-74.006},
  {name:"Tokyo",lat:35.6762,lon:139.6503},{name:"Sydney",lat:-33.8688,lon:151.2093},
  {name:"Oslo",lat:59.9139,lon:10.7522},{name:"Dubai",lat:25.2048,lon:55.2708},
  {name:"São Paulo",lat:-23.5505,lon:-46.6333},{name:"Mumbai",lat:19.076,lon:72.8777},
  {name:"Singapore",lat:1.3521,lon:103.8198},{name:"Los Angeles",lat:34.0522,lon:-118.2437},
  {name:"Paris",lat:48.8566,lon:2.3522},{name:"Berlin",lat:52.52,lon:13.405},
  {name:"Kyiv",lat:50.4501,lon:30.5234},{name:"Cape Town",lat:-33.9249,lon:18.4241},
  {name:"Beijing",lat:39.9042,lon:116.4074},{name:"Mexico City",lat:19.4326,lon:-99.1332},
  {name:"Cairo",lat:30.0444,lon:31.2357},{name:"Bogotá",lat:4.711,lon:-74.0721},
  {name:"Stockholm",lat:59.3293,lon:18.0686},{name:"Reykjavík",lat:64.1466,lon:-21.9426},
  {name:"Buenos Aires",lat:-34.6037,lon:-58.3816},{name:"Nairobi",lat:-1.2921,lon:36.8219},
];

// ─── SOLAR WIND ───────────────────────────────────────────────────────
interface WindParticle {
  a: number; d: number; v: number; life: number; max: number;
  sz: number; op: number; dr: number;
}

function spawnWP(wR: number): WindParticle {
  return {
    a: (Math.random() - .5) * .9, d: wR * (Z.DEEP_LIMIT + Math.random() * .1),
    v: .12 + Math.random() * .45, life: 0, max: 70 + Math.random() * 90,
    sz: .3 + Math.random() * 1.1, op: .12 + Math.random() * .3,
    dr: (Math.random() - .5) * .012,
  };
}

function mkNoise(n: number): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = n; c.height = n;
  const x = c.getContext("2d")!, d = x.createImageData(n, n);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.random() * 255;
    d.data[i] = v; d.data[i+1] = v; d.data[i+2] = v;
    d.data[i+3] = Math.floor(255 * CFG.NOISE_OPACITY);
  }
  x.putImageData(d, 0, 0); return c;
}

// ─── HUD TOOLTIP TYPE ─────────────────────────────────────────────────
interface HovInfo {
  type: string; x: number; y: number; lat: number; lon: number;
  extra?: string; spd?: string;
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function EarthMoves() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const afRef = useRef<number | null>(null);
  const noiseRef = useRef<HTMLCanvasElement | null>(null);
  const wpRef = useRef<WindParticle[]>([]);
  const issR = useRef<{lat:number,lon:number,ok:boolean}>({lat:0,lon:0,ok:false});
  const tgR = useRef<{lat:number,lon:number,ok:boolean}>({lat:0,lon:0,ok:false});
  const kIndexR = useRef<number>(2);

  const starsRef = useRef<StarPoint[] | null>(null);

  // Custom ISS & CSS PNG icons (placed in public/ folder)
  const issImgRef = useRef<HTMLImageElement | null>(null);
  const cssImgRef = useRef<HTMLImageElement | null>(null);

  const [activeMeteorShower, setActiveMeteorShower] = useState<string | null>(null);
  const meteorStreaksRef = useRef<{x:number,y:number,angle:number,life:number,max:number,speed:number,len:number}[]>([]);

  // NASA texture refs
  const dayPixRef = useRef<Uint8ClampedArray | null>(null);
  const nightPixRef = useRef<Uint8ClampedArray | null>(null);
  const cloudPixRef = useRef<Uint8ClampedArray | null>(null);
  const moonPixRef = useRef<Uint8ClampedArray | null>(null);
  const cloudReadyRef = useRef<boolean>(false);
  const texReadyRef = useRef<boolean>(false);
  const globeCacheRef = useRef<HTMLCanvasElement | null>(null);
  const globeCacheTimeRef = useRef<number>(0);
  const lastRadiusRef = useRef<number>(0);
  const lastSizeRef = useRef<{w:number,h:number}>({w:0,h:0});

  const [now, setNow] = useState(new Date());
  const [locs, setLocs] = useState<LocEntryWithColor[]>(L0.map((l, i) => ({...l, color: LC[i]})));
  const [panel, setPanel] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [windOn, setWindOn] = useState(true);
  const [windHigh, setWindHigh] = useState(false);
  const [mp, setMp] = useState<{x:number,y:number}>({x:0, y:0});
  const [issInfo, setIssInfo] = useState<{lat:number,lon:number} | null>(null);

  const getSunDeclination = (date: Date) => {
    const dayOfYear = (Number(date) - Number(new Date(date.getFullYear(), 0, 0))) / 86400000;
    return 23.45 * Math.sin((Math.PI / 180) * (360 / 365) * (dayOfYear - 80));
  };
  const sunDeclination = getSunDeclination(now);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const AMBIENT_LIGHT = 0.25;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sunDeclination = sunDeclination;

  const [southPole, setSouthPole] = useState(false);
  const [hemisphereAuto, setHemisphereAuto] = useState(true);
  const [hourMode, setHourMode] = useState<"min"|"mid"|"max">("mid");
  const [texStatus, setTexStatus] = useState<"loading"|"ready"|"fallback">("loading");

  const [userLat, setUserLat] = useState(51.4769);
  const [userLon, setUserLon] = useState(0.0005);
  const [observerCity, setObserverCity] = useState("Greenwich");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Time ticker ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Geolocation → hemisphere detection + observer location ────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
        setObserverCity("Auto-detected");
        if (pos.coords.latitude < -10) {
          setSouthPole(true);
          setHemisphereAuto(true);
        }
      },
      () => { /* permission denied — stay default Greenwich */ }
    );
  }, []);

  // ── NASA GIBS texture loader ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadTex = (url: string): Promise<Uint8ClampedArray> => new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const oc = document.createElement("canvas");
        oc.width = CFG.TEX_W; oc.height = CFG.TEX_H;
        const ctx = oc.getContext("2d")!;
        ctx.drawImage(img, 0, 0, CFG.TEX_W, CFG.TEX_H);
        res(ctx.getImageData(0, 0, CFG.TEX_W, CFG.TEX_H).data);
      };
      img.onerror = rej;
      img.src = url;
    });

    const today = new Date();
    const cloudDate = new Date(today.getTime() - 86400000 * 2);

    Promise.all([loadTex(DAY_TEX), loadTex(NIGHT_TEX)])
      .then(([day, night]) => {
        if (cancelled) return;
        dayPixRef.current = day;
        nightPixRef.current = night;
        texReadyRef.current = true;
        globeCacheRef.current = null;
        globeCacheTimeRef.current = 0;
        setTexStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setTexStatus("fallback");
      });

// Load local Moon texture from public/moon_texture.jpg
    loadTex(MOON_TEX)
      .then(moon => {
        if (cancelled) return;
        moonPixRef.current = moon;
        console.log("✅ Moon texture loaded successfully from local storage");
      })
      .catch((err) => {
        console.error("❌ Moon texture failed to load:", err);
      });

    // NASA GIBS cloud layer (real-time weather)
    loadTex(getGibsCloudsUrl(cloudDate))
      .then(clouds => {
        if (cancelled) return;
        cloudPixRef.current = clouds;
        cloudReadyRef.current = true;
        globeCacheRef.current = null;
        globeCacheTimeRef.current = 0;
        console.log("✅ GIBS cloud layer loaded");
      })
      .catch(() => {
        console.log("NASA GIBS cloud layer unavailable — continuing without clouds");
      });

    return () => { cancelled = true; };
  }, []);

  // ── ISS live position ─────────────────────────────────────────────────
  useEffect(() => {
    const f = async () => {
      try {
        const r = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        const d = await r.json();
        if (d.latitude !== undefined) {
          issR.current = {lat: d.latitude, lon: d.longitude, ok: true};
          setIssInfo({lat: d.latitude, lon: d.longitude});
        }
      } catch {
        const t = Date.now() / 1000, p = 92.9 * 60, ph = (t % p) / p;
        issR.current = {lat: 51.6 * Math.sin(ph * TAU * 1.1), lon: ((ph * 360 + (t / 86400) * 360) % 360) - 180, ok: true};
        setIssInfo(issR.current);
      }
    };
    f(); const iv = setInterval(f, 25000); return () => clearInterval(iv);
  }, []);

// ── Tiangong (CSS) LIVE REAL POSITION — via Next.js proxy
useEffect(() => {
  const updatePosition = async () => {
    try {
      const res = await fetch('/api/tiangong');
      const data = await res.json();

      if (data.positions?.length > 0) {
        const pos = data.positions[0];
        tgR.current = { lat: pos.satlatitude, lon: pos.satlongitude, ok: true };
        console.log(`✅ LIVE TIANGONG: ${pos.satlatitude.toFixed(2)}°N ${pos.satlongitude.toFixed(2)}°E`);
      }
    } catch (e) {
      console.error("Tiangong fetch failed", e);
    }
  };

  updatePosition();
  const iv = setInterval(updatePosition, 18000);
  return () => clearInterval(iv);
}, []);

  // ── NOAA K-index (LIVE from SWPC) ──────────────────────────────────
  useEffect(() => {
    const fetchSpaceWeather = async () => {
      try {
        const [kpRes, magRes] = await Promise.all([
          fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
          fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json')
        ]);
        const kpData = await kpRes.json();
        const magData = await magRes.json();

        const currentKp = parseFloat(kpData[kpData.length - 1][1]);
        const bz = parseFloat(magData[magData.length - 1][3]);

        kIndexR.current = Math.round(currentKp);
        setWindHigh(currentKp >= 4 || bz < -5);
      } catch {
        console.log("NOAA SWPC unavailable — using fallback simulated Kp");
        const simK = Math.random() > 0.7 ? Math.floor(4 + Math.random() * 4) : Math.floor(1 + Math.random() * 3);
        kIndexR.current = simK;
        setWindHigh(simK >= 4);
      }
    };

    fetchSpaceWeather();
    const iv = setInterval(fetchSpaceWeather, 300000);
    return () => clearInterval(iv);
  }, []);

  // ── Noise texture ─────────────────────────────────────────────────────
  useEffect(() => { noiseRef.current = mkNoise(256); }, []);

  // ── Meteor shower detection ─────────────────────────────────────────
  useEffect(() => {
    const checkMeteor = () => {
      const next = getNextMeteorShower(now);
      if (next && Math.abs(next.days) <= 2) {
        setActiveMeteorShower(next.name);
      } else {
        setActiveMeteorShower(null);
      }
    };
    checkMeteor();
    const iv = setInterval(checkMeteor, 60000);
    return () => clearInterval(iv);
  }, [now]);

  // ── Mouse move ────────────────────────────────────────────────────────
  const onMM = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = cvRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    setMp({x: e.clientX - r.left, y: e.clientY - r.top});
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  //  RENDER LOOP
  // ═════════════════════════════════════════════════════════════════════
  const render = useCallback(() => {
    const cv = cvRef.current; if (!cv) return;
    const c = cv.getContext("2d");
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = cv.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    const S = Math.min(W, H, 720);  // chronometer stays capped
    cv.width = W * dpr; cv.height = H * dpr; c.scale(dpr, dpr);

    const cx = W / 2, cy = H / 2;
    const wR = S * .44;
    const eR = wR * Z.EARTH;
    const atR = wR * Z.ATMOS;
    const bfI = wR * Z.BUFFER_IN;

    // Rebuild globe texture when size changes
    if (texReadyRef.current && Math.abs(eR - lastRadiusRef.current) > 4) {
      globeCacheRef.current = null;
      globeCacheTimeRef.current = 0;
      starsRef.current = null;
      lastRadiusRef.current = eR;
    }
    // Rebuild stars when viewport changes
    if (Math.abs(W - lastSizeRef.current.w) > 4 || Math.abs(H - lastSizeRef.current.h) > 4) {
      starsRef.current = null;
      lastSizeRef.current = {w: W, h: H};
    }

    const tO = wR * Z.TICK_OUTER;
    const bz = wR * Z.BEZEL;
    const mO = wR * Z.MOON_ORBIT;

    const utcH = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    const sun = solar(now);
    const mn = lunar(now);
    const kIdx = kIndexR.current;
    const t = Date.now() / 1000;
    const sp = southPole;

    c.clearRect(0, 0, W, H);

    // Globe cache rebuild
    const nowSec = Math.floor(Date.now() / 1000);
    if (texReadyRef.current &&
        (!globeCacheRef.current || nowSec - globeCacheTimeRef.current >= CFG.GLOBE_CACHE_SECS)) {
      globeCacheRef.current = buildGlobeCache(
        dayPixRef.current, nightPixRef.current, cloudPixRef.current,
        CFG.TEX_W, CFG.TEX_H, eR, sun, utcH, sp
      );
      globeCacheTimeRef.current = nowSec;
    }

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 0: DEEP SPACE — True black void + full starfield
    // ═══════════════════════════════════════════════════════════════
    c.fillStyle = "#000000";
    c.fillRect(0, 0, W, H);

    // Subtle radial — pure black, no blue tint
    const bg = c.createRadialGradient(cx, cy, wR * 0.18, cx, cy, Math.max(W, H) * 0.6);
    bg.addColorStop(0, "#060810");
    bg.addColorStop(0.5, "#020306");
    bg.addColorStop(1, "#000000");
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    // Subtle Milky Way band
    c.save();
    c.globalCompositeOperation = "screen";
    const mwAngle = -0.35;
    c.translate(cx, cy); c.rotate(mwAngle); c.translate(-cx, -cy);
    const mwGrad = c.createLinearGradient(0, cy - S * .08, 0, cy + S * .08);
    mwGrad.addColorStop(0, "rgba(45,55,85,0)");
    mwGrad.addColorStop(0.3, "rgba(55,65,100,.018)");
    mwGrad.addColorStop(0.5, "rgba(65,75,110,.028)");
    mwGrad.addColorStop(0.7, "rgba(55,65,100,.018)");
    mwGrad.addColorStop(1, "rgba(45,55,85,0)");
    c.fillStyle = mwGrad;
    c.fillRect(0, cy - H * .08, W, H * .16);
    c.restore();

    // Blue Noise stars (v3.5: 1200 count for full viewport coverage)
    const starArea = Math.max(W, H);
    if (!starsRef.current) {
      starsRef.current = generateBlueNoiseStars(1200, starArea, bz, cx, cy)
        .map(s => ({ ...s, x: s.x + (cx - starArea/2), y: s.y + (cy - starArea/2) }));
    }
    starsRef.current.forEach(star => {
      const twinkle = 0.5 + 0.5 * Math.sin(t * 0.25 + star.seed * 2.3);
      const alpha = star.brightness * twinkle;
      const temp = star.seed % 3;
      const col = temp < 1 ? `rgba(200,210,240,${alpha})`
        : temp < 2 ? `rgba(255,230,200,${alpha * 0.9})`
        : `rgba(180,195,225,${alpha * 0.8})`;
      c.fillStyle = col;
      c.beginPath(); c.arc(star.x, star.y, star.size, 0, TAU); c.fill();
    });

    // v3.5: Extra faint distant stars — fills full viewport
    c.globalAlpha = 0.45;
    for (let i = 0; i < 520; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * H;
      const br = 0.12 + Math.random() * 0.28;
      c.fillStyle = `rgba(195,210,245,${br})`;
      c.fillRect(sx - 0.4, sy - 0.4, 0.8, 0.8);
    }
    c.globalAlpha = 1;

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 1: SOLAR WIND
    // ═══════════════════════════════════════════════════════════════
    const showWind = windOn && (windHigh || kIdx >= 4);
    if (showWind) {
      while (wpRef.current.length < CFG.WIND_N) wpRef.current.push(spawnWP(wR));
      wpRef.current.forEach((p, i) => {
        p.life++; p.d -= p.v * (windHigh ? 1.6 : .7); p.a += p.dr;
        if (p.life > p.max || p.d < bz + 1) { wpRef.current[i] = spawnWP(wR); return; }
        const px = cx + p.d * Math.cos(p.a), py = cy + p.d * Math.sin(p.a);
        const pd = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        if (pd <= bz || pd > Math.max(W, H) * .5) return;
        const lr = 1 - p.life / p.max;
        const al = p.op * lr * (windHigh ? 1.3 : .4);
        const g = c.createRadialGradient(px, py, 0, px, py, p.sz * 2.8);
        g.addColorStop(0, `rgba(255,215,100,${al})`);
        g.addColorStop(.4, `rgba(255,175,60,${al * .45})`);
        g.addColorStop(1, "rgba(255,135,40,0)");
        c.fillStyle = g; c.beginPath(); c.arc(px, py, p.sz * 2.8, 0, TAU); c.fill();
      });
    } else { wpRef.current = []; }

    // METEOR SHOWER STREAKS (Layer 1 — behind bezel)
    if (activeMeteorShower) {
      if (Math.random() < 0.08) {
        const radiantAngle = Math.random() * TAU;
        meteorStreaksRef.current.push({
          x: cx + (bz + Math.random() * (Math.max(W,H) * 0.12)) * Math.cos(radiantAngle),
          y: cy + (bz + Math.random() * (Math.max(W,H) * 0.12)) * Math.sin(radiantAngle),
          angle: radiantAngle + Math.PI + (Math.random() - 0.5) * 0.4,
          life: 0,
          max: 12 + Math.random() * 18,
          speed: 3 + Math.random() * 5,
          len: S * (0.02 + Math.random() * 0.04),
        });
      }
      meteorStreaksRef.current = meteorStreaksRef.current.filter(m => {
        m.life++;
        if (m.life > m.max) return false;
        const progress = m.life / m.max;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        const x1 = m.x + m.life * m.speed * Math.cos(m.angle);
        const y1 = m.y + m.life * m.speed * Math.sin(m.angle);
        const x0 = x1 - m.len * Math.cos(m.angle);
        const y0 = y1 - m.len * Math.sin(m.angle);
        const mg = c.createLinearGradient(x0, y0, x1, y1);
        mg.addColorStop(0, `rgba(255,255,255,0)`);
        mg.addColorStop(0.4, `rgba(255,245,220,${alpha * 0.5})`);
        mg.addColorStop(1, `rgba(255,230,180,${alpha * 0.8})`);
        c.strokeStyle = mg;
        c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        c.fillStyle = `rgba(255,250,240,${alpha * 0.9})`;
        c.beginPath(); c.arc(x1, y1, 0.8, 0, TAU); c.fill();
        return true;
      });
    } else {
      meteorStreaksRef.current = [];
    }

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 2: EARTH GLOBE (NASA texture OR polygon fallback)
    // ═══════════════════════════════════════════════════════════════
    c.save();
    // v3.5: Extended clip — pushes texture to the outer visual limb
    const drawR = eR * 1.045;
    c.beginPath(); c.arc(cx, cy, drawR, 0, TAU); c.clip();

    if (globeCacheRef.current) {
      // NASA texture path
      c.drawImage(globeCacheRef.current, cx - eR, cy - eR);

      // v3.3: Atmospheric Limb Fresnel — sapphire halo on day side
      const sunAngleOnGlobe = sp
        ? -(utcH + sun.subLon / 15) * (Math.PI / 12)
        : Math.PI - (utcH + sun.subLon / 15) * (Math.PI / 12);
      
      c.save();
      c.globalCompositeOperation = 'screen';
      for (let i = 0; i < 64; i++) {
        const theta = (i / 64) * TAU;
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
    }

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 4: AURORA
    // ═══════════════════════════════════════════════════════════════
    if (kIdx >= 4) {
      const auroraR = eR * .12;
      const aIntensity = Math.min(1, (kIdx - 3) / 5);
      c.save(); c.globalCompositeOperation = "screen";
      for (let i = 0; i < CFG.AURORA_SEGMENTS; i++) {
        const angle = (i / CFG.AURORA_SEGMENTS) * TAU;
        const noiseVal = smoothNoise(i * .3 + t * .4);
        const r2 = auroraR * (1 + noiseVal * .35);
        const px = cx + r2 * Math.cos(angle);
        const py = cy - r2 * Math.sin(angle);
        const ag = c.createRadialGradient(px, py, 0, px, py, S * .025);
        const hue = noiseVal > .5 ? "rgba(60,220,130," : "rgba(140,80,220,";
        ag.addColorStop(0, hue + (.18 * aIntensity) + ")");
        ag.addColorStop(.4, hue + (.08 * aIntensity) + ")");
        ag.addColorStop(1, hue + "0)");
        c.fillStyle = ag; c.beginPath(); c.arc(px, py, S * .025, 0, TAU); c.fill();
      }
      c.restore();
    }

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 5: SILVER VEIL + NOISE
    // ═══════════════════════════════════════════════════════════════
    // v3.5: Silver Veil — day-side only, extended to limb


    // ═══════════════════════════════════════════════════════════════
    //  LAYER 6: GLASS GLINT
    // ═══════════════════════════════════════════════════════════════
    c.save();
    const gA = Math.PI * (11 / 12);
    const gR = eR * .5;
    const gCx = cx + gR * Math.cos(gA), gCy = cy - gR * Math.sin(gA);
    const gLen = eR * .45, gPerp = gA + Math.PI / 2;
    const p1x = gCx + gLen * Math.cos(gPerp), p1y = gCy - gLen * Math.sin(gPerp);
    const p2x = gCx - gLen * Math.cos(gPerp), p2y = gCy + gLen * Math.sin(gPerp);
    const cpOff = gLen * .6;
    const cp1x = gCx + cpOff * Math.cos(gA + .2), cp1y = gCy - cpOff * Math.sin(gA + .2);
    c.beginPath(); c.moveTo(p1x, p1y);
    c.quadraticCurveTo(cp1x, cp1y, p2x, p2y);
    c.quadraticCurveTo(gCx - (cpOff * .15) * Math.cos(gA), gCy + (cpOff * .15) * Math.sin(gA), p1x, p1y);
    const gg = c.createRadialGradient(gCx, gCy, 0, gCx, gCy, gLen * .7);
    gg.addColorStop(0, "rgba(255,255,255,.055)");
    gg.addColorStop(.4, "rgba(255,255,255,.025)");
    gg.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gg; c.fill();
    c.restore();

    c.restore(); // end Earth clip

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 7: ATMOSPHERE + DUAL TIDAL ELLIPSES
    // ═══════════════════════════════════════════════════════════════
    // Atmosphere glow — yellow horizon rim completely removed (much softer sapphire only)
    const ag2 = c.createRadialGradient(cx, cy, eR - 2, cx, cy, atR + 14);
    ag2.addColorStop(0, "rgba(55,125,250,0)");
    ag2.addColorStop(.42, "rgba(55,125,250,.038)");
    ag2.addColorStop(.68, "rgba(45,105,215,.052)");
    ag2.addColorStop(1, "rgba(25,55,140,0)");
    c.fillStyle = ag2; 
    c.beginPath(); 
    c.arc(cx, cy, atR + 14, 0, TAU); 
    c.fill();

    // Dynamic Tidal Elliptical Hull — now touches planet edge + visibly larger (blue M2 especially)
    // v3.5: clean ellipse only
    const drawTidalEllipse = (bodyAngle: number, amplitude: number, colorRgb: string) => {
      const baseR = eR * 1.004;                    // ← now touches Earth limb (was halfway into atmosphere)
      const bulgeMax = (atR - eR) * 1.00 * amplitude; // ← ~28% larger overall
      const segments = 100;                        // smoother curve

      c.save();
      c.globalCompositeOperation = "screen";

      c.beginPath();
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * TAU;
        const cosA = Math.cos(theta - bodyAngle);
        const bulge = bulgeMax * cosA * cosA;
        const r = baseR + bulge;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath();

      c.strokeStyle = `rgba(${colorRgb},${0.18 * amplitude})`; // stronger visible stroke
      c.lineWidth = 2.25;
      c.stroke();

      const ellGrad = c.createRadialGradient(cx, cy, baseR - 4, cx, cy, baseR + bulgeMax + 12);
      ellGrad.addColorStop(0, `rgba(${colorRgb},0)`);
      ellGrad.addColorStop(0.32, `rgba(${colorRgb},${0.09 * amplitude})`);
      ellGrad.addColorStop(0.72, `rgba(${colorRgb},${0.16 * amplitude})`);
      ellGrad.addColorStop(1, `rgba(${colorRgb},0)`);
      c.fillStyle = ellGrad;
      c.fill();

      c.globalCompositeOperation = "source-over";
      c.restore();
    };

    // M2 Lunar tidal ellipse (full amplitude, blue) — hugs planet + larger
    const mWA = sp
      ? -(utcH + mn.lon / 15) * (Math.PI / 12)
      : Math.PI - (utcH + mn.lon / 15) * (Math.PI / 12);
    drawTidalEllipse(mWA, 1.00, "92,198,255");   // brighter cyan-blue for visibility
    
    // ═══════════════════════════════════════════════════════════════
    //  LAYER 8: SATELLITES + LOCATIONS + CLOCK HAND
    // ═══════════════════════════════════════════════════════════════
    let hov: HovInfo | null = null;

    // ISS — your iss.png + slight blue dot underneath + light orbital rotation
    if (issR.current.ok && !(sp && issR.current.lat > 5) && !(!sp && issR.current.lat < -5)) {
      const ip = geo2xy(issR.current.lat, issR.current.lon, utcH, cx, cy, eR, sp);
      const id = Math.sqrt((ip.x - cx) ** 2 + (ip.y - cy) ** 2);
      if (id < eR * 1.03) {
        c.save(); 
        c.globalCompositeOperation = "screen";
        c.shadowBlur = 12; 
        c.shadowColor = "rgba(80,180,255,.5)";
        
        const ig = c.createRadialGradient(ip.x, ip.y, 0, ip.x, ip.y, S * .018);
        ig.addColorStop(0, "rgba(80,200,255,.55)"); 
        ig.addColorStop(.3, "rgba(60,160,255,.2)");
        ig.addColorStop(.7, "rgba(40,120,255,.06)"); 
        ig.addColorStop(1, "rgba(30,80,255,0)");
        c.fillStyle = ig; 
        c.beginPath(); 
        c.arc(ip.x, ip.y, S * .018, 0, TAU); 
        c.fill();

        c.shadowBlur = 0; 
        c.globalCompositeOperation = "source-over";

        const iconSize = S * 0.033;   // ← slightly bigger for better visibility (tweak if needed)

        // Slight blue dot under the icon (makes it pop in dark space)
        c.fillStyle = "rgba(80, 200, 255, 0.65)";
        c.beginPath(); 
        c.arc(ip.x, ip.y, iconSize * 0.42, 0, TAU); 
        c.fill();

        // Light rotation so it points forward along its orbit
        if (issImgRef.current) {
          const posAngle = Math.atan2(ip.y - cy, ip.x - cx);
          const orbitalRot = posAngle + Math.PI / 2;   // prograde direction (CCW)

          c.save();
          c.translate(ip.x, ip.y);
          c.rotate(orbitalRot);
          c.drawImage(issImgRef.current, -iconSize/2, -iconSize/2, iconSize, iconSize);
          c.restore();
        } else {
          c.fillStyle = "#80DEEA"; 
          c.beginPath(); 
          c.arc(ip.x, ip.y, CFG.ISS_DOT, 0, TAU); 
          c.fill();
        }

        c.restore();

        // Blue "ISS" text stays above the icon
        c.fillStyle = "rgba(120,210,255,.5)";
        c.font = `500 ${S * .013}px 'DM Mono','SF Mono',monospace`; 
        c.textAlign = "center";
        c.fillText("ISS", ip.x, ip.y - S * .02);

        if (Math.sqrt((mp.x - ip.x) ** 2 + (mp.y - ip.y) ** 2) < S * .038)
          hov = {type:"ISS", x:ip.x, y:ip.y, lat:issR.current.lat, lon:issR.current.lon, spd:"27,600 km/h"};
      }
    }

    // Tiangong (CSS) — your css.png + slight red dot underneath + light orbital rotation
    if (tgR.current.ok && !(sp && tgR.current.lat > 5) && !(!sp && tgR.current.lat < -5)) {
      const tp = geo2xy(tgR.current.lat, tgR.current.lon, utcH, cx, cy, eR, sp);
      const td = Math.sqrt((tp.x - cx) ** 2 + (tp.y - cy) ** 2);
      if (td < eR * 1.03) {
        c.save(); 
        c.globalCompositeOperation = "screen";
        c.shadowBlur = 10; 
        c.shadowColor = "rgba(255,90,70,.4)";
        
        const tg = c.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, S * .015);
        tg.addColorStop(0, "rgba(255,110,80,.5)"); 
        tg.addColorStop(.3, "rgba(255,80,60,.18)");
        tg.addColorStop(1, "rgba(255,50,35,0)");
        c.fillStyle = tg; 
        c.beginPath(); 
        c.arc(tp.x, tp.y, S * .015, 0, TAU); 
        c.fill();

        c.shadowBlur = 0; 
        c.globalCompositeOperation = "source-over";

        const iconSize = S * 0.032;   // ← slightly bigger

        // Slight red dot under the icon
        c.fillStyle = "rgba(255, 110, 80, 0.65)";
        c.beginPath(); 
        c.arc(tp.x, tp.y, iconSize * 0.42, 0, TAU); 
        c.fill();

        // Light rotation so it points forward along its orbit
        if (cssImgRef.current) {
          const posAngle = Math.atan2(tp.y - cy, tp.x - cx);
          const orbitalRot = posAngle + Math.PI / 2;

          c.save();
          c.translate(tp.x, tp.y);
          c.rotate(orbitalRot);
          c.drawImage(cssImgRef.current, -iconSize/2, -iconSize/2, iconSize, iconSize);
          c.restore();
        } else {
          c.fillStyle = "#EF5350"; 
          c.beginPath(); 
          c.arc(tp.x, tp.y, 2.5, 0, TAU); 
          c.fill();
        }

        c.restore();

        // Red "CSS" text stays above the icon
        c.fillStyle = "rgba(255,115,95,.45)";
        c.font = `500 ${S * .011}px 'DM Mono','SF Mono',monospace`; 
        c.textAlign = "center";
        c.fillText("CSS", tp.x, tp.y - S * .016);

        if (Math.sqrt((mp.x - tp.x) ** 2 + (mp.y - tp.y) ** 2) < S * .035)
          hov = {type:"Tiangong (CSS)", x:tp.x, y:tp.y, lat:tgR.current.lat, lon:tgR.current.lon, spd:"28,000 km/h"};
      }
    }

    // User locations
    locs.forEach((loc) => {
      // Skip locations not visible from current pole (95° from pole)
      if (sp && loc.lat > 5) return;    // south pole can't see far north
      if (!sp && loc.lat < -5) return;  // north pole can't see far south
      const p = geo2xy(loc.lat, loc.lon, utcH, cx, cy, eR, sp);
      const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
      if (d < eR) {
        c.save(); c.globalCompositeOperation = "screen";
        c.shadowBlur = 8; c.shadowColor = loc.color + "70";
        const lg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, S * .014);
        lg.addColorStop(0, loc.color + "88"); lg.addColorStop(.35, loc.color + "35");
        lg.addColorStop(.7, loc.color + "12"); lg.addColorStop(1, loc.color + "00");
        c.fillStyle = lg; c.beginPath(); c.arc(p.x, p.y, S * .014, 0, TAU); c.fill();
        c.shadowBlur = 0; c.globalCompositeOperation = "source-over";
        c.fillStyle = loc.color; c.beginPath(); c.arc(p.x, p.y, CFG.LOC_DOT, 0, TAU); c.fill();
        c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = .5;
        c.beginPath(); c.arc(p.x, p.y, CFG.LOC_DOT + 1.3, 0, TAU); c.stroke();
        const la = Math.atan2(p.y - cy, p.x - cx);
        const lx = p.x + Math.cos(la) * S * .026, ly = p.y + Math.sin(la) * S * .026;
        c.fillStyle = "rgba(255,255,255,.72)";
        c.font = `400 ${S * .016}px 'DM Sans',system-ui`; c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(loc.name, lx, ly); c.restore();
        if (Math.sqrt((mp.x - p.x) ** 2 + (mp.y - p.y) ** 2) < S * .025)
          hov = {type: loc.name, x: p.x, y: p.y, lat: loc.lat, lon: loc.lon};
      }
    });

    // Observer location pin (white crosshair + diamond)
    {
      if (!(sp && userLat > 5) && !(!sp && userLat < -5)) {
      const op = geo2xy(userLat, userLon, utcH, cx, cy, eR, sp);
      const od = Math.sqrt((op.x - cx) ** 2 + (op.y - cy) ** 2);
      if (od < eR) {
        c.save();
        const cLen = S * .012;
        // Crosshair arms
        c.strokeStyle = "rgba(255,255,255,.50)"; c.lineWidth = 0.7;
        c.beginPath();
        c.moveTo(op.x - cLen, op.y); c.lineTo(op.x + cLen, op.y);
        c.moveTo(op.x, op.y - cLen); c.lineTo(op.x, op.y + cLen);
        c.stroke();
        // Center diamond
        c.fillStyle = "rgba(255,255,255,.70)";
        c.beginPath();
        c.moveTo(op.x, op.y - 3); c.lineTo(op.x + 2.2, op.y);
        c.lineTo(op.x, op.y + 3); c.lineTo(op.x - 2.2, op.y); c.closePath();
        c.fill();
        // Outer ring
        c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 0.5;
        c.beginPath(); c.arc(op.x, op.y, S * .016, 0, TAU); c.stroke();
        c.restore();
        if (Math.sqrt((mp.x - op.x) ** 2 + (mp.y - op.y) ** 2) < S * .025)
          hov = {type: `Observer (${observerCity})`, x: op.x, y: op.y, lat: userLat, lon: userLon};
      }
      }
    }

    // Clock hand
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lt = new Date(now.toLocaleString("en-US", {timeZone: tz}));
    const lH = lt.getHours() + lt.getMinutes() / 60 + lt.getSeconds() / 3600;
    const hA = -hourAngleFor(lH, sp);
    // Digital-Thin Hand — "The Chronological Needle"
    c.save();
    c.strokeStyle = "rgba(255,255,255,.55)";
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(cx + S * .015 * Math.cos(hA), cy + S * .015 * Math.sin(hA));
    c.lineTo(cx + tO * .98 * Math.cos(hA), cy + tO * .98 * Math.sin(hA));
    c.stroke();
    const tipGx = cx + tO * .98 * Math.cos(hA), tipGy = cy + tO * .98 * Math.sin(hA);
    const tipG = c.createRadialGradient(tipGx, tipGy, 0, tipGx, tipGy, S * .006);
    tipG.addColorStop(0, "rgba(255,255,255,.4)");
    tipG.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = tipG; c.beginPath(); c.arc(tipGx, tipGy, S * .006, 0, TAU); c.fill();
    c.restore();

    // Pole indicator — dark backing circle + letter
    c.save();
    c.fillStyle = "rgba(18, 22, 28, 0.78)";
    c.beginPath(); c.arc(cx, cy, S * 0.022, 0, TAU); c.fill();
    c.shadowBlur = 6; c.shadowColor = "rgba(40, 48, 62, 0.4)";
    c.strokeStyle = "rgba(255,255,255,0.10)"; c.lineWidth = 0.8;
    c.beginPath(); c.arc(cx, cy, S * 0.023, 0, TAU); c.stroke();
    c.shadowBlur = 0;
    c.restore();
    c.fillStyle = "rgba(255,255,255,.82)";
    c.font = `500 ${S * .018}px 'DM Sans',system-ui`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(sp ? "S" : "N", cx, cy);
    c.strokeStyle = "rgba(255,255,255,.20)"; c.lineWidth = .4;
    const cr = S * .006; c.beginPath();
    c.moveTo(cx - cr, cy); c.lineTo(cx + cr, cy);
    c.moveTo(cx, cy - cr); c.lineTo(cx, cy + cr); c.stroke();

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 9: HOUR MARKERS (Min / Mid / Max modes)
    // ═══════════════════════════════════════════════════════════════
    const hMode = hourMode; // capture for render

    c.strokeStyle = "rgba(115,145,195,.18)"; c.lineWidth = .7;
    c.beginPath(); c.arc(cx, cy, bz, 0, TAU); c.stroke();
    c.strokeStyle = "rgba(100,130,175,.1)"; c.lineWidth = .5;
    c.beginPath(); c.arc(cx, cy, bfI, 0, TAU); c.stroke();

    for (let h = 0; h < 24; h++) {
      const a = -hourAngleFor(h, sp);
      const maj = h % 6 === 0;
      const even = h % 2 === 0;

      // Determine what to show per mode
      // Min: ticks + numbers only for 00 and 18; icons for 06/12; no ticks for others
      // Mid: ticks + numbers for even hours; icons for 06/12 (current behavior)
      // Max: ticks + numbers for ALL hours; icons for 06/12
      const isIcon = h === 6 || h === 12;
      const isMinLabel = h === 0 || h === 18; // the two number labels in min mode
      const showTick = hMode === "max" ? true
        : hMode === "mid" ? (even || maj)
        : (isIcon || isMinLabel); // min: only 00, 06, 12, 18
      const showLabel = isIcon ? false  // icons handle themselves
        : hMode === "max" ? true
        : hMode === "mid" ? even
        : isMinLabel;

      // Tick lines
      if (showTick) {
        const tI = maj ? bfI - S * .007 : bfI;
        c.strokeStyle = maj ? "rgba(175,195,230,.5)"
          : even ? "rgba(135,160,195,.25)"
          : "rgba(115,140,175,.15)";
        c.lineWidth = maj ? 1.5 : even ? .9 : .5;
        c.beginPath();
        c.moveTo(cx + tI * Math.cos(a), cy + tI * Math.sin(a));
        c.lineTo(cx + tO * Math.cos(a), cy + tO * Math.sin(a)); c.stroke();
      }

      // Sub-quarter ticks (15-min marks) — show in mid/max only
      if (hMode !== "min") {
        for (let s = 1; s <= 3; s++) {
          const sa = -hourAngleFor(h + s / 4, sp);
          c.strokeStyle = "rgba(95,115,145,.1)"; c.lineWidth = .3;
          c.beginPath();
          c.moveTo(cx + (bfI + (tO - bfI) * .35) * Math.cos(sa), cy + (bfI + (tO - bfI) * .35) * Math.sin(sa));
          c.lineTo(cx + (tO - S * .004) * Math.cos(sa), cy + (tO - S * .004) * Math.sin(sa)); c.stroke();
        }
      }

      const nR = tO + S * .024;
      const nx = cx + nR * Math.cos(a), ny = cy + nR * Math.sin(a);

      if (h === 12) {
        // White Sun — always visible in all modes
        const sr = S * .013;
        const sg = c.createRadialGradient(nx, ny, 0, nx, ny, sr * 3);
        sg.addColorStop(0, "rgba(255,255,255,.12)");
        sg.addColorStop(.5, "rgba(255,255,255,.04)");
        sg.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = sg; c.beginPath(); c.arc(nx, ny, sr * 3, 0, TAU); c.fill();
        c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 1.2;
        c.beginPath(); c.arc(nx, ny, sr, 0, TAU); c.stroke();
        c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 0.6;
        for (let r = 0; r < 8; r++) {
          const ra = r * Math.PI / 4;
          c.beginPath();
          c.moveTo(nx + sr * 1.5 * Math.cos(ra), ny + sr * 1.5 * Math.sin(ra));
          c.lineTo(nx + sr * 2.3 * Math.cos(ra), ny + sr * 2.3 * Math.sin(ra));
          c.stroke();
        }
      } else if (h === 6) {
        // Orbital Vector — always visible in all modes
        const nLen = S * .026;
        const wingSpan = S * .011;
        
        c.save();
        c.translate(nx, ny);
        c.rotate(a);
        
        c.strokeStyle = "rgba(255,255,255,.85)";
        c.lineWidth = 1.2;
        c.lineCap = "round";
        c.lineJoin = "round";
        
        c.beginPath();
        c.moveTo(-wingSpan, -nLen * 0.25);
        c.lineTo(nLen * 0.5, 0); 
        c.lineTo(-wingSpan, nLen * 0.25);
        c.moveTo(-nLen * 0.4, 0);
        c.lineTo(nLen * 0.5, 0);
        c.stroke();
        
        const arrowGlow = c.createRadialGradient(0, 0, 0, 0, 0, nLen);
        arrowGlow.addColorStop(0, "rgba(255,255,255,0.12)");
        arrowGlow.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = arrowGlow;
        c.beginPath(); c.arc(0, 0, nLen, 0, TAU); c.fill();
        
        c.restore();
      } else if (showLabel) {
        // Number labels — size varies by importance
        const isMaj = maj;
        const isOdd = !even;
        c.fillStyle = isMaj ? "rgba(210,225,250,.85)"
          : isOdd ? "rgba(145,165,200,.38)"
          : "rgba(165,185,215,.52)";
        c.font = `${isMaj ? 300 : 200} ${S * (isMaj ? .035 : isOdd ? .022 : .027)}px 'DM Sans',system-ui`;
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(h.toString().padStart(2, "0"), nx, ny);
      }
    }

        // ═══════════════════════════════════════════════════════════════
    //  LAYER 10: MOON — Real texture + accurate current phase
    // ═══════════════════════════════════════════════════════════════
    const mS = S * CFG.MOON_R;
    const mWA2 = sp
      ? -(utcH + mn.lon / 15) * (Math.PI / 12)
      : Math.PI - (utcH + mn.lon / 15) * (Math.PI / 12);
    const mx = cx + mO * Math.cos(mWA2);
    const my = cy + mO * Math.sin(mWA2);

    c.save();
    c.beginPath(); c.arc(mx, my, mS, 0, TAU); c.clip();

// Real Moon texture (base)
    if (moonPixRef.current) {
      const moonSize = Math.ceil(mS * 2.1);
      const moonCanvas = document.createElement("canvas");
      moonCanvas.width = moonSize; moonCanvas.height = moonSize;
      const mCtx = moonCanvas.getContext("2d")!;
      mCtx.drawImage(
        (() => {
          const tmp = document.createElement("canvas");
          tmp.width = CFG.TEX_W; tmp.height = CFG.TEX_H;
          const tCtx = tmp.getContext("2d")!;
          
          // Force bypass TypeScript constructor check for ImageData
          // @ts-ignore
          const moonData = new ImageData(moonPixRef.current, CFG.TEX_W, CFG.TEX_H);
          
          tCtx.putImageData(moonData, 0, 0);
          return tmp;
        })(),
        0, 0, moonSize, moonSize
      );
      c.drawImage(moonCanvas, mx - mS, my - mS, mS * 2, mS * 2);
    } else {
      // Fallback synthetic (if texture fails)
      const ms = c.createRadialGradient(mx - mS * .2, my - mS * .2, 0, mx, my, mS);
      ms.addColorStop(0, "#d5d9e5"); ms.addColorStop(.4, "#bcc0ce"); ms.addColorStop(1, "#9ea2b0");
      c.fillStyle = ms; c.beginPath(); c.arc(mx, my, mS, 0, TAU); c.fill();
    }

    // Accurate phase shadow (real terminator based on current lunar phase)
    const ph = mn.phase;
    const pg = ph < .5
      ? (() => {
          const g2 = c.createLinearGradient(mx + mS, my, mx - mS * (1 - ph * 2), my);
          g2.addColorStop(0, "rgba(0,0,0,0)");
          g2.addColorStop(.4, `rgba(0,0,8,${(1 - ph * 2) * .4})`);
          g2.addColorStop(1, `rgba(0,0,8,0.95)`);
          return g2;
        })()
      : (() => {
          const g2 = c.createLinearGradient(mx - mS, my, mx + mS * (ph * 2 - 1), my);
          g2.addColorStop(0, "rgba(0,0,0,0)");
          g2.addColorStop(.4, `rgba(0,0,8,${(ph * 2 - 1) * .4})`);
          g2.addColorStop(1, `rgba(0,0,8,0.95)`);
          return g2;
        })();

    c.fillStyle = pg;
    c.beginPath(); c.arc(mx, my, mS, 0, TAU); c.fill();

    c.restore();

    // Subtle rim glow
    c.strokeStyle = "rgba(255,255,255,.25)";
    c.lineWidth = .8;
    c.beginPath(); c.arc(mx, my, mS, 0, TAU); c.stroke();

    if (Math.sqrt((mp.x - mx) ** 2 + (mp.y - my) ** 2) < mS * 1.8)
      hov = {type: "Moon", x: mx, y: my, lat: mn.lat, lon: mn.lon, extra: `${(mn.illum * 100).toFixed(0)}% illuminated`};

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 11: HUD TOOLTIP
    // ═══════════════════════════════════════════════════════════════
    if (hov) {
      const hx = Math.min(hov.x + S * .04, W - S * .17);
      const hy = Math.max(hov.y - S * .03, 8);
      const bw = S * .16, bh = S * (hov.extra ? .062 : .048);
      c.fillStyle = "rgba(6,10,22,.88)";
      c.strokeStyle = "rgba(90,130,195,.3)"; c.lineWidth = .7;
      c.beginPath();
      (c as unknown as { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void })
        .roundRect(hx, hy, bw, bh, 4);
      c.fill(); c.stroke();
      c.fillStyle = "rgba(175,205,255,.88)";
      c.font = `500 ${S * .014}px 'DM Mono','SF Mono',monospace`;
      c.textAlign = "left"; c.textBaseline = "top";
      c.fillText(hov.type, hx + 7, hy + 5);
      c.fillStyle = "rgba(135,165,210,.6)";
      c.font = `400 ${S * .011}px 'DM Mono','SF Mono',monospace`;
      c.fillText(`${Math.abs(hov.lat).toFixed(2)}°${hov.lat >= 0 ? 'N' : 'S'}  ${Math.abs(hov.lon).toFixed(2)}°${hov.lon >= 0 ? 'E' : 'W'}`, hx + 7, hy + 20);
      if (hov.extra) c.fillText(hov.extra, hx + 7, hy + 33);
      if (hov.spd)   c.fillText(hov.spd, hx + 7, hy + 33);
    }

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 12: DIGITAL TIME + STATUS
    // ═══════════════════════════════════════════════════════════════
    const dH = lt.getHours().toString().padStart(2, "0");
    const dM = lt.getMinutes().toString().padStart(2, "0");
    const tbg = c.createRadialGradient(cx, cy - S * .15, 0, cx, cy - S * .15, S * .09);
    tbg.addColorStop(0, "rgba(0,4,12,.4)"); tbg.addColorStop(1, "rgba(0,4,12,0)");
    c.fillStyle = tbg; c.beginPath(); c.arc(cx, cy - S * .15, S * .09, 0, TAU); c.fill();

    c.fillStyle = "rgba(255,255,255,.9)";
    c.font = `200 ${S * .068}px 'DM Sans',system-ui`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(`${dH}:${dM}`, cx, cy - S * .17);

    const ds = now.toLocaleDateString("en-US", {weekday:"long", month:"short", day:"numeric"});
    c.fillStyle = "rgba(185,205,235,.55)";
    c.font = `300 ${S * .019}px 'DM Sans',system-ui`;
    c.fillText(ds, cx, cy - S * .125);

    const chipY = cy - tO + S * .015;
    const chipX = cx + tO - S * .012;
    if (kIdx >= 4) {
      c.fillStyle = "rgba(100,220,140,.5)";
      c.font = `400 ${S * .012}px 'DM Mono','SF Mono',monospace`;
      c.textAlign = "right"; c.fillText(`K${kIdx} AURORA`, chipX, chipY);
    }
    if (showWind) {
      c.fillStyle = "rgba(255,195,75,.4)";
      c.font = `400 ${S * .011}px 'DM Mono','SF Mono',monospace`;
      c.textAlign = "right"; c.fillText("⚡ SOLAR WIND", chipX, chipY + S * .016);
    }
    if (activeMeteorShower) {
      c.fillStyle = "rgba(255,230,150,.45)";
      c.font = `400 ${S * .011}px 'DM Mono','SF Mono',monospace`;
      c.textAlign = "right";
      c.fillText(`🌠 ${activeMeteorShower}`, chipX, chipY + S * (showWind ? .032 : .016));
    }
    if (texStatus !== "ready") {
      c.fillStyle = texStatus === "loading" ? "rgba(120,160,220,.35)" : "rgba(180,120,80,.35)";
      c.font = `400 ${S * .010}px 'DM Mono','SF Mono',monospace`;
      c.textAlign = "center";
      c.fillText(texStatus === "loading" ? "⟳ NASA GIBS" : "▲ POLYGON MODE", cx, cy + tO - S * .01);
    }

    afRef.current = requestAnimationFrame(render);
  }, [now, locs, windOn, windHigh, mp, southPole, texStatus, activeMeteorShower, userLat, userLon, hourMode]);

  // ─── Load custom ISS & CSS icons (from /public) ─────────────────────
  useEffect(() => {
    const load = (src: string, ref: React.MutableRefObject<HTMLImageElement | null>) => {
      const img = new Image();
      img.src = src;
      img.onload = () => { ref.current = img; };
      img.onerror = () => console.warn(`Could not load ${src}`);
    };

    load('/iss.png', issImgRef);
    load('/css.png', cssImgRef);
  }, []);

  useEffect(() => {
    afRef.current = requestAnimationFrame(render);
    return () => { if (afRef.current) cancelAnimationFrame(afRef.current); };
  }, [render]);

  const updLoc = (i: number, p: LocEntry) => {
    setLocs(l => l.map((x, j) => j === i ? {...x, name: p.name, lat: p.lat, lon: p.lon} : x));
    setEditing(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePoleToggle = () => {
    setSouthPole(s => !s);
    setHemisphereAuto(false);
    globeCacheRef.current = null;
    globeCacheTimeRef.current = 0;
  };
  // ── Status Bar Computations ─────────────────────────────
  const nextMeteor = getNextMeteorShower(now);
  const k = kIndexR.current;

  const solarStrength = k >= 7 ? "Extreme" : k >= 5 ? "Strong" : k >= 4 ? "Medium" : "Weak";

  let meteorText = "";
  if (activeMeteorShower) {
    meteorText = `Look up! ${activeMeteorShower}`;
  } else if (nextMeteor && nextMeteor.days <= 10) {
    meteorText = `${nextMeteor.name} in ${nextMeteor.days}d`;
  }

  let auroraText = "";
  if (k >= 4) {
    const isNorth = userLat >= 0;
    auroraText = `Aurora ${isNorth ? "Borealis" : "Australis"} (${isNorth ? "North" : "South"})`;
  }

  return (

    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:"100vh",background:"#000000",fontFamily:"'DM Sans',system-ui",color:"#fff",padding:"0",overflow:"hidden",width:"100vw",height:"100vh",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      <div style={{position:"absolute",inset:0,background:"#000000"}}>
        <canvas ref={cvRef} onMouseMove={onMM} style={{width:"100%",height:"100%",cursor:"crosshair",background:"#000000"}}/>
      </div>

      {/* Status bar — clean & beautiful */}
      <div style={{position:"absolute",bottom:"80px",left:0,right:0,display:"flex",gap:"20px",fontSize:"11px",
        color:"rgba(155,175,205,.68)",letterSpacing:".45px",flexWrap:"wrap",
        justifyContent:"center",fontFamily:"'DM Mono',monospace",alignItems:"center",zIndex:10,pointerEvents:"none"}}>
        
        {/* Your Location */}
        <span style={{color:"#a0c0ff", whiteSpace:"nowrap"}}>
          📍 Your Location {userLat.toFixed(1)}°{userLat >= 0 ? 'N' : 'S'} {Math.abs(userLon).toFixed(1)}°{userLon >= 0 ? 'E' : 'W'}
        </span>

        {/* Meteor Shower */}
        {meteorText && <span style={{color:"#ffe68c", whiteSpace:"nowrap"}}>Meteor Shower {meteorText}</span>}

        {/* Solar Wind + Aurora */}
        <span style={{whiteSpace:"nowrap"}}>
          Solar Wind {solarStrength} (K{k})
          {auroraText && <span style={{marginLeft:"10px", color:"#b0e0ff"}}>{auroraText}</span>}
        </span>
      </div>

      {/* Customize panel */}
      <div style={{position:"absolute",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",width:"100%",maxWidth:"440px",padding:"0 16px",zIndex:10}}>
        <button onClick={() => setPanel(!panel)} style={{
          background:"none",border:"1px solid rgba(110,140,190,.22)",color:"rgba(185,205,235,.65)",
          padding:"6px 20px",borderRadius:"16px",cursor:"pointer",fontSize:"11px",
          letterSpacing:".8px",fontFamily:"'DM Sans',system-ui"}}>
          {panel ? "Close" : "⚙ Customize"}</button>

        {panel && (
          <div style={{background:"rgba(8,12,25,.92)",backdropFilter:"blur(16px)",
            border:"1px solid rgba(65,85,125,.18)",borderRadius:"12px",padding:"16px",width:"100%",maxHeight:"50vh",overflowY:"auto"}}>

            {/* Hour density toggle */}
            <div style={{fontSize:"9px",color:"rgba(125,145,180,.45)",textTransform:"uppercase",
              letterSpacing:"2px",marginBottom:"8px"}}>Hours</div>
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              {([{label:"Min",val:"min" as const},{label:"Mid",val:"mid" as const},{label:"Max",val:"max" as const}]).map(opt => (
                <button key={opt.val} onClick={() => setHourMode(opt.val)}
                  style={{flex:1,padding:"6px",borderRadius:"6px",cursor:"pointer",fontSize:"10px",
                    fontFamily:"inherit",letterSpacing:".4px",
                    background: hourMode === opt.val ? "rgba(80,130,220,.22)" : "rgba(22,28,45,.5)",
                    border: hourMode === opt.val ? "1px solid rgba(80,150,255,.45)" : "1px solid rgba(55,75,105,.22)",
                    color: hourMode === opt.val ? "rgba(160,200,255,.9)" : "rgba(140,160,190,.5)"}}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Pole perspective toggle */}
            <div style={{fontSize:"9px",color:"rgba(125,145,180,.45)",textTransform:"uppercase",
              letterSpacing:"2px",marginBottom:"8px"}}>Perspective</div>
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              {[{label:"North Pole", val:false},{label:"South Pole", val:true}].map(opt => (
                <button key={opt.label} onClick={() => { setSouthPole(opt.val); globeCacheRef.current = null; globeCacheTimeRef.current = 0; }}
                  style={{flex:1,padding:"6px",borderRadius:"6px",cursor:"pointer",fontSize:"10px",
                    fontFamily:"inherit",letterSpacing:".4px",
                    background: southPole === opt.val ? "rgba(80,130,220,.22)" : "rgba(22,28,45,.5)",
                    border: southPole === opt.val ? "1px solid rgba(80,150,255,.45)" : "1px solid rgba(55,75,105,.22)",
                    color: southPole === opt.val ? "rgba(160,200,255,.9)" : "rgba(140,160,190,.5)"}}>
                  {opt.label}{hemisphereAuto && southPole === opt.val ? " (auto)" : ""}
                </button>
              ))}
            </div>

            {/* Empathy Locations */}
            <div style={{fontSize:"9px",color:"rgba(125,145,180,.45)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:"12px"}}>
              EMPATHY LOCATIONS</div>
            {locs.map((l, i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"9px",
                padding:"8px 11px",background:"rgba(22,28,45,.5)",borderRadius:"7px",border:`1px solid ${l.color}18`}}>
                <div style={{width:"7px",height:"7px",borderRadius:"50%",background:l.color,boxShadow:`0 0 5px ${l.color}50`,flexShrink:0}}/>
                {editing === i ? (
                  <div style={{display:"flex",flexWrap:"wrap",gap:"4px",flex:1}}>
                    {LP.map(p => (
                      <button key={p.name} onClick={() => updLoc(i, p)} style={{
                        background: p.name === l.name ? l.color + "28" : "rgba(35,45,65,.5)",
                        border: p.name === l.name ? `1px solid ${l.color}70` : "1px solid rgba(55,75,105,.22)",
                        color:"rgba(205,220,240,.82)",padding:"2px 7px",borderRadius:"4px",
                        cursor:"pointer",fontSize:"9px",fontFamily:"inherit"}}>{p.name}</button>
                    ))}
                    <button onClick={() => setEditing(null)} style={{
                      background:"rgba(170,45,45,.22)",border:"1px solid rgba(170,55,55,.3)",
                      color:"rgba(255,185,185,.65)",padding:"2px 7px",borderRadius:"4px",
                      cursor:"pointer",fontSize:"9px",fontFamily:"inherit"}}>✕</button>
                  </div>
                ) : (
                  <>
                    <span style={{flex:1,fontSize:"12px",color:"rgba(205,220,240,.82)"}}>{l.name}</span>
                    <span style={{fontSize:"9px",color:"rgba(115,135,165,.4)",fontFamily:"'DM Mono',monospace"}}>
                      {l.lat.toFixed(1)}° {Math.abs(l.lon).toFixed(1)}°</span>
                    <button onClick={() => setEditing(i)} style={{
                      background:"none",border:"1px solid rgba(85,115,155,.22)",
                      color:"rgba(145,165,195,.55)",padding:"2px 7px",borderRadius:"4px",
                      cursor:"pointer",fontSize:"9px",fontFamily:"inherit"}}>Edit</button>
                  </>
                )}
              </div>
            ))}

            <div style={{fontSize:"9px",color:"rgba(95,115,145,.35)",marginTop:"12px",textAlign:"center",lineHeight:"1.6"}}>
              Tidal ellipses: M2 lunar (blue) · S2 solar (gold, 46%)
              <br/>Textures: NASA Blue/Black Marble 2000×1000 + VIIRS Cloud Layer
              <br/>K-index: NOAA SWPC (live) · Fresnel limb · Astronaut lens
              <br/>v3.5: True black void · Sharp Earth · Balanced brightness
            </div>
          </div>
        )}
      </div>

      <div style={{position:"absolute",bottom:"6px",left:0,right:0,textAlign:"center",fontSize:"9px",color:"rgba(95,115,140,.28)",letterSpacing:"1.5px",textTransform:"uppercase",zIndex:10,pointerEvents:"none"}}>
        Earth Moves v3.5 — Brage W. Johansen</div>
    </div>
  );
}
