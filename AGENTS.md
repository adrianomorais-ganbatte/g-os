# ganbatte-os Agents

## Objetivo

Kit de desenvolvimento com IA: design-to-code, implementacao, otimizacao e seguranca.

## Entrypoints (2 slash commands)

A superficie user-facing sao **dois** comandos. As skills e os demais agentes NAO sao digitados — o `gos-master` os invoca a partir da sua intencao.

| Entrypoint | Foco |
|------------|------|
| `/gos:agents:gos-master` | Orquestrador — decide skills/agentes/subagents/squads e executa |
| `/gos:agents:ux-design-expert` | Design de interfaces, tokens, design systems |

## Agentes internos (delegacao, nao-slash)

O master delega a especialistas via Task tool: `architect`, `dev`, `devops`, `po`, `qa`, `sm` (facilitador de planejamento de dev), `squad-creator`, `security-auditor`, `perf-optimizer`. Fonte: `.gos/agents/profiles/`.

## Skills (auto-discoveraveis, invocadas pelo master)

34 skills, agrupadas por capacidade. Catalogo completo em `.gos/skills/registry.json`.

- **Design → codigo**: `design-to-code`, `figma-implement-design`, `figma-make-analyzer`, `make-code-triage`, `make-version-diff`, `figma-print-diff`, `interface-design`, `ui-guardrails`, `prototype-orchestrator`
- **Frontend/React**: `frontend-dev`, `react-best-practices`, `react-doctor`, `component-dedup`, `cloudflare-pages-setup`, `typeform-form-pattern`, `timer-component-pattern`
- **Pipeline de planos**: `stack-profiler`, `plan-blueprint`, `plan-to-tasks`, `execute-plan`, `validate-plan`, `progress-tracker`, `audit-screenshots`
- **Qualidade**: `security-review`, `perf-review`, `simplify-review`
- **Produto/texto/utilitarios**: `idea-intake`, `prd-from-intake`, `adr-tech-decisions`, `humanizer`, `gos-caveman`, `gos-compress`, `agent-teams`, `git-ssh-setup`

## Arquitetura & Stack (regra sempre-ativa)

Decisao de arquitetura vem antes do codigo — policy: `.gos/libraries/architecture-stack-policy.md`.

- **Referencia != decisao**: codigo de Figma Make/Stitch/outro projeto e triagem; avaliar objetivo/contexto/hosting/servicos/alternativa-mais-simples antes de copiar.
- **Stack-first**: nada relevante comeca sem `docs/stack.md` definido (contrato; mudar exige ADR em `docs/adr/`). Falta info => decisao pendente com opcoes.
- **Own-vs-managed**: auth/deploy/DB avaliados por contexto, nunca defaultados por habito.
- **Mermaid**: diagramas de fluxo (auth, dados, jornada, arquitetura) no `plan.md` e em `dirs.fluxos`.
- **Master explicavel**: cada acao vem com explicacao de produto/negocio (o que/por que/impacto) em linguagem simples; detalhe tecnico sob demanda.

## Plan Pipeline

Toda tela = 1 plano. Stack-of-record (`docs/stack.md`) e contrato — alteracoes exigem ADR. Divisao: **Senior planeja (plan), Junior implementa (execute), Senior audita (validate)** — modelo por etapa em `.gos-local/models.json`.

| Comando | Skill | Funcao |
|---------|-------|--------|
| `*stack [refresh\|show\|drift]` | `stack-profiler` | Mantem `docs/stack.md` |
| `*plan <tela>` | `plan-blueprint` | Cria `plan.md` + `context.md` + `spec.md` + `tasks/` (com criterios de aceite) |
| `*execute-plan <PLAN-NNN>` | `execute-plan` | Implementa task-a-task com visual gate + loop de correcao |
| `*validate-plan <PLAN-NNN>` | `validate-plan` | Audita, corrige gaps, roda seguranca + performance + doc-sync |
| `*progress [show\|set\|status]` | `progress-tracker` | State machine `pendente -> em-andamento -> validacao -> concluido` |

Auditorias sob demanda: `*security-review`, `*perf-review`, `*simplify-review`.

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
