---
name: plan-to-tasks
description: Parse a plan, ADR, PRD, or spec document and generate actionable task files in ./.G-OS/tasks/ using the project task template. Use when given a planning document and asked to break it into tasks.
argument-hint: "<path-to-plan-file-or-description>"
use-when:
  - receber um plano, PRD, ADR ou spec e precisar gerar tasks executaveis
  - iniciar sprint a partir de documento de planejamento ja aprovado
  - quebrar entrega grande em tarefas independentes com DoD mensuravel
  - coordenar dependencias entre camadas tecnicas (back, front, DB, testes)
do-not-use-for:
  - criar plano do zero sem documento de entrada (use brainstorming ou project-brief)
  - estimar esforco sem contexto de codebase (use qa ou senior-review)
metadata:
  category: workflow-automation
---

You are operating as a **Tasks Writer** for the G-OS project, following the G-OS Agent-Driven Agile methodology.

## Input
$ARGUMENTS

## Procedure

### Phase 1 — Read & understand the input
1. If `$ARGUMENTS` is a file path, read that file. If it's a description, work from the description.
2. Resolver paths via `.gos-local/plan-paths.json` (helper: `scripts/tools/plan-paths.js`). Se ausente, criar com defaults.
3. Read `templates/taskTemplate.md` (canonical do framework) para o formato exato — superseda qualquer template legado em `.G-OS/templates/`.
4. Se o input for um plano gerado por `plan-blueprint`, herdar `plan_id` do frontmatter para encadear `T-NNN-NN` corretamente.

### Phase 2 — Decompose into tasks
Analyze the plan and extract:
- **Distinct deliverables** → one task per deliverable (not per sub-step)
- **Technical layers**: DB migrations, API routes, frontend components, tests — each may be a separate task if non-trivial
- **Dependencies**: task A must complete before task B
- **Priority**: P0 (blocking/critical), P1 (important), P2 (nice-to-have)

Rules:
- Each task must be **independently deliverable** (can be reviewed in isolation)
- Maximum task size: **1 day** estimate. Split larger work.
- Every task needs a **measurable DoD** — no "improve X" without a metric

### Phase 3 — Generate task files

For each task, create a file following o caminho resolvido em `plan-paths.json`:

**Primary location:** `<dirs.tasks>` com `{plan}` substituído pelo `plan_id` do plano (ex.: `docs/plans/PLAN-042-checkout/tasks/T-042-01-<slug>.md`).

**Fallback** (apenas se rodando sem `plan-paths.json` ou para tasks internas do framework): `./.gos/data/tasks/T-<YYYYMM>-<seq>.md`.

Naming: usar `naming.task_prefix` e `naming.seq_padding` do `plan-paths.json` (defaults: `T`, padding 3 → `T-042-001`).

**Template — CONTRATO DURO**: a estrutura canônica vive em `templates/taskTemplate.md`. Esta skill **DEVE ler esse arquivo na Phase 1** e usar **exatamente** os campos do frontmatter de lá — sem omitir, renomear ou reordenar. NÃO reproduza template inline aqui (já causou bug onde tasks geradas não tinham `status:` no frontmatter — rastreável a planos com tasks travadas em `pendente` mesmo após execução).

Campos obrigatórios do frontmatter (do `taskTemplate.md`, presentes em CADA T-NN.md gerado):
- `id`, `plan_id`, `seq`, `title`, `area`, `labels`, `priority`, `estimate`
- **`status: pendente`** — invariante. Sem isso o `progress-tracker` não consegue transicionar e o `*execute-plan`/`*validate-plan` quebram.
- `valida_em`, `depends_on_backend: []`, `interaction_target: []`, `override_target: []`, `assignees: []`, `links: []`

Body: copiar as seções do `taskTemplate.md` (`## Contexto`, `## Objetivo`, `## Plano de execução`, `## Critérios de aceitação (DoD)`, `## Riscos & Rollback`) — **NÃO** adicionar seção `## Status` no body. Status vive APENAS no frontmatter.

### Phase 3.5 — Verificação pós-geração (gate)

Para cada `T-NN*.md` gerado: confirmar que `head -1` retorna `---` E o frontmatter contém literalmente `status: pendente`. Se qualquer task falhar, regerar (não prosseguir com tasks malformadas — silenciar aqui é o bug original).

```bash
for f in <dirs.tasks>/T-*.md; do
  head -1 "$f" | grep -q '^---$' || { echo "FALHA frontmatter: $f"; exit 1; }
  grep -q '^status: pendente$' "$f" || { echo "FALHA status: $f"; exit 1; }
done
```

### Phase 4 — Output a summary

After creating all task files, output:

```
## Tasks created from: <source plan name>

| Task ID | Title | Priority | Estimate | Agent |
|---------|-------|----------|----------|-------|
| TASK-YYYYMM-001 | ... | P0 | 4h | backend |
| TASK-YYYYMM-002 | ... | P1 | 1d | fe |
...

## Dependency order
1. TASK-001 (migrations) → 2. TASK-002 (backend routes) → 3. TASK-003 (frontend)

## Next step
Run `/tdd TASK-YYYYMM-001` to start test-driven implementation of the first task.
```

## Model guidance

| Scope | Recommended model |
|-------|-------------------|
| Decompose a small, clear spec into 3-5 tasks | `sonnet` (default) |
| Large PRD/ADR with ambiguity, many dependencies, prioritization | `opus` |

> Plan decomposition always requires at least `sonnet` — Haiku misses dependencies and produces vague DoDs.

## Agent slugs reference
- `backend` — Fastify routes, Supabase, SQLite, migrations
- `fe` — React components, hooks, pages
- `tests` — Vitest tests, coverage
- `security` — Auth, permissions, RLS
- `devops` — CI/CD, deployments
- `uiuxPlanner` — UX improvements, accessibility
- `debugger` — Bug investigation
- `general` — Documentation, config, chores

## When to Use
- Use according to the triggers described in the description/use-when list.

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Instructions
1) Siga o passo-a-passo principal da skill.
2) Valide saa com checklists desta skill ou do workflow.
3) Registre decises relevantes se aplic5vel.
