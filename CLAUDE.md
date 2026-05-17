# Settlement Analytics Dashboard — CLAUDE.md


## What This Project Is

A full-stack analytics dashboard that simulates a newcomer settlement data environment,
built to demonstrate data analysis, SQL database management, Python data pipelines,
interactive visualization, and translating data for non-technical audiences.

This is a portfolio project targeting a data analyst role at a newcomer settlement NGO.
Every feature maps to a real job requirement. Build with that in mind.

---

## Tech Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Backend    | Python 3.11+, Flask, SQLAlchemy           |
| Database   | SQLite (`data/settlement.db`)             |
| Analysis   | Pandas, NumPy                             |
| Charts     | Plotly (served as JSON to frontend)       |
| Frontend   | React 18, Tailwind CSS, Plotly.js         |
| Deploy     | Vercel (frontend), Render (backend)       |
| Version    | Git — commit after every working feature  |

---

## Project Structure

```
settlement-analytics-dashboard/
├── CLAUDE.md                  ← You are here
├── README.md                  ← Keep updated with screenshots + live link
├── requirements.txt
├── .gitignore
│
├── backend/
│   ├── app.py                 ← Flask app + route registration
│   ├── models.py              ← SQLAlchemy models
│   ├── seed_data.py           ← Generates synthetic client records
│   ├── analytics.py           ← All Pandas analysis functions
│   └── routes/
│       ├── clients.py         ← /api/clients endpoints
│       ├── programs.py        ← /api/programs endpoints
│       └── quality.py         ← /api/quality endpoints
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       │   ├── Overview.jsx        ← KPI cards + trend charts
│       │   ├── Programs.jsx        ← Program effectiveness page
│       │   ├── Clients.jsx         ← Searchable client table
│       │   └── DataQuality.jsx     ← Data quality panel
│       └── components/
│           ├── KPICard.jsx
│           ├── NarrativeSummary.jsx   ← Plain-language chart explainer
│           ├── PlotlyChart.jsx
│           └── Sidebar.jsx
│
└── data/
    └── settlement.db
```

---

## Database Schema

### clients
| Column           | Type    | Notes                          |
|------------------|---------|--------------------------------|
| id               | INTEGER | Primary key                    |
| name             | TEXT    | Synthetic name                 |
| country_of_origin| TEXT    | One of 15 realistic countries  |
| intake_date      | DATE    | Between Jan 2023 – Dec 2024    |
| program_type     | TEXT    | See program types below        |
| status           | TEXT    | active / completed / withdrawn |
| completion_date  | DATE    | Nullable                       |
| case_worker      | TEXT    | Assigned staff member          |
| language_spoken  | TEXT    | Primary language               |
| notes            | TEXT    | Nullable — for quality testing |

### Program Types
- Language Training
- Employment Services
- Housing Support
- Social Integration
- Legal & Documentation
- Mental Health Support

### Countries of Origin (use these 15)
Syria, Ukraine, Afghanistan, Somalia, Ethiopia, Eritrea, Congo (DRC),
Nigeria, Colombia, Venezuela, Iran, Iraq, Myanmar, Sudan, Cameroon

---

## API Endpoints

```
GET /api/clients                → all client records (paginated)
GET /api/clients/<id>           → single client
GET /api/programs/completion    → completion rates by program + month
GET /api/programs/trends        → monthly intake counts
GET /api/overview/kpis          → total clients, completion rate, active count, quality score
GET /api/quality/flags          → records with missing/incomplete fields
GET /api/quality/score          → overall data quality score (0–100)
GET /api/origins                → client count by country of origin
```

All endpoints return JSON. CORS is enabled for the Vercel frontend URL.

---

## Key Design Rules

1. **Every chart gets a narrative summary** — a 2–3 sentence plain-English paragraph
   below it explaining what the data shows and what it means. This is non-negotiable.
   It demonstrates data communication skills, the core soft skill for this role.

2. **Data quality panel flags records missing 2+ fields** — completion_date, notes,
   language_spoken, and case_worker are the nullable fields used for quality scoring.

3. **Commit after each working feature** — not at the end of a session.
   Use conventional commits: `feat:`, `fix:`, `add:`, `docs:`, `refactor:`

4. **No placeholder UI** — if a chart has no data, show an empty state message,
   not a broken layout or console error.

5. **Mobile responsive** — Tailwind responsive classes, sidebar collapses on small screens.

6. **README must stay updated** — add a screenshot after each major page is built.

---

## Commit Message Style

```
feat: add program completion rate chart with narrative summary
fix: handle null completion_date in quality flag query
add: seed data generator with 200 synthetic client records
docs: update README with overview page screenshot
refactor: move Pandas aggregations into analytics.py
```

---

## Environment Variables

### Backend (.env in /backend)
```
FLASK_ENV=development
DATABASE_URL=sqlite:///../data/settlement.db
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env in /frontend)
```
VITE_API_URL=http://localhost:5000
```

---

## What "Done" Looks Like Per Session

| Session | Done When...                                                          |
|---------|-----------------------------------------------------------------------|
| 1       | `seed_data.py` runs and populates 200 records in `settlement.db`     |
| 2       | All API endpoints return correct JSON, tested in browser              |
| 3       | Overview page renders with 4 KPI cards and 3 charts                  |
| 4       | Programs page + Data Quality panel both functional                    |
| 5       | Live Vercel + Render URLs work, README has screenshots                |
