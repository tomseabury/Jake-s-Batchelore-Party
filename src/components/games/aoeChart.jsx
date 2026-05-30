import {
  BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import { fmtNum } from '../../lib/format.js'

// Shared AoE "Score Mix" stacked bar chart, used both for the per-player
// averages on the game page and for a single match in the Match Log.
export const AOE_SCORE_PARTS = [
  { key: 'Military', color: '#ff2e88' },
  { key: 'Economy', color: '#9bff3d' },
  { key: 'Technology', color: '#22e7ff' },
  { key: 'Society', color: '#a855f7' },
]

export function AoeCompositionTooltip({ active, payload, label, totalLabel = 'Total Score' }) {
  if (!active || !payload?.length) return null
  const total = payload[0]?.payload?.total
  return (
    <div className="rounded-lg border border-[#272045] bg-[#13112a] px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-semibold text-white">{label}</div>
      <div className="space-y-0.5">
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="stat-num text-white">{fmtNum(p.value)}</span>
          </div>
        ))}
      </div>
      {total != null && (
        <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-[#272045] pt-1.5">
          <span className="font-semibold text-slate-200">{totalLabel}</span>
          <span className="stat-num font-bold text-white">{fmtNum(total)}</span>
        </div>
      )}
    </div>
  )
}

export const AOE_RESOURCE_PARTS = [
  { key: 'Wood', color: '#84cc16' },
  { key: 'Food', color: '#f43f5e' },
  { key: 'Gold', color: '#facc15' },
  { key: 'Stone', color: '#94a3b8' },
]

// Generic stacked-bar renderer shared by the Score Mix and Resources views.
function AoeStackedChart({ data, parts, tooltip, showLegend, minHeight }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(minHeight, data.length * 54)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid horizontal={false} stroke="#ffffff10" />
        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="#ffffff20" />
        <YAxis type="category" dataKey="player" width={60} tick={{ fill: '#e2e8f0', fontSize: 12 }} stroke="#ffffff20" />
        <Tooltip cursor={{ fill: '#ffffff08' }} content={tooltip} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {parts.map((p, i) => (
          <RBar
            key={p.key}
            dataKey={p.key}
            stackId="s"
            fill={p.color}
            radius={i === parts.length - 1 ? [0, 6, 6, 0] : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// `data` items: { player, Military, Economy, Technology, Society, total }
export function AoeScoreMixChart({
  data,
  totalLabel = 'Total Score',
  showLegend = true,
  minHeight = 160,
}) {
  return (
    <AoeStackedChart
      data={data}
      parts={AOE_SCORE_PARTS}
      showLegend={showLegend}
      minHeight={minHeight}
      tooltip={(props) => <AoeCompositionTooltip {...props} totalLabel={totalLabel} />}
    />
  )
}

// `data` items: { player, Wood, Food, Gold, Stone, total }
export function AoeResourceChart({
  data,
  totalLabel = 'Total Gathered',
  showLegend = true,
  minHeight = 160,
}) {
  return (
    <AoeStackedChart
      data={data}
      parts={AOE_RESOURCE_PARTS}
      showLegend={showLegend}
      minHeight={minHeight}
      tooltip={(props) => <AoeCompositionTooltip {...props} totalLabel={totalLabel} />}
    />
  )
}
