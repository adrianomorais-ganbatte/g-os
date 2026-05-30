# Component Reuse Gate

> Disciplina design-to-code aplicada a CADA divergência detectada por `audit-screenshots` (e por
> `plan-blueprint` Fase 1.3). Antes de virar task de correção, toda divergência que toca uma estrutura
> reusável passa por: **mapear → checar biblioteca → decidir reuse | create | merge**. O objetivo é
> nunca corrigir com patch one-off quando a correção certa é uma primitiva compartilhada.

## Por que

Corrigir uma tela "na mão" (className solta, JSX duplicado) resolve a tela e multiplica dívida: a próxima
tela com a mesma table/card/form repete o bug. A correção correta promove (ou reusa) uma primitiva — o
delta entre telas vira só **dados**, não estrutura.

## Heurística de decisão (score vs biblioteca)

Para cada divergência cujo alvo é uma estrutura reusável (table, card, form, list, modal, toolbar):

1. **Mapear** o elemento → nome de componente candidato (estilo `plan-blueprint` Fase 1.3: indexar
   `dirs.components/` + `.stories.tsx`).
2. **Rodar `component-dedup`** (ou o equivalente inline: grep nome + comparar props/estrutura/variantes).
3. **Decidir** pelo score:

| Score vs existente | Decisão | `component_decision` | Ação na task |
|--------------------|---------|----------------------|--------------|
| 71–100% (essencialmente o mesmo) | **REUSE** | `reuse` | `component_target` = primitiva existente; muda só dados/props |
| 31–70% (overlap parcial) | **MERGE** | `merge` | combinar features → estender a primitiva (nova variant/prop) |
| 0–30% (não existe equivalente) | **CREATE** | `create` | criar primitiva nova no DS; task de criação antes do uso |

A decisão grava no frontmatter da task (`component_decision`, `component_target`). REUSE/MERGE referenciam
o path da primitiva; CREATE gera task de criação que precede a task de uso (`depends_on`).

## Padrão de referência: DataTable + TanStack (Fractus)

Caso canônico de **REUSE**. No Fractus, `src/components/ui/data-table.tsx` é a primitiva única:

```tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  emptyMessage?: string
  tableRef?: React.MutableRefObject<Table<TData> | null>
}
```

Cada tela define só `columns` + `data` e compõe a primitiva:

```tsx
// negocios-table.tsx — NÃO reimplementa <table>, reusa DataTable
const columns = getNegociosColumns(projectId, canDelete, onDelete, deletingId)
return <DataTable columns={columns} data={negocios} loading={loading} emptyMessage="Nenhum negócio encontrado" />
```

`negocios-table`, `funders-table`, `impacto-tab-content` — **uma primitiva, N usos**. O que muda entre
telas: **as colunas (header + cell render) e os dados das rows**. Nada de estrutura de tabela duplicada.

**Regra prática para o audit:** divergência em qualquer tabela →
- existe `DataTable` (ou equivalente) no DS? → **REUSE**: a correção é nas `columns` daquela tela OU na
  primitiva (se o defeito é compartilhado). Nunca um `<table>` novo na página.
- o defeito é da primitiva (afeta todas as telas)? → corrigir na primitiva (1 task, `component_target` = `data-table.tsx`).
- precisa de comportamento que a primitiva não suporta? → **MERGE** (nova prop/variant na primitiva).

O mesmo raciocínio vale para Card, Form, Toolbar, EmptyState etc.: se a estrutura se repete ou pode se
repetir, ela é primitiva; a tela só injeta dados.

## Saída na task

```yaml
component_decision: reuse        # reuse | create | merge
component_target: src/components/ui/data-table.tsx
override_target: NegociosTable:area-column   # quando a correção é cosmética de uso
```

A task descreve a correção em termos de **dados/props da primitiva** (REUSE), **extensão da primitiva**
(MERGE) ou **nova primitiva + adoção** (CREATE) — seguindo o modelo O QUE / ONDE / COMO / POR QUE.
