import { useState } from 'react'
import { Wand2, RefreshCw } from 'lucide-react'
import { SERVICES, CATEGORIES, OCCASIONS, TONES } from '../data/business'
import { generateTemplatePost, createAIPost, GeneratedPost, PostInput } from '../lib/templateEngine'
import { generateWithAI } from '../lib/api'
import { saveToHistory, isDuplicate } from '../lib/store'
import PostCard from './PostCard'

interface GeneratePanelProps {
  aiEnabled: boolean
  onConsumeCredit: () => boolean   // retorna false se sem créditos
}

export default function GeneratePanel({ aiEnabled, onConsumeCredit }: GeneratePanelProps) {
  const [characterName, setCharacterName] = useState('')
  const [service, setService]     = useState(SERVICES[0].id)
  const [category, setCategory]   = useState(CATEGORIES[0].id)
  const [occasion, setOccasion]   = useState(OCCASIONS[0])
  const [tone, setTone]           = useState(TONES[0].id)
  const [useAI, setUseAI]         = useState(false)
  const [result, setResult]       = useState<GeneratedPost | null>(null)
  const [generating, setGenerating] = useState(false)

  function buildInput(): PostInput {
    const svcObj = SERVICES.find(s => s.id === service)!
    return {
      characterName: characterName.trim() || 'Personagem',
      serviceName:   svcObj.name,
      serviceId:     service,
      categoryId:    category,
      occasion,
      toneId:        tone,
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    const input = buildInput()

    // Modo IA: chama o backend
    if (useAI && aiEnabled) {
      const ok = onConsumeCredit()
      if (!ok) { setGenerating(false); return }
      try {
        const text = await generateWithAI({
          character: input.characterName,
          service:   input.serviceName,
          category:  input.categoryId,
          occasion:  input.occasion,
          tone:      input.toneId,
        })
        const post = createAIPost(text, input)
        saveToHistory(post)
        setResult(post)
        setGenerating(false)
        return
      } catch {
        // backend indisponível — cai no template
      }
    }

    // Pequeno delay para a animação
    await new Promise(r => setTimeout(r, 350))

    let post = generateTemplatePost(input)
    // Evita repetir post idêntico (tenta de novo até 4x)
    let tries = 0
    while (isDuplicate(post.text) && tries < 4) {
      post = generateTemplatePost(input)
      tries++
    }

    saveToHistory(post)
    setResult(post)
    setGenerating(false)
  }

  return (
    <div style={styles.wrap}>
      {/* Coluna do formulário */}
      <div style={styles.form}>
        <SectionTitle n="01" title="Personagem ou Produto" />
        <input
          value={characterName}
          onChange={e => setCharacterName(e.target.value)}
          placeholder="Insira o nome do personagem ou produto..."
          style={styles.input}
        />

        <SectionTitle n="02" title="Serviço" />
        <div style={styles.chipRow}>
          {SERVICES.map(s => (
            <Chip key={s.id} active={service === s.id} onClick={() => setService(s.id)}>
              {s.name}
            </Chip>
          ))}
        </div>

        <SectionTitle n="03" title="Tipo de post" />
        <div style={styles.chipRow}>
          {CATEGORIES.map(c => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              <span style={{ marginRight: 6 }}>{c.emoji}</span>{c.name}
            </Chip>
          ))}
        </div>

        <SectionTitle n="04" title="Ocasião" />
        <div style={styles.chipRow}>
          {OCCASIONS.map(o => (
            <Chip key={o} active={occasion === o} onClick={() => setOccasion(o)}>
              {o}
            </Chip>
          ))}
        </div>

        <SectionTitle n="05" title="Tom de voz" />
        <div style={styles.chipRow}>
          {TONES.map(t => (
            <Chip key={t.id} active={tone === t.id} onClick={() => setTone(t.id)}>
              {t.name}
            </Chip>
          ))}
        </div>

        {/* Toggle IA */}
        {aiEnabled && (
          <div style={styles.aiToggle}>
            <div>
              <div style={styles.aiTitle}>✨ Geração com IA</div>
              <div style={styles.aiDesc}>Posts únicos e mais criativos (consome 1 crédito)</div>
            </div>
            <button
              onClick={() => setUseAI(v => !v)}
              style={{ ...styles.switch, ...(useAI ? styles.switchOn : {}) }}
            >
              <span style={{ ...styles.switchDot, ...(useAI ? styles.switchDotOn : {}) }} />
            </button>
          </div>
        )}

        <button onClick={handleGenerate} disabled={generating} style={styles.generateBtn}>
          {generating ? <RefreshCw size={17} className="spin" /> : <Wand2 size={17} />}
          {generating ? 'Gerando...' : 'Gerar post'}
        </button>
      </div>

      {/* Coluna do resultado */}
      <div style={styles.resultCol}>
        {result ? (
          <>
            <div style={styles.resultHeader}>
              <span style={styles.resultLabel}>Resultado</span>
              <button onClick={handleGenerate} style={styles.regenBtn}>
                <RefreshCw size={13} /> Gerar outro
              </button>
            </div>
            <PostCard post={result} />
          </>
        ) : (
          <div style={styles.empty}>
            <Wand2 size={32} strokeWidth={1.5} />
            <p style={styles.emptyTitle}>Seu post aparece aqui</p>
            <p style={styles.emptyDesc}>
              Escolha as opções ao lado e clique em <strong>Gerar post</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div style={styles.sectionTitle}>
      <span style={styles.sectionNum}>{n}</span>
      <span>{title}</span>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}>
      {children}
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
    maxWidth: 1100, margin: '0 auto', padding: '32px',
    alignItems: 'start',
  },
  form: { display: 'flex', flexDirection: 'column' },
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: 9,
    fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500,
    marginTop: 22, marginBottom: 11,
  },
  sectionNum: {
    fontSize: 10.5, fontWeight: 700, color: 'var(--c-accent)',
    letterSpacing: '0.05em', fontFamily: 'var(--font-body)',
  },
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
  input: {
    marginTop: 9, padding: '11px 14px', borderRadius: 9,
    border: '1px solid var(--c-border)', background: 'var(--c-bg-elevated)',
    fontSize: 14, outline: 'none', width: '100%',
  },
  aiToggle: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 26, padding: 16, borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--c-border)', background: 'var(--c-bg-subtle)',
  },
  aiTitle: { fontSize: 14, fontWeight: 600 },
  aiDesc: { fontSize: 12, color: 'var(--c-text-muted)', marginTop: 2 },
  switch: {
    width: 46, height: 26, borderRadius: 13, background: 'var(--c-border)',
    position: 'relative', transition: 'background var(--transition)', flexShrink: 0,
  },
  switchOn: { background: 'var(--c-accent)' },
  switchDot: {
    position: 'absolute', top: 3, left: 3, width: 20, height: 20,
    borderRadius: '50%', background: '#fff', transition: 'transform var(--transition)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  switchDotOn: { transform: 'translateX(20px)' },
  generateBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    marginTop: 28, padding: '15px', borderRadius: 11, fontSize: 15.5, fontWeight: 600,
    background: 'var(--c-accent)', color: 'var(--c-accent-text)',
    transition: 'all var(--transition)', boxShadow: '0 4px 14px rgba(184,146,61,0.3)',
  },
  resultCol: { position: 'sticky', top: 100 },
  resultHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultLabel: {
    fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500,
  },
  regenBtn: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
    color: 'var(--c-text-muted)', padding: '7px 12px', borderRadius: 8,
    border: '1px solid var(--c-border)',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', gap: 8,
    padding: '70px 30px', borderRadius: 'var(--radius)',
    border: '1px dashed var(--c-border)', color: 'var(--c-text-muted)',
    minHeight: 340,
  },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--c-text)', marginTop: 6 },
  emptyDesc: { fontSize: 13.5, maxWidth: 240, lineHeight: 1.5 },
}
