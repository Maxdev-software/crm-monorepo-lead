import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export interface LeadCreate {
  name: string
  email: string
  phone?: string
  status?: string
  source?: string
}

export interface Lead extends LeadCreate {
  id: number
  created_at: string
}

export interface Analytics {
  total_leads: number
  by_status: Record<string, number>
  by_source: Record<string, number>
  daily_trend: { date: string; count: number }[]
  cached_at: string
}

export const createLead = (data: LeadCreate) =>
  api.post<Lead>('/leads', data).then(r => r.data)

export const getLeads = (params?: { skip?: number; limit?: number; status?: string }) =>
  api.get<{ total: number; items: Lead[] }>('/leads', { params }).then(r => r.data)

export const getAnalytics = () =>
  api.get<Analytics>('/analytics/dashboard').then(r => r.data)