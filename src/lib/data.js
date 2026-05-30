// Central data access layer. Loads the generated stats.json and exposes
// normalized records plus helpers for grouping into matches.
import raw from '../data/stats.json'
import { GAME_ORDER, CORE_PLAYERS, GUEST_PLAYERS } from '../data/games.js'

export const records = raw.records
export const generatedAt = raw.generatedAt

// All distinct players, core listed first then guests, then anyone else.
const seenPlayers = [...new Set(records.map((r) => r.player))]
export const players = [
  ...CORE_PLAYERS.filter((p) => seenPlayers.includes(p)),
  ...GUEST_PLAYERS.filter((p) => seenPlayers.includes(p)),
  ...seenPlayers.filter((p) => !CORE_PLAYERS.includes(p) && !GUEST_PLAYERS.includes(p)),
]

// Games in our preferred display order, then any extras.
const seenGames = [...new Set(records.map((r) => r.game))]
export const games = [
  ...GAME_ORDER.filter((g) => seenGames.includes(g)),
  ...seenGames.filter((g) => !GAME_ORDER.includes(g)),
]

export function isCore(player) {
  return CORE_PLAYERS.includes(player)
}

// A "match" is all records sharing the same timestamp + game (one session).
export function groupMatches(rows = records) {
  const map = new Map()
  for (const r of rows) {
    const key = `${r.game}__${r.timestamp}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        game: r.game,
        timestamp: r.timestamp,
        date: r.date,
        gameName: r.metrics['Game Name'] || null,
        gameType: r.metrics['Game Type'] || null,
        map: r.metrics['Map Name'] || null,
        rows: [],
      })
    }
    map.get(key).rows.push(r)
  }
  // Sort chronologically by timestamp.
  return [...map.values()].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  )
}

export function matchesForGame(game) {
  return groupMatches(records.filter((r) => r.game === game))
}

export function recordsForPlayer(player) {
  return records.filter((r) => r.player === player)
}

// Distinct values of a Halo metric (e.g. "Map Name", "Game Type", "Game Name").
export function distinctMetric(game, metric) {
  return [
    ...new Set(
      records
        .filter((r) => r.game === game && r.metrics[metric] != null)
        .map((r) => r.metrics[metric]),
    ),
  ].sort()
}

export const totals = {
  records: records.length,
  matches: groupMatches().length,
  players: players.length,
  games: games.length,
  dateRange: (() => {
    const dates = records.map((r) => r.date).filter(Boolean).sort()
    return { start: dates[0], end: dates[dates.length - 1] }
  })(),
}
