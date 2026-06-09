import { useState } from 'react'
import { Copy, Check, Heart, Hash } from 'lucide-react'
import { GeneratedPost } from '../lib/templateEngine'
import { toggleFavorite, isFavorite } from '../lib/store'

interface PostCardProps {
  post: GeneratedPost
  index?: number
  dayLabel?: string
}

export default function PostCard({ post, index = 0, dayLabel }: PostCardProps) {
  const [copied, setCopied] = useState(false)
  const [fav, setFav] = useState(() => isFavorite(post.id))

  const fullText = post.text + '\n\n' + post.hashtags.join(' ')

  function handleCopy() {
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleFav() {
    toggleFavorite(post)
    setFav(f => !f)
  }

  return (
    <div className="fade-up" style={{ ...styles.card, animationDelay: `${index * 0.06}s` }}>
      {dayLabel && <div style={styles.dayTag}>{dayLabel}</div>}

      {/* Preview estilo Instagram */}
      <div style={styles.preview}>
        <div style={styles.igHeader}>
          <div style={styles.igAvatar} />
          <div style={styles.igName}>seu_perfil</div>
        </div>
        <p style={styles.text}>{post.text}</p>
        <div style={styles.hashtags}>
          {post.hashtags.map(h => (
            <span key={h} style={styles.hashtag}>
              <Hash size={10} style={{ marginRight: 1 }} />
              {h.replace('#', '')}
            </span>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div style={styles.actions}>
        <button onClick={handleCopy} style={{ ...styles.actionBtn, ...styles.copyBtn }}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copiado!' : 'Copiar post'}
        </button>
        <button
          onClick={handleFav}
          style={{ ...styles.actionBtn, ...(fav ? styles.favActive : {}) }}
          title={fav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        >
          <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--c-bg-elevated)',
    border: '1px solid var(--c-border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-soft)',
    position: 'relative',
  },
  dayTag: {
    position: 'absolute', top: 12, right: 12, zIndex: 2,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
    padding: '4px 9px', borderRadius: 6,
    background: 'var(--c-accent)', color: 'var(--c-accent-text)',
  },
  preview: { padding: 18 },
  igHeader: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 },
  igAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--c-accent), var(--c-accent-soft))',
  },
  igName: { fontSize: 13, fontWeight: 600 },
  text: {
    fontSize: 14.5, lineHeight: 1.6, whiteSpace: 'pre-wrap',
    color: 'var(--c-text)',
  },
  hashtags: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14 },
  hashtag: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: 11.5, color: 'var(--c-accent)',
    background: 'var(--c-accent-soft)', padding: '3px 8px', borderRadius: 6,
    fontWeight: 500,
  },
  actions: {
    display: 'flex', gap: 8, padding: 14,
    borderTop: '1px solid var(--c-border)',
    background: 'var(--c-bg-subtle)',
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '10px 14px', borderRadius: 9, fontSize: 13.5, fontWeight: 500,
    border: '1px solid var(--c-border)', color: 'var(--c-text-muted)',
    transition: 'all var(--transition)', background: 'var(--c-bg-elevated)',
  },
  copyBtn: { flex: 1, color: 'var(--c-text)' },
  favActive: { color: '#C0492F', borderColor: '#F0C9C0', background: '#FBE4E0' },
}
