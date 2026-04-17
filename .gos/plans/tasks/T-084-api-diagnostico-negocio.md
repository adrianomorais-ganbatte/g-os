# T-084 — API Diagnóstico do Negócio (link único por projeto)

**Sprint:** S07 · **Due:** 2026-04-19 · **Prioridade:** URGENT · **Pts:** 8
**ClickUp:** https://app.clickup.com/t/86agn0211
**Assignee:** Douglas Oliveira

---

## 🚫 [BLOCKED-PRD 2026-04-17] — Redesign obrigatório

**Status:** BLOQUEADA. Não executar como está.

**Motivo:** O PRD vigente ([prd.md](../../../packages/fractus/docs/prd.md) §Decisões bloqueantes) invalida a premissa central desta task. A coleta de respostas passou a ser **por destinatário (link individual por Negócio pré-cadastrado pelo gestor)** — **não existe mais link único por projeto**.

Além disso:
- Status "selecionado" foi removido — novo enum: `pré-selecionado → cadastrado → ativo → desistente/concluinte` (ver M2 em [impacto-tasks-clickup.md](../../../packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md)).
- Transição automática `pré-selecionado → cadastrado` ao responder diagnóstico.
- Nomenclatura: `Programa → Projeto` (já no plano), `Patrocinador → Financiador` (M4).

**Fluxo novo:** gestor pré-cadastra Negócio no dashboard → sistema emite link individual para o líder → líder responde → Negócio vira `cadastrado` + Participante-líder auto-criado. Sem fluxo público com link coletivo.

**Ações pendentes antes de desbloquear:**
1. Reescrever contexto, contratos Zod e RPC para lookup por `token_diagnostico` do Negócio (não mais por `link_diagnostico` do Projeto).
2. Trocar `status = 'selecionado'` por `status = 'cadastrado'` em toda a RPC.
3. Remover endpoint de criação pública de Negócio — o Negócio já existe pré-cadastrado.
4. Atualizar ACs (AC2, AC4) e exemplos.

**Referências:**
- [packages/fractus/docs/prd.md](../../../packages/fractus/docs/prd.md) — §Decisões bloqueantes, §Tipos de status
- [packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md](../../../packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md) — M1, M2, M3, M4

---

## ⚠️ Pré-requisito bloqueante

**T-082 DEVE estar fechada antes deste plano.** A cadeia depende da FK `participantes.negocio_id NOT NULL + ON DELETE CASCADE`. Hoje (2026-04-17) a migration `20260412000000_prd_alignment.sql` deixou a coluna **nullable** com `ON DELETE SET NULL`.

**Se T-082 não estiver complete:** NÃO começar este plano. Avisar Douglas para fechar T-082 primeiro (é task do próprio Douglas, em andamento).

## Contexto

Fluxo de diagnóstico do negócio (lead inicial do CRM) — primeiro contato formal:

1. Gestor configura um projeto e obtém `link_diagnostico` (UUID/slug único por projeto).
2. Link é compartilhado com leads (via email marketing, site, QR).
3. Lead acessa `/diagnostico/negocio/[linkId]` → preenche formulário → submete.
4. Backend:
   - Cria registro em `negocios` (nome do negócio, líder, telefone).
   - Cria N participantes pré-selecionados (líder + equipe).
   - Marca `negocios.status = 'selecionado'` + `diagnostico_respondido = true`.
   - Aplica rate limit por IP.
   - Retorna link individual para cada participante completar diagnóstico (T-085).

**Regras PRD (literais):**
- BR-PRT-007: Participante pertence a exatamente 1 negócio (`negocio_id` FK obrigatória).
- BR-NEG-005: Transição `pre_selecionado → selecionado` automática ao responder diagnóstico.
- BR-DIG-003: Validação de e-mail — apenas e-mails únicos no payload.
- BR-PRJ-XXX: `link_diagnostico` único por projeto.

**Decisão arquitetural:** Next 16 App Router + Server Actions (não API routes). Repo não tem `src/app/api/` ativo. Lookup público via rota `app/diagnostico/negocio/[linkId]/page.tsx` que chama a action.

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `packages/fractus/src/lib/validations/deal.ts` | [EDITAR] schema novo (lider_email, projeto_id, diagnostico_respondido) |
| `packages/fractus/src/lib/validations/participant.ts` | [EDITAR] `negocio_id` obrigatório, status enum |
| `packages/fractus/src/lib/validations/diagnostico.ts` | [NOVO] `submitNegocioSchema` |
| `packages/fractus/src/app/actions/diagnostico/submit-negocio.ts` | [NOVO] server action |
| `packages/fractus/src/app/actions/diagnostico/submit-negocio.test.ts` | [NOVO] testes de integração |
| `packages/fractus/src/app/diagnostico/negocio/[linkId]/page.tsx` | [NOVO] página pública |
| `packages/fractus/src/app/diagnostico/negocio/[linkId]/form-client.tsx` | [NOVO] componente cliente |
| `packages/fractus/supabase/migrations/2026041X_link_diagnostico_unique.sql` | [NOVO se necessário] UNIQUE em `projetos.link_diagnostico` |

## Passo a passo

### 0. Validar pré-requisito

```bash
cd packages/fractus
psql -c "\d participantes" | grep negocio_id
# Esperado: negocio_id uuid NOT NULL, FK CASCADE
# Se aparecer "NULL" ou "SET NULL" → T-082 não está fechada. PARAR.
```

### 1. Atualizar schemas Zod

`src/lib/validations/deal.ts` (substituir CRM legado):

```ts
import { z } from 'zod'

export const negocioSchema = z.object({
  nome: z.string().min(2, "Nome do negócio obrigatório"),
  lider_nome: z.string().min(2),
  lider_email: z.string().email(),
  lider_telefone: z.string().regex(/^\+?[\d\s()-]{10,}$/, "Telefone inválido"),
  projeto_id: z.string().uuid(),
})

export type NegocioInput = z.infer<typeof negocioSchema>
```

`src/lib/validations/participant.ts`:

```ts
import { z } from 'zod'

export const statusParticipanteEnum = z.enum([
  'pre_selecionado', 'selecionado', 'ativo',
  'desistente', 'concluinte', 'inativado',
])

export const participanteSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  telefone: z.string().optional(),
  negocio_id: z.string().uuid(),  // FK OBRIGATÓRIA (BR-PRT-007)
  status: statusParticipanteEnum.default('pre_selecionado'),
})

export type ParticipanteInput = z.infer<typeof participanteSchema>
```

`src/lib/validations/diagnostico.ts` [NOVO]:

```ts
import { z } from 'zod'

export const submitNegocioSchema = z.object({
  linkId: z.string().min(1),
  negocio: z.object({
    nome: z.string().min(2),
    lider_nome: z.string().min(2),
    lider_email: z.string().email(),
    lider_telefone: z.string().min(10),
  }),
  participantes: z.array(z.object({
    nome: z.string().min(2),
    email: z.string().email(),
    telefone: z.string().optional(),
  })).min(1, "Ao menos o líder como participante"),
}).refine((data) => {
  const emails = data.participantes.map(p => p.email.toLowerCase())
  return new Set(emails).size === emails.length
}, { message: "E-mails duplicados não são permitidos", path: ["participantes"] })

export type SubmitNegocioInput = z.infer<typeof submitNegocioSchema>
```

### 2. Server Action

`src/app/actions/diagnostico/submit-negocio.ts` [NOVO]:

```ts
'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { submitNegocioSchema } from '@/lib/validations/diagnostico'

type ActionResult =
  | { ok: true; negocioId: string; participantTokens: string[] }
  | { ok: false; code: 'VALIDATION' | 'RATE_LIMIT' | 'NOT_FOUND' | 'DUPLICATE' | 'ERROR'; message: string; fieldErrors?: Record<string, string[]> }

export async function submitDiagnosticoNegocio(input: unknown): Promise<ActionResult> {
  // 1. Rate limit por IP
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    return { ok: false, code: 'RATE_LIMIT', message: `Tente novamente em ${rl.retryAfterSeconds}s` }
  }

  // 2. Validação Zod
  const parsed = submitNegocioSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Dados inválidos', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { linkId, negocio, participantes } = parsed.data

  // 3. Lookup projeto pelo link único
  const { data: projeto, error: projErr } = await supabase
    .from('projetos')
    .select('id, ativo')
    .eq('link_diagnostico', linkId)
    .single()

  if (projErr || !projeto) {
    return { ok: false, code: 'NOT_FOUND', message: 'Link inválido ou expirado' }
  }

  // 4. RPC transacional (recomendado) OU insert sequencial
  const { data, error } = await supabase.rpc('submit_diagnostico_negocio', {
    p_projeto_id: projeto.id,
    p_negocio: negocio,
    p_participantes: participantes,
  })

  if (error) {
    // Trata violação de UNIQUE em email
    if (error.code === '23505' && error.message.includes('email')) {
      return { ok: false, code: 'DUPLICATE', message: 'E-mail já cadastrado' }
    }
    return { ok: false, code: 'ERROR', message: error.message }
  }

  // 5. Revalidate dashboard
  revalidatePath(`/dashboard/projetos/${projeto.id}`)

  return { ok: true, negocioId: data.negocio_id, participantTokens: data.participant_tokens }
}
```

### 3. RPC em Postgres (atômica)

Criar migration `supabase/migrations/2026041X_rpc_submit_diagnostico_negocio.sql`:

```sql
CREATE OR REPLACE FUNCTION submit_diagnostico_negocio(
  p_projeto_id uuid,
  p_negocio jsonb,
  p_participantes jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_negocio_id uuid;
  v_tokens text[] := ARRAY[]::text[];
  v_p jsonb;
  v_token text;
BEGIN
  INSERT INTO negocios (nome, lider_nome, lider_email, lider_telefone, projeto_id, status, diagnostico_respondido)
  VALUES (
    p_negocio->>'nome',
    p_negocio->>'lider_nome',
    p_negocio->>'lider_email',
    p_negocio->>'lider_telefone',
    p_projeto_id,
    'selecionado',
    true
  )
  RETURNING id INTO v_negocio_id;

  FOR v_p IN SELECT * FROM jsonb_array_elements(p_participantes) LOOP
    v_token := encode(gen_random_bytes(16), 'hex');
    INSERT INTO participantes (nome, email, telefone, negocio_id, status, token_diagnostico)
    VALUES (
      v_p->>'nome',
      v_p->>'email',
      v_p->>'telefone',
      v_negocio_id,
      'pre_selecionado',
      v_token
    );
    v_tokens := array_append(v_tokens, v_token);
  END LOOP;

  RETURN jsonb_build_object('negocio_id', v_negocio_id, 'participant_tokens', v_tokens);
END;
$$;
```

> **Troubleshooting:** se `token_diagnostico` não existir em `participantes`, adicionar via migration: `ALTER TABLE participantes ADD COLUMN token_diagnostico text UNIQUE;`

### 4. Garantir UNIQUE em `link_diagnostico` (AC4)

```sql
-- Se não existir:
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS link_diagnostico text UNIQUE;
UPDATE projetos SET link_diagnostico = encode(gen_random_bytes(8), 'hex') WHERE link_diagnostico IS NULL;
```

### 5. Página pública

`src/app/diagnostico/negocio/[linkId]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormClient } from './form-client'

export default async function Page({ params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params
  const supabase = await createClient()
  const { data: projeto } = await supabase
    .from('projetos')
    .select('id, nome, ativo')
    .eq('link_diagnostico', linkId)
    .single()

  if (!projeto || !projeto.ativo) notFound()

  return <FormClient linkId={linkId} projetoNome={projeto.nome} />
}
```

`form-client.tsx` — formulário RHF + Zod que chama `submitDiagnosticoNegocio`.

### 6. Testes

`submit-negocio.test.ts` com Vitest: mockar Supabase client, validar:
- payload válido → `ok: true`
- email duplicado → `ok: false, code: 'DUPLICATE'`
- link inexistente → `ok: false, code: 'NOT_FOUND'`
- rate limit 61ª request → `ok: false, code: 'RATE_LIMIT'`

## Critérios de aceite (literais)

- **AC1:** Participantes criados automaticamente a partir do payload.
- **AC2:** Negócio muda para `selecionado` (e `diagnostico_respondido = true`).
- **AC3:** E-mails duplicados rejeitados (return `DUPLICATE`).
- **AC4:** Link único por projeto (`UNIQUE` constraint em `projetos.link_diagnostico`).

## Verificação end-to-end

- [ ] `pnpm typecheck` exit 0
- [ ] `pnpm lint` OK
- [ ] `pnpm test src/app/actions/diagnostico` verde
- [ ] `curl POST` com payload válido → 200 `{ok:true}`
- [ ] `curl POST` com email duplicado → `{ok:false, code:'DUPLICATE'}`
- [ ] `curl POST` com linkId inválido → `{ok:false, code:'NOT_FOUND'}`
- [ ] Após submit, verificar no Supabase: negócio `selecionado`, N participantes `pre_selecionado`, tokens únicos
- [ ] `pnpm dev` + navegar `/diagnostico/negocio/<linkId>` → formulário carrega

## Entrega ao Douglas (**NÃO commitar, NÃO dar push**)

> ⚠️ Dev NÃO commita. Douglas valida e commita.

Fluxo do dev:
1. Working tree sujo + migrations novas **não aplicadas em produção** (só local).
2. Colar output de `git status`, `git diff --stat`, resultado dos curls.
3. Avisar Douglas.

### Mensagem de commit sugerida

```
feat(diagnostico): API submit diagnóstico negócio (link único por projeto)

Refs T-084

- AC1: participantes auto-criados via RPC submit_diagnostico_negocio
- AC2: negócio → selecionado + diagnostico_respondido=true
- AC3: emails duplicados rejeitados (Zod + UNIQUE constraint)
- AC4: projetos.link_diagnostico UNIQUE
- Rate limit 60/60s por IP
- Testes de integração com mock Supabase
```

## Rollback

```bash
git restore packages/fractus/src/lib/validations/
rm -rf packages/fractus/src/app/actions/diagnostico
rm -rf packages/fractus/src/app/diagnostico
rm packages/fractus/supabase/migrations/2026041X_*.sql
# Reverter RPC no banco:
psql -c "DROP FUNCTION IF EXISTS submit_diagnostico_negocio;"
```

## Dependências e bloqueios

- **Upstream bloqueante:** T-082 (FK NOT NULL + CASCADE) — SE NÃO FECHADA, NÃO EXECUTAR.
- **Upstream:** T-110 (tsc exit 0) — validação Zod exige tipos corretos.
- **Downstream:** T-085 (usa token gerado aqui), T-086.
- **Risco 1:** RPC requer extension `pgcrypto` para `gen_random_bytes` — já vem no Supabase.
- **Risco 2:** se `projetos.link_diagnostico` já existe com valor duplicado em dados de teste → UPDATE antes do ADD CONSTRAINT UNIQUE.

## Checklist de entrega

- [ ] T-082 confirmada fechada (psql check)
- [ ] AC1-AC4 validados
- [ ] `pnpm typecheck` + `pnpm lint` + `pnpm build` OK
- [ ] Testes unitários verdes
- [ ] Curl tests dos 4 cenários
- [ ] `git status` + `git diff --stat` colados
- [ ] **NÃO fiz commit nem push**
- [ ] Douglas notificado

## Checklist do Douglas

- [ ] Revisar diff
- [ ] Aplicar migrations em staging
- [ ] Smoke test manual com link real
- [ ] Commit+push
- [ ] ClickUp T-084 → `complete`

## Evidência de entrega

```
# git status + diff --stat
(output)

# pnpm test (última linha)
(output)

# curl válido (status + body)
(output)

# curl duplicado (status + body)
(output)
```
