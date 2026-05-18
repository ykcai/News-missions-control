# Mission Control — Banking • Technology • AI (Local Command Center)

This is a **mission-control style** dashboard (HUD theme) for North American banking, technology, and AI signals.

- **Frontend**: React (Vite) + Tailwind + Recharts + Framer Motion + ReactPlayer
- **Backend**: Python FastAPI + RSS/Atom ingestion + scoring + SQLite cache
- **Public sources only** (news agencies, regulators, company blogs, SEC EDGAR)
- **Local-only** hosting (Windows-friendly)

---

## Quick Start (Windows)

### 1) Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2) Frontend
Open a **new** PowerShell window:
```powershell
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## Operations Notes
- Backend refresh runs every **10 minutes** (scheduler)
- UI updates every **1 minute** (polling)
- Use **Refresh** button for immediate ingestion

---

## Customize Sources
Edit: `backend/news_sources.py`

Add a new RSS/Atom entry like:
```py
{
  "id": "example",
  "name": "Example Source",
  "region": "US",
  "type": "media",
  "weight": 1.0,
  "url": "https://example.com/rss.xml",
}
```

---

## Customizing Criticality
Edit: `backend/scoring.py`

- `CRITICAL_KEYWORDS`
- `WATCH_KEYWORDS`
- recency multipliers
- scoring thresholds

---

## Why the "Video Wall" may be sparse
Most RSS feeds don’t include video URLs. When YouTube links appear, they’re embedded directly.

Tip: Add specific YouTube RSS feeds (public) if you want a guaranteed video stream.
