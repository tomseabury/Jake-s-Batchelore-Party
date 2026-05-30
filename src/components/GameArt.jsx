// Stylized, original game-themed artwork used as section backdrops. Each motif
// evokes the source game (Halo ringworld, AoE castle, StS spire, Doom hellscape)
// using the game's signature palette. No external image assets required, but a
// real cover image can be layered on top via the `cover` prop if dropped into
// /public/covers.
import { metaForGame } from '../data/games.js'

function HaloArt({ a, b }) {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="halo-sky" cx="50%" cy="20%" r="90%">
          <stop offset="0%" stopColor="#0a3a66" />
          <stop offset="100%" stopColor="#03101f" />
        </radialGradient>
      </defs>
      <rect width="800" height="450" fill="url(#halo-sky)" />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={(i * 97) % 800}
          cy={(i * 53) % 220}
          r={(i % 3) * 0.6 + 0.5}
          fill="#bfe9ff"
          opacity={0.5}
        />
      ))}
      <ellipse cx="400" cy="540" rx="520" ry="120" fill={a} opacity="0.18" />
      <path d="M-40 250 Q400 90 840 250" fill="none" stroke={b} strokeWidth="40" opacity="0.35" />
      <path d="M-40 250 Q400 90 840 250" fill="none" stroke="#eaf8ff" strokeWidth="6" opacity="0.7" />
      <path d="M0 360 L800 360 L800 450 L0 450 Z" fill="#020912" opacity="0.7" />
    </svg>
  )
}

function AoeArt({ a, b }) {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="aoe-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a0c" />
          <stop offset="100%" stopColor="#120a02" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#aoe-sky)" />
      <circle cx="400" cy="150" r="90" fill={b} opacity="0.25" />
      <circle cx="400" cy="150" r="60" fill={a} opacity="0.4" />
      {Array.from({ length: 16 }).map((_, i) => (
        <line
          key={i}
          x1="400"
          y1="150"
          x2={400 + Math.cos((i / 16) * 6.283) * 400}
          y2={150 + Math.sin((i / 16) * 6.283) * 400}
          stroke={b}
          strokeWidth="2"
          opacity="0.08"
        />
      ))}
      {/* Castle silhouette */}
      <g fill="#0c0700" opacity="0.92">
        <rect x="120" y="300" width="560" height="150" />
        <rect x="150" y="240" width="60" height="120" />
        <rect x="590" y="240" width="60" height="120" />
        <rect x="360" y="210" width="80" height="160" />
        {[150, 170, 190, 360, 380, 400, 420, 590, 610, 630].map((x, i) => (
          <rect key={i} x={x} y={x < 300 ? 226 : 196} width="14" height="16" />
        ))}
      </g>
    </svg>
  )
}

function SpireArt({ a, b }) {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="spire-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e1338" />
          <stop offset="100%" stopColor="#0d0512" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#spire-sky)" />
      <circle cx="400" cy="120" r="70" fill={a} opacity="0.3" />
      {/* Ascending spire */}
      <g fill="#0a0410" opacity="0.9">
        <polygon points="340,450 460,450 440,120 400,70 360,120" />
      </g>
      <g stroke={b} strokeWidth="2" opacity="0.5" fill="none">
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={360 - i} y1={130 + i * 45} x2={440 + i} y2={130 + i * 45} />
        ))}
      </g>
      {/* Floating cards */}
      {[
        [150, 250, -15],
        [620, 220, 12],
        [110, 360, 8],
        [660, 360, -10],
      ].map(([x, y, r], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="46"
          height="64"
          rx="5"
          fill={a}
          opacity="0.5"
          transform={`rotate(${r} ${x + 23} ${y + 32})`}
        />
      ))}
    </svg>
  )
}

function DoomArt({ a, b }) {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="doom-sky" cx="50%" cy="80%" r="90%">
          <stop offset="0%" stopColor="#5c0f0f" />
          <stop offset="60%" stopColor="#260404" />
          <stop offset="100%" stopColor="#0a0101" />
        </radialGradient>
      </defs>
      <rect width="800" height="450" fill="url(#doom-sky)" />
      <circle cx="400" cy="160" r="80" fill={b} opacity="0.25" />
      {/* Jagged hell mountains */}
      <polygon points="0,450 120,260 220,360 340,220 460,360 560,250 680,360 800,260 800,450" fill="#160202" />
      <polygon points="0,450 160,320 300,400 440,300 580,400 720,320 800,360 800,450" fill="#3a0606" opacity="0.8" />
      {/* Embers */}
      {Array.from({ length: 30 }).map((_, i) => (
        <circle
          key={i}
          cx={(i * 113) % 800}
          cy={(i * 71) % 300 + 60}
          r={(i % 3) * 0.7 + 0.6}
          fill={a}
          opacity="0.6"
        />
      ))}
    </svg>
  )
}

const ART = {
  halo: HaloArt,
  aoe: AoeArt,
  spire: SpireArt,
  doom: DoomArt,
}

// Real cover / key art (in /public/covers) layered over the themed fallback.
const COVERS = {
  halo: 'covers/halo.jpg',
  aoe: 'covers/aoe.jpg',
  spire: 'covers/spire.png',
  doom: 'covers/doom.png',
}

export default function GameArt({ game, className = '', overlay = true, position = 'center' }) {
  const meta = metaForGame(game)
  const Art = ART[meta.key] || HaloArt
  const cover = COVERS[meta.key]
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Themed fallback art (shows if the cover image fails to load) */}
      <div className="absolute inset-0">
        <Art a={meta.accent} b={meta.accent2} />
      </div>
      {cover && (
        <img
          src={`${import.meta.env.BASE_URL}${cover}`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      )}
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(7,6,13,0.94) 0%, rgba(7,6,13,0.32) 46%, rgba(7,6,13,0.62) 100%)',
          }}
        />
      )}
    </div>
  )
}
