# Hover3D — Gerador de Posts (Protótipo)

App para gerar posts de Instagram para empresas de personagens/eventos.

## Como rodar

```
npm install
npm run dev
```
Abre em http://localhost:5173

## Como funciona

- **Modo Templates (atual):** gera posts grátis, sem custo, sem internet
- **Modo IA (futuro):** quando ativar, gera posts únicos via Claude API

## Personalizar para outro cliente

Edite só 2 arquivos:
- `src/config/brand.ts` — nome, cores, logo, tema
- `src/data/business.ts` — personagens, serviços, categorias

## Ativar a IA depois

1. Veja o `backend/README.md`
2. Mude `AI_ENABLED = true` no `src/App.tsx`

## Telas

- **Gerar** — cria um post personalizado
- **Semana** — gera 7 posts de uma vez (1 pra cada dia)
- **Histórico** — posts gerados + favoritos
