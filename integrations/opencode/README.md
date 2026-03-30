# OpenCode Adapter

Adapter ativo para ambiente OpenCode (opencode.ai).

## Status: Ativo

- Skills sincronizadas automaticamente via `npm run sync:opencode-skills`
- 73 skills do a8z disponiveis como `.opencode/skills/a8z-{slug}/SKILL.md`
- CLI `a8z init` gera adapters automaticamente

## Compatibilidade nativa

OpenCode le nativamente:
- `AGENTS.md` (mesmo formato que Codex)
- `CLAUDE.md` (compatibilidade retroativa)
- `.claude/skills/` (skills do Claude Code)

Isso significa que projetos com a8z ja funcionam no OpenCode sem configuracao adicional.

## Setup

```bash
# 1. Instalar a8z no projeto
npx @imdouglasoliveira/a8z-framework init

# 2. OpenCode detecta automaticamente:
#    - AGENTS.md (regras do projeto)
#    - .opencode/skills/ (skills do a8z)
#    - CLAUDE.md (instrucoes adicionais)

# 3. Usar skills no OpenCode
# O agente descobre skills via tool "skill" e carrega sob demanda
```

## Sync manual

```bash
# Regenerar adapters de skills
npm run sync:opencode-skills

# Validar adapters
npm run check:opencode-skills

# Sync todas as IDEs (inclui OpenCode)
npm run sync:all-ides
```

## Equivalencia a8z <-> OpenCode

| a8z | OpenCode |
|-----|----------|
| `.a8z/skills/*/SKILL.md` | `.opencode/skills/*/SKILL.md` |
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
│       ├── a8z-commit-dev/SKILL.md    # Adapter auto-gerado
│       ├── a8z-fe/SKILL.md            # Adapter auto-gerado
│       └── ...                        # 73 skills
└── .a8z/
    └── skills/                        # Fonte canonica
```

## Referencia

- [Documentacao OpenCode](https://opencode.ai/docs/)
- `integrations/opencode/command-map.json` — mapeamento de comandos
- `scripts/integrations/sync-opencode-skills.js` — script de sync
