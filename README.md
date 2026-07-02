# ganbatte-os

Framework operacional de desenvolvimento: prototipacao, design-to-code, implementacao, otimizacao e seguranca.

---

[![NPM Version](https://img.shields.io/npm/v/ganbatte-os)](https://www.npmjs.com/package/ganbatte-os)
[![NPM Home](https://img.shields.io/badge/NPM-Registry-red)](https://www.npmjs.com/package/ganbatte-os)
![Node >= 18](https://img.shields.io/badge/Node.js-%3E%3D18-green)

O **ganbatte-os** e um workspace de IA para desenvolvimento. Você conversa com **um orquestrador** e ele decide sozinho quais skills, agentes e squads acionar — do Figma ao código, passando por implementação, otimização e segurança. Funciona nas principais IDEs de IA (Claude Code, Codex, Qwen, Opencode, Gemini, Antigravity).

## Instalação

Instalação **global** (recomendada):

```bash
npm install -g ganbatte-os
```

Depois, dentro do seu projeto:

```bash
mkdir meu-projeto && cd meu-projeto
git init            # recomendado (habilita versionamento e updates)
gos install
```

O `gos install` cria uma estrutura enxuta na raiz:

- `.gos/` — núcleo do framework (agentes, skills, scripts). Somente leitura.
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` — instruções que a IDE lê automaticamente.
- `packages/` — onde vive o código do seu app.
- adapters de IDE (`.claude/`, `.codex/`, `.qwen/`, `.opencode/`, `.gemini/`, `.agent/`) — gerados automaticamente.

Atualizar o CLI global depois: `npm install -g ganbatte-os@latest` · atualizar o framework num projeto: `gos install --force`.

## Como usar: duas portas de entrada

Você digita **apenas dois** slash commands. Todo o resto é roteado internamente.

| Slash command | Quando usar |
|---------------|-------------|
| `/gos:agents:gos-master` | Ponto de entrada padrão. Descreva o que quer (criar tela, auditar segurança, refatorar, montar squad) e o master decide as skills/agentes/squads e executa. |
| `/gos:agents:ux-design-expert` | Design de interface, tokens e design systems. |

> As 34 skills e os 11 agentes **não** são digitados como comando. O `gos-master` os invoca por você a partir da sua intenção. Dentro do chat, você guia o fluxo com comandos de asterisco (ex.: `*plan`, `*security-review`) que o master reconhece.

### O que o gos-master aciona por você

- **Design → código** — `design-to-code`, `figma-implement-design`, `figma-make-analyzer`, `interface-design`, `ui-guardrails` (Figma/screenshot → React/Next.js fiel).
- **Frontend/React** — `frontend-dev`, `react-best-practices`, `react-doctor`, `component-dedup`.
- **Pipeline de planos** — `plan-blueprint`, `plan-to-tasks`, `execute-plan`, `validate-plan`, `progress-tracker`, `stack-profiler` (ver abaixo).
- **Qualidade** — `security-review`, `perf-review`, `simplify-review`.
- **Texto/produto** — `humanizer`, `idea-intake`, `prd-from-intake`, `adr-tech-decisions`.

Catálogo completo: `.gos/skills/registry.json`.

## Pipeline de planos (o fluxo de dev)

Toda tela vira **um plano**. A stack de `docs/stack.md` é contrato — mudança de stack exige ADR. O trabalho é dividido em três etapas com **modelo por etapa** (configurável em `.gos-local/models.json`):

- **plan** (Senior) planeja → **execute** (Junior) implementa → **validate** (Senior) audita e corrige gaps.

```
*stack refresh            # mapeia a stack do projeto (uma vez, ou quando mudar)
*plan <tela|figma-url>    # cria plan.md + context.md + spec.md + tasks/ (com critérios de aceite)
*execute-plan PLAN-NNN    # implementa task-a-task, com visual gate e loop de correção
*validate-plan PLAN-NNN   # audita, corrige gaps, roda segurança + performance + doc-sync
*progress show            # estado atual (pendente → em-andamento → validacao → concluido)
```

Cada task carrega critérios de aceite verificáveis. No `execute-plan`, um critério que passa segue adiante; inconclusivo vira bypass com alerta; não atendido entra em loop de correção até passar. O `validate-plan` fecha o plano só depois de segurança/performance/documentação sincronizadas.

Auditorias sob demanda, a qualquer momento:

```
*security-review    # RLS, authz, secrets, injection (Supabase/D1)
*perf-review        # cache, filas, N+1, paginação, over-fetch
*simplify-review    # anti-over-engineering (remove o que não precisa existir)
```

Playbook end-to-end: [`.gos/playbooks/plan-creation-playbook.md`](./.gos/playbooks/plan-creation-playbook.md).

## Comandos do workspace

| Comando | O que faz |
|---------|-----------|
| `gos init` | Setup pós-clone: configura `.gos-local/` e gera os IDE adapters |
| `gos doctor` | Health-check (63 checks: skills, agentes, adapters, upstream) |
| `gos version` | Versão instalada e modo do workspace |
| `npm run sync:ides` | Regenera os IDE adapters após mudar skills/agentes |
| `npm run check:ides` | Valida os adapters contra `.gos/skills/registry.json` |

## Estrutura do workspace

```text
├── .gos/          # Core do framework (agents, skills, scripts) — somente leitura
├── .gos-local/    # Config local: models.json, plan-paths.json, logs (ignorado no git)
├── packages/      # Seu código-fonte vive aqui
├── AGENTS.md      # Entrypoint de agentes
├── CLAUDE.md      # Instruções para Claude Code
└── GEMINI.md      # Instruções para Google Gemini
```

## Atualizar o framework

| Cenário | Comando |
|---------|---------|
| CLI `gos` global | `npm install -g ganbatte-os@latest` |
| Framework num projeto consumidor | `gos install --force` |
| Fork/clone do repo `g-os` | `npm run gos:update` |
| Saber em qual cenário você está | `gos version` |
| Validar tudo | `gos doctor` |

> `gos:update` é fail-safe: só roda em fork/clone, valida `upstream` antes de mexer, e auto-resolve conflitos em arquivos do framework. Se travar (stashes, históricos não relacionados), `gos rescue` recupera. Num **projeto consumidor**, use sempre `gos install --force` — nunca `gos:update`.

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [AGENTS.md](./AGENTS.md) | Agentes e entrypoints |
| [CLAUDE.md](./CLAUDE.md) | Instruções para Claude Code |
| [GEMINI.md](./GEMINI.md) | Instruções para Google Gemini |

Fonte canônica: agentes em `.gos/agents/profiles/`, skills em `.gos/skills/` (registry em `.gos/skills/registry.json`).

## Licença

Distribuído sob licença [MIT](LICENSE).

---

© 2026 Douglas Oliveira · [github.com/imdouglasoliveira](https://github.com/imdouglasoliveira)
