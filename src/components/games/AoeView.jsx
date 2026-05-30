import { useState, useMemo } from 'react'
import { Table2, Layers, Trees, Coins, Crown, Swords } from 'lucide-react'
import { records } from '../../lib/data.js'
import { computeAoe } from '../../lib/aggregate.js'
import DataTable, { playerColumn } from '../DataTable.jsx'
import { Segmented, StatTile } from '../ui.jsx'
import { fmtNum } from '../../lib/format.js'
import MatchLog from './MatchLog.jsx'
import { AoeScoreMixChart, AoeResourceChart } from './aoeChart.jsx'

const GAME = 'Age of Empires II: Definitive Edition'

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
          total: s.avgScore,
        })),
    [stats],
  )

  const resourceData = useMemo(
    () =>
      [...stats]
        .sort((a, b) => b.resources - a.resources)
        .map((s) => ({ player: s.player, Wood: s.wood, Food: s.food, Gold: s.gold, Stone: s.stone, total: s.resources })),
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

      <div>
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
        <p className="mt-1 text-xs text-slate-500">
          Each bar is a player's <span className="text-slate-300">average per match</span>, across all {summary.matches} games. Hover a bar for the full split.
        </p>
      </div>

      <div className="panel p-4">
        {view === 'composition' ? (
          <AoeScoreMixChart data={compositionData} totalLabel="Avg Total Score" minHeight={300} />
        ) : (
          <AoeResourceChart data={resourceData} minHeight={300} />
        )}
      </div>

      <MatchLog rows={rows} accent={meta.accent} game={GAME} primaryMetric="Score" />
    </div>
  )
}
