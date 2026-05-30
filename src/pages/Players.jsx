import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, ChevronRight } from 'lucide-react'
import { players as allPlayers } from '../lib/data.js'
import { computeUltimateScores } from '../lib/scoring.js'
import { playerSummary } from '../lib/aggregate.js'
import {
  CORE_PLAYERS, GUEST_PLAYERS, DEFAULT_WEIGHTS, GAME_META, metaForGame,
} from '../data/games.js'
import { Avatar, Bar, Tier, GameBadge } from '../components/ui.jsx'
import { playerColor } from '../data/games.js'

const corePresent = CORE_PLAYERS.filter((p) => allPlayers.includes(p))
const guestsPresent = GUEST_PLAYERS.filter((p) => allPlayers.includes(p))

function PlayerCard({ entry, rank }) {
  const summary = playerSummary(entry.player)
  const gamesPlayed = Object.keys(summary.byGame)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <Link
        to={`/players/${encodeURIComponent(entry.player)}`}
        className="panel panel-hover group flex items-center gap-4 p-4"
      >
        <Avatar name={entry.player} size={56} link={false} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm text-white">{entry.player}</span>
            {rank === 0 && <span className="text-xs text-neon-amber">👑</span>}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {gamesPlayed.map((g) => (
              <GameBadge key={g} meta={metaForGame(g)} />
            ))}
          </div>
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-[0.65rem] uppercase tracking-widest text-slate-500">
              <span>Ultimate Rating</span>
              <span className="stat-num text-white">{entry.ultimate}</span>
            </div>
            <Bar value={entry.ultimate} color={playerColor(entry.player)} height={6} />
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-neon-cyan" />
      </Link>
    </motion.div>
  )
}

export default function Players() {
  const coreRanked = useMemo(() => computeUltimateScores(corePresent, DEFAULT_WEIGHTS), [])
  const guestRanked = useMemo(() => computeUltimateScores(guestsPresent, DEFAULT_WEIGHTS), [])

  return (
    <div className="space-y-10">
      <div>
        <div className="font-pixel text-sm uppercase tracking-[0.3em] text-neon-purple">The Roster</div>
        <h1 className="font-display text-2xl text-white sm:text-3xl">Players</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          {allPlayers.length} competitors took the controller. Tap any player for their
          full weekend dossier.
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <Tier color="#ffd700">Main Event</Tier>
          <span className="text-sm text-slate-400">Full weekend competitors</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coreRanked.map((entry, i) => (
            <PlayerCard key={entry.player} entry={entry} rank={i} />
          ))}
        </div>
      </section>

      {guestRanked.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Tier color="#38bdf8">Guest Appearances</Tier>
            <span className="text-sm text-slate-400">Drop-in players</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guestRanked.map((entry, i) => (
              <PlayerCard key={entry.player} entry={entry} rank={i + 99} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
