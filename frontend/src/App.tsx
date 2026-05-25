import { useState } from 'react'
import { Dashboard } from './pages/Dashboard'
import { LeadsList } from './pages/LeadsList'
import { CreateLeadForm } from './components/CreateLeadForm'

type Tab = 'dashboard' | 'leads' | 'create'

export function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)

  const onLeadCreated = () => {
    setRefreshKey(k => k + 1)
    setTab('leads')
  }

  const navItem = (id: Tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
        tab === id ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 bg-accent rounded flex items-center justify-center text-white text-xs font-bold">C</span>
            <span className="font-semibold tracking-tight">CRM</span>
          </div>
          <nav className="flex gap-1">
            {navItem('dashboard', 'Dashboard')}
            {navItem('leads', 'Leads')}
            {navItem('create', 'New Lead')}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {tab === 'dashboard' && 'Analytics Dashboard'}
            {tab === 'leads'     && 'All Leads'}
            {tab === 'create'    && 'Create Lead'}
          </h1>
          <p className="text-sm text-muted mt-1">
            {tab === 'dashboard' && 'Cached in Redis · 5 min TTL · invalidated on new lead'}
            {tab === 'leads'     && 'Paginated from PostgreSQL via FastAPI'}
            {tab === 'create'    && 'Email notification queued in RabbitMQ via Celery'}
          </p>
        </div>

        {tab === 'dashboard' && <Dashboard key={refreshKey} />}
        {tab === 'leads'     && <LeadsList refreshKey={refreshKey} />}
        {tab === 'create'    && <CreateLeadForm onCreated={onLeadCreated} />}
      </main>
    </div>
  )
}
