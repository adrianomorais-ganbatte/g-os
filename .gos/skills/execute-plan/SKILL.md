---
name: execute-plan
description: Executa um plano (PLAN-NNN-<slug>) task-a-task aplicando state machine + visual gate contra Storybook canonico antes de marcar validacao. Comando primario do ambiente Codex IDE.
argument-hint: "<PLAN-NNN-slug> [--task T-NNN-NN] [--skip-visual-gate]"
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
3. Ler `plan.md` por completo: frontmatter + Componentes mapeados + Componentes ausentes + Aderencia a stack + Plano de execucao + Checklist de aceite.
4. Validar `stack_ref` do frontmatter contra `<dirs.stack>` (`docs/stack.md`):
   - Calcular sha-curto atual e comparar.
   - Drift detectado: ABORTAR e instruir `*stack drift` + replanejar com `*stack refresh`.
5. Ler `<dirs.progress>` (progress.txt). Se aponta para outro plano ativo, perguntar se troca o foco antes de prosseguir.

## Pre-flight visual

(Pulado quando `--skip-visual-gate` presente — registrar warning em `tasks/T-NNN-NN.notes.md` da primeira task.)

1. Resolver `<dirs.storybook>` via `plan-paths.json`. Path absoluto fora do repo do projeto e valido (ex.: `E:\Github\Ganbatte\tmp\fractus-storybook`).
2. Indexar todos `.stories.tsx` disponiveis em `<dirs.stories>` ou `<dirs.components>`.
3. Para cada linha da tabela "Componentes mapeados" do plano:
   - Confirmar que a coluna `Story (path)` aponta para arquivo existente.
   - Se ausente: gerar task de criacao do componente ANTES das tasks de implementacao. Renumerar `seq` das tasks restantes.
4. Output do pre-flight: bloco em `progress.txt` campo `notes=` com numero de stories indexadas e tasks de criacao geradas.

## Loop por task

Iterar tasks em ordem de `seq`. Para cada `tasks/T-NNN-NN-*.md`:

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

Quando todas as tasks atingirem `validacao` E o checklist de aceite do plano estiver marcado:

1. Listar arquivos modificados via `git diff --name-only`.
2. Preparar commit (NAO push). Mensagem segue Conventional Commits + referencia ao `PLAN-NNN-slug`.
3. Resumo final ao usuario:
   - Path do plano + numero de tasks concluidas.
   - Lista de componentes que passaram/falharam o visual gate.
   - Comando exato para o humano marcar `concluido`: `*progress status T-NNN-NN concluido` (apos validacao humana + smoke E2E).

## Ambiente Codex IDE — observacoes

- O usuario invoca `*execute-plan` direto no Codex. A skill carrega via wrapper em `.codex/skills/gos-execute-plan/SKILL.md`.
- Toda chamada a outros agents/skills do G-OS dentro do execute-plan deve usar o adapter Codex correspondente (`.codex/agents/`, `.codex/commands/`).
- Se a chamada cair pra outro adapter (Claude/Qwen/etc) a sessao quebra — abortar com mensagem clara.

## Regras criticas

- **Visual gate nao e opcional** salvo `--skip-visual-gate` explicito. Skill nao silencia o gate.
- **Sem push automatico**: commit fica preparado. Push e responsabilidade do humano.
- **State machine inviolavel**: transicao `concluido` so apos humano validar + checklist.
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
