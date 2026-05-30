import { useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis,
} from 'recharts'
import { ArrowLeft, Crown } from 'lucide-react'
import { players as allPlayers, records, recordsForPlayer } from '../lib/data.js'
import { computeUltimateScores, SCORING_GAMES } from '../lib/scoring.js'
import { computeHalo, computeAoe, computeSpire, computeDoom } from '../lib/aggregate.js'
import {
  CORE_PLAYERS, GUEST_PLAYERS, DEFAULT_WEIGHTS, metaForGame, playerColor,
} from '../data/games.js'
import { Avatar, Bar, Tier, GameBadge } from '../components/ui.jsx'
import { fmtNum, fmtDecimal, fmtPct, ordinal, fmtTimestamp } from '../lib/format.js'

const corePresent = CORE_PLAYERS.filter((p) => allPlayers.includes(p))
const guestsPresent = GUEST_PLAYERS.filter((p) => allPlayers.includes(p))

function gameStatCard(game, player) {
  const rows = records.filter((r) => r.game === game && r.player === player)
  if (rows.length === 0) return null
  const meta = metaForGame(game)

  if (meta.key === 'halo') {
    const s = computeHalo(rows)[0]
    return {
      meta,
      stats: [
        ['Matches', fmtNum(s.matches)],
        ['K/D', fmtDecimal(s.kd)],
        ['Kills', fmtNum(s.kills)],
        ['Deaths', fmtNum(s.deaths)],
        ['Win %', fmtPct(s.winRate)],
        ['Best Game', `${s.bestKills} K`],
      ],
    }
  }
  if (meta.key === 'aoe') {
    const s = computeAoe(rows)[0]
    return {
      meta,
      stats: [
        ['Matches', fmtNum(s.matches)],
        ['Avg Score', fmtNum(s.avgScore)],
        ['Best Score', fmtNum(s.bestScore)],
        ['Avg Military', fmtNum(s.avgMilitary)],
        ['Avg Economy', fmtNum(s.avgEconomy)],
        ['Resources', fmtNum(s.resources)],
      ],
    }
  }
  if (meta.key === 'spire') {
    const s = computeSpire(rows)[0]
    return {
      meta,
      stats: [
        ['Runs', fmtNum(s.runs)],
        ['Clears', fmtNum(s.wins)],
        ['Random Runs', fmtNum(s.randomRuns)],
        ['Mends', fmtNum(s.mends)],
      ],
    }
  }
  if (meta.key === 'doom') {
    const s = computeDoom(rows)[0]
    return {
      meta,
      stats: [
        ['Runs', fmtNum(s.runs)],
        ['Keys Found', fmtNum(s.keys)],
      ],
    }
  }
  return null
}

function Performance({ rec }) {
  const meta = metaForGame(rec.game)
  const context =
    rec.game === 'Halo Master Chief Collection'
      ? [rec.metrics['Game Type'], rec.metrics['Map Name']].filter(Boolean).join(' · ')
      : rec.game === 'Slay the Spire 2'
        ? rec.metrics['Random Character?'] === 1 ? 'Random Character run' : 'Standard run'
        : metaForGame(rec.game).short

  let line = ''
  if (meta.key === 'halo') line = `${rec.metrics.Kills} kills / ${rec.metrics.Deaths} deaths`
  else if (meta.key === 'aoe') line = `${fmtNum(rec.metrics.Score)} pts`
  else if (meta.key === 'spire') line = rec.metrics['Win/Loss'] === 1 ? 'Cleared' : 'Run'
  else if (meta.key === 'doom') line = `${rec.metrics['Keys Found']} keys`

  const win = rec.metrics['Win/Loss'] === 1
  return (
    <div className="flex items-center gap-3 border-b border-edge/40 py-2.5 last:border-0">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.accent }} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold text-slate-100">{context}</div>
        <div className="text-xs text-slate-400">
          {metaForGame(rec.game).short} · {fmtTimestamp(rec.timestamp)}
        </div>
      </div>
      {rec.game === 'Doom + Doom 2 - Co-op' ? (
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase"
          style={{ color: '#94a3b8', background: 'rgba(148,163,184,0.14)' }}
        >
          Co-op
        </span>
      ) : win ? (
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase"
          style={{ color: meta.accent, background: `${meta.accent}1a` }}
        >
          Win
        </span>
      ) : (
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase"
          style={{ color: '#f87171', background: 'rgba(248,113,113,0.15)' }}
        >
          Loss
        </span>
      )}
      <span className="shrink-0 whitespace-nowrap font-body text-sm font-bold tabular-nums text-white">
        {line}
      </span>
    </div>
  )
}

export default function PlayerDetail() {
  const { name } = useParams()
  const player = decodeURIComponent(name || '')

  if (!allPlayers.includes(player)) return <Navigate to="/players" replace />

  const isCore = CORE_PLAYERS.includes(player)
  const tierList = isCore ? corePresent : guestsPresent

  const { entry, rank } = useMemo(() => {
    const ranked = computeUltimateScores(tierList, DEFAULT_WEIGHTS)
    const idx = ranked.findIndex((e) => e.player === player)
    return { entry: ranked[idx], rank: idx + 1 }
  }, [player, tierList])

  const myRecords = useMemo(
    () => recordsForPlayer(player).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [player],
  )

  const gameCards = SCORING_GAMES.map((g) => gameStatCard(g, player)).filter(Boolean)

  const radarData = useMemo(
    () =>
      SCORING_GAMES.map((g) => ({
        game: metaForGame(g).short,
        score: entry?.breakdown[g]?.score ?? 0,
      })),
    [entry],
  )

  const color = playerColor(player)

  return (
    <div className="space-y-8">
      <Link to="/players" className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white">
        <ArrowLeft size={14} /> All Players
      </Link>

      {/* Header */}
      <div className="panel relative overflow-hidden p-6 sm:p-8">
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: color }}
        />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <Avatar name={player} size={104} link={false} />
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
              <Tier color={isCore ? '#ffd700' : '#38bdf8'}>
                {isCore ? 'Main Event' : 'Guest'}
              </Tier>
              <span className="text-xs text-slate-400">
                {ordinal(rank)} in tier
              </span>
            </div>
            <h1 className="font-display text-3xl text-white sm:text-4xl" style={{ textShadow: `0 0 18px ${color}66` }}>
              {player}
            </h1>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {gameCards.map((c) => (
                <GameBadge key={c.meta.short} meta={c.meta} />
              ))}
            </div>
          </div>
          <div className="text-center">
            {rank === 1 && <Crown size={24} className="mx-auto mb-1 text-neon-amber" />}
            <div className="stat-num text-4xl" style={{ color, textShadow: `0 0 18px ${color}88` }}>
              {entry?.ultimate ?? '—'}
            </div>
            <div className="text-[0.65rem] uppercase tracking-widest text-slate-500">Ultimate Rating</div>
          </div>
        </div>
      </div>

      {/* Ultimate breakdown + radar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="mb-4 font-display text-base text-white">Rating Breakdown</h2>
          <div className="space-y-3">
            {SCORING_GAMES.map((g) => {
              const meta = metaForGame(g)
              const b = entry?.breakdown[g]
              return (
                <div key={g}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span style={{ color: meta.accent }}>{meta.short}</span>
                    <span className="stat-num text-white">{b ? b.score : 'DNP'}</span>
                  </div>
                  <Bar value={b?.score ?? 0} color={meta.accent} height={7} />
                </div>
              )
            })}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="mb-2 font-display text-base text-white">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="game" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-game stats */}
      <section>
        <h2 className="mb-4 font-display text-lg text-white">Game-by-Game</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {gameCards.map((c) => (
            <div key={c.meta.short} className="panel p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display text-sm" style={{ color: c.meta.accent }}>
                  {c.meta.short}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {c.stats.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-edge/50 bg-black/20 p-3">
                    <div className="text-[0.6rem] uppercase tracking-widest text-slate-500">{label}</div>
                    <div className="stat-num mt-1 text-lg text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Performance timeline */}
      <section>
        <h2 className="mb-4 font-display text-lg text-white">All Performances</h2>
        <div className="panel p-5">
          {myRecords.map((rec) => (
            <Performance key={rec.id} rec={rec} />
          ))}
        </div>
      </section>
    </div>
  )
}
