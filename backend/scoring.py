from __future__ import annotations

from datetime import datetime, timezone
from dateutil import parser as dateparser

# Tunable keyword dictionaries
CRITICAL_KEYWORDS = {
    "security": ["breach", "ransomware", "data leak", "hack", "cyber", "ddos"],
    "stability": ["outage", "service disruption", "downtime", "incident"],
    "enforcement": ["penalty", "fine", "consent order", "cease", "enforcement", "settlement"],
    "legal": ["lawsuit", "class action", "indict", "probe", "investigation"],
    "market": ["bank run", "liquidity", "insolvency", "capital shortfall"],
}

WATCH_KEYWORDS = [
    "guideline", "consultation", "draft", "final rule", "proposed", "supervisory", "compliance",
    "interchange", "aml", "fintrac", "osfi", "basel", "model risk", "ai act", "privacy",
]

# Simple urgency model (recency boosts)
# Score scales 0–100

def parse_dt(entry: dict) -> datetime | None:
    for k in ("published", "updated", "created"):
        v = entry.get(k)
        if v:
            try:
                dt = dateparser.parse(v)
                if not dt.tzinfo:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)
            except Exception:
                pass
    return None


def recency_multiplier(dt: datetime | None, now: datetime) -> float:
    if not dt:
        return 0.85
    age_hours = max(0.0, (now - dt).total_seconds() / 3600.0)
    # 0–6h: 1.4, 6–24h: 1.2, 1–3d: 1.0, 3–7d: 0.85, older: 0.7
    if age_hours <= 6:
        return 1.4
    if age_hours <= 24:
        return 1.2
    if age_hours <= 72:
        return 1.0
    if age_hours <= 168:
        return 0.85
    return 0.7


def keyword_hits(text: str) -> tuple[int, list[str]]:
    t = (text or "").lower()
    hits = []
    score = 0

    for bucket, kws in CRITICAL_KEYWORDS.items():
        for kw in kws:
            if kw in t:
                score += 18
                hits.append(kw)

    for kw in WATCH_KEYWORDS:
        if kw in t:
            score += 6
            hits.append(kw)

    # Cap raw keyword score
    return min(score, 60), hits[:12]


def score_item(*, title: str, summary: str, source_weight: float, published: datetime | None) -> dict:
    now = datetime.now(timezone.utc)
    base = 20
    raw_kw, hits = keyword_hits(f"{title} {summary}")
    rec = recency_multiplier(published, now)

    # Combine
    score = (base + raw_kw) * rec * float(source_weight or 1.0)

    # Normalize to 0–100
    score = max(0, min(100, round(score, 1)))

    level = "info"
    if score >= 80:
        level = "critical"
    elif score >= 60:
        level = "high"
    elif score >= 40:
        level = "watch"

    return {
        "score": score,
        "level": level,
        "hits": hits,
        "published": published.isoformat() if published else None,
        "now": now.isoformat(),
    }
