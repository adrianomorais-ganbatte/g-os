# ADR-001: Next.js App Router como framework fullstack

**Status:** Aceita
**Data:** 2026-03-08
**Decisores:** Time Fractus

## Contexto

O Fractus precisa de um framework fullstack para servir a plataforma de gestão (painel gestor, formulários públicos, dashboards de impacto). O protótipo existente usa Vite + React Router, mas não tem SSR, API routes nem integração nativa com auth.

## Decisão

Usar **Next.js App Router** (React 19, TypeScript) como framework fullstack.

## Alternativas consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| Vite + React Router (manter protótipo) | Zero migração, time já conhece | Sem SSR, sem API routes, sem middleware nativo, precisa de backend separado |
| Remix | SSR nativo, loader/action pattern | Menor ecossistema, deploy mais complexo, shadcn/ui menos testado |
| Next.js Pages Router | Estável, muito material | API antiga, sem Server Components, sem streaming |
| **Next.js App Router** | Server Components, Route Handlers, Middleware, streaming, deploy Vercel nativo | Curva de aprendizado Server/Client Components |

## Consequências

### Positivas
- Server Components por padrão — menos JS no client, melhor performance
- Route Handlers substituem backend separado — fullstack no mesmo repo
- Middleware nativo para auth guards em `(platform)/`
- Deploy zero-config na Vercel com preview por PR
- Integração nativa com Supabase via `@supabase/ssr`

### Negativas
- Migração do protótipo Vite requer reescrita de rotas e data fetching
- Distinção Server/Client Component exige disciplina (diretiva `"use client"`)
- Debugging de Server Components é menos maduro que Client Components

### Riscos
- Dev junior pode confundir Server/Client boundaries → mitigar com regra clara: só marca `"use client"` quando precisa de hooks, event handlers ou browser APIs

## Referências
- Protótipo existente: `packages/fractus/figma-make/mod-gestao/`
- Spec: `docs/fractus/spec-desenvolvimento.md` seção 2.1
