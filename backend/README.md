# Backend (FastAPI) — Mission Control Command Center

## Setup (Windows)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Run
```powershell
python -m uvicorn main:app --reload --port 8000
```

## Endpoints
- `GET /api/health`
- `POST /api/refresh`
- `GET /api/items?category=ai&limit=200`
- `GET /api/critical`
- `GET /api/summary`

## Configure sources
Edit `news_sources.py` to add/remove RSS/Atom feeds.
