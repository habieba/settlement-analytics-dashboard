import { useEffect, useState } from 'react'
import axios from 'axios'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import NarrativeSummary from '../components/NarrativeSummary'

const API = import.meta.env.VITE_API_URL ?? ''

// ── helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 90) return '#16a34a'   // green-600
  if (score >= 70) return '#d97706'   // amber-600
  return '#dc2626'                    // red-600
}

function scoreTextClass(score) {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-amber-600'
  return 'text-red-600'
}

const FIELD_LABELS = {
  missing_notes:             'Notes',
  missing_language_spoken:   'Language spoken',
  missing_completion_date:   'Completion date',
  missing_case_worker:       'Case worker',
}

const FIELD_TAG_COLORS = {
  notes:             'bg-amber-50  text-amber-700  border border-amber-200',
  language_spoken:   'bg-purple-50 text-purple-700 border border-purple-200',
  completion_date:   'bg-red-50    text-red-700    border border-red-200',
  case_worker:       'bg-blue-50   text-blue-700   border border-blue-200',
}

const STATUS_STYLES = {
  completed: 'bg-green-50  text-green-700  border border-green-200',
  active:    'bg-blue-50   text-blue-700   border border-blue-200',
  withdrawn: 'bg-gray-100  text-gray-500   border border-gray-200',
}

function humanField(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── narrative ─────────────────────────────────────────────────────────────────

function buildNarrative(scoreData, flags) {
  const { score, total_records, flagged_records, breakdown } = scoreData

  // Most commonly missing field (highest count > 0)
  const worstField = Object.entries(breakdown)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])[0]

  // Program type with the most flagged records
  const programCounts = {}
  flags.forEach(f => { programCounts[f.program_type] = (programCounts[f.program_type] || 0) + 1 })
  const topProgram = Object.entries(programCounts).sort((a, b) => b[1] - a[1])[0]

  const completeCount = total_records - flagged_records
  const fieldName  = worstField ? FIELD_LABELS[worstField[0]] ?? humanField(worstField[0]) : null
  const fieldCount = worstField?.[1] ?? 0

  if (!fieldName) {
    return `All ${total_records} records are fully complete — an excellent result that supports reliable programme reporting and outcome tracking. No data quality issues were detected across any of the four monitored fields.`
  }

  return `${score}% of records are free of critical data quality issues, with ${completeCount} of ${total_records} records passing all checks. ` +
    `The most commonly missing field is ${fieldName.toLowerCase()}, affecting ${fieldCount} records — this gap may limit the organisation's ability to track support needs and produce complete outcome reports. ` +
    `Addressing these gaps would most immediately improve data completeness for ${topProgram?.[0] ?? 'affected'} clients, who account for the highest concentration of flagged records in this dataset.`
}

// ── skeletons ─────────────────────────────────────────────────────────────────

function ScoreSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6 mb-6 animate-pulse">
      <div className="h-3 w-36 bg-ink/10 rounded mb-3" />
      <div className="h-12 w-28 bg-ink/10 rounded mb-4" />
      <div className="h-2.5 w-full bg-ink/10 rounded mb-5" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-ink/8 rounded" />)}
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <tr key={i} className="border-t border-ink/5 animate-pulse">
          <td className="px-4 py-3"><div className="h-3 w-28 bg-ink/10 rounded" /></td>
          <td className="px-4 py-3"><div className="h-3 w-32 bg-ink/10 rounded" /></td>
          <td className="px-4 py-3"><div className="h-5 w-20 bg-ink/10 rounded" /></td>
          <td className="px-4 py-3 flex gap-2">
            <div className="h-5 w-16 bg-ink/10 rounded" />
            <div className="h-5 w-20 bg-ink/10 rounded" />
          </td>
        </tr>
      ))}
    </>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function DataQuality() {
  const [scoreData, setScoreData] = useState(null)
  const [flags, setFlags]         = useState(null)
  const [error, setError]         = useState(null)

  const loading = !scoreData || !flags

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/quality/score`),
      axios.get(`${API}/api/quality/flags`),
    ])
      .then(([s, f]) => { setScoreData(s.data); setFlags(f.data) })
      .catch(() => setError('Could not load data quality information. Is the backend running?'))
  }, [])

  const completeCount = scoreData ? scoreData.total_records - scoreData.flagged_records : null

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Data Quality</h2>
      <p className="text-sm text-ink/50 mb-6">
        Monitoring completeness across all client records to support accurate reporting.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Quality Score card ── */}
      {scoreData ? (
        <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-6 mb-6">
          <p className="text-xs font-semibold tracking-widest text-ink/40 uppercase mb-2">
            Overall Data Quality Score
          </p>

          <p className={`text-5xl font-bold mb-1 tracking-tight ${scoreTextClass(scoreData.score)}`}>
            {scoreData.score}<span className="text-2xl text-ink/20 font-normal">/100</span>
          </p>

          <p className="text-sm text-ink/50 mb-4">
            {completeCount} of {scoreData.total_records} records are fully complete
          </p>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-ink/5 rounded-full overflow-hidden mb-6">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${scoreData.score}%`, backgroundColor: scoreColor(scoreData.score) }}
            />
          </div>

          {/* Breakdown */}
          <h3 className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-3">
            Field-level breakdown
          </h3>
          <ul className="space-y-2">
            {Object.entries(scoreData.breakdown).map(([key, count]) => {
              const ok = count === 0
              return (
                <li key={key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink/70">
                    {ok
                      ? <CheckCircle size={14} className="text-green-500 shrink-0" />
                      : <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    }
                    {FIELD_LABELS[key] ?? humanField(key)} missing
                  </span>
                  <span className={`font-semibold tabular-nums ${ok ? 'text-green-600' : 'text-amber-600'}`}>
                    {count === 0 ? '✓ None' : `${count} record${count !== 1 ? 's' : ''}`}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : !error && <ScoreSkeleton />}

      {/* ── Flagged Records table ── */}
      <div className="bg-white rounded-lg shadow-sm border border-ink/5 mb-6 overflow-x-auto">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink">Records Requiring Attention</h3>
            {flags && (
              <p className="text-xs text-ink/40 mt-0.5">
                {flags.length === 0
                  ? 'No records flagged — all records pass quality checks.'
                  : `${flags.length} record${flags.length !== 1 ? 's' : ''} missing 2 or more fields`}
              </p>
            )}
          </div>
          {flags?.length > 0 && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
              {flags.length} flagged
            </span>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-ink/5 text-xs font-semibold text-ink/40 uppercase tracking-wider bg-surface/60">
              <th className="px-4 py-3 text-left">Client Name</th>
              <th className="px-4 py-3 text-left">Program</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Missing Fields</th>
            </tr>
          </thead>
          <tbody>
            {loading && !error ? (
              <TableSkeleton />
            ) : flags?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-green-600">
                  <CheckCircle size={24} className="mx-auto mb-2 text-green-400" />
                  No records flagged — data quality looks good.
                </td>
              </tr>
            ) : (
              flags?.map((record, i) => (
                <tr
                  key={record.id}
                  className={`border-t border-ink/5 ${i % 2 === 1 ? 'bg-surface/30' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-ink">{record.name}</td>
                  <td className="px-4 py-3 text-ink/70">{record.program_type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_STYLES[record.status] ?? ''}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {record.missing_fields.map(field => (
                        <span
                          key={field}
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${FIELD_TAG_COLORS[field] ?? 'bg-ink/10 text-ink/60'}`}
                        >
                          {humanField(field)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Narrative ── */}
      {scoreData && flags && !error && (
        <NarrativeSummary text={buildNarrative(scoreData, flags)} />
      )}
    </div>
  )
}
