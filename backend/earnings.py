from __future__ import annotations

import csv
import io
import json
import time
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

# Public, keyless sources: Nasdaq's earnings calendar + the S&P 500 constituent list.
NASDAQ_CALENDAR_URL = "https://api.nasdaq.com/api/calendar/earnings?date={date}"
SP500_CONSTITUENTS_URL = (
    "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv"
)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    ),
    "Accept": "application/json, text/csv, */*",
}

CALENDAR_TTL = 30 * 60
CONSTITUENTS_TTL = 24 * 60 * 60

TIME_LABELS = {
    "time-pre-market": "Pre-market",
    "time-after-hours": "After close",
    "time-not-supplied": "TBD",
}
TIME_ORDER = {"Pre-market": 0, "TBD": 1, "After close": 2}

_constituents_cache: dict = {"at": 0.0, "symbols": set()}
_calendar_cache: dict = {"date": None, "at": 0.0, "payload": None}


def _fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=_HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def _norm(symbol: str) -> str:
    return (symbol or "").strip().upper().replace(".", "-")


def sp500_symbols() -> set[str]:
    cached = _constituents_cache
    if cached["symbols"] and time.time() - cached["at"] < CONSTITUENTS_TTL:
        return cached["symbols"]

    text = _fetch(SP500_CONSTITUENTS_URL).decode("utf-8", "replace")
    symbols = {_norm(row.get("Symbol", "")) for row in csv.DictReader(io.StringIO(text))}
    symbols.discard("")
    _constituents_cache.update(at=time.time(), symbols=symbols)
    return symbols


def today_earnings() -> dict:
    """S&P 500 companies reporting today (US market date)."""
    today = datetime.now(ZoneInfo("America/New_York")).date().isoformat()
    cached = _calendar_cache
    if (
        cached["payload"] is not None
        and cached["date"] == today
        and time.time() - cached["at"] < CALENDAR_TTL
    ):
        return cached["payload"]

    result: dict = {"date": today, "items": [], "error": None}
    try:
        members = sp500_symbols()
        payload = json.loads(_fetch(NASDAQ_CALENDAR_URL.format(date=today)))
        rows = ((payload or {}).get("data") or {}).get("rows") or []

        items = []
        for r in rows:
            if _norm(r.get("symbol", "")) not in members:
                continue
            report_time = TIME_LABELS.get(r.get("time"), "TBD")
            items.append(
                {
                    "symbol": r.get("symbol", ""),
                    "name": r.get("name", ""),
                    "time": report_time,
                    "eps_forecast": r.get("epsForecast") or None,
                    "quarter_ending": r.get("fiscalQuarterEnding") or None,
                    "last_year_eps": r.get("lastYearEPS") or None,
                    "market_cap": r.get("marketCap") or None,
                }
            )

        items.sort(key=lambda x: (TIME_ORDER.get(x["time"], 3), x["symbol"]))
        result["items"] = items
    except Exception as e:  # network/parse failure should not break the dashboard
        result["error"] = f"{type(e).__name__}: {e}"

    if result["error"] is None:
        _calendar_cache.update(date=today, at=time.time(), payload=result)
    return result
