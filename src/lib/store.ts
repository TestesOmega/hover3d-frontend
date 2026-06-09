// ============================================================
//  HOVER3D — Store de estado local (sem dependências externas)
//  Persiste em memória + localStorage para histórico/favoritos.
//  Créditos ficam em memória (regra de negócio do plano).
// ============================================================

import { GeneratedPost } from './templateEngine'

const LS_HISTORY = 'hover3d_history'
const LS_FAVORITES = 'hover3d_favorites'

// ── Histórico ────────────────────────────────────────────────
export function loadHistory(): GeneratedPost[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveToHistory(post: GeneratedPost) {
  const history = loadHistory()
  history.unshift(post)
  // mantém os últimos 100
  const trimmed = history.slice(0, 100)
  try { localStorage.setItem(LS_HISTORY, JSON.stringify(trimmed)) } catch {}
}

export function clearHistory() {
  try { localStorage.removeItem(LS_HISTORY) } catch {}
}

// ── Favoritos ────────────────────────────────────────────────
export function loadFavorites(): GeneratedPost[] {
  try {
    const raw = localStorage.getItem(LS_FAVORITES)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function toggleFavorite(post: GeneratedPost): GeneratedPost[] {
  const favs = loadFavorites()
  const exists = favs.find(f => f.id === post.id)
  let updated: GeneratedPost[]
  if (exists) {
    updated = favs.filter(f => f.id !== post.id)
  } else {
    updated = [post, ...favs]
  }
  try { localStorage.setItem(LS_FAVORITES, JSON.stringify(updated)) } catch {}
  return updated
}

export function isFavorite(id: string): boolean {
  return loadFavorites().some(f => f.id === id)
}

// ── Detecção de duplicatas (não repetir post igual) ──────────
export function isDuplicate(text: string): boolean {
  return loadHistory().some(p => p.text === text)
}
