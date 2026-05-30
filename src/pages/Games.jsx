import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Users, Layers } from 'lucide-react'
import { records, matchesForGame } from '../lib/data.js'
import { GAME_ORDER, GAME_META } from '../data/games.js'
import GameArt from '../components/GameArt.jsx'
import HeadToHead from '../components/HeadToHead.jsx'

function gameSummary(game) {
  const rows = records.filter((r) => r.game === game)
  const matches = matchesForGame(game)
  const players = new Set(rows.map((r) => r.player))
  const days = new Set(rows.map((r) => r.date))
  return {
    statLines: rows.length,
    matches: matches.length,
    players: players.size,
    days: days.size,
  }
}

export default function Games() {
  return (
    <div className="space-y-8">
      <div>
        <div className="font-pixel text-sm uppercase tracking-[0.3em] text-neon-cyan">The Arena</div>
        <h1 className="font-display text-2xl text-white sm:text-3xl">Games Played</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Four games, one weekend. Dive into each game for full stats and
          filters, or scroll down to put any two players head-to-head.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {GAME_ORDER.map((game, i) => {
          const meta = GAME_META[game]
          const s = gameSummary(game)
          return (
            <motion.div
              key={game}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/games/${meta.key}`}
                className="panel panel-hover group relative block h-72 overflow-hidden"
              >
                <GameArt game={game} className="absolute inset-0 h-full w-full opacity-85 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                  <div className="flex items-start justify-between">
                    <span
                      className="chip"
                      style={{ borderColor: `${meta.accent}66`, color: meta.accent, background: `${meta.accent}1a` }}
                    >
                      {meta.genre}
                    </span>
                    <span className="font-pixel text-sm uppercase tracking-widest text-slate-400">
                      {meta.tagline}
                    </span>
                  </div>

                  <div>
                    <h2
                      className="font-display text-lg text-white sm:text-xl"
                      style={{ textShadow: `0 0 16px ${meta.accent}aa` }}
                    >
                      {game}
                    </h2>
                    <p className="mt-2 max-w-lg text-sm text-slate-300">{meta.blurb}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Layers size={14} style={{ color: meta.accent }} /> {s.matches} matches
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={14} style={{ color: meta.accent }} /> {s.players} players
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} style={{ color: meta.accent }} /> {s.days} days
                      </span>
                      <span
                        className="ml-auto inline-flex items-center gap-1 font-display text-[0.7rem] transition-transform group-hover:translate-x-1"
                        style={{ color: meta.accent }}
                      >
                        EXPLORE <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <HeadToHead />
    </div>
  )
}
