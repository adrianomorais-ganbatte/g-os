---
name: plan-blueprint
description: Cria um plano padronizado para uma tela (1 plano = 1 tela) seguindo a stack-of-record do projeto. Produz {plano, tasks, contexto, entrada-progress.txt} em três fases (Mapeamento → Aderência à stack → Execução). Pré-requisito duro: docs/stack.md existir. Subdivide automaticamente telas com seções autônomas múltiplas.
argument-hint: "<tela> OBJETIVO=<implantacao|correcao|refactor> FIGMA=<url> [FIGMA+=...] [--from-figma-mcp] [--allow-arch-change] [--skip-clickup]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, Agent, AskUserQuestion]
sourceDocs:
  - templates/planTemplate.md
  - templates/contextTemplate.md
  - playbooks/plan-creation-playbook.md
use-when:
  - criar plano de implementação para uma tela específica
  - input começa com URL Figma (auto-detectado)
  - planejar feature de UI com componentes do design system
do-not-use-for:
  - planejamento de sprint inteira (use sprint-planner)
  - decomposição de plano pronto em tasks (use plan-to-tasks)
  - alterações que mudam stack (gerar ADR primeiro, depois rodar com --allow-arch-change)
metadata:
  category: planning
---

Você está executando como **Tech Lead Frontend / Arquiteto Sênior** via skill `plan-blueprint`.

## Input

$ARGUMENTS

Campos obrigatórios no prompt:
- `OBJETIVO` — `implantacao` | `correcao` | `refactor`
- `FIGMA` — URL do frame principal (auto-ativa Figma MCP)
- `INTERACOES` — lista estruturada de interações da tela (`<Elemento> — <trigger> → <ação> → <resultado>`). **Obrigatório quando a tela tem table com row clicável OU drawer/modal/popup OU botão que dispara ação assíncrona**. `gos-master` recusa o `*plan` se vazio nessas condições.

Opcionais:
- `FIGMA+` — lista de URLs de componentes
- `NOTAS` — prosa livre (invioláveis, edge cases, contexto adicional)
- `ASSIGNEE` — override do user_id ClickUp para tasks de backend (default: 112010775)

Auto-resolvido pelo `gos-master` (comprehension gate, NÃO pedir ao usuário):
- `PROJETO` — `cwd`; ambíguo → `~/.claude/.gos-state/last-project.json`
- `WORK_BRANCH` — tela em Storybook → `feat/storybook`; senão → `dev`
- `STORYBOOK_DIR/BRANCH` — `plan-paths.json`
- `BUSINESS_RULES` — `<PROJETO>/docs/regras-de-negocio/` (indexar e registrar em progress.txt)
- `POSTMAN` — `<PROJETO>/docs/postman/` (idem)
- `BACKEND/RLS/SEED/SMOKE_E2E` — derivado de `stack.md` + regras + Postman

OBJETIVO muda postura:

| Valor | Comportamento |
|-------|---------------|
| `implantacao` | Cria do zero — Fase 1 → 2 → 3 padrão |
| `correcao` | Modo cirúrgico — diff vs Storybook canônico, 1 task por componente, sem reescrever |
| `refactor` | Implica `--allow-arch-change` + ADR obrigatória |

Flags:
- `--from-figma-mcp` — força leitura via Figma MCP (default quando `FIGMA=` é Figma URL)
- `--allow-arch-change` — libera Fase 2 propositiva (gera ADR); implícito em `OBJETIVO=refactor`
- `--skip-clickup` — não cria tasks de backend automaticamente

## Pré-requisitos (gate)

1. Resolver paths via `.gos-local/plan-paths.json` (criar se ausente).
2. **Verificar `docs/stack.md` (caminho de `dirs.stack`)**:
   - Se ausente: ABORTAR. Despachar `stack-profiler refresh` e instruir o usuário a re-executar.
   - Se presente: ler integralmente. Verificar drift via `*stack drift` antes de prosseguir.
3. Ler `progress.txt` se existir (memória L1).
4. **Verificar `dirs.storybook`** (caminho do `plan-paths.json`):
   - Se ausente OU diretório não existe: ABORTAR. Pedir caminho ao usuário (path absoluto fora do repo é válido, ex.: `E:\Github\Ganbatte\tmp\fractus-storybook`) e gravar em `plan-paths.json`.
   - Se presente: indexar `.stories.tsx` disponíveis (lista usada na Fase 1.3).

## Fase 1 — Mapeamento Visual & Componentização

### 1.1 Carregar referências do design system

Ler (paths via `plan-paths.json`):
- `dirs.design_system_doc`
- `dirs.components/` (inspecionar nomes e props)
- `dirs.stories/` (entender padrões de uso)

### 1.2 Analisar a tela

Se Figma MCP ativo: invocar Figma MCP para extrair árvore de nodes.
Caso contrário: trabalhar pela descrição/screenshot fornecido.

### 1.3 Mapear componentes

Produzir tabela:

| Elemento (Figma/descrição) | Componente do DS | Story (path) | Variant | Props relevantes | Comportamento |
|----------------------------|------------------|--------------|---------|-------------------|---------------|

A coluna `Story (path)` aponta para `.stories.tsx` indexado no gate. Componente sem story correspondente NÃO entra na tabela — vai pra "Componentes ausentes" e gera task de criação.

Coluna `Comportamento` é obrigatória quando o elemento é interativo. Refinamentos cosméticos (bg, border, padding) NÃO entram aqui — vão para `## Page-level overrides` (Fase 1.4 abaixo).

Listar **componentes ausentes** separadamente — sinalizar como bloqueio ou candidato a criação (vai virar task própria).

### 1.4 Comportamentos & Overrides

Sub-fase nova que materializa intenção de uso e divergência Figma↔Storybook:

1. **Interações & Estados** (`## Interações & Estados` no plano):
   - Lê `INTERACOES` do input. Se ausente E a tela tem table/drawer/modal/popup detectado em Figma MCP (layer names contendo `Drawer|Modal|Dialog|Popup|Sheet`) ou em `dirs.app` (página equivalente já existente): **bloqueia** a geração e devolve `AskUserQuestion` estruturado pedindo as interações com 3 exemplos pré-preenchidos (clickable row, submit, filtro).
   - Reconcilia `INTERACOES` com Figma MCP prototype connections quando disponíveis (`figma.connections` revela frame→frame transitions). Conflito → prefere `INTERACOES` do usuário (intenção declarada).
   - Cada bullet vira identificável (slug curto: `row-click-drawer-view`, `submit-create`, `filter-periodo`) — esses slugs são referenciados por `interaction_target:` nas tasks.
   - Mapa de estados visuais (skeleton/empty/error/loading) por componente é obrigatório quando a tabela "Componentes mapeados" inclui Tabela ou Form.

2. **Page-level overrides** (`## Page-level overrides` no plano):
   - Para cada componente da tabela "Componentes mapeados": confronta CSS aplicado no Figma da página (padding, border, bg, radius, shadow) contra props/classes da story canônica em `.stories.tsx`.
   - Diff cosmético vira linha em `## Page-level overrides` com decisão sugerida pela heurística:
     - Override aparece em ≥3 telas do projeto (grep em `dirs.app`): **(b) nova variant na story**.
     - Override aparece só nesta tela: **(a) className na página**.
     - Override é workaround conhecido / hack temporário: **(c) exceção documentada**.
   - Slugs curtos (`StatCard:flat-variant`, `Drawer:no-outer-border`) são referenciados por `override_target:` nas tasks.

Política Figma vs Storybook (ver Fase 2):

> Story define API/anatomia do componente; refinamentos cosméticos da página são aceitos via override registrado em `## Page-level overrides`. **Em conflito visual, Figma da página vence**.

## Fase 2 — Aderência à Stack

**Modo padrão (sem `--allow-arch-change`)**: SOMENTE referenciar a stack já registrada em `stack.md`. Para cada dado/ação da tela, listar:

- Endpoint/tabela/serviço já existente (consultando `knowledge_sources` — Postman, regras-de-negócio, schema)
- Padrão de fetching a usar (do `stack.md`)
- Server vs Client component (do `stack.md`)

Saída desta fase é uma seção **"Aderência à Stack"** no plano — não redefine arquitetura.

**Modo `--allow-arch-change`**: pode propor alteração. Gerar ADR em `dirs.adr` (template `templates/adr-tmpl.yaml`) ANTES de prosseguir. Plano referencia o ADR e marca `arch_change: true` no frontmatter.

### 2.5 Backend gaps → ClickUp automático

Postman é o **contrato backend**. Para cada dado/ação da tela:

1. Confrontar com `<PROJETO>/docs/postman/` (já indexado no comprehension gate).
2. Se o endpoint não existir, ou existir com shape divergente, ou faltar RLS/migration para suportar a tela → registrar como **backend pending**.
3. Para cada pending, criar task ClickUp via `mcp__clickup__clickup_create_task`:
   - **Assignee**: `ASSIGNEE` do prompt OU default `112010775` (Douglas Oliveira).
   - **List**: `clickup.backend_list_id` de `plan-paths.json`. Ausente → registrar pending no plano com `clickup: pending` e seguir.
   - **Título**: `[Backend] PLAN-NNN: <gap em uma linha>`
   - **Descrição**: o que a tela precisa, qual coleção/endpoint do Postman cobre (ou não), referência ao plano (`docs/plans/PLAN-NNN/plan.md`), shape esperado.
4. Registrar IDs criados em:
   - `plan.md` → seção `## Backend pendings` (lista com `clickup_id`, status, link).
   - `progress.txt` → bloco `## Backend pendings — PLAN-NNN`.
5. Flag `--skip-clickup` desliga a criação (pending fica registrado apenas no plano).

## Fase 3 — Plano de Execução

Para cada elemento mapeado:

1. Estrutura de pastas/rotas (seguindo convenções de `stack.md`)
2. Lógica de fetching (onde o data source é chamado)
3. Montagem da view (composição dos componentes do DS)
4. Estado e interatividade (client components estritamente onde necessário)

Regras de geração de tasks (cobertura de comportamento + overrides):

- Toda interação em `## Interações & Estados` deve gerar **ao menos 1 task** com `interaction_target:` apontando pra ela. Se uma task cobre múltiplas interações, listar todos os slugs.
- Toda linha de `## Page-level overrides` com decisão **(b)** gera task de variant na story (`area: ui-ux`, `agent:ux-design-expert`); decisões **(a)** e **(c)** geram tasks na página (`area: frontend`, `agent:dev`). Em ambos os casos, frontmatter da task declara `override_target:` apontando pro slug.
- Tasks de seed data (quando aplicável — Tabela ou Form com fields no Figma) declaram fields obrigatórios e referenciam o checklist "Seed popula TODOS os campos exibidos".

## Subdivisão automática

Se a análise identificar mais de 3 seções autônomas (modais, drawers, sub-rotas com fetching próprio), gerar **planos filhos** numerados:

- Plano pai: `PLAN-NNN-<slug>` (visão geral + checklist consolidado)
- Filhos: `PLAN-NNN.1-<slug>`, `PLAN-NNN.2-<slug>` (cada um com suas tasks)

Frontmatter linka via `parent_plan` / `children_plans`.

## Saída

Para cada plano (incluindo filhos), os 4 passos abaixo são **obrigatórios e atômicos** — `*plan` NÃO termina sem todos. Falhar qualquer um aborta com erro explícito (não retornar plano-sem-tasks ao usuário; foi exatamente isso que motivou o bug do PLAN-006).

1. `<dirs.planos>/PLAN-NNN-<slug>/plan.md` — gerado a partir de `templates/planTemplate.md`. Frontmatter inclui `stack_ref: <dirs.stack>@<sha-curto>` para travar a versão da stack.
2. `<dirs.planos>/PLAN-NNN-<slug>/context.md` — gerado a partir de `templates/contextTemplate.md`. Denso, indexado.
3. **Disparar `plan-to-tasks`** apontando para o `plan.md` recém-criado → produz tasks em `<dirs.tasks>` (resolvido com `{plan}` substituído). Esta chamada é **vinculante** — `*plan` é uma operação `{plano + tasks + context + progress}`, nunca só plano. Se `plan-to-tasks` falhar (gate de Phase 3.5), abortar `*plan` inteiro (não deixar plano órfão).
4. Disparar `progress-tracker set-current` apontando o plano novo → atualiza `progress.txt`.

**Pós-condições obrigatórias** (verificar antes de devolver controle ao usuário):

- `<dirs.planos>/PLAN-NNN-<slug>/tasks/` existe e contém ≥1 `T-NN*.md`.
- Para CADA `T-NN*.md`: `head -1` = `---` E grep `^status: pendente$` retorna match. Use o gate da Phase 3.5 do `plan-to-tasks`. Falha → regerar tasks; se persistir, abortar com erro explícito ao usuário citando os arquivos malformados.
- `progress.txt` aponta para o plano novo.

Se qualquer pós-condição falhar: NÃO devolver "plano criado" ao usuário. Devolver erro indicando o que falhou e como retomar.

Resumo final:

```
## Plano criado: PLAN-042-checkout

- plan.md:    docs/plans/PLAN-042-checkout/plan.md
- context.md: docs/plans/PLAN-042-checkout/context.md
- tasks/:     docs/plans/PLAN-042-checkout/tasks/ (5 tasks)
- progress:   atualizado (status=pendente)
- stack_ref:  docs/stack.md@a1b2c3d

Próximos passos:
1. Revisar plan.md e checklist de aceite
2. *progress status T-042-01 em-andamento
3. Executar
```

## Regras críticas

- **Reuso estrito**: priorizar componentes existentes. Componente novo só com justificativa no plano.
- **Backend read-only respeitado**: se `stack.md` declara backend read-only, plano NUNCA propõe schema novo.
- **Next.js App Router**: decisão server vs client é explícita por elemento.
- **Sem prosa decorativa**: plano deve ser executável, denso, com critérios mensuráveis.
- **Storybook como contrato base; Figma da página como contrato final**: cada componente do DS na tabela DEVE apontar `.stories.tsx` existente em `dirs.storybook`. Sem story → componente vai pra "Componentes ausentes" e gera task de criação. **Em conflito visual entre story e Figma da página, Figma vence** — divergência cosmética é registrada em `## Page-level overrides` com decisão a/b/c (não vira retrabalho no fim).
- **Comportamento mapeado é obrigatório**: tela com table-clicável/drawer/modal/popup sem `INTERACOES` no input bloqueia plan generation (`AskUserQuestion`). Sem essa disciplina, o caso PLAN-005 (54 deltas em 26 rodadas de feedback) repete.

## Model guidance

| Escopo | Modelo |
|--------|--------|
| Tela simples (1 form, 1 listagem) | `sonnet` |
| Tela complexa, subdivisão necessária | `opus` |
| Replanejamento incremental | `sonnet` |

## Instructions

1. NUNCA prosseguir sem `stack.md` válido.
2. Resolver TODOS os paths via `plan-paths.json`. PROJETO/WORK_BRANCH são auto-resolvidos pelo `gos-master` — não perguntar ao usuário.
3. Status inicial do plano e tasks: `pendente`.
4. Não pushar nada — apenas escrever arquivos locais.
5. Backend pendings só criam tasks ClickUp se o `mcp__clickup__*` estiver disponível na sessão E `--skip-clickup` não for passado. Caso contrário, registrar apenas no plano.
