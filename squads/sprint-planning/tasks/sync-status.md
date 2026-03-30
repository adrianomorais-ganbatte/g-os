# Task: Sync Status

## Objetivo
Consultar status da sprint no ClickUp e gerar report.

## Steps

1. **Get sprint status**
   ```bash
   node scripts/tools/clickup.js sprint status --folder-id <FOLDER_ID>
   ```

2. **Save status JSON**
   Salvar output em arquivo temporario para o Slack notifier.

3. **Notify Slack**
   ```bash
   node scripts/tools/slack-notify.js sprint-summary --file sprint-status.json
   ```

4. **Alert on blockers**
   Se `blocked > 0`, adicionar alerta:
   ```bash
   node scripts/tools/slack-notify.js send \
     --text ":warning: *<BLOCKED_COUNT> tasks bloqueadas na sprint <SPRINT_ID>!*"
   ```

## Output
- Sprint status JSON
- Slack summary enviado
- Alerta de blockers se necessario
