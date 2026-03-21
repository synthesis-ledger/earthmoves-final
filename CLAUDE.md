# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint via Next.js
npm start        # Start production server
```

No test suite is configured.

## Critical Editing Rules

- **Always read a file fully before editing it.**
- **Never edit `app/watch/page.tsx` and `app/calendar/page.tsx` in the same command.** Make one change at a time and confirm before proceeding.
- **Never remove existing functionality — only add or modify.**
- **Never touch `*.bak` files** (e.g., `page.tsx.bak` — these are backups).

## Architecture

**Earth Moves** is a Next.js 16 App Router application with two core interactive instruments and an article-driven ephemeris section.

### Core Pages

- **`/watch`** (`app/watch/page.tsx`) — Real-time 3D Earth globe rendered on a `<canvas>`. Calculates Sun/Moon positions, ISS/Tiangong satellite positions (N2YO API), aurora (NOAA K-index), tidal vectors, cloud overlay (NASA GIBS WMS), and space weather. All astronomy math is custom (no library).
- **`/calendar`** (`app/calendar/page.tsx`) — Orbital calendar rendered on `<canvas>`. Shows inner planets, zodiac ring, lunar phases, meteor showers, solar wind data (NOAA SWPC), ISO weeks, and animated dust/meteor particles.
- **`/ephemeris`** — Article index with 5 columns: Sol Report, Space Weather, Natural Time, Instrument Notes, Field Notes.
- **`/ephemeris/[slug]`** — Individual article pages generated from Markdown files in `content/ephemeris/`.
- **`/display/[slug]`** — Custom-branded display configurations (e.g., for installations). Config stored in `lib/display-configs.json`.
- **`/admin`** — Manage display configurations.
- **`/ai`** — 7-stage Grok API article generation pipeline UI.

### Content Engine (`lib/ephemeris.ts`)

Articles are Markdown files with YAML-like frontmatter (title, slug, date, column, description, keywords, instrument, image, draft, faq). `ephemeris.ts` provides zero-dependency frontmatter parsing, reading time, HTML rendering, Schema.org JSON-LD, and Open Graph metadata. Articles are cached at build time.

### API Routes

| Route | Purpose |
|---|---|
| `/api/articles/latest` | Returns 6 latest articles |
| `/api/ai/pipeline` | Grok-powered article generation pipeline |
| `/api/display-config` | Read/write display configurations |
| `/api/tiangong` | Tiangong satellite position via N2YO API |
| `/api/subscribe` | Email subscription |
| `/ephemeris/feed.xml` | RSS feed |

### Real-time Data Sources

- **NASA GIBS WMS** — VIIRS cloud layer
- **N2YO API** — ISS and Tiangong satellite positions
- **NOAA SWPC** — K-index, solar wind speed/Bz, X-ray flux

### Key Design Tokens

CSS custom properties defined in `app/earth-moves.css`:
- `--gold: #C9A96E`, `--deep: #060A13`, `--navy: #0B1122`, `--text-primary: #E8ECF4`
- Fonts: Cormorant Garamond (headers), DM Sans (body), DM Mono (data)

### Display Configurations

`lib/display-configs.json` stores named configs (e.g., `schiphol`, `demo`) with fields: `label`, `accentColor`, `showClouds`, `southPoleView`, `locationPins`. These power `/display/[slug]` branded installations.
