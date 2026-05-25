import { useState } from 'react'
import { createLead, type LeadCreate } from '../api/client'

interface Props { onCreated: () => void }

const INITIAL: LeadCreate = { name: '', email: '', phone: '', status: 'new', source: '' }

export function CreateLeadForm({ onCreated }: Props) {
  const [form, setForm] = useState<LeadCreate>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof LeadCreate) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null); setSuccess(false)
    try {
      await createLead({ ...form, phone: form.phone || undefined, source: form.source || undefined })
      setSuccess(true)
      setForm(INITIAL)
      onCreated()
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to create lead. Check the API is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card animate-fade-up">
      <h2 className="text-base font-semibold mb-5">New Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label className="label">Source</label>
            <input className="input" placeholder="Website, Referral…" value={form.source} onChange={set('source')} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              {['new', 'contacted', 'qualified', 'lost'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-accent text-sm">{error}</p>}
        {success && <p className="text-emerald-600 text-sm">✓ Lead created — email queued via Celery</p>}
        <div className="flex gap-3 pt-1">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create Lead'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setForm(INITIAL)}>Clear</button>
        </div>
      </form>
    </div>
  )
}