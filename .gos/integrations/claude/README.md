# Claude Adapter (Thin Integration)

Este adapter define como o Claude Code consome artefatos do core G-OS.

## Regras

- Não duplicar conteúdo de negócio em `.claude/` (prompts, rules, skills, playbooks).
- Sempre apontar para artefatos da raiz.
- Manter em `.claude/` apenas:
  - configurações locais da IDE;
  - hooks e utilitários estritamente específicos da IDE;
  - aliases/comandos que encaminham para o core.

## Fonte de mapeamento

- `command-map.json` é o contrato de mapeamento Claude -> comandos canônicos G-OS.
- `agent-map.json` mapeia agentes canônicos para wrappers de comando do Claude.
- `integrations/registry.json` mantém o registro global multi-IDE.
- `agents/profiles/` contém os perfis de agente canônicos.
- `.claude/commands/gos/agents/` contém wrappers adapter para Claude.
- `mcp-specifics.md` contém regras de MCP específicas do Claude em camada de integração.

## Sync de adapters

```bash
npm run sync:ides
npm run check:ides
```

## Caminhos preferenciais

- Prompts: `prompts/*.md`
- Regras: `rules/*.md`
- Agentes: `agents/.base/system-prompts/*.md`
- Runtime no projeto alvo: `./.G-OS/*`
