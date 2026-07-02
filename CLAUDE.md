# ganbatte-os Context

ganbatte-os e uma distribuicao enxuta do framework operacional ganbatte-os, focada em DESENVOLVIMENTO:

- prototipacao de ideias
- converter design em codigo
- implementacao, otimizacao e seguranca
- organizar squads de desenvolvimento

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

## Qualidade de Codigo (seguranca, performance, docs)

- **Seguranca**: `security-review` audita vulnerabilidades conhecidas (React/Next/TS/Node/Deno/Supabase RLS+edge/D1). Roda no fechamento do `validate-plan` e sob demanda (`*security-review`). CRITICAL/HIGH bloqueiam o fechamento do plano. Catalogo: `libraries/security-audit-playbook.md`.
- **Performance**: `perf-review` audita cache, filas, background, cron, N+1, views/materialized, paginacao, over-fetch (Supabase e D1). Roda no fechamento e sob demanda (`*perf-review`). Catalogo: `libraries/performance-audit-playbook.md`.
- **Documentacao sempre sincronizada** (`libraries/doc-sync-policy.md`): regra de negocio criada/alterada/removida => atualizar docs impactadas (regras-de-negocio, fluxos, permissoes, ADR, seeds, contratos) no mesmo PR. `plan.md` `## Impacto documental` declara; `validate-plan` bloqueia o fechamento se algo ficou dessincronizado.
- **Anti-over-engineering** (`libraries/lazy-dev-policy.md`): escrever so o necessario — reuso > stdlib > native > dep > 1 linha > minimo. Nunca cortar validacao/seguranca/a11y.

## Comandos do Workspace

| Comando | O que faz |
|---------|-----------|
| `npm run gos:init` | Setup pos-clone |
| `npm run gos:update` | Atualiza framework + re-sync IDEs |
| `npm run gos:doctor` | Health-check do workspace |
| `npm run gos:version` | Versao e atualizacoes |
| `npm run sync:ides` | Regenera IDE adapters |
| `npm run check:ides` | Valida IDE adapters |

## Slash Commands

Superficie user-facing = **2 entrypoints**. As skills e demais agentes NAO sao digitados; o `gos-master` os invoca a partir da intencao (o usuario guia com `*comandos` no chat, ex.: `*plan`, `*security-review`).

### Entrypoints (slash)
- `/gos:agents:gos-master` — orquestrador; decide skills/agentes/subagents/squads e executa.
- `/gos:agents:ux-design-expert` — design de interface, tokens, design systems.

### Agentes internos (delegacao, nao-slash)
architect | dev | devops | po | qa | sm | squad-creator | security-auditor | perf-optimizer

### Skills (auto-discoveraveis, invocadas pelo master — 34, ver `.gos/skills/registry.json`)
design-to-code | figma-implement-design | figma-make-analyzer | make-code-triage | make-version-diff | component-dedup | frontend-dev | interface-design | react-best-practices | react-doctor | plan-to-tasks | agent-teams | git-ssh-setup | humanizer | stack-profiler | plan-blueprint | progress-tracker | execute-plan | validate-plan | audit-screenshots | security-review | perf-review | simplify-review | idea-intake | prd-from-intake | adr-tech-decisions | prototype-orchestrator | gos-caveman | gos-compress | figma-print-diff | ui-guardrails | cloudflare-pages-setup | typeform-form-pattern | timer-component-pattern

### IDEs suportadas (npm run sync:ides gera adapters p/ 6)
Claude Code | **Codex IDE Extension** (executor, comando primario `*execute-plan`) | Qwen Code | Opencode | Gemini CLI | Antigravity. Cursor e Kilo Code consomem regras via arquivo (`.cursor/`, `.kilocode/`), sem adapters gerados.

## Model routing por etapa (Junior executa, Senior audita)

Regra persistida: planos, tasks e spec sao criados pensando que um **Junior executa** e um **Senior audita**. O modelo/provider de cada etapa e **configuravel** e resolvido por `.gos/scripts/tools/model-router.js`:

- **plan** (Senior): cria plano + tasks + spec. Default `claude-opus-4-8`.
- **execute** (Junior): analisa plano/tasks/spec e implementa. Default `claude-sonnet-5` (aceita Codex e modelos mais baratos adequados).
- **validate** (Senior): audita a execucao e corrige qualquer GAP deixado pelo Junior. Default `claude-opus-4-8`.

Precedencia: `.gos-local/models.json` (override local por dev/projeto) → `.gos/config.json` campo `stageModels` (default versionado). `gos init` gera o `.gos-local/models.json`. Consulta: `node .gos/scripts/tools/model-router.js get <plan|execute|validate>`.

## Plan Pipeline (stack-aware)

Pipeline padronizado para criacao de planos por tela. Toda tela = 1 plano. Stack-of-record (`docs/stack.md`) e contrato — alteracoes de stack exigem ADR. Divisao de trabalho: **Senior (etapa plan) planeja, Junior (etapa execute) implementa, Senior (etapa validate) audita** — modelos definidos em `stageModels` (ver acima).

| Comando | Skill | IDE / Modelo | Funcao |
|---------|-------|--------------|--------|
| `*stack [refresh|show|drift]` | `stack-profiler` | qualquer | Mantem `docs/stack.md` (canonico do projeto) |
| `*plan <tela>` | `plan-blueprint` | Opus 4.7 (planejador) | Cria plano + tasks + context + atualiza `progress.txt`. Captura comportamentos (`## Interacoes & Estados`) e page-level overrides (`## Page-level overrides`). INTERACOES obrigatorio quando tela tem table-clicavel/drawer/modal/popup. |
| `*execute-plan <PLAN-NNN>` | `execute-plan` | **Codex IDE Extension** (executor) | Executa task-a-task com visual gate (5 dim: anatomia, tokens, variants, densidade, comportamentos) vs Storybook canonico. Pre-flight smoke compara screenshot da pagina vs Figma frame antes da T-01. Non-blocking em backend gaps. |
| `*validate-plan <PLAN-NNN>` | `validate-plan` | Opus 4.7 (revisor) | Valida pos-execute; auto-marca concluido tasks que passam em checklist + visual gate curto + diff |
| `*progress [show|set|status]` | `progress-tracker` | qualquer | Memoria L1 + state machine de status |

State machine: `pendente -> em-andamento -> validacao -> concluido`. Estado lateral `bloqueada-backend` (introduzido pelo `*execute-plan` quando task tem `depends_on_backend:` com gap de backend ainda em aberto no tracking local; libera quando o pending local fecha). `concluido` marcado automaticamente pelo `*validate-plan` quando passa em checklist + visual gate curto + diff + cobertura de `interaction_target`/`override_target`.

**Politica Figma vs Storybook**: story define API/anatomia do componente; em conflito visual cosmetico (bg, border, padding, radius), Figma da pagina vence — divergencia e registrada em `## Page-level overrides` do plano com decisao a/b/c (a=className, b=variant nova, c=excecao documentada). Sem essa disciplina, refinamentos da pagina viram retrabalho no fim (caso PLAN-005: 54 deltas em 26 rodadas).

**Drift map automatico (Fase 1.5 do `*plan`)**: com Figma MCP + Storybook disponiveis, `*plan` gera `<plano>/drift-map.md` antes de emitir tasks — screenshots side-by-side por componente; cada divergencia vira override ou task explicita. Sem essa etapa, ~70% das divergencias viraram retrabalho durante execucao.

**Cleanup de starter legado (Fase 1.6)**: `.gos-local/plan-paths.json` campo `legacy_starter_dirs: ["src/figma-make/", ...]` faz `*plan` emitir tasks `T-NN-cleanup-legacy-<slug>` automaticamente para arquivos do starter. Sem o campo, comportamento atual preservado.

**Schema/contrato gate (Fase 2.4)**: `.gos-local/plan-paths.json` campo `backend_schema_files: [...]` (Postman + Prisma) faz `*plan` validar contrato antes de emitir tasks frontend; gaps viram entrada local em `## Backend pendings` (e plano-irmao `PLAN-NNN-backend-<slug>` quando grandes).

**Skill `*audit-screenshots`**: conversacional. Recebe N prints anotados em uma sessao, resolve cada print -> tela -> Figma frame via `docs/figma-screen-map.md`, compara, e ao fechar emite UM plano de correcao com tasks pendentes (sem executar). Acoplado ao mesmo template — output e input valido para `*execute-plan`/`*validate-plan`.

Paths do projeto-cliente sao resolvidos via `.gos-local/plan-paths.json` — nada hardcoded. Nesse arquivo declara-se onde estao `docs/plans/`, `docs/postman/`, `docs/regras-de-negocio/`, design system, etc. Cada projeto/dev pode organizar diferente.

Playbook completo: `.gos/playbooks/plan-creation-playbook.md`
