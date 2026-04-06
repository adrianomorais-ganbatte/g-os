# ganbatte-os Agents

## Objetivo

Este repo existe para acelerar design-to-code e entrega de sprint.

## Agentes principais

- `ganbatte-os-master`: orquestrador master — roteia para o skill/agent/squad certo conforme a complexidade
- `ux-design-expert`: leitura de design, tokens, componentes e handoff
- `architect`: define stack e cortes de integração para React/Next.js
- `dev`: implementa componentes, páginas, hooks e refinamentos
- `sm`: transforma inputs em sprint executável
- `po`: organiza backlog, scope e prioridades
- `devops`: integra GitHub, branches e automações de entrega
- `squad-creator`: monta ou ajusta squads especializados

## Skills principais

- `design-to-code`
- `figma-implement-design`
- `figma-make-analyzer`
- `make-code-triage`
- `component-dedup`
- `frontend-dev`
- `react-doctor`
- `sprint-planner`
- `clickup`

## Runtime

As skills usam suporte interno em `.G-OS/` para regras, templates e bibliotecas.

## Plan Mode Protocol

Antes de executar qualquer tarefa complexa, SEMPRE entre em plan mode.

**Triggers:** analisar, planejar, criar tasks, arquitetar, refatorar, implementar feature/skill/agente, sprint, backlog, migrar, integrar, redesign — quando envolver >3 passos ou múltiplos arquivos.

**Protocolo:**
1. **RESEARCH** — leia arquivos relevantes sem alterar nada
2. **PLAN** — crie `implementation_plan.md` com `[NEW]`/`[MODIFY]`/`[DELETE]`, perguntas abertas, plano de verificação. Apresente e **PARE**
3. **AWAIT** — aguarde aprovação: "ok", "aprovado", "go", "execute", "pode ir"
4. **EXECUTE + TRACK** — crie `task.md`, execute, finalize com `walkthrough.md`

**Exceções — NÃO ativar:** git operations, leitura/explicação, edições simples de 1 arquivo, lint/typo, "execute direto", "sem plano", quando já aprovado na sessão.
