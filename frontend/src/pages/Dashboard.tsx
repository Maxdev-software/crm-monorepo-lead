import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getAnalytics, type Analytics } from '../api/client'

const STATUS_COLORS: Record<string, string> = {
  new: '#e84646', contacted: '#f59e0b', qualified: '#10b981', lost: '#8a8a8e',
}

export function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getAnalytics()
      .then(setData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted text-sm font-mono">
      Loading analytics…
    </div>
  )
  if (error || !data) return (
    <div className="card border-red-200 bg-red-50 text-accent text-sm">{error}</div>
  )

  const statusEntries = Object.entries(data.by_status)
  const sourceEntries = Object.entries(data.by_source)

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card col-span-2 md:col-span-1">
          <p className="label">Total Leads</p>
          <p className="text-4xl font-semibold tracking-tight">{data.total_leads}</p>
        </div>
        {statusEntries.map(([status, count]) => (
          <div key={status} className="card">
            <p className="label">{status}</p>
            <p className="text-3xl font-semibold" style={{ color: STATUS_COLORS[status] ?? '#0d0d0f' }}>
              {count}
            </p>
          </div>
        ))}
      </div>

      {data.daily_trend.length > 0 && (
        <div className="card">
          <p className="label mb-4">Daily Lead Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.daily_trend} barSize={12}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8a8a8e' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8a8a8e' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 6, fontSize: 12 }}
                cursor={{ fill: '#f4f3ef' }}
              />
              <Bar dataKey="count" fill="#e84646" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {sourceEntries.length > 0 && (
        <div className="card">
          <p className="label mb-4">Leads by Source</p>
          <div className="space-y-2">
            {sourceEntries.map(([source, count]) => {
              const pct = data.total_leads > 0 ? Math.round((count / data.total_leads) * 100) : 0
              return (
                <div key={source} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-24 truncate">{source}</span>
                  <div className="flex-1 bg-paper rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted font-mono">
        Cached at: {new Date(data.cached_at).toLocaleTimeString()} ·{' '}
        <button onClick={load} className="underline hover:text-ink">Refresh</button>
      </p>
    </div>
  )
}