// Per-game metadata: theming, descriptions, and how each game's stats map to
// the "Ultimate Gamer" scoring system. Keys match the `game` field in the data.

export const GAME_META = {
  'Halo Master Chief Collection': {
    key: 'halo',
    short: 'Halo MCC',
    tagline: 'Finish the Fight',
    year: '2014 (original 2001-2007)',
    genre: 'Arena FPS',
    accent: '#3da9fc',
    accent2: '#7ee8fa',
    gradient: 'linear-gradient(135deg, #04101f 0%, #0a2a4a 45%, #123f6b 100%)',
    blurb:
      'The backbone of the weekend. Seven players, classic Halo 2/3 multiplayer across Slayer, SWAT, Snipers, Gun Game and chaos custom modes. Pure kill-or-be-killed.',
    primaryMetrics: ['Kills', 'Deaths', 'Win/Loss'],
    weight: 0.5,
  },
  'Age of Empires II: Definitive Edition': {
    key: 'aoe',
    short: 'AoE II',
    tagline: 'Wololo',
    year: '2019 (original 1999)',
    genre: 'Real-Time Strategy',
    accent: '#d4af37',
    accent2: '#f5d76e',
    gradient: 'linear-gradient(135deg, #1a1206 0%, #3a2a0c 50%, #5c4513 100%)',
    blurb:
      'Empire building, resource booming and military crushing. Score is king, but the economy and military breakdowns tell the real story of each campaign.',
    primaryMetrics: ['Score', 'Win/Loss'],
    weight: 0.25,
  },
  'Slay the Spire 2': {
    key: 'spire',
    short: 'StS 2',
    tagline: 'Climb Together',
    year: '2025',
    genre: 'Roguelike Deckbuilder',
    accent: '#f4a259',
    accent2: '#ffd29d',
    gradient: 'linear-gradient(135deg, #160a1f 0%, #2e1338 50%, #4a1d3f 100%)',
    blurb:
      'Co-op deckbuilding ascension. Clear Act 1, conquer Act 2, survive without dying. Bonus respect for random-character runs and mends handed to teammates.',
    primaryMetrics: ['Act 1 win', 'Act 2 win', 'Win/Loss'],
    weight: 0.15,
  },
  'Doom + Doom 2 - Co-op': {
    key: 'doom',
    short: 'DOOM Co-op',
    tagline: 'Rip and Tear',
    year: '2024 re-release (original 1993)',
    genre: 'Co-op FPS',
    accent: '#c1121f',
    accent2: '#ff5a3c',
    gradient: 'linear-gradient(135deg, #1a0303 0%, #3a0808 50%, #5c0f0f 100%)',
    blurb:
      'Demons, shotguns and teamwork. Co-op runs through the classics where the only stat that mattered was who grabbed the keys and kept the squad moving.',
    primaryMetrics: ['Keys Found'],
    weight: 0.1,
  },
}

export const GAME_ORDER = [
  'Halo Master Chief Collection',
  'Age of Empires II: Definitive Edition',
  'Slay the Spire 2',
  'Doom + Doom 2 - Co-op',
]

export function metaForGame(game) {
  return (
    GAME_META[game] || {
      key: 'unknown',
      short: game,
      accent: '#a855f7',
      accent2: '#d8b4fe',
      gradient: 'linear-gradient(135deg, #0d0b1a, #272045)',
      blurb: '',
      primaryMetrics: [],
      weight: 0,
    }
  )
}

// Core players ranked for the "Ultimate Gamer" crown vs. drop-in guests.
export const CORE_PLAYERS = ['Jake', 'Jace', 'Tom', 'J-Mart', 'AJ', 'Fred', 'Steph']
export const GUEST_PLAYERS = ['Alec', 'Brady', 'Drew']

export function isCore(player) {
  return CORE_PLAYERS.includes(player)
}

// Stable accent color per player for charts/avatars.
export const PLAYER_COLORS = {
  Jake: '#ff2e88',
  Jace: '#22e7ff',
  Tom: '#9bff3d',
  'J-Mart': '#ffb627',
  AJ: '#a855f7',
  Fred: '#f97316',
  Steph: '#ec4899',
  Alec: '#38bdf8',
  Brady: '#34d399',
  Drew: '#fbbf24',
}

export function playerColor(name) {
  return PLAYER_COLORS[name] || '#94a3b8'
}

// Default weights for the Ultimate Gamer formula (overridable in the UI).
// Expressed on a 0-100 scale so the leaderboard sliders read naturally. The
// scoring engine normalizes by the weight total, so only the ratios matter
// (50/25/15/10 behaves identically to 0.5/0.25/0.15/0.1).
export const DEFAULT_WEIGHTS = {
  'Halo Master Chief Collection': 50,
  'Age of Empires II: Definitive Edition': 25,
  'Slay the Spire 2': 15,
  'Doom + Doom 2 - Co-op': 10,
}
