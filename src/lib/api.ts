const BACKEND_URL = 'https://hover3d-backend.onrender.com'

// ── IA ───────────────────────────────────────────────────────

export interface GeneratePayload {
  character: string
  service:   string
  category:  string
  occasion:  string
  tone:      string
}

export async function generateWithAI(payload: GeneratePayload): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(err.detail ?? 'Erro na geração')
  }
  const data = await res.json()
  return data.text as string
}

// ── Eventos ──────────────────────────────────────────────────

export interface Event {
  id:                    string
  title:                 string
  date:                  string
  time:                  string
  location:              string
  description:           string
  email_sent_day_before: boolean
  email_sent_day_of:     boolean
  created_at:            string
}

export type EventCreate = Pick<Event, 'title' | 'date' | 'time' | 'location' | 'description'>

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BACKEND_URL}${path}`, init)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(err.detail ?? 'Erro na requisição')
  }
  if (res.status === 204) return null
  return res.json()
}

export const getEvents  = ():                Promise<Event[]> => apiFetch('/api/events')
export const deleteEvent = (id: string):     Promise<null>    => apiFetch(`/api/events/${id}`, { method: 'DELETE' })
export const createEvent = (ev: EventCreate): Promise<Event>  => apiFetch('/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(ev),
})
