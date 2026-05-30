import { useMemo } from 'react'
import { Layers, Trophy, Dice5, HeartPulse } from 'lucide-react'
import { records } from '../../lib/data.js'
import { computeSpire } from '../../lib/aggregate.js'
import DataTable, { playerColumn } from '../DataTable.jsx'
import { StatTile } from '../ui.jsx'
import { fmtNum } from '../../lib/format.js'
import MatchLog from './MatchLog.jsx'

const GAME = 'Slay the Spire 2'

export default function SpireView({ meta }) {
  const rows = useMemo(() => records.filter((r) => r.game === GAME), [])
  const stats = useMemo(() => computeSpire(rows), [rows])

  const summary = useMemo(() => {
    const runs = new Set(rows.map((r) => r.timestamp)).size
    const wins = stats.reduce((a, s) => a + s.wins, 0)
    const random = stats.reduce((a, s) => a + s.randomRuns, 0)
    const mends = stats.reduce((a, s) => a + s.mends, 0)
    return { runs, wins, random, mends }
  }, [stats, rows])

  const columns = [
    playerColumn(),
    { key: 'runs', label: 'Runs', align: 'right', mono: true },
    { key: 'wins', label: 'Clears', align: 'right', mono: true },
    { key: 'act1', label: 'Act 1', align: 'right', mono: true },
    { key: 'act2', label: 'Act 2', align: 'right', mono: true },
    { key: 'randomRuns', label: 'Random', align: 'right', mono: true },
    {
      key: 'mends',
      label: 'Mends',
      align: 'right',
      mono: true,
      render: (r) => (
        <span style={{ color: r.mends > 0 ? '#f87171' : '#64748b' }}>{r.mends}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Co-op Runs" value={fmtNum(summary.runs)} accent={meta.accent} icon={Layers} />
        <StatTile label="Total Clears" value={fmtNum(summary.wins)} accent="#9bff3d" icon={Trophy} />
        <StatTile label="Random Runs" value={fmtNum(summary.random)} accent="#a855f7" icon={Dice5} />
        <StatTile label="Mends Used" value={fmtNum(summary.mends)} accent="#f87171" icon={HeartPulse} />
      </div>

      <div className="panel p-4 text-sm text-slate-300">
        Every logged run was a full clear (Act 1 + Act 2). The differentiators are
        harder <span className="text-spire">random-character</span> runs and
        how many <span className="text-red-400">mends</span> (teammate revives) were needed.
      </div>

      <DataTable columns={columns} rows={stats} initialSort={{ key: 'wins', dir: 'desc' }} accent={meta.accent} />

      <MatchLog rows={rows} accent={meta.accent} game={GAME} primaryMetric="Win/Loss" />
    </div>
  )
}
