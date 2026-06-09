// ============================================================
//  HOVER3D — Dados do Negócio (Business Data)
// ============================================================
//  Configure aqui os personagens, serviços e opções
//  específicas do cliente. Tudo que o gerador usa vem daqui.
// ============================================================

export interface Character {
  id: string
  name: string
  emoji: string
}

export interface Service {
  id: string
  name: string
  description: string
}

export interface PostCategory {
  id: string
  name: string
  emoji: string
  description: string
}

export interface ToneOption {
  id: string
  name: string
  description: string
}

// ── Personagens disponíveis ──────────────────────────────────
export const CHARACTERS: Character[] = [
  { id: 'tamborzinho', name: 'Tamborzinho',  emoji: '🐰' },
  { id: 'olaf',        name: 'Olaf',          emoji: '⛄' },
  { id: 'aguia',       name: 'Águia Escolar', emoji: '🦅' },
  { id: 'custom',      name: 'Outro personagem', emoji: '🎭' },
]

// ── Serviços oferecidos ──────────────────────────────────────
export const SERVICES: Service[] = [
  { id: 'locacao',     name: 'Locação',       description: 'Aluguel do personagem para o evento' },
  { id: 'ator',        name: 'Com ator',      description: 'Personagem interpretado por profissional' },
  { id: 'fabricacao',  name: 'Fabricação',    description: 'Criação de personagem personalizado' },
]

// ── Categorias de post ───────────────────────────────────────
export const CATEGORIES: PostCategory[] = [
  { id: 'promocional', name: 'Promocional', emoji: '🎉', description: 'Divulgar serviço e gerar orçamentos' },
  { id: 'bastidor',    name: 'Bastidores',  emoji: '🎬', description: 'Mostrar a fabricação e o processo' },
  { id: 'depoimento',  name: 'Depoimento',  emoji: '⭐', description: 'Prova social de clientes' },
  { id: 'engajamento', name: 'Engajamento', emoji: '💬', description: 'Enquetes e perguntas ao público' },
  { id: 'datas',       name: 'Datas especiais', emoji: '📅', description: 'Aproveitar datas comemorativas' },
]

// ── Ocasiões / eventos ───────────────────────────────────────
export const OCCASIONS = [
  'festa infantil',
  'evento corporativo',
  'ação em escola',
  'inauguração de loja',
  'aniversário',
  'evento promocional',
]

// ── Tom de voz ───────────────────────────────────────────────
export const TONES: ToneOption[] = [
  { id: 'animado',     name: 'Animado',     description: 'Empolgante e cheio de energia' },
  { id: 'elegante',    name: 'Elegante',    description: 'Sofisticado e refinado' },
  { id: 'afetuoso',    name: 'Afetuoso',    description: 'Caloroso e emocional' },
  { id: 'direto',      name: 'Direto',      description: 'Objetivo e comercial' },
]

// ── Dias da semana ───────────────────────────────────────────
export const WEEKDAYS = [
  { id: 'seg', name: 'Segunda', short: 'SEG' },
  { id: 'ter', name: 'Terça',   short: 'TER' },
  { id: 'qua', name: 'Quarta',  short: 'QUA' },
  { id: 'qui', name: 'Quinta',  short: 'QUI' },
  { id: 'sex', name: 'Sexta',   short: 'SEX' },
  { id: 'sab', name: 'Sábado',  short: 'SÁB' },
  { id: 'dom', name: 'Domingo', short: 'DOM' },
]
