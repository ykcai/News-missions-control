import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, ShieldAlert, Radar, Video, Activity } from 'lucide-react'
import { getCritical, getHealth, getItems, refresh } from './api'
import StatusBar from './components/StatusBar.jsx'
import AlertPanel from './components/AlertPanel.jsx'
import SectorPulse from './components/SectorPulse.jsx'
import TrendPanel from './components/TrendPanel.jsx'
import VideoWall from './components/VideoWall.jsx'
import NewsTable from './components/NewsTable.jsx'

const CATEGORIES = [
  { key: 'banking_regulatory', label: 'Banking / Regulatory' },
  { key: 'technology', label: 'Technology' },
  { key: 'ai', label: 'AI' },
]

export default function App() {
  const [health, setHealth] = useState(null)
  const [critical, setCritical] = useState([])
  const [banking, setBanking] = useState([])
  const [tech, setTech] = useState([])
  const [ai, setAi] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  async function loadAll() {
    const h = await getHealth()
    setHealth(h)

    const [c, b, t, a] = await Promise.all([
      getCritical(),
      getItems('banking_regulatory', 220),
      getItems('technology', 200),
      getItems('ai', 200),
    ])

    setCritical(c)
    setBanking(b)
    setTech(t)
    setAi(a)
    setLastRefresh(new Date())
  }

  useEffect(() => {
    loadAll()
    const id = setInterval(loadAll, 60 * 1000) // update UI every minute
    return () => clearInterval(id)
  }, [])

  const severityCounts = useMemo(() => {
    const all = [...critical]
    const counts = { critical: 0, high: 0, watch: 0, info: 0 }
    all.forEach(i => { counts[i.level] = (counts[i.level] || 0) + 1 })
    return counts
  }, [critical])

  const videoLinks = useMemo(() => {
    // pull youtube links from critical items first, then recent tech/ai
    const pool = [...critical, ...tech.slice(0, 40), ...ai.slice(0, 40)]
    const links = []
    const seen = new Set()
    for (const item of pool) {
      const link = item.link || ''
      if ((link.includes('youtube.com/watch') || link.includes('youtu.be/')) && !seen.has(link)) {
        seen.add(link)
        links.push({ url: link, title: item.title, source: item.source_name })
      }
      if (links.length >= 6) break
    }
    return links
  }, [critical, tech, ai])

  async function doRefresh() {
    setLoading(true)
    try {
      await refresh()
      await loadAll()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen hud-grid">
      <div className="scanline" />

      <div className="mx-auto max-w-[1600px] px-4 py-4">
        <StatusBar
          health={health}
          lastRefresh={lastRefresh}
          severityCounts={severityCounts}
          onRefresh={doRefresh}
          loading={loading}
        />

        <div className="grid grid-cols-12 gap-4 mt-4">
          {/* Left column: critical */}
          <div className="col-span-12 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="panel"
            >
              <div className="panel-header">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-hud-red" size={18} />
                  <div>
                    <div className="text-sm uppercase tracking-widest text-hud-muted">Critical / Time-Sensitive</div>
                    <div className="text-xs text-hud-muted">Auto-scored by severity + recency</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="pulse-dot" />
                  <span className="kbd">R</span>
                </div>
              </div>
              <div className="panel-body">
                <AlertPanel items={critical} />
              </div>
            </motion.div>
          </div>

          {/* Middle: sector pulse + trends */}
          <div className="col-span-12 lg:col-span-5">
            <div className="panel mb-4">
              <div className="panel-header">
                <div className="flex items-center gap-2">
                  <Radar className="text-hud-cyan" size={18} />
                  <div>
                    <div className="text-sm uppercase tracking-widest text-hud-muted">Sector Pulse</div>
                    <div className="text-xs text-hud-muted">Volume + severity distribution</div>
                  </div>
                </div>
                <div className="text-xs text-hud-muted">Banking / Tech / AI</div>
              </div>
              <div className="panel-body">
                <SectorPulse banking={banking} tech={tech} ai={ai} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="flex items-center gap-2">
                  <Activity className="text-hud-blue" size={18} />
                  <div>
                    <div className="text-sm uppercase tracking-widest text-hud-muted">Signal Velocity</div>
                    <div className="text-xs text-hud-muted">Last 48h trend (approx)</div>
                  </div>
                </div>
                <div className="text-xs text-hud-muted">Glanceable spike detection</div>
              </div>
              <div className="panel-body">
                <TrendPanel banking={banking} tech={tech} ai={ai} />
              </div>
            </div>
          </div>

          {/* Right: Video wall */}
          <div className="col-span-12 lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="panel"
            >
              <div className="panel-header">
                <div className="flex items-center gap-2">
                  <Video className="text-hud-cyan" size={18} />
                  <div>
                    <div className="text-sm uppercase tracking-widest text-hud-muted">Video Wall</div>
                    <div className="text-xs text-hud-muted">Play without leaving the dashboard</div>
                  </div>
                </div>
                <div className="text-xs text-hud-muted">YouTube links detected</div>
              </div>
              <div className="panel-body">
                <VideoWall videos={videoLinks} />
              </div>
            </motion.div>
          </div>

          {/* Bottom row: tables */}
          <div className="col-span-12">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-4 panel">
                <div className="panel-header">
                  <div>
                    <div className="text-sm uppercase tracking-widest text-hud-muted">Banking / Regulatory Feed</div>
                    <div className="text-xs text-hud-muted">Press releases, rules, guidance, filings</div>
                  </div>
                </div>
                <div className="panel-body">
                  <NewsTable items={banking} />
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 panel">
                <div className="panel-header">
                  <div>
                    <div className="text-sm uppercase tracking-widest text-hud-muted">Technology Feed</div>
                    <div className="text-xs text-hud-muted">Cloud, platforms, cybersecurity, big tech</div>
                  </div>
                </div>
                <div className="panel-body">
                  <NewsTable items={tech} />
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 panel">
                <div className="panel-header">
                  <div>
                    <div className="text-sm uppercase tracking-widest text-hud-muted">AI Feed</div>
                    <div className="text-xs text-hud-muted">Models, policy, tooling, enterprise AI</div>
                  </div>
                </div>
                <div className="panel-body">
                  <NewsTable items={ai} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-hud-muted mt-4">
          Tip: Press <span className="kbd">R</span> to force refresh (when wired). This UI auto-updates every minute; backend refresh runs every 10 minutes.
        </div>
      </div>
    </div>
  )
}
