import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis,
} from 'recharts'
import { ArrowLeft, Crown, ChevronDown } from 'lucide-react'
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

// Plain-language explanation of what each game's 0-100 sub-score measures.
const SCORE_INFO = {
  halo: 'Blends kill/death efficiency (half the weight), raw fragging power, and win rate — each measured 0–100 against everyone in the tier.',
  aoe: "Your average share of each match's top score. Top the scoreboard every game and you'd land at 100.",
  spire: 'Rewards full clears, harder random-character runs, and mends handed to teammates — all scaled 0–100 against the field.',
  doom: "Your share of keys found versus the weekend's top key-hunter, scored 0–100.",
}

const fmtPart = (v) => (Number.isInteger(v) ? fmtNum(v) : fmtDecimal(v, 1))

const HALO = 'Halo Master Chief Collection'

function HaloMatchHighlight({ label, m, accent }) {
  return (
    <div className="rounded-lg border border-edge/50 bg-black/20 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.6rem] uppercase tracking-widest text-slate-500">{label}</span>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase"
          style={m.win
            ? { color: accent, background: `${accent}1a` }
            : { color: '#f87171', background: 'rgba(248,113,113,0.15)' }}
        >
          {m.win ? 'Win' : 'Loss'}
        </span>
      </div>
      <div className="font-semibold text-white">{m.map}</div>
      {m.type && <div className="text-xs text-slate-400">{m.type}</div>}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="text-slate-400">Kills <span className="stat-num text-white">{fmtNum(m.kills)}</span></span>
        <span className="text-slate-400">Deaths <span className="stat-num text-white">{fmtNum(m.deaths)}</span></span>
        <span className="text-slate-400">K/D <span className="stat-num text-white">{m.deaths ? fmtDecimal(m.kills / m.deaths) : fmtDecimal(m.kills)}</span></span>
      </div>
    </div>
  )
}

function HaloMapHighlight({ fav }) {
  const cells = [
    ['Kills', fmtNum(fav.kills)],
    ['Deaths', fmtNum(fav.deaths)],
    ['K/D', fmtDecimal(fav.kd)],
    ['Win %', fmtPct(fav.winRate)],
  ]
  return (
    <div className="rounded-lg border border-edge/50 bg-black/20 p-3">
      <div className="mb-1.5 text-[0.6rem] uppercase tracking-widest text-slate-500">Favorite Halo Map</div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-white">{fav.map}</span>
        <span className="text-xs text-slate-400">{fmtNum(fav.matches)} {fav.matches === 1 ? 'match' : 'matches'}</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2 text-center">
        {cells.map(([l, v]) => (
          <div key={l} className="rounded bg-black/30 p-1.5">
            <div className="text-[0.55rem] uppercase tracking-wider text-slate-500">{l}</div>
            <div className="stat-num text-sm text-white">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GameCard({ card, haloHighlights }) {
  const [open, setOpen] = useState(false)
  const expandable = card.meta.key === 'halo' && haloHighlights
  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-display text-sm" style={{ color: card.meta.accent }}>{card.meta.short}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {card.stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-edge/50 bg-black/20 p-3">
            <div className="text-[0.6rem] uppercase tracking-widest text-slate-500">{label}</div>
            <div className="stat-num mt-1 text-lg text-white">{value}</div>
          </div>
        ))}
      </div>
      {expandable && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-edge/50 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            {open ? 'Hide' : 'Show'} match highlights
            <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="mt-3 space-y-2.5">
              <HaloMatchHighlight label="Best Halo Match" m={haloHighlights.best} accent="#9bff3d" />
              <HaloMapHighlight fav={haloHighlights.favorite} />
              <HaloMatchHighlight label="Low Light" m={haloHighlights.worst} accent="#9bff3d" />
            </div>
          )}
        </>
      )}
    </div>
  )
}

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

  const insights = useMemo(() => {
    const played = SCORING_GAMES
      .map((g) => ({ meta: metaForGame(g), b: entry?.breakdown[g] }))
      .filter((x) => x.b)
    if (played.length === 0) return []
    const best = [...played].sort((a, b) => b.b.score - a.b.score)[0]
    const avg = Math.round(played.reduce((a, x) => a + x.b.score, 0) / played.length)
    return [
      { label: 'Strongest game', value: best.meta.short, badge: best.b.score, color: best.meta.accent },
      { label: 'Average game score', value: avg },
      { label: 'Games played', value: `${played.length} of ${SCORING_GAMES.length}` },
      { label: 'Performances logged', value: myRecords.length },
    ]
  }, [entry, myRecords])

  const haloHighlights = useMemo(() => {
    const haloRows = myRecords.filter((r) => r.game === HALO)
    if (haloRows.length === 0) return null
    const games = haloRows.map((r) => ({
      map: r.metrics['Map Name'] || 'Unknown Map',
      type: r.metrics['Game Type'] || '',
      kills: r.metrics.Kills || 0,
      deaths: r.metrics.Deaths || 0,
      win: r.metrics['Win/Loss'] === 1,
      net: (r.metrics.Kills || 0) - (r.metrics.Deaths || 0),
    }))
    const best = [...games].sort((a, b) => b.net - a.net || b.kills - a.kills)[0]
    const worst = [...games].sort((a, b) => a.net - b.net || b.deaths - a.deaths)[0]

    const byMap = new Map()
    for (const g of games) {
      if (!byMap.has(g.map)) byMap.set(g.map, { map: g.map, matches: 0, kills: 0, deaths: 0, wins: 0 })
      const m = byMap.get(g.map)
      m.matches += 1
      m.kills += g.kills
      m.deaths += g.deaths
      m.wins += g.win ? 1 : 0
    }
    const favorite = [...byMap.values()]
      .map((m) => ({ ...m, kd: m.deaths ? m.kills / m.deaths : m.kills, winRate: (m.wins / m.matches) * 100 }))
      .sort((a, b) => b.kills - a.kills || b.matches - a.matches)[0]

    return { best, worst, favorite }
  }, [myRecords])

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
          <h2 className="mb-1 font-display text-base text-white">Rating Breakdown</h2>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">
            The Ultimate Rating is a weighted blend of a <span className="text-slate-200">0–100 score</span> in
            each game. Skipped games don't count against you — the weights rebalance across what you played, so
            the <span className="text-slate-200">%</span> on each game is how much it actually shaped this rating.
          </p>
          <div className="space-y-3">
            {SCORING_GAMES.map((g) => {
              const meta = metaForGame(g)
              const b = entry?.breakdown[g]
              const contribution =
                b && entry?.effectiveWeightTotal
                  ? Math.round((b.weight / entry.effectiveWeightTotal) * 100)
                  : 0
              return (
                <div key={g} className="rounded-lg border border-edge/50 bg-black/20 p-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm" style={{ color: meta.accent }}>{meta.short}</span>
                      {b ? (
                        <span className="rounded-md border border-edge/70 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-slate-400">
                          {contribution}% of rating
                        </span>
                      ) : (
                        <span className="rounded-md border border-edge/70 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-slate-600">
                          Did not play
                        </span>
                      )}
                    </div>
                    <span className="stat-num text-white">{b ? b.score : 'DNP'}</span>
                  </div>
                  <Bar value={b?.score ?? 0} color={b ? meta.accent : '#334155'} height={7} />
                  {b && (
                    <>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">{SCORE_INFO[meta.key]}</p>
                      {b.parts?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {b.parts.map((p) => (
                            <span
                              key={p.label}
                              className="inline-flex items-center gap-1.5 rounded bg-black/40 px-2 py-1 text-[0.7rem]"
                            >
                              <span className="text-slate-500">
                                {p.label}
                                {p.weight != null ? ` · ${Math.round(p.weight * 100)}%` : ''}
                              </span>
                              <span className="stat-num text-slate-200">{fmtPart(p.value)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="panel flex flex-col p-5">
          <h2 className="mb-2 font-display text-base text-white">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} outerRadius="78%">
              <PolarGrid stroke="#ffffff25" />
              <PolarAngleAxis dataKey="game" tick={{ fill: '#e2e8f0', fontSize: 14, fontWeight: 600 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.4} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          {insights.length > 0 && (
            <div className="mt-auto space-y-2.5 border-t border-edge/50 pt-4">
              <h3 className="text-[0.65rem] uppercase tracking-widest text-slate-500">At a Glance</h3>
              {insights.map((it) => (
                <div key={it.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-400">{it.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-white" style={it.color ? { color: it.color } : undefined}>
                      {it.value}
                    </span>
                    {it.badge != null && (
                      <span className="stat-num rounded-md border border-edge/70 px-1.5 py-0.5 text-xs text-slate-300">
                        {it.badge}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Per-game stats */}
      <section>
        <h2 className="mb-4 font-display text-lg text-white">Game-by-Game</h2>
        <div className="grid items-start gap-4 md:grid-cols-2">
          {gameCards.map((c) => (
            <GameCard key={c.meta.short} card={c} haloHighlights={haloHighlights} />
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
