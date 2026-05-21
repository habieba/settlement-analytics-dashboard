import { useEffect, useState } from 'react'
import axios from 'axios'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? ''

const STATUSES = ['active', 'completed', 'withdrawn']

const PROGRAMS = [
  'Language Training',
  'Employment Services',
  'Housing Support',
  'Social Integration',
  'Legal & Documentation',
  'Mental Health Support',
]

const COUNTRIES = [
  'Afghanistan', 'Cameroon', 'Colombia', 'Congo (DRC)', 'Eritrea',
  'Ethiopia', 'Iran', 'Iraq', 'Myanmar', 'Nigeria',
  'Somalia', 'Sudan', 'Syria', 'Ukraine', 'Venezuela',
]

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

const STATUS_STYLES = {
  completed: 'bg-green-50  text-green-700  border border-green-200',
  active:    'bg-blue-50   text-blue-700   border border-blue-200',
  withdrawn: 'bg-gray-100  text-gray-500   border border-gray-200',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_STYLES[status] ?? ''}`}>
      {status}
    </span>
  )
}

// ── filter select ─────────────────────────────────────────────────────────────

function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-ink/15 rounded-md px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
    >
      <option value="">{label}</option>
      {options.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

// ── skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-t border-ink/5 animate-pulse">
          <td className="px-4 py-3"><div className="h-3 w-28 bg-ink/10 rounded" /></td>
          <td className="px-4 py-3"><div className="h-3 w-20 bg-ink/10 rounded" /></td>
          <td className="px-4 py-3"><div className="h-3 w-32 bg-ink/10 rounded" /></td>
          <td className="px-4 py-3"><div className="h-5 w-20 bg-ink/10 rounded" /></td>
          <td className="px-4 py-3"><div className="h-3 w-20 bg-ink/10 rounded" /></td>
          <td className="px-4 py-3"><div className="h-3 w-20 bg-ink/10 rounded" /></td>
        </tr>
      ))}
    </>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function Clients() {
  const [page, setPage]       = useState(1)
  const [filters, setFilters] = useState({ status: '', program_type: '', country: '' })
  const [result, setResult]   = useState({ clients: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  function setFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  const hasFilters = Object.values(filters).some(Boolean)

  function clearFilters() {
    setFilters({ status: '', program_type: '', country: '' })
    setPage(1)
  }

  useEffect(() => {
    setLoading(true)
    const params = { page, per_page: 20 }
    if (filters.status)       params.status       = filters.status
    if (filters.program_type) params.program_type = filters.program_type
    if (filters.country)      params.country      = filters.country

    axios.get(`${API}/api/clients`, { params })
      .then(r => { setResult(r.data); setLoading(false) })
      .catch(() => { setError('Could not load client data. Is the backend running?'); setLoading(false) })
  }, [page, filters])

  const { clients, total, pages } = result
  const rangeStart = total === 0 ? 0 : (page - 1) * 20 + 1
  const rangeEnd   = Math.min(page * 20, total)

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Clients</h2>
      <p className="text-sm text-ink/50 mb-6">
        Browse, search, and filter all client records across programmes.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white rounded-lg shadow-sm border border-ink/5 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink/40 uppercase tracking-wider">
            <SlidersHorizontal size={13} /> Filter
          </span>

          <FilterSelect
            label="All Statuses"
            value={filters.status}
            onChange={v => setFilter('status', v)}
            options={STATUSES}
          />
          <FilterSelect
            label="All Programs"
            value={filters.program_type}
            onChange={v => setFilter('program_type', v)}
            options={PROGRAMS}
          />
          <FilterSelect
            label="All Countries"
            value={filters.country}
            onChange={v => setFilter('country', v)}
            options={COUNTRIES}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-accent hover:underline font-medium ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg shadow-sm border border-ink/5 overflow-x-auto">

        {/* Results count */}
        <div className="px-5 py-3 border-b border-ink/5 flex items-center justify-between">
          <p className="text-xs text-ink/40">
            {loading
              ? 'Loading…'
              : total === 0
                ? 'No clients match the current filters.'
                : `Showing ${rangeStart}–${rangeEnd} of ${total} clients`}
          </p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-semibold text-ink/40 uppercase tracking-wider bg-surface/60">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Program</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Intake Date</th>
              <th className="px-4 py-3 text-left">Completion Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm text-ink/30">
                  No clients match the selected filters. Try adjusting or clearing them.
                </td>
              </tr>
            ) : (
              clients.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-t border-ink/5 hover:bg-surface/50 transition-colors ${i % 2 === 1 ? 'bg-surface/30' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-ink/70">{c.country_of_origin}</td>
                  <td className="px-4 py-3 text-ink/70">{c.program_type}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-ink/70 tabular-nums">{fmtDate(c.intake_date)}</td>
                  <td className="px-4 py-3 text-ink/50 tabular-nums">{fmtDate(c.completion_date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {!loading && total > 0 && (
          <div className="px-5 py-3 border-t border-ink/5 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="text-xs text-ink/40">
              Page {page} of {pages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
