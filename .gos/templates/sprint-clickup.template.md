# Sprint {{SPRINT_ID}} — {{SPRINT_NAME}}

## Metadata

| Campo | Valor |
|-------|-------|
| **Sprint** | {{SPRINT_ID}} |
| **Nome** | {{SPRINT_NAME}} |
| **Início** | {{START_DATE}} |
| **Fim** | {{END_DATE}} |
| **Duração** | {{DURATION_DAYS}} dias |
| **Team** | {{TEAM}} |
| **ClickUp Folder ID** | {{CLICKUP_FOLDER_ID}} |
| **ClickUp Space ID** | {{CLICKUP_SPACE_ID}} |
| **Status** | {{STATUS}} |

---

## Track: Backend

**ClickUp List ID:** {{BACKEND_LIST_ID}}

| ID | Ref | Título | Escopo resumido | Points | Status | ClickUp ID |
|----|-----|--------|-----------------|--------|--------|-------------|
| T-001 | B-001 | | | 3 | todo | |
| T-002 | B-002 | | | 5 | todo | |

---

## Track: Frontend

**ClickUp List ID:** {{FRONTEND_LIST_ID}}

| ID | Ref | Título | Escopo resumido | Points | Status | ClickUp ID |
|----|-----|--------|-----------------|--------|--------|-------------|
| T-020 | F-001 | | | 3 | todo | |
| T-021 | F-002 | | | 5 | todo | |

---

## Business Rules

| ID | Descrição |
|----|-----------|
| BR-001 | |

---

## Dependências (Cross-Track)

| FE Task | Depende de BE Task | Sprint FE | Sprint BE | Buffer |
|---------|-------------------|-----------|-----------|--------|
| T-020 | T-001 | Mesmo sprint | Mesmo sprint | 0 |

---

## Acceptance Criteria do Sprint

- [ ] Todos endpoints backend retornam dados conforme Zod schema
- [ ] Todos componentes frontend renderizam com dados reais
- [ ] Testes E2E passam para fluxos críticos
- [ ] Coverage > 80% em módulos novos

---

## API Contracts

```
GET  /api/{{MODULE}}         -> { items: [], total: number }
POST /api/{{MODULE}}         -> { id: string } | 400/422
PUT  /api/{{MODULE}}/[id]    -> { updated: true } | 404
```

---

## Notas

- Gerado via `node scripts/tools/clickup.js sprint create`
- Template base: `templates/sprint-clickup.template.md`
- Schema: `data/schemas/sprint-clickup.schema.json`
