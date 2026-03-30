---
name: clickup
description: >
  Manage ClickUp workspace, sprints (via folders), lists, tasks, subtasks and custom fields
  via CLI. Create and sync sprints, import tasks from markdown plans, track sprint status.
description_pt-BR: >
  Gerenciar workspace, sprints (via folders), lists, tasks, subtasks e custom fields no
  ClickUp via CLI. Criar e sincronizar sprints, importar tasks de planos markdown, acompanhar status.
argument-hint: "[subcommand args, e.g. 'sprint create --space-id abc --name S01']"
type: prompt
version: "1.0.0"
env:
  - CLICKUP_API_KEY
categories: [project-management, tasks, sprint, agile, clickup]
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
use-when:
  - criar sprint no ClickUp a partir de plano ou markdown
  - sincronizar stories/tasks locais com ClickUp
  - consultar status de sprint ou tasks no ClickUp
  - importar tasks de sprint-track markdown para ClickUp
  - listar workspaces, spaces, folders, lists
  - marcar task como concluida no ClickUp
  - criar subtasks ou setar custom fields
do-not-use-for:
  - planejamento de sprint do zero (use /sprint-planner primeiro)
  - criacao de stories sem plano aprovado (use @sm ou @po)
  - hotfix ou ajuste pontual sem necessidade de sync
  - gantt charts ou burndown (nao disponivel via API)
metadata:
  category: integration
  version: 1.0.0
---

# clickup

Voce esta executando a skill `clickup`.

## Prerequisites

1. Verificar se `CLICKUP_API_KEY` esta definido:
   ```bash
   echo $CLICKUP_API_KEY | head -c 5
   ```
   Se nao estiver definido, instrua o usuario a criar em: ClickUp > Settings > Apps > API Token

2. Verificar se a tool existe:
   ```bash
   node scripts/tools/clickup.js 2>&1 | head -5
   ```

## Task

$ARGUMENTS

Se nenhum argumento foi fornecido, pergunte ao usuario o que deseja fazer.

## Discovery Workflow (Primeiro Uso)

Se o usuario nao sabe os IDs do workspace/space:

```bash
# 1. Listar workspaces
node scripts/tools/clickup.js workspace list

# 2. Listar spaces no workspace
node scripts/tools/clickup.js space list --team-id <TEAM_ID>

# 3. Listar folders no space
node scripts/tools/clickup.js folder list --space-id <SPACE_ID>
```

Salve os IDs descobertos para uso futuro.

## Sprint Creation

Sprints sao modelados como Folders no ClickUp (a API nao tem Sprint endpoints):

```bash
node scripts/tools/clickup.js sprint create \
  --space-id <SPACE_ID> \
  --name "Fase 1 Base" \
  --start 2026-03-27 \
  --end 2026-04-03 \
  --tracks backend,frontend \
  --id S01
```

Isso cria:
- 1 Folder: `Sprint S01 — Fase 1 Base (2026-03-27 to 2026-04-03)`
- N Lists: `1-Backend`, `2-Frontend`

## Task Import (Bulk)

Importe tasks de um JSON que segue o schema `data/schemas/sprint-clickup.schema.json`:

```bash
node scripts/tools/clickup.js sprint import \
  --folder-id <FOLDER_ID> \
  --file sprint-plan.json \
  --team-id <TEAM_ID> \
  --sprint-id S01
```

O JSON deve ter array `tasks` com: `id`, `title`, `area` (backend/frontend), `priority`, `description`, `assignee`, `acceptanceCriteria`, `businessRules`, `files`.

**Recursos automaticos do import:**
- **Assignees:** campo `assignee` (nome/email) resolvido automaticamente via `--team-id`
- **Checklists:** campo `acceptanceCriteria[]` cria checklist "Acceptance Criteria" com items
- **Registry:** mapeamento T-NNN → ClickUp ID salvo em `data/sprints/registry.json`
- **Tags:** task ID + `track:{area}` adicionados automaticamente

## Workspace Members

```bash
node scripts/tools/clickup.js workspace members --team-id <TEAM_ID>
```

Retorna: membros com id, username, email, role. Necessario para resolver assignees no import.

## Task Operations

```bash
# Criar task (com assignees)
node scripts/tools/clickup.js task create --list-id <ID> --name "API CRUD" --priority 2 --assignees 72837840

# Atualizar status e assignees
node scripts/tools/clickup.js task update --task-id <ID> --status "in progress" --assignees 72837840

# Criar subtask
node scripts/tools/clickup.js subtask create --list-id <ID> --parent <TASK_ID> --name "Zod schema" --assignees 72837840

# Setar custom field
node scripts/tools/clickup.js field set --task-id <ID> --field-id <FIELD_ID> --value "BR-001"
```

## Checklists

```bash
# Criar checklist numa task
node scripts/tools/clickup.js checklist create --task-id <ID> --name "DoD"

# Adicionar item
node scripts/tools/clickup.js checklist add-item --checklist-id <CL_ID> --name "Testes passando"

# Listar checklists de uma task
node scripts/tools/clickup.js checklist list --task-id <ID>
```

## Sprint Status

```bash
# Resumo rapido
node scripts/tools/clickup.js sprint status --folder-id <FOLDER_ID>

# Detalhado com filtro por assignee
node scripts/tools/clickup.js sprint get --folder-id <FOLDER_ID> --assignee douglas
```

Retorna: total tasks, done, in-progress, blocked, completion %, por-track e por-assignee.

## Custom Field Mapping (a8z -> ClickUp)

| Campo a8z | ClickUp Custom Field | Tipo |
|-----------|---------------------|------|
| ref (M/F/B) | a8z_ref | Short Text |
| points | sprint_points | Number |
| businessRules | business_rules | Text |
| area | track | Drop Down |
| dependencies | depends_on | Text |
| acceptanceCriteria | acceptance_criteria | Text |

## Error Handling

- **Rate limit (429):** Tool retenta automaticamente com backoff
- **Auth error (401):** Verificar CLICKUP_API_KEY
- **Not found (404):** Verificar IDs de space/folder/list/task
- **`--dry-run`:** Sempre disponivel para testar sem executar
