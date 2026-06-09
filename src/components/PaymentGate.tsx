import { useState } from 'react'
import { LogOut, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../lib/AuthContext'

// ← Edite antes de ativar para clientes
const PIX_KEY   = '27d491f1-f3c0-4c51-8984-a9355cb57489'
const PIX_VALUE = 'R$ 99,00/mês'
const PIX_NAME  = 'Hover3D'
const PIX_CITY  = 'Brasil'
const WHATSAPP  = ''              // ex: '11999999999'

// ── Gerador de payload Pix (EMV / BR Code) ────────────────────
function crc16(str: string): number {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xFFFF
    }
  }
  return crc
}

function buildPixPayload(key: string, name: string, city: string): string {
  const f = (id: string, val: string) => id + val.length.toString().padStart(2, '0') + val
  const merchantAccount = f('00', 'br.gov.bcb.pix') + f('01', key)
  const body =
    f('00', '01') +
    f('26', merchantAccount) +
    f('52', '0000') +
    f('53', '986') +
    f('58', 'BR') +
    f('59', name.substring(0, 25)) +
    f('60', city.substring(0, 15)) +
    f('62', f('05', '***')) +
    '6304'
  return body + crc16(body).toString(16).toUpperCase().padStart(4, '0')
}

export default function PaymentGate() {
  const { signOut } = useAuth()
  const [copied, setCopied] = useState(false)

  function copyKey() {
    navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>
            <span style={styles.logoH}>H</span>
          </div>
          <span style={styles.appName}>{PIX_NAME}</span>
        </div>

        {/* Status */}
        <div style={styles.statusBadge}>Aguardando ativação</div>

        <h2 style={styles.title}>Sua conta ainda não foi ativada</h2>
        <p style={styles.desc}>
          Realize o pagamento via Pix abaixo e aguarde a confirmação.
          Sua conta será ativada manualmente em até 24 horas.
        </p>

        {/* QR Code */}
        <div style={styles.qrWrap}>
          <QRCodeSVG
            value={buildPixPayload(PIX_KEY, PIX_NAME, PIX_CITY)}
            size={180}
            bgColor="transparent"
            fgColor="#EDE9FF"
            level="M"
          />
        </div>

        {/* Pix box */}
        <div style={styles.pixBox}>
          <div style={styles.pixHeader}>
            <span style={styles.pixLabel}>Chave Pix (copia e cola)</span>
            <span style={styles.pixValue}>{PIX_VALUE}</span>
          </div>
          <div style={styles.pixKeyRow}>
            <span style={styles.pixKey}>{PIX_KEY}</span>
            <button onClick={copyKey} style={styles.copyBtn}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Contato */}
        {WHATSAPP && (
          <a
            href={`https://wa.me/55${WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            style={styles.waBtn}
          >
            Falar no WhatsApp
          </a>
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
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoMark: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, var(--c-accent), #6D28D9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoH: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: '#fff' },
  appName: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 },
  statusBadge: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    padding: '4px 12px', borderRadius: 20,
    background: 'rgba(234,179,8,0.15)', color: '#CA8A04',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
    margin: '0 0 10px', color: 'var(--c-text)',
  },
  desc: { fontSize: 14, color: 'var(--c-text-muted)', lineHeight: 1.6, margin: '0 0 28px' },
  qrWrap: {
    background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)',
    borderRadius: 14, padding: 18, marginBottom: 16,
  },
  pixBox: {
    width: '100%', background: 'var(--c-bg-subtle)',
    border: '1px solid var(--c-border)', borderRadius: 12,
    padding: '18px 20px', marginBottom: 20,
  },
  pixHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  pixLabel: { fontSize: 12, color: 'var(--c-text-muted)', fontWeight: 500 },
  pixValue: { fontSize: 13, fontWeight: 700, color: 'var(--c-accent)' },
  pixKeyRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pixKey: {
    fontFamily: 'monospace', fontSize: 14, color: 'var(--c-text)',
    wordBreak: 'break-all', textAlign: 'left',
  },
  copyBtn: {
    display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
    padding: '7px 13px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: 'var(--c-accent)', color: '#fff',
    transition: 'opacity 0.15s',
  },
  waBtn: {
    display: 'block', width: '100%', textAlign: 'center',
    padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600,
    background: '#25D366', color: '#fff', marginBottom: 12,
    textDecoration: 'none',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
    fontSize: 13, color: 'var(--c-text-muted)', padding: '8px 14px',
    borderRadius: 8, border: '1px solid var(--c-border)',
  },
}
