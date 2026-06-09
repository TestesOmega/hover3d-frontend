// ============================================================
//  HOVER3D — Motor de Templates (modo grátis, sem IA)
// ============================================================
//  Gera posts combinando templates pré-escritos com os dados
//  selecionados. Variação aleatória evita repetição.
// ============================================================

import { BRAND } from '../config/brand'

export interface PostInput {
  characterName: string
  serviceName:   string
  serviceId:     string
  categoryId:    string
  occasion:      string
  toneId:        string
  companyName?:  string
  region?:       string
}

export interface GeneratedPost {
  id:        string
  text:      string
  hashtags:  string[]
  category:  string
  createdAt: string
  source:    'template' | 'ai'
}

// ── Banco de hashtags por contexto ───────────────────────────
const HASHTAG_BANK: Record<string, string[]> = {
  base:        ['#PersonagensVivos', '#Eventos', '#FestaInfantil', '#AnimacaoDeFestas'],
  promocional: ['#Orcamento', '#FestaDosSonhos', '#EventoEspecial', '#DiversaoGarantida'],
  bastidor:    ['#FeitoAMao', '#Artesanato', '#Bastidores', '#ProcessoCriativo'],
  depoimento:  ['#ClientesFelizes', '#Recomendado', '#Avaliacao', '#Confianca'],
  engajamento: ['#Interacao', '#QualPersonagem', '#Enquete', '#ParticipeJunto'],
  datas:       ['#DataEspecial', '#Comemoracao', '#MomentosMagicos'],
  fabricacao:  ['#PersonagemPersonalizado', '#SobMedida', '#Exclusivo'],
}

function pickHashtags(categoryId: string, serviceId: string): string[] {
  const tags = new Set<string>()
  HASHTAG_BANK.base.slice(0, 2).forEach(t => tags.add(t))
  ;(HASHTAG_BANK[categoryId] ?? []).slice(0, 3).forEach(t => tags.add(t))
  if (serviceId === 'fabricacao') HASHTAG_BANK.fabricacao.forEach(t => tags.add(t))
  return Array.from(tags).slice(0, 6)
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Templates por categoria ──────────────────────────────────
// {C} = personagem, {S} = serviço, {O} = ocasião, {E} = empresa, {R} = região

const TEMPLATES: Record<string, string[]> = {
  promocional: [
    `✨ {O} merece um toque de magia!\n\nO {C} está disponível e vai transformar o seu evento em um momento inesquecível. 🎉\n\nChame a {E} e garanta a presença do personagem favorito da criançada!\n\n📍 Atendemos em toda a {R}\n📲 Orçamento sem compromisso no Direct`,

    `🎭 Quem aí quer o {C} em {O}?\n\nNa {E} a gente realiza sonhos! Diversão garantida do início ao fim, com qualidade que faz a diferença.\n\n👉 Reserve já a sua data\n📲 Fale com a gente agora`,

    `O segredo de um {O} inesquecível? 🤔\n\nUm personagem que encanta de verdade! O {C} chega pra deixar tudo mais especial. ✨\n\n{E} — porque cada detalhe importa.\n📲 Solicite seu orçamento`,
  ],

  bastidor: [
    `🎬 Bastidores da {E}!\n\nVocê já imaginou quanto trabalho existe por trás de um personagem como o {C}? Cada detalhe é pensado com carinho e feito à mão. 🧵✨\n\nQualidade que você só encontra aqui.\n📲 Quer um personagem exclusivo? Chama no Direct`,

    `Da espuma ao encanto. 🎨\n\nAssim nasce o {C} aqui na {E}! Horas de dedicação pra entregar um personagem impecável pro seu evento.\n\n🏭 Fabricamos personalizados também!\n📲 Fale com a gente`,

    `✋ Feito à mão, com paixão.\n\nO processo de criação do {C} é pura arte. Na {E}, cada personagem é único — assim como o seu evento vai ser. ✨\n📲 Encomende o seu`,
  ],

  depoimento: [
    `⭐⭐⭐⭐⭐\n\n"A presença do {C} foi o destaque de {O}! As crianças amaram e o atendimento da {E} foi impecável."\n\nÉ por momentos assim que a gente faz o que faz! 💛\n📲 Faça como nossos clientes — chame no Direct`,

    `Nada como a alegria de um cliente satisfeito! 💛\n\nO {C} marcou presença e fez o {O} virar memória pra vida toda. Obrigado pela confiança! 🙏\n\n{E} — realizando sonhos de verdade.\n📲 Solicite seu orçamento`,
  ],

  engajamento: [
    `🤔 ENQUETE!\n\nSe você fosse contratar um personagem para {O}, qual seria?\n\n🐰 {C}\n🎭 Outro personagem\n\nComenta aqui embaixo! 👇\n\nE se quiser ver a magia de perto, a {E} tá aqui pra ajudar. 📲`,

    `Responde rápido! 💬\n\nQual o personagem favorito da criançada aí na sua casa?\n\nO {C} costuma ser campeão de pedidos aqui na {E}! 🏆\n\nConta pra gente nos comentários 👇`,
  ],

  datas: [
    `📅 Data especial chegando!\n\nQue tal tornar o seu {O} ainda mais especial com a presença do {C}? ✨\n\nNa {E}, cada comemoração vira um momento único.\n📲 Garanta sua data antes que esgote!`,

    `Toda comemoração merece ser inesquecível! 🎉\n\nO {C} deixa qualquer {O} com aquele toque especial. Na {E} a gente cuida de tudo pra você. 💛\n📲 Reserve agora`,
  ],
}

// Ajuste de tom (prefixos/sufixos sutis)
const TONE_TWEAKS: Record<string, (s: string) => string> = {
  animado:  s => s,
  elegante: s => s.replace(/!+/g, '.').replace(/🎉|🤩/g, '✨'),
  afetuoso: s => s,
  direto:   s => s.split('\n\n').slice(0, 2).join('\n\n'),
}

export function createAIPost(text: string, input: PostInput): GeneratedPost {
  return {
    id:        crypto.randomUUID(),
    text,
    hashtags:  pickHashtags(input.categoryId, input.serviceId),
    category:  input.categoryId,
    createdAt: new Date().toISOString(),
    source:    'ai',
  }
}

export function generateTemplatePost(input: PostInput): GeneratedPost {
  const pool = TEMPLATES[input.categoryId] ?? TEMPLATES.promocional
  let text = rand(pool)

  const companyName = input.companyName?.trim() || BRAND.company.name
  const region      = input.region?.trim()      || BRAND.company.region

  text = text
    .replaceAll('{C}', input.characterName)
    .replaceAll('{S}', input.serviceName)
    .replaceAll('{O}', input.occasion)
    .replaceAll('{E}', companyName)
    .replaceAll('{R}', region)

  const tweak = TONE_TWEAKS[input.toneId]
  if (tweak) text = tweak(text)

  return {
    id:        crypto.randomUUID(),
    text,
    hashtags:  pickHashtags(input.categoryId, input.serviceId),
    category:  input.categoryId,
    createdAt: new Date().toISOString(),
    source:    'template',
  }
}
