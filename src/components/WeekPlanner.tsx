import { useState } from 'react'
import { CalendarDays, Wand2, RefreshCw } from 'lucide-react'
import { CATEGORIES, OCCASIONS, WEEKDAYS } from '../data/business'
import { generateTemplatePost, createAIPost, GeneratedPost } from '../lib/templateEngine'
import { generateWithAI } from '../lib/api'
import { saveToHistory } from '../lib/store'
import PostCard from './PostCard'

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
  const [character, setCharacter]   = useState('')
  const [service, setService]       = useState('')
  const [company, setCompany]       = useState('')
  const [posts, setPosts]           = useState<{ day: string; post: GeneratedPost }[]>([])
  const [generating, setGenerating] = useState(false)

  async function handleGenerateWeek() {
    if (!character.trim()) return
    setGenerating(true)

    const charName    = character.trim()
    const svcName     = service.trim() || 'serviço'
    const companyName = company.trim() || undefined

    if (aiEnabled) {
      if (!window.confirm('Gerar a semana completa com IA vai consumir 7 créditos. Continuar?')) {
        setGenerating(false)
        return
      }
      for (let i = 0; i < 7; i++) {
        if (!onConsumeCredit()) { setGenerating(false); return }
      }
      try {
        const results = await Promise.all(
          WEEK_PLAN.map(({ day, categoryId }) => {
            const occasion = OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)]
            const input = { characterName: charName, serviceName: svcName, serviceId: 'locacao', categoryId, occasion, toneId: 'animado', companyName }
            return generateWithAI({ character: charName, service: svcName, category: categoryId, occasion, tone: 'animado', company: companyName })
              .then(text => {
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
      const post = generateTemplatePost({ characterName: charName, serviceName: svcName, serviceId: 'locacao', categoryId, occasion, toneId: 'animado', companyName })
      saveToHistory(post)
      return { day, post }
    })

    setPosts(generated)
    setGenerating(false)
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.controls}>
        <h2 style={styles.title}>
          <CalendarDays size={22} style={{ marginRight: 9, verticalAlign: -4 }} />
          Planejador semanal
        </h2>
        <p style={styles.subtitle}>
          Gera 7 posts de uma vez, um para cada dia — já com a estratégia ideal de conteúdo.
        </p>
      </div>

      <div style={styles.quickSelect}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Personagem ou produto *</label>
          <input
            style={styles.input}
            value={character}
            onChange={e => setCharacter(e.target.value)}
            placeholder="Ex: Homem-Aranha, Elsa, Produto X..."
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nome da empresa</label>
          <input
            style={styles.input}
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Ex: Festas Mágicas, Locação Star..."
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Serviço ou segmento</label>
          <input
            style={styles.input}
            value={service}
            onChange={e => setService(e.target.value)}
            placeholder="Ex: Locação, Fabricação, Festa infantil..."
          />
        </div>
        <button onClick={handleGenerateWeek} disabled={generating || !character.trim()} style={{
          ...styles.genBtn,
          opacity: !character.trim() ? 0.5 : 1,
          cursor: !character.trim() ? 'not-allowed' : 'pointer',
        }}>
          {generating ? <RefreshCw size={16} className="spin" /> : <Wand2 size={16} />}
          {generating ? 'Gerando semana...' : 'Gerar semana completa'}
        </button>
      </div>

      {posts.length > 0 && (
        <div style={styles.grid}>
          {posts.map(({ day, post }, i) => {
            const wd  = WEEKDAYS.find(w => w.id === day)!
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
          <p style={styles.emptyDesc}>Preencha o personagem ou produto e gere 7 posts prontos de uma vez.</p>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap:      { maxWidth: 1200, margin: '0 auto', padding: 32 },
  controls:  { marginBottom: 24 },
  title:     { fontSize: 26, fontWeight: 500 },
  subtitle:  { fontSize: 14, color: 'var(--c-text-muted)', marginTop: 6 },
  quickSelect: {
    display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap',
    padding: 22, borderRadius: 'var(--radius)',
    border: '1px solid var(--c-border)', background: 'var(--c-bg-elevated)',
    boxShadow: 'var(--shadow-soft)', marginBottom: 30,
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 7, flex: 1, minWidth: 200 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    padding: '10px 14px', borderRadius: 9, fontSize: 14,
    border: '1px solid var(--c-border)', background: 'var(--c-bg-subtle)',
    outline: 'none', color: 'var(--c-text)', transition: 'border var(--transition)',
  },
  genBtn: {
    display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0,
    padding: '14px 24px', borderRadius: 11, fontSize: 15, fontWeight: 600,
    background: 'var(--c-accent)', color: 'var(--c-accent-text)',
    boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  dayColumn: { display: 'flex', flexDirection: 'column', gap: 10 },
  dayHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' },
  dayName: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 },
  dayCat:  { fontSize: 11.5, color: 'var(--c-text-muted)' },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', gap: 8,
    padding: '80px 30px', borderRadius: 'var(--radius)',
    border: '1px dashed var(--c-border)', color: 'var(--c-text-muted)',
  },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--c-text)', marginTop: 6 },
  emptyDesc:  { fontSize: 13.5, maxWidth: 300, lineHeight: 1.5 },
}
