# ganbatte-os

Framework operacional para design-to-code, squads de entrega e sprint sync com ClickUp.

---

[![NPM Version](https://img.shields.io/npm/v/ganbatte-os)](https://www.npmjs.com/package/ganbatte-os)
[![NPM Home](https://img.shields.io/badge/NPM-Registry-red)](https://www.npmjs.com/package/ganbatte-os)
![Node >= 18](https://img.shields.io/badge/Node.js-%3E%3D18-green)

O **ganbatte-os** organiza agentes de IA, skills e squads num workspace pronto para uso. Ele orquestra o ciclo completo de desenvolvimento conectando Figma, ClickUp e as principais IDEs de IA (Claude Code, Gemini, Cursor, etc). Baseado nos padrões do framework `.a8z-OS`.

## Quick Start

### 1. Instalação (Recomendado)
Para transformar qualquer diretório em um workspace ganbatte-os:

```bash
mkdir meu-projeto && cd meu-projeto
npx ganbatte-os install
```

> [!TIP]
> Durante o desenvolvimento ou para usar a versão mais recente, você pode instalar diretamente do GitHub:
> `npx adrianomorais-ganbatte/g-os#main install`

### 2. Pós-Instalação
Após rodar o install, o framework criará uma estrutura limpa na sua raiz:
- `.gos/` — O núcleo do framework (Agentes, Skills, Scripts).
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` — Instruções para as IDEs.
- `packages/` — Onde você deve colocar o código do seu aplicativo.

### 3. Comandos do Workspace
A partir da raiz do seu projeto, você pode gerenciar o framework:

- `npm run gos:doctor` — Valida se o framework está íntegro e as IDEs configuradas.
- `npm run gos:update` — Sincroniza seu workspace com as últimas melhorias da Ganbatte.
- `npm run sync:ides` — Regenera os adapters para Claude, Gemini, Cursor e outras.

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

| Nome | Foco |
|------|------|
| **ux-design-expert** | Design de interfaces, tokens e design systems. |
| **architect** | Definição de stack, padrões técnicos e revisões de código. |
| **dev** | Implementação de features, hooks e refinamentos visuais. |
| **sm / po** | Gestão de sprint, priorização de backlog e sync com stakeholders. |
| **squad-creator** | Orquestração de times multi-agentes para tarefas complexas. |

## Licença

Este é um projeto interno da **Ganbatte**. Distribuído sob licença [MIT](LICENSE).

---
© 2026 Ganbatte. Todos os direitos reservados.
