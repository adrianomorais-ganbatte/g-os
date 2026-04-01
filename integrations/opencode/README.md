# OpenCode Adapter

Adapter ativo para ambiente OpenCode (opencode.ai).

## Status: Ativo

- Skills sincronizadas automaticamente via `npm run sync:ides`
- 73 skills do G-OS disponiveis como `.opencode/skills/gos-{slug}/SKILL.md`
- `npm run sync:ides` gera adapters automaticamente

## Compatibilidade nativa

OpenCode le nativamente:
- `AGENTS.md` (mesmo formato que Codex)
- `CLAUDE.md` (compatibilidade retroativa)
- `.claude/skills/` (skills do Claude Code)

Isso significa que projetos com G-OS ja funcionam no OpenCode sem configuracao adicional.

## Setup

```bash
# 1. Sincronizar adapters do G-OS no projeto
npm run sync:ides

# 2. OpenCode detecta automaticamente:
#    - AGENTS.md (regras do projeto)
#    - .opencode/skills/ (skills do G-OS)
#    - CLAUDE.md (instrucoes adicionais)

# 3. Usar skills no OpenCode
# O agente descobre skills via tool "skill" e carrega sob demanda
```

## Sync manual

```bash
# Regenerar adapters
npm run sync:ides

# Validar adapters
npm run check:ides

# Regenerar e validar tudo
npm run doctor
```

## Equivalencia G-OS <-> OpenCode

| G-OS | OpenCode |
|-----|----------|
| `.G-OS/skills/*/SKILL.md` | `.opencode/skills/*/SKILL.md` |
| `agents/.base/index.json` | `opencode.json` → `agent` |
| `rules/*.md` | `AGENTS.md` ou `instructions[]` |
| `playbooks/*.md` | `.opencode/commands/*.md` |
| MCP via `.claude/settings.json` | MCP via `opencode.json` → `mcp` |

## Configuracao recomendada

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "instructions": ["AGENTS.md", "CLAUDE.md"],
  "permission": {
    "skill": { "*": "allow" }
  }
}
```

## Arquitetura

```
projeto/
├── AGENTS.md                          # OpenCode le nativamente
├── CLAUDE.md                          # OpenCode le nativamente
├── opencode.json                      # Config OpenCode (opcional)
├── .opencode/
│   └── skills/
│       ├── gos-commit-dev/SKILL.md     # Adapter auto-gerado
│       ├── gos-fe/SKILL.md             # Adapter auto-gerado
│       └── ...                        # skills sincronizadas
└── .G-OS/
    └── skills/                        # Fonte canonica
```

## Referencia

- [Documentacao OpenCode](https://opencode.ai/docs/)
- `integrations/opencode/command-map.json` — mapeamento de comandos
- `scripts/integrations/setup-ide-adapters.js` — script de sync
