# T-085 — API Diagnóstico Individual (participante responde)

**Sprint:** S07 · **Due:** 2026-04-19 · **Prioridade:** URGENT · **Pts:** 5
**ClickUp:** https://app.clickup.com/t/86agn0217
**Assignee:** Douglas Oliveira

---

## 🚫 [BLOCKED-PRD 2026-04-17] — Aguarda T-084 redesenhada + ajuste de status

**Status:** BLOQUEADA.

**Motivo:**
1. Depende da T-084 redesenhada (tokens individuais gerados em novo fluxo).
2. Status `selecionado` não existe mais no enum do PRD vigente. Transição correta é `pré-selecionado → cadastrado` (M2 em [impacto-tasks-clickup.md](../../../packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md)).
3. BR-PRT-003 precisa ser reescrita: `pré-selecionado → cadastrado` automático ao responder.
4. PRD define **resposta como somente leitura após envio** (M7) — ajustar idempotência para rejeitar qualquer re-submissão, não apenas via UNIQUE.

**Ações pendentes:**
1. Substituir `status = 'selecionado'` por `status = 'cadastrado'` na RPC e no schema Zod (`statusParticipanteEnum`).
2. Atualizar AC1 e AC2 com nomenclatura nova.
3. Aguardar fechamento da T-084 redesenhada (tokens).
4. Confirmar que auto-save de rascunho está fora do escopo (M8 — fora do MVP).

**Referências:**
- [packages/fractus/docs/prd.md](../../../packages/fractus/docs/prd.md) — §Tipos de status, §Respostas
- [packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md](../../../packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md) — M1, M2, M4, M7, M8

---

## ⚠️ Pré-requisito bloqueante

**T-084 DEVE estar fechada.** Este plano consome os `token_diagnostico` gerados pela RPC `submit_diagnostico_negocio`. Sem eles, não há lookup de participante por token.

Validar: `psql -c "SELECT COUNT(*) FROM participantes WHERE token_diagnostico IS NOT NULL;"` retorna > 0.

## Contexto

Após T-084, cada participante pré-selecionado recebe um link individual:
`/diagnostico/individual/[token]`. Ao clicar, vê formulário com as perguntas do projeto, responde e submete.

**Fluxo:**
1. Lookup participante por `token_diagnostico` (status deve ser `pre_selecionado`).
2. Persistir respostas em `respostas_pesquisa` (uma linha por participante×instancia).
3. Transição `participantes.status = 'selecionado'` (BR-PRT-003).
4. Invalidar cache do projeto e do negócio.

**Regras:**
- BR-PRT-003: `pre_selecionado → selecionado` automática ao responder.
- **Idempotência:** segundo submit com mesmo participante deve retornar 422 (evitar sobrescrita acidental).
- Status ≠ `pre_selecionado` → 422 com código `INVALID_STATE`.

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `packages/fractus/src/lib/validations/diagnostico.ts` | [EDITAR] adicionar `submitIndividualSchema` |
| `packages/fractus/src/app/actions/diagnostico/submit-individual.ts` | [NOVO] server action |
| `packages/fractus/src/app/actions/diagnostico/submit-individual.test.ts` | [NOVO] testes |
| `packages/fractus/src/app/diagnostico/individual/[token]/page.tsx` | [NOVO] página pública |
| `packages/fractus/src/app/diagnostico/individual/[token]/form-client.tsx` | [NOVO] form |
| `packages/fractus/supabase/migrations/2026041X_unique_resposta.sql` | [NOVO] UNIQUE (participante_id, instancia_id) |

## Passo a passo

### 0. Validar pré-requisito

```bash
cd packages/fractus
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM participantes WHERE token_diagnostico IS NOT NULL AND status='pre_selecionado';"
# Deve retornar > 0
```

### 1. Garantir idempotência no schema

Migration `2026041X_unique_resposta.sql`:
```sql
ALTER TABLE respostas_pesquisa
  ADD CONSTRAINT uniq_participante_instancia UNIQUE (participante_id, instancia_id);
```

### 2. Schema Zod

Adicionar em `src/lib/validations/diagnostico.ts`:

```ts
export const submitIndividualSchema = z.object({
  token: z.string().min(16),
  instancia_id: z.string().uuid(),
  respostas: z.array(z.object({
    pergunta_id: z.string().uuid(),
    valor: z.union([z.string(), z.number(), z.array(z.string())]),
  })).min(1),
})
export type SubmitIndividualInput = z.infer<typeof submitIndividualSchema>
```

### 3. Server Action

`src/app/actions/diagnostico/submit-individual.ts`:

```ts
'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { submitIndividualSchema } from '@/lib/validations/diagnostico'

type Result =
  | { ok: true; participanteId: string }
  | { ok: false; code: 'VALIDATION'|'NOT_FOUND'|'INVALID_STATE'|'ALREADY_SUBMITTED'|'RATE_LIMIT'|'ERROR'; message: string; fieldErrors?: Record<string,string[]> }

export async function submitDiagnosticoIndividual(input: unknown): Promise<Result> {
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(ip)
  if (!rl.allowed) return { ok: false, code: 'RATE_LIMIT', message: `Tente em ${rl.retryAfterSeconds}s` }

  const parsed = submitIndividualSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'Dados inválidos', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { token, instancia_id, respostas } = parsed.data

  // 1. Lookup participante
  const { data: p, error: pErr } = await supabase
    .from('participantes')
    .select('id, status, negocio_id, negocio:negocios(projeto_id)')
    .eq('token_diagnostico', token)
    .single()

  if (pErr || !p) return { ok: false, code: 'NOT_FOUND', message: 'Link inválido' }
  if (p.status !== 'pre_selecionado') {
    return { ok: false, code: 'INVALID_STATE', message: 'Diagnóstico já respondido ou participante em estado inválido' }
  }

  // 2. RPC atômico: insert respostas + update status
  const { error } = await supabase.rpc('submit_diagnostico_individual', {
    p_participante_id: p.id,
    p_instancia_id: instancia_id,
    p_respostas: respostas,
  })

  if (error) {
    if (error.code === '23505') {
      return { ok: false, code: 'ALREADY_SUBMITTED', message: 'Diagnóstico já enviado' }
    }
    return { ok: false, code: 'ERROR', message: error.message }
  }

  revalidatePath(`/dashboard/projetos/${(p.negocio as any)?.projeto_id}`)
  return { ok: true, participanteId: p.id }
}
```

### 4. RPC Postgres

```sql
CREATE OR REPLACE FUNCTION submit_diagnostico_individual(
  p_participante_id uuid,
  p_instancia_id uuid,
  p_respostas jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_r jsonb;
BEGIN
  -- Guardar snapshot das respostas
  INSERT INTO respostas_pesquisa (participante_id, instancia_id, payload, respondido_em)
  VALUES (p_participante_id, p_instancia_id, p_respostas, now());

  UPDATE participantes SET status = 'selecionado' WHERE id = p_participante_id AND status = 'pre_selecionado';
END;
$$;
```

### 5. Página pública

`src/app/diagnostico/individual/[token]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormClient } from './form-client'

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('participantes')
    .select('id, nome, status, negocio:negocios(nome, projeto:projetos(id, nome, instancia_diagnostico_id))')
    .eq('token_diagnostico', token)
    .single()

  if (!data) notFound()
  if (data.status !== 'pre_selecionado') {
    return <p className="p-8">Este diagnóstico já foi respondido.</p>
  }

  return <FormClient token={token} participante={data} />
}
```

### 6. Testes

- Token inexistente → `NOT_FOUND`
- Status `ativo` → `INVALID_STATE`
- Segundo submit com mesmo participante → `ALREADY_SUBMITTED` (UNIQUE)
- Payload válido em primeiro submit → `ok: true` e status muda no banco

## Critérios de aceite (literais)

- **AC1:** Status muda para `selecionado`.
- **AC2:** Participante com status diferente de `pre_selecionado` rejeitado.

## Verificação end-to-end

- [ ] `pnpm typecheck && pnpm lint && pnpm build` OK
- [ ] Testes unitários verdes
- [ ] Curl válido → `{ok:true}`, banco mostra status `selecionado`
- [ ] Curl duplicado → `ALREADY_SUBMITTED`
- [ ] Curl com participante `ativo` → `INVALID_STATE`
- [ ] `pnpm dev` + navegar `/diagnostico/individual/<token>` com token válido → form

## Entrega ao Douglas (**NÃO commitar, NÃO dar push**)

> ⚠️ Dev NÃO commita.

### Mensagem de commit sugerida

```
feat(diagnostico): API submit diagnóstico individual (idempotente)

Refs T-085

- AC1: status pre_selecionado → selecionado (RPC submit_diagnostico_individual)
- AC2: status ≠ pre_selecionado retorna INVALID_STATE
- UNIQUE (participante_id, instancia_id) em respostas_pesquisa (idempotência)
- Rate limit 60/60s
```

## Rollback

```bash
git restore packages/fractus/src/lib/validations/diagnostico.ts
rm -rf packages/fractus/src/app/actions/diagnostico/submit-individual*
rm -rf packages/fractus/src/app/diagnostico/individual
psql -c "DROP FUNCTION IF EXISTS submit_diagnostico_individual; ALTER TABLE respostas_pesquisa DROP CONSTRAINT IF EXISTS uniq_participante_instancia;"
```

## Dependências e bloqueios

- **Upstream:** T-084 fechada (tokens gerados).
- **Downstream:** T-086 (ativação manual depende de status `selecionado`).
- **Risco:** tabela `instancias_pesquisa` precisa estar populada com perguntas. Se vazio, form não renderiza.

## Checklist de entrega

- [ ] T-084 confirmada fechada
- [ ] AC1-AC2 validados
- [ ] typecheck + lint + build OK
- [ ] Testes unitários verdes
- [ ] 3 cenários curl testados
- [ ] `git status` + `git diff --stat` colados
- [ ] **NÃO fiz commit nem push**
- [ ] Douglas notificado

## Checklist do Douglas

- [ ] Revisar diff
- [ ] Migration aplicada em staging
- [ ] Smoke manual
- [ ] Commit+push
- [ ] ClickUp T-085 → `complete`

## Evidência de entrega

```
# git status + diff --stat
(output)

# pnpm test
(output)

# 3 curls
(output)
```
