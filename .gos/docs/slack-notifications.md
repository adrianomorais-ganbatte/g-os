# Slack Notifications — Pipeline com aprovação

Workflow de notificações Slack que disparam a partir de commits com `T-NNN` no message. Tudo passa por uma fila de aprovação — nada é enviado sem revisão humana.

## Overview

```
git commit -m "fix: ... Refs T-NNN"
      │
      ▼
.git/hooks/post-commit (shim bash, define GANBATTE_ROOT)
      │
      ▼
scripts/hooks/post-commit-sync.js
      │  1. extrai T-NNN do message
      │  2. lê registry.taskDetails + taskStatus
      │  3. constrói payload via slack-notify.buildTaskDonePayload
      │     (sanitiza texto com text-sanitize.js)
      │  4. chama slack-notify.enqueueDraft
      ▼
.gos/slack-queue/<timestamp>-<taskId>-<hash>.json  (status: pending)
      │
      │  [commit termina — nada foi enviado]
      │
      ▼
/slack-review  (Douglas roda quando quiser)
      │  lista drafts, mostra preview, AskUserQuestion
      │  ações: approve / edit / reject / skip
      ▼
node slack-queue.js approve <id>
      │  POST webhook Slack
      ▼
Slack #cspo-tech ← notificação enriquecida e revisada
      │
      ▼
.gos/slack-queue/sent/<id>.json   (histórico)
```

## Anatomia do payload

Campos extraídos de `data/sprints/registry.json`:

| Fonte | Campo | Uso no payload |
|---|---|---|
| `taskDetails[T-NNN].name` | nome da task | linha 2 do payload |
| `taskDetails[T-NNN].assignee` | responsável | linha meta (primeiro nome) |
| `taskDetails[T-NNN].sprint` | sprint | linha meta |
| `taskDetails[T-NNN].ac[]` | array de ACs | rodapé — "N ACs" |
| `taskStatus[T-NNN].points` | story points | linha meta |
| `taskStatus[T-NNN].dueDate` | prazo | linha meta (MM/DD) |
| `taskMap[T-NNN]` | ID ClickUp | link ClickUp no rodapé |

Formato renderizado:

```
:white_check_mark: T-110 concluída — S07 · Douglas · 8 pts · due 04/17
Resolver drift TypeScript + instalar pre-commit hook
> Commit: 54d8fe6 — fix: drift resolvido
> 7 ACs · por Douglas Oliveira · <ClickUp>
```

## Pipeline de sanitização

`text-sanitize.js` aplica, em ordem, sobre qualquer texto que entra em payload:

1. **Protege code fences** (```` ``` ````) e inline code (`` ` ``).
2. **P17 emoji-bullets**: remove emojis (✅ ❌ ⚠ 🚀 ⭐ 🎯 💡 🔧 🎉 🔥 👍 👌) no início de linhas.
3. **P14 em-dash entre palavras**: `word—word` → `word-word` (mantém travessão legítimo com espaços).
4. **Acentos pt-BR**: dicionário determinístico — `concluida → concluída`, `atualizacao → atualização`, ~80 termos.
5. **P07 vocabulário IA**: `aprimorar → melhorar`, `fomentar → estimular`, `crucial → importante`, ~25 termos com preservação de flexão (gerúndio, plural) e case.
6. **Restaura code spans** intactos.

Estender dicionários: editar `AI_VOCAB` e `MISSING_ACCENTS` em `.gos/scripts/tools/text-sanitize.js`.

## Fila de aprovação

**Localização**: `.gos/slack-queue/` (gitignored)

**Estados**:

| Estado | Diretório | Remoção |
|---|---|---|
| `pending` | `.gos/slack-queue/*.json` | manual (approve/reject) |
| `sent` | `.gos/slack-queue/sent/*.json` | manual, após confirmação |
| `rejected` | `.gos/slack-queue/rejected/*.json` | auditoria, manter histórico |

**TTL**: sem expiração automática. Limpar manualmente `sent/` e `rejected/` a cada sprint via `rm -rf .gos/slack-queue/{sent,rejected}`.

**Estrutura do draft**:

```json
{
  "id": "20260417T143100-T110-54d8fe6",
  "createdAt": "2026-04-17T14:31:00Z",
  "taskId": "T-110",
  "commit": "54d8fe6",
  "channel": "default",
  "author": "Douglas Oliveira",
  "payload": { "text": "..." },
  "status": "pending"
}
```

## Comandos

### slack-queue.js

```bash
# Listar pendentes
node .gos/scripts/tools/slack-queue.js list
node .gos/scripts/tools/slack-queue.js list --json

# Mostrar um draft
node .gos/scripts/tools/slack-queue.js show <id>

# Editar inline (abre $EDITOR / VISUAL / notepad no Windows)
node .gos/scripts/tools/slack-queue.js edit <id>

# Aprovar e enviar
node .gos/scripts/tools/slack-queue.js approve <id>

# Rejeitar
node .gos/scripts/tools/slack-queue.js reject <id> --reason "duplicate"

# Aprovar todos pendentes (CI, depois de revisão visual)
node .gos/scripts/tools/slack-queue.js flush
```

### slack-notify.js

```bash
# Enfileirar manualmente (default)
node .gos/scripts/tools/slack-notify.js task-done \
  --task T-110 --commit 54d8fe6 --author "Douglas Oliveira" \
  --registry data/sprints/registry.json

# Envio imediato sem fila (bypass revisão — usar só em CI)
node .gos/scripts/tools/slack-notify.js task-done \
  --task T-110 --commit 54d8fe6 --author "Douglas Oliveira" \
  --registry data/sprints/registry.json --send-now

# Dry-run (monta payload sem enviar nem enfileirar)
node .gos/scripts/tools/slack-notify.js task-done \
  --task T-110 --commit 54d8fe6 --author "Douglas Oliveira" \
  --registry data/sprints/registry.json --send-now --dry-run
```

### text-sanitize.js

```bash
# CLI
node .gos/scripts/tools/text-sanitize.js --text "Task concluida aprimorando"
node .gos/scripts/tools/text-sanitize.js --file path/to/content.md --json
echo "texto sujo" | node .gos/scripts/tools/text-sanitize.js --stdin

# Como módulo
const { sanitize } = require('./.gos/scripts/tools/text-sanitize.js')
const { text, changes } = sanitize(input)
```

## Skill `/slack-review`

Ver `.gos/skills/slack-review/SKILL.md`. Wrapper interativo do `slack-queue.js list|show|edit|approve|reject` com preview renderizado e `AskUserQuestion` para cada ação.

## Como pular aprovação

**CI / automação** onde revisão humana não faz sentido:

```bash
node .gos/scripts/tools/slack-notify.js <cmd> --send-now
```

**Flush programado** (ex: cron de fim de dia):

```bash
node .gos/scripts/tools/slack-queue.js flush
```

Usar com cuidado — fila existe justamente para evitar envio acidental.

## Troubleshooting

### Commit rodou mas fila não tem drafts

- Verificar que o commit message contém `T-NNN` (regex `\bT-\d{3}\b`).
- Confirmar hook instalado: `ls packages/fractus/.git/hooks/post-commit`.
- Confirmar hook aponta para `$GANBATTE_ROOT/scripts/hooks/post-commit-sync.js` e exporta `GANBATTE_ROOT`.
- Rodar manual: `cd packages/fractus && GANBATTE_ROOT=$(git rev-parse --show-superproject-working-tree || pwd) node ../../scripts/hooks/post-commit-sync.js`.

### Approve falha com "SLACK_WEBHOOK_URL not set"

- Arquivo `.env` na raiz (`e:\Github\Ganbatte\.env`) contém `SLACK_WEBHOOK_URL=...`?
- `slack-queue.js` carrega `.env` automaticamente via `loadRootEnv()` — se variável está no `.env` mas não é lida, conferir formatação (sem aspas extras, `KEY=VALUE` puro).

### Draft stuck em pending após approve

- Abrir o JSON em `.gos/slack-queue/sent/<id>.json` — se existe, o envio OK mas `unlink` do original falhou (permission issue Windows). Remover manualmente.
- Se não existe, o POST webhook falhou — ver output do comando (status HTTP + body).

### Edição travada

- `edit` abre `$VISUAL` → `$EDITOR` → `notepad` (Windows) / `vi` (Unix). Se o editor não fechar, o comando fica bloqueado.
- Alternativa: editar o JSON direto em `.gos/slack-queue/<id>.json` e rodar approve em seguida.

### Texto sanitizado incorretamente

- Ver `changes[]` do sanitize: `node .gos/scripts/tools/text-sanitize.js --text "..." --json`.
- Se uma substituição está errada, remover do dicionário em `text-sanitize.js:AI_VOCAB` / `MISSING_ACCENTS`.
- Code spans (`` ` `` e ```` ``` ````) são preservados — se precisar isolar um termo, envolver em backticks.

## Referências

- [`text-sanitize.js`](../scripts/tools/text-sanitize.js) — sanitizador
- [`slack-queue.js`](../scripts/tools/slack-queue.js) — fila
- [`slack-notify.js`](../scripts/tools/slack-notify.js) — payload + envio
- [`post-commit-sync.js`](../../scripts/hooks/post-commit-sync.js) — hook
- [`ai-writing-patterns.md`](../libraries/content/ai-writing-patterns.md) — catálogo base
- [`humanizer`](../skills/humanizer/SKILL.md) — skill de humanização criativa
- [`slack-review`](../skills/slack-review/SKILL.md) — skill de aprovação interativa
