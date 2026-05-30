import { useState, useMemo } from 'react'
import { Swords, Users } from 'lucide-react'
import { records, groupMatches, players as allPlayers } from '../lib/data.js'
import { computeHalo, computeAoe, computeSpire, computeDoom } from '../lib/aggregate.js'
import { GAME_ORDER, metaForGame, playerColor } from '../data/games.js'
import { fmtTimestamp } from '../lib/format.js'
import { Avatar, FilterChip } from './ui.jsx'

const num = (v) => (typeof v === 'number' ? v : 0)

// Free-for-all Halo game types have no teams — every player is an opponent and
// only the top fragger is flagged the winner. (Currently just "Bar Fight".)
const FFA_TYPES = new Set(['Bar Fight'])

const COMPUTE = {
  'Halo Master Chief Collection': computeHalo,
  'Age of Empires II: Definitive Edition': computeAoe,
  'Slay the Spire 2': computeSpire,
  'Doom + Doom 2 - Co-op': computeDoom,
}

// Per-game comparison config: which aggregate fields to show, and how a single
// shared match is "won" head-to-head (null for co-op games).
const CONFIG = {
  'Halo Master Chief Collection': {
    metrics: [
      { key: 'kd', label: 'K/D', fmt: (v) => v.toFixed(2) },
      { key: 'avgKills', label: 'Avg Kills', fmt: (v) => v.toFixed(1) },
      { key: 'winRate', label: 'Win Rate', fmt: (v) => `${v}%` },
      { key: 'kills', label: 'Total Kills', fmt: (v) => v.toLocaleString() },
      { key: 'matches', label: 'Matches', fmt: (v) => `${v}` },
      { key: 'bestKills', label: 'Best Game', fmt: (v) => `${v} kills` },
    ],
    duel: { metric: (r) => num(r.metrics.Kills), label: 'most kills' },
  },
  'Age of Empires II: Definitive Edition': {
    metrics: [
      { key: 'avgScore', label: 'Avg Score', fmt: (v) => v.toLocaleString() },
      { key: 'bestScore', label: 'Best Score', fmt: (v) => v.toLocaleString() },
      { key: 'wins', label: 'Wins', fmt: (v) => `${v}` },
      { key: 'matches', label: 'Matches', fmt: (v) => `${v}` },
      { key: 'avgMilitary', label: 'Avg Military', fmt: (v) => v.toLocaleString() },
    ],
    duel: { metric: (r) => num(r.metrics.Score), label: 'higher score' },
  },
  'Slay the Spire 2': {
    metrics: [
      { key: 'wins', label: 'Clears', fmt: (v) => `${v}` },
      { key: 'act2', label: 'Act 2 Wins', fmt: (v) => `${v}` },
      { key: 'act1', label: 'Act 1 Wins', fmt: (v) => `${v}` },
      { key: 'runs', label: 'Runs', fmt: (v) => `${v}` },
      { key: 'deaths', label: 'Deaths', fmt: (v) => `${v}`, lowerBetter: true },
    ],
    duel: null,
  },
  'Doom + Doom 2 - Co-op': {
    metrics: [
      { key: 'keys', label: 'Keys Found', fmt: (v) => `${v}` },
      { key: 'keyShare', label: 'Key Share', fmt: (v) => `${v}%` },
      { key: 'runs', label: 'Runs', fmt: (v) => `${v}` },
    ],
    duel: null,
  },
}

function PlayerPicker({ value, onChange, options, color }) {
  return (
    <div className="flex w-28 flex-col items-center gap-2 sm:w-36">
      <Avatar name={value} size={56} link={false} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-lg border border-edge bg-carbon px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-neon-cyan/60"
        style={{ color }}
      >
        {options.map((p) => (
          <option key={p} value={p} className="bg-carbon text-white">
            {p}
          </option>
        ))}
      </select>
    </div>
  )
}

function StatRow({ label, a, b, fmt, lowerBetter, colorA, colorB }) {
  const total = a + b
  const pctA = total === 0 ? 50 : (a / total) * 100
  let leader = 'tie'
  if (a !== b) leader = (lowerBetter ? a < b : a > b) ? 'a' : 'b'
  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className="w-24 shrink-0 text-left text-sm tabular-nums"
          style={{ color: leader === 'a' ? colorA : '#94a3b8', fontWeight: leader === 'a' ? 700 : 500 }}
        >
          {fmt(a)}
        </span>
        <span className="flex-1 text-center text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span
          className="w-24 shrink-0 text-right text-sm tabular-nums"
          style={{ color: leader === 'b' ? colorB : '#94a3b8', fontWeight: leader === 'b' ? 700 : 500 }}
        >
          {fmt(b)}
        </span>
      </div>
      <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-black/40">
        <div style={{ width: `${pctA}%`, background: colorA, opacity: leader === 'b' ? 0.35 : 1 }} />
        <div style={{ width: `${100 - pctA}%`, background: colorB, opacity: leader === 'a' ? 0.35 : 1 }} />
      </div>
    </div>
  )
}

function ResultTag({ win }) {
  return (
    <span
      className="shrink-0 rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase"
      style={
        win
          ? { color: '#6ee7b7', background: 'rgba(52,211,153,0.14)' }
          : { color: '#fca5a5', background: 'rgba(248,113,113,0.14)' }
      }
    >
      {win ? 'W' : 'L'}
    </span>
  )
}

function PlayerLine({ name, color, record, isHalo, lead }) {
  const win = num(record.metrics['Win/Loss']) === 1
  if (isHalo) {
    const kills = num(record.metrics.Kills)
    const deaths = num(record.metrics.Deaths)
    const kd = deaths === 0 ? kills : kills / deaths
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-16 shrink-0 truncate font-semibold" style={{ color }}>{name}</span>
        <span className="flex-1 tabular-nums text-slate-400">
          <span className={lead ? 'font-bold text-white' : 'text-slate-300'}>{kills}</span>
          <span className="text-slate-600"> K</span>
          <span className="mx-1.5 text-slate-700">·</span>
          {deaths}<span className="text-slate-600"> D</span>
          <span className="mx-1.5 text-slate-700">·</span>
          <span style={{ color }}>{kd.toFixed(2)}</span>
          <span className="text-slate-600"> KD</span>
        </span>
        <ResultTag win={win} />
      </div>
    )
  }
  const score = num(record.metrics.Score)
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-16 shrink-0 truncate font-semibold" style={{ color }}>{name}</span>
      <span className="flex-1 tabular-nums">
        <span className={lead ? 'font-bold text-white' : 'text-slate-300'}>{score.toLocaleString()}</span>
        <span className="text-slate-600"> pts</span>
      </span>
      <ResultTag win={win} />
    </div>
  )
}

function MeetingCard({ d, game, a, b, colorA, colorB }) {
  const isHalo = game === 'Halo Master Chief Collection'
  const winA = num(d.ra.metrics['Win/Loss']) === 1
  const winB = num(d.rb.metrics['Win/Loss']) === 1
  const isFFA = FFA_TYPES.has(d.m.gameType)
  const sameTeam = !isFFA && winA === winB
  const context =
    [d.m.gameType, d.m.map].filter(Boolean).join(' · ') || fmtTimestamp(d.m.timestamp)
  return (
    <div className="rounded-lg border border-edge/40 bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-slate-500">{context}</span>
        {isFFA ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider"
            style={{ color: '#c084fc', borderColor: 'rgba(168,85,247,0.35)', background: 'rgba(168,85,247,0.12)' }}
          >
            <Swords size={9} /> Free-for-all
          </span>
        ) : sameTeam ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-neon-cyan/30 bg-neon-cyan/10 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-neon-cyan">
            <Users size={9} /> Same team
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-neon-amber/30 bg-neon-amber/10 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-neon-amber">
            <Swords size={9} /> Opponents
          </span>
        )}
      </div>
      <div className="space-y-1">
        <PlayerLine name={a} color={colorA} record={d.ra} isHalo={isHalo} lead={d.va > d.vb} />
        <PlayerLine name={b} color={colorB} record={d.rb} isHalo={isHalo} lead={d.vb > d.va} />
      </div>
    </div>
  )
}

function RecentMeetings({ duel, game, a, b, colorA, colorB }) {
  const [showAll, setShowAll] = useState(false)
  const meetings = useMemo(() => [...duel.detail].reverse(), [duel])
  const shown = showAll ? meetings : meetings.slice(0, 5)
  return (
    <div className="space-y-2">
      <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
        {showAll ? 'All meetings' : 'Recent meetings'}
      </div>
      <div className="space-y-2">
        {shown.map((d) => (
          <MeetingCard key={d.m.key} d={d} game={game} a={a} b={b} colorA={colorA} colorB={colorB} />
        ))}
      </div>
      {meetings.length > 5 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full rounded-lg border border-edge/60 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-white/20 hover:text-white"
        >
          {showAll ? 'Show fewer' : `Show all ${meetings.length} meetings`}
        </button>
      )}
    </div>
  )
}

export default function HeadToHead() {
  const [a, setA] = useState(allPlayers[0])
  const [b, setB] = useState(allPlayers[1])
  const [gameSel, setGameSel] = useState('Halo Master Chief Collection')

  const sharedGames = useMemo(
    () =>
      GAME_ORDER.filter(
        (g) =>
          records.some((r) => r.game === g && r.player === a) &&
          records.some((r) => r.game === g && r.player === b),
      ),
    [a, b],
  )
  const game = sharedGames.includes(gameSel) ? gameSel : sharedGames[0]

  const { statA, statB, cfg } = useMemo(() => {
    if (!game) return { statA: {}, statB: {}, cfg: null }
    const list = COMPUTE[game](records.filter((r) => r.game === game))
    return {
      statA: list.find((s) => s.player === a) || {},
      statB: list.find((s) => s.player === b) || {},
      cfg: CONFIG[game],
    }
  }, [game, a, b])

  const duel = useMemo(() => {
    if (!game || !cfg?.duel) return null
    let aWins = 0
    let bWins = 0
    let ties = 0
    const detail = []
    for (const m of groupMatches(records.filter((r) => r.game === game))) {
      const ra = m.rows.find((r) => r.player === a)
      const rb = m.rows.find((r) => r.player === b)
      if (!ra || !rb) continue
      const va = cfg.duel.metric(ra)
      const vb = cfg.duel.metric(rb)
      let winner = 'tie'
      if (va > vb) {
        aWins += 1
        winner = 'a'
      } else if (vb > va) {
        bWins += 1
        winner = 'b'
      } else {
        ties += 1
      }
      detail.push({ m, ra, rb, va, vb, winner })
    }
    return { aWins, bWins, ties, shared: detail.length, detail }
  }, [game, a, b, cfg])

  const colorA = playerColor(a)
  const colorB = playerColor(b)

  return (
    <section className="space-y-4">
      <div>
        <div className="font-pixel text-sm uppercase tracking-[0.3em] text-neon-pink">The Tale of the Tape</div>
        <h2 className="font-display text-xl text-white">Head to Head</h2>
        <p className="mt-1 text-sm text-slate-400">Pick any two players to see who comes out on top.</p>
      </div>

      <div className="panel space-y-6 p-5 sm:p-6">
        {/* Versus picker */}
        <div className="flex items-center justify-center gap-4 sm:gap-10">
          <PlayerPicker value={a} color={colorA} options={allPlayers.filter((p) => p !== b)} onChange={setA} />
          <div className="flex flex-col items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-carbon text-slate-300">
              <Swords size={18} />
            </span>
            <span className="mt-1 font-display text-[0.6rem] text-slate-500">VS</span>
          </div>
          <PlayerPicker value={b} color={colorB} options={allPlayers.filter((p) => p !== a)} onChange={setB} />
        </div>

        {sharedGames.length === 0 || !game ? (
          <p className="text-center text-sm text-slate-400">
            {a} and {b} haven&apos;t played any of the same games.
          </p>
        ) : (
          <>
            {/* Shared-game selector */}
            <div className="flex flex-wrap justify-center gap-2">
              {sharedGames.map((g) => (
                <FilterChip
                  key={g}
                  label={metaForGame(g).short}
                  active={g === game}
                  onClick={() => setGameSel(g)}
                  color={metaForGame(g).accent}
                />
              ))}
            </div>

            {/* Head-to-head record */}
            {cfg.duel ? (
              duel.shared > 0 ? (
                <div className="rounded-xl border border-edge/60 bg-black/20 p-4 text-center">
                  <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
                    {duel.shared} {duel.shared === 1 ? 'match' : 'matches'} together
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-5">
                    <span className="font-display text-3xl" style={{ color: colorA }}>{duel.aWins}</span>
                    <span className="text-slate-600">—</span>
                    <span className="font-display text-3xl" style={{ color: colorB }}>{duel.bWins}</span>
                  </div>
                  <div className="mt-1.5 text-[0.6rem] uppercase tracking-wider text-slate-600">
                    edge by {cfg.duel.label}{duel.ties > 0 ? ` · ${duel.ties} tied` : ''}
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500">
                  No matches together in {metaForGame(game).short} yet.
                </p>
              )
            ) : (
              <p className="text-center text-xs text-slate-500">
                Co-op game — these are combined totals, not a head-to-head record.
              </p>
            )}

            {/* Tale of the tape */}
            <div className="space-y-3">
              {cfg.metrics.map((m) => (
                <StatRow
                  key={m.key}
                  label={m.label}
                  a={num(statA[m.key])}
                  b={num(statB[m.key])}
                  fmt={m.fmt}
                  lowerBetter={m.lowerBetter}
                  colorA={colorA}
                  colorB={colorB}
                />
              ))}
            </div>

            {/* Recent meetings */}
            {cfg.duel && duel.shared > 0 && (
              <RecentMeetings
                key={`${game}-${a}-${b}`}
                duel={duel}
                game={game}
                a={a}
                b={b}
                colorA={colorA}
                colorB={colorB}
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}
