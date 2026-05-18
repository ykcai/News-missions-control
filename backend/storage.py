from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Iterable

DB_PATH = Path(__file__).resolve().parent / "news.db"


def connect() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def init_db() -> None:
    con = connect()
    cur = con.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            category TEXT,
            source_id TEXT,
            source_name TEXT,
            region TEXT,
            title TEXT,
            summary TEXT,
            link TEXT,
            published TEXT,
            score REAL,
            level TEXT,
            hits TEXT,
            inserted_at TEXT
        );
        """
    )
    cur.execute("CREATE INDEX IF NOT EXISTS idx_items_cat ON items(category);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_items_level ON items(level);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_items_published ON items(published);")
    con.commit()
    con.close()


def upsert_items(rows: Iterable[dict]) -> int:
    con = connect()
    cur = con.cursor()
    n = 0
    for r in rows:
        cur.execute(
            """
            INSERT INTO items(
                id, category, source_id, source_name, region, title, summary, link,
                published, score, level, hits, inserted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title=excluded.title,
                summary=excluded.summary,
                link=excluded.link,
                published=excluded.published,
                score=excluded.score,
                level=excluded.level,
                hits=excluded.hits,
                inserted_at=excluded.inserted_at;
            """,
            (
                r["id"], r["category"], r["source_id"], r["source_name"], r.get("region"),
                r.get("title"), r.get("summary"), r.get("link"), r.get("published"),
                r.get("score"), r.get("level"), r.get("hits"), r.get("inserted_at")
            )
        )
        n += 1
    con.commit()
    con.close()
    return n


def query_items(category: str | None = None, level: str | None = None, limit: int = 200) -> list[dict]:
    con = connect()
    cur = con.cursor()
    q = "SELECT * FROM items"
    where = []
    params = []
    if category:
        where.append("category = ?")
        params.append(category)
    if level:
        where.append("level = ?")
        params.append(level)
    if where:
        q += " WHERE " + " AND ".join(where)
    q += " ORDER BY COALESCE(published, inserted_at) DESC, score DESC LIMIT ?"
    params.append(int(limit))
    cur.execute(q, params)
    rows = [dict(r) for r in cur.fetchall()]
    con.close()
    return rows


def stats() -> dict:
    con = connect()
    cur = con.cursor()
    cur.execute("SELECT COUNT(*) as c FROM items")
    total = cur.fetchone()[0]
    cur.execute("SELECT level, COUNT(*) as c FROM items GROUP BY level")
    by_level = {r[0]: r[1] for r in cur.fetchall()}
    cur.execute("SELECT category, COUNT(*) as c FROM items GROUP BY category")
    by_cat = {r[0]: r[1] for r in cur.fetchall()}
    con.close()
    return {"total": total, "by_level": by_level, "by_category": by_cat}
