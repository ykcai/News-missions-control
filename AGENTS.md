# AGENTS.md

Mission Control: FastAPI (RSS ingestion + scoring, SQLite) + React/Vite dashboard.

## Running it here

```bash
docker compose -f docker-compose.base44.yml up -d
```

- `web` — Vite dev server from `./frontend`, published on **host port 3000** (container 5173).
  Dependencies install into the `frontend_node_modules` volume on start (re-synced when
  `package-lock.json` changes), so edits in `frontend/src` hot-reload.
- `api` — uvicorn `--reload` from `./backend`, published on host port 8000 (docs at `/docs`).

Browser only ever talks to port 3000: `vite.config.js` proxies `/api` to `API_PROXY_TARGET`
(`http://api:8000` in compose, `http://localhost:8000` otherwise). Single origin, so the
backend's CORS list stays untouched.

## Non-obvious notes

- **No credentials are needed.** All feeds in `backend/news_sources.py` are public; data lives in
  local SQLite (`backend/news.db`, gitignored, created on first boot).
- **Earnings strip** (`GET /api/earnings`, `backend/earnings.py`) is also keyless: it reads Nasdaq's
  public earnings calendar for today's US/Eastern date and filters it against the S&P 500 constituent
  CSV on GitHub. Calendar cached 30 min, constituents 24h; failures return `{"error": ...}` with
  HTTP 200 so the dashboard still loads.
- **Slow first boot on `api`:** startup runs a full feed warm-up (`refresh_all()` in the lifespan
  hook) before the server answers, so `/api/health` can take up to ~60s. The compose healthcheck
  uses `start_period: 120s`; do not shorten it.
- **Preview host allowlist (sandbox only):** this project's Vite (5.4.x) enforces
  `server.allowedHosts` but does not read `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`, so without a
  config entry the preview proxy gets `403 Blocked request`. `frontend/vite.config.js` adds the
  hosts only when `BASE44_PREVIEW_MODE === "1"` (unset = original behaviour): the
  `.<BASE44_SANDBOX_HOST_DOMAIN>` wildcard plus the exact `3000-<BASE44_PUBLIC_HOST_SUFFIX>`
  host — a leading-dot wildcard cannot match the `3000-` prefix form.
- Severity counters in the header come from the `/api/critical` payload only, so they read 0 when
  no item scores `critical`/`high`; the `db levels:` line shows everything stored.
- The repo's `start.sh` / `start.ps1` are the original macOS/Windows launchers (osascript,
  venv) and are not used here.

## Verifying

- `curl -s localhost:3000/api/health` → `{"ok": true, "db": {"total": N, ...}}` through the proxy.
- `curl -s -o /dev/null -w '%{http_code}' localhost:3000/` → 200; a foreign `Host` header should
  still return 403.
- Dashboard: header shows `Backend: OK` + item count; the three feed panels list articles.

No test suite exists in this repo.
