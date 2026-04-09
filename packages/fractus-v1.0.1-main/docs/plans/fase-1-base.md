# Fase 1 — Base + Padronização

> **Período:** 15/03 - 03/04
> **Objetivo:** Fundação técnica — projeto scaffoldado, design system configurado, schema do banco, Storybook.

## Entregáveis

### Backend (Douglas)
- [ ] Schema SQL completo (15 tabelas, 5 enums) — converter Prisma → SQL nativo
- [ ] Migrations via `supabase migration new`
- [ ] Seed data para desenvolvimento
- [ ] RLS Policies básicas (gestor full access, participante restrito)
- [ ] Validações Zod em `lib/validations/` (programa, participante, template)

### Frontend (Adriano)
- [ ] Scaffold Next.js App Router (`pnpm create next-app`)
- [ ] Configurar Supabase Client SDK + `@supabase/ssr`
- [ ] Configurar Tailwind CSS v4 com tokens do DS (cores, tipografia, spacing)
- [ ] Mulish font via `next/font/google`
- [ ] Instalar 34 primitivos shadcn/ui via CLI
- [ ] Criar 12 compostos customizados (StatusBadge, StatCard, etc.)
- [ ] Setup Storybook + stories para cada composto
- [ ] Page Shells: MainLayout, Sidebar (288px/101px), Header

### Compartilhado
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Vitest + React Testing Library
- [ ] Setup `.env.local` com variáveis Supabase
- [ ] Configurar Supabase MCP Server para AI Coders
- [ ] Deploy preview na Vercel funcionando

## Dependências
- Figma DS finalizado (tokens de cor, tipografia) — **DONE**
- PRD e business rules documentados — **DONE**
- Acesso ao projeto Supabase — **DONE**

## Critérios de aceite
- `pnpm build` passa sem erros
- Storybook roda com todos os compostos documentados
- Schema deployado no Supabase com seed data
- Deploy preview na Vercel acessível

## Referências
- `docs/prompts/start-projeto.md` — Setup passos 1-10
- `docs/fractus/spec-desenvolvimento.md` seção 2.2 (schema)
- `docs/fractus/sprint-track-backend.md` — S03-S04
- `docs/fractus/sprint-track-frontend.md` — S03-S04
