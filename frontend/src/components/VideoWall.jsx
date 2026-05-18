import { useMemo, useState } from 'react'
import ReactPlayer from 'react-player'

export default function VideoWall({ videos }) {
  const list = videos || []
  const [active, setActive] = useState(0)

  const current = useMemo(() => list[active] || null, [list, active])

  if (list.length === 0) {
    return <div className="text-xs text-hud-muted">No YouTube links detected yet. (Feeds rarely include video URLs.)</div>
  }

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-hud-border bg-black/20">
        <ReactPlayer
          url={current?.url}
          controls
          width="100%"
          height="220px"
        />
      </div>
      <div className="mt-3 space-y-2">
        {list.map((v, i) => (
          <button
            key={v.url}
            onClick={() => setActive(i)}
            className={
              "w-full text-left rounded-xl border px-3 py-2 text-xs " +
              (i === active
                ? "border-hud-cyan/35 bg-hud-cyan/10"
                : "border-hud-border bg-black/15 hover:bg-black/25")
            }
          >
            <div className="text-hud-text font-semibold leading-snug">{v.title}</div>
            <div className="text-hud-muted mt-0.5">{v.source}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
