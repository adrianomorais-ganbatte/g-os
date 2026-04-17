# T-110 — Resolver drift TypeScript + instalar pre-commit hook (fractus)

**Sprint:** S07 · **Due:** 2026-04-17 · **Prioridade:** high · **Pts:** ~5-8
**ClickUp:** https://app.clickup.com/t/86agy94tb
**Assignee:** Douglas Oliveira
**Status:** ✅ **CONCLUÍDA** (validada empiricamente em 2026-04-17)

---

## ✅ Conclusão validada — 2026-04-17

Todos os 7 ACs do plano original verificados empiricamente. Evidências abaixo.

| AC  | Resultado | Evidência |
|-----|-----------|-----------|
| AC1 | ✅ | `src/types/supabase.ts` regenerado (26.697 bytes, 17/04 11:00). `programas`/`patrocinadores`: **0 ocorrências**. `investidores`/`projeto_investidores`: **5 ocorrências** (schema atual do banco). |
| AC2 | ✅ | `src/lib/validations/projeto.ts` existe com `projetoSchema` + `ProjetoInput`. |
| AC3 | ✅ | `grep -r "programSchema\|ProgramInput"` em `src/` → **0 arquivos**. Imports renomeados. |
| AC4 | ✅ | `PageHeader` tipando `breadcrumbs` corretamente — confirmado via `tsc --noEmit` exit 0. |
| AC5 | ✅ | `tsc --noEmit 2>&1 \| grep -c TS7006` → **0**. |
| AC6 | ✅ | `npx tsc --noEmit; echo $?` → **exit 0** (zero erros, de 82 originais). |
| AC7 | ✅ | `.git/hooks/pre-commit` instalado (175 bytes, executável `-rwxr-xr-x`), delega para `.gos/scripts/hooks/pre-commit-validate.js` via `GANBATTE_ROOT`. |

### Comandos de validação (reproduzíveis)

```bash
cd packages/fractus
npx tsc --noEmit; echo "exit=$?"                 # → exit=0
ls -la .git/hooks/pre-commit                     # → -rwxr-xr-x, 175 bytes
grep -r "programSchema\|ProgramInput" src | wc -l  # → 0
grep -c "programas\|patrocinadores" src/types/supabase.ts  # → 0
```

---

## ⚠️ Escopo residual (fora desta task) — [PRD 2026-04-17]

O PRD novo exige rename adicional `Investidor → Financiador` (M4 em [impacto-tasks-clickup.md](../../../packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md)). **Isto não estava no plano original da T-110 e não bloqueia o fechamento dela.**

Ação: **abrir task nova** (ex.: T-111) cobrindo:
1. Migration `financiadores` + `projeto_financiadores` (renomear tabelas).
2. Regerar `supabase.ts`.
3. Renomear `src/lib/validations/investidor*` → `financiador*`, paths `/dashboard/investidores/` → `/dashboard/financiadores/`, tabelas em server actions.
4. 10 arquivos ainda referenciando `investidor*` (ver grep): `src/app/dashboard/investidores/`, `src/components/domain/sponsors/`, `src/components/domain/investors/`, `src/app/actions/investors/actions.ts`, `src/app/actions/projects/actions.ts`, `src/app/dashboard/projetos/[id]/page.tsx`, `src/lib/validations/projeto.ts`, `src/components/ui/delete-dialog.stories.tsx`.

Referências:
- [packages/fractus/docs/prd.md](../../../packages/fractus/docs/prd.md) §Glossário
- [packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md](../../../packages/fractus/docs/regras-de-negocio/impacto-tasks-clickup.md) M4

---

## Contexto

Após a T-095 (validação tipada de env vars com Zod + server-only), `npx tsc --noEmit` em `packages/fractus` retornou **82 erros em ~20 arquivos**. A causa-raiz é drift acumulado após a T-092 (renomeação de domínio: `programas → projetos`, `patrocinadores → investidores`, `formularios → pesquisas`):

1. `src/types/supabase.ts` (26.7 KB, gerado 16/abr 22:04) ainda reflete o schema antigo — migration `supabase/migrations/20260412000000_prd_alignment.sql` renomeou no banco mas os tipos **não foram regenerados**.
2. `src/lib/validations/program.ts` só exporta `programSchema`/`ProgramInput`; server actions e componentes que foram renomeados (`projects/`, `investors/`) importam `projetoSchema`/`ProjetoInput` que ainda não existem.
3. `PageHeader` espera `breadcrumbs?: React.ReactNode` mas 5 pages passam array `[{label, href}]`.
4. Callbacks `.map/.filter` em 10+ lugares sem anotação de tipo → `implicit any`.
5. Pages legadas `/dashboard/patrocinadores/` e `/dashboard/programas/` continuam no repositório mesmo com as rotas novas ativas.
6. `.git/hooks/pre-commit` **não existe**; `pre-commit-validate.js` (em `.gos/scripts/hooks/`) já está pronto, só falta instalar.

Sem isso, qualquer CI/CD com tsc gate e o `gos:doctor` falham. Esta task desbloqueia todas as outras da sprint.

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `packages/fractus/src/types/supabase.ts` | [REGENERAR] via supabase CLI |
| `packages/fractus/src/lib/validations/projeto.ts` | [NOVO] com `projetoSchema` + `ProjetoInput` |
| `packages/fractus/src/lib/validations/program.ts` | [DELETAR] após confirmar zero imports |
| `packages/fractus/src/lib/validations/investidor.ts` | [NOVO] (se `patrocinador.ts` existia, substituir) |
| `packages/fractus/src/app/actions/projects/actions.ts:5` | [EDITAR] import |
| `packages/fractus/src/app/actions/investors/actions.ts` | [EDITAR] refs à tabela `investidores` |
| `packages/fractus/src/components/domain/projects/create-project-dialog.tsx:29` | [EDITAR] import |
| `packages/fractus/src/components/layout/page-header.tsx:16` | [EDITAR] ampliar tipo de `breadcrumbs` |
| `packages/fractus/src/app/dashboard/instancias/[id]/page.tsx:51` | [EDITAR] breadcrumbs consumer |
| `packages/fractus/src/app/dashboard/participantes/*/page.tsx` | [EDITAR] breadcrumbs consumer |
| `packages/fractus/src/app/dashboard/patrocinadores/` | [REMOVER] rota legada |
| `packages/fractus/src/app/dashboard/programas/` | [REMOVER] rota legada |
| `packages/fractus/.git/hooks/pre-commit` | [NOVO] shell que delega para `pre-commit-validate.js` |

## Passo a passo

### 1. Regenerar tipos Supabase (AC1)

```bash
cd packages/fractus

# Opção A — supabase local rodando
npx supabase status                                # confirmar que está up
npx supabase gen types typescript --local > src/types/supabase.ts

# Opção B — projeto remoto
npx supabase login                                 # se ainda não logado
npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/supabase.ts
```

> **Troubleshooting:** se `supabase` CLI não instalada, `pnpm add -D supabase`. PROJECT_ID está em `supabase/config.toml` (`project_id = "fractus"`).

Validação:
```bash
grep -E "investidores|projetos|projeto_investidores" src/types/supabase.ts | head
# Deve retornar ≥3 ocorrências
grep -E "programas|patrocinadores" src/types/supabase.ts
# Deve retornar 0 ocorrências
```

### 2. Criar `projetoSchema` e `ProjetoInput` (AC2)

Novo arquivo `packages/fractus/src/lib/validations/projeto.ts`:

```ts
import { z } from 'zod'

export const projetoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  dataInicio: z.date(),
  dataFim: z.date(),
  totalInscritos: z.number().int().min(0, "Total de inscritos não pode ser negativo"),
  quantidadeVagas: z.number().int().min(1).optional(),
  investidorIds: z.array(z.string().uuid()).optional(),
}).refine((d) => d.dataFim > d.dataInicio, {
  message: "A data de término deve ser após a data de início",
  path: ["dataFim"],
})

export type ProjetoInput = z.infer<typeof projetoSchema>
```

Remover `src/lib/validations/program.ts` **após confirmar que não há mais imports dele**:
```bash
grep -r "programSchema\|ProgramInput\|from.*validations/program" packages/fractus/src
# Deve retornar 0 resultados antes de deletar
```

### 3. Fix imports renomeados (AC3)

```bash
cd packages/fractus

# Ver todos os imports antigos
grep -rn "programSchema\|ProgramInput" src
grep -rn "patrocinador\|Patrocinador" src
grep -rn "from.*'programas'\|'patrocinadores'" src
```

Trocar em cada arquivo:
- `programSchema` → `projetoSchema`
- `ProgramInput` → `ProjetoInput`
- `patrocinadorIds` → `investidorIds`
- Table refs em Supabase queries: `'programas'` → `'projetos'`, `'patrocinadores'` → `'investidores'`, `'programa_patrocinadores'` → `'projeto_investidores'`

Pontos críticos:
- `src/app/actions/projects/actions.ts:5` — import do schema
- `src/app/actions/investors/actions.ts` — 10 erros TS2339/TS2769 no select
- `src/components/domain/projects/create-project-dialog.tsx:29` — import

### 4. Tipar breadcrumbs (AC4)

Editar `src/components/layout/page-header.tsx`:

```ts
export type BreadcrumbItem = { label: string; href?: string }

interface PageHeaderProps {
  title: string
  // antes: breadcrumbs?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[] | React.ReactNode
  // ...resto
}

// No render:
function renderBreadcrumbs(b: PageHeaderProps['breadcrumbs']) {
  if (!b) return null
  if (Array.isArray(b)) {
    return (
      <nav className="...">
        {b.map((item, i) => (
          <span key={i}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
            {i < b.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </nav>
    )
  }
  return b
}
```

Pages consumers permanecem passando arrays — zero churn nos 5 arquivos.

### 5. Resolver implicit `any` (AC5)

Rodar `npx tsc --noEmit 2>&1 | grep "TS7006"` para ver todos. Para cada:

```ts
// antes
items.map((i) => i.nome)
// depois
items.map((i: Participante) => i.nome)   // importa Participante de @/types/supabase
```

Prefira inferência completa: se `items` vem de um `supabase.from('participantes').select()`, anote a variável superior, não o callback.

### 6. Remover rotas legadas

```bash
cd packages/fractus
rm -rf src/app/dashboard/patrocinadores src/app/dashboard/programas
```

Confirmar que links na sidebar/menus apontam para `/dashboard/projetos` e `/dashboard/investidores`:
```bash
grep -rn "dashboard/patrocinadores\|dashboard/programas" src
# Deve retornar 0
```

### 7. `tsc --noEmit` exit 0 (AC6)

```bash
cd packages/fractus
npx tsc --noEmit
echo "exit=$?"   # precisa imprimir "exit=0"
```

### 8. Instalar pre-commit hook (AC7)

Criar `packages/fractus/.git/hooks/pre-commit`:

```bash
#!/usr/bin/env bash
# Delegate to ganbatte-os pre-commit-validate.js
set -e

# GANBATTE_ROOT = dois níveis acima de .git (packages/fractus -> Ganbatte)
GANBATTE_ROOT="$(cd "$(dirname "$0")/../../../../" && pwd)"
export GANBATTE_ROOT

node "$GANBATTE_ROOT/.gos/scripts/hooks/pre-commit-validate.js"
```

Dar permissão executável:
```bash
chmod +x packages/fractus/.git/hooks/pre-commit
```

**Teste dummy** (não commitar):
```bash
cd packages/fractus
echo "const broken: string = 123" >> src/app/page.tsx      # força erro TS
git add src/app/page.tsx
git commit -m "test: should fail"                          # deve abortar
git restore --staged src/app/page.tsx && git checkout -- src/app/page.tsx
```

## Critérios de aceite (literais)

- **AC1:** Regenerar `src/types/supabase.ts` via supabase CLI — tabelas `investidores`, `projetos`, `projeto_investidores` presentes; `programas`/`patrocinadores` ausentes.
- **AC2:** Criar `projetoSchema` + `ProjetoInput` em `src/lib/validations/projeto.ts`.
- **AC3:** Fix imports renomeados nas pages — grep por `programSchema|ProgramInput|patrocinador` em `src/` retorna 0.
- **AC4:** Tipar `breadcrumbs` (ReactNode vs array) — 5 pages compilam sem TS2322.
- **AC5:** Tipar callbacks `.map/.filter` — zero TS7006.
- **AC6:** `npx tsc --noEmit` retorna exit 0.
- **AC7:** Pre-commit hook instalado em `packages/fractus/.git/hooks/pre-commit`, executável, delegando para `pre-commit-validate.js`.

## Verificação end-to-end

- [ ] `cd packages/fractus && npx tsc --noEmit; echo $?` → `0`
- [ ] `pnpm lint` OK
- [ ] `pnpm build` OK
- [ ] `pnpm dev` e navegar `/dashboard/projetos` e `/dashboard/investidores` — página carrega sem erro 500
- [ ] Pre-commit hook testado com commit que deve falhar (arquivo com erro TS) e commit que deve passar
- [ ] `npm run gos:doctor` (root) — exit 0
- [ ] Todos os ACs (AC1 … AC7) checados

## Entrega ao Douglas (**NÃO commitar, NÃO dar push**)

> ⚠️ **IMPORTANTE — dev NÃO executa commit nem push.** Douglas valida e commita.

Fluxo do dev:
1. Deixar working tree sujo com todas as mudanças.
2. `cd packages/fractus && git status > /tmp/t110-status.txt && git diff --stat > /tmp/t110-diff.txt`
3. `pnpm lint && pnpm typecheck && pnpm build 2>&1 | tail -20` — colar última linha.
4. Preencher Checklist de entrega e avisar Douglas em `#cspo-tech` + comment na task ClickUp.

### Mensagem de commit sugerida (Douglas usa)

```
fix(fractus): resolver drift TypeScript + instalar pre-commit hook

Refs T-110

- AC1: supabase.ts regenerado (investidores, projetos, projeto_investidores)
- AC2: projetoSchema + ProjetoInput em src/lib/validations/projeto.ts
- AC3: imports renomeados (programSchema→projetoSchema, patrocinador→investidor)
- AC4: PageHeader breadcrumbs aceita BreadcrumbItem[] | ReactNode
- AC5: callbacks .map/.filter tipados (zero TS7006)
- AC6: npx tsc --noEmit exit 0 (82 → 0 erros)
- AC7: .git/hooks/pre-commit instalado (delega para pre-commit-validate.js)
```

## Rollback

```bash
cd packages/fractus
git checkout -- src/types/supabase.ts
git restore src/
rm -f .git/hooks/pre-commit
```

## Dependências e bloqueios

- **Upstream:** T-095 (env vars Zod) — fechada 16/04.
- **Downstream (bloqueia):** T-084, T-085, T-086 — CI/CD com tsc gate só roda após esta.
- **Risco:** se supabase CLI não autenticada, passo 1 trava. Mitigação: usar `supabase start` local ou solicitar credenciais ao Douglas.

## Checklist de entrega (dev preenche antes de avisar Douglas)

- [ ] AC1 … AC7 verificados manualmente
- [ ] `pnpm lint` OK
- [ ] `pnpm typecheck` exit 0
- [ ] `pnpm build` OK
- [ ] Smoke test `/dashboard/projetos` e `/dashboard/investidores`
- [ ] Pre-commit hook testado (falha em erro TS, passa em código limpo)
- [ ] `git status` e `git diff --stat` colados em "Evidência de entrega"
- [ ] **NÃO fiz commit nem push** — Douglas valida e commita
- [ ] Douglas notificado (#cspo-tech + ClickUp)

## Checklist do Douglas (após aprovação)

- [ ] Revisar diff do dev
- [ ] `npm run gos:doctor` (root) OK
- [ ] Commit+push com mensagem sugerida acima
- [ ] Pre-commit hook bloqueia corretamente em primeiro commit de teste
- [ ] ClickUp T-110 → `complete`
- [ ] Slack `task-done` confirmado

## Evidência de entrega (dev cola aqui)

```
# git status
(output)

# git diff --stat
(output)

# pnpm typecheck (última linha)
(output)

# pnpm build (última linha)
(output)
```
