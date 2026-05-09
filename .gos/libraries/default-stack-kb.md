# Default Stack KB — G-OS canonical (2026-05)

> Stack default proposto pelo `gos-master` quando o usuario nao especifica. Sempre confirmado via `adr-tech-decisions` antes de chumbar.

## Principios

1. **TypeScript everywhere** — front, back, scripts. Nunca JS puro em codigo de app.
2. **Free tier first** — MVP descartavel cabe 100% no free de Cloudflare + Supabase.
3. **Zero servidor proprio** — Workers Pages + Supabase substituem Express+VPS.
4. **Anti-vendor-lock** — Postgres standard (Supabase) e Workers (Hono) sao portaveis.

## Stack canonico

### Frontend

```
- Vite + React 18 + TypeScript (strict)
- TanStack Query (data fetching, cache, mutations, optimistic UI)
- TanStack Router (type-safe routing, loaders, search params tipados)
- Tailwind CSS v4 + shadcn/ui (Radix primitives + cn() helper)
- Lucide React (UNICA lib de icones — zero emojis em codigo)
- React Hook Form + Zod (validacao schema-first)
- Sonner (toasts)
```

### Backend

```
- Cloudflare Workers (Hono framework opcional para routing)
- Cloudflare Pages Functions (alternativa lightweight para API routes simples)
- Supabase Postgres (DB principal — preferido sobre D1 quando precisa JOIN/RLS)
- Supabase Auth (OAuth + magic link — substitui Auth.js/Clerk)
- Supabase Realtime (WebSocket via Postgres logical replication)
- Supabase Storage (blob storage com transformacoes de imagem)
```

### Hosting

```
- Frontend: Cloudflare Pages (deploy via git push)
- Backend: Cloudflare Workers (mesmo dominio, prefixo /api/*)
- DNS: Cloudflare (proxy on, SSL auto)
```

### Tooling

```
- pnpm (workspace para monorepo, usar npm em projeto unico)
- Wrangler CLI (deploy + dev local Workers)
- Supabase CLI (migrations + tipos gerados)
- Biome OU ESLint+Prettier (preferencia: Biome — mais rapido, zero config)
```

## Quando NAO usar este stack

| Caso | Stack alternativo | Motivo |
|------|-------------------|--------|
| SSR pesado / SEO crítico | Next.js + Vercel | Workers Pages serve SPA — para SSR usar Next |
| Backoffice + ETL pesado | Node em VPS + Postgres dedicado | Workers tem limite 30s |
| App mobile nativo | Expo + React Native | Mas API pode continuar Workers+Supabase |
| Realtime massivo (>1k conn) | Supabase Realtime > Cloudflare DO | Postgres-based escala melhor pra MVP |

## Setup rapido (script mental)

1. `npm create vite@latest <projeto> -- --template react-ts`
2. `cd <projeto> && npm i`
3. `npx shadcn@latest init` (escolher Tailwind v4, slate base)
4. `npm i @tanstack/react-query @tanstack/react-router lucide-react react-hook-form @hookform/resolvers zod sonner`
5. `npm i @supabase/supabase-js`
6. `npm i -D wrangler`
7. Configurar `wrangler.toml` apontando para Pages
8. `wrangler pages deploy dist` (apos primeiro build)

## Decisoes embutidas (nao precisa perguntar)

- React vs Vue/Svelte -> React (ecossistema + hiring + LLM training data).
- TanStack Query vs SWR -> TanStack (cache mais granular, devtools).
- TanStack Router vs React Router -> TanStack (type-safe, search params tipados).
- Tailwind v3 vs v4 -> v4 (CSS-first, lightning CSS).
- Lucide vs Heroicons vs FontAwesome -> Lucide (mais variantes, tree-shake melhor).
- Supabase Auth vs Clerk vs Auth.js -> Supabase (mesmo provider do DB = RLS integrado).
- Magic link vs password -> magic link first (UX superior, sem reset password fluxo).

## Decisoes que DEVEM perguntar (regra do dono)

- D1 vs Supabase Postgres (depende de complexidade do schema)
- Workers DO vs Supabase Realtime (chat ad-hoc vs notif baseada em DB)
- Monorepo (turborepo) vs single repo (depende de N apps)
- Analytics (PostHog vs Plausible vs nada)
- Error tracking (Sentry vs nada vs Cloudflare Logs)

## Output policy do master

`gos-master`, ao iniciar conversa de novo projeto, SEMPRE oferece este stack como ponto de partida. Frase tipica:

> "Para o MVP descartavel/continuo, o default que recomendo e Vite+React+TS, TanStack Query/Router, Tailwind v4 + shadcn/ui, Lucide React (icones), hospedado em Cloudflare Pages com Workers no /api e Supabase como DB+Auth+Realtime+Storage. Prefere alguma alternativa ou seguimos com isso e vamos refinando?"

Decisoes sao validadas em `adr-tech-decisions` (skill SEMPRE pergunta antes de chumbar).
