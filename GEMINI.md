# ganbatte-os For Gemini CLI

Use este projeto como um kit de desenvolvimento: design-to-code, implementacao, otimizacao e seguranca.

## Entrypoints

Superficie user-facing = 2 slash commands. As skills sao invocadas pelo master, nao digitadas.

- `/gos:agents:gos-master` — orquestrador; decide skills/agentes/squads e executa.
- `/gos:agents:ux-design-expert` — design de interface, tokens, design systems.

## Prioridades

- Figma, Figma Make e Stitch para React/Next.js
- planejamento por tela (`*plan` → `*execute-plan` → `*validate-plan`, com criterios de aceite)
- auditoria de seguranca e performance (`*security-review`, `*perf-review`)
- revisao de qualidade antes de entrega

## Fontes principais

- `AGENTS.md`
- `CLAUDE.md`
- `.gos/skills/registry.json`
