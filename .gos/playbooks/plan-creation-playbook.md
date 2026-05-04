# Playbook — Criação de planos por tela

Pipeline determinístico do G-OS para transformar uma tela (Figma, descrição, screenshot) em `{plano + tasks + contexto + entrada-progress}` respeitando a stack-of-record do projeto.

## Quando usar

- Toda nova tela em projeto que consome o G-OS
- Reescrita ou refatoração de tela existente
- Cada tela = 1 plano (subdividido em filhos quando complexa)

## Pré-requisitos do workspace

1. `.gos-local/plan-paths.json` configurado (paths do projeto + `knowledge_sources`)
2. `docs/stack.md` válido e sem drift (gerado por `stack-profiler`)
3. `progress.txt` na raiz (criado automaticamente no primeiro `*plan`)

## Fluxo end-to-end

### 0. Bootstrap (uma vez por workspace)

```
*stack refresh
```

Lê configs do projeto + `knowledge_sources` (Postman, regras-de-negocio, ADRs, design system) e grava `docs/stack.md` + `.gos-local/stack.lock.json`.

Se `plan-paths.json` ausente, a skill cria interativamente.

### 1. Verificar drift antes de planejar

```
*stack drift
```

Se houver drift, decidir entre:
- `*stack refresh` (atualizar stack.md, planos antigos ficam com stack_ref antigo — ok)
- ignorar e prosseguir (apenas se a mudança não afeta a tela)

### 2. Criar plano

```
*plan <tela>

OBJETIVO   = implantacao | correcao | refactor   # obrigatório
FIGMA      = <url-frame>
FIGMA+     = [<url-comp>, ...]                   # opcional
INTERACOES = """<lista estruturada — obrigatório quando tela tem table-clicável/drawer/modal/popup>"""
NOTAS      = """<prosa livre>"""                 # opcional
ASSIGNEE   = <user-id>                           # opcional, default 112010775 (Douglas)
```

`gos-master` resolve no comprehension gate (não pedir ao usuário):
- `PROJETO` (cwd, ou `~/.claude/.gos-state/last-project.json`)
- `WORK_BRANCH` (`dev` para app, `feat/storybook` quando em Storybook)
- Indexação de `<PROJETO>/docs/regras-de-negocio/` e `docs/postman/` (registrada em `progress.txt`)
- **Step 1.2 — Coleta de comportamentos**: detecta se tela tem table-clicável/drawer/modal/popup. Sim E `INTERACOES` ausente → bloqueia + dispara `AskUserQuestion` estruturado pedindo as interações (3 exemplos pré-preenchidos). Telas simples (form linear, lista read-only) não acionam.

`plan-blueprint` executa:
1. Fase 1 — Mapeamento Visual & Componentização
   1.4 Comportamentos & Overrides — `## Interações & Estados` + `## Page-level overrides` no plano
2. Fase 2 — Aderência à Stack (sem redefinir arquitetura)
2.5 Fase 2.5 — Backend gaps → criar tasks ClickUp pro Douglas (`--skip-clickup` desliga)
3. Fase 3 — Plano de Execução (gera tasks com `interaction_target` e `override_target` para cobrir comportamentos e overrides)

Saídas:
- `<dirs.planos>/PLAN-NNN-<slug>/plan.md` (com seções `## Backend pendings`, `## Knowledge mapped`, `## Interações & Estados`, `## Page-level overrides`)
- `<dirs.planos>/PLAN-NNN-<slug>/context.md`
- `<dirs.planos>/PLAN-NNN-<slug>/tasks/T-NNN-NN-*.md`
- `progress.txt` atualizado com plano ativo + inventário de knowledge + backend pendings

### 3. Revisar e aceitar

Humano revisa:
- componentes mapeados x ausentes
- aderência à stack (especialmente endpoints/regras)
- checklist de aceite

Se aprovado, prosseguir. Caso contrário: ajustar manualmente ou rerodar `*plan` com refinamento.

### 3.5. Pre-flight visual (antes de executar)

```
*execute-plan PLAN-NNN-<slug>
```

A skill `execute-plan` faz dois pre-flights antes da T-01:

1. **Stories disponíveis**: resolve `dirs.storybook`, indexa `.stories.tsx`, confronta cada componente da tabela "Componentes mapeados". Componente sem story → bloqueia e propõe task de criação ANTES das tasks de implementação.
2. **Visual smoke** (quando Storybook story-da-página OU Playwright MCP disponível): renderiza a página com seed e compara screenshot vs frame Figma em 3 dimensões básicas (seções presentes, layout grosseiro, cores primárias). Gaps grandes viram tasks `T-000-XX` com `priority: P0` antes do loop. Sem Storybook full-page nem Playwright MCP: skip com warning. Esse pre-flight evita o padrão PLAN-005 (gaps grandes descobertos via 26 rodadas de feedback no fim).

> Ambiente recomendado: **Codex IDE Extension** (executor). O `*plan` da etapa 2 roda em Opus 4.7 (planejador). Adapter Codex é gerado por `npm run sync:ides`.

### 4. Executar tasks (orquestrado por execute-plan)

`execute-plan` itera as tasks em ordem de `seq`:

1. `*progress status T-NNN-NN em-andamento` (state machine).
2. Despacha agent (`labels: [agent:<slug>]`, default `dev`) para implementar.
3. **Visual gate** antes de marcar `validacao`:
   - Compara cada componente alterado com `<Componente>.stories.tsx` em 5 dimensões (anatomia, tokens, variants, densidade, comportamentos). Tokens divergentes registrados em `## Page-level overrides` do plano não falham — gate confirma aplicação do override.
   - Comportamentos: cada `interaction_target:` declarado na task tem handler/estado observável no diff; cada `override_target:` tem classes/props da decisão (a/b/c) presentes.
   - Cruza JSX da tela com Figma MCP (árvore vs hierarquia).
   - Falha → task volta a `em-andamento` com diff em `tasks/T-NNN-NN.notes.md`.
4. Sucesso → `*progress status T-NNN-NN validacao`.

Para rodar uma task específica fora do loop: `*execute-plan PLAN-NNN-<slug> --task T-NNN-NN`.

### 4.5. Validação pós-execute

Após `*execute-plan` retornar (com tasks em `validacao` e/ou `bloqueada-backend`), rodar:

```
*validate-plan PLAN-NNN-<slug>

NOTAS = """<opcional — desvios conhecidos, contexto de QA>"""
```

Skill `validate-plan` (Opus, revisor):
- Para cada task em `validacao`: re-roda visual gate curto (anatomia + tokens + comportamentos), confronta `git diff --staged` vs Componentes mapeados, confere checklist da task e `interaction_target`/`override_target`. Tudo bate → auto-marca `concluido`. Falha → mantém `validacao` com nota.
- Para o plano: cobertura de comportamento (`## Interações & Estados`) + cobertura de overrides (`## Page-level overrides`) + checklist do plano + backend pendings ClickUp todos `concluido` → marca `validated_at:` no plan.md + `*progress status PLAN-NNN-<slug> concluido`. Senão → mantém em `validacao`.
- Tasks `bloqueada-backend` ficam intocadas — backend tem que fechar primeiro.

### 5. Push manual e fechamento

`validate-plan` NÃO dá push. Quando o plano fecha 100%:

```
git push
```

Push é ato consciente do humano. Tasks `bloqueada-backend` aguardam ClickUp fechar — quando isso acontece, rodar `*progress status T-NNN-NN em-andamento` (state machine valida ClickUp via MCP) e voltar pra etapa 4.

### 6. Commit & resumo

`devops` skill prepara commit (não pusha). Resumo do que foi feito é gerado a partir das tasks `concluido` desde o último commit.

## Regras invioláveis

1. **Stack como contrato** — toda decisão respeita `stack.md`. Mudança de stack exige ADR e flag `--allow-arch-change`.
2. **Read-only respeitado** — se `stack.md` declara backend read-only, plano nunca propõe migration.
3. **State machine dura** — `concluido` só após validação humana.
4. **Paths via config** — nada hardcoded; tudo de `plan-paths.json`.
5. **`progress.txt` é L1** — denso, otimizado para LLM, sempre atualizado.

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| `*plan` aborta com "stack.md ausente" | Bootstrap não rodou | `*stack refresh` |
| Drift detectado constantemente | `package.json` muda muito | Aceitar drift e rerunar refresh por sprint |
| Task `concluido` sem passar por `validacao` | Tentativa de bypass | State machine bloqueia — usar `--rollback` se for engano |
| Plano referencia endpoint que não existe | Postman desatualizado | Atualizar coleção, `*stack refresh`, replanejar |

## Skills relacionadas

- `stack-profiler` — produz/mantém `stack.md`
- `plan-blueprint` — cria plano por tela (Opus, planejamento)
- `plan-to-tasks` — decompõe plano em tasks (chamada automaticamente)
- `execute-plan` — executa plano com visual gate, non-blocking em backend gaps (Codex IDE, execução)
- `validate-plan` — valida plano pós-execute, auto-marca concluido (Opus, revisor)
- `progress-tracker` — gerencia `progress.txt` + state machine (incluindo `bloqueada-backend`)
- `clickup` — sync opcional para tracking externo (não obrigatório)
