import { useState, useMemo } from 'react'
import { Trophy, ChevronDown, Globe } from 'lucide-react'
import { groupMatches } from '../../lib/data.js'
import { Avatar } from '../ui.jsx'
import { fmtTimestamp } from '../../lib/format.js'

function HaloMatch({ match, accent }) {
  const ranked = [...match.rows].sort(
    (a, b) => (b.metrics.Kills || 0) - (a.metrics.Kills || 0),
  )
  return (
    <div className="space-y-1.5">
      {ranked.map((r) => {
        const win = r.metrics['Win/Loss'] === 1
        return (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-lg border border-edge/40 bg-black/20 px-3 py-2"
            style={win ? { borderColor: `${accent}55`, background: `${accent}0f` } : undefined}
          >
            <Avatar name={r.player} size={28} />
            <span className="flex-1 font-semibold text-slate-200">{r.player}</span>
            {win && <Trophy size={13} style={{ color: accent }} />}
            <span className="stat-num text-sm text-white">{r.metrics.Kills}</span>
            <span className="text-xs text-slate-500">/</span>
            <span className="stat-num text-sm text-slate-400">{r.metrics.Deaths}</span>
          </div>
        )
      })}
    </div>
  )
}

function GenericMatch({ match, primaryMetric }) {
  const ranked = [...match.rows].sort(
    (a, b) => (b.metrics[primaryMetric] || 0) - (a.metrics[primaryMetric] || 0),
  )
  return (
    <div className="space-y-1.5">
      {ranked.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 rounded-lg border border-edge/40 bg-black/20 px-3 py-2"
        >
          <Avatar name={r.player} size={28} />
          <span className="flex-1 font-semibold text-slate-200">{r.player}</span>
          <span className="stat-num text-sm text-white">
            {r.metrics[primaryMetric] != null ? r.metrics[primaryMetric].toLocaleString() : '—'}
          </span>
          <span className="text-[0.65rem] uppercase tracking-wider text-slate-500">{primaryMetric}</span>
        </div>
      ))}
    </div>
  )
}

function MatchCard({ match, accent, game, primaryMetric, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const isHalo = game === 'Halo Master Chief Collection'
  const context = [match.gameName, match.gameType, match.map].filter(Boolean).join(' · ')

  // In a local party match there would be both winners and losers present. If
  // everyone logged won (same team) or everyone lost, they were playing online
  // against outside players.
  const wins = match.rows.filter((r) => r.metrics['Win/Loss'] === 1).length
  const isOnline = isHalo && match.rows.length > 1 && (wins === 0 || wins === match.rows.length)

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="min-w-0 truncate font-semibold text-white">{context || game}</span>
            {isOnline && (
              <>
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-neon-cyan/30 bg-neon-cyan/10 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-neon-cyan"
                  title="No mix of winners and losers logged — played online vs. random players"
                >
                  <Globe size={10} /> Online
                </span>
                {wins === match.rows.length ? (
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider"
                    style={{ color: '#6ee7b7', borderColor: 'rgba(52,211,153,0.35)', background: 'rgba(52,211,153,0.12)' }}
                  >
                    <Trophy size={10} /> Win
                  </span>
                ) : (
                  <span
                    className="inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider"
                    style={{ color: '#fca5a5', borderColor: 'rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.14)' }}
                  >
                    Loss
                  </span>
                )}
              </>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {fmtTimestamp(match.timestamp)} · {match.rows.length} players
            {isOnline && ' · vs randoms'}
          </div>
        </div>
        <ChevronDown size={18} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-edge/50 p-4">
          {isHalo ? (
            <HaloMatch match={match} accent={accent} />
          ) : (
            <GenericMatch match={match} primaryMetric={primaryMetric} />
          )}
        </div>
      )}
    </div>
  )
}

export default function MatchLog({ rows, accent, game, primaryMetric = 'Score', title = 'Match Log' }) {
  const matches = useMemo(
    () => groupMatches(rows).slice().reverse(),
    [rows],
  )
  const [limit, setLimit] = useState(6)

  if (matches.length === 0) return null

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-white">{title}</h2>
        <span className="text-xs text-slate-500">{matches.length} matches</span>
      </div>
      <div className="grid items-start gap-3 md:grid-cols-2">
        {matches.slice(0, limit).map((m, i) => (
          <MatchCard
            key={m.key}
            match={m}
            accent={accent}
            game={game}
            primaryMetric={primaryMetric}
            defaultOpen={i === 0}
          />
        ))}
      </div>
      {limit < matches.length && (
        <button
          onClick={() => setLimit((l) => l + 6)}
          className="mx-auto mt-4 block rounded-lg border border-edge bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
        >
          Show more matches
        </button>
      )}
    </section>
  )
}
