---
name: validate-plan
description: Valida implementacao pos-execute. Para cada task em validacao, re-roda visual gate curto (anatomia + tokens), confronta diff staged contra Componentes mapeados, confere checklist do plano. Auto-marca concluido o que passa. Fecha plano quando todas as tasks fecham E backend pendings ClickUp estao concluidas.
argument-hint: "<PLAN-NNN-slug> [NOTAS=...]"
allowedTools: [Read, Glob, Grep, Bash, Edit, Agent, AskUserQuestion]
sourceDocs:
  - templates/planTemplate.md
  - templates/taskTemplate.md
  - playbooks/plan-creation-playbook.md
  - skills/execute-plan/SKILL.md
  - skills/progress-tracker/SKILL.md
use-when:
  - validar plano apos *execute-plan ter rodado
  - fechar tasks em validacao -> concluido apos checklist + visual gate curto
  - confirmar que diff staged bate com Componentes mapeados do plano
do-not-use-for:
  - executar tasks (use execute-plan)
  - criar plano novo (use plan-blueprint)
  - decompor plano em tasks (use plan-to-tasks)
metadata:
  category: validation
---

Voce esta executando como **Revisor de Planos** via skill `validate-plan`. Fecha o ciclo `*plan -> *execute-plan -> *validate-plan`. Ambiente recomendado: Opus 4.7 (revisor); funciona em qualquer IDE.

## Input

$ARGUMENTS

Formato esperado:
- `<PLAN-NNN-slug>` — id do plano (ex.: `PLAN-001-pagina-projetos-inicial`)
- `NOTAS="..."` — opcional, contexto de QA / desvios conhecidos

## Pre-requisitos (gate)

1. Resolver paths via `.gos-local/plan-paths.json`. Ausente -> abortar.
2. Localizar `<dirs.planos>/<PLAN-NNN-slug>/plan.md`. Ausente -> abortar.
3. Ler `plan.md` por completo: frontmatter + Componentes mapeados + Plano de execucao + Checklist de aceite + Backend pendings.
4. Listar arquivos staged: `git diff --staged --name-only`. Vazio -> warning visivel ("nenhuma alteracao staged; *execute-plan rodou?") mas NAO aborta — pode validar plano que ja foi commitado, comparando com `git log` desde `validated_at` ou `created_at`.
5. Ler `<dirs.progress>` (progress.txt). Confirmar que `plan_active` casa com o argumento; se outro plano estiver ativo, perguntar antes de prosseguir.

## Loop por task

Iterar tasks em `<dirs.planos>/<PLAN-NNN-slug>/tasks/` cujo frontmatter status seja `validacao`. Tasks em outros estados (pendente, em-andamento, bloqueada-backend, concluido) sao puladas com log curto.

Para cada `T-NNN-NN-*.md` em `validacao`:

1. **Visual gate curto**: para cada componente do plano que a task tocou:
   a) Localizar `<Componente>.stories.tsx` em `<dirs.storybook>`.
   b) Comparar implementacao vs story canonica em 2 dimensoes (curto, sem refazer Figma MCP):
      - **Anatomia**: ordem de slots/elementos.
      - **Tokens**: classes Tailwind/variaveis CSS batem com DS.
   c) Output: append em `tasks/T-NNN-NN.notes.md` na secao `## Validate run <iso>`.
2. **Confronto diff x mapeamento**: arquivos alterados pela task estao listados em "Componentes mapeados" do plano? Arquivos fora do mapeamento -> warning (nao falha por padrao).
3. **Checklist da task (DoD)**: ler `## Criterios de aceitacao` da task. Itens nao marcados (`[ ]`) = falha automatica.
4. **Resultado**:
   - **Tudo bate** -> `*progress status T-NNN-NN concluido` (auto-marca; rollback humano via `*progress status T-NNN-NN pendente --rollback` se necessario).
   - **Falha** -> mantem `validacao`, registra divergencia em `T-NNN-NN.notes.md` secao `## Validate run <iso>`, devolve `current=` no progress apontando pra essa task.

## Fechamento do plano

Apos o loop:

1. **Checklist do plano**: ler `## Checklist de aceite` em `plan.md`. Itens nao marcados -> plano permanece em `validacao` mesmo se todas as tasks fecharam.
2. **Backend pendings**: ler `## Backend pendings`. Para cada linha com `ClickUp ID`:
   - Consultar `mcp__clickup__clickup_get_task <ID>`.
   - Se status != `concluido`/`closed` -> bloqueio ainda ativo.
   - Atualizar coluna `Status` da tabela com o estado atual do ClickUp.
3. **Decisao**:
   - Todas tasks `concluido` + checklist do plano marcado + backend pendings todos `concluido` no ClickUp -> marcar `plan.md` frontmatter `validated_at: <iso>` + `*progress status PLAN-NNN-<slug> concluido`.
   - Caso contrario -> manter `validacao`, listar bloqueios.
4. **Push**: NAO. Commit ja foi preparado por `*execute-plan`. Push e ato consciente humano (`git push`).

## Saida final ao usuario

Resumo em 4 blocos:

```
[validate-plan] PLAN-NNN-<slug>

tasks concluidas:   <N>  (T-..., T-...)
tasks pendentes:    <M>  (T-..., T-...)
bloqueada-backend:  <K>  (T-...:CU-..., ...)
backend pendings:   <X>  abertas no ClickUp / <Y> concluidas

plano: <concluido | validacao>
proximo passo: <git push | resolver bloqueios | re-rodar visual gate em T-...>
```

## Diferenca x execute-plan (anti-overlap)

- `execute-plan`: visual gate completo (4 dimensoes + Figma MCP), executa codigo via Agent tool, opera estado `em-andamento`.
- `validate-plan`: visual gate curto (2 dimensoes, sem Figma MCP), nao executa codigo, opera estado `validacao -> concluido`. Reaproveita `notes.md` mas em secao separada `## Validate run <iso>`.

Se `validate-plan` detectar que uma task em `validacao` claramente NAO foi implementada (diff staged nao toca os arquivos esperados), nao reabre execucao — devolve falha clara e instrui usuario a rodar `*execute-plan PLAN-NNN-<slug> --task T-NNN-NN`.

## Regras criticas

- **Auto-conclusao e default**: tudo que passa em checklist + visual gate curto + diff vira `concluido` automaticamente. Rollback humano sempre disponivel.
- **Sem push automatico**: commit ja preparado pelo `*execute-plan`, push e manual.
- **State machine respeitada**: tasks `bloqueada-backend` ficam intocadas — backend tem que fechar primeiro.
- **Backend pendings via ClickUp MCP**: se MCP indisponivel, registra warning e mantem plano em `validacao` ate humano confirmar manualmente.

## Model guidance

| Escopo | Modelo |
|--------|--------|
| Validacao curta de plano com poucas tasks | `sonnet` |
| Plano grande (10+ tasks, varios componentes) | `opus` |
| Visual gate curto (2 dimensoes, sem Figma MCP) | inherit |

## Instructions

1. NUNCA pular checklist do plano — itens nao marcados bloqueiam fechamento.
2. NUNCA marcar `concluido` sem visual gate curto rodado e gravado em `T-NNN-NN.notes.md`.
3. Backend pendings via ClickUp MCP sao vinculantes — plano so fecha quando todos `concluido`.
4. Resolver TODOS os paths via `plan-paths.json`.
5. Output final: 4-block summary + comando exato de proximo passo (push manual, ou comandos para resolver bloqueios).
