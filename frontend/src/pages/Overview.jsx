import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, TrendingUp, ClipboardList, ShieldCheck } from 'lucide-react'
import KPICard, { KPICardSkeleton } from '../components/KPICard'
import PlotlyChart from '../components/PlotlyChart'
import NarrativeSummary from '../components/NarrativeSummary'

const API = import.meta.env.VITE_API_URL ?? ''

// ── palette ───────────────────────────────────────────────────────────────────
const BLUE_PALETTE = [
  '#1F4E79', '#2E75B6', '#3A82C4', '#4A90D9', '#6AA8D4',
  '#7BB3E0', '#92BFDE', '#A8C4E0', '#B8D4EA', '#D0E4F4',
  '#DCECF6', '#EBF4FB', '#163A5C', '#245D8E', '#1B456A',
]

// ── narrative generators ───────────────────────────────────────────────────────
function fmtMonth(yyyyMm) {
  const [y, m] = yyyyMm.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })
}

function intakeNarrative(trends) {
  if (!trends.length) return ''
  const counts = trends.map(t => t.count)
  const total = counts.reduce((a, b) => a + b, 0)
  const peakIdx = counts.indexOf(Math.max(...counts))
  const peak = trends[peakIdx]
  const mid = Math.floor(counts.length / 2)
  const firstHalfAvg = counts.slice(0, mid).reduce((a, b) => a + b, 0) / mid
  const secondHalfAvg = counts.slice(mid).reduce((a, b) => a + b, 0) / (counts.length - mid)
  const direction = secondHalfAvg >= firstHalfAvg ? 'upward' : 'downward'
  return `${total} clients were enrolled between ${fmtMonth(trends[0].month)} and ${fmtMonth(trends[trends.length - 1].month)}. Intake peaked in ${fmtMonth(peak.month)} with ${peak.count} new referrals — the highest single-month figure across the dataset. Comparing the first and second halves of the period, the overall trend is ${direction}, suggesting ${direction === 'upward' ? 'growing demand for services' : 'a period of stabilisation or reduced referrals'}.`
}

function completionNarrative(programs) {
  if (!programs.length) return ''
  const sorted = [...programs].sort((a, b) => b.rate - a.rate)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  const avg = (programs.reduce((s, p) => s + p.rate, 0) / programs.length).toFixed(1)
  return `Across all six programmes, the average completion rate is ${avg}%. ${best.program} leads at ${best.rate}%, indicating strong client retention and programme alignment. ${worst.program} has the lowest rate at ${worst.rate}% — this gap may reflect the complexity of cases referred to that programme and is worth exploring in case review.`
}

function originsNarrative(origins) {
  if (!origins.length) return ''
  const total = origins.reduce((s, o) => s + o.count, 0)
  const top3 = origins.slice(0, 3)
  const top3Text = top3.map(o => `${o.country} (${Math.round(o.count / total * 100)}%)`).join(', ')
  const topShare = Math.round(top3.reduce((s, o) => s + o.count, 0) / total * 100)
  return `Clients originate from ${origins.length} countries, reflecting the diverse populations served by this programme. The three largest source countries are ${top3Text}, together accounting for ${topShare}% of all clients. This geographic concentration has direct implications for interpreter capacity planning and culturally adapted service delivery.`
}

// ── chart section wrapper ─────────────────────────────────────────────────────
function ChartCard({ title, children, narrative }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6">
      <h3 className="text-sm font-semibold text-ink mb-4">{title}</h3>
      {children}
      <div className="mt-4 pt-4 border-t border-ink/5">
        <NarrativeSummary text={narrative} />
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6 animate-pulse">
      <div className="h-3.5 w-40 bg-ink/10 rounded mb-4" />
      <div className="h-64 bg-ink/5 rounded mb-4" />
      <div className="h-16 bg-accent/5 rounded" />
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function Overview() {
  const [kpis, setKpis]           = useState(null)
  const [trends, setTrends]       = useState(null)
  const [completion, setCompletion] = useState(null)
  const [origins, setOrigins]     = useState(null)
  const [error, setError]         = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/overview/kpis`)
      .then(r => setKpis(r.data))
      .catch(() => setError('Could not load KPI data. Is the backend running?'))

    Promise.all([
      axios.get(`${API}/api/programs/trends`),
      axios.get(`${API}/api/programs/completion`),
      axios.get(`${API}/api/origins`),
    ]).then(([t, c, o]) => {
      setTrends(t.data)
      setCompletion(c.data)
      setOrigins(o.data)
    }).catch(() => setError('Could not load chart data.'))
  }, [])

  const kpiCards = kpis ? [
    { title: 'Total Clients',      value: kpis.total_clients.toLocaleString(), subtitle: 'All time',           icon: Users         },
    { title: 'Completion Rate',    value: `${kpis.completion_rate}%`,          subtitle: 'Of closed cases',    icon: TrendingUp    },
    { title: 'Active Cases',       value: kpis.active_count.toLocaleString(),  subtitle: 'Currently enrolled', icon: ClipboardList },
    { title: 'Data Quality Score', value: `${kpis.quality_score}/100`,         subtitle: 'Records complete',   icon: ShieldCheck   },
  ] : []

  // ── chart data ──────────────────────────────────────────────────────────────
  const trendChartData = trends ? [{
    x: trends.map(t => t.month),
    y: trends.map(t => t.count),
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#2E75B6', width: 2.5, shape: 'spline' },
    marker: { color: '#1F4E79', size: 5 },
    fill: 'tozeroy',
    fillcolor: 'rgba(46,117,182,0.08)',
    hovertemplate: '<b>%{x}</b>: %{y} clients<extra></extra>',
  }] : null

  const completionChartData = completion ? [{
    x: completion.map(p => p.rate),
    y: completion.map(p => p.program),
    type: 'bar',
    orientation: 'h',
    marker: {
      color: completion.map(p => p.rate),
      colorscale: [['0', '#A8C4E0'], ['1', '#1F4E79']],
    },
    text: completion.map(p => `${p.rate}%`),
    textposition: 'outside',
    textfont: { size: 11, color: '#1A1A2E' },
    hovertemplate: '<b>%{y}</b>: %{x}%<extra></extra>',
  }] : null

  const originsChartData = origins ? [{
    labels: origins.map(o => o.country),
    values: origins.map(o => o.count),
    type: 'pie',
    hole: 0.45,
    marker: {
      colors: BLUE_PALETTE,
      line: { color: '#fff', width: 1.5 },
    },
    textinfo: 'label+percent',
    textfont: { size: 10 },
    hovertemplate: '<b>%{label}</b>: %{value} clients<extra></extra>',
  }] : null

  const chartsReady = trends && completion && origins

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Overview</h2>
      <p className="text-sm text-ink/50 mb-8">
        Settlement programme summary — all clients, all time.
      </p>

      {error && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis
          ? kpiCards.map(card => <KPICard key={card.title} {...card} />)
          : !error && Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        }
      </div>

      {/* Charts */}
      {!error && (
        <div className="flex flex-col gap-6">
          {/* 1 — intake trend */}
          {chartsReady ? (
            <ChartCard
              title="Monthly Client Intake (2023–2024)"
              narrative={intakeNarrative(trends)}
            >
              <PlotlyChart
                data={trendChartData}
                layout={{
                  yaxis: { title: { text: 'New clients', standoff: 10 } },
                  xaxis: { tickangle: -45 },
                }}
                height={260}
              />
            </ChartCard>
          ) : <ChartSkeleton />}

          {/* 2 & 3 — completion + origins, side by side from lg up */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {chartsReady ? (
              <div className="lg:col-span-3">
                <ChartCard
                  title="Programme Completion Rates"
                  narrative={completionNarrative(completion)}
                >
                  <PlotlyChart
                    data={completionChartData}
                    layout={{
                      xaxis: { title: { text: 'Completion rate (%)', standoff: 8 }, range: [0, 110] },
                      yaxis: { automargin: true },
                      margin: { t: 10, r: 60, b: 48, l: 160 },
                    }}
                    height={280}
                  />
                </ChartCard>
              </div>
            ) : <div className="lg:col-span-3"><ChartSkeleton /></div>}

            {chartsReady ? (
              <div className="lg:col-span-2">
                <ChartCard
                  title="Clients by Country of Origin"
                  narrative={originsNarrative(origins)}
                >
                  <PlotlyChart
                    data={originsChartData}
                    layout={{ margin: { t: 10, r: 10, b: 10, l: 10 } }}
                    height={280}
                  />
                </ChartCard>
              </div>
            ) : <div className="lg:col-span-2"><ChartSkeleton /></div>}
          </div>
        </div>
      )}
    </div>
  )
}
