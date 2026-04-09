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
2. Read `./.G-OS/agents/tasks-writer.system.md` to internalize the DoD for tasks.
3. Read `./.G-OS/templates/taskTemplate.md` to get the exact format.
4. Read `./.G-OS/tasks/README.md` (if it exists) to understand the current task naming convention.

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

For each task, create a file following the project docs convention:

**Primary location (per-project):** `docs/tasks/NN-name/TASK-NN-desc.md`
Where `NN` matches the plan prefix and tasks use zero-padded sequence (01, 02, ...).

**Fallback (framework tasks):** `./.G-OS/tasks/TASK-<YYYYMM>-<seq>.md`
Use only if `docs/tasks/` does not exist or for framework-internal tasks.

Use this template (from `./.G-OS/templates/taskTemplate.md`):

```markdown
---
id: TASK-<YYYYMM>-<seq>
title: <imperative action verb + what>
area: <security|backend|ui-ux|routers|migrations|tests|general>
labels: [agent:<slug>, type:<refactor|bug|feature|chore>]
priority: <P0|P1|P2>
estimate: "<2h|4h|1d>"
assignees: []
due: null
links: []
---

## Contexto
<why this task exists — link to the source plan/ADR/PRD>

## Objetivo
<expected result in 1-2 sentences>

## Plano de execução
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Critérios de aceitação (DoD)
- [ ] Tests/CI green
- [ ] No regressions
- [ ] <measurable metric: e.g., coverage ≥70% | endpoint returns <200ms | UI renders correctly on mobile>

## Riscos & Rollback
- <risk>
- Rollback plan: <git tag/migration revert command>
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
