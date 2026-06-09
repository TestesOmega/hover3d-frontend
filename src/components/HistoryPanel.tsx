import { useState, useEffect } from 'react'
import { History, Heart, Trash2 } from 'lucide-react'
import { GeneratedPost } from '../lib/templateEngine'
import { loadHistory, loadFavorites, clearHistory } from '../lib/store'
import PostCard from './PostCard'

type View = 'historico' | 'favoritos'

export default function HistoryPanel() {
  const [view, setView] = useState<View>('historico')
  const [history, setHistory] = useState<GeneratedPost[]>([])
  const [favorites, setFavorites] = useState<GeneratedPost[]>([])

  useEffect(() => {
    setHistory(loadHistory())
    setFavorites(loadFavorites())
  }, [])

  function handleClear() {
    clearHistory()
    setHistory([])
  }

  const items = view === 'historico' ? history : favorites

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <div style={styles.tabs}>
          <button onClick={() => setView('historico')}
            style={{ ...styles.tab, ...(view === 'historico' ? styles.tabActive : {}) }}>
            <History size={16} /> Histórico
            <span style={styles.count}>{history.length}</span>
          </button>
          <button onClick={() => setView('favoritos')}
            style={{ ...styles.tab, ...(view === 'favoritos' ? styles.tabActive : {}) }}>
            <Heart size={16} /> Favoritos
            <span style={styles.count}>{favorites.length}</span>
          </button>
        </div>

        {view === 'historico' && history.length > 0 && (
          <button onClick={handleClear} style={styles.clearBtn}>
            <Trash2 size={14} /> Limpar histórico
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div style={styles.grid}>
          {items.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          {view === 'historico' ? <History size={32} strokeWidth={1.5} /> : <Heart size={32} strokeWidth={1.5} />}
          <p style={styles.emptyTitle}>
            {view === 'historico' ? 'Nenhum post gerado ainda' : 'Nenhum favorito salvo'}
          </p>
          <p style={styles.emptyDesc}>
            {view === 'historico'
              ? 'Os posts que você gerar aparecem aqui automaticamente.'
              : 'Toque no coração de um post para salvá-lo aqui.'}
          </p>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 1200, margin: '0 auto', padding: 32 },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  tabs: { display: 'flex', gap: 4, background: 'var(--c-bg-subtle)', padding: 4, borderRadius: 11 },
  tab: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
    borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--c-text-muted)',
    transition: 'all var(--transition)',
  },
  tabActive: { background: 'var(--c-bg-elevated)', color: 'var(--c-text)', boxShadow: 'var(--shadow-soft)' },
  count: {
    fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
    background: 'var(--c-accent-soft)', color: 'var(--c-accent)',
  },
  clearBtn: {
    display: 'flex', alignItems: 'center', gap: 7, fontSize: 13,
    color: 'var(--c-text-muted)', padding: '9px 14px', borderRadius: 8,
    border: '1px solid var(--c-border)',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', gap: 8,
    padding: '80px 30px', borderRadius: 'var(--radius)',
    border: '1px dashed var(--c-border)', color: 'var(--c-text-muted)',
  },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--c-text)', marginTop: 6 },
  emptyDesc: { fontSize: 13.5, maxWidth: 300, lineHeight: 1.5 },
}
