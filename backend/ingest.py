from __future__ import annotations

import hashlib
import html
import re
from datetime import datetime, timezone

import feedparser

from scoring import parse_dt, score_item


_YT_RE = re.compile(r"(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w\-]+)")


def stable_id(*, source_id: str, link: str, title: str) -> str:
    raw = f"{source_id}|{link}|{title}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:24]


def clean_text(s: str) -> str:
    if not s:
        return ""
    s = html.unescape(s)
    # remove tags
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def extract_youtube(text: str) -> list[str]:
    if not text:
        return []
    return list(dict.fromkeys(_YT_RE.findall(text)))


def fetch_source(category: str, src: dict) -> list[dict]:
    parsed = feedparser.parse(src["url"])
    items = []
    now = datetime.now(timezone.utc).isoformat()

    for e in (parsed.entries or [])[:80]:
        title = (e.get("title") or "").strip()
        link = (e.get("link") or "").strip()
        summary_raw = e.get("summary") or e.get("description") or ""
        summary = clean_text(summary_raw)

        published_dt = parse_dt(e)
        s = score_item(
            title=title,
            summary=summary,
            source_weight=float(src.get("weight", 1.0)),
            published=published_dt,
        )

        yt = extract_youtube(f"{link} {summary_raw}")

        items.append(
            {
                "id": stable_id(source_id=src["id"], link=link, title=title),
                "category": category,
                "source_id": src["id"],
                "source_name": src["name"],
                "region": src.get("region"),
                "title": title,
                "summary": summary,
                "link": link,
                "published": s.get("published"),
                "score": s.get("score"),
                "level": s.get("level"),
                "hits": ", ".join(s.get("hits") or []),
                "inserted_at": now,
                "youtube": yt,
            }
        )

    return items
