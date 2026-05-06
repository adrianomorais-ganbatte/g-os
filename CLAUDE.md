# ganbatte-os Context

ganbatte-os e uma distribuicao enxuta do framework operacional ganbatte-os para:

- converter design em codigo
- organizar squads de entrega
- planejar sprint
- sincronizar backlog no ClickUp

Priorize React e Next.js. Quando houver input vindo de Figma Make ou Stitch, trate o codigo como material de triagem antes de integrar ao projeto final.

## Orquestracao

O ganbatte-os herda o modelo de orquestracao do .a8z-OS (framework pai):

| Tier | Componente | Funcao |
|------|-----------|--------|
| 1 | `ganbatte-os-master` | Orquestrador master — routing matrix, skills, squads, workflows |
| 2 | `workflow-select` | Scoring de workflows (Ralph, SDD, Rapid Bug Fix, Escalation) |
| 2 | `composer` | Sequencias de skills com decision gates |
| 2 | `model-router` | Roteamento para modelo mais barato adequado |
| 3 | `agent-teams` / `dispatching-parallel-agents` | Paralelizacao multi-agente |

Para tarefas complexas multi-dominio, invocar `ganbatte-os-master` (agents/profiles/gos-master.md).

## Qualidade de Texto

Todo texto gerado deve passar por correcao ortografica e remocao de padroes de IA:
- **Ortografia pt-BR**: Stop hook automatico corrige acentos
- **Humanizacao**: Skill `/humanizer` remove padroes de escrita artificial (26 patterns)
- **Referencia**: `libraries/content/ai-writing-patterns.md` (taxonomia de padroes)

## Comandos do Workspace

| Comando | O que faz |
|---------|-----------|
| `npm run gos:init` | Setup pos-clone |
| `npm run gos:update` | Atualiza framework + re-sync IDEs |
| `npm run gos:doctor` | Health-check do workspace |
| `npm run gos:version` | Versao e atualizacoes |
| `npm run sync:ides` | Regenera IDE adapters |
| `npm run check:ides` | Valida IDE adapters |
| `npm run clickup` | CLI ClickUp |

## Slash Commands

### Agents (invoke via /gos:agents:{id})
gos-master | architect | dev | devops | po | qa | sm | squad-creator | ux-design-expert

### Skills (invoke via /gos:skills:{slug})
design-to-code | figma-implement-design | figma-make-analyzer | make-code-triage | make-version-diff | component-dedup | frontend-dev | interface-design | react-best-practices | react-doctor | sprint-planner | clickup | plan-to-tasks | agent-teams | git-ssh-setup | stack-profiler | plan-blueprint | progress-tracker | execute-plan | validate-plan

### IDEs suportadas (npm run sync:ides gera adapters)
Claude Code | Cursor | Gemini CLI | Qwen Code | Antigravity | Opencode | Kilo Code | **Codex IDE Extension** (ambiente de execucao, comando primario `*execute-plan`)

## Plan Pipeline (stack-aware)

Pipeline padronizado para criacao de planos por tela. Toda tela = 1 plano. Stack-of-record (`docs/stack.md`) e contrato — alteracoes de stack exigem ADR. Divisao de trabalho: **Opus 4.7 planeja, Codex IDE executa**.

| Comando | Skill | IDE / Modelo | Funcao |
|---------|-------|--------------|--------|
| `*stack [refresh|show|drift]` | `stack-profiler` | qualquer | Mantem `docs/stack.md` (canonico do projeto) |
| `*plan <tela>` | `plan-blueprint` | Opus 4.7 (planejador) | Cria plano + tasks + context + atualiza `progress.txt`. Captura comportamentos (`## Interacoes & Estados`) e page-level overrides (`## Page-level overrides`). INTERACOES obrigatorio quando tela tem table-clicavel/drawer/modal/popup. |
| `*execute-plan <PLAN-NNN>` | `execute-plan` | **Codex IDE Extension** (executor) | Executa task-a-task com visual gate (5 dim: anatomia, tokens, variants, densidade, comportamentos) vs Storybook canonico. Pre-flight smoke compara screenshot da pagina vs Figma frame antes da T-01. Non-blocking em backend gaps. |
| `*validate-plan <PLAN-NNN>` | `validate-plan` | Opus 4.7 (revisor) | Valida pos-execute; auto-marca concluido tasks que passam em checklist + visual gate curto + diff |
| `*progress [show|set|status]` | `progress-tracker` | qualquer | Memoria L1 + state machine de status |

State machine: `pendente -> em-andamento -> validacao -> concluido`. Estado lateral `bloqueada-backend` (introduzido pelo `*execute-plan` quando task tem `depends_on_backend:` em aberto no ClickUp; libera quando ClickUp fecha). `concluido` marcado automaticamente pelo `*validate-plan` quando passa em checklist + visual gate curto + diff + cobertura de `interaction_target`/`override_target`.

**Politica Figma vs Storybook**: story define API/anatomia do componente; em conflito visual cosmetico (bg, border, padding, radius), Figma da pagina vence — divergencia e registrada em `## Page-level overrides` do plano com decisao a/b/c (a=className, b=variant nova, c=excecao documentada). Sem essa disciplina, refinamentos da pagina viram retrabalho no fim (caso PLAN-005: 54 deltas em 26 rodadas).

**Drift map automatico (Fase 1.5 do `*plan`)**: com Figma MCP + Storybook disponiveis, `*plan` gera `<plano>/drift-map.md` antes de emitir tasks — screenshots side-by-side por componente; cada divergencia vira override ou task explicita. Sem essa etapa, ~70% das divergencias viraram retrabalho durante execucao.

**Cleanup de starter legado (Fase 1.6)**: `.gos-local/plan-paths.json` campo `legacy_starter_dirs: ["src/figma-make/", ...]` faz `*plan` emitir tasks `T-NN-cleanup-legacy-<slug>` automaticamente para arquivos do starter. Sem o campo, comportamento atual preservado.

**Schema/contrato gate (Fase 2.4)**: `.gos-local/plan-paths.json` campo `backend_schema_files: [...]` (Postman + Prisma) faz `*plan` validar contrato antes de emitir tasks frontend; gaps viram task ClickUp + entrada em `## Backend pendings`.

**Skill `*audit-screenshots`**: conversacional. Recebe N prints anotados em uma sessao, resolve cada print -> tela -> Figma frame via `docs/figma-screen-map.md`, compara, e ao fechar emite UM plano de correcao com tasks pendentes (sem executar). Acoplado ao mesmo template — output e input valido para `*execute-plan`/`*validate-plan`.

Paths do projeto-cliente sao resolvidos via `.gos-local/plan-paths.json` — nada hardcoded. Nesse arquivo declara-se onde estao `docs/plans/`, `docs/postman/`, `docs/regras-de-negocio/`, design system, etc. Cada projeto/dev pode organizar diferente.

Playbook completo: `.gos/playbooks/plan-creation-playbook.md`
