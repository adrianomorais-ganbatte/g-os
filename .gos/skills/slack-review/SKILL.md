---
name: slack-review
description: Revisar, editar e aprovar drafts de notificações Slack pendentes em .gos/slack-queue/. Use quando o usuário pedir para "revisar notificações", "aprovar Slack", "enviar notificações pendentes" ou após commits que dispararam o hook post-commit-sync.
argument-hint: "[opcional: id específico, --flush, --reject-all]"
use-when:
  - usuário pediu para revisar/aprovar notificações Slack pendentes
  - após commit em branch com hook post-commit-sync instalado
  - fila .gos/slack-queue/ tem drafts pendentes
  - preciso enviar atualização de task para o Slack com aprovação humana
do-not-use-for:
  - envio imediato sem revisão (use `node slack-notify.js --send-now`)
  - textos longos (propostas, emails) — use /humanizer primeiro
  - drafts em canal custom sem webhook configurado
metadata:
  category: workflow
  version: "1.0.0"
---

# Skill: /slack-review — Aprovar notificações Slack

Revisar drafts enfileirados por `post-commit-sync.js` antes de enviar ao Slack. Aprovar, editar inline ou rejeitar cada um.

## Quando usar

- Depois de um commit com `T-NNN` no message — hook enfileira draft em `.gos/slack-queue/`.
- Usuário pediu para revisar ou aprovar notificações pendentes.
- Antes de push/deploy quando vários commits foram feitos e é preciso consolidar notificações.

## Pré-requisitos

- `SLACK_WEBHOOK_URL` configurado em `.env` na raiz.
- Fila em `.gos/slack-queue/` existe (criada automaticamente pelo hook).

## Fluxo

### 1. Listar pendentes

```bash
node .gos/scripts/tools/slack-queue.js list
```

Saída esperada: lista de drafts com id, task, commit, author e primeira linha do payload.

Se vazio → informar usuário e encerrar.

### 2. Iterar cada draft

Para cada draft pendente:

1. Mostrar preview via `node .gos/scripts/tools/slack-queue.js show <id>`.
2. Renderizar o `payload.text` em bloco markdown para o usuário ver.
3. Via `AskUserQuestion`, perguntar: **aprovar · editar · rejeitar · pular**.

### 3. Ações

- **Aprovar**: `node .gos/scripts/tools/slack-queue.js approve <id>` — envia e move para `sent/`.
- **Editar**: propor reescrita do texto (aplicar princípios do `/humanizer` mentalmente se o texto tiver padrões IA residuais). Mostrar diff, pedir confirmação. Salvar via editar o JSON direto ou chamar `slack-queue.js edit <id>` (abre $EDITOR).
- **Rejeitar**: `node .gos/scripts/tools/slack-queue.js reject <id> [--reason "..."]` — move para `rejected/`.
- **Pular**: deixa pendente para próxima run.

### 4. Atalhos

- `node .gos/scripts/tools/slack-queue.js flush` — aprova todos pendentes de uma vez (só usar quando já revisou visualmente e tem certeza).
- `node .gos/scripts/tools/slack-queue.js list --json` — saída JSON para processamento programático.

## Exemplos

### Exemplo 1 — Revisão simples

Usuário: "Revisa as notificações Slack pendentes"

1. `slack-queue.js list` → 2 drafts (T-110, T-082).
2. Para T-110: mostrar preview, perguntar. Usuário aprova → `approve`.
3. Para T-082: mostrar preview, usuário pede para editar "Commit: wip" → propor "Commit: progresso inicial", confirmar, aplicar, approve.

### Exemplo 2 — Edição com humanização leve

Preview traz "Task concluida aprimorando a validacao". O `text-sanitize.js` já teria corrigido isso, mas se escapou (ex: texto veio via `send --text` sem pipeline), propor reescrita: "Task concluída: validação melhorada". Confirmar com usuário.

## Troubleshooting

- **"SLACK_WEBHOOK_URL não configurado"** no approve: checar `.env` na raiz, recarregar env.
- **Draft preso em pending após approve**: verificar se `sent/` foi criado e o arquivo foi movido. Se falhou no POST, ver status no output JSON.
- **Lista vazia mas esperava drafts**: confirmar que commit usou `T-NNN` e hook rodou (`ls .git/hooks/post-commit`). Ver [docs/slack-notifications.md](../docs/slack-notifications.md).

## Referências

- Pipeline completo: `.gos/docs/slack-notifications.md`
- CLI: `.gos/scripts/tools/slack-queue.js`
- Sanitização: `.gos/scripts/tools/text-sanitize.js`
- Payload builders: `.gos/scripts/tools/slack-notify.js`
