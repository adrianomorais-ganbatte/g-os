# Antigravity Adapter

Adapter para ambiente Antigravity.

## Status: Ativo

## Como funciona

Antigravity le o diretorio `.antigravity/` na raiz do projeto.
O script `sync-antigravity-instructions.js` gera `instructions.md` e `config.json` a partir das fontes canonicas do framework.

## Sync

```bash
npm run sync:antigravity          # Gera/atualiza .antigravity/
npm run check:antigravity         # Verifica se esta em sincronia
```

## Fontes

- `agents/profiles/index.json` — perfis de agentes
- `skills/registry.json` — skills registradas
- `rules/*.md` — regras de governanca
- `playbooks/*.md` — playbooks operacionais

## Referencia

- Command map: `integrations/antigravity/command-map.json`
- Sync script: `scripts/integrations/sync-antigravity-instructions.js`
