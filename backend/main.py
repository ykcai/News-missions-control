from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from news_sources import SOURCES
from ingest import fetch_source
from storage import init_db, upsert_items, query_items, stats

scheduler = BackgroundScheduler()


def refresh_all() -> dict:
    inserted = 0
    per_source = []
    for category, srcs in SOURCES.items():
        for src in srcs:
            try:
                items = fetch_source(category, src)
                inserted += upsert_items(items)
                per_source.append({"source": src["name"], "category": category, "items": len(items), "ok": True})
            except Exception as e:
                per_source.append({"source": src["name"], "category": category, "items": 0, "ok": False, "error": str(e)})
    return {
        "inserted": inserted,
        "sources": per_source,
        "at": datetime.now(timezone.utc).isoformat(),
        "db": stats(),
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    # warm-up fetch once at start
    refresh_all()
    scheduler.add_job(refresh_all, "interval", minutes=10, id="refresh_all", replace_existing=True)
    scheduler.start()
    
    yield
    
    # Shutdown
    if scheduler.running:
        scheduler.shutdown(wait=False)


app = FastAPI(title="Mission Control News Backend", version="1.0", lifespan=lifespan)

# Local dev: allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "time": datetime.now(timezone.utc).isoformat(), "db": stats()}


@app.post("/api/refresh")
def refresh() -> dict:
    return refresh_all()


@app.get("/api/items")
def items(category: str | None = None, level: str | None = None, limit: int = 200) -> dict:
    rows = query_items(category=category, level=level, limit=limit)
    return {"items": rows}


@app.get("/api/critical")
def critical(limit: int = 80) -> dict:
    # Return critical + high together
    crit = query_items(level="critical", limit=limit)
    high = query_items(level="high", limit=limit)
    # Merge & sort
    merged = crit + [x for x in high if x["id"] not in {c["id"] for c in crit}]
    merged.sort(key=lambda r: (r.get("published") or r.get("inserted_at") or "", r.get("score") or 0), reverse=True)
    return {"items": merged[:limit]}


@app.get("/api/summary")
def summary() -> dict:
    s = stats()
    now = datetime.now(timezone.utc).isoformat()
    # quick pulse: last 48h volume by category (approx via published string prefix)
    return {"time": now, "db": s, "categories": list(SOURCES.keys())}

# Made with Bob
