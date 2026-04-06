# Task: Create Sprint

## Objetivo
Criar sprint no ClickUp a partir de um plano validado.

## Pre-requisitos
- [ ] `CLICKUP_API_KEY` definido
- [ ] Space ID conhecido
- [ ] Sprint plan validado contra schema

## Steps

1. **Validate plan**
   ```bash
   # Verificar que JSON e valido
   node -e "JSON.parse(require('fs').readFileSync('sprint-plan.json','utf-8')); console.log('OK')"
   ```

2. **Create sprint folder + lists**
   ```bash
   node scripts/tools/clickup.js sprint create \
     --space-id <SPACE_ID> \
     --name "<SPRINT_NAME>" \
     --start <YYYY-MM-DD> \
     --end <YYYY-MM-DD> \
     --tracks backend,frontend \
     --id <SPRINT_ID>
   ```

3. **Save folder ID to registry**
   Atualizar `data/sprints/registry.json` com o folder_id e list_ids retornados.

4. **Notify Slack**
   ```bash
   node scripts/tools/slack-notify.js send \
     --text "*:rocket: Sprint <SPRINT_ID> criada!*\n>*Nome:* <SPRINT_NAME>\n>*Periodo:* <START> to <END>\n>*Tracks:* backend, frontend"
   ```

## Output
- folder_id, list_ids para handoff ao task-importer
- Registry atualizado
- Notificacao Slack enviada
