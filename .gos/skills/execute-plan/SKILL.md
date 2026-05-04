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

## Pre-flight visual smoke (NOVO)

Antes da T-01 (depois do pre-flight de stories acima), gera comparacao visual entre pagina renderizada e frame Figma para capturar gaps grandes ANTES da execucao — evita o padrao PLAN-005 onde feedback iterativo gerou 26 rodadas no fim.

Ativacao:
- Storybook disponivel: usa `.stories.tsx` da pagina-completa quando existe (ex.: `ProjetosPage.stories.tsx`) e renderiza via `npm run storybook -- --static-build` ou screenshot ja gerado em CI.
- Playwright MCP disponivel (`mcp__plugin_playwright_playwright__*`): navega para localhost (rota da pagina + seed declarado em `## Mock strategy` ou seed nativo do projeto) e captura screenshot.
- Nenhum disponivel: pula com warning em `progress.txt` (`smoke=skipped: no storybook story for full page nor playwright MCP`). NAO bloqueia.

Comparacao:
1. Carrega frame Figma principal (`figma_url` do plano) via Figma MCP — extrai layout/secoes esperadas.
2. Confronta screenshot vs frame em 3 dimensoes basicas (sem refazer 4-dim por componente — isso fica no gate por task):
   - **Secoes presentes**: KPI row, toolbar, table, drawer trigger, etc. — cada secao esperada esta no screenshot?
   - **Layout grosseiro**: ordem vertical das secoes; colunas da table batem com Figma?
   - **Cores/tokens primarios**: bg da pagina, accent color, contrast — sem inversao obvia.
3. Output: `<dirs.planos>/<PLAN-NNN-slug>/preflight-smoke.md` com lista de gaps detectados (secao faltando, layout invertido, cor errada).
4. Se gaps detectados: gerar tasks `T-000-XX` (prefixo `000` = pre-flight) com `priority: P0` e prepend no inicio da fila. Renumerar `seq` das tasks subsequentes.

Pre-flight smoke nao substitui o visual gate por task — ele captura gaps grandes (componente faltando, KPI row ausente) que viraram tasks novas em PLAN-004/PLAN-005.

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
   b) Comparar implementacao vs story canonica em 5 dimensoes textuais:
      - **Anatomia**: ordem de slots/elementos (header -> corpo -> footer; icones esquerda/direita; campos do form na ordem do design).
      - **Tokens**: classes Tailwind/variaveis CSS batem com DS (cor, raio, espacamento, tipografia). Quando o componente aparece em `## Page-level overrides` do plano: a divergencia cosmetica registrada NAO falha o gate — o gate confirma que o override foi APLICADO conforme decisao (a/b/c).
      - **Variants**: props expostos cobrem variants da story. Decisao (b) em `## Page-level overrides`: confirmar que a nova variant existe na story canonica.
      - **Densidade**: padding/gap dentro de +-1 step da escala do DS (ou conforme override registrado).
      - **Comportamentos** (NOVO, heuristico via JSX + grep, sem E2E):
        - Para cada `interaction_target:` declarado no frontmatter da task: existe handler implementado no diff? (ex.: `row.onClick` chamando `openDrawer`; `button.onClick` chamando mutation; `form.onSubmit` chamando server action).
        - Estados visuais (skeleton/empty/error/loading) declarados em `## Interações & Estados` renderizam? grep por `isLoading|isPending|isError|empty|skeleton` nos arquivos tocados.
        - Refetch apos mutation: `invalidateQueries` / `router.refresh` / `setState` observavel no diff?
        - Para cada `override_target:` declarado: classes/props da decisao (a/b/c) presentes no diff? grep das classes declaradas em `## Page-level overrides`.
   c) Para a tela como um todo: invocar Figma MCP no `figma_url` do plano e cruzar com o JSX renderizado em arvore (mesmo numero de secoes, mesma hierarquia, mesmas labels).
   d) Output: relatorio curto em `tasks/T-NNN-NN.notes.md` (5 secoes: anatomia, tokens, variants, densidade, comportamentos + secao "Arvore vs Figma").
   e) Divergencia >= 1 item critico (anatomia, tokens nao-overrideados, ou comportamento mapeado sem implementacao) -> falha o gate.

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
- **Storybook como contrato base; Figma da pagina vence em conflito cosmetico**: componente sem `.stories.tsx` em `<dirs.storybook>` bloqueia a task ate ser criado. Divergencia cosmetica entre story e Figma da pagina que ESTA registrada em `## Page-level overrides` do plano: gate confirma aplicacao do override (decisao a/b/c). Divergencia NAO registrada no plano: gate falha — voltar pra `*plan` (ou registrar override no plan.md antes de prosseguir).
- **Comportamento mapeado e vinculante**: `interaction_target:` declarado na task DEVE ter handler/estado implementado e observavel no diff. Caso contrario, gate falha mesmo se anatomia + tokens passarem.

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
