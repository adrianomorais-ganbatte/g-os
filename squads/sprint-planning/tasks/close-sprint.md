# Task: Close Sprint

## Objetivo
Fechar sprint, tratar tasks incompletas (spillover) e gerar retrospective.

## Steps

1. **Get final status**
   ```bash
   node scripts/tools/clickup.js sprint status --folder-id <FOLDER_ID>
   ```

2. **Identify incomplete tasks**
   Filtrar tasks com status != done/complete.

3. **Spillover decision**
   Perguntar ao usuario:
   - Mover tasks incompletas para proxima sprint?
   - Cancelar tasks incompletas?
   - Manter no folder atual?

4. **Execute spillover** (se aplicavel)
   Para cada task incompleta, mover para novo folder:
   ```bash
   node scripts/tools/clickup.js task update --task-id <ID> --status "to do"
   # Nota: mover entre lists requer API de task move (PUT /task/{id} com list)
   ```

5. **Tag sprint as closed**
   ```bash
   node scripts/tools/clickup.js tag add --task-id <FOLDER_FIRST_TASK> --tag "sprint-closed"
   ```

6. **Notify Slack**
   ```bash
   node scripts/tools/slack-notify.js send \
     --text "*:checkered_flag: Sprint <SPRINT_ID> encerrada!*\n>*Concluidas:* N/M (X%)\n>*Spillover:* N tasks para <NEXT_SPRINT>"
   ```

## Output
- Sprint encerrada
- Tasks spillover tratadas
- Retrospective summary no Slack
