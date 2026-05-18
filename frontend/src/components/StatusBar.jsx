import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Wifi, Database, Clock } from 'lucide-react'

function fmt(ts) {
  if (!ts) return '—'
  try { return ts.toLocaleString() } catch { return String(ts) }
}

export default function StatusBar({ health, lastRefresh, severityCounts, onRefresh, loading }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === 'r') {
        onRefresh?.()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onRefresh])

  const total = health?.db?.total ?? 0
  const lvl = health?.db?.by_level ?? {}

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black/30 border border-hud-border flex items-center justify-center shadow-glow">
            <div className="pulse-dot" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-wide">Mission Control — Banking • Tech • AI</div>
            <div className="text-xs text-hud-muted">US & Canada focus • Public sources • Local dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-hud-muted">
            <Wifi size={14} className="text-hud-cyan" />
            Backend: <span className={health?.ok ? 'text-hud-cyan' : 'text-hud-red'}>{health?.ok ? 'OK' : 'DOWN'}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-hud-muted">
            <Database size={14} className="text-hud-blue" />
            Items: <span className="text-hud-text">{total}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-hud-muted">
            <Clock size={14} className="text-hud-amber" />
            UI Updated: <span className="text-hud-text">{fmt(lastRefresh)}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onRefresh}
            className="px-3 py-2 rounded-xl border border-hud-border bg-black/20 hover:bg-black/30 flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-hud-cyan' : 'text-hud-cyan'} />
            {loading ? 'Refreshing…' : 'Refresh'}
          </motion.button>
        </div>
      </div>

      <div className="px-4 pb-3 flex flex-wrap gap-2 text-xs text-hud-muted">
        <span className="px-2 py-1 rounded-full border border-hud-border bg-black/20">critical: <b className="text-hud-red">{severityCounts?.critical ?? 0}</b></span>
        <span className="px-2 py-1 rounded-full border border-hud-border bg-black/20">high: <b className="text-hud-amber">{severityCounts?.high ?? 0}</b></span>
        <span className="px-2 py-1 rounded-full border border-hud-border bg-black/20">watch: <b className="text-hud-cyan">{severityCounts?.watch ?? 0}</b></span>
        <span className="px-2 py-1 rounded-full border border-hud-border bg-black/20">info: <b className="text-hud-muted">{severityCounts?.info ?? 0}</b></span>
        <span className="ml-auto px-2 py-1 rounded-full border border-hud-border bg-black/20">db levels: {Object.entries(lvl).map(([k,v]) => `${k}:${v}`).join(' • ') || '—'}</span>
      </div>
    </div>
  )
}
