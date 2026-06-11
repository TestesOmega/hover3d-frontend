import { useState, useEffect, useCallback } from 'react'
import { LogOut, Copy, Check, RefreshCw } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../lib/AuthContext'
import { createPayment, fetchProfile, PaymentData } from '../lib/api'

export default function PaymentGate({ onActivated }: { onActivated: () => void }) {
  const { signOut } = useAuth()
  const [payment, setPayment]   = useState<PaymentData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(false)
  const [polling, setPolling]   = useState(false)

  // Gera o PIX ao montar
  useEffect(() => {
    createPayment()
      .then(setPayment)
      .catch(() => setError('Erro ao gerar cobrança. Tente recarregar a página.'))
      .finally(() => setLoading(false))
  }, [])

  // Polling a cada 5s para detectar pagamento confirmado
  const checkPayment = useCallback(async () => {
    try {
      const profile = await fetchProfile()
      if (profile.ativo) onActivated()
    } catch {}
  }, [onActivated])

  useEffect(() => {
    if (!payment) return
    setPolling(true)
    const interval = setInterval(checkPayment, 5000)
    return () => { clearInterval(interval); setPolling(false) }
  }, [payment, checkPayment])

  function copyCode() {
    if (!payment) return
    navigator.clipboard.writeText(payment.copy_paste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const valor = payment ? `R$ ${(payment.amount / 100).toFixed(2).replace('.', ',')}` : 'R$ 29,00'

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>
            <span style={styles.logoH}>H</span>
          </div>
          <span style={styles.appName}>Hover3D</span>
        </div>

        <div style={styles.statusBadge}>Aguardando pagamento</div>

        <h2 style={styles.title}>Ative sua conta</h2>
        <p style={styles.desc}>
          Pague via PIX abaixo. Após a confirmação, o acesso é liberado automaticamente em segundos.
        </p>

        {loading && (
          <div style={styles.loadingWrap}>
            <RefreshCw size={28} className="spin" style={{ color: 'var(--c-accent)' }} />
            <p style={{ fontSize: 14, color: 'var(--c-text-muted)', marginTop: 12 }}>Gerando cobrança...</p>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {payment && !loading && (
          <>
            {/* QR Code */}
            <div style={styles.qrWrap}>
              <QRCodeSVG
                value={payment.qr_code}
                size={180}
                bgColor="transparent"
                fgColor="#EDE9FF"
                level="M"
              />
            </div>

            {/* Copia e cola */}
            <div style={styles.pixBox}>
              <div style={styles.pixHeader}>
                <span style={styles.pixLabel}>PIX copia e cola</span>
                <span style={styles.pixValue}>{valor}/mês</span>
              </div>
              <div style={styles.pixKeyRow}>
                <span style={styles.pixKey}>{payment.copy_paste.slice(0, 40)}...</span>
                <button onClick={copyCode} style={styles.copyBtn}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Status de polling */}
            <div style={styles.waitingRow}>
              <RefreshCw size={13} className={polling ? 'spin' : ''} style={{ color: 'var(--c-text-muted)' }} />
              <span style={{ fontSize: 12.5, color: 'var(--c-text-muted)' }}>
                Aguardando confirmação do pagamento...
              </span>
            </div>
          </>
        )}

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
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0' },
  errorBox: {
    padding: '14px 18px', borderRadius: 10, fontSize: 13.5,
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171', marginBottom: 16, width: '100%',
  },
  qrWrap: {
    background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)',
    borderRadius: 14, padding: 18, marginBottom: 16,
  },
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
    fontFamily: 'monospace', fontSize: 12, color: 'var(--c-text)',
    textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
