# Texas Watch — Public Safety Intelligence Platform

> A real-time, multi-source tactical dashboard that aggregates live public-safety data across Texas's five largest metros (Austin, Dallas, Houston, San Antonio, and Arlington) into a single situational-awareness console.

**Live demo:** https://texas-watch.vercel.app

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Edge_Functions-3ECF8E?logo=supabase&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)

---

## Overview

Texas Watch is a single-pane-of-glass operations console designed to mirror the experience of a real emergency-operations center. It ingests **live computer-aided dispatch (CAD) feeds**, **NOAA weather alerts**, **TxDOT road conditions**, and **live traffic-camera snapshots**, normalizes them through a serverless backend, and renders them on an interactive tactical map alongside a streaming incident feed and an intel panel.

The project demonstrates end-to-end ownership of a production-grade, data-heavy React application: API design, data normalization across heterogeneous government data sources, geospatial visualization, responsive UI, design-system theming, and graceful degradation when upstream sources fail.

---

## Key Features

- **Multi-city live CAD feed** — pulls active calls-for-service from five independent government APIs (Austin Socrata, Dallas Open Data, Houston ArcGIS Feature Server, San Antonio CKAN, and Arlington PD ArcGIS) and merges them into a single normalized stream.
- **Interactive tactical map** — Leaflet-based map with severity-coded markers, click-to-zoom on incidents, automatic city-zoom on filter change, and hardened coordinate validation so malformed upstream data can't crash the renderer.
- **Live traffic cameras** — toggleable TxDOT camera layer that proxies and decodes live JPEG snapshots per district, refreshed on an interval.
- **NOAA weather integration** — surfaces active Texas weather alerts (severity, urgency, affected areas, expiration) from the National Weather Service API.
- **TxDOT road conditions** — live closures and hazards via the official TxDOT ArcGIS service.
- **Streaming incident feed** — filterable by city and severity, with near-real-time refresh (15s polling + visibility-aware refetch) and one-click map fly-to.
- **Intel panel** — contextual situational summaries and threat-level reasoning.
- **Cinematic boot sequence** — branded startup animation that doubles as a load-state for the first data hydration.
- **Mobile-first responsive layout** — tab-based navigation on small screens, three-pane layout on desktop, tested down to 360px width.
- **Texas-flag-inspired theme** — fully token-driven design system (HSL semantic tokens in `index.css` + Tailwind theme extensions), 12-hour clock, dark tactical aesthetic.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    React 18 + Vite + TS                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐   │
│  │ StatusBar  │  │ TacticalMap│  │IncidentFeed│  │ Intel  │   │
│  └────────────┘  └─────┬──────┘  └─────┬──────┘  └────────┘   │
│                        │                │                     │
│              TanStack Query (cache + polling + retries)       │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTPS
                ┌────────▼─────────┐
                │  Supabase Edge   │   Deno runtime
                │    Functions     │   (CORS, timeouts, dedupe, normalize)
                └────────┬─────────┘
     ┌──────────┬────────┼─────────┬───────────┬────────────┐
     ▼          ▼        ▼         ▼           ▼            ▼
  Austin    Dallas    Houston   San Antonio  Arlington   NOAA /
  Socrata   OpenData  ArcGIS    CKAN         ArcGIS      TxDOT / Cameras
```

### Data flow

1. **Edge functions** (`dispatch-data`, `live-data`, `txdot-camera-proxy`) run on Supabase's Deno runtime, fan out to upstream APIs in parallel via `Promise.allSettled`, normalize each provider's bespoke schema into a unified `DispatchCall` shape, deduplicate, sort, and return JSON with cache headers. Each upstream request is wrapped in a hard timeout so a single slow source can't stall the whole aggregation.
2. **TanStack Query** on the client handles caching, 15-second polling, automatic retries, and visibility-aware refetching when the user returns to the tab.
3. **React components** consume the typed query results. The map and feed share a `selectedIncident` state lifted into `Index.tsx`, so clicking a feed row flies the map to the incident and vice versa.

---

## Tech Stack

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| Framework        | React 18, TypeScript 5, Vite 5                                 |
| UI / Styling     | Tailwind CSS 3, shadcn/ui (Radix primitives), CVA, Lucide     |
| State / Data     | TanStack Query v5, React Hook Form, Zod                        |
| Maps             | Leaflet 1.9 + react-leaflet 4.2                               |
| Backend          | Supabase Edge Functions (Deno), Supabase JS SDK               |
| Testing          | Vitest, Testing Library, jsdom                                 |
| Tooling          | ESLint 9, TypeScript-ESLint, PostCSS, Autoprefixer            |

---

## Engineering Highlights

- **Heterogeneous data normalization.** Every Texas city publishes CAD data in a different shape (Socrata vs CKAN vs ArcGIS Feature Service), with different field names, timestamp formats, and coordinate conventions. A single `DispatchCall` type with per-source adapters coerces everything into one shape, plus a heuristic `mapCallSeverity` classifier that maps free-text call types ("shots fired", "DWI", "welfare check") onto a four-tier severity enum.
- **Resilient aggregation (no map blackouts).** The `city=all` view fans out to five independent government endpoints. Each upstream `fetch` is now wrapped in an 8-second `AbortController` timeout, so one slow or hung source (Houston ArcGIS and SAPD CKAN are both occasionally slow) returns an empty slice instead of stalling the whole function and leaving the map with zero incidents.
- **Defensive geospatial rendering.** Upstream feeds occasionally return `null`, strings, or out-of-range coordinates that crash Leaflet with `Invalid LatLng object: (NaN, NaN)`. An `isValidLatLng` guard, try/catch around every `map.flyTo`, and a deterministic city-centroid hash fallback keep a single bad row from breaking the renderer.
- **Robust timestamp parsing.** Dallas publishes a date field that already contains a time component; naively concatenating `date + "T" + time` produced invalid dates that corrupted the newest-first sort. A `safeTimestamp` helper normalizes any (date, time) pair to valid ISO 8601 and falls back to `now()` when unparseable.
- **Polling that respects the user.** Rather than always-on websockets, the dashboard uses 15s polling plus a `visibilitychange` listener that triggers an immediate refetch when the tab regains focus — cheaper, simpler, and indistinguishable from realtime for a 15s SLA.
- **Token-driven theming.** All colors live as HSL CSS variables in `index.css` and are consumed only through Tailwind semantic classes — no raw hex in components. Swapping the entire palette is a one-file change.
- **Responsive without compromise.** Desktop is a three-pane EOC layout; mobile collapses to a bottom-tab navigator (Map / Feed / Intel) with the same data and interactions. Tested at 360px, 768px, and 1440px.

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── StatusBar.tsx        # Top bar: clock (12h), system status, alerts
│   │   ├── StatsBar.tsx         # Per-city incident counts
│   │   ├── TacticalMap.tsx      # Leaflet map + markers + cameras + fly-to
│   │   ├── IncidentFeed.tsx     # Filterable streaming list
│   │   ├── IntelPanel.tsx       # Situational summary
│   │   ├── TrafficCameras.tsx   # TxDOT camera grid
│   │   ├── AlertBanner.tsx      # NOAA critical-alert ticker
│   │   └── BootSequence.tsx     # Cinematic startup animation
│   └── ui/                      # shadcn/ui primitives
├── hooks/
│   ├── useDispatchData.ts       # CAD feed query + polling
│   ├── useCameras.ts            # TxDOT camera list + snapshot URLs
│   └── useLiveData.ts           # Weather + traffic query
├── pages/Index.tsx              # Composition root
└── index.css                    # Design tokens (HSL)

supabase/functions/
├── dispatch-data/               # Multi-city CAD aggregator (timeout-hardened)
├── live-data/                   # NOAA + TxDOT aggregator
└── txdot-camera-proxy/          # CORS proxy for live camera snapshots
```

---

## Getting Started

**Prerequisites:** Node.js 18+ and npm.

```bash
git clone https://github.com/kamikaze1120/texas-watch.git
cd texas-watch
npm install
npm run dev          # http://localhost:8080
```

### Scripts

| Command           | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR       |
| `npm run build`   | Production build                     |
| `npm run lint`    | Lint with ESLint                     |
| `npm run test`    | Run Vitest suite                     |
| `npm run preview` | Preview the production build         |

### Environment

The frontend talks to Supabase Edge Functions. Copy `.env.example` to `.env` and fill in your Supabase project values:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-ref>
```

> These are the Supabase **publishable (anon)** values and are safe to expose in a client bundle; row-level security on the database and `verify_jwt` settings on the edge functions are what protect your data. On Vercel, set the same variables in **Project → Settings → Environment Variables**.

### Deploying the edge functions

The map's live data is served by Supabase Edge Functions in `supabase/functions/`. Deploy them with the Supabase CLI:

```bash
supabase functions deploy dispatch-data
supabase functions deploy live-data
supabase functions deploy txdot-camera-proxy
```

All three are configured with `verify_jwt = false` in `supabase/config.toml` so the public dashboard can read them without an auth token.

---

## Data Sources & Attribution

All data is sourced from publicly published government APIs. This project is for educational and demonstration purposes and is not affiliated with any of these agencies. No API keys are required — every source is a free, public endpoint.

- **City of Austin** — Real-Time Traffic Incidents (Socrata)
- **City of Dallas** — Police Active Calls (Socrata)
- **City of Houston** — Crime Data (ArcGIS Feature Server)
- **City of San Antonio** — SAPD Calls for Service (CKAN)
- **City of Arlington** — Police Active 911 Calls (ArcGIS)
- **NOAA / National Weather Service** — `api.weather.gov` active alerts
- **TxDOT** — Road Conditions ArcGIS service & ITS live camera snapshots

---

## Roadmap

- WebSocket push (Supabase Realtime) to replace polling
- Persisted incident history + trend analytics
- LLM-powered narrative briefings on selected incidents
- Role-based access control for restricted intel views
- Push notifications for critical-severity events

---

## License

MIT — see `LICENSE`.

## Author

Built and maintained by **Mujtaba** ([@kamikaze1120](https://github.com/kamikaze1120)) — a full-stack project demonstrating resilient data integration, geospatial UI, and production React engineering.
