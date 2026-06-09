import { useState } from 'react'
import { CalendarDays, Wand2, RefreshCw } from 'lucide-react'
import { CHARACTERS, SERVICES, CATEGORIES, OCCASIONS, WEEKDAYS } from '../data/business'
import { generateTemplatePost, createAIPost, GeneratedPost } from '../lib/templateEngine'
import { generateWithAI } from '../lib/api'
import { saveToHistory } from '../lib/store'
import PostCard from './PostCard'

// Plano editorial: cada dia da semana tem uma categoria sugerida
const WEEK_PLAN: { day: string; categoryId: string }[] = [
  { day: 'seg', categoryId: 'promocional' },
  { day: 'ter', categoryId: 'bastidor' },
  { day: 'qua', categoryId: 'engajamento' },
  { day: 'qui', categoryId: 'depoimento' },
  { day: 'sex', categoryId: 'promocional' },
  { day: 'sab', categoryId: 'bastidor' },
  { day: 'dom', categoryId: 'datas' },
]

interface WeekPlannerProps {
  aiEnabled: boolean
  onConsumeCredit: () => boolean
}

export default function WeekPlanner({ aiEnabled, onConsumeCredit }: WeekPlannerProps) {
  const [character, setCharacter] = useState(CHARACTERS[0].id)
  const [service, setService]     = useState(SERVICES[0].id)
  const [posts, setPosts]         = useState<{ day: string; post: GeneratedPost }[]>([])
  const [generating, setGenerating] = useState(false)

  async function handleGenerateWeek() {
    setGenerating(true)

    const charObj = CHARACTERS.find(c => c.id === character)!
    const svcObj  = SERVICES.find(s => s.id === service)!

    if (aiEnabled) {
      for (let i = 0; i < 7; i++) {
        if (!onConsumeCredit()) { setGenerating(false); return }
      }
      try {
        const results = await Promise.all(
          WEEK_PLAN.map(({ day, categoryId }) => {
            const occasion = OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)]
            const input = {
              characterName: charObj.name,
              serviceName:   svcObj.name,
              serviceId:     service,
              categoryId,
              occasion,
              toneId:        'animado',
            }
            return generateWithAI({
              character: charObj.name,
              service:   svcObj.name,
              category:  categoryId,
              occasion,
              tone:      'animado',
            }).then(text => {
              const post = createAIPost(text, input)
              saveToHistory(post)
              return { day, post }
            })
          })
        )
        setPosts(results)
        setGenerating(false)
        return
      } catch {
        // backend indisponível — cai no template
      }
    }

    await new Promise(r => setTimeout(r, 600))

    const generated = WEEK_PLAN.map(({ day, categoryId }) => {
      const occasion = OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)]
      const post = generateTemplatePost({
        characterName: charObj.name,
        serviceName:   svcObj.name,
        serviceId:     service,
        categoryId,
        occasion,
        toneId:        'animado',
      })
      saveToHistory(post)
      return { day, post }
    })

    setPosts(generated)
    setGenerating(false)
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.controls}>
        <div style={styles.controlsLeft}>
          <h2 style={styles.title}>
            <CalendarDays size={22} style={{ marginRight: 9, verticalAlign: -4 }} />
            Planejador semanal
          </h2>
          <p style={styles.subtitle}>
            Gera 7 posts de uma vez, um para cada dia — já com a estratégia ideal de conteúdo.
          </p>
        </div>
      </div>

      {/* Seleção rápida */}
      <div style={styles.quickSelect}>
        <div style={styles.selectGroup}>
          <label style={styles.label}>Personagem</label>
          <div style={styles.chipRow}>
            {CHARACTERS.filter(c => c.id !== 'custom').map(c => (
              <button key={c.id} onClick={() => setCharacter(c.id)}
                style={{ ...styles.chip, ...(character === c.id ? styles.chipActive : {}) }}>
                <span style={{ marginRight: 5 }}>{c.emoji}</span>{c.name}
              </button>
            ))}
          </div>
        </div>
        <div style={styles.selectGroup}>
          <label style={styles.label}>Serviço</label>
          <div style={styles.chipRow}>
            {SERVICES.map(s => (
              <button key={s.id} onClick={() => setService(s.id)}
                style={{ ...styles.chip, ...(service === s.id ? styles.chipActive : {}) }}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleGenerateWeek} disabled={generating} style={styles.genBtn}>
          {generating ? <RefreshCw size={16} className="spin" /> : <Wand2 size={16} />}
          {generating ? 'Gerando semana...' : 'Gerar semana completa'}
        </button>
      </div>

      {/* Grade de posts */}
      {posts.length > 0 && (
        <div style={styles.grid}>
          {posts.map(({ day, post }, i) => {
            const wd = WEEKDAYS.find(w => w.id === day)!
            const cat = CATEGORIES.find(c => c.id === post.category)
            return (
              <div key={post.id} style={styles.dayColumn}>
                <div style={styles.dayHead}>
                  <span style={styles.dayName}>{wd.name}</span>
                  {cat && <span style={styles.dayCat}>{cat.emoji} {cat.name}</span>}
                </div>
                <PostCard post={post} index={i} />
              </div>
            )
          })}
        </div>
      )}

      {posts.length === 0 && (
        <div style={styles.empty}>
          <CalendarDays size={32} strokeWidth={1.5} />
          <p style={styles.emptyTitle}>Sua semana de conteúdo</p>
          <p style={styles.emptyDesc}>
            Escolha personagem e serviço, depois gere 7 posts prontos de uma vez.
          </p>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 1200, margin: '0 auto', padding: 32 },
  controls: { marginBottom: 24 },
  controlsLeft: {},
  title: { fontSize: 26, fontWeight: 500 },
  subtitle: { fontSize: 14, color: 'var(--c-text-muted)', marginTop: 6 },
  quickSelect: {
    display: 'flex', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap',
    padding: 22, borderRadius: 'var(--radius)',
    border: '1px solid var(--c-border)', background: 'var(--c-bg-elevated)',
    boxShadow: 'var(--shadow-soft)', marginBottom: 30,
  },
  selectGroup: { display: 'flex', flexDirection: 'column', gap: 9 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: {
    padding: '8px 14px', borderRadius: 9, fontSize: 13.5,
    border: '1px solid var(--c-border)', color: 'var(--c-text-muted)',
    transition: 'all var(--transition)', background: 'var(--c-bg-elevated)',
  },
  chipActive: {
    borderColor: 'var(--c-accent)', color: 'var(--c-text)',
    background: 'var(--c-accent-soft)', fontWeight: 500,
  },
  genBtn: {
    display: 'flex', alignItems: 'center', gap: 9, marginLeft: 'auto',
    padding: '14px 24px', borderRadius: 11, fontSize: 15, fontWeight: 600,
    background: 'var(--c-accent)', color: 'var(--c-accent-text)',
    boxShadow: '0 4px 14px rgba(184,146,61,0.3)',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  dayColumn: { display: 'flex', flexDirection: 'column', gap: 10 },
  dayHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' },
  dayName: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 },
  dayCat: { fontSize: 11.5, color: 'var(--c-text-muted)' },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', gap: 8,
    padding: '80px 30px', borderRadius: 'var(--radius)',
    border: '1px dashed var(--c-border)', color: 'var(--c-text-muted)',
  },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--c-text)', marginTop: 6 },
  emptyDesc: { fontSize: 13.5, maxWidth: 300, lineHeight: 1.5 },
}
