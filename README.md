# G-OS

Framework operacional para design-to-code, squads de entrega e sprint sync com ClickUp.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Node >= 18](https://img.shields.io/badge/Node.js-%3E%3D18-green)

O G-OS organiza agentes de IA, skills e squads num workspace pronto para uso. Ele conecta Figma, ClickUp e 7 IDEs diferentes para acelerar a entrega de projetos de software. Baseado no framework .a8z-OS.

## Quick Start

A maneira mais rápida de começar é usando `npx` para instalar o framework diretamente no seu diretório de projeto:

```bash
mkdir meu-projeto && cd meu-projeto
npx g-os install
```

Ou via clone tradicional:

```bash
git clone https://github.com/adrianomorais-ganbatte/g-os.git meu-workspace
cd meu-workspace
node scripts/cli/gos-cli.js init
```

O comando `init` renomeia o remote para `upstream`, cria os diretorios locais e sincroniza os adapters de todas as IDEs.

## Atualizando

```bash
npm run gos:update
```

O update faz fetch do `upstream/main`, merge automatico (com stash se necessario), e re-sincroniza os IDE adapters.

## Agentes

| Nome | Foco |
|------|------|
| ux-design-expert | Design de interfaces e UX |
| architect | Arquitetura de software |
| dev | Desenvolvimento full-stack |
| sm | Scrum Master e facilitacao |
| po | Product Owner e priorizacao |
| devops | Infraestrutura e CI/CD |
| squad-creator | Montagem de squads |

## Skills

| Nome | Foco |
|------|------|
| design-to-code | Figma para codigo React |
| figma-implement-design | Implementacao de designs Figma |
| figma-make-analyzer | Analise de output do Figma Make |
| make-code-triage | Triagem de codigo gerado |
| make-version-diff | Diff entre versoes de componentes |
| component-dedup | Deduplicacao de componentes |
| frontend-dev | Desenvolvimento frontend |
| react-best-practices | Boas praticas React/Next.js |
| react-doctor | Diagnostico de problemas React |
| sprint-planner | Planejamento de sprints |
| clickup | Integracao ClickUp API |
| plan-to-tasks | Conversao de planos em tasks |
| agent-teams | Orquestracao multi-agente |

## Squads

| Nome | Foco |
|------|------|
| design-delivery | Entrega de design-to-code |
| design-squad | Squad de design |
| sprint-planning | Planejamento e sync de sprints |

## IDEs suportadas

Claude Code, Codex (VS Code), Gemini, OpenCode, Antigravity, Cursor, KiloCode

Cada IDE recebe adapters finos que apontam para os arquivos canonicos em `agents/` e `skills/`.

## Estrutura

```
g-os/
  agents/profiles/     Perfis de agentes IA
  skills/              Skills plugaveis (cada uma com SKILL.md)
  squads/              Definicoes de squads e workflows
  scripts/
    cli/               CLI gos-cli.js
    tools/             Ferramentas (clickup.js, etc)
    integrations/      Sync e validacao de IDEs
  manifests/           Manifestos de runtime e instalacao
  packages/            Seus projetos aqui
  docs/                Documentacao
  integrations/        Command maps por IDE
  templates/           Templates reutilizaveis
  prompts/             Prompts canonicos
```

## Scripts

| Script | O que faz |
|--------|-----------|
| `npx g-os install` | Instalação via NPX no diretório atual |
| `npm run gos:init` | Setup pos-clone |
| `npm run gos:update` | Atualizar do upstream |
| `npm run gos:doctor` | Validar integridade |
| `npm run gos:version` | Ver versao e checar updates |
| `npm run clickup` | CLI ClickUp API |
| `npm run sync:ides` | Sincronizar IDE adapters |
| `npm run check:ides` | Validar IDE adapters |
| `npm run doctor` | Validacao completa |

## Licenca

[MIT](LICENSE)
