// Small formatting helpers used across the UI.

export function fmtNum(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString('en-US')
}

export function fmtDecimal(n, d = 2) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number(n).toFixed(d)
}

export function fmtPct(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return `${Number(n).toFixed(0)}%`
}

// "3/26/2026 22:25:54" -> "Mar 26, 10:25 PM"
export function fmtTimestamp(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// "2026-03-26" -> "Mar 26"
export function fmtDay(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function initials(name) {
  return name
    .replace(/[^a-zA-Z- ]/g, '')
    .split(/[\s-]+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
