// Game-specific stat aggregation. Each function takes an array of raw records
// (already filtered to one game) and reduces them per player.
import { records } from './data.js'

const sum = (arr) => arr.reduce((a, b) => a + b, 0)
const avg = (arr) => (arr.length ? sum(arr) / arr.length : 0)
const num = (v) => (typeof v === 'number' ? v : 0)

export function round(n, d = 2) {
  const f = 10 ** d
  return Math.round((n + Number.EPSILON) * f) / f
}

// ---------- HALO ----------
export function computeHalo(rows) {
  const byPlayer = new Map()
  for (const r of rows) {
    if (!byPlayer.has(r.player)) {
      byPlayer.set(r.player, {
        player: r.player,
        matches: 0,
        kills: 0,
        deaths: 0,
        wins: 0,
        bestKills: 0,
        bestKD: 0,
      })
    }
    const s = byPlayer.get(r.player)
    const k = num(r.metrics.Kills)
    const d = num(r.metrics.Deaths)
    s.matches += 1
    s.kills += k
    s.deaths += d
    s.wins += num(r.metrics['Win/Loss']) === 1 ? 1 : 0
    s.bestKills = Math.max(s.bestKills, k)
    const kd = d === 0 ? k : k / d
    s.bestKD = Math.max(s.bestKD, round(kd))
  }
  return [...byPlayer.values()]
    .map((s) => ({
      ...s,
      kd: round(s.deaths === 0 ? s.kills : s.kills / s.deaths),
      winRate: round(s.matches ? (s.wins / s.matches) * 100 : 0, 1),
      avgKills: round(s.matches ? s.kills / s.matches : 0, 1),
      avgDeaths: round(s.matches ? s.deaths / s.matches : 0, 1),
    }))
    .sort((a, b) => b.kd - a.kd)
}

// ---------- AGE OF EMPIRES II ----------
export function computeAoe(rows) {
  const byPlayer = new Map()
  for (const r of rows) {
    if (!byPlayer.has(r.player)) {
      byPlayer.set(r.player, {
        player: r.player,
        matches: 0,
        wins: 0,
        scores: [],
        economy: [],
        military: [],
        technology: [],
        society: [],
        wood: 0,
        stone: 0,
        food: 0,
        gold: 0,
      })
    }
    const s = byPlayer.get(r.player)
    const m = r.metrics
    s.matches += 1
    s.wins += num(m['Win/Loss']) === 1 ? 1 : 0
    s.scores.push(num(m.Score))
    s.economy.push(num(m['Economy Score']))
    s.military.push(num(m['Military Score']))
    s.technology.push(num(m['Technology Score']))
    s.society.push(num(m['Society Score']))
    s.wood += num(m['Wood Gathered'])
    s.stone += num(m['Stone Gathered'])
    s.food += num(m['Food Gathered'])
    s.gold += num(m['Gold Gathered'])
  }
  return [...byPlayer.values()]
    .map((s) => ({
      player: s.player,
      matches: s.matches,
      wins: s.wins,
      totalScore: sum(s.scores),
      avgScore: Math.round(avg(s.scores)),
      bestScore: Math.max(...s.scores, 0),
      avgEconomy: Math.round(avg(s.economy)),
      avgMilitary: Math.round(avg(s.military)),
      avgTechnology: Math.round(avg(s.technology)),
      avgSociety: Math.round(avg(s.society)),
      wood: s.wood,
      stone: s.stone,
      food: s.food,
      gold: s.gold,
      resources: s.wood + s.stone + s.food + s.gold,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
}

// ---------- SLAY THE SPIRE 2 ----------
export function computeSpire(rows) {
  const byPlayer = new Map()
  for (const r of rows) {
    if (!byPlayer.has(r.player)) {
      byPlayer.set(r.player, {
        player: r.player,
        runs: 0,
        act1: 0,
        act2: 0,
        wins: 0,
        deaths: 0,
        mends: 0,
        randomRuns: 0,
      })
    }
    const s = byPlayer.get(r.player)
    const m = r.metrics
    s.runs += 1
    s.act1 += num(m['Act 1 win']) === 1 ? 1 : 0
    s.act2 += num(m['Act 2 win']) === 1 ? 1 : 0
    s.wins += num(m['Win/Loss']) === 1 ? 1 : 0
    s.deaths += num(m.Deaths)
    s.mends += num(m['Mend Count'])
    s.randomRuns += num(m['Random Character?']) === 1 ? 1 : 0
  }
  return [...byPlayer.values()].sort((a, b) => b.wins - a.wins || b.mends - a.mends)
}

// ---------- DOOM CO-OP ----------
export function computeDoom(rows) {
  const byPlayer = new Map()
  for (const r of rows) {
    if (!byPlayer.has(r.player)) {
      byPlayer.set(r.player, { player: r.player, runs: 0, keys: 0 })
    }
    const s = byPlayer.get(r.player)
    s.runs += 1
    s.keys += num(r.metrics['Keys Found'])
  }
  const list = [...byPlayer.values()]
  const totalKeys = sum(list.map((s) => s.keys))
  return list
    .map((s) => ({
      ...s,
      keyShare: round(totalKeys ? (s.keys / totalKeys) * 100 : 0, 1),
    }))
    .sort((a, b) => b.keys - a.keys)
}

// Convenience: compute for a whole game using all records.
export function statsForGame(game, rows = records) {
  const r = rows.filter((x) => x.game === game)
  switch (game) {
    case 'Halo Master Chief Collection':
      return computeHalo(r)
    case 'Age of Empires II: Definitive Edition':
      return computeAoe(r)
    case 'Slay the Spire 2':
      return computeSpire(r)
    case 'Doom + Doom 2 - Co-op':
      return computeDoom(r)
    default:
      return []
  }
}

// Per-player participation summary across all games.
export function playerSummary(player) {
  const mine = records.filter((r) => r.player === player)
  const byGame = {}
  for (const r of mine) {
    byGame[r.game] = (byGame[r.game] || 0) + 1
  }
  return {
    player,
    totalRecords: mine.length,
    gamesPlayed: Object.keys(byGame).length,
    byGame,
  }
}
