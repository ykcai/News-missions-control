function badge(level) {
  if (level === 'critical') return 'text-hud-red'
  if (level === 'high') return 'text-hud-amber'
  if (level === 'watch') return 'text-hud-cyan'
  return 'text-hud-muted'
}

function clamp(s, n = 110) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export default function NewsTable({ items }) {
  const rows = (items || []).slice(0, 30)

  return (
    <div className="scroll pr-1">
      <div className="space-y-2">
        {rows.map(it => (
          <a
            key={it.id}
            href={it.link}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-hud-border bg-black/15 hover:bg-black/25 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold leading-snug">{it.title}</div>
              <div className={"text-[11px] font-semibold " + badge(it.level)}>
                {Math.round(it.score)}
              </div>
            </div>
            <div className="mt-1 text-xs text-hud-muted">
              {it.source_name} {it.published ? `• ${new Date(it.published).toLocaleString()}` : ''}
            </div>
            {it.summary && <div className="mt-2 text-xs text-hud-muted">{clamp(it.summary)}</div>}
          </a>
        ))}
      </div>
    </div>
  )
}
