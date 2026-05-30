import { useState, useMemo } from 'react'
import {
  BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts'
import { Table2, BarChart3, Swords, Skull, Crosshair, Trophy } from 'lucide-react'
import { records, distinctMetric } from '../../lib/data.js'
import { computeHalo } from '../../lib/aggregate.js'
import { playerColor, isCore } from '../../data/games.js'
import DataTable, { playerColumn } from '../DataTable.jsx'
import { Segmented, FilterChip, StatTile, EmptyState, PlayerScope } from '../ui.jsx'
import { fmtNum, fmtDecimal, fmtPct } from '../../lib/format.js'
import MatchLog from './MatchLog.jsx'

const GAME = 'Halo Master Chief Collection'

const CHART_METRICS = [
  { v: 'kd', l: 'K/D' },
  { v: 'kills', l: 'Kills' },
  { v: 'deaths', l: 'Deaths' },
  { v: 'win', l: 'Win %' },
]
const METRIC_LABEL = Object.fromEntries(CHART_METRICS.map((m) => [m.v, m.l]))

function FilterRow({ label, options, value, onChange, accent }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <FilterChip label="All" active={value === 'all'} onClick={() => onChange('all')} color={accent} />
      {options.map((o) => (
        <FilterChip key={o} label={o} active={value === o} onClick={() => onChange(o)} color={accent} />
      ))}
    </div>
  )
}

export default function HaloView({ meta }) {
  const [gameName, setGameName] = useState('all')
  const [gameType, setGameType] = useState('all')
  const [map, setMap] = useState('all')
  const [view, setView] = useState('table')
  const [chartMetric, setChartMetric] = useState('kd')
  const [scope, setScope] = useState('all')

  const hasGuests = useMemo(
    () => records.some((r) => r.game === GAME && !isCore(r.player)),
    [],
  )
  const gameNames = useMemo(() => distinctMetric(GAME, 'Game Name'), [])
  const gameTypes = useMemo(() => distinctMetric(GAME, 'Game Type'), [])
  const maps = useMemo(() => distinctMetric(GAME, 'Map Name'), [])

  const filtered = useMemo(() => {
    return records.filter(
      (r) =>
        r.game === GAME &&
        (gameName === 'all' || r.metrics['Game Name'] === gameName) &&
        (gameType === 'all' || r.metrics['Game Type'] === gameType) &&
        (map === 'all' || r.metrics['Map Name'] === map) &&
        (scope === 'all' || (scope === 'core' ? isCore(r.player) : !isCore(r.player))),
    )
  }, [gameName, gameType, map, scope])

  const stats = useMemo(() => computeHalo(filtered), [filtered])

  const totals = useMemo(() => {
    const kills = filtered.reduce((a, r) => a + (r.metrics.Kills || 0), 0)
    const deaths = filtered.reduce((a, r) => a + (r.metrics.Deaths || 0), 0)
    const matches = new Set(filtered.map((r) => r.timestamp)).size
    return { kills, deaths, matches }
  }, [filtered])

  const chartData = useMemo(() => {
    const key = { kd: 'kd', kills: 'kills', deaths: 'deaths', win: 'winRate' }[chartMetric]
    return [...stats].sort((a, b) => b[key] - a[key]).map((s) => ({ player: s.player, value: s[key] }))
  }, [stats, chartMetric])

  const columns = [
    playerColumn(),
    { key: 'matches', label: 'Games', align: 'right', mono: true },
    { key: 'kd', label: 'K/D', align: 'right', mono: true, render: (r) => fmtDecimal(r.kd) },
    { key: 'kills', label: 'Kills', align: 'right', mono: true, render: (r) => fmtNum(r.kills) },
    { key: 'deaths', label: 'Deaths', align: 'right', mono: true, render: (r) => fmtNum(r.deaths) },
    { key: 'avgKills', label: 'Avg K', align: 'right', mono: true, render: (r) => fmtDecimal(r.avgKills, 1) },
    { key: 'winRate', label: 'Win %', align: 'right', mono: true, render: (r) => fmtPct(r.winRate) },
    { key: 'bestKills', label: 'Best', align: 'right', mono: true },
  ]

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Matches" value={fmtNum(totals.matches)} accent={meta.accent} icon={Trophy} />
        <StatTile label="Total Kills" value={fmtNum(totals.kills)} accent="#ff2e88" icon={Swords} />
        <StatTile label="Total Deaths" value={fmtNum(totals.deaths)} accent="#94a3b8" icon={Skull} />
        <StatTile
          label="Avg K/D"
          value={fmtDecimal(totals.deaths ? totals.kills / totals.deaths : 0)}
          accent={meta.accent}
          icon={Crosshair}
        />
      </div>

      {/* Filters */}
      <div className="panel space-y-3 p-4">
        <PlayerScope value={scope} onChange={setScope} hasGuests={hasGuests} color={meta.accent} />
        <FilterRow label="Title" options={gameNames} value={gameName} onChange={setGameName} accent={meta.accent} />
        <FilterRow label="Mode" options={gameTypes} value={gameType} onChange={setGameType} accent={meta.accent} />
        <FilterRow label="Map" options={maps} value={map} onChange={setMap} accent={meta.accent} />
      </div>

      {/* View toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-white">Leaderboard</h2>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'table', label: 'Table', icon: Table2 },
            { value: 'chart', label: 'Chart', icon: BarChart3 },
          ]}
        />
      </div>

      {stats.length === 0 ? (
        <EmptyState message="No matches fit these filters. Try widening your selection." />
      ) : view === 'table' ? (
        <DataTable columns={columns} rows={stats} initialSort={{ key: 'kd', dir: 'desc' }} accent={meta.accent} />
      ) : (
        <div className="panel p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {CHART_METRICS.map((m) => (
              <FilterChip key={m.v} label={m.l} active={chartMetric === m.v} onClick={() => setChartMetric(m.v)} color={meta.accent} />
            ))}
          </div>
          <ResponsiveContainer width="100%" height={Math.max(260, chartData.length * 38)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="#ffffff10" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="#ffffff20" />
              <YAxis type="category" dataKey="player" width={60} tick={{ fill: '#e2e8f0', fontSize: 12 }} stroke="#ffffff20" />
              <Tooltip
                cursor={{ fill: '#ffffff08' }}
                contentStyle={{ background: '#13112a', border: '1px solid #272045', borderRadius: 10, color: '#fff' }}
                labelStyle={{ color: '#fff', fontWeight: 600 }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value) => [chartMetric === 'win' ? `${value}%` : value, METRIC_LABEL[chartMetric]]}
              />
              <RBar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.player} fill={playerColor(d.player)} />
                ))}
              </RBar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Match log */}
      <MatchLog rows={filtered} accent={meta.accent} game={GAME} />
    </div>
  )
}
