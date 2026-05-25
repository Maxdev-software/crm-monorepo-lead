import { useEffect, useState, useCallback } from 'react'
import { getLeads, type Lead } from '../api/client'

const STATUS_BADGE: Record<string, string> = {
  new:       'bg-red-50 text-accent border-red-200',
  contacted: 'bg-amber-50 text-amber-600 border-amber-200',
  qualified: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  lost:      'bg-gray-100 text-muted border-gray-200',
}

interface Props {
  refreshKey: number
}

export function LeadsList({ refreshKey }: Props) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  // load принимает filter явно — не создаёт зависимость на statusFilter,
  // поэтому useCallback не пересоздаёт функцию при каждом вводе
  const load = useCallback((filter: string) => {
    setLoading(true)
    setError(null)
    getLeads({ limit: 50, status: filter || undefined })
      .then(d => {
        setLeads(d.items)
        setTotal(d.total)
      })
      .catch(() => setError('Failed to load leads. Is the API running?'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(statusFilter)
  }, [load, statusFilter, refreshKey])

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted font-mono">
          {loading ? 'Loading…' : `${total} lead${total !== 1 ? 's' : ''}`}
        </p>
        <select
          className="input w-auto text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          disabled={loading}
        >
          <option value="">All statuses</option>
          {['new', 'contacted', 'qualified', 'lost'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50 text-accent text-sm">{error}</div>
      )}

      {!error && !loading && leads.length === 0 && (
        <div className="card text-center text-muted text-sm py-12">
          No leads yet. Create your first one →
        </div>
      )}

      {!error && leads.length > 0 && (
        <div className={`overflow-hidden border border-border rounded-lg transition-opacity
          ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper border-b border-border">
                {['#', 'Name', 'Email', 'Phone', 'Source', 'Status', 'Created'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-paper
                    ${i % 2 === 0 ? 'bg-surface' : 'bg-paper/40'}`}
                >
                  <td className="px-4 py-3 font-mono text-muted text-xs">{lead.id}</td>
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="px-4 py-3 text-muted">{lead.email}</td>
                  <td className="px-4 py-3 text-muted">{lead.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{lead.source ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs border font-medium
                     ${STATUS_BADGE[lead.status ?? ''] ?? 'bg-gray-100 text-muted border-gray-200'}`}>
                     {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}