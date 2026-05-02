---
name: execute-plan
description: Executa um plano (PLAN-NNN-<slug>) task-a-task aplicando state machine + visual gate contra Storybook canonico antes de marcar validacao. Non-blocking em backend gaps (abre tasks ClickUp + segue). Comando primario do ambiente Codex IDE.
argument-hint: "<PLAN-NNN-slug> [--task T-NNN-NN] [--skip-visual-gate] [--skip-clickup]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, Agent, AskUserQuestion]
sourceDocs:
  - templates/taskTemplate.md
  - playbooks/plan-creation-playbook.md
  - skills/figma-implement-design/SKILL.md
  - skills/plan-blueprint/SKILL.md
use-when:
  - executar plano ja criado por *plan
  - rodar tasks de um PLAN-NNN com state machine e visual gate
  - ambiente Codex IDE Extension (comando primario)
do-not-use-for:
  - criar plano novo (use plan-blueprint)
  - decompor plano em tasks (use plan-to-tasks)
  - gerenciar progress.txt isoladamente (use progress-tracker)
metadata:
  category: execution
---

Voce esta executando como **Executor de Planos** via skill `execute-plan`. No ambiente Codex IDE Extension este e o comando primario do ciclo `Opus(plan) -> Codex(execute)`.

## Input

$ARGUMENTS

Formato esperado:
- `<PLAN-NNN-slug>` — id do plano (ex.: `PLAN-001-pagina-projetos-inicial`)
- `--task T-NNN-NN` — opcional, executa apenas a task especifica
- `--skip-visual-gate` — opcional, pula visual gate (raro, registra warning)

## Pre-requisitos (gate)

1. Resolver paths via `.gos-local/plan-paths.json`. Se ausente, abortar e instruir o usuario a rodar `*plan` primeiro.
2. Localizar `<dirs.planos>/<PLAN-NNN-slug>/plan.md`. Se ausente, abortar.
3. Ler `plan.md` por completo: frontmatter + Componentes mapeados + Componentes ausentes + Aderencia a stack + Plano de execucao + Checklist de aceite + **Backend pendings**.
4. Validar `stack_ref` do frontmatter contra `<dirs.stack>` (`docs/stack.md`):
   - Calcular sha-curto atual e comparar.
   - Drift detectado: ABORTAR e instruir `*stack drift` + replanejar com `*stack refresh`.
5. Ler `<dirs.progress>` (progress.txt). Se aponta para outro plano ativo, perguntar se troca o foco antes de prosseguir.
6. **Backend pendings (non-blocking)**: ler tabela `## Backend pendings` do `plan.md`. Para cada linha:
   - Sem `ClickUp ID` -> criar task via `mcp__clickup__clickup_create_task` (assignee `112010775` salvo override `ASSIGNEE` no plano, list de `clickup.backend_list_id` em `plan-paths.json`, titulo `[Backend] PLAN-NNN: <gap>`). Gravar ID retornado de volta na coluna `ClickUp ID` do `plan.md`.
   - Com `ClickUp ID` -> consultar `mcp__clickup__clickup_get_task <ID>`. Atualizar coluna `Status`. Se ainda aberta, registrar em `progress.txt` como `blockers=<T-IDs>:<ClickUp-ID>:<gap-curto>` (uma linha por bloqueio ativo).
   - `--skip-clickup` desliga MCP; nesse caso so registra warning visivel mantendo o que ja esta no plano.
   - **Importante**: backend gap aberto NAO aborta o execute-plan. Tasks frontend que dependem do gap serao classificadas como `bloqueada-backend` no loop abaixo; tasks sem dependencia seguem normal.

## Pre-flight visual

(Pulado quando `--skip-visual-gate` presente — registrar warning em `tasks/T-NNN-NN.notes.md` da primeira task.)

1. Resolver `<dirs.storybook>` via `plan-paths.json`. Path absoluto fora do repo do projeto e valido (ex.: `E:\Github\Ganbatte\tmp\fractus-storybook`).
2. Indexar todos `.stories.tsx` disponiveis em `<dirs.stories>` ou `<dirs.components>`.
3. Para cada linha da tabela "Componentes mapeados" do plano:
   - Confirmar que a coluna `Story (path)` aponta para arquivo existente.
   - Se ausente: gerar task de criacao do componente ANTES das tasks de implementacao. Renumerar `seq` das tasks restantes.
4. Output do pre-flight: bloco em `progress.txt` campo `notes=` com numero de stories indexadas e tasks de criacao geradas.

## Loop por task

Iterar tasks em ordem de `seq`. Antes de executar cada task, **classificar**:

- Ler frontmatter `depends_on_backend:` da task (campo opcional, default `[]`). Cada item referencia uma `gap-key` da tabela `## Backend pendings` do plano (ex.: `migration-20260501150000`, `endpoint-projetos-fields`).
- Se a task referencia gap em aberto (status no ClickUp != `concluido`/`closed`):
  - `*progress status T-NNN-NN bloqueada-backend` (transicao livre desde `pendente` ou `em-andamento`).
  - Anotar em `tasks/T-NNN-NN.notes.md` linha `## Bloqueada backend <iso>` com ClickUp IDs.
  - **PULAR** task — NAO falha o loop, segue pra proxima.
- Se a task tem `depends_on_backend: []` ou todas as dependencias estao `concluido` no ClickUp -> seguir fluxo normal abaixo.

Para cada task **executavel**:

1. **Mover para em-andamento**: `*progress status T-NNN-NN em-andamento`. State machine valida transicao.
2. **Despachar agent**: ler `labels: [agent:<slug>]` da task. Default: `dev`. Invocar via Agent tool com prompt completo (objetivo, plano de execucao, DoD, paths relevantes).
3. **Implementacao**: agent edita arquivos seguindo o plano de execucao da task. Stack como contrato — nada fora de `docs/stack.md` salvo se `arch_change=true` no frontmatter do plano pai.
4. **Visual gate** (antes de propor `validacao`):

   Para cada componente alterado/criado pela task:

   a) Localizar `<Componente>.stories.tsx` em `<dirs.storybook>`.
   b) Comparar implementacao vs story canonica em 4 dimensoes textuais:
      - **Anatomia**: ordem de slots/elementos (header -> corpo -> footer; icones esquerda/direita; campos do form na ordem do design).
      - **Tokens**: classes Tailwind/variaveis CSS batem com DS (cor, raio, espacamento, tipografia).
      - **Variants**: props expostos cobrem variants da story.
      - **Densidade**: padding/gap dentro de +-1 step da escala do DS.
   c) Para a tela como um todo: invocar Figma MCP no `figma_url` do plano e cruzar com o JSX renderizado em arvore (mesmo numero de secoes, mesma hierarquia, mesmas labels).
   d) Output: relatorio curto em `tasks/T-NNN-NN.notes.md` (4 secoes: anatomia, tokens, variants, densidade + secao "Arvore vs Figma").
   e) Divergencia >= 1 item critico (anatomia ou tokens) -> falha o gate.

5. **Resultado do gate**:
   - Sucesso -> `*progress status T-NNN-NN validacao`. Preparar arquivos staged (sem commit).
   - Falha -> manter em `em-andamento`, gravar diff em `T-NNN-NN.notes.md`, retornar pra etapa 3.

## Fechamento

Quando o loop terminar (todas as tasks executaveis em `validacao` ou puladas em `bloqueada-backend`):

1. Listar arquivos modificados via `git diff --name-only`.
2. Preparar commit (NAO push). Mensagem segue Conventional Commits + referencia ao `PLAN-NNN-slug`. Se houve tasks bloqueadas, citar na mensagem (ex.: `feat(checkout): PLAN-042 T-01..T-05 (T-06,T-07 bloqueadas backend CU-XXX)`).
3. Resumo final ao usuario em 4 blocos:
   ```
   [execute-plan] PLAN-NNN-<slug>

   tasks validacao:    <N>  (T-..., T-...)
   bloqueada-backend:  <K>  (T-...:CU-..., ...)
   backend pendings:   <X>  abertas no ClickUp / <Y> concluidas
   visual gate:        passou / falhou em (T-...)

   proximo passo: *validate-plan PLAN-NNN-<slug>
   ```
4. Indicar que o turn seguinte e `*validate-plan PLAN-NNN-<slug>` (skill `validate-plan`, ambiente Opus 4.7). NAO marcar `concluido` automaticamente — `validate-plan` cuida disso.

## Ambiente Codex IDE — observacoes

- O usuario invoca `*execute-plan` direto no Codex. A skill carrega via wrapper em `.codex/skills/gos-execute-plan/SKILL.md`.
- Toda chamada a outros agents/skills do G-OS dentro do execute-plan deve usar o adapter Codex correspondente (`.codex/agents/`, `.codex/commands/`).
- Se a chamada cair pra outro adapter (Claude/Qwen/etc) a sessao quebra — abortar com mensagem clara.

## Regras criticas

- **Visual gate nao e opcional** salvo `--skip-visual-gate` explicito. Skill nao silencia o gate.
- **Sem push automatico**: commit fica preparado. Push e responsabilidade do humano.
- **State machine inviolavel**: transicao `concluido` ocorre via `*validate-plan` (auto-marca quando passa). Rollback humano: `*progress status T-NNN-NN pendente --rollback`.
- **Non-blocking em backend gaps**: gap aberto no ClickUp NAO aborta. Tasks dependentes viram `bloqueada-backend`, demais seguem.
- **Storybook como contrato**: componente sem `.stories.tsx` em `<dirs.storybook>` bloqueia a task ate ser criado.

## Model guidance

| Escopo | Modelo |
|--------|--------|
| Task simples (1 componente, sem novo padrao) | `sonnet` |
| Task que toca multiplos componentes ou logica de fetching | `opus` |
| Visual gate / comparacao com Figma | inherit (modelo do agent) |

## Instructions

1. NUNCA pular o pre-flight visual sem flag explicita.
2. Resolver TODOS os paths via `plan-paths.json`.
3. Visual gate produz relatorio em `T-NNN-NN.notes.md` mesmo em caso de sucesso.
4. Status final esperado: todas as tasks em `validacao`, commit preparado, humano notificado.
