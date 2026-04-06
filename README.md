# ganbatte-os
# ganbatte-os

Framework operacional para design-to-code, squads de entrega e sprint sync com ClickUp.

---

[![NPM Version](https://img.shields.io/npm/v/ganbatte-os)](https://www.npmjs.com/package/ganbatte-os)
![Node >= 18](https://img.shields.io/badge/Node.js-%3E%3D18-green)

O ganbatte-os organiza agentes de IA, skills e squads num workspace pronto para uso. Ele conecta Figma, ClickUp e 7 IDEs diferentes para acelerar a entrega de projetos de software. Baseado no framework .a8z-OS.

## Quick Start

### 1. Instalação (Recomendado)
Para criar um novo workspace ganbatte-os em qualquer diretório:

```bash
mkdir meu-projeto && cd meu-projeto
npx ganbatte-os install
```

Ou via clone tradicional:

```bash
git clone https://github.com/adrianomorais-ganbatte/ganbatte-os.git .
node scripts/cli/ganbatte-os-cli.js init
```

### 2. Comandos Disponíveis
Apos a instalação, você terá acesso aos comandos via `npm run`:

- `npm run ganbatte-os:doctor` — Validar integridade do workspace
- `npm run ganbatte-os:update` — Buscar atualizações do framework
- `npm run ganbatte-os:version` — Mostrar versão instalada

## Funcionalidades

- **Design-to-Code**: Pipeline automatizado para converter frames do Figma em código.
- **Squads de Entrega**: Agentes pré-configurados para SM, PO, Dev e QA.
- **Integração ClickUp**: Sincronização automática de tarefas e status.
- **Suporte Multi-IDE**: Configurações otimizadas para Claude Code, Gemini, Cursor e outras.

## Estrutura do Projeto

```text
├── agents/          # Perfis e instruções dos agentes
├── skills/          # Catálogo de funcionalidades reutilizáveis
├── squads/          # Definições de times de agentes
├── scripts/         # CLI e utilitários de sistema
├── manifests/       # Configurações de runtime e instalação
└── packages/        # Seus projetos e código-fonte
```

## Contribuição

Este é um projeto interno da **Ganbatte**. Para sugestões ou bugs, abra uma issue no repositório.

---
© 2026 Ganbatte. Todos os direitos reservados.

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
