# Task: Import Tasks

## Objetivo
Importar tasks de um sprint plan JSON para o ClickUp em batch.

## Pre-requisitos
- [ ] Sprint criada (folder_id e list_ids disponiveis)
- [ ] Sprint plan JSON segue schema `data/schemas/sprint-clickup.schema.json`
- [ ] `CLICKUP_API_KEY` definido

## Steps

1. **Import tasks**
   ```bash
   node scripts/tools/clickup.js sprint import \
     --folder-id <FOLDER_ID> \
     --file sprint-plan.json
   ```

2. **Process results**
   - Verificar `imported` vs `failed` counts
   - Se `failed > 0`, investigar errors no output

3. **Update registry**
   Atualizar `data/sprints/registry.json` com mapping:
   ```json
   { "taskMap": { "T-001": "clickup_id_1", "T-002": "clickup_id_2" } }
   ```

4. **Notify Slack**
   ```bash
   node scripts/tools/slack-notify.js send \
     --text "*:package: Tasks importadas!*\n>*Sprint:* <SPRINT_ID>\n>*Importadas:* N tasks\n>*Falhas:* N"
   ```

## Output
- Task map (local ID -> ClickUp ID)
- Registry atualizado
- Slack notificado
