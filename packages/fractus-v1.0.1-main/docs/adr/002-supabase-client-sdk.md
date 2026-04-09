# ADR-002: Supabase Client SDK ao invés de Prisma ORM

**Status:** Aceita
**Data:** 2026-03-24
**Decisores:** Time Fractus
**Substitui:** Decisão original de usar Prisma ORM (spec v1)

## Contexto

A spec v1 definia Prisma ORM como acesso ao banco. Durante o setup, identificou-se que o Supabase Client SDK oferece integração mais direta com Auth e RLS, eliminando uma camada de abstração.

## Decisão

Usar **Supabase Client SDK** (`@supabase/supabase-js` + `@supabase/ssr`) como acesso principal ao banco. Não usar Prisma no MVP.

## Alternativas consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| Prisma ORM | Type safety forte, migrations declarativas, ecossistema maduro | Camada extra sobre Supabase, conflito com RLS (Prisma bypassa RLS por padrão), duplicação de tipos |
| **Supabase Client SDK** | Integração nativa com Auth/RLS, tipos gerados via CLI, zero config adicional | Joins complexos requerem views ou RPC, menos type safety que Prisma |
| Drizzle ORM | Leve, SQL-like, bom com Supabase | Menor ecossistema, curva de aprendizado extra sem benefício claro |

## Consequências

### Positivas
- RLS funciona automaticamente — queries respeitam o perfil do usuário logado
- Tipos gerados via `supabase gen types typescript` — source of truth é o banco
- Menos dependências — sem Prisma client, sem Prisma engine
- Migrations via SQL nativo (`supabase migration new`) — mais controle

### Negativas
- `spec-desenvolvimento.md` ainda referencia Prisma schema (legado) — serve como referência do modelo relacional mas não é código executável
- Joins complexos exigem views PostgreSQL ou funções RPC
- Connection strings `DATABASE_URL` / `DIRECT_URL` ficam configuradas mas são usadas apenas pelo Supabase CLI

### Migração
- Schema Prisma da spec → converter para SQL nativo (`CREATE TABLE`, `CREATE TYPE`)
- Tipos TypeScript: trocar `@prisma/client` por tipos gerados do Supabase
- Services: trocar `prisma.programa.findMany()` por `supabase.from('programas').select()`

## Referências
- `docs/prompts/start-projeto.md` seção "Client SDK vs Prisma ORM"
- `docs/fractus/spec-desenvolvimento.md` seção 2.2 (Prisma schema como referência do modelo)
