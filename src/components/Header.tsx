import { Sparkles, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { BRAND } from '../config/brand'

export type Tab = 'gerar' | 'semana' | 'historico' | 'agenda'

interface HeaderProps {
  tab: Tab
  onTabChange: (t: Tab) => void
  credits: number
  maxCredits: number
  aiEnabled: boolean
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'gerar',     label: 'Gerar' },
  { id: 'semana',    label: 'Semana' },
  { id: 'historico', label: 'Histórico' },
  { id: 'agenda',    label: 'Agenda' },
]

export default function Header({ tab, onTabChange, credits, maxCredits, aiEnabled }: HeaderProps) {
  const { signOut } = useAuth()
  const lowCredits = aiEnabled && credits <= maxCredits * 0.15

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.brand}>
        <div style={styles.logoMark}>
          <span style={styles.logoH}>H</span>
        </div>
        <div>
          <div style={styles.brandRow}>
            <h1 style={styles.brandName}>{BRAND.appName}</h1>
            <span style={styles.badge}>{BRAND.badge}</span>
          </div>
          <p style={styles.tagline}>{BRAND.tagline}</p>
        </div>
      </div>

      {/* Navegação */}
      <nav style={styles.nav}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              ...styles.navBtn,
              ...(tab === t.id ? styles.navBtnActive : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Direita: créditos + tema */}
      <div style={styles.right}>
        {aiEnabled && (
          <div style={{ ...styles.credits, ...(lowCredits ? styles.creditsLow : {}) }}>
            <Sparkles size={13} />
            <span style={styles.creditsNum}>{credits}</span>
            <span style={styles.creditsLabel}>créditos</span>
          </div>
        )}
        <button onClick={signOut} style={styles.themeBtn} title="Sair">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '18px 32px',
    borderBottom: '1px solid var(--c-border)',
    background: 'var(--c-bg-elevated)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 13, flexShrink: 0 },
  logoMark: {
    width: 42, height: 42, borderRadius: 11,
    background: 'linear-gradient(135deg, var(--c-accent), #9A7A30)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(184,146,61,0.3)',
  },
  logoH: {
    fontFamily: 'var(--font-display)',
    fontSize: 24, fontWeight: 600, color: '#fff',
    lineHeight: 1,
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 8 },
  brandName: { fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em' },
  badge: {
    fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '3px 7px', borderRadius: 5,
    background: 'var(--c-accent-soft)', color: 'var(--c-accent)',
  },
  tagline: { fontSize: 12, color: 'var(--c-text-muted)', marginTop: 1 },
  nav: {
    display: 'flex', gap: 4, marginLeft: 'auto',
    background: 'var(--c-bg-subtle)', padding: 4, borderRadius: 10,
  },
  navBtn: {
    padding: '8px 18px', borderRadius: 7, fontSize: 14, fontWeight: 500,
    color: 'var(--c-text-muted)', transition: 'all var(--transition)',
  },
  navBtnActive: {
    background: 'var(--c-bg-elevated)', color: 'var(--c-text)',
    boxShadow: 'var(--shadow-soft)',
  },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  credits: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 13px', borderRadius: 9,
    background: 'var(--c-accent-soft)', color: 'var(--c-accent)',
    fontSize: 13, fontWeight: 500,
  },
  creditsLow: { background: '#FBE4E0', color: '#C0492F' },
  creditsNum: { fontWeight: 700 },
  creditsLabel: { opacity: 0.8 },
  themeBtn: {
    width: 38, height: 38, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--c-border)', color: 'var(--c-text-muted)',
    transition: 'all var(--transition)',
  },
}
