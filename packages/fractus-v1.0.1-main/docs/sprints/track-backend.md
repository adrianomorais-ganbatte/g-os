# Sprint Track: Backend (Douglas)

> **Versao:** 2.0 (atualizada para Supabase Client SDK — ver [ADR-002](../adr/002-supabase-client-sdk.md))
> **Data:** 27/03/2026
> **Responsavel:** Douglas (D)
> **Stack:** Next.js App Router (Route Handlers), Supabase Client SDK, Supabase CLI (migrations SQL), Zod
>
> **Nota de nomenclatura (03/04/2026):** Este documento usa nomenclatura anterior ao PRD de 02/04/2026. As tasks e entregas permanecem validas como referencia de implementacao. Mapeamento: Programas→**Projetos**, Patrocinadores→**Investidores**, Formularios→**Pesquisas**. Negocio e agora **entidade primaria** com CRUD completo, diagnostico publico e criacao automatica de participantes. Tasks atualizadas e novas (T-081 a T-092) estao em `clickup-sprints.md`.

---

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de tasks BE | 32 |
| Sprints com tasks BE | S03-S11 |
| Endpoints de API | 40+ |
| Tabelas SQL | 15 |
| Enums SQL | 5 |
| Schemas Zod | 15+ |

---

## Como ler esta doc

Cada sprint tem:
1. **Tabela de tasks** — o que fazer, em qual arquivo, o que desbloqueia
2. **API Contracts** — formato exato de request/response de cada endpoint
3. **AC (critérios de aceite)** — como saber se o sprint está pronto

**Convenções:**
- `T-NNN` — ID da tarefa
- `M*`, `B*` — referência à spec (Macroetapa, Back-end item)
- `BR-*` — regra de negócio (ver `docs/fractus/business-rules.md`)

---

## Sprint S01-S02 (02/03 - 15/03) — Fase 0: Definicoes

Tasks compartilhadas (D+A):

- **T-001:** Analise do prototipo figma-make — inventario de componentes, tipos, rotas
- **T-002:** Confirmar stack (Next.js App Router, Supabase Client SDK, Zod, shadcn/ui)
- **T-003:** Preencher cronograma ClickUp

**Entregaveis BE:** Nenhum codigo. Decisoes documentadas.

---

## Sprint S03 (15/03 - 22/03) — Fase 1: Base + Padronizacao

**O que voce faz:** Schema SQL completo (15 tabelas + 5 enums), migrations Supabase, seed data, CI/CD.

| Task | Ref | O que fazer | Arquivos | Desbloqueia |
|------|-----|-------------|----------|-------------|
| T-007 | M1/B1 | Configurar Supabase CLI + criar primeira migration com todas as tabelas | `supabase/migrations/*.sql`, `lib/supabase.ts`, `.env.local` | T-008, T-009, T-028 |
| T-008 | M3/B1 | Criar 5 enums SQL: `status_participante`, `tipo_template`, `tipo_campo`, `status_negocio`, `status_instancia` | `supabase/migrations/` | T-009 |
| T-009 | M3/B1 | 10 tabelas core: `patrocinadores`, `programas`, `programa_patrocinador`, `negocios`, `tags`, `participantes`, `participante_negocio`, `workspaces`, `templates`, `campo_template` | `supabase/migrations/` | T-010, T-018 |
| T-010 | M3/B1 | 6 tabelas transacionais: `instancias`, `resposta_instancia`, `sessoes`, `presenca_participante`, `painel_customizado`, `usuarios` | `supabase/migrations/` | T-011, T-019 |
| T-011 | M3/B2 | Seed data: 3 programas, 2 patrocinadores, 50 participantes, 5 templates, 10 instancias, 30 respostas, 10 sessoes, 3 negocios | `supabase/seed.sql` | -- |
| T-075 | M1/Infra | CI/CD: GitHub Actions (lint+typecheck+test), Vercel preview por PR | `.github/workflows/ci.yml` | -- |

### Passo a passo: como criar o schema

```bash
# 1. Entrar na pasta do package
cd packages/fractus

# 2. Criar migration para enums
npx supabase migration new create_enums

# 3. Editar o arquivo criado em supabase/migrations/TIMESTAMP_create_enums.sql
# Escrever os CREATE TYPE para cada enum

# 4. Criar migration para tabelas core
npx supabase migration new create_tabelas_core

# 5. Editar e escrever CREATE TABLE para as 10 tabelas core

# 6. Repetir para tabelas transacionais
npx supabase migration new create_tabelas_transacionais

# 7. Aplicar no banco remoto
npx supabase db push

# 8. Gerar tipos TypeScript
npx supabase gen types typescript --linked > src/types/database.ts

# 9. Popular seed data
# Editar supabase/seed.sql e rodar: npx supabase db reset (CUIDADO: reseta o banco!)
```

### Exemplo: enum + tabela (copie e adapte)

```sql
-- Enum de status do participante (6 valores)
CREATE TYPE status_participante AS ENUM (
  'pre_selecionado', 'selecionado', 'desclassificado',
  'ativo', 'desistente', 'concluinte'
);

-- Tabela programas
CREATE TABLE programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  total_inscritos INT NOT NULL DEFAULT 0,
  quantidade_vagas INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEMPRE habilitar RLS
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;

-- Policy: gestor ve tudo
CREATE POLICY "gestor_full_access" ON programas
  FOR ALL USING (auth.jwt()->>'tipo' = 'gestor');
```

### Convenções SQL (seguir sempre)

| Regra | Exemplo |
|-------|---------|
| Nomes de tabela: snake_case, plural | `participantes`, `campo_template` |
| Nomes de coluna: snake_case | `data_inicio`, `created_at` |
| IDs: UUID com default | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| Timestamps: TIMESTAMPTZ | `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` |
| RLS: habilitar em TODA tabela | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |

**AC do Sprint:**
- [ ] `npx supabase db push` cria 15 tabelas sem erros
- [ ] `npx supabase gen types` gera `database.ts`
- [ ] Seed data populado
- [ ] CI roda em PRs

---

## Sprint S04 (22/03 - 29/03) — Fase 2a: Coleta — Templates

**O que voce faz:** Schemas Zod para todas as entidades, API Workspaces e Templates.

| Task | Ref | O que fazer | Endpoints | Desbloqueia |
|------|-----|-------------|-----------|-------------|
| T-018 | M5/B3 | Zod schemas: enums + entidades base (Programa, Participante, Patrocinador, Negocio, Tag) | -- | T-023, T-024 |
| T-019 | M5/B3 | Zod schemas: Template, CampoTemplate, Workspace, Instancia, Resposta, Sessao, Painel, Usuario | -- | T-024, T-031 |
| T-023 | M9/B8 | API Workspaces CRUD | GET/POST `/api/workspaces` | T-024 |
| T-024 | M9/B9 | API Templates CRUD + versionamento | 6 endpoints (ver contracts abaixo) | **T-025, T-026, T-027 (FE)** |

### Passo a passo: como criar um Zod schema

```typescript
// lib/validations/programa.ts
import { z } from 'zod'

// Schema de criação (o que o frontend envia)
export const createProgramaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
  totalInscritos: z.number().int().min(0),
  quantidadeVagas: z.number().int().min(0).optional(),
  patrocinadorIds: z.array(z.string().uuid()).optional(),
})

// Tipo TypeScript derivado (usar no frontend E backend)
export type CreatePrograma = z.infer<typeof createProgramaSchema>
```

### Passo a passo: como criar um Route Handler

```typescript
// app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTemplateSchema } from '@/lib/validations/template'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = request.nextUrl

  const { data, error } = await supabase
    .from('templates')
    .select('*, campo_template(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  // Validar com Zod (OBRIGATÓRIO em toda mutação)
  const parsed = createTemplateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('templates')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

### API Contracts — S04

```
GET  /api/workspaces         -> { id, nome, templates_count }[]
POST /api/workspaces         -> { nome } -> 201 | 409 (duplicado)

GET  /api/templates          -> { filtro: workspace/tipo/search } -> { id, nome, tipo, campos[], contagem }[]
POST /api/templates          -> { nome, tipo, workspaceId, campos[] } -> 201
GET  /api/templates/[id]     -> { ...template, campos[], instancias_count }
PUT  /api/templates/[id]     -> { partial update + version++ se tem respostas }
DELETE /api/templates/[id]   -> 204 | 422 (TEMPLATE_COM_RESPOSTAS)
PUT  /api/templates/[id]/desativar -> 200
```

**AC do Sprint:**
- [ ] Zod schemas para todas as entidades
- [ ] GET/POST workspaces funciona
- [ ] CRUD completo de templates
- [ ] Validação Zod rejeita dados inválidos com mensagem clara

---

## Sprint S05 (29/03 - 05/04) — Fase 2a+2b: Auth + Instâncias

**Marco: Auth + Templates prontos (05/04)**

| Task | Ref | O que fazer | Endpoints | Desbloqueia |
|------|-----|-------------|-----------|-------------|
| T-028 | M4/B4 | Auth Supabase: email/senha (gestores), magic link (participantes), middleware | -- | T-029, T-030 (FE) |
| T-029 | M4/B4 | API Auth endpoints | 5 endpoints (ver contracts) | T-030 (FE), T-036, T-038 |
| T-031 | M10/B10 | API Instancias CRUD + publicar (nanoid) | 5 endpoints (ver contracts) | T-032 (FE), T-033 (FE) |
| T-076 | Infra | Rate limiting endpoints publicos (60 req/min/IP) | -- | T-038 |

### Passo a passo: como configurar Auth Supabase

```typescript
// lib/supabase/server.ts (servidor — Route Handlers e Server Components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```typescript
// middleware.ts (proteger rotas (platform)/)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && request.nextUrl.pathname.startsWith('/(platform)')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  return response
}

export const config = { matcher: ['/(platform)/:path*'] }
```

### API Contracts — S05

```
POST /api/auth/login      -> { email, senha } -> session cookie | 401
POST /api/auth/magic-link -> { email } -> 200 (email enviado) | 404
GET  /api/auth/me         -> { id, email, tipo, nome }
POST /api/auth/logout     -> 200 (clear cookie)
GET  /api/auth/callback   -> redirect to / or /f/[returnTo]

GET    /api/instancias              -> { filtro programa/tipo } -> { id, tipo, status, linkId, respostas X/Y }[]
POST   /api/instancias              -> { templateId, programaId, tagsFiltro, prazo, mensagem } -> 201
GET    /api/instancias/[id]         -> { ...instancia, template, campos }
PUT    /api/instancias/[id]/publicar    -> { linkId (nanoid 8 chars) } -> 200
PUT    /api/instancias/[id]/despublicar -> 200
```

**AC do Sprint:**
- [ ] Login gestor (email/senha) funcional
- [ ] Magic link envia email + callback autentica
- [ ] Middleware bloqueia acesso a `(platform)/` sem sessão
- [ ] Instâncias CRUD + publicar gera link com nanoid

---

## Sprint S06 (05/04 - 12/04) — Fase 2c: Respostas

| Task | Ref | O que fazer | Endpoints | Desbloqueia |
|------|-----|-------------|-----------|-------------|
| T-036 | M11/B11 | API Respostas CRUD + auto-save + submit | 5 endpoints | T-039 (FE), T-040 (FE) |
| T-037 | B12 | Auto-status: submit diagnostico_inicial → participante.status = ativo | trigger no T-036 | T-062 |
| T-038 | B17 | Validacao link publico: 6 regras (existe, publicado, prazo, vinculado, tags, unicidade) | GET `/api/f/[linkId]` | T-039 (FE) |

### API Contracts — S06

```
GET  /api/respostas?instanciaId= -> { id, participante.nome, status, createdAt }[]
POST /api/respostas              -> { instanciaId, participanteId } -> 201 | 422/410/403/409
GET  /api/respostas/[id]         -> { ...resposta, campos[] }
PUT  /api/respostas/[id]/rascunho -> { campos: { campoId: valor }[] } -> 200 (auto-save)
PUT  /api/respostas/[id]/enviar   -> 200 (completedAt set) | 422 (campos obrigatorios)

GET  /api/f/[linkId] -> { instancia, template, campos, participante } | 403/410/409/422
```

### Erros padronizados (usar sempre estes códigos)

| Codigo | HTTP | Quando |
|--------|------|--------|
| `INSTANCIA_NAO_PUBLICADA` | 422 | Tentou acessar instância não publicada |
| `PRAZO_EXPIRADO` | 410 | Prazo de preenchimento passou |
| `PARTICIPANTE_NAO_VINCULADO` | 403 | Participante não está vinculado à instância |
| `RESPOSTA_JA_ENVIADA` | 409 | Participante já enviou resposta |
| `CAMPOS_OBRIGATORIOS_FALTANDO` | 422 | Submit sem preencher campos obrigatórios |

**Marco: Coleta completa (15/04)**

---

## Sprint S07 (12/04 - 19/04) — Fase 3a: Gestão (início)

| Task | Ref | O que fazer | Endpoints | Desbloqueia |
|------|-----|-------------|-----------|-------------|
| T-043 | M6/B5 | API Programas CRUD (search, paginação, cascade delete) | 5 endpoints | T-044, T-045, T-046 (FE) |
| T-044 | M7/B6 | API Participantes CRUD + bulk CSV (max 5000, transacional) | 6 endpoints | T-049 (FE), T-050 (FE) |
| T-045 | M8/B7 | API Patrocinadores CRUD (logo via Supabase Storage) | 3 endpoints | T-051 (FE) |

### API Contracts — S07

```
GET    /api/programas      -> { search, page, limit } -> { data[], total }
POST   /api/programas      -> { nome, descricao, dataInicio, dataFim, totalInscritos, vagas, patrocinadorIds[] } -> 201
GET    /api/programas/[id] -> { ...programa, patrocinadores[] }
PUT    /api/programas/[id] -> partial update
DELETE /api/programas/[id] -> 204 (cascade: deleta participantes, instâncias, sessões)

GET    /api/participantes?programaId=&tags=&status=&search= -> { data[], total }
POST   /api/participantes       -> { nome, email, telefone, dataNascimento, programaId, tags[] } -> 201
POST   /api/participantes/bulk  -> { data[], programaId } -> { created, duplicates, errors[] }
PUT    /api/participantes/[id]  -> partial + validar transições de status
DELETE /api/participantes/[id]  -> 204 (cascade: deleta respostas)

GET  /api/patrocinadores        -> { search, page } -> { data[], total }
POST /api/patrocinadores        -> { nome, logo? (file upload) } -> 201
PUT  /api/patrocinadores/[id]   -> partial update
```

### Regra importante: transições de status do participante

```
pre_selecionado → selecionado     (gestor aprova)
pre_selecionado → desclassificado (gestor rejeita)
selecionado     → ativo           (participante responde diagnostico_inicial)
ativo           → desistente      (gestor marca)
ativo           → concluinte      (gestor marca ao final do programa)
```

> **Validar no backend:** rejeitar transições inválidas (ex: `ativo → pre_selecionado`).

---

## Sprint S08 (19/04 - 26/04) — Fase 3a: Gestão (cont.)

**Marco: Entrega de Desenvolvimento (26/04)**

| Task | Ref | O que fazer | Desbloqueia |
|------|-----|-------------|-------------|
| T-052 | M13/B13 | API Sessões + Presença CRUD (snapshot denominador) | T-053, T-056 (FE) |
| T-053 | B14 | Service: recálculo `percentualPresenca` + `faltasConsecutivas` | T-054 |
| T-078 | M14 | **[Brainstorming]** Motor de risco: explorar abordagens | T-054 |
| T-054 | M14/B15 | Motor de risco server-side (7 fatores, 4 níveis) | T-055 (FE) |
| T-058 | M15/B16 | API Negócios CRUD (rename reflete em tags) | T-059 (FE) |

### Motor de risco — como implementar

Portar de `packages/fractus/figma-make/mod-gestao/src/app/utils/riskCalculator.ts` (consultar localmente):

```typescript
// lib/risk-calculator.ts
export function calcularRisco(participante: {
  status: string
  percentualPresenca: number
  respondeuDiagnosticoInicial: boolean
  faltasConsecutivas: number
  totalRespostas: number
}): { score: number; nivel: 'baixo' | 'medio' | 'alto' | 'critico' } {
  if (participante.status === 'desistente') return { score: 100, nivel: 'critico' }

  let score = 0
  if (participante.percentualPresenca < 50) score += 40
  else if (participante.percentualPresenca < 75) score += 20
  if (!participante.respondeuDiagnosticoInicial) score += 30
  if (participante.faltasConsecutivas >= 3) score += 25
  if (participante.totalRespostas === 0) score += 20
  if (participante.status === 'selecionado') score += 10

  const nivel = score <= 25 ? 'baixo' : score <= 50 ? 'medio' : score <= 75 ? 'alto' : 'critico'
  return { score: Math.min(score, 100), nivel }
}
```

### API Contracts — S08

```
GET    /api/sessoes?programaId= -> { id, nome, data, presencas[], denominador }[]
POST   /api/sessoes             -> { programaId, nome, data, incluirNPS? } -> 201
PUT    /api/sessoes/[id]        -> { presencas: { participanteId, presente }[] } -> 200
DELETE /api/sessoes/[id]        -> 204

GET  /api/negocios?programaId= -> { id, nome, participantes[] }[]
POST /api/negocios             -> { nome, programaId } -> 201
PUT  /api/negocios/[id]        -> { nome } -> 200 (rename atualiza tags)
```

---

## Sprint S09 (26/04 - 03/05) — Fase 3a (final) + 3b (início)

**Marco: Gestão completa (03/05)**

| Task | Ref | O que fazer | Desbloqueia |
|------|-----|-------------|-------------|
| T-061 | M1 | Deploy Vercel + Supabase produção (env vars, domínio, migrations) | T-070 |
| T-062 | M16/B18 | API Impacto indicadores: agregar diagnostico_inicial vs final | T-063 |
| T-063 | M16/B19 | API Impacto dashboard: métricas agregadas + evolução | T-066 (FE) |
| T-064 | M17/B20 | API Painéis CRUD (indicadores, filtros, tipo visualização) | T-067 (FE) |
| T-065 | B21 | Expirar instâncias: lazy check `prazoValidade < now()` | -- |

### API Contracts — S09

```
GET /api/impacto/indicadores?programaId=&tagsFiltro=
  -> { nome, campoId, valorInicial, valorFinal, deltaAbsoluto, deltaPercentual }[]

GET /api/impacto/dashboard?programaId=&tagsFiltro=
  -> { totalParticipantes, mediaPresenca, taxaConclusao, taxaEvasao, distribuicaoRisco }

GET /api/impacto/evolucao?indicadorNome=&programaId=
  -> { dataPoints: { data, valor }[] }

GET/POST   /api/paineis     -> CRUD
PUT/DELETE /api/paineis/[id] -> { indicadores[], filtros, tipoVisualizacao }
```

---

## Sprint S10-S11 (03/05 - 17/05) — Fase 4: QA + Deploy

**Marco: Plataforma no ar (09/05) → Entrega MVP (17/05)**

| Task | Ref | O que fazer |
|------|-----|-------------|
| T-070 | M19 | Testes E2E Playwright: 5 cenários críticos (ver abaixo) |
| T-071 | M19 | Auditoria acessibilidade: Lighthouse > 80 |
| T-072 | M19 | Performance: Lighthouse > 80, FCP < 1.5s |
| T-073 | M19 | Bug fixing e polish |
| T-077 | Infra | Error tracking Sentry: source maps, alertas |
| T-074 | M19 | Documentação README + guia de uso |

### 5 cenários E2E (Playwright)

1. Login gestor → criar programa → adicionar participante
2. Criar template → publicar instância → participante responde
3. Registrar presença + NPS → verificar cálculos
4. Patrocinador visualiza apenas seus programas (RLS)
5. Import CSV com deduplicação

### Checklist pré-deploy

- [ ] `pnpm build` sem erros
- [ ] Todas as env vars na Vercel
- [ ] `supabase gen types` atualizado
- [ ] RLS policies testadas
- [ ] Nenhum `SUPABASE_SERVICE_ROLE_KEY` no client-side
- [ ] `middleware.ts` protegendo `(platform)/`

---

## Dependências Cross-Track (BE → FE)

| BE Task | Desbloqueia FE | Sprint |
|---------|---------------|--------|
| T-024 (API Templates) | T-025, T-026, T-027 (Templates pages) | S04 |
| T-028/T-029 (Auth) | T-030 (Login page) | S05 |
| T-031 (API Instâncias) | T-032, T-033 (Instâncias pages) | S05 |
| T-036 (API Respostas) | T-039, T-040 (FormPublico, Viewer) | S06 |
| T-038 (Validação link) | T-039 (FormPublico) | S06 |
| T-043 (API Programas) | T-046, T-047, T-048 (Programas pages) | S07 |
| T-044 (API Participantes) | T-049, T-050 (Participantes pages) | S07 |
| T-045 (API Patrocinadores) | T-051 (Patrocinadores page) | S07 |
| T-052 (API Sessões) | T-056 (PresencaTab) | S08 |
| T-054 (Motor risco) | T-055 (RiskBadge) | S08 |
| T-058 (API Negócios) | T-059 (NegociosTab) | S08 |
| T-063 (API Dashboard) | T-066 (ImpactoDashboard) | S09 |
| T-064 (API Painéis) | T-067 (PainelEditor) | S09 |

---

## Caminho Crítico

```
T-007 → T-008 → T-009 → T-010 → T-011
                   |
                   v
             T-018/T-019 → T-023 → T-024 → T-031 → T-036 → T-037 → T-043 → T-044 → T-052 → T-053 → T-054 → T-062 → T-063
                                      |                                                   |
                                      v                                                   v
                                T-028 → T-029 → T-038                                   T-058
```

> **Se você está bloqueado:** Verifique este diagrama. Se uma task no caminho crítico atrasa, tudo depois atrasa. Comunique imediatamente no standup.
