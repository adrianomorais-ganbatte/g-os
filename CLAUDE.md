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
| `*plan <tela>` | `plan-blueprint` | Opus 4.7 (planejador) | Cria plano + tasks + context + atualiza `progress.txt` |
| `*execute-plan <PLAN-NNN>` | `execute-plan` | **Codex IDE Extension** (executor) | Executa task-a-task com visual gate vs Storybook canonico, non-blocking em backend gaps |
| `*validate-plan <PLAN-NNN>` | `validate-plan` | Opus 4.7 (revisor) | Valida pos-execute; auto-marca concluido tasks que passam em checklist + visual gate curto + diff |
| `*progress [show|set|status]` | `progress-tracker` | qualquer | Memoria L1 + state machine de status |

State machine: `pendente -> em-andamento -> validacao -> concluido`. Estado lateral `bloqueada-backend` (introduzido pelo `*execute-plan` quando task tem `depends_on_backend:` em aberto no ClickUp; libera quando ClickUp fecha). `concluido` marcado automaticamente pelo `*validate-plan` quando passa em checklist + visual gate curto + diff.

Paths do projeto-cliente sao resolvidos via `.gos-local/plan-paths.json` — nada hardcoded. Nesse arquivo declara-se onde estao `docs/plans/`, `docs/postman/`, `docs/regras-de-negocio/`, design system, etc. Cada projeto/dev pode organizar diferente.

Playbook completo: `.gos/playbooks/plan-creation-playbook.md`
