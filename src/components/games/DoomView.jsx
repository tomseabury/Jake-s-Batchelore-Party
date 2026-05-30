import { useMemo } from 'react'
import {
  BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts'
import { Key, Users, Layers } from 'lucide-react'
import { records } from '../../lib/data.js'
import { computeDoom } from '../../lib/aggregate.js'
import { playerColor } from '../../data/games.js'
import DataTable, { playerColumn } from '../DataTable.jsx'
import { StatTile } from '../ui.jsx'
import { fmtNum, fmtPct } from '../../lib/format.js'
import MatchLog from './MatchLog.jsx'

const GAME = 'Doom + Doom 2 - Co-op'

function DoomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-[#272045] bg-[#13112a] px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-semibold text-white">{d.player}</div>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: playerColor(d.player) }} />
          Keys Found
        </span>
        <span className="stat-num text-white">{fmtNum(d.value)}</span>
      </div>
    </div>
  )
}

export default function DoomView({ meta }) {
  const rows = useMemo(() => records.filter((r) => r.game === GAME), [])
  const stats = useMemo(() => computeDoom(rows), [rows])

  const summary = useMemo(() => {
    const totalKeys = stats.reduce((a, s) => a + s.keys, 0)
    const runs = new Set(rows.map((r) => r.timestamp)).size
    return { totalKeys, runs, players: stats.length }
  }, [stats, rows])

  const chartData = useMemo(
    () => [...stats].sort((a, b) => b.keys - a.keys).map((s) => ({ player: s.player, value: s.keys })),
    [stats],
  )

  const columns = [
    playerColumn(),
    { key: 'keys', label: 'Keys Found', align: 'right', mono: true },
    { key: 'keyShare', label: 'Key Share', align: 'right', mono: true, render: (r) => fmtPct(r.keyShare) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Co-op Runs" value={fmtNum(summary.runs)} accent={meta.accent} icon={Layers} />
        <StatTile label="Keys Found" value={fmtNum(summary.totalKeys)} accent="#ffb627" icon={Key} />
        <StatTile label="Squad Size" value={fmtNum(summary.players)} accent="#a855f7" icon={Users} />
      </div>

      <div className="panel p-4 text-sm text-slate-300">
        Demons don&apos;t count themselves. In the co-op crawl the only stat that
        mattered was who grabbed the <span style={{ color: meta.accent }}>keys</span> and
        kept the squad pushing forward.
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 font-display text-base text-white">Key Hunters</h2>
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <DataTable bare columns={columns} rows={stats} initialSort={{ key: 'keys', dir: 'desc' }} accent={meta.accent} />
          <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 36)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="#ffffff10" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="#ffffff20" />
              <YAxis type="category" dataKey="player" width={60} tick={{ fill: '#e2e8f0', fontSize: 12 }} stroke="#ffffff20" />
              <Tooltip cursor={{ fill: '#ffffff08' }} content={<DoomTooltip />} />
              <RBar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.player} fill={playerColor(d.player)} />
                ))}
              </RBar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <MatchLog rows={rows} accent={meta.accent} game={GAME} primaryMetric="Keys Found" />
    </div>
  )
}
