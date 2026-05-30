// Generic sortable table. Columns define how each field renders + sorts.
import { useState, useMemo } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { Avatar } from './ui.jsx'

export default function DataTable({ columns, rows, initialSort, accent = '#22e7ff' }) {
  const [sortKey, setSortKey] = useState(initialSort?.key ?? columns[0].key)
  const [dir, setDir] = useState(initialSort?.dir ?? 'desc')

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey)
    const get = col?.sortValue || ((r) => r[sortKey])
    return [...rows].sort((a, b) => {
      const av = get(a)
      const bv = get(b)
      if (typeof av === 'string' || typeof bv === 'string') {
        return dir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      }
      return dir === 'asc' ? av - bv : bv - av
    })
  }, [rows, sortKey, dir, columns])

  function toggleSort(key) {
    if (key === sortKey) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setDir('desc')
    }
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-edge text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                onClick={() => c.sortable !== false && toggleSort(c.key)}
                className={`whitespace-nowrap px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 ${
                  c.sortable !== false ? 'cursor-pointer select-none hover:text-white' : ''
                } ${c.align === 'right' ? 'text-right' : ''}`}
              >
                <span className={`inline-flex items-center gap-1 ${c.align === 'right' ? 'flex-row-reverse' : ''}`}>
                  {c.label}
                  {sortKey === c.key &&
                    (dir === 'asc' ? <ArrowUp size={12} style={{ color: accent }} /> : <ArrowDown size={12} style={{ color: accent }} />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.player ?? i}
              className="border-b border-edge/40 transition-colors last:border-0 hover:bg-white/5"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 ${c.align === 'right' ? 'text-right' : ''} ${
                    c.mono ? 'stat-num text-white' : 'text-slate-300'
                  }`}
                >
                  {c.render ? c.render(row, i) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Common column: rank + avatar + name linking to profile.
export function playerColumn(label = 'Player') {
  return {
    key: 'player',
    label,
    sortable: false,
    render: (row, i) => (
      <div className="flex items-center gap-3">
        <span className="w-5 text-xs text-slate-500">{i + 1}</span>
        <Avatar name={row.player} size={32} />
        <span className="font-semibold text-white">{row.player}</span>
      </div>
    ),
  }
}
