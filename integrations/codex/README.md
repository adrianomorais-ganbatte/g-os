# Codex Adapter

Adapter para ambiente Codex (OpenAI CLI).

## Status: Ativo

## Como funciona

O Codex le automaticamente o arquivo `AGENTS.md` na raiz do projeto.
O script `sync-codex-agents.js` gera esse arquivo a partir das fontes canonicas do framework.

## Sync

```bash
npm run sync:codex-agents        # Gera/atualiza AGENTS.md
npm run check:codex-agents       # Verifica se esta em sincronia
```

## Fontes

- `agents/profiles/index.json` — perfis de agentes
- `skills/registry.json` — skills registradas
- `rules/*.md` — regras de governanca
- `playbooks/*.md` — playbooks operacionais

## Referencia

- Command map: `integrations/codex/command-map.json`
- Sync script: `scripts/integrations/sync-codex-agents.js`
