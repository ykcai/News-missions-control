import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function hoursAgoLabel(h) {
  if (h === 0) return 'now'
  return `-${h}h`
}

function buildSeries(items) {
  // Approx: count items per 6h bucket over last 48h using published timestamp.
  const now = Date.now()
  const buckets = Array.from({ length: 9 }, (_, i) => ({ idx: i, count: 0 })) // 0..8 => 0..48h

  for (const it of (items || [])) {
    const ts = it.published ? Date.parse(it.published) : null
    if (!ts) continue
    const ageH = (now - ts) / 3600000
    if (ageH < 0 || ageH > 48) continue
    const b = Math.min(8, Math.floor(ageH / 6))
    buckets[b].count += 1
  }

  // Convert to chart points from oldest to newest
  return buckets
    .map(b => ({ h: 48 - b.idx * 6, v: b.count }))
    .sort((a, b) => a.h - b.h)
    .map(p => ({ t: hoursAgoLabel(p.h === 48 ? 48 : p.h), value: p.v }))
}

export default function TrendPanel({ banking, tech, ai }) {
  const b = buildSeries(banking)
  const t = buildSeries(tech)
  const a = buildSeries(ai)

  const data = b.map((p, i) => ({
    t: p.t,
    banking: p.value,
    tech: t[i]?.value ?? 0,
    ai: a[i]?.value ?? 0,
  }))

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 14, left: -10, bottom: 10 }}>
          <XAxis dataKey="t" stroke="rgba(217,247,255,0.55)" />
          <YAxis stroke="rgba(217,247,255,0.55)" />
          <Tooltip
            contentStyle={{ background: 'rgba(10,18,28,0.95)', border: '1px solid rgba(120,255,255,0.18)', color: '#D9F7FF', borderRadius: 12 }}
            cursor={{ stroke: 'rgba(93,242,255,0.25)', strokeWidth: 1 }}
          />
          <Legend />
          <Line type="monotone" dataKey="banking" stroke="#5DF2FF" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="tech" stroke="#2F9BFF" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ai" stroke="#FFB020" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-hud-muted">Spikes can indicate breaking news, major filings, or regulatory activity.</div>
    </div>
  )
}
