# HireMate Dashboard — Build Spec (Updated)
### Implementation guide for the analytics dashboard redesign

---

## Project Context

**Stack:** React + Vite, MUI (Material UI), CSS Variables, Axios (axiosClient with Bearer JWT)  
**Existing layout:** `DashboardLayout` (Navbar + Sidebar) wrapping `PageContainer`  
**Base route:** `/` renders `Home.jsx`  
**All API calls use:** `axiosClient` from existing setup — Bearer JWT auto-attached  
**Styling:** Uses existing CSS variables from `App.css` + dashboard-specific tokens

---

## API Reference

### `GET /api/dashboard/summary`
```
Query params: limit (int), days (int), from_date (YYYY-MM-DD), to_date (YYYY-MM-DD)
```
```json
{
  "stats": {
    "jobs_applied": 12,
    "jobs_saved": 25,
    "companies_checked": 8
  },
  "recent_applications": [...],
  "companies_viewed": [
    {
      "company_name": "acme",
      "page_url": "https://acme.com/careers",
      "visit_count": 3,
      "last_visited_at": "2025-02-28T10:00:00"
    }
  ],
  "applications_by_day": [
    { "date": "2025-02-25", "count": 3 },
    { "date": "2025-02-26", "count": 5 }
  ]
}
```

**Backend change:** `companies_viewed` now includes `visit_count` and `last_visited_at` for Company Interest Tracker signals.

### `GET /api/chrome-extension/jobs`
```
Query params: from_date (YYYY-MM-DD), to_date (YYYY-MM-DD), status (string)
```
**Frontend:** `listJobsAPI(options)` accepts `{ status?, from_date?, to_date? }` for date filtering.

**Valid `application_status` values:** `saved`, `applied`, `interview`, `closed`

---

## Dashboard Styling (CSS Variables)

Added to `App.css`:

```css
/* ---- Dashboard (professional card styling) ---- */
--dashboard-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
--dashboard-card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.08);
--dashboard-card-radius: 12px;
--dashboard-section-label: 0.6875rem;
--dashboard-section-spacing: 1.5rem;
```

Uses existing vars: `--primary`, `--success`, `--warning`, `--error`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-color`, `--bg-paper`, `--light-blue-bg-08`, etc.

---

## File Structure (Implemented)

```
src/
├── pages/
│   └── dashboard/
│       ├── Home.jsx                      ← REWRITTEN: global date state, all widgets
│       └── update_details.md             ← This file
├── components/
│   └── dashboard/
│       ├── CareerHealthScore.jsx         ← Score ring + breakdown bars + tip
│       ├── StatCards.jsx                 ← 4 cards + sparkline on Applied
│       ├── ApplicationFunnel.jsx         ← Horizontal funnel + coaching tip
│       ├── ActivityHeatmap.jsx           ← GitHub-style grid
│       ├── CompanyTracker.jsx            ← Table with signal badges
│       ├── SavedJobs.jsx                 ← Age badges, sort by staleness
│       ├── RecentApplications.jsx        ← Status badges
│       ├── SmartInsights.jsx             ← Rule-based insight cards
│       ├── DateFilter.jsx                ← Presets + custom range
│       └── SkeletonCard.jsx              ← Shared loading placeholder
├── utils/
│   └── dashboardUtils.js                ← Pure computation (no React)
└── services/
    ├── dashboardService.js               ← getDashboardSummaryAPI, getSavedJobsAPI
    └── jobsService.js                    ← listJobsAPI(options), updateJobStatusAPI
```

**Note:** No separate hooks — data fetching lives in `Home.jsx`, components receive props.

---

## Implementation Summary

### Home.jsx
- Global `dateRange` state: `{ preset, from, to }`
- `buildDateParams()` → `{ days }` or `{ from_date, to_date }`
- Fetches: `getDashboardSummaryAPI`, `getSavedJobsAPI`
- Passes `summary`, `jobs`, `loading` to all child components

### Career Health Score
- Low score (< 40): Uses primary blue (softer than red)
- Mid (40–69): Amber
- High (70+): Green
- SVG circular progress ring, horizontal breakdown bars, coaching tip

### Stat Cards
- 4 cards: Applied, Saved, Companies, Response Rate
- Applied card: mini sparkline from last 7 days
- Hover: subtle shadow elevation
- Consistent typography and spacing

### Date Filter
- Preset buttons: 7d, 14d, 30d
- Custom: collapsible date picker
- Selected state: primary background

### Application Funnel
- 5 stages: Saved → Applied → Interview → Offer → Closed
- Color-coded boxes, conversion rates between stages
- Coaching tip banner (light blue background)

### Activity Heatmap
- ~26 weeks of application activity
- Color gradient: grey (none) → purple (more)
- Day labels, month labels, legend, peak day

### Company Interest Tracker
- Table: Company, Visits, Applied?, Signal, Action
- Signals: Applied ✓, 🔥 High Interest, 👀 Active, ⚠️ Going Cold, 🧊 Cold
- Uses `visit_count`, `last_visited_at` from API

### Saved Jobs
- Age badges: Fresh (≤7d), Aging (≤21d), Stale (>21d)
- Sort: stale first
- Stale warning at bottom

### Recent Applications
- Status badges: Applied, Interview, Offer, Closed, Saved
- Link to Application Tracker
- Job links where available

### Smart Insights
- Rule-based: streak, peak day, conversion, response rate, stale jobs
- Empty state: "Keep applying to unlock personalized insights"
- Up to 3 insight cards when conditions met

---

## Styling Guidelines (Professional Look)

1. **Cards:** `border-radius: var(--dashboard-card-radius)`, `box-shadow: var(--dashboard-card-shadow)`
2. **Hover:** Slight shadow increase for interactivity
3. **Section labels:** Uppercase, muted, `letter-spacing: 1`, `font-size: var(--dashboard-section-label)`
4. **Typography:** Consistent font sizes (0.6875rem for labels, 0.8125rem for body, 0.875rem for emphasis)
5. **Borders:** `1px solid var(--border-color)`
6. **Low-score Career Health:** Use primary blue instead of red for a less harsh appearance
7. **Coaching tips:** Light backgrounds (light-blue-bg-08, warning-bg) with readable contrast

---

## Notes

1. **All API calls use existing `axiosClient`** — Bearer JWT auto-attached
2. **Data fetching in `Home.jsx` only** — child components are presentational
3. **`dashboardUtils.js`** — pure functions, no React
4. **`date-fns`** — already in package.json, used for date math
5. **MUI components** — Box, Typography, Card, Button, etc.; sx prop for styling
6. **No new packages** — uses existing stack
7. **Empty states** — every component handles loading and empty data
8. **`id="saved-jobs"`** — anchor for Smart Insights CTAs
