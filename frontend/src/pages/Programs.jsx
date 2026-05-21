import { useEffect, useState } from 'react'
import axios from 'axios'
import PlotlyChart from '../components/PlotlyChart'
import NarrativeSummary from '../components/NarrativeSummary'

const API = import.meta.env.VITE_API_URL ?? ''

// ── colour helpers ────────────────────────────────────────────────────────────
function rateColor(rate) {
  if (rate >= 75) return '#2E75B6'
  if (rate >= 50) return '#F39C12'
  return '#E74C3C'
}

function rateLabel(rate) {
  if (rate >= 75) return 'High'
  if (rate >= 50) return 'Mid'
  return 'Low'
}

// ── narrative ─────────────────────────────────────────────────────────────────
function buildNarrative(programs) {
  if (!programs.length) return ''
  const best  = programs[0]
  const worst = programs[programs.length - 1]
  const avg   = (programs.reduce((s, p) => s + p.rate, 0) / programs.length).toFixed(1)

  return `${best.program} achieves the highest completion rate at ${best.rate}%, suggesting strong case-to-programme matching and client support structures. ` +
    `${worst.program} records the lowest rate at ${worst.rate}% — this may reflect the complexity of cases referred to that programme, longer timelines to resolution, or gaps in wraparound support that warrant case-level review. ` +
    `Overall, the average completion rate across all six programmes is ${avg}%, indicating that the majority of closed cases reach a successful outcome, though no programme has yet crossed the 75% threshold that would signal consistently high performance.`
}

// ── skeleton pieces ───────────────────────────────────────────────────────────
function SummarySkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6 mb-6 animate-pulse">
      <div className="h-3 w-40 bg-ink/10 rounded mb-3" />
      <div className="h-8 w-24 bg-ink/10 rounded mb-4" />
      <div className="h-2 w-full bg-ink/10 rounded" />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6 animate-pulse">
      <div className="h-3.5 w-48 bg-ink/10 rounded mb-4" />
      <div className="h-56 bg-ink/5 rounded mb-4" />
      <div className="h-16 bg-accent/5 rounded" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6 mt-6 animate-pulse">
      <div className="h-3.5 w-32 bg-ink/10 rounded mb-4" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          <div className="h-3 flex-1 bg-ink/10 rounded" />
          <div className="h-3 w-12 bg-ink/10 rounded" />
          <div className="h-3 w-12 bg-ink/10 rounded" />
          <div className="h-3 w-12 bg-ink/10 rounded" />
          <div className="h-3 w-12 bg-ink/10 rounded" />
          <div className="h-3 w-12 bg-ink/10 rounded" />
        </div>
      ))}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function Programs() {
  const [programs, setPrograms] = useState(null)
  const [error, setError]       = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/programs/completion`)
      .then(r => setPrograms(r.data))
      .catch(() => setError('Could not load programme data. Is the backend running?'))
  }, [])

  // ── derived values ──────────────────────────────────────────────────────────
  const totalEnrolled  = programs ? programs.reduce((s, p) => s + p.total, 0)     : 0
  const totalCompleted = programs ? programs.reduce((s, p) => s + p.completed, 0) : 0
  const overallRate    = totalEnrolled ? ((totalCompleted / totalEnrolled) * 100).toFixed(1) : 0

  // ── chart ───────────────────────────────────────────────────────────────────
  const chartData = programs ? [{
    x: programs.map(p => p.rate),
    y: programs.map(p => p.program),
    type: 'bar',
    orientation: 'h',
    marker: { color: programs.map(p => rateColor(p.rate)) },
    text: programs.map(p => `${p.rate}%`),
    textposition: 'outside',
    textfont: { size: 11, color: '#1A1A2E' },
    hovertemplate: '<b>%{y}</b>: %{x}%<extra></extra>',
    cliponaxis: false,
  }] : null

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Programs</h2>
      <p className="text-sm text-ink/50 mb-6">
        Completion rates and enrolment breakdown across all six settlement programmes.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Summary bar ── */}
      {programs ? (
        <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6 mb-6">
          <p className="text-xs font-semibold tracking-widest text-ink/40 uppercase mb-1">
            Overall Completion Rate
          </p>
          <p className="text-4xl font-bold text-ink mb-3">{overallRate}%</p>
          <div className="w-full h-2 bg-ink/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overallRate}%`, backgroundColor: rateColor(Number(overallRate)) }}
            />
          </div>
          <p className="text-xs text-ink/40 mt-2">
            {totalCompleted} completed of {totalEnrolled} total clients enrolled
          </p>
        </div>
      ) : !error && <SummarySkeleton />}

      {/* ── Chart + Narrative ── */}
      {programs ? (
        <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">
            Completion Rate by Programme
          </h3>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4">
            {[['#2E75B6', 'High  (≥ 75%)'], ['#F39C12', 'Mid  (50–74%)'], ['#E74C3C', 'Low  (< 50%)']].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-ink/60">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>

          <PlotlyChart
            data={chartData}
            layout={{
              xaxis: { title: { text: 'Completion rate (%)', standoff: 8 }, range: [0, 110] },
              yaxis: { automargin: true },
              margin: { t: 10, r: 60, b: 52, l: 170 },
            }}
            height={280}
          />

          <div className="mt-4 pt-4 border-t border-ink/5">
            <NarrativeSummary text={buildNarrative(programs)} />
          </div>
        </div>
      ) : !error && <ChartSkeleton />}

      {/* ── Table ── */}
      {programs ? (
        <div className="bg-white rounded-lg shadow-sm border border-ink/5 mt-6 overflow-x-auto">
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-ink">Programme Breakdown</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-ink/5 text-xs font-semibold text-ink/40 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Programme</th>
                <th className="px-4 py-3 text-right">Total Enrolled</th>
                <th className="px-4 py-3 text-right">Completed</th>
                <th className="px-4 py-3 text-right">Withdrawn</th>
                <th className="px-4 py-3 text-right">Active</th>
                <th className="px-6 py-3 text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p, i) => (
                <tr
                  key={p.program}
                  className={`border-t border-ink/5 ${i % 2 === 1 ? 'bg-surface/50' : ''}`}
                >
                  <td className="px-6 py-3 font-medium text-ink">{p.program}</td>
                  <td className="px-4 py-3 text-right text-ink/70">{p.total}</td>
                  <td className="px-4 py-3 text-right text-ink/70">{p.completed}</td>
                  <td className="px-4 py-3 text-right text-ink/70">{p.withdrawn}</td>
                  <td className="px-4 py-3 text-right text-ink/70">{p.active}</td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: rateColor(p.rate) }}
                    >
                      {p.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-ink/10 bg-surface/50 text-xs font-semibold text-ink/60">
                <td className="px-6 py-3">All Programmes</td>
                <td className="px-4 py-3 text-right">{totalEnrolled}</td>
                <td className="px-4 py-3 text-right">{totalCompleted}</td>
                <td className="px-4 py-3 text-right">{programs.reduce((s, p) => s + p.withdrawn, 0)}</td>
                <td className="px-4 py-3 text-right">{programs.reduce((s, p) => s + p.active, 0)}</td>
                <td className="px-6 py-3 text-right">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: rateColor(Number(overallRate)) }}
                  >
                    {overallRate}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : !error && <TableSkeleton />}
    </div>
  )
}
