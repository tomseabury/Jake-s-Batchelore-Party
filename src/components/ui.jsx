// Reusable retro-styled UI primitives shared across pages.
import { Link } from 'react-router-dom'
import { Crown, Medal } from 'lucide-react'
import { playerColor } from '../data/games.js'
import { initials } from '../lib/format.js'

export function Avatar({ name, size = 40, link = true, ring = true }) {
  const color = playerColor(name)
  const body = (
    <div
      className="relative flex items-center justify-center rounded-lg font-display text-[0.6em] uppercase"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${color}33, ${color}11)`,
        border: ring ? `1px solid ${color}` : 'none',
        boxShadow: ring ? `0 0 12px ${color}55, inset 0 0 8px ${color}22` : 'none',
        color,
        fontSize: size * 0.32,
      }}
      title={name}
    >
      {initials(name)}
    </div>
  )
  if (!link) return body
  return (
    <Link to={`/players/${encodeURIComponent(name)}`} className="transition-transform hover:scale-105">
      {body}
    </Link>
  )
}

export function PlayerTag({ name, size = 32 }) {
  return (
    <Link
      to={`/players/${encodeURIComponent(name)}`}
      className="group inline-flex items-center gap-2"
    >
      <Avatar name={name} size={size} link={false} />
      <span className="font-semibold text-slate-200 group-hover:text-white">{name}</span>
    </Link>
  )
}

const RANK_STYLE = {
  1: { color: '#ffd700', label: '1st' },
  2: { color: '#cbd5e1', label: '2nd' },
  3: { color: '#cd7f32', label: '3rd' },
}

export function RankBadge({ rank }) {
  const s = RANK_STYLE[rank]
  if (!s) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-white/5 font-display text-xs text-slate-400">
        {rank}
      </span>
    )
  }
  const Icon = rank === 1 ? Crown : Medal
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-lg border"
      style={{
        color: s.color,
        borderColor: `${s.color}66`,
        background: `${s.color}14`,
        boxShadow: `0 0 14px ${s.color}44`,
      }}
    >
      <Icon size={18} strokeWidth={2.4} />
    </span>
  )
}

export function StatTile({ label, value, sub, accent = '#22e7ff', icon: Icon }) {
  return (
    <div className="panel panel-hover p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        {Icon && <Icon size={16} style={{ color: accent }} />}
      </div>
      <div className="mt-2 stat-num text-2xl text-white" style={{ textShadow: `0 0 14px ${accent}55` }}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

export function Bar({ value, max = 100, color = '#22e7ff', height = 8, showTrack = true }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={`w-full overflow-hidden rounded-full ${showTrack ? 'bg-white/8' : ''}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          boxShadow: `0 0 10px ${color}88`,
        }}
      />
    </div>
  )
}

export function SectionHeading({ kicker, title, accent = '#22e7ff', children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && (
          <div
            className="mb-2 font-pixel text-sm uppercase tracking-[0.3em]"
            style={{ color: accent }}
          >
            {kicker}
          </div>
        )}
        <h2 className="font-display text-xl text-white sm:text-2xl">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export function GameBadge({ meta, to }) {
  const inner = (
    <span
      className="chip"
      style={{ borderColor: `${meta.accent}55`, color: meta.accent, background: `${meta.accent}12` }}
    >
      {meta.short}
    </span>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-edge bg-carbon/60 p-1">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              active ? 'bg-neon-cyan/15 text-neon-cyan shadow-neon' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {opt.icon && <opt.icon size={14} />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function FilterChip({ label, active, onClick, color = '#22e7ff' }) {
  return (
    <button
      onClick={onClick}
      className={`chip ${active ? 'chip-active' : 'hover:border-white/20 hover:text-white'}`}
      style={active ? { borderColor: `${color}99`, color, background: `${color}1a` } : undefined}
    >
      {label}
    </button>
  )
}

export function PlayerScope({ value, onChange, hasGuests = true, color = '#ffd700' }) {
  const opts = [
    { v: 'all', l: 'All' },
    { v: 'core', l: 'Main Event' },
  ]
  if (hasGuests) opts.push({ v: 'guest', l: 'Guests' })
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
        Players
      </span>
      {opts.map((o) => (
        <FilterChip
          key={o.v}
          label={o.l}
          active={value === o.v}
          onClick={() => onChange(o.v)}
          color={color}
        />
      ))}
    </div>
  )
}

export function EmptyState({ message }) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-2 p-12 text-center">
      <div className="font-pixel text-3xl text-slate-600">¯\_(ツ)_/¯</div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}

export function Tier({ label, color, children }) {
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ color, background: `${color}1a`, border: `1px solid ${color}55` }}
    >
      {children || label}
    </span>
  )
}
