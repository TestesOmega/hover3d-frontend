import { useState, useEffect, useCallback } from 'react'
import { LogOut, Copy, Check, RefreshCw } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchProfile } from '../lib/api'

const PIX_KEY = 'b21e9b2b-9fdd-42ab-90a3-209088ea368b'
const VALOR   = 'R$ 30,00'
const CONTATO = 'admhospitalconchas@gmail.com'

export default function PaymentGate({ onActivated }: { onActivated: () => void }) {
  const { signOut } = useAuth()
  const [copied,  setCopied]  = useState(false)
  const [polling, setPolling] = useState(false)

  // Poll a cada 5s — quando admin ativar a conta no Supabase, usuário entra automaticamente
  const checkActivation = useCallback(async () => {
    try {
      const profile = await fetchProfile()
      if (profile.ativo) onActivated()
    } catch {}
  }, [onActivated])

  useEffect(() => {
    setPolling(true)
    const interval = setInterval(checkActivation, 5000)
    return () => { clearInterval(interval); setPolling(false) }
  }, [checkActivation])

  function copyKey() {
    navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>
            <span style={styles.logoH}>H</span>
          </div>
          <span style={styles.appName}>Hover3D</span>
        </div>

        <div style={styles.statusBadge}>Aguardando pagamento</div>

        <h2 style={styles.title}>Ative sua conta</h2>
        <p style={styles.desc}>
          Pague <strong>{VALOR}/mês</strong> via PIX usando a chave abaixo. Após o pagamento, envie
          o comprovante para <strong>{CONTATO}</strong> e sua conta será ativada em breve.
        </p>

        <div style={styles.pixBox}>
          <div style={styles.pixHeader}>
            <span style={styles.pixLabel}>Chave PIX (aleatória)</span>
            <span style={styles.pixValue}>{VALOR}/mês</span>
          </div>
          <div style={styles.pixKeyRow}>
            <span style={styles.pixKey}>{PIX_KEY}</span>
            <button onClick={copyKey} style={styles.copyBtn}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <div style={styles.waitingRow}>
          <RefreshCw size={13} className={polling ? 'spin' : ''} style={{ color: 'var(--c-text-muted)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--c-text-muted)' }}>
            Aguardando ativação da conta...
          </span>
        </div>

        <button onClick={signOut} style={styles.logoutBtn}>
          <LogOut size={14} />
          Sair da conta
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--c-bg)', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 440,
    background: 'var(--c-bg-elevated)', borderRadius: 16,
    border: '1px solid var(--c-border)', padding: '40px 36px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
  },
  logoRow:  { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoMark: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, var(--c-accent), #6D28D9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoH:    { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: '#fff' },
  appName:  { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 },
  statusBadge: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    padding: '4px 12px', borderRadius: 20,
    background: 'rgba(234,179,8,0.15)', color: '#CA8A04', marginBottom: 20,
  },
  title:   { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 10px' },
  desc:    { fontSize: 14, color: 'var(--c-text-muted)', lineHeight: 1.6, margin: '0 0 24px' },
  pixBox: {
    width: '100%', background: 'var(--c-bg-subtle)',
    border: '1px solid var(--c-border)', borderRadius: 12,
    padding: '18px 20px', marginBottom: 14,
  },
  pixHeader:  { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  pixLabel:   { fontSize: 12, color: 'var(--c-text-muted)', fontWeight: 500 },
  pixValue:   { fontSize: 13, fontWeight: 700, color: 'var(--c-accent)' },
  pixKeyRow:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pixKey: {
    fontFamily: 'monospace', fontSize: 11, color: 'var(--c-text)',
    textAlign: 'left', wordBreak: 'break-all',
  },
  copyBtn: {
    display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
    padding: '7px 13px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: 'var(--c-accent)', color: '#fff',
  },
  waitingRow: {
    display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20,
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
    fontSize: 13, color: 'var(--c-text-muted)', padding: '8px 14px',
    borderRadius: 8, border: '1px solid var(--c-border)',
  },
}
