// "Ultimate Gamer" scoring engine.
//
// Each game produces a 0-100 sub-score per player (normalized within the pool
// of players being ranked). Sub-scores are then combined using configurable
// weights. Crucially, weights are RE-NORMALIZED to the set of games a player
// actually participated in, so skipping a game doesn't unfairly zero you out.
import { records, matchesForGame } from './data.js'
import { computeHalo, computeAoe, computeSpire, computeDoom, round } from './aggregate.js'
import { DEFAULT_WEIGHTS } from '../data/games.js'

const HALO = 'Halo Master Chief Collection'
const AOE = 'Age of Empires II: Definitive Edition'
const SPIRE = 'Slay the Spire 2'
const DOOM = 'Doom + Doom 2 - Co-op'

const safeMax = (arr) => Math.max(...arr, 0.0001)

// Halo: 50% K/D efficiency, 25% avg kills (fragging power), 25% win rate.
function haloSubScores(playerList) {
  const rows = records.filter((r) => r.game === HALO && playerList.includes(r.player))
  const stats = computeHalo(rows)
  const maxKd = safeMax(stats.map((s) => s.kd))
  const maxAvgKills = safeMax(stats.map((s) => s.avgKills))
  const out = {}
  for (const s of stats) {
    const kdScore = (s.kd / maxKd) * 100
    const killScore = (s.avgKills / maxAvgKills) * 100
    const winScore = s.winRate
    const score = 0.5 * kdScore + 0.25 * killScore + 0.25 * winScore
    out[s.player] = {
      score: round(score, 1),
      parts: [
        { label: 'K/D', value: round(kdScore, 1), weight: 0.5 },
        { label: 'Avg Kills', value: round(killScore, 1), weight: 0.25 },
        { label: 'Win %', value: round(winScore, 1), weight: 0.25 },
      ],
      stat: s,
    }
  }
  return out
}

// AoE II: average of per-match score share (yourScore / matchTopScore). A
// player who tops the scoreboard every game scores 100.
function aoeSubScores(playerList) {
  const matches = matchesForGame(AOE)
  const perPlayer = {}
  for (const m of matches) {
    const scored = m.rows.map((r) => ({ player: r.player, score: r.metrics.Score || 0 }))
    const top = safeMax(scored.map((s) => s.score))
    for (const s of scored) {
      if (!playerList.includes(s.player)) continue
      ;(perPlayer[s.player] ||= []).push(s.score / top)
    }
  }
  const stats = computeAoe(records.filter((r) => r.game === AOE && playerList.includes(r.player)))
  const statByPlayer = Object.fromEntries(stats.map((s) => [s.player, s]))
  const out = {}
  for (const [player, norms] of Object.entries(perPlayer)) {
    const avgNorm = norms.reduce((a, b) => a + b, 0) / norms.length
    out[player] = {
      score: round(avgNorm * 100, 1),
      parts: [{ label: 'Avg Score Share', value: round(avgNorm * 100, 1), weight: 1 }],
      stat: statByPlayer[player],
    }
  }
  return out
}

// Slay the Spire 2: every logged run was a win, so we reward harder
// random-character runs and lightly penalize "mends" (needing a teammate save).
function spireSubScores(playerList) {
  const stats = computeSpire(records.filter((r) => r.game === SPIRE && playerList.includes(r.player)))
  const raw = {}
  for (const s of stats) raw[s.player] = s.wins + 0.5 * s.randomRuns - 0.3 * s.mends
  const max = safeMax(Object.values(raw))
  const out = {}
  for (const s of stats) {
    out[s.player] = {
      score: round((raw[s.player] / max) * 100, 1),
      parts: [
        { label: 'Wins', value: s.wins },
        { label: 'Random Runs', value: s.randomRuns },
        { label: 'Mends', value: s.mends },
      ],
      stat: s,
    }
  }
  return out
}

// Doom co-op: share of keys found relative to the top key-finder.
function doomSubScores(playerList) {
  const stats = computeDoom(records.filter((r) => r.game === DOOM && playerList.includes(r.player)))
  const maxKeys = safeMax(stats.map((s) => s.keys))
  const out = {}
  for (const s of stats) {
    out[s.player] = {
      score: round((s.keys / maxKeys) * 100, 1),
      parts: [{ label: 'Keys Found', value: s.keys }],
      stat: s,
    }
  }
  return out
}

export function gameSubScores(playerList) {
  return {
    [HALO]: haloSubScores(playerList),
    [AOE]: aoeSubScores(playerList),
    [SPIRE]: spireSubScores(playerList),
    [DOOM]: doomSubScores(playerList),
  }
}

// Main entry: rank a list of players. Returns sorted array with full breakdown.
export function computeUltimateScores(playerList, weights = DEFAULT_WEIGHTS) {
  const subs = gameSubScores(playerList)
  const games = Object.keys(subs)

  const results = playerList.map((player) => {
    const breakdown = {}
    let weightedSum = 0
    let weightTotal = 0
    for (const game of games) {
      const entry = subs[game][player]
      if (!entry) continue
      const w = weights[game] ?? 0
      breakdown[game] = { score: entry.score, weight: w, parts: entry.parts }
      weightedSum += entry.score * w
      weightTotal += w
    }
    const ultimate = weightTotal > 0 ? weightedSum / weightTotal : 0
    return {
      player,
      ultimate: round(ultimate, 1),
      breakdown,
      gamesPlayed: Object.keys(breakdown).length,
      effectiveWeightTotal: round(weightTotal, 3),
    }
  })

  return results.sort((a, b) => b.ultimate - a.ultimate)
}

export const SCORING_GAMES = [HALO, AOE, SPIRE, DOOM]
