---
name: clickup
description: >
  Manage ClickUp workspace, sprints (via folders), lists, tasks, subtasks and custom fields
  via MCP. Create and sync sprints, import tasks from markdown plans, track sprint status.
description_pt-BR: >
  Gerenciar workspace, sprints (via folders), lists, tasks, subtasks e custom fields no
  ClickUp via MCP. Criar e sincronizar sprints, importar tasks de planos markdown, acompanhar status.
argument-hint: "[e.g. 'criar sprint S04 com tasks do plano']"
type: prompt
version: "2.0.0"
env:
  - CLICKUP_TRANSPORT
categories: [project-management, tasks, sprint, agile, clickup]
allowedTools: [Read, Glob, Grep, Write, Edit, AskUserQuestion, mcp__clickup__*]
use-when:
  - criar sprint no ClickUp a partir de plano ou markdown
  - sincronizar stories/tasks locais com ClickUp
  - consultar status de sprint ou tasks no ClickUp
  - importar tasks de sprint-track markdown para ClickUp
  - listar workspaces, spaces, folders, lists
  - marcar task como concluida no ClickUp
  - criar subtasks
do-not-use-for:
  - planejamento de sprint do zero (use /sprint-planner primeiro)
  - criacao de stories sem plano aprovado (use @sm ou @po)
  - hotfix ou ajuste pontual sem necessidade de sync
  - gantt charts ou burndown (nao disponivel via API)
metadata:
  category: integration
  version: 2.0.0
---

# clickup

Voce esta executando a skill `clickup`. Transport: **MCP only**.

## Task

$ARGUMENTS

Se nenhum argumento foi fornecido, pergunte ao usuario o que deseja fazer.

## MCP Tools

Todas as operacoes usam tools `mcp__clickup__*` (OAuth via MCP server).

### Discovery

- Listar hierarchy: `clickup_get_workspace_hierarchy`
- Buscar tasks: `clickup_search` com keywords
- Filtrar tasks: `clickup_filter_tasks` com list_ids, assignees, statuses
- Resolver assignees: `clickup_resolve_assignees` (nome/email -> user ID)

### Sprint (Folder + List)

Sprints sao modelados como Folders no ClickUp:

1. Criar folder: `clickup_create_folder` com `space_id` e nome
2. Criar list: `clickup_create_list_in_folder` com `folder_id`

Convencao de nomes:
- Folder: `S04 -- Fractus: Fase 2a Coleta Templates`
- List: `Backlog`

### Task Operations

- **Criar:** `clickup_create_task` com `list_id`, `name`, `markdown_description`, `priority`, `assignees`, `start_date`, `due_date`
- **Atualizar:** `clickup_update_task` com `task_id` + campos a alterar
- **Subtask:** `clickup_create_task` com `parent` (task ID pai)
- **Tags:** `clickup_add_tag_to_task`
- **Dependencias:** `clickup_add_task_dependency`, `clickup_add_task_link`
- **Comentarios:** `clickup_create_task_comment`
- **Mover:** `clickup_move_task`

### Capabilities adicionais

- Time tracking: `clickup_start_time_tracking`, `clickup_stop_time_tracking`, `clickup_add_time_entry`
- Docs: `clickup_create_document`, `clickup_create_document_page`, `clickup_update_document_page`
- Chat: `clickup_send_chat_message`, `clickup_get_chat_channels`

### Limitacoes do MCP

O MCP nao suporta:
- Checklist nativa (criar/editar)
- Delete de folder
- Delete de task
- Create de tag (tag precisa existir no space)

## Regras de Formatacao

Ao criar ou atualizar tasks no ClickUp via MCP, seguir:

### Descricao

1. **Idioma:** Secoes em portugues com acentos
2. **Sem emojis:** Nunca usar emojis/icones nos headers ou corpo
3. **Headers H3:** Usar `###` para secoes (nao H1 ou H2)
4. **Descricao primeiro:** Texto livre no topo, sem header proprio
5. **Separador:** `---` entre descricao e secoes estruturadas
6. **Formatacao inline:**
   - Arquivos em backticks: `` `lib/prisma.ts` ``
   - Business rules em backticks separados por ` . `: `` `BR-TPL-001` . `BR-TPL-002` ``
   - Criterios de aceite como checkboxes: `- [ ] Descricao do criterio`
7. **Ordem das secoes:** Regras de Negocio -> Arquivos -> Criterios de Aceite
8. **Usar `markdown_description`** (nao `description`) ao chamar `update_task` ou `create_task`

### Subtasks -- quando usar

| Recurso | Quando usar | Exemplo |
|---------|------------|---------|
| **Subtask** | Trabalho decomponivel com status e assignee proprios | Cada endpoint de uma API CRUD, cada step de um wizard |
| **Criterios na descricao** | Itens verificaveis sem workflow proprio | `- [ ] Testes passando`, `- [ ] Migration sem erros` |

### Template de referencia

```markdown
Texto livre da descricao aqui.

---

### Regras de Negocio
`BR-TPL-001` . `BR-TPL-002`

### Arquivos
- `app/api/route.ts`
- `lib/prisma.ts`

### Criterios de Aceite
- [ ] Primeiro criterio
- [ ] Segundo criterio
```

## Pre-processamento de Texto

O script `scripts/tools/clickup-preprocess.js` pode ser usado para sanitizar textos antes de enviar ao MCP:

```bash
echo '{"description":"texto","acceptanceCriteria":["item1"]}' | node scripts/tools/clickup-preprocess.js --json
```

Output inclui `description` formatado com todas as secoes. Usar o campo `description` do output como `markdown_description` no MCP.

No modo MCP direto (sem script), aplicar as mesmas regras manualmente.

## Error Handling

- **Rate limit (429):** MCP retenta automaticamente
- **Auth error:** Chamar `clickup_authenticate` para iniciar OAuth
- **Not found (404):** Verificar IDs de space/folder/list/task
- **Team not authorized:** Re-autenticar via `clickup_authenticate`
