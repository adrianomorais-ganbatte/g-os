# ganbatte-os

Framework operacional para design-to-code, squads de entrega e sprint sync com ClickUp.

---

[![NPM Version](https://img.shields.io/npm/v/ganbatte-os)](https://www.npmjs.com/package/ganbatte-os)
[![NPM Home](https://img.shields.io/badge/NPM-Registry-red)](https://www.npmjs.com/package/ganbatte-os)
![Node >= 18](https://img.shields.io/badge/Node.js-%3E%3D18-green)

O **ganbatte-os** organiza agentes de IA, skills e squads num workspace pronto para uso. Ele orquestra o ciclo completo de desenvolvimento conectando Figma, ClickUp e as principais IDEs de IA (Claude Code, Gemini, Cursor, etc). Baseado nos padrões do framework `.a8z-OS`.

## Quick Start

### 1. Instalação

```bash
mkdir meu-projeto && cd meu-projeto
git init
npm install ganbatte-os
./node_modules/.bin/gos install
```

Alternativa global:

```bash
npm install -g ganbatte-os
gos install
```

Alternativa direto do GitHub (ultima versao do main):

```bash
npm install github:adrianomorais-ganbatte/g-os
./node_modules/.bin/gos install
```

### 2. Pós-Instalação
Após rodar o install, o framework criará uma estrutura limpa na sua raiz:
- `.gos/` — O núcleo do framework (Agentes, Skills, Scripts).
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` — Instruções para as IDEs.
- `packages/` — Onde você deve colocar o código do seu aplicativo.

### 3. Comandos do Workspace

A partir da raiz do seu projeto, você pode gerenciar o framework:

| Comando | O que faz |
|---------|-----------|
| `npm run gos:init` | Setup pos-clone (remote, dirs, IDEs, sync framework pai) |
| `npm run gos:update` | Fetch upstream + merge + re-sync IDEs + sync framework pai |
| `npm run gos:doctor` | Valida integridade do workspace e IDEs |
| `npm run gos:version` | Mostra versao e checa atualizacoes |
| `npm run sync:ides` | Regenera adapters para Claude, Gemini, Cursor e outras |
| `npm run check:ides` | Valida compatibilidade dos IDE adapters |
| `npm run clickup` | CLI ClickUp (tarefas, sprints, status) |
| `npm run doctor` | Alias direto para gos:doctor |

### Via CLI global (`gos`)

Apos `npm install -g ganbatte-os`:

| Comando | O que faz |
|---------|-----------|
| `gos install` | Instala framework em diretorio novo |
| `gos init` | Inicializa workspace existente |
| `gos update` | Atualiza framework |
| `gos doctor` | Health-check |
| `gos version` | Versao instalada |

> [!NOTE]
> A pasta `.agent/` que pode aparecer na raiz do workspace e criada pela IDE Google Antigravity / Gemini Code Assist — nao faz parte do setup padrao do ganbatte-os.

## Estrutura do Workspace

O `ganbatte-os` utiliza uma estrutura **encapsulada** para manter seu projeto limpo e organizado:

```text
├── .gos/                # Core do Framework (Somente leitura para usuários)
│   ├── agents/          # Perfis e instruções dos agentes IA
│   ├── skills/          # Catálogo de ferramentas (ex: design-to-code)
│   ├── scripts/         # Engine do CLI e integração de IDEs
│   └── prompts/         # Prompts canônicos para os agentes
├── .gos-local/          # Dados locais (logs, queues, worktrees) - ignorado no git
├── packages/            # Seu código-fonte e projetos vivem aqui
├── AGENTS.md            # Entrypoint de agentes para o framework
├── CLAUDE.md            # Instruções específicas para Claude Code
└── GEMINI.md            # Instruções específicas para Google Gemini
```

## Funcionalidades Principais

- **Design-to-Code**: Pipeline automatizado para converter frames do Figma em componentes React/Next.js de alta fidelidade.
- **Squads de Entrega**: Agentes especializados (SM, PO, Dev, QA) que trabalham de forma coordenada.
- **Sincronização ClickUp**: Conecta seu workspace diretamente ao ClickUp para automação de status e tarefas.
- **Multi-IDE Multi-Tenant**: Configurações automáticas para as melhores ferramentas de IA do mercado.

## Agentes Disponíveis

| Agent | Slash Command | Foco |
|-------|--------------|------|
| **gos-master** | `/gos:agents:gos-master` | Orquestrador master — routing, skills, squads, workflows |
| **architect** | `/gos:agents:architect` | Stack, padroes tecnicos, revisoes de arquitetura |
| **dev** | `/gos:agents:dev` | Implementacao de features, hooks, refinamentos |
| **devops** | `/gos:agents:devops` | Git, branches, CI/CD, automacoes de entrega |
| **po** | `/gos:agents:po` | Backlog, scope, priorizacao |
| **qa** | `/gos:agents:qa` | Testes, quality gates, revisao de codigo |
| **sm** | `/gos:agents:sm` | Sprint, planning, sync com stakeholders |
| **squad-creator** | `/gos:agents:squad-creator` | Orquestracao de times multi-agentes |
| **ux-design-expert** | `/gos:agents:ux-design-expert` | Design de interfaces, tokens, design systems |

## Skills Disponiveis

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
| **humanizer** | `/gos:skills:humanizer` | Remove padroes de IA do texto (two-pass audit + soul injection) |
| **weekly-update** | `/gos:skills:weekly-update` | Resumo semanal de tasks ClickUp → humaniza → posta no Slack (requer aprovacao) |
| **stack-profiler** | `/gos:skills:stack-profiler` | Mantem `docs/stack.md` como stack-of-record canonica do projeto |
| **plan-blueprint** | `/gos:skills:plan-blueprint` | Cria plano por tela (1 tela = 1 plano) seguindo a stack |
| **progress-tracker** | `/gos:skills:progress-tracker` | Memoria L1 (`progress.txt`) + state machine de status |

## Plan Pipeline (stack-aware)

Pipeline padronizado para criacao de planos por tela. Toda tela vira um plano + tasks + contexto, com status auditavel e contrato de stack.

### Fluxo

```
*stack refresh   →   docs/stack.md (uma vez por workspace, ou quando stack mudar)
*plan <tela>     →   docs/plans/PLAN-NNN-<slug>/{plan.md, tasks/, context.md} + progress.txt
*progress ...    →   transicoes pendente → em-andamento → validacao → concluido
```

| Comando | Skill | Funcao |
|---------|-------|--------|
| `*stack [refresh\|show\|drift]` | `stack-profiler` | Mantem `docs/stack.md` (canonico) e `.gos-local/stack.lock.json` |
| `*plan <tela\|figma-url>` | `plan-blueprint` | Cria plano + dispara `plan-to-tasks` + atualiza `progress.txt` |
| `*progress [show\|set\|status]` | `progress-tracker` | Memoria L1 e state machine |

### Regras invioiaveis

- **Stack como contrato** — toda decisao tecnica respeita `docs/stack.md`. Mudanca de stack exige ADR e flag `--allow-arch-change`.
- **Paths via config** — nada hardcoded. Tudo resolvido via `.gos-local/plan-paths.json` (incluindo `knowledge_sources` como Postman, regras-de-negocio, ADRs).
- **State machine dura** — `concluido` somente apos validacao humana.
- **`progress.txt` e L1** — denso, otimizado para LLM, atualizado em todo passo.

### Configuracao por workspace

`.gos-local/plan-paths.json` define onde cada projeto guarda seus artefatos. Cada projeto/dev pode organizar diferente:

```json
{
  "schema": "gos.plan-paths.v1",
  "dirs": {
    "planos": "docs/plans/",
    "tasks": "docs/plans/{plan}/tasks/",
    "contexto": "docs/plans/{plan}/context.md",
    "progress": "progress.txt",
    "stack": "docs/stack.md",
    "postman": "docs/postman/",
    "regras_negocio": "docs/regras-de-negocio/"
  },
  "knowledge_sources": [
    { "kind": "postman",        "path": "docs/postman/",            "required": false },
    { "kind": "business-rules", "path": "docs/regras-de-negocio/",  "required": false },
    { "kind": "design-system",  "path": ".referencia-storybook/docs/DESIGN_SYSTEM_REFERENCE.md", "required": true }
  ]
}
```

Helpers: `scripts/tools/plan-paths.js`, `scripts/tools/plan-status.js`, `scripts/tools/stack-scan.js`.

Playbook completo: [`.gos/playbooks/plan-creation-playbook.md`](./.gos/playbooks/plan-creation-playbook.md).

## Documentacao

| Documento | Descricao |
|-----------|-----------|
| [AGENTS.md](./AGENTS.md) | Agentes, skills e slash commands disponiveis |
| [CLAUDE.md](./CLAUDE.md) | Instrucoes para Claude Code |
| [GEMINI.md](./GEMINI.md) | Instrucoes para Google Gemini |
| [docs/README.md](./docs/README.md) | Indice de documentacao |

**Fonte canonica dos agents**: `.gos/agents/profiles/`
**Fonte canonica das skills**: `.gos/skills/`
**Registry de skills**: `.gos/skills/registry.json`

## Licença

Este é um projeto interno da **Ganbatte**. Distribuído sob licença [MIT](LICENSE).

---
© 2026 Ganbatte. Todos os direitos reservados.
