import { useState, useMemo } from 'react'
import {
  BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell,
} from 'recharts'
import { Table2, Layers, Trees, Coins, Crown, Swords } from 'lucide-react'
import { records } from '../../lib/data.js'
import { computeAoe } from '../../lib/aggregate.js'
import { playerColor } from '../../data/games.js'
import DataTable, { playerColumn } from '../DataTable.jsx'
import { Segmented, StatTile } from '../ui.jsx'
import { fmtNum } from '../../lib/format.js'
import MatchLog from './MatchLog.jsx'

const GAME = 'Age of Empires II: Definitive Edition'

const tooltipStyle = {
  background: '#13112a',
  border: '1px solid #272045',
  borderRadius: 10,
  color: '#fff',
}

export default function AoeView({ meta }) {
  const [view, setView] = useState('composition')
  const rows = useMemo(() => records.filter((r) => r.game === GAME), [])
  const stats = useMemo(() => computeAoe(rows), [rows])

  const summary = useMemo(() => {
    const top = [...stats].sort((a, b) => b.bestScore - a.bestScore)[0]
    const totalResources = stats.reduce((a, s) => a + s.resources, 0)
    return { top, totalResources, matches: new Set(rows.map((r) => r.timestamp)).size }
  }, [stats, rows])

  const compositionData = useMemo(
    () =>
      [...stats]
        .sort((a, b) => b.avgScore - a.avgScore)
        .map((s) => ({
          player: s.player,
          Economy: s.avgEconomy,
          Military: s.avgMilitary,
          Technology: s.avgTechnology,
          Society: s.avgSociety,
        })),
    [stats],
  )

  const resourceData = useMemo(
    () =>
      [...stats]
        .sort((a, b) => b.resources - a.resources)
        .map((s) => ({ player: s.player, Wood: s.wood, Food: s.food, Gold: s.gold, Stone: s.stone })),
    [stats],
  )

  const columns = [
    playerColumn(),
    { key: 'matches', label: 'Games', align: 'right', mono: true },
    { key: 'avgScore', label: 'Avg Score', align: 'right', mono: true, render: (r) => fmtNum(r.avgScore) },
    { key: 'bestScore', label: 'Best', align: 'right', mono: true, render: (r) => fmtNum(r.bestScore) },
    { key: 'avgMilitary', label: 'Military', align: 'right', mono: true, render: (r) => fmtNum(r.avgMilitary) },
    { key: 'avgEconomy', label: 'Economy', align: 'right', mono: true, render: (r) => fmtNum(r.avgEconomy) },
    { key: 'resources', label: 'Resources', align: 'right', mono: true, render: (r) => fmtNum(r.resources) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Matches" value={fmtNum(summary.matches)} accent={meta.accent} icon={Layers} />
        <StatTile label="Top Score" value={fmtNum(summary.top?.bestScore)} sub={summary.top?.player} accent={meta.accent} icon={Crown} />
        <StatTile label="Resources Gathered" value={fmtNum(summary.totalResources)} accent="#9bff3d" icon={Trees} />
        <StatTile label="Players" value={fmtNum(stats.length)} accent="#a855f7" icon={Swords} />
      </div>

      <DataTable columns={columns} rows={stats} initialSort={{ key: 'avgScore', dir: 'desc' }} accent={meta.accent} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-white">Breakdown</h2>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'composition', label: 'Score Mix', icon: Table2 },
            { value: 'resources', label: 'Resources', icon: Coins },
          ]}
        />
      </div>

      <div className="panel p-4">
        {view === 'composition' ? (
          <ResponsiveContainer width="100%" height={Math.max(300, compositionData.length * 54)}>
            <BarChart data={compositionData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid horizontal={false} stroke="#ffffff10" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="#ffffff20" />
              <YAxis type="category" dataKey="player" width={60} tick={{ fill: '#e2e8f0', fontSize: 12 }} stroke="#ffffff20" />
              <Tooltip cursor={{ fill: '#ffffff08' }} contentStyle={tooltipStyle} formatter={(v) => fmtNum(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <RBar dataKey="Military" stackId="s" fill="#ff2e88" />
              <RBar dataKey="Economy" stackId="s" fill="#9bff3d" />
              <RBar dataKey="Technology" stackId="s" fill="#22e7ff" />
              <RBar dataKey="Society" stackId="s" fill="#a855f7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, resourceData.length * 54)}>
            <BarChart data={resourceData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid horizontal={false} stroke="#ffffff10" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="#ffffff20" />
              <YAxis type="category" dataKey="player" width={60} tick={{ fill: '#e2e8f0', fontSize: 12 }} stroke="#ffffff20" />
              <Tooltip cursor={{ fill: '#ffffff08' }} contentStyle={tooltipStyle} formatter={(v) => fmtNum(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <RBar dataKey="Wood" stackId="r" fill="#84cc16" />
              <RBar dataKey="Food" stackId="r" fill="#f43f5e" />
              <RBar dataKey="Gold" stackId="r" fill="#facc15" />
              <RBar dataKey="Stone" stackId="r" fill="#94a3b8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <MatchLog rows={rows} accent={meta.accent} game={GAME} primaryMetric="Score" />
    </div>
  )
}
