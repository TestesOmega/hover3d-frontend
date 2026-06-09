import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Trash2, MapPin, Clock, RefreshCw, Bell, Pencil, X } from 'lucide-react'
import { getEvents, createEvent, deleteEvent, getNotification, saveNotification, Event, EventCreate } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

const EMPTY: EventCreate = { title: '', date: '', time: '', location: '', description: '' }

export default function AgendaPanel() {
  const { session } = useAuth()
  const [events, setEvents]     = useState<Event[]>([])
  const [form, setForm]         = useState<EventCreate>(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  // notificações
  const [notifEmail, setNotifEmail]       = useState('')
  const [notifAccepted, setNotifAccepted] = useState(false)
  const [, setNotifLoaded]                = useState(false)
  const [editingNotif, setEditingNotif]   = useState(false)
  const [notifDraft, setNotifDraft]       = useState('')
  const [notifDraftOk, setNotifDraftOk]   = useState(false)
  const [savingNotif, setSavingNotif]     = useState(false)
  const [notifError, setNotifError]       = useState('')

  useEffect(() => { load(); loadNotif() }, [])

  async function load() {
    setLoading(true)
    try { setEvents(await getEvents()) }
    catch { setError('Não foi possível carregar os eventos. Verifique o backend.') }
    finally { setLoading(false) }
  }

  async function loadNotif() {
    try {
      const data = await getNotification()
      setNotifEmail(data.notification_email || '')
      setNotifAccepted(data.notification_accepted)
    } catch {
      // silencioso — mostra estado vazio
    } finally {
      setNotifLoaded(true)
    }
  }

  function openEditNotif() {
    setNotifDraft(notifEmail || session?.user?.email || '')
    setNotifDraftOk(notifAccepted)
    setNotifError('')
    setEditingNotif(true)
  }

  async function handleSaveNotif(e: React.FormEvent) {
    e.preventDefault()
    setNotifError('')
    if (!notifDraft) { setNotifError('Informe um e-mail.'); return }
    if (!notifDraftOk) { setNotifError('Marque o aceite para ativar as notificações.'); return }
    setSavingNotif(true)
    try {
      await saveNotification({ notification_email: notifDraft, notification_accepted: true })
      setNotifEmail(notifDraft)
      setNotifAccepted(true)
      setEditingNotif(false)
    } catch {
      setNotifError('Erro ao salvar. Tente novamente.')
    } finally {
      setSavingNotif(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.date || !form.time) return
    setSaving(true)
    try {
      const created = await createEvent(form)
      setEvents(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)))
      setForm(EMPTY)
      setShowForm(false)
    } catch { setError('Erro ao salvar evento.') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    try { await deleteEvent(id); setEvents(prev => prev.filter(e => e.id !== id)) }
    catch { setError('Erro ao excluir evento.') }
  }

  function formatDate(d: string) { const [y,m,v] = d.split('-'); return `${v}/${m}/${y}` }
  function formatTime(t: string) { return t.slice(0, 5) }

  function getDayLabel(dateStr: string): { label: string; color: string } | null {
    const today    = new Date(); today.setHours(0,0,0,0)
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const evDate   = new Date(dateStr + 'T00:00:00')
    if (evDate.getTime() === today.getTime())    return { label: 'Hoje',    color: '#8B5CF6' }
    if (evDate.getTime() === tomorrow.getTime()) return { label: 'Amanhã',  color: '#6D28D9' }
    if (evDate < today) return { label: 'Passado', color: '#4B4565' }
    return null
  }

  const upcomingEvents = events.filter(e => new Date(e.date + 'T00:00:00') >= new Date(new Date().setHours(0,0,0,0)))
  const pastEvents     = events.filter(e => new Date(e.date + 'T00:00:00') <  new Date(new Date().setHours(0,0,0,0)))

  return (
    <div style={styles.wrap}>

      {/* Cabeçalho */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            <CalendarDays size={22} style={{ marginRight: 10, verticalAlign: -4, color: 'var(--c-accent)' }} />
            Agenda
          </h2>
          <p style={styles.subtitle}>Cadastre seus eventos e receba alertas por e-mail no dia anterior e no dia do evento.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={styles.newBtn}>
          <Plus size={16} /> Novo evento
        </button>
      </div>

      {/* Barra de notificação */}
      {!editingNotif && (
        <div style={styles.notifBar}>
          <Bell size={14} style={{ color: notifEmail && notifAccepted ? '#a78bfa' : 'var(--c-text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: 'var(--c-text-muted)' }}>
            {notifEmail && notifAccepted
              ? <>E-mail cadastrado para notificações: <strong style={{ color: 'var(--c-text)' }}>{notifEmail}</strong></>
              : 'Nenhum e-mail de notificação cadastrado.'}
          </span>
          <button onClick={openEditNotif} style={styles.notifEditBtn}>
            <Pencil size={12} />
            {notifEmail && notifAccepted ? 'Alterar e-mail para notificações' : 'Cadastrar e-mail para notificações'}
          </button>
        </div>
      )}

      {/* Formulário de notificação */}
      {editingNotif && (
        <form onSubmit={handleSaveNotif} style={styles.notifForm}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={15} style={{ color: 'var(--c-accent)' }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Notificações por e-mail</span>
            </div>
            <button type="button" onClick={() => setEditingNotif(false)} style={styles.closeBtn}>
              <X size={15} />
            </button>
          </div>

          <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
            Você receberá alertas automáticos às <strong>4h da manhã</strong>: um aviso no dia anterior ao evento e outro no próprio dia.
          </p>

          <div style={styles.notifField}>
            <label style={styles.label}>E-mail para receber os avisos</label>
            <input
              type="email"
              style={styles.input}
              value={notifDraft}
              onChange={e => setNotifDraft(e.target.value)}
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>

          <label style={styles.checkRow}>
            <input
              type="checkbox"
              checked={notifDraftOk}
              onChange={e => setNotifDraftOk(e.target.checked)}
              style={{ accentColor: 'var(--c-accent)', width: 15, height: 15, flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: 'var(--c-text-muted)', lineHeight: 1.4 }}>
              Aceito receber notificações automáticas por e-mail sobre os eventos cadastrados.
            </span>
          </label>

          {notifError && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{notifError}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={savingNotif} style={styles.saveBtn}>
              {savingNotif ? <RefreshCw size={13} className="spin" /> : <Bell size={13} />}
              {savingNotif ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setEditingNotif(false)} style={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Formulário novo evento */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Novo evento</h3>
          <div style={styles.fieldRow}>
            <div style={{ ...styles.field, flex: 2 }}>
              <label style={styles.label}>Título *</label>
              <input style={styles.input} value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Atuação Barra Funda" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Data *</label>
              <input type="date" style={styles.input} value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Horário *</label>
              <input type="time" style={styles.input} value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
            </div>
          </div>
          <div style={styles.fieldRow}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Local</label>
              <input style={styles.input} value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Ex: Salão de festas do clube" />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Descrição</label>
              <input style={styles.input} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Observações opcionais" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? <RefreshCw size={14} className="spin" /> : <Plus size={14} />}
              {saving ? 'Salvando...' : 'Salvar evento'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY) }} style={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && (
        <div style={styles.errorBox}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 12, opacity: 0.7 }}>✕</button>
        </div>
      )}

      {loading && (
        <div style={styles.empty}>
          <RefreshCw size={28} className="spin" style={{ color: 'var(--c-accent)' }} />
          <p>Carregando eventos...</p>
        </div>
      )}

      {!loading && (
        <>
          {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
            <div style={styles.empty}>
              <CalendarDays size={36} strokeWidth={1.5} />
              <p style={styles.emptyTitle}>Nenhum evento cadastrado</p>
              <p style={styles.emptyDesc}>Clique em <strong>Novo evento</strong> para começar.</p>
            </div>
          ) : (
            <>
              {upcomingEvents.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionLabel}>Próximos eventos</div>
                  <div style={styles.grid}>
                    {upcomingEvents.map((ev, i) => (
                      <EventCard key={ev.id} ev={ev} index={i}
                        dayLabel={getDayLabel(ev.date)} onDelete={() => handleDelete(ev.id)}
                        formatDate={formatDate} formatTime={formatTime} />
                    ))}
                  </div>
                </div>
              )}
              {pastEvents.length > 0 && (
                <div style={styles.section}>
                  <div style={{ ...styles.sectionLabel, opacity: 0.5 }}>Eventos passados</div>
                  <div style={styles.grid}>
                    {pastEvents.map((ev, i) => (
                      <EventCard key={ev.id} ev={ev} index={i}
                        dayLabel={getDayLabel(ev.date)} onDelete={() => handleDelete(ev.id)}
                        formatDate={formatDate} formatTime={formatTime} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function EventCard({ ev, index, dayLabel, onDelete, formatDate, formatTime }: {
  ev: Event; index: number
  dayLabel: { label: string; color: string } | null
  onDelete: () => void
  formatDate: (d: string) => string
  formatTime: (t: string) => string
}) {
  return (
    <div className="fade-up" style={{ ...cardStyles.card, animationDelay: `${index * 0.05}s` }}>
      {dayLabel && <span style={{ ...cardStyles.badge, background: dayLabel.color }}>{dayLabel.label}</span>}
      <h3 style={cardStyles.title}>{ev.title}</h3>
      <div style={cardStyles.meta}>
        <span style={cardStyles.metaItem}><CalendarDays size={13} /> {formatDate(ev.date)}</span>
        <span style={cardStyles.metaItem}><Clock size={13} /> {formatTime(ev.time)}</span>
        {ev.location && <span style={cardStyles.metaItem}><MapPin size={13} /> {ev.location}</span>}
      </div>
      {ev.description && <p style={cardStyles.desc}>{ev.description}</p>}
      <div style={cardStyles.footer}>
        <div style={cardStyles.emailStatus}>
          <span style={{ ...cardStyles.dot, background: ev.email_sent_day_before ? '#22c55e' : '#4B4565' }} /> Aviso D-1
          <span style={{ ...cardStyles.dot, background: ev.email_sent_day_of ? '#22c55e' : '#4B4565', marginLeft: 10 }} /> Aviso D-0
        </div>
        <button onClick={onDelete} style={cardStyles.deleteBtn} title="Excluir evento"><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap:       { maxWidth: 1100, margin: '0 auto', padding: 32 },
  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 },
  title:      { fontSize: 26, fontWeight: 600, display: 'flex', alignItems: 'center' },
  subtitle:   { fontSize: 14, color: 'var(--c-text-muted)', marginTop: 6, maxWidth: 520 },
  newBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
    background: 'var(--c-accent)', color: '#fff', boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
  },
  notifBar: {
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
    padding: '11px 16px', borderRadius: 10, marginBottom: 20,
    background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)',
  },
  notifEditBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    marginLeft: 'auto', fontSize: 12.5, color: 'var(--c-accent)',
    fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
    padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(139,92,246,0.3)',
  },
  notifForm: {
    background: 'var(--c-bg-elevated)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 'var(--radius)', padding: 20, marginBottom: 20,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  notifField: { display: 'flex', flexDirection: 'column', gap: 6 },
  closeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 7, border: '1px solid var(--c-border)',
    color: 'var(--c-text-muted)',
  },
  checkRow: {
    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
    padding: '10px 12px', background: 'var(--c-bg-subtle)',
    borderRadius: 8, border: '1px solid var(--c-border)',
  },
  form: {
    background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)',
    borderRadius: 'var(--radius)', padding: 24, marginBottom: 28, boxShadow: 'var(--shadow-soft)',
  },
  formTitle: { fontSize: 16, fontWeight: 600, marginBottom: 18 },
  fieldRow:  { display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 },
  field:     { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 },
  label:     { fontSize: 11.5, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    padding: '10px 14px', borderRadius: 9, fontSize: 14,
    border: '1px solid var(--c-border)', background: 'var(--c-bg-subtle)',
    outline: 'none', color: 'var(--c-text)', transition: 'border var(--transition)',
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '11px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600,
    background: 'var(--c-accent)', color: '#fff',
  },
  cancelBtn: {
    padding: '11px 18px', borderRadius: 9, fontSize: 14,
    border: '1px solid var(--c-border)', color: 'var(--c-text-muted)',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 9, marginBottom: 20,
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171', fontSize: 13.5,
  },
  section:      { marginBottom: 32 },
  sectionLabel: { fontSize: 11.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--c-text-muted)', marginBottom: 14 },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', gap: 10, padding: '80px 30px',
    border: '1px dashed var(--c-border)', borderRadius: 'var(--radius)', color: 'var(--c-text-muted)',
  },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--c-text)', marginTop: 4 },
  emptyDesc:  { fontSize: 13.5, maxWidth: 260, lineHeight: 1.5 },
}

const cardStyles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)',
    borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-soft)',
    position: 'relative', display: 'flex', flexDirection: 'column', gap: 8,
  },
  badge:    { display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 20, color: '#fff', alignSelf: 'flex-start' },
  title:    { fontSize: 15.5, fontWeight: 600, color: 'var(--c-text)', lineHeight: 1.3 },
  meta:     { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 2 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--c-text-muted)' },
  desc:     { fontSize: 13, color: 'var(--c-text-muted)', lineHeight: 1.5 },
  footer:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--c-border)' },
  emailStatus: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--c-text-muted)' },
  dot:      { width: 7, height: 7, borderRadius: '50%', display: 'inline-block' },
  deleteBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid var(--c-border)', color: 'var(--c-text-muted)', transition: 'all var(--transition)',
  },
}
