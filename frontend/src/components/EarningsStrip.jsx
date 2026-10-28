import { motion } from 'framer-motion'

const TIME_STYLES = {
  'Pre-market': 'bg-hud-cyan/12 text-hud-cyan border-hud-cyan/25',
  'After close': 'bg-hud-amber/15 text-hud-amber border-hud-amber/30',
  TBD: 'bg-white/5 text-hud-muted border-hud-border',
}

export default function EarningsStrip({ data }) {
  const items = data?.items || []

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="text-sm uppercase tracking-widest text-hud-muted">S&amp;P 500 Earnings — Today</div>
          <div className="text-xs text-hud-muted">Index members reporting today</div>
        </div>
        <div className="text-xs text-hud-muted">
          {data?.date || '—'} • {items.length} {items.length === 1 ? 'company' : 'companies'}
        </div>
      </div>
      <div className="panel-body">
        {data?.error && (
          <div className="text-xs text-hud-amber">Earnings calendar unavailable — {data.error}</div>
        )}

        {!data?.error && items.length === 0 && (
          <div className="text-xs text-hud-muted">No S&amp;P 500 companies report today.</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {items.map((it, idx) => (
            <motion.a
              key={it.symbol}
              href={`https://www.nasdaq.com/market-activity/stocks/${it.symbol.toLowerCase()}/earnings`}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.3) }}
              className="block rounded-2xl border border-hud-border bg-black/20 hover:bg-black/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold text-hud-text">{it.symbol}</div>
                <span
                  className={
                    'shrink-0 text-[10px] px-2 py-0.5 rounded-full border ' +
                    (TIME_STYLES[it.time] || TIME_STYLES.TBD)
                  }
                >
                  {it.time}
                </span>
              </div>
              <div className="mt-1 text-xs text-hud-muted leading-snug">{it.name}</div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-hud-muted">
                <span>
                  EPS est. <span className="text-hud-text">{it.eps_forecast || '—'}</span>
                </span>
                <span>{it.quarter_ending || ''}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}
