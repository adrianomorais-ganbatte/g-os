# Guia: Schema e Migrations (Supabase CLI)

## Conceito

O Supabase CLI gerencia migrations via SQL puro. Cada migration é um arquivo `.sql` na pasta `supabase/migrations/`.

## Criar nova migration

```bash
# Criar arquivo de migration
npx supabase migration new nome_descritivo

# Editar o arquivo criado em supabase/migrations/TIMESTAMP_nome_descritivo.sql
# Escrever SQL: CREATE TABLE, ALTER TABLE, CREATE POLICY, etc.
```

## Aplicar migrations

```bash
# Aplicar no banco remoto (Supabase)
npx supabase db push

# Verificar status
npx supabase migration list
```

## Gerar tipos TypeScript após mudanças

```bash
npx supabase gen types typescript --linked > src/types/database.ts
```

> Rodar SEMPRE após alterar schema. Os tipos são a source of truth para o frontend.

## Exemplo: criar tabela programas

```sql
-- supabase/migrations/20260315000001_create_programas.sql

CREATE TABLE programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  total_inscritos INT NOT NULL DEFAULT 0,
  quantidade_vagas INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;

-- Gestor vê tudo
CREATE POLICY "gestor_full_access" ON programas
  FOR ALL USING (auth.jwt()->>'tipo' = 'gestor');
```

## Convenções

- Nomes de tabelas: snake_case, plural (`programas`, `participantes`)
- Nomes de colunas: snake_case (`data_inicio`, `created_at`)
- IDs: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Timestamps: `TIMESTAMPTZ` (sempre com timezone)
- RLS: habilitar em TODA tabela nova (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- Cada migration deve ser reversível mentalmente (saber o que desfazer se der problema)

## Seed data

```bash
# Criar arquivo de seed
# supabase/seed.sql

# Aplicar seed
npx supabase db reset  # CUIDADO: reseta todo o banco + aplica migrations + seed
```

## Referências
- `docs/fractus/spec-desenvolvimento.md` seção 2.2 — schema Prisma (referência do modelo)
- `docs/prompts/start-projeto.md` — Setup passo 9-10
- ADR-002: Supabase Client SDK ao invés de Prisma
