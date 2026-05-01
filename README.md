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

| Comando | Equivalente CLI | O que faz |
|---------|-----------------|-----------|
| `npm run gos:init` | `gos init` | Setup pos-clone: configura `upstream`, cria `.gos-local/`, gera IDE adapters |
| `npm run gos:update` | `gos update` | Fetch + merge do upstream (**apenas em fork/clone do g-os**) |
| `npm run gos:doctor` | `gos doctor` | Health-check (42+ checks: skills, agents, IDE adapters, upstream alcançável, stashes acumulados, modo workspace) |
| `npm run gos:version` | `gos version` | Versão instalada, modo do workspace e atualizações pendentes |
| `npm run gos:rescue` | `gos rescue` | Lista/recupera stashes acumulados de updates falhos |
| `npm run sync:ides` | — | Regenera apenas os IDE adapters (`.claude/`, `.qwen/`, `.gemini/`, `.cursor/`, `.agents/`) |
| `npm run check:ides` | — | Valida que adapters estão consistentes com `.gos/skills/registry.json` |
| `npm run clickup` | — | CLI ClickUp |

## Atualizar o ganbatte-os

Existem **três níveis distintos** de versão. Saiba qual atualizar antes de rodar qualquer comando.

### Descobrir em que cenário você está

```bash
npm run gos:version
# imprime: versão local + modo (framework workspace | projeto consumidor)
```

| Modo detectado | Significa | Como atualizar |
|----------------|-----------|----------------|
| `framework workspace` | Você clonou/forkou o repo `g-os` para contribuir | `npm run gos:update` |
| `projeto consumidor` | Seu projeto usa o G-OS (rodou `gos install` aqui) | `gos install --force` |
| (CLI global) | O comando `gos` instalado via `npm install -g` | `npm install -g ganbatte-os@latest` |

### Nível 1 — CLI global (`gos`)

```bash
# Versão atual instalada vs publicada no registry:
npm list -g ganbatte-os
npm view ganbatte-os version

# Atualizar:
npm install -g ganbatte-os@latest
```

### Nível 2 — Projeto consumidor

Seu projeto NÃO é fork do G-OS, mas usa o framework via `gos install`. O `.gos/` mora dentro do seu repo.

```bash
# Pré-checagem (uma vez):
git remote -v
# Se houver "upstream" apontando para g-os.git, REMOVA: 
#   git remote remove upstream
# (essa configuração só faz sentido em fork do framework)

# Atualizar o framework dentro do seu projeto:
gos install --force
# Sobrescreve .gos/ com a última versão do pacote ganbatte-os global,
# preservando seus arquivos (packages/, docs/, .gos-local/).
```

> [!WARNING]
> NÃO use `npm run gos:update` em projeto consumidor. O CLI agora detecta esse cenário e aborta com instruções, mas em versões antigas ele tentava `git fetch upstream main` e quebrava de forma confusa.

### Nível 3 — Framework workspace (fork/clone do g-os)

Você está contribuindo com o próprio framework.

```bash
# Pré-checagem (sempre antes de update):
npm run gos:doctor
# Valida 42+ pontos. Aborta se upstream estiver com URL quebrada
# ou se houver stashes acumulados de updates anteriores falhos.

# Ver quantos commits faltam:
npm run gos:version

# Aplicar (lê dev branch do .gos/config.json#defaultBranches.development):
npm run gos:update
```

`gos:update` agora é **fail-safe**:

1. Bloqueia se modo for `consumer`
2. Valida `upstream` reachable (`git ls-remote`) ANTES de stashar
3. Lê branch de desenvolvimento do `.gos/config.json` (não hardcoded)
4. Faz fetch primeiro; se nada mudou, sai sem stash
5. Stash recebe label timestamped único
6. Auto-resolve conflitos em arquivos do framework (`frameworkManaged` no manifest); aborta em conflitos do usuário

Override de branch (debug):

```bash
GOS_UPSTREAM_BRANCH=beta npm run gos:update
```

### Resgate de stashes presos

Se você teve falhas anteriores que deixaram stashes:

```bash
npm run gos:rescue                          # lista todos com stat
npm run gos:rescue -- --pop-latest          # aplica o mais recente
npm run gos:rescue -- --drop-all            # remove todos (após revisão)
```

### Resumo (qual comando para qual cenário)

| Cenário | Comando |
|---------|---------|
| Atualizar CLI `gos` global | `npm install -g ganbatte-os@latest` |
| Atualizar G-OS num projeto consumidor | `gos install --force` |
| Atualizar G-OS num fork/clone do repo | `npm run gos:update` |
| Stashes presos de updates falhos | `npm run gos:rescue` |
| Saber em qual cenário você está | `npm run gos:version` |
| Validar tudo de uma vez | `npm run gos:doctor` |

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

Pipeline padronizado para criacao de planos por tela. **Toda tela = 1 plano**. Toda execucao gera plano + tasks + contexto, com status auditavel e contrato de stack.

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

`.gos-local/plan-paths.json` define onde cada projeto guarda seus artefatos. Cada projeto/dev pode organizar diferente.

**Inicializar com defaults** (helper):

```bash
node .gos/scripts/tools/plan-paths.js init     # cria .gos-local/plan-paths.json se nao existir
node .gos/scripts/tools/plan-paths.js show     # imprime config atual
node .gos/scripts/tools/plan-paths.js get planos   # imprime path resolvido para "planos"
```

**Exemplo de config** (caso real do `packages/fractus`):

```json
{
  "schema": "gos.plan-paths.v1",
  "dirs": {
    "projeto":            "src/",
    "storybook":          ".referencia-storybook/",
    "design_system_doc":  ".referencia-storybook/docs/DESIGN_SYSTEM_REFERENCE.md",
    "components":         ".referencia-storybook/components/",
    "stories":            ".referencia-storybook/stories/",
    "planos":             "docs/plans/",
    "tasks":              "docs/plans/{plan}/tasks/",
    "contexto":           "docs/plans/{plan}/context.md",
    "progress":           "progress.txt",
    "stack":              "docs/stack.md",
    "adr":                "docs/adr/",
    "postman":            "docs/postman/",
    "regras_negocio":     "docs/regras-de-negocio/"
  },
  "knowledge_sources": [
    { "kind": "postman",        "path": "docs/postman/",            "required": false },
    { "kind": "business-rules", "path": "docs/regras-de-negocio/",  "required": false },
    { "kind": "adr",            "path": "docs/adr/",                "required": false },
    { "kind": "design-system",  "path": ".referencia-storybook/docs/DESIGN_SYSTEM_REFERENCE.md", "required": true }
  ],
  "naming": { "plan_prefix": "PLAN", "task_prefix": "T", "seq_padding": 3 },
  "figma":  { "mcp_enabled": true, "default_file_url": null }
}
```

Helpers em `.gos/scripts/tools/`:
- `plan-paths.js` — resolve caminhos do projeto-cliente
- `plan-status.js` — valida transicoes de status (state machine)
- `stack-scan.js` — infere stack lendo `package.json`, configs e `knowledge_sources`

### Exemplos de uso (end-to-end)

Todos os comandos abaixo sao invocados via slash command no `gos-master` (Claude Code, Gemini, Cursor, etc).

#### 1. Bootstrap do workspace (uma vez por projeto)

```bash
/gos:agents:gos-master
```

Em seguida, no chat:

```
*stack refresh
```

Saida esperada:

```
## Stack profilada — packages/fractus

- Framework: Next.js 15 (App Router)
- DB: Supabase (read-only)
- Design System: .referencia-storybook
- Knowledge sources: 4 (postman, business-rules, adr, design-system)

stack.md: docs/stack.md
lock:     .gos-local/stack.lock.json
hashes:   12 arquivos
```

Verifique sempre que algo na stack mudar (lib, framework, ORM):

```
*stack drift
```

#### 2. Criar plano para uma tela

A partir de URL Figma (autodetecta e usa Figma MCP):

```
*plan https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25387
```

A partir de descricao livre:

```
*plan tela de checkout com formulario de pagamento e resumo do pedido
```

Saida:

```
## Plano criado: PLAN-042-checkout

- plan.md:    docs/plans/PLAN-042-checkout/plan.md
- context.md: docs/plans/PLAN-042-checkout/context.md
- tasks/:     docs/plans/PLAN-042-checkout/tasks/ (5 tasks: T-042-001 ... T-042-005)
- progress:   atualizado (status=pendente)
- stack_ref:  docs/stack.md@a1b2c3d

Proximos passos:
1. Revisar plan.md e checklist de aceite
2. *progress status T-042-001 em-andamento
3. Executar
```

Telas complexas (modal + drawer + sub-rotas) sao **subdivididas automaticamente** em planos filhos:

```
PLAN-042-checkout            (pai, checklist consolidado)
├── PLAN-042.1-payment-modal (filho)
├── PLAN-042.2-summary-drawer
└── PLAN-042.3-confirm-page
```

#### 3. Executar tasks

```
*progress show                              # mostra progress.txt atual
*progress status T-042-001 em-andamento     # iniciar task
# ... dev implementa ...
*progress status T-042-001 validacao        # task pronta para revisao (commit preparado, nao pushado)
```

Tentar pular validacao falha:

```
*progress status T-042-001 concluido
> erro: transicao invalida: em-andamento → concluido
> use --rollback para voltar para pendente
```

#### 4. Fechar o plano

Quando todas as tasks estao em `validacao` e o checklist do plano esta completo:

```
*progress status PLAN-042-checkout validacao    # validacao humana + QA
*progress status PLAN-042-checkout concluido    # SOMENTE apos aprovacao
```

`progress-tracker compact` periodicamente reescreve `progress.txt` removendo tasks `concluido` antigas para manter o arquivo < 4kB (otimizado para LLM).

#### 5. Mudanca de arquitetura (excecao)

Se a tela exigir alteracao da stack (nova lib, novo padrao de fetching, schema novo):

```
*plan tela-relatorios --allow-arch-change
```

Isso forca a Fase 2 propositiva e gera um ADR em `docs/adr/ADR-NNNN-<slug>.md` antes de prosseguir. O plano resultante referencia o ADR no frontmatter (`arch_change: true`).

### Estrutura de saida

Apos `*plan tela-checkout`:

```
docs/plans/PLAN-042-checkout/
├── plan.md          # frontmatter (id, tela, figma_url, status, stack_ref) + secoes fixas
├── context.md       # denso, indice de arquivos, decisoes, riscos
└── tasks/
    ├── T-042-001-criar-rota-checkout.md
    ├── T-042-002-fetching-supabase.md
    ├── T-042-003-form-pagamento.md
    ├── T-042-004-resumo-pedido.md
    └── T-042-005-estados-erro-loading.md
```

`progress.txt` na raiz do projeto fica:

```
# progress.l1
ts=2026-05-01T18:22:00-03:00
project=fractus
plan_active=docs/plans/PLAN-042-checkout/plan.md
tasks_dir=docs/plans/PLAN-042-checkout/tasks/
context=docs/plans/PLAN-042-checkout/context.md
stack_ref=docs/stack.md@a1b2c3d
status=em-andamento

last_done=T-042-002 fetching-supabase
current=T-042-003 form-pagamento
next=T-042-004 resumo-pedido

blockers=
notes=fetch usa server component em app/checkout/page.tsx
```

### Playbook completo

[`.gos/playbooks/plan-creation-playbook.md`](./.gos/playbooks/plan-creation-playbook.md) — documenta o fluxo end-to-end com troubleshooting.

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
