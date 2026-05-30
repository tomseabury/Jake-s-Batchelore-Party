import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, SlidersHorizontal, Info, RotateCcw, ChevronDown } from 'lucide-react'
import { computeUltimateScores, SCORING_GAMES } from '../lib/scoring.js'
import {
  CORE_PLAYERS, GUEST_PLAYERS, DEFAULT_WEIGHTS, metaForGame, playerColor,
} from '../data/games.js'
import { players as allPlayers } from '../lib/data.js'
import { Avatar, RankBadge, Bar, Tier } from '../components/ui.jsx'
import GameArt from '../components/GameArt.jsx'

const corePresent = CORE_PLAYERS.filter((p) => allPlayers.includes(p))
const guestsPresent = GUEST_PLAYERS.filter((p) => allPlayers.includes(p))

function WeightControls({ weights, setWeights }) {
  const total = SCORING_GAMES.reduce((a, g) => a + weights[g], 0) || 1
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
          <SlidersHorizontal size={16} className="text-neon-cyan" /> Tune the Formula
        </div>
        <button
          onClick={() => setWeights({ ...DEFAULT_WEIGHTS })}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-neon-cyan"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SCORING_GAMES.map((game) => {
          const meta = metaForGame(game)
          const pct = Math.round((weights[game] / total) * 100)
          return (
            <div key={game}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: meta.accent }}>
                  {meta.short}
                </span>
                <span className="stat-num text-xs text-white">{pct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights[game]}
                onChange={(e) =>
                  setWeights((w) => ({ ...w, [game]: Number(e.target.value) }))
                }
                className="w-full cursor-pointer accent-current"
                style={{ accentColor: meta.accent }}
              />
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Weights are relative and auto-normalized. Each player&apos;s score only counts
        the games they actually played.
      </p>
    </div>
  )
}

function BreakdownBars({ entry }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {SCORING_GAMES.map((game) => {
        const meta = metaForGame(game)
        const b = entry.breakdown[game]
        return (
          <div key={game} className="rounded-lg border border-edge/60 bg-black/20 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: meta.accent }}>
                {meta.short}
              </span>
              <span className="stat-num text-xs text-white">
                {b ? b.score : '—'}
              </span>
            </div>
            {b ? (
              <Bar value={b.score} color={meta.accent} height={6} />
            ) : (
              <div className="text-[0.65rem] italic text-slate-600">did not play</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PodiumCard({ entry, rank }) {
  const heights = { 1: 'sm:mt-0', 2: 'sm:mt-8', 3: 'sm:mt-12' }
  const glow = { 1: '#ffd700', 2: '#cbd5e1', 3: '#cd7f32' }[rank]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`panel relative flex flex-col items-center p-6 text-center ${heights[rank]}`}
      style={{ boxShadow: `0 0 0 1px ${glow}33, 0 18px 50px -28px ${glow}88` }}
    >
      {rank === 1 && (
        <Crown size={28} className="absolute -top-4 text-neon-amber drop-shadow-[0_0_8px_rgba(255,182,39,0.9)]" />
      )}
      <div className="font-display text-xs" style={{ color: glow }}>
        #{rank}
      </div>
      <div className="my-3">
        <Avatar name={entry.player} size={rank === 1 ? 80 : 64} />
      </div>
      <div className="font-display text-lg text-white">{entry.player}</div>
      <div className="mt-2 stat-num text-3xl" style={{ color: glow, textShadow: `0 0 16px ${glow}66` }}>
        {entry.ultimate}
      </div>
      <div className="text-[0.65rem] uppercase tracking-widest text-slate-500">Ultimate Rating</div>
    </motion.div>
  )
}

function PlayerRow({ entry, rank }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/5"
      >
        <RankBadge rank={rank} />
        <Avatar name={entry.player} size={44} link={false} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm text-white">{entry.player}</div>
          <div className="text-xs text-slate-500">{entry.gamesPlayed} games counted</div>
        </div>
        <div className="hidden w-48 sm:block">
          <Bar value={entry.ultimate} color={playerColor(entry.player)} height={8} />
        </div>
        <div className="text-right">
          <div className="stat-num text-xl text-white">{entry.ultimate}</div>
          <div className="text-[0.6rem] uppercase tracking-widest text-slate-500">rating</div>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-edge/60 bg-black/20 p-4">
          <BreakdownBars entry={entry} />
        </div>
      )}
    </div>
  )
}

export default function Leaderboard() {
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS })
  const [showInfo, setShowInfo] = useState(false)

  const coreRanked = useMemo(
    () => computeUltimateScores(corePresent, weights),
    [weights],
  )
  const guestRanked = useMemo(
    () => computeUltimateScores(guestsPresent, weights),
    [weights],
  )

  const podium = coreRanked.slice(0, 3)
  const rest = coreRanked.slice(3)

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="relative -mx-4 -mt-8 overflow-hidden">
        <GameArt game="Halo Master Chief Collection" className="absolute inset-0 h-full w-full opacity-30" />
        <div className="relative z-10 px-4 py-12 text-center">
          <div className="font-pixel text-sm uppercase tracking-[0.3em] text-neon-amber">
            The Crown
          </div>
          <h1 className="font-display text-2xl text-white text-glow-amber sm:text-4xl">
            ULTIMATE GAMER
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
            A weighted rating across every game of the weekend. Adjust the formula and
            watch the rankings shift in real time.
          </p>
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-neon-cyan hover:underline"
          >
            <Info size={13} /> How is this calculated?
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="panel space-y-2 p-5 text-sm text-slate-300">
          <p><span className="text-neon-cyan">Halo:</span> 50% K/D efficiency, 25% average kills, 25% win rate — normalized so the best player in each stat scores 100.</p>
          <p><span className="text-aoe">Age of Empires II:</span> average of your score share each match (your score ÷ the match&apos;s top score).</p>
          <p><span className="text-spire">Slay the Spire 2:</span> rewards clears, harder random-character runs, and &quot;mends&quot; (giving a mend to a teammate).</p>
          <p><span className="text-doom">Doom Co-op:</span> share of keys found versus the top key-finder.</p>
          <p className="text-slate-500">Each game produces a 0–100 score, combined using the weights below. A player&apos;s weights are re-normalized to only the games they played, so sitting one out never tanks your rating.</p>
        </div>
      )}

      <WeightControls weights={weights} setWeights={setWeights} />

      {/* MAIN EVENT */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <Tier color="#ffd700">Main Event</Tier>
          <span className="text-sm text-slate-400">Core players — full weekend competitors</span>
        </div>

        {/* Podium */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Reorder for visual podium: 2 - 1 - 3 on desktop */}
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((entry) => (
            <PodiumCard key={entry.player} entry={entry} rank={coreRanked.indexOf(entry) + 1} />
          ))}
        </div>

        {/* Remaining ranks */}
        <div className="space-y-3">
          {rest.map((entry) => (
            <PlayerRow key={entry.player} entry={entry} rank={coreRanked.indexOf(entry) + 1} />
          ))}
        </div>
      </section>

      {/* GUEST APPEARANCES */}
      {guestRanked.length > 0 && (
        <section>
          <div className="mb-5 flex items-center gap-3">
            <Tier color="#38bdf8">Guest Appearances</Tier>
            <span className="text-sm text-slate-400">Drop-in players (Halo only)</span>
          </div>
          <div className="space-y-3">
            {guestRanked.map((entry, i) => (
              <PlayerRow key={entry.player} entry={entry} rank={i + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
