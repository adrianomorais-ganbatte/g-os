# weekly-update — Changelog

## 2026-04-17 — v2.0 (Web API, thread obrigatória, auto-descoberta)

Mudanças estruturais motivadas por incidente em produção: o envio via incoming webhook caiu fora da thread "Conversa semanal" e gerou mensagem isolada no canal #cnpq-tech.

### Incidente

- **O quê:** weekly-update postou como mensagem nova no canal em vez de dentro da thread.
- **Causa raiz:** incoming webhook do Slack não suporta `thread_ts`. O skill (v1.x) tentava passar `--thread-ts` para `slack-notify.js send`, mas o script ignorava (webhook path).
- **Impacto:** poluição do canal + confusão visual; mensagem correta teve que ser reenviada e a errada deletada manualmente (API rejeitou `chat.delete` com `cant_delete_message` porque webhook é identidade separada mesmo dentro do mesmo app).

### Migração obrigatória: Web API (chat.postMessage)

- Weekly-update **não usa mais webhook**. Passa a usar `chat.postMessage` via Web API com bot token.
- Env vars novas (ambas obrigatórias):
  - `SLACK_BOT_TOKEN=xoxb-...` — Bot User OAuth Token.
  - `SLACK_CHANNEL_ID_WEEKLY=C0ADYLL6W0K` — ID do canal #cnpq-tech.
- Env var antiga `SLACK_WEBHOOK_CSPO_TECH` **não é mais usada pelo weekly-update** (continua viva para hooks de commit/task, sem impacto).

### Scopes necessários no bot (app Slack)

- `chat:write` — postar mensagens.
- `chat:write.public` — postar em canais públicos sem invite (opcional).
- `groups:history` — ler histórico de canais privados (necessário para auto-descoberta de thread).
- Após adicionar qualquer scope: **Reinstall to Ganbatte** no painel OAuth (sem reinstall o token não ganha o scope).
- Bot precisa ser convidado no canal privado: `/invite @autocommit` em `#cnpq-tech`.

### Thread obrigatória

- Skill cancela o envio se não conseguir resolver `thread_ts`. Nunca mais cai em "mensagem nova no canal".
- Ordem de resolução do `thread_ts` (Phase 5):
  1. Link do Slack em `$ARGUMENTS` → extrai ts.
  2. **Auto-descoberta** via `slack-notify.js find-thread` (novo) — busca mensagem mais recente que bata com o regex.
  3. Fallback: `AskUserQuestion` pedindo o link.

### Auto-descoberta de thread

Novo comando no CLI:

```bash
node .gos/scripts/tools/slack-notify.js find-thread \
  --channel-id "$SLACK_CHANNEL_ID_WEEKLY" \
  --pattern "CHECK-POINT ASSÍNCRONO|Conversa semanal"
```

Retorno:
```json
{ "found": true, "ts": "1776445206.005489", "text_preview": "..." }
```

Resolve o `thread_ts` da última mensagem que bate com o pattern — dispensa cole manual de link a cada semana.

### Anti-sobreposição entre updates (Phase 1)

Dois mecanismos cumulativos:

1. **Arquivo de estado** `.gos/.weekly-update-last-run.json` — armazena `last_run_date` (YYYY-MM-DD). Skill usa como piso do filtro ClickUp (`date_done_from`). Gravado apenas após `sent: true`.
2. **Arquivo do update anterior** `.gos/weekly-updates/YYYY-MM-DD.md` — texto íntegro do último envio. Skill lê o mais recente em Phase 1 e cruza contra o draft em Phase 2/4, descartando menções duplicadas (cobre casos em que uma task foi reportada proativamente e só fechou no ClickUp na janela seguinte).

### Janela de busca default

- Era 10 dias. Agora 7 (fallback quando não há `last_run_date`). Alinha com cadência semanal.

### Template — quebra visual entre título e corpo

- Todas as seções (`*O que foi feito*`, `*Desafios encontrados*`, etc.) agora têm linha em branco entre título e primeiro parágrafo. Slack renderia colado antes.

### Novos comandos no `slack-notify.js`

| Comando | Uso | Scope necessário |
|---|---|---|
| `send --channel-id C... --thread-ts TS` | Post via Web API em thread | `chat:write` |
| `delete --channel-id C... --ts TS` | Apagar mensagem do próprio bot | `chat:write` (do app autor) |
| `find-thread --channel-id C... --pattern REGEX` | Achar ts mais recente que bata com regex | `groups:history` (privado) |

### Limitações conhecidas

- `chat.delete` só funciona para mensagens postadas pelo **mesmo token**. Webhook conta como identidade separada — mensagens antigas postadas via webhook não podem ser deletadas via API mesmo que o app seja o mesmo. Delete manual no Slack UI é o único caminho nesse caso.

### Coexistência com hooks de commit

- Hooks pós-commit (`task-done`, `task-update`, `sprint-summary`) continuam em `SLACK_WEBHOOK_URL` via `sendWebhook`. Zero impacto.
- Weekly-update é o único fluxo que migrou para Web API.
