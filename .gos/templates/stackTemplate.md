---
schema: gos.stack.v1
project: <nome>
generated_at: <iso>
read_only_backend: <true|false>
---

# Stack-of-record — <projeto>

> Este arquivo é a fonte canônica da stack. Todo plano (`plan-blueprint`) referencia este documento via `stack_ref`. Alterações aqui exigem ADR.

## 1. Framework & runtime
- Framework: <Next.js 15 / Vite / etc>
- Runtime: <Node 20 / Bun / Edge>
- Linguagem: <TypeScript / JavaScript>
- Build: <turbopack / webpack / vite>

## 2. UI / Design System
- Lib UI base: <shadcn / radix / mui>
- Design system path: <path>
- Tokens: <path ou descrição>
- Convenção de variants: <tailwind-variants / cva / cn>

## 3. Estado & dados
- Estado client: <zustand / jotai / context>
- Cache/data: <swr / react-query / server cache>
- Forms: <react-hook-form / formik>
- Validação: <zod / yup>

## 4. Auth
- Provider: <supabase-auth / clerk / next-auth>
- Estratégia: <session cookies / jwt>
- Middleware: <path>

## 5. Backend / DB
- DB: <supabase / postgres / mongo>
- ORM: <prisma / drizzle / supabase-js>
- Read-only?: <sim|não>
- Migrations: <permitidas|proibidas>

## 6. Padrões de fetching
- Server components: <quando usar>
- Server actions: <quando usar>
- Client + cache: <quando usar>
- Convenção de erro/loading: <descrever>

## 7. Convenções de pastas e rotas
- Rotas: <src/app/...>
- Componentes: <src/components/...>
- Hooks: <src/hooks/...>
- Helpers: <src/lib/...>

## 8. Fontes de conhecimento do projeto

> Listadas a partir de `knowledge_sources` em `.gos-local/plan-paths.json`.

| Tipo | Path | Resumo |
|------|------|--------|
| design-system | <path> | <resumo> |
| postman | <path> | <N coleções, M endpoints> |
| business-rules | <path> | <N módulos> |
| adr | <path> | <N ADRs ativas> |

## 9. Restrições
- <ex.: não introduzir nova lib sem ADR>
- <ex.: não alterar schema sem migration aprovada>
- <ex.: i18n é obrigatório em toda string visível>

## 10. Links internos
- README: <path>
- CLAUDE.md: <path>
- ADRs ativas: <lista>
