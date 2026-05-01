# ganbatte-os Agents

## Objetivo

Este repo existe para acelerar design-to-code e entrega de sprint.

## Agentes

| ID | Slash Command | Foco |
|----|--------------|------|
| **gos-master** | `/gos:agents:gos-master` | Orquestrador master — routing, skills, squads, workflows |
| **architect** | `/gos:agents:architect` | Stack, padroes tecnicos, revisoes de arquitetura |
| **dev** | `/gos:agents:dev` | Implementacao de features, hooks, refinamentos |
| **devops** | `/gos:agents:devops` | Git, branches, CI/CD, automacoes de entrega |
| **po** | `/gos:agents:po` | Backlog, scope, priorizacao |
| **qa** | `/gos:agents:qa` | Testes, quality gates, revisao de codigo |
| **sm** | `/gos:agents:sm` | Sprint, planning, sync com stakeholders |
| **squad-creator** | `/gos:agents:squad-creator` | Orquestracao de times multi-agentes |
| **ux-design-expert** | `/gos:agents:ux-design-expert` | Design de interfaces, tokens, design systems |

## Skills

| Skill | Slash Command | Funcao |
|-------|--------------|--------|
| **design-to-code** | `/gos:skills:design-to-code` | Converte Figma/screenshot em componentes React |
| **figma-implement-design** | `/gos:skills:figma-implement-design` | Implementa design Figma com fidelidade 1:1 |
| **figma-make-analyzer** | `/gos:skills:figma-make-analyzer` | Analisa output do Figma Make |
| **make-code-triage** | `/gos:skills:make-code-triage` | Classifica codigo do Figma Make por categoria |
| **make-version-diff** | `/gos:skills:make-version-diff` | Compara versoes de output Figma Make |
| **component-dedup** | `/gos:skills:component-dedup` | Detecta componentes duplicados |
| **frontend-dev** | `/gos:skills:frontend-dev` | Build componentes, pages, hooks (React/Next.js) |
| **interface-design** | `/gos:skills:interface-design` | Design de interface com metodologia intent-first |
| **react-best-practices** | `/gos:skills:react-best-practices` | Otimizacao de performance React/Next.js |
| **react-doctor** | `/gos:skills:react-doctor` | Diagnostico de saude de componentes React |
| **sprint-planner** | `/gos:skills:sprint-planner` | Planejamento completo de sprint |
| **clickup** | `/gos:skills:clickup` | Gestao de tarefas e sprints no ClickUp |
| **plan-to-tasks** | `/gos:skills:plan-to-tasks` | Converte plano em tasks acionaveis |
| **agent-teams** | `/gos:skills:agent-teams` | Coordena multiplos agentes em time |
| **git-ssh-setup** | `/gos:skills:git-ssh-setup` | Configura identidade SSH para o workspace |
| **stack-profiler** | `/gos:skills:stack-profiler` | Mantem `docs/stack.md` (stack-of-record canonica) |
| **plan-blueprint** | `/gos:skills:plan-blueprint` | Cria plano por tela (1 tela = 1 plano) |
| **progress-tracker** | `/gos:skills:progress-tracker` | Memoria L1 (`progress.txt`) + state machine |

## Plan Pipeline

Pipeline padronizado para criacao de planos por tela. Stack-of-record (`docs/stack.md`) e contrato — alteracoes exigem ADR.

| Comando | Skill | Funcao |
|---------|-------|--------|
| `*stack [refresh\|show\|drift]` | `stack-profiler` | Mantem `docs/stack.md` |
| `*plan <tela>` | `plan-blueprint` | Cria plano + tasks + context + atualiza `progress.txt` |
| `*progress [show\|set\|status]` | `progress-tracker` | State machine `pendente -> em-andamento -> validacao -> concluido` |

Paths do projeto-cliente sao resolvidos via `.gos-local/plan-paths.json` (incluindo `knowledge_sources` como Postman, regras-de-negocio, ADRs). Playbook: `.gos/playbooks/plan-creation-playbook.md`.

## Plan Mode Protocol

Antes de executar qualquer tarefa complexa, SEMPRE entre em plan mode.

**Triggers:** analisar, planejar, criar tasks, arquitetar, refatorar, implementar feature/skill/agente, sprint, backlog, migrar, integrar, redesign — quando envolver >3 passos ou múltiplos arquivos.

**Protocolo:**
1. **RESEARCH** — leia arquivos relevantes sem alterar nada
2. **PLAN** — crie `implementation_plan.md` com `[NEW]`/`[MODIFY]`/`[DELETE]`, perguntas abertas, plano de verificacao. Apresente e aguarde aprovacao na resposta principal, sem bloquear via hook
3. **AWAIT** — aguarde aprovacao: "ok", "aprovado", "go", "execute", "pode ir"
4. **EXECUTE + TRACK** — crie `task.md`, execute, finalize com `walkthrough.md`

**Excecoes — NAO ativar:** git operations, leitura/explicacao, edicoes simples de 1 arquivo, lint/typo, "execute direto", "sem plano", comandos de retomada como `continue`/`continuar`/`resume`, aprovacoes como `ok`/`aprovado`/`pode ir`, quando ja aprovado na sessao.
