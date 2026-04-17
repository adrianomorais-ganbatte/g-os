# T-086 — API Ativação Manual (gestor ativa participante em lote)

**Sprint:** S07 · **Due:** 2026-04-19 · **Prioridade:** URGENT · **Pts:** 3
**ClickUp:** https://app.clickup.com/t/86agn021d
**Assignee:** Douglas Oliveira

---

## 🚫 [BLOCKED-PRD 2026-04-17] — Escopo invertido: ativação primária é automática

**Status:** BLOQUEADA. Reavaliar escopo antes de executar.

**Motivo:** O PRD vigente ([prd.md](../../../packages/fractus/docs/prd.md) §Tipos de status) determina que a **ativação é automática via presença em ≥1 oficina** — a ativação manual em lote deixa de ser fluxo principal e vira **exceção auditada** (BR-PRT-004 reinterpretada).

Além disso, a transição correta é `cadastrado → ativo` (não `selecionado → ativo` — status `selecionado` foi removido, ver M2).

**Ações pendentes:**
1. Reduzir escopo: manter endpoint mas documentá-lo como exceção (não como feature principal).
2. Trocar todas as refs a `status = 'selecionado'` por `status = 'cadastrado'` (AC1, AC2, RPC, testes).
3. Adicionar auditoria obrigatória (log de quem ativou manualmente e quando) — PRD exige.
4. Priorizar primeiro a task de ativação automática por presença (que ainda não existe em `.gos/plans/tasks/`).

**Referências:**
- [packages/fractus/docs/prd.md](../../../packages/fractus/docs/prd.md) — §Tipos de status, §Oficinas
- [packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md](../../../packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md) — M2

---

## ⚠️ Pré-requisito bloqueante

**T-085 DEVE estar fechada.** Este plano só faz sentido quando há participantes no status `selecionado` (output da T-085).

Validar: `psql -c "SELECT COUNT(*) FROM participantes WHERE status='selecionado';"` retorna > 0.

## Contexto

Após o participante responder o diagnóstico (T-085), ele fica em `selecionado`. O **gestor do projeto** revisa os leads e decide quais promover para `ativo` (começam formalmente no programa). Essa ação é **manual e autenticada** — BR-PRT-004.

**Fluxo:**
1. Gestor autenticado abre `/dashboard/projetos/[id]/participantes`.
2. Seleciona N participantes com checkbox (UI multi-select).
3. Clica "Ativar selecionados" → chama server action `activateParticipants({ ids })`.
4. Backend atualiza `status = 'ativo'` **apenas** onde `status = 'selecionado'` (idempotente).
5. Retorna `{ activated, rejected }` — rejected = participantes em outros status.

**Regras:**
- BR-PRT-004: Transição para `ativo` requer ação manual.
- Transição permitida: `selecionado → ativo`. Qualquer outro status → 422 por item.
- Batch parcial é aceitável (UI mostra quais falharam).
- Concorrência: dois gestores clicando simultaneamente — UPDATE idempotente via `WHERE status='selecionado'` resolve.

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `packages/fractus/src/app/actions/participants/activate.ts` | [NOVO] server action |
| `packages/fractus/src/app/actions/participants/activate.test.ts` | [NOVO] testes |
| `packages/fractus/src/components/domain/participants/activate-batch-button.tsx` | [NOVO] botão + confirm dialog |
| `packages/fractus/src/components/domain/participants/participants-table.tsx` | [EDITAR] adicionar checkbox multi-select + botão |
| `packages/fractus/src/lib/validations/participant.ts` | [EDITAR] adicionar `activateBatchSchema` |

## Passo a passo

### 0. Validar pré-requisito

```bash
psql "$DATABASE_URL" -c "SELECT status, COUNT(*) FROM participantes GROUP BY status;"
# Deve ter pelo menos alguns 'selecionado' para testar
```

### 1. Schema Zod

Em `src/lib/validations/participant.ts`:

```ts
export const activateBatchSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(1).max(100),
})
export type ActivateBatchInput = z.infer<typeof activateBatchSchema>
```

### 2. Server Action

`src/app/actions/participants/activate.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { activateBatchSchema } from '@/lib/validations/participant'

type ItemResult = { id: string; ok: true } | { id: string; ok: false; code: 'INVALID_STATE'|'NOT_FOUND'; currentStatus?: string }

type Result =
  | { ok: true; activated: number; rejected: ItemResult[] }
  | { ok: false; code: 'UNAUTHORIZED'|'VALIDATION'|'ERROR'; message: string; fieldErrors?: Record<string,string[]> }

export async function activateParticipants(input: unknown): Promise<Result> {
  // 1. Autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, code: 'UNAUTHORIZED', message: 'Login obrigatório' }

  // 2. Validação
  const parsed = activateBatchSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: 'IDs inválidos', fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const { participantIds } = parsed.data

  // 3. Ler status atual de todos
  const { data: current, error: readErr } = await supabase
    .from('participantes')
    .select('id, status, negocio:negocios(projeto_id)')
    .in('id', participantIds)

  if (readErr) return { ok: false, code: 'ERROR', message: readErr.message }

  const currentMap = new Map(current?.map(p => [p.id, p]) ?? [])
  const rejected: ItemResult[] = []
  const eligible: string[] = []

  for (const id of participantIds) {
    const p = currentMap.get(id)
    if (!p) { rejected.push({ id, ok: false, code: 'NOT_FOUND' }); continue }
    if (p.status !== 'selecionado') {
      rejected.push({ id, ok: false, code: 'INVALID_STATE', currentStatus: p.status })
      continue
    }
    eligible.push(id)
  }

  // 4. Update idempotente (WHERE status='selecionado' previne race)
  if (eligible.length > 0) {
    const { error: updErr, count } = await supabase
      .from('participantes')
      .update({ status: 'ativo' }, { count: 'exact' })
      .in('id', eligible)
      .eq('status', 'selecionado')

    if (updErr) return { ok: false, code: 'ERROR', message: updErr.message }

    // 5. Revalidate paths dos projetos afetados
    const projetoIds = [...new Set(current?.map(p => (p.negocio as any)?.projeto_id).filter(Boolean))]
    projetoIds.forEach(pid => revalidatePath(`/dashboard/projetos/${pid}`))

    return { ok: true, activated: count ?? 0, rejected }
  }

  return { ok: true, activated: 0, rejected }
}
```

### 3. UI — Botão batch

`src/components/domain/participants/activate-batch-button.tsx`:

```tsx
'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
import { activateParticipants } from '@/app/actions/participants/activate'

export function ActivateBatchButton({ selectedIds, onDone }: { selectedIds: string[]; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()

  const run = () => start(async () => {
    const res = await activateParticipants({ participantIds: selectedIds })
    if (!res.ok) { toast.error(res.message); return }
    toast.success(`${res.activated} ativados${res.rejected.length ? `, ${res.rejected.length} rejeitados` : ''}`)
    if (res.rejected.length) {
      res.rejected.forEach(r => toast.warning(`${r.id}: ${r.code}${'currentStatus' in r ? ` (${r.currentStatus})` : ''}`))
    }
    setOpen(false); onDone()
  })

  return (
    <>
      <Button disabled={!selectedIds.length || pending} onClick={() => setOpen(true)}>
        Ativar {selectedIds.length} selecionado{selectedIds.length !== 1 ? 's' : ''}
      </Button>
      <ConfirmDialog open={open} onOpenChange={setOpen} onConfirm={run}
        title="Ativar participantes?"
        description={`${selectedIds.length} serão promovidos para ativo. Apenas os em status 'selecionado' serão afetados.`} />
    </>
  )
}
```

### 4. Integrar no ParticipantsTable

Em `participants-table.tsx`:
- Adicionar coluna checkbox (controlada via `selectedIds` state).
- Header com "select all" para status `selecionado`.
- Colocar `<ActivateBatchButton selectedIds={...} onDone={() => setSelectedIds([])} />` acima da tabela.

### 5. Testes

`activate.test.ts`:
- Sem auth → `UNAUTHORIZED`
- IDs válidos, todos `selecionado` → `activated = N, rejected = []`
- Mix: 2 `selecionado` + 1 `pre_selecionado` + 1 `ativo` → `activated = 2, rejected.length = 2`
- ID inexistente → rejected com `NOT_FOUND`
- Payload vazio → `VALIDATION`

## Critérios de aceite (literais)

- **AC1:** Gestor ativa de `selecionado` para `ativo`.
- **AC2:** Status diferente de `selecionado` retorna 422 (no contexto de server action: `rejected[].code = 'INVALID_STATE'`).
- **AC3:** Ativação em lote funcional.

## Verificação end-to-end

- [ ] `pnpm typecheck && pnpm lint && pnpm build` OK
- [ ] Testes unitários verdes (5 cenários)
- [ ] Smoke manual: logar como gestor, ir em `/dashboard/projetos/[id]/participantes`, selecionar 3 (mix de status), clicar ativar, ver toast com `activated: 2, rejected: 1` (ajustar conforme fixtures)
- [ ] Banco: participantes `selecionado` viraram `ativo`; outros intocados
- [ ] Toast mostra falhas por item

## Entrega ao Douglas (**NÃO commitar, NÃO dar push**)

> ⚠️ Dev NÃO commita.

### Mensagem de commit sugerida

```
feat(participants): ativação manual em lote (selecionado → ativo)

Refs T-086

- AC1: gestor ativa via server action activateParticipants
- AC2: status ≠ selecionado rejected com INVALID_STATE + currentStatus
- AC3: batch com UI multi-select + ConfirmDialog
- Auth obrigatória (supabase.auth.getUser)
- Update idempotente (WHERE status='selecionado') protege contra race
```

## Rollback

```bash
rm -f packages/fractus/src/app/actions/participants/activate*
rm -f packages/fractus/src/components/domain/participants/activate-batch-button.tsx
git restore packages/fractus/src/components/domain/participants/participants-table.tsx
git restore packages/fractus/src/lib/validations/participant.ts
```

## Dependências e bloqueios

- **Upstream:** T-085 fechada (participantes em `selecionado`).
- **Downstream:** fluxo de presença (T-053 futura) pode filtrar só `ativo`.
- **Risco:** se `ConfirmDialog` ainda não existir (T-014 em andamento), fazer fallback com `window.confirm` temporariamente e documentar no plano.

## Checklist de entrega

- [ ] T-085 confirmada fechada
- [ ] AC1-AC3 validados
- [ ] typecheck + lint + build OK
- [ ] 5 cenários de teste verdes
- [ ] Smoke manual no dashboard
- [ ] `git status` + `git diff --stat` colados
- [ ] **NÃO fiz commit nem push**
- [ ] Douglas notificado

## Checklist do Douglas

- [ ] Revisar diff (UI + action)
- [ ] Smoke manual com usuário real autenticado
- [ ] Commit+push
- [ ] ClickUp T-086 → `complete`
- [ ] Sprint S07 fechada se esta for a última

## Evidência de entrega

```
# git status + diff --stat
(output)

# pnpm test activate
(output)

# smoke manual (screenshot ou texto)
(output)
```
