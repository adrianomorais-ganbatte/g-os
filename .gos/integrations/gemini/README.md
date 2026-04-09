# Gemini CLI Adapter

Gemini CLI funciona no `G-OS` com dois pontos principais:

- `GEMINI.md` como arquivo de contexto de projeto
- `.gemini/skills/gos-{slug}/SKILL.md` para descoberta de skills curadas

## Setup recomendado

- apontar o contexto do projeto para `GEMINI.md`
- manter `AGENTS.md` e `CLAUDE.md` como referencias auxiliares
- usar `.gemini/skills/` como espelho leve das skills do `G-OS`
- regenerar adapters com `npm run sync:ides`
