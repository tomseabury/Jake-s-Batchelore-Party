import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Layers } from 'lucide-react'
import { records, matchesForGame } from '../lib/data.js'
import { GAME_META } from '../data/games.js'
import GameArt from '../components/GameArt.jsx'
import HaloView from '../components/games/HaloView.jsx'
import AoeView from '../components/games/AoeView.jsx'
import SpireView from '../components/games/SpireView.jsx'
import DoomView from '../components/games/DoomView.jsx'

const VIEW_BY_KEY = {
  halo: HaloView,
  aoe: AoeView,
  spire: SpireView,
  doom: DoomView,
}

function gameForKey(key) {
  return Object.entries(GAME_META).find(([, m]) => m.key === key)?.[0]
}

export default function GameDetail() {
  const { gameKey } = useParams()
  const game = gameForKey(gameKey)

  if (!game) return <Navigate to="/games" replace />

  const meta = GAME_META[game]
  const View = VIEW_BY_KEY[gameKey]
  const rows = records.filter((r) => r.game === game)
  const matches = matchesForGame(game)
  const players = new Set(rows.map((r) => r.player)).size
  const days = new Set(rows.map((r) => r.date)).size

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="relative -mx-4 -mt-8 overflow-hidden">
        <GameArt game={game} className="absolute inset-0 h-full w-full opacity-60" />
        <div className="relative z-10 px-4 py-12">
          <Link
            to="/games"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft size={14} /> All Games
          </Link>
          <div
            className="font-pixel text-sm uppercase tracking-[0.3em]"
            style={{ color: meta.accent }}
          >
            {meta.genre} · {meta.tagline}
          </div>
          <h1
            className="font-display text-2xl text-white sm:text-4xl"
            style={{ textShadow: `0 0 20px ${meta.accent}aa` }}
          >
            {game}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">{meta.blurb}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-200">
            <span className="inline-flex items-center gap-1.5">
              <Layers size={15} style={{ color: meta.accent }} /> {matches.length} matches
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={15} style={{ color: meta.accent }} /> {players} players
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={15} style={{ color: meta.accent }} /> {days} days
            </span>
          </div>
        </div>
      </div>

      {View ? <View game={game} meta={meta} /> : null}
    </div>
  )
}
