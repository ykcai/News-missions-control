import { motion } from 'framer-motion'

function badge(level) {
  if (level === 'critical') return 'bg-hud-red/15 text-hud-red border-hud-red/30'
  if (level === 'high') return 'bg-hud-amber/15 text-hud-amber border-hud-amber/30'
  if (level === 'watch') return 'bg-hud-cyan/12 text-hud-cyan border-hud-cyan/25'
  return 'bg-white/5 text-hud-muted border-hud-border'
}

function clamp(s, n = 160) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export default function AlertPanel({ items }) {
  const top = (items || []).slice(0, 14)

  return (
    <div className="space-y-3">
      {top.length === 0 && (
        <div className="text-xs text-hud-muted">No critical items detected right now. Try Refresh.</div>
      )}

      {top.map((it, idx) => (
        <motion.a
          key={it.id}
          href={it.link}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.02 }}
          className="block rounded-2xl border border-hud-border bg-black/20 hover:bg-black/30 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm font-semibold leading-snug">
              {it.title}
            </div>
            <div className={"shrink-0 text-[11px] px-2 py-1 rounded-full border " + badge(it.level)}>
              {it.level.toUpperCase()} • {Math.round(it.score)}
            </div>
          </div>
          <div className="mt-1 text-xs text-hud-muted">
            {it.source_name} {it.region ? `• ${it.region}` : ''} {it.published ? `• ${new Date(it.published).toLocaleString()}` : ''}
          </div>
          {it.hits && (
            <div className="mt-1 text-[11px] text-hud-cyan/80">
              signals: {it.hits}
            </div>
          )}
          {it.summary && (
            <div className="mt-2 text-xs text-hud-muted">
              {clamp(it.summary)}
            </div>
          )}
        </motion.a>
      ))}
    </div>
  )
}
