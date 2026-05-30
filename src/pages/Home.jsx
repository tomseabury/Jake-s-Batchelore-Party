import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown, Gamepad2, Users, Swords, Skull, Trophy, Castle, Zap, Key, ArrowRight,
} from 'lucide-react'
import { records, totals, games as allGames } from '../lib/data.js'
import { computeUltimateScores } from '../lib/scoring.js'
import { computeHalo, computeAoe, computeSpire, computeDoom } from '../lib/aggregate.js'
import { GAME_META, GAME_ORDER, CORE_PLAYERS, DEFAULT_WEIGHTS, metaForGame } from '../data/games.js'
import GameArt from '../components/GameArt.jsx'
import { Avatar, StatTile, GameBadge } from '../components/ui.jsx'
import { fmtNum, fmtDay, fmtDecimal } from '../lib/format.js'

function useRotatingGame() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % GAME_ORDER.length), 4500)
    return () => clearInterval(t)
  }, [])
  return GAME_ORDER[idx]
}

export default function Home() {
  const activeGame = useRotatingGame()

  const champion = useMemo(
    () => computeUltimateScores(CORE_PLAYERS, DEFAULT_WEIGHTS)[0],
    [],
  )

  const superlatives = useMemo(() => {
    const halo = computeHalo(records.filter((r) => r.game === 'Halo Master Chief Collection'))
    const aoe = computeAoe(records.filter((r) => r.game === 'Age of Empires II: Definitive Edition'))
    const spire = computeSpire(records.filter((r) => r.game === 'Slay the Spire 2'))
    const doom = computeDoom(records.filter((r) => r.game === 'Doom + Doom 2 - Co-op'))

    const mostKills = [...halo].sort((a, b) => b.kills - a.kills)[0]
    const bestKD = [...halo].sort((a, b) => b.kd - a.kd)[0]
    const aoeKing = [...aoe].sort((a, b) => b.bestScore - a.bestScore)[0]
    const spireMaster = [...spire].sort((a, b) => b.wins - a.wins || a.mends - b.mends)[0]
    const keyMaster = [...doom].sort((a, b) => b.keys - a.keys)[0]

    return [
      { icon: Swords, label: 'Most Kills', player: mostKills?.player, value: `${fmtNum(mostKills?.kills)} kills`, color: GAME_META['Halo Master Chief Collection'].accent },
      { icon: Skull, label: 'Best K/D', player: bestKD?.player, value: `${fmtDecimal(bestKD?.kd)} K/D`, color: '#ff2e88' },
      { icon: Castle, label: 'AoE Score King', player: aoeKing?.player, value: `${fmtNum(aoeKing?.bestScore)} pts`, color: GAME_META['Age of Empires II: Definitive Edition'].accent },
      { icon: Zap, label: 'Spire Master', player: spireMaster?.player, value: `${spireMaster?.wins} clears`, color: GAME_META['Slay the Spire 2'].accent },
      { icon: Key, label: 'Key Master', player: keyMaster?.player, value: `${keyMaster?.keys} keys`, color: GAME_META['Doom + Doom 2 - Co-op'].accent },
    ].filter((s) => s.player)
  }, [])

  const totalKills = useMemo(
    () => records.reduce((a, r) => a + (r.metrics.Kills || 0), 0),
    [],
  )

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative -mx-4 -mt-8 overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <GameArt game={activeGame} className="h-full w-full" overlay />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute inset-0 bg-void/35" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="chip mb-5 border-neon-pink/40 text-neon-pink">
              {fmtDay(totals.dateRange.start)} – {fmtDay(totals.dateRange.end)}, 2026
            </span>
            <h1 className="font-display text-3xl leading-tight text-white text-glow-cyan sm:text-5xl">
              JAKE&apos;S BACHELOR
              <br />
              <span className="text-neon-pink text-glow-pink">PARTY TOURNAMENT</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance font-pixel text-xl text-slate-300 sm:text-2xl">
              {totals.matches} matches. {totals.players} players. {allGames.length} games.
              <br />One weekend to crown the <span className="text-neon-amber">Ultimate Gamer</span>.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/leaderboard"
                className="group inline-flex items-center gap-2 rounded-lg border border-neon-amber/60 bg-neon-amber/15 px-5 py-3 font-display text-xs text-neon-amber transition-all hover:bg-neon-amber/25 hover:shadow-[0_0_24px_rgba(255,182,39,0.5)]"
              >
                <Crown size={16} /> SEE THE RANKINGS
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/games"
                className="inline-flex items-center gap-2 rounded-lg border border-edge bg-white/5 px-5 py-3 font-display text-xs text-slate-200 transition-all hover:border-neon-cyan/50 hover:text-neon-cyan"
              >
                <Gamepad2 size={16} /> BROWSE GAMES
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Active game label */}
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-2">
            {GAME_ORDER.map((g) => (
              <span
                key={g}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: g === activeGame ? 28 : 8,
                  background: g === activeGame ? metaForGame(g).accent : '#ffffff33',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Matches" value={fmtNum(totals.matches)} icon={Gamepad2} accent="#22e7ff" />
        <StatTile label="Players" value={fmtNum(totals.players)} icon={Users} accent="#a855f7" />
        <StatTile label="Stat Lines" value={fmtNum(totals.records)} icon={Trophy} accent="#9bff3d" />
        <StatTile label="Total Kills" value={fmtNum(totalKills)} icon={Swords} accent="#ff2e88" />
        <StatTile label="Games" value={fmtNum(allGames.length)} icon={Castle} accent="#ffb627" />
      </section>

      {/* CHAMPION TEASER */}
      {champion && (
        <section>
          <div className="panel relative overflow-hidden p-1">
            <div className="absolute inset-0 opacity-30">
              <GameArt game="Halo Master Chief Collection" overlay={false} className="h-full w-full" />
            </div>
            <div className="relative flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
              <div className="relative">
                <div className="absolute -inset-3 animate-pulse-glow rounded-full bg-neon-amber/20 blur-xl" />
                <Avatar name={champion.player} size={96} link={false} />
                <Crown
                  size={34}
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-neon-amber drop-shadow-[0_0_8px_rgba(255,182,39,0.8)]"
                />
              </div>
              <div className="flex-1">
                <div className="font-pixel text-lg uppercase tracking-[0.3em] text-neon-amber">
                  The Ultimate Gamer
                </div>
                <div className="font-display text-3xl text-white text-glow-amber sm:text-4xl">
                  {champion.player}
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Ultimate Rating{' '}
                  <span className="stat-num text-neon-amber">{champion.ultimate}</span> / 100 across{' '}
                  {champion.gamesPlayed} games.
                </p>
              </div>
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 rounded-lg border border-neon-amber/50 bg-neon-amber/10 px-4 py-2.5 font-display text-[0.7rem] text-neon-amber transition-all hover:bg-neon-amber/20"
              >
                FULL LEADERBOARD <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* GAMES GRID */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="font-pixel text-sm uppercase tracking-[0.3em] text-neon-cyan">The Arena</div>
            <h2 className="font-display text-xl text-white sm:text-2xl">Games Played</h2>
          </div>
          <Link to="/games" className="text-sm text-neon-cyan hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {GAME_ORDER.map((game) => {
            const meta = GAME_META[game]
            const count = records.filter((r) => r.game === game).length
            return (
              <Link
                key={game}
                to={`/games/${meta.key}`}
                className="panel panel-hover group relative h-44 overflow-hidden"
              >
                <GameArt game={game} className="absolute inset-0 h-full w-full opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 flex h-full flex-col justify-end p-5">
                  <div className="flex items-center gap-2">
                    <GameBadge meta={meta} />
                    <span className="text-xs text-slate-400">{count} stat lines</span>
                  </div>
                  <h3 className="mt-2 font-display text-base text-white" style={{ textShadow: `0 0 12px ${meta.accent}88` }}>
                    {game}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-300">{meta.blurb}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* HALL OF FAME / SUPERLATIVES */}
      <section>
        <div className="mb-6">
          <div className="font-pixel text-sm uppercase tracking-[0.3em] text-neon-pink">Hall of Fame</div>
          <h2 className="font-display text-xl text-white sm:text-2xl">Weekend Superlatives</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {superlatives.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="panel panel-hover p-4 text-center">
                <Icon size={22} className="mx-auto" style={{ color: s.color }} />
                <div className="mt-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
                  {s.label}
                </div>
                <div className="mt-3 flex flex-col items-center gap-2">
                  <Avatar name={s.player} size={44} />
                  <span className="font-semibold text-white">{s.player}</span>
                </div>
                <div className="mt-1 text-xs" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
