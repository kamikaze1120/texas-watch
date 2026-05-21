# Texas Guardian — Public Safety Intelligence Platform

> A real-time, multi-source tactical dashboard that aggregates live public-safety data across Texas's four largest metros (Austin, Dallas, Houston, San Antonio) into a single situational-awareness console.

**Live demo:** https://texas-guardian.lovable.app

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Edge_Functions-3ECF8E?logo=supabase&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)

---

## Overview

Texas Guardian (TPSIP — Texas Public Safety Intelligence Platform) is a single-pane-of-glass operations console designed to mirror the experience of a real emergency-operations center. It ingests **live computer-aided dispatch (CAD) feeds**, **NOAA weather alerts**, **TxDOT road conditions**, and **traffic-camera streams**, normalizes them through a serverless backend, and renders them on an interactive tactical map alongside a streaming incident feed and an AI-style intel panel.

The project demonstrates end-to-end ownership of a production-grade, data-heavy React application: API design, data normalization across heterogeneous government data sources, geospatial visualization, responsive UI, design-system theming, and graceful degradation when upstream sources fail.

---

## Key Features

- **Multi-city live CAD feed** — pulls active calls-for-service from four independent municipal APIs (Austin Socrata, Dallas Open Data, Houston ArcGIS Feature Server, San Antonio CKAN) and merges them into a single normalized stream.
- **Interactive tactical map** — Leaflet-based map with severity-coded markers, click-to-zoom on incidents, automatic city-zoom on filter change, and hardened coordinate validation to prevent malformed upstream data from crashing the renderer.
- **NOAA weather integration** — surfaces active Texas weather alerts (severity, urgency, affected areas, expiration) from the National Weather Service API.
- **TxDOT road conditions** — live closures and hazards via the official TxDOT ArcGIS service.
- **Streaming incident feed** — filterable by city and severity, with near-real-time refresh (15s polling + visibility-aware refetch) and one-click map fly-to.
- **AI intel panel** — contextual situational summaries and threat-level reasoning.
- **Cinematic boot sequence** — branded startup animation that doubles as a load-state for the first data hydration.
- **Mobile-first responsive layout** — tab-based navigation on small screens, three-pane layout on desktop, tested down to 360px width.
- **Texas-flag-inspired theme** — fully token-driven design system (HSL semantic tokens in `index.css` + Tailwind theme extensions), 12-hour clock, dark tactical aesthetic.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    React 18 + Vite + TS                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐  │
│  │ StatusBar  │  │ TacticalMap│  │IncidentFeed│  │ Intel  │  │
│  └────────────┘  └─────┬──────┘  └─────┬──────┘  └────────┘  │
│                        │                │                    │
│              TanStack Query (cache + polling + retries)      │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS
                ┌────────▼─────────┐
                │  Supabase Edge   │   Deno runtime
                │    Functions     │   (CORS, dedupe, normalize)
                └────────┬─────────┘
        ┌────────────────┼──────────────────┬──────────────┐
        ▼                ▼                  ▼              ▼
  Austin Socrata   Dallas Open Data   Houston ArcGIS   SAPD CKAN
  NOAA Weather     TxDOT Conditions   Traffic Cameras
```

### Data flow

1. **Edge functions** (`dispatch-data`, `live-data`, `txdot-camera-proxy`) run on Supabase's Deno runtime, fan out to upstream APIs in parallel via `Promise.allSettled`, normalize each provider's bespoke schema into a unified `DispatchCall` shape, deduplicate, sort, and return JSON with cache headers.
2. **TanStack Query** on the client handles caching, 15-second polling, automatic retries, and visibility-aware refetching when the user returns to the tab.
3. **React components** consume the typed query results. The map and feed share a `selectedIncident` state lifted into `Index.tsx`, so clicking a feed row flies the map to the incident and vice versa.

---

## Tech Stack

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| Framework        | React 18, TypeScript 5, Vite 5                                |
| UI / Styling     | Tailwind CSS 3, shadcn/ui (Radix primitives), CVA, Lucide     |
| State / Data     | TanStack Query v5, React Hook Form, Zod                       |
| Maps             | Leaflet 1.9 + react-leaflet 4.2                               |
| Backend          | Supabase Edge Functions (Deno), Supabase JS SDK               |
| Testing          | Vitest, Testing Library, jsdom                                |
| Tooling          | ESLint 9, TypeScript-ESLint, PostCSS, Autoprefixer            |

---

## Engineering Highlights

These are the problems I am happy to talk through in an interview:

- **Heterogeneous data normalization.** Every Texas city publishes CAD data in a different shape (Socrata vs CKAN vs ArcGIS Feature Service), with different field names, timestamp formats, and — critically — different coordinate conventions. I built a single `DispatchCall` type and per-source adapters that coerce everything into it, plus a heuristic `mapCallSeverity` classifier that maps free-text call types ("shots fired", "DWI", "welfare check") onto a four-tier severity enum.
- **Defensive geospatial rendering.** Upstream feeds occasionally return `null`, strings, or out-of-range coordinates that crash Leaflet with `Invalid LatLng object: (NaN, NaN)`. I added an `isValidLatLng` guard, wrapped every `map.flyTo` in try/catch, and fall back to a deterministic city-centroid hash so a single bad row never breaks the renderer.
- **Graceful upstream degradation.** Houston's ArcGIS endpoint is flaky; if it returns non-200 or an empty feature set, a fallback generator seeds plausible incidents tagged "(Est.)" so the UI stays populated and the failure is visible without being catastrophic.
- **Polling that respects the user.** Rather than always-on websockets, the dashboard uses 15s polling plus a `visibilitychange` listener that triggers an immediate refetch when the tab regains focus — cheaper, simpler, and indistinguishable from realtime for a 15s SLA.
- **Token-driven theming.** All colors live as HSL CSS variables in `index.css` and are consumed only through Tailwind semantic classes — no raw hex in components. Swapping the entire palette (e.g. to the Texas-flag theme) is a one-file change.
- **Responsive without compromise.** Desktop is a three-pane EOC layout; mobile collapses to a bottom-tab navigator (Map / Feed / Intel) with the same data and interactions. Tested at 360px, 768px, and 1440px.

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── StatusBar.tsx        # Top bar: clock (12h), system status, alerts
│   │   ├── StatsBar.tsx         # Per-city incident counts
│   │   ├── TacticalMap.tsx      # Leaflet map + markers + fly-to
│   │   ├── IncidentFeed.tsx     # Filterable streaming list
│   │   ├── IntelPanel.tsx       # AI-style situational summary
│   │   ├── TrafficCameras.tsx   # TxDOT camera grid
│   │   ├── AlertBanner.tsx      # NOAA critical-alert ticker
│   │   └── BootSequence.tsx     # Cinematic startup animation
│   └── ui/                      # shadcn/ui primitives
├── hooks/
│   ├── useDispatchData.ts       # CAD feed query + polling
│   └── useLiveData.ts           # Weather + traffic query
├── pages/Index.tsx              # Composition root
└── index.css                    # Design tokens (HSL)

supabase/functions/
├── dispatch-data/               # Multi-city CAD aggregator
├── live-data/                   # NOAA + TxDOT aggregator
└── txdot-camera-proxy/          # CORS proxy for camera streams
```

---

## Getting Started

**Prerequisites:** Node.js 18+ and npm (or bun).

```bash
git clone <repo-url>
cd texas-guardian
npm install
npm run dev          # http://localhost:5173
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

Supabase credentials are injected automatically via Lovable Cloud. For local self-hosting, set:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

---

## Data Sources & Attribution

All data is sourced from publicly published government APIs. This project is for educational and demonstration purposes and is not affiliated with any of these agencies.

- **City of Austin** — Real-Time Traffic Incidents (Socrata)
- **City of Dallas** — Police Active Calls (Socrata)
- **City of Houston** — Crime Data (ArcGIS Feature Server)
- **City of San Antonio** — SAPD Calls for Service (CKAN)
- **NOAA / National Weather Service** — `api.weather.gov` active alerts
- **TxDOT** — Road Conditions ArcGIS service & DriveTexas camera streams

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

Built by [Your Name] as a portfolio project to demonstrate full-stack React, geospatial UI, and resilient data-integration engineering. Reach me at [your-email] or [linkedin].
