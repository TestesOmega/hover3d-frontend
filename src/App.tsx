import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header, { Tab } from './components/Header'
import GeneratePanel from './components/GeneratePanel'
import WeekPlanner from './components/WeekPlanner'
import HistoryPanel from './components/HistoryPanel'
import AgendaPanel from './components/AgendaPanel'
import { LoginPage } from './components/LoginPage'
import PaymentGate from './components/PaymentGate'
import { useAuth } from './lib/AuthContext'
import { fetchProfile, Profile } from './lib/api'

// ── Configuração de plano (regra de negócio) ─────────────────
const AI_ENABLED    = false
const MAX_CREDITS   = 580   // ~R$29/mês com margem de 80% usando Haiku
const PAYMENT_GATE  = false // ← true para ativar cobrança

export default function App() {
  const { session, loading } = useAuth()
  const [tab, setTab]         = useState<Tab>('gerar')
  const [credits, setCredits] = useState(MAX_CREDITS)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (!session || !PAYMENT_GATE) return
    setProfileLoading(true)
    fetchProfile()
      .then(setProfile)
      .catch(() => setProfile({ ativo: true, plano: 'basico', vencimento: null }))
      .finally(() => setProfileLoading(false))
  }, [session])

  if (loading || profileLoading) return null
  if (!session) return <LoginPage />
  if (PAYMENT_GATE && profile && !profile.ativo) return <PaymentGate />

  function consumeCredit(): boolean {
    if (credits <= 0) return false
    setCredits(c => c - 1)
    return true
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        tab={tab}
        onTabChange={setTab}
        credits={credits}
        maxCredits={MAX_CREDITS}
        aiEnabled={AI_ENABLED}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {tab === 'gerar' && (
            <GeneratePanel aiEnabled={AI_ENABLED} onConsumeCredit={consumeCredit} />
          )}
          {tab === 'semana' && (
            <WeekPlanner aiEnabled={AI_ENABLED} onConsumeCredit={consumeCredit} />
          )}
          {tab === 'historico' && <HistoryPanel />}
          {tab === 'agenda'    && <AgendaPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
