---
name: plan-blueprint
description: Cria um plano padronizado para uma tela (1 plano = 1 tela) seguindo a stack-of-record do projeto. Produz {plano, tasks, contexto, entrada-progress.txt} em três fases (Mapeamento → Aderência à stack → Execução). Pré-requisito duro: docs/stack.md existir. Subdivide automaticamente telas com seções autônomas múltiplas.
argument-hint: "<tela|figma-url|descrição> [--from-figma-mcp] [--allow-arch-change]"
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

Auto-detecção de input:
- URL `https://www.figma.com/...` → ativa modo Figma MCP
- caminho de arquivo `.md`/`.png`/`.jpg` → modo descrição com referência visual
- texto livre → modo descrição

Flags:
- `--from-figma-mcp` — força leitura via Figma MCP
- `--allow-arch-change` — libera Fase 2 propositiva (gera ADR)

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

| Elemento (Figma/descrição) | Componente do DS | Story (path) | Variant | Props relevantes |
|----------------------------|------------------|--------------|---------|-------------------|

A coluna `Story (path)` aponta para `.stories.tsx` indexado no gate. Componente sem story correspondente NÃO entra na tabela — vai pra "Componentes ausentes" e gera task de criação.

Listar **componentes ausentes** separadamente — sinalizar como bloqueio ou candidato a criação (vai virar task própria).

## Fase 2 — Aderência à Stack

**Modo padrão (sem `--allow-arch-change`)**: SOMENTE referenciar a stack já registrada em `stack.md`. Para cada dado/ação da tela, listar:

- Endpoint/tabela/serviço já existente (consultando `knowledge_sources` — Postman, regras-de-negócio, schema)
- Padrão de fetching a usar (do `stack.md`)
- Server vs Client component (do `stack.md`)

Saída desta fase é uma seção **"Aderência à Stack"** no plano — não redefine arquitetura.

**Modo `--allow-arch-change`**: pode propor alteração. Gerar ADR em `dirs.adr` (template `templates/adr-tmpl.yaml`) ANTES de prosseguir. Plano referencia o ADR e marca `arch_change: true` no frontmatter.

## Fase 3 — Plano de Execução

Para cada elemento mapeado:

1. Estrutura de pastas/rotas (seguindo convenções de `stack.md`)
2. Lógica de fetching (onde o data source é chamado)
3. Montagem da view (composição dos componentes do DS)
4. Estado e interatividade (client components estritamente onde necessário)

## Subdivisão automática

Se a análise identificar mais de 3 seções autônomas (modais, drawers, sub-rotas com fetching próprio), gerar **planos filhos** numerados:

- Plano pai: `PLAN-NNN-<slug>` (visão geral + checklist consolidado)
- Filhos: `PLAN-NNN.1-<slug>`, `PLAN-NNN.2-<slug>` (cada um com suas tasks)

Frontmatter linka via `parent_plan` / `children_plans`.

## Saída

Para cada plano (incluindo filhos):

1. `<dirs.planos>/PLAN-NNN-<slug>/plan.md` — gerado a partir de `templates/planTemplate.md`. Frontmatter inclui `stack_ref: <dirs.stack>@<sha-curto>` para travar a versão da stack.
2. `<dirs.planos>/PLAN-NNN-<slug>/context.md` — gerado a partir de `templates/contextTemplate.md`. Denso, indexado.
3. Disparar `plan-to-tasks` automaticamente apontando para o `plan.md` recém-criado → produz tasks em `<dirs.tasks>` (resolvido com `{plan}` substituído).
4. Disparar `progress-tracker set-current` apontando o plano novo → atualiza `progress.txt`.

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
- **Storybook como contrato**: cada componente do DS na tabela DEVE apontar `.stories.tsx` existente em `dirs.storybook`. Sem story → componente vai pra "Componentes ausentes" e gera task de criação. Sem essa disciplina, o visual gate do `*execute-plan` quebra.

## Model guidance

| Escopo | Modelo |
|--------|--------|
| Tela simples (1 form, 1 listagem) | `sonnet` |
| Tela complexa, subdivisão necessária | `opus` |
| Replanejamento incremental | `sonnet` |

## Instructions

1. NUNCA prosseguir sem `stack.md` válido.
2. Resolver TODOS os paths via `plan-paths.json`.
3. Status inicial do plano e tasks: `pendente`.
4. Não pushar nada — apenas escrever arquivos locais.
