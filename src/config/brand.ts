// ============================================================
//  HOVER3D — Configuração de Marca (Brand Config)
// ============================================================
//  ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR
//  para transformar o app na identidade de outro cliente.
//
//  Troque cores, nome, logo e dados do negócio aqui e
//  o app inteiro se adapta automaticamente.
// ============================================================

export interface BrandConfig {
  // Identidade
  appName: string          // Nome que aparece no topo
  tagline: string          // Frase curta abaixo do nome
  badge: string            // Selo (ex: "Prototype", "Beta")

  // Empresa cliente
  company: {
    name: string           // Nome da empresa
    segment: string        // Segmento (ex: "Personagens vivos e eventos")
    region: string         // Região de atuação
    foundedYearsAgo?: number
  }

  // Cores — tema claro
  light: ThemePalette
  // Cores — tema escuro
  dark: ThemePalette

  // Tipografia
  fonts: {
    display: string        // Fonte de títulos
    body: string           // Fonte de corpo
  }
}

export interface ThemePalette {
  bg: string               // Fundo principal
  bgElevated: string       // Fundo de cards
  bgSubtle: string         // Fundo sutil (hover, inputs)
  text: string             // Texto principal
  textMuted: string        // Texto secundário
  border: string           // Bordas
  accent: string           // Cor de destaque (dourado)
  accentSoft: string       // Destaque suave
  accentText: string       // Texto sobre o destaque
}

// ============================================================
//  CONFIGURAÇÃO ATUAL — ARTEMIS / HOVER3D
// ============================================================

export const BRAND: BrandConfig = {
  appName: 'Hover3D',
  tagline: 'Gerador inteligente de posts',
  badge: 'Prototype',

  company: {
    name: 'Artemis',
    segment: 'Personagens vivos e cerimoniais',
    region: 'Região',
    foundedYearsAgo: undefined,
  },

  fonts: {
    display: "'Space Grotesk', system-ui, sans-serif",
    body: "'Outfit', system-ui, sans-serif",
  },

  light: {
    bg:         '#FAF9FF',
    bgElevated: '#FFFFFF',
    bgSubtle:   '#F3F0FF',
    text:       '#1A1530',
    textMuted:  '#6B6480',
    border:     '#E2DCF5',
    accent:     '#7C3AED',
    accentSoft: '#EDE9FF',
    accentText: '#FFFFFF',
  },

  dark: {
    bg:         '#0D0B14',
    bgElevated: '#13101E',
    bgSubtle:   '#1C1829',
    text:       '#EDE9FF',
    textMuted:  '#8B82A8',
    border:     '#2A2240',
    accent:     '#8B5CF6',
    accentSoft: '#2D1B69',
    accentText: '#FFFFFF',
  },
}
