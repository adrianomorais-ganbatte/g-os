# ganbatte-os For Gemini CLI

Use este projeto como um kit de desenvolvimento: design-to-code, implementacao, otimizacao e seguranca.

## Entrypoints

Superficie user-facing = 2 slash commands. As skills sao invocadas pelo master, nao digitadas.

- `/gos:agents:gos-master` — orquestrador; decide skills/agentes/squads e executa.
- `/gos:agents:ux-design-expert` — design de interface, tokens, design systems.

## Prioridades

- Figma, Figma Make e Stitch para React/Next.js (codigo de referencia = triagem; avaliar antes de copiar)
- arquitetura antes de codigo: stack-first (`docs/stack.md` + ADR), own-vs-managed consciente, Mermaid p/ fluxos — `.gos/libraries/architecture-stack-policy.md`
- planejamento por tela (`*plan` → `*execute-plan` → `*validate-plan`, com criterios de aceite)
- auditoria de seguranca e performance (`*security-review`, `*perf-review`)
- revisao de qualidade antes de entrega
- master explicavel: cada acao explicada em nivel de produto/negocio (tecnico e nao-tecnico entendem)

## Fontes principais

- `AGENTS.md`
- `CLAUDE.md`
- `.gos/skills/registry.json`
