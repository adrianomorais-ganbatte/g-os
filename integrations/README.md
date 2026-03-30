# Integrations Layer (Multi-IDE / Multi-LLM)

Este diretório define como o core do A8Z (na raiz) é exposto para cada IDE.

## Princípio

- **Core compartilhado**: permanece na raiz (`agents/`, `rules/`, `skills/`, `playbooks/`, `prompts/`, etc.).
- **Integrações de IDE**: ficam em `integrations/<ide>/` e descrevem aliases/adapters.
- **Workspace local da IDE** (ex.: `.claude/`): deve ser fino, contendo apenas configuração local e ponte para o core.

## Estrutura

```text
integrations/
├── registry.json               # Registro global de integrações e comandos canônicos
├── claude/
│   ├── README.md               # Regras do adapter Claude
│   └── command-map.json        # Mapeamento comando-IDE -> artefato core
├── codex/
├── opencode/
└── antigravity/
```

## Comandos canônicos

A8Z usa IDs neutros para comandos compartilhados (ex.: `a8z.search`, `a8z.spec`, `a8z.tasks`, `a8z.code`, `a8z.review`).

Cada IDE mapeia esses IDs para sua forma nativa (slash command, menu, atalho, workflow).

## Perfis de agentes

- Fonte canônica: `agents/profiles/`
- Adapter Claude: `.claude/commands/a8z/agents/`
- Sincronização: `node scripts/integrations/sync-claude-agent-adapters.js`

## Validacao do catalogo de integracoes

Use o gate local antes de alterar qualquer `command-map` ou `registry`:

```bash
npm run check:integrations
```
