# ganbatte-os

Framework operacional para workflows design-to-code, gestão de squads e sincronização de sprints com ClickUp. Orquestra agents, skills e squads ao longo do ciclo de desenvolvimento conectando Figma, ClickUp e IDEs de IA.

Este diretório (`.gos/`) é o **core** do framework. Tratar como read-only em projetos que consomem — mudanças aqui afetam todos os workspaces instalados.

## Estrutura

| Diretório | Conteúdo |
|---|---|
| `agents/` | Definições de agents (ganbatte-os-master, architect, dev, sm, po, devops, squad-creator, ux-design-expert) |
| `skills/` | Skills executáveis (design-to-code, humanizer, slack-review, clickup, sprint-planner, react-doctor, etc.) |
| `scripts/` | Scripts Node zero-dep (hooks/, tools/, integrations/) |
| `libraries/` | Referências e catálogos (ai-writing-patterns, design tokens, style guides) |
| `rules/` | Regras de comportamento por contexto (frontend, backend, design) |
| `prompts/` | Prompts reusáveis |
| `playbooks/` | Workflows multi-step documentados |
| `squads/` | Templates de squad (design-delivery, design-squad, git-operations) |
| `integrations/` | Adaptadores por IDE/ferramenta (claude, cursor, codex, opencode, antigravity, gemini, kilo-code) |
| `manifests/` | Registros de instalação e runtime |
| `templates/` | Templates de projeto e artefato |
| `docs/` | **Documentação canônica dos pipelines** |

## Scripts principais

Todos invocáveis via `npm run` a partir da raiz do repo (`e:\Github\Ganbatte\package.json`):

```bash
npm run gos:doctor    # Health check — valida estrutura, skills, agents
npm run gos:init      # Inicializa framework em workspace novo
npm run gos:sync      # Sincroniza registry e adaptadores IDE
npm run gos:deploy-storybook  # Build + deploy Storybook no Vercel
```

## Pipelines documentados

| Pipeline | Doc |
|---|---|
| Notificações Slack (commit → fila → aprovação → envio) | [`docs/slack-notifications.md`](docs/slack-notifications.md) |
| Instalação do framework | [`docs/gos_installation_guide.md`](docs/gos_installation_guide.md) |
| Mapa de toolchain (IDEs, APIs, MCPs) | [`docs/toolchain-map.md`](docs/toolchain-map.md) |
| Compatibilidade entre IDEs | [`docs/ide-compatibility.md`](docs/ide-compatibility.md) |
| Curadoria de agents e skills | [`docs/curation.md`](docs/curation.md) |
| Distribuição pública | [`docs/plan-distribuicao-publica.md`](docs/plan-distribuicao-publica.md) |

## Convenções

- **Git**: não inicializar repositório na raiz (`e:\Github\Ganbatte`). Git existe só dentro de cada package em `packages/`.
- **Branch**: commit + push direto na branch (sem PR). `dev → beta` auto-merge via GitHub Actions.
- **SSH**: usar o alias configurado em `.gos-local/ssh-identity.json`, nunca `git@github.com` direto.
- **Texto pt-BR**: sanitização determinística nos hooks (`text-sanitize.js`); `/humanizer` skill para textos longos.
- **Notificações**: hooks enfileiram em `.gos/slack-queue/` — nada vai ao Slack sem `/slack-review` aprovar.
- **Plan mode**: tarefas com >3 passos seguem protocolo RESEARCH → PLAN → APPROVE → EXECUTE.

## Tiers de orquestração

1. **ganbatte-os-master** — orquestrador master (routing, skills, squads, workflows)
2. **workflow-select / composer / model-router** — scoring de workflow, sequenciamento de skill, roteamento de modelo
3. **agent-teams** — paralelização multi-agent

## Links rápidos

- CLI de fila Slack: [`scripts/tools/slack-queue.js`](scripts/tools/slack-queue.js)
- Sanitizador de texto: [`scripts/tools/text-sanitize.js`](scripts/tools/text-sanitize.js)
- Catálogo de padrões IA: [`libraries/content/ai-writing-patterns.md`](libraries/content/ai-writing-patterns.md)
- Hook pre-commit (validação TypeScript): [`scripts/hooks/pre-commit-validate.js`](scripts/hooks/pre-commit-validate.js)
- Hook post-commit (sync registry + Slack queue): [`../scripts/hooks/post-commit-sync.js`](../scripts/hooks/post-commit-sync.js)
