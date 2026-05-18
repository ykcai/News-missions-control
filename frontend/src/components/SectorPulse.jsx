import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function bucket(items) {
  const counts = { critical: 0, high: 0, watch: 0, info: 0 }
  for (const it of (items || [])) {
    counts[it.level] = (counts[it.level] || 0) + 1
  }
  return counts
}

export default function SectorPulse({ banking, tech, ai }) {
  const b = bucket(banking)
  const t = bucket(tech)
  const a = bucket(ai)

  const data = [
    { sector: 'Banking', ...b },
    { sector: 'Tech', ...t },
    { sector: 'AI', ...a },
  ]

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 14, left: -10, bottom: 10 }}>
          <XAxis dataKey="sector" stroke="rgba(217,247,255,0.55)" />
          <YAxis stroke="rgba(217,247,255,0.55)" />
          <Tooltip
            contentStyle={{ background: 'rgba(10,18,28,0.95)', border: '1px solid rgba(120,255,255,0.18)', color: '#D9F7FF', borderRadius: 12 }}
            cursor={{ fill: 'rgba(93,242,255,0.05)' }}
          />
          <Legend />
          <Bar dataKey="critical" stackId="a" fill="#FF3B3B" />
          <Bar dataKey="high" stackId="a" fill="#FFB020" />
          <Bar dataKey="watch" stackId="a" fill="#5DF2FF" />
          <Bar dataKey="info" stackId="a" fill="rgba(217,247,255,0.22)" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-hud-muted">Stacked severity counts across sectors (last fetched window).</div>
    </div>
  )
}
