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

**Gate de formato (pre-loop)**: para cada `T-NN*.md` em `<dirs.planos>/<PLAN-NNN-slug>/tasks/`, confirmar `head -1 == "---"` E `grep -q '^status:'` no frontmatter. Tasks malformadas (sem frontmatter ou usando `## Status` no body) sao registradas como erro de plano: validate-plan ABORTA com mensagem `tasks-malformadas: <lista> — rodar scripts/integrations/migrate-task-status.js OU regerar via plan-to-tasks`. Isso evita o falso negativo onde tasks com codigo pronto aparecem `pendente` por bug de gerador (caso PLAN-006).

Iterar tasks cujo frontmatter `status:` seja `validacao`. Tasks em outros estados (pendente, em-andamento, bloqueada-backend, concluido) sao puladas com log curto.

**Diagnostico do bug PLAN-006**: se TODAS as tasks estao em `pendente` E `git diff --staged` ou `git log --since=<plan.created_at>` mostra alteracoes nos arquivos esperados, e provavel que `*execute-plan` rodou sem transicionar (bug do executor). Reportar como `executor-skipped-progress` e instruir humano: rodar `migrate-task-status.js --infer-from-diff` OU re-rodar `*execute-plan PLAN-NNN-<slug>` (que agora tem pos-condicao obrigatoria).

Para cada `T-NNN-NN-*.md` em `validacao`:

1. **Visual gate curto**: para cada componente do plano que a task tocou:
   a) Localizar `<Componente>.stories.tsx` em `<dirs.storybook>`.
   b) Comparar implementacao vs story canonica em 3 dimensoes (curto, sem refazer Figma MCP completo):
      - **Anatomia**: ordem de slots/elementos.
      - **Tokens**: classes Tailwind/variaveis CSS batem com DS — divergencia registrada em `## Page-level overrides` do plano NAO falha (gate confirma aplicacao do override).
      - **Comportamentos**: para cada `interaction_target:` da task, grep do handler/estado no diff. Para cada `override_target:` da task, grep das classes/props da decisao.
   c) Output: append em `tasks/T-NNN-NN.notes.md` na secao `## Validate run <iso>`.
2. **Confronto diff x mapeamento**: arquivos alterados pela task estao listados em "Componentes mapeados" do plano? Arquivos fora do mapeamento -> warning (nao falha por padrao).
3. **Checklist da task (DoD)**: ler `## Criterios de aceitacao` da task. Itens nao marcados (`[ ]`) = falha automatica.
4. **Triagem da falha (regra: backend nao impacta frontend)**: quando algum item falha, **classificar a causa-raiz** antes de decidir o estado:
   - Causa **frontend** (componente faltando, classe errada, handler ausente, anatomia divergente, token errado, comportamento mapeado sem implementacao no diff): **falha real do frontend** -> mantem `validacao`, registra em `T-NNN-NN.notes.md`.
   - Causa **backend** (smoke falha por ACL/visibilidade/permissao por perfil; dados ausentes no DB; endpoint nao retorna o shape esperado; coluna `-` por seed incompleto fora do escopo da task; perfil/role sem acesso ao recurso): **NAO e falha do frontend**. Acao:
     a) Marcar a task como `concluido` se o codigo frontend esta correto (passou nas 3 dimensoes do gate curto).
     b) Abrir/atualizar entrada em `## Backend pendings` do `plan.md` descrevendo o gap (ex.: `acl-lideranca-projetos-detalhe`, `seed-area-projeto`, `endpoint-projetos-detalhes-by-perfil`).
     c) Criar/atualizar task ClickUp via `mcp__clickup__clickup_create_task` (assignee `112010775`, list `clickup.backend_list_id`). Gravar `ClickUp ID` na tabela.
     d) Registrar em `T-NNN-NN.notes.md` secao `## Validate run <iso>` o motivo da reclassificacao.
   - Causa **ambigua** (nao da pra decidir entre fe/be sem investigacao adicional): mantem `validacao` E abre task ClickUp investigativa. NAO bloquear o plano por ambiguidade.

   **Tudo bate** -> `*progress status T-NNN-NN concluido` (auto-marca; rollback humano via `*progress status T-NNN-NN pendente --rollback` se necessario).

## Fechamento do plano

Apos o loop:

1. **Cobertura de comportamento**: ler `## Interações & Estados` em `plan.md`. Para cada bullet (slug): existe AO MENOS 1 task com `interaction_target:` apontando pra ele E status `concluido`? Bullet sem cobertura -> plano permanece em `validacao` (registrar em `T-NNN-NN.notes.md` da task mais proxima do dominio).
2. **Cobertura de overrides**: ler `## Page-level overrides`. Cada linha com decisao (a/b/c) tem task `concluido` cobrindo? grep do `override_target:` correspondente nos frontmatter de tasks. Override sem cobertura -> plano permanece em `validacao`.
3. **Checklist do plano**: ler `## Checklist de aceite` em `plan.md`. Itens nao marcados -> plano permanece em `validacao` mesmo se todas as tasks fecharam.
4. **Backend pendings**: ler `## Backend pendings`. Para cada linha com `ClickUp ID`:
   - Consultar `mcp__clickup__clickup_get_task <ID>`.
   - Se status != `concluido`/`closed` -> bloqueio ainda ativo.
   - Atualizar coluna `Status` da tabela com o estado atual do ClickUp.
5. **Decisao**:
   - Todas tasks `concluido` + cobertura de comportamento + cobertura de overrides + checklist do plano marcado + backend pendings todos `concluido` no ClickUp -> marcar `plan.md` frontmatter `validated_at: <iso>` + `*progress status PLAN-NNN-<slug> concluido`.
   - Caso contrario -> manter `validacao`, listar bloqueios.
6. **Push**: NAO. Commit ja foi preparado por `*execute-plan`. Push e ato consciente humano (`git push`).

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

- `execute-plan`: visual gate completo (5 dimensoes + Figma MCP arvore), pre-flight smoke (screenshot vs frame), executa codigo via Agent tool, opera estado `em-andamento`.
- `validate-plan`: visual gate curto (3 dimensoes — anatomia, tokens, comportamentos — sem Figma MCP completo), nao executa codigo, opera estado `validacao -> concluido`, valida cobertura de `interaction_target` e `override_target` no plano. Reaproveita `notes.md` em secao separada `## Validate run <iso>`.

Se `validate-plan` detectar que uma task em `validacao` claramente NAO foi implementada (diff staged nao toca os arquivos esperados), nao reabre execucao — devolve falha clara e instrui usuario a rodar `*execute-plan PLAN-NNN-<slug> --task T-NNN-NN`.

## Regras criticas

- **Auto-conclusao e default**: tudo que passa em checklist + visual gate curto + diff vira `concluido` automaticamente. Rollback humano sempre disponivel.
- **Backend nao impacta status de tasks frontend**: smoke ou e2e que falha por ACL/visibilidade/dados/endpoint NAO mantem task frontend em `validacao` — reclassifica como `concluido` (codigo OK) + abre/atualiza `Backend pendings` + ClickUp. O fechamento do plano fica bloqueado pelo ClickUp do backend, NAO pela task frontend.
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
