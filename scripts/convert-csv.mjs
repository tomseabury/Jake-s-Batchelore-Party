// Converts the raw Google Sheets CSV export into a clean, structured JSON
// module the app consumes. Run with `npm run convert` (also runs on build).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Find the CSV export in the project root (matches "*.csv").
const csvName = readdirSync(root).find((f) => f.toLowerCase().endsWith('.csv'))
if (!csvName) {
  console.error('No CSV file found in project root.')
  process.exit(1)
}
const csvPath = join(root, csvName)
const raw = readFileSync(csvPath, 'utf8')

// Minimal RFC-4180-ish CSV line splitter (handles quoted fields + commas).
function splitLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}

const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
lines.shift() // drop header row (we know the layout)

function toISODate(ts) {
  // Input like "3/26/2026 22:25:54"
  const [datePart] = ts.split(' ')
  const [m, d, y] = datePart.split('/')
  if (!y) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function coerce(value) {
  const v = (value ?? '').trim()
  if (v === '') return null
  // Numeric (allow integers and decimals)
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
  return v
}

const records = []
let id = 0

for (const line of lines) {
  const cols = splitLine(line)
  const timestamp = (cols[0] || '').trim()
  const player = (cols[1] || '').trim()
  const game = (cols[2] || '').trim()
  if (!player || !game) continue

  const metrics = {}
  // Metric/Value pairs start at column index 3 and go in pairs.
  for (let i = 3; i < cols.length - 1; i += 2) {
    const key = (cols[i] || '').trim()
    const val = coerce(cols[i + 1])
    if (key === '' || key === ' ') continue
    if (val === null) continue
    metrics[key] = val
  }

  records.push({
    id: id++,
    timestamp,
    date: toISODate(timestamp),
    player,
    game,
    metrics,
  })
}

const outDir = join(root, 'src', 'data')
mkdirSync(outDir, { recursive: true })
const payload = {
  generatedAt: new Date().toISOString(),
  source: csvName,
  recordCount: records.length,
  records,
}
writeFileSync(join(outDir, 'stats.json'), JSON.stringify(payload, null, 2))

// Quick summary to the console.
const games = [...new Set(records.map((r) => r.game))]
const players = [...new Set(records.map((r) => r.player))]
console.log(`Converted ${records.length} records from "${csvName}".`)
console.log(`Games (${games.length}): ${games.join(', ')}`)
console.log(`Players (${players.length}): ${players.join(', ')}`)
