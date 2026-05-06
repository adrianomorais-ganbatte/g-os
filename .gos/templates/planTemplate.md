---
id: PLAN-<NNN>-<slug>
tela: <nome da tela>
objetivo: <implantacao | correcao | refactor>
figma_url: <url ou null>
status: pendente
parent_plan: <PLAN-NNN ou null>
children_plans: []
stack_ref: docs/stack.md@<sha-curto>
arch_change: false
work_branch: <dev | feat/storybook>
created_at: <iso>
validated_at: null
---

# <Título da tela>

## Contexto

<Por que esta tela existe — referência ao PRD, ticket, decisão de produto.>

## Componentes mapeados

| Elemento | Componente do DS | Story (path) | Variant | Props | Comportamento |
|----------|------------------|--------------|---------|-------|---------------|
|          |                  |              |         |       |               |

> Coluna `Comportamento` é **obrigatória** quando o elemento é interativo (row clicável, botão, input, drawer/modal/popup trigger). Refinamentos cosméticos da página (bg, border, padding) NÃO entram aqui — vão para `## Page-level overrides`.

## Interações & Estados

> Cobre o `INTERACOES` do prompt. Cada bullet = um caminho do usuário (trigger → ação → resultado/estado). `validate-plan` cruza essa lista contra tasks com `interaction_target:` no frontmatter.

Fluxos por trigger:

1. <ex: Lista → Row click → Drawer abre `mode=view` com record.id → fechar (X ou backdrop) → volta lista>
2. <ex: Lista → "Novo X" → Drawer abre `mode=create` vazio → Salvar → POST /x → fecha + refetch + toast>
3. <ex: Toolbar → mudar filtro Período → debounce 300ms → refetch query>

Estados visuais por componente (skeleton / empty / error / loading):

- <ex: Tabela: skeleton 5 rows enquanto fetch; empty state com ilustração + CTA "Criar primeiro X">
- <ex: Drawer Salvar: estado loading com spinner + disabled durante POST>
- <ex: Toolbar refresh: ícone gira durante refetch>

## Page-level overrides

> Refinamentos do Figma da página que divergem da story canônica. **Política**: Figma da página vence a story em conflitos cosméticos (bg, border, padding, radius). Cada override é uma decisão (a/b/c).

| Componente | Override observado | Decisão | Ação |
|------------|--------------------|---------|------|
|            |                    |         |      |

Decisões possíveis:

- **(a) className na página** — override cosmético e isolado; mantém story padrão e aplica via classe na composição da página.
- **(b) Nova variant na story** — override aparece em ≥3 telas do projeto; vira variant reusável (ex.: `flat`, `seamless`).
- **(c) Exceção documentada** — override específico desta tela e não merece variant; documentado aqui sem propagar pra story.

## Drift map

> Gerado em Fase 1.5 do `plan-blueprint`. Side-by-side Figma vs Storybook por componente. Cada linha JÁ reconciliada para override (a/b/c) OU task explícita. Vazio = drift detection rodou sem divergências OU foi pulado por falta de tooling (Figma MCP + Storybook).

| Componente | Divergência | Resolução | Referência |
|------------|-------------|-----------|------------|
|            |             |           |            |

> Path dos artefatos: `drift/<Componente>.figma.png`, `drift/<Componente>.story.png`, `drift/<Componente>.diff.md`. Cumulativo em `drift-map.md`.

## Cleanup de starter legado

> Gerado em Fase 1.6. Listado quando `.gos-local/plan-paths.json` declara `legacy_starter_dirs`. Cada linha vira task `T-NN-cleanup-legacy-<slug>` com `cleanup_target: <path>` no frontmatter. Vazio = projeto sem starter legado declarado OU nenhum match encontrado.

| Path legado | Substituto DS | Task |
|-------------|---------------|------|
|             |               |      |

## Componentes ausentes

> Listar componentes não cobertos pelo DS. Cada um vira task de criação separada (priorizar reuso/extensão antes de propor novo).

- <ausente 1 — sugestão: estender X | criar novo>

## Aderência à Stack

> Sem redefinir arquitetura. Apenas referenciar o que já existe em `stack.md`.

- **Dados consumidos**: <endpoint Postman | tabela | regra-de-negocio> — path: <ref>
- **Padrão de fetching**: <server component | server action | client+cache>
- **Auth requerida**: <sim/não> — provider: <ref `stack.md`>
- **Restrições aplicáveis**: <listar do `stack.md`>

> Se `arch_change: true`: ADR de referência: `docs/adr/ADR-XXXX-<slug>.md`

## Fluxo de navegação

- Rota: `<src/app/.../page.tsx>`
- Entrada: <de onde vem>
- Saída: <para onde vai>

## Fluxo de dados

```
<diagrama textual: tela → fetch → componente → render>
```

## Plano de execução

1. **Estrutura de pastas/rotas** — criar `<path>`
2. **Fetching** — `<server-component em page.tsx | server-action>` consumindo `<endpoint/tabela>`
3. **Montagem da view** — compor `<componentes>`
4. **Estado e interatividade** — `<descrever>`

## Checklist de aceite

- [ ] Tela renderiza com dados reais
- [ ] Estados de loading e erro tratados
- [ ] Acessibilidade básica (keyboard nav, aria)
- [ ] Responsivo (mobile + desktop)
- [ ] Sem console errors/warnings
- [ ] TypeScript válido (`tsc --noEmit`)
- [ ] Reutilização ≥ X% de componentes do DS
- [ ] **Visual gate**: cada componente mapeado tem story em `dirs.stories/`
- [ ] **Visual gate**: anatomia, tokens e densidade batem com a story canônica (≤ 1 desvio menor documentado em `T-NNN-NN.notes.md`)
- [ ] **Visual gate**: árvore JSX da tela espelha hierarquia do Figma (mesmas seções, mesma ordem)
- [ ] **Comportamentos**: cada linha de "Interações & Estados" tem implementação testável (handler conectado, refetch disparando, estado visual renderizado)
- [ ] **Overrides**: cada linha de "Page-level overrides" foi resolvida pela decisão registrada (a/b/c)
- [ ] **Variants**: story canônica reflete novas variants criadas (decisões `b`)
- [ ] **States**: skeleton/empty/error/loading implementados conforme matriz acima
- [ ] **Refetch**: dispara após mutações (POST/PATCH/DELETE)
- [ ] **Seed**: popula TODOS os campos exibidos no Figma (sem `-` em colunas mapeadas)
- [ ] **Drift map**: cada linha de `## Drift map` (Fase 1.5) tem override implementado OU task `concluido` cobrindo
- [ ] **Cleanup legado**: tasks com `cleanup_target:` removeram os arquivos declarados (nenhum import de `legacy_starter_dirs` sobrevive na tela)
- [ ] **Schema/contrato gate**: nenhum campo da tela referencia coluna/endpoint inexistente sem entrada correspondente em `## Backend pendings`
- [ ] <critério específico da tela 1>
- [ ] <critério específico da tela 2>

## Backend pendings

> Gaps detectados confrontando Postman/regras-de-negocio com a necessidade da tela. Cada item vira task ClickUp atribuída ao Douglas (default) ou ao `ASSIGNEE` informado. Vazio = backend completo para esta tela.

> Coluna `Bloqueia tasks` lista os T-IDs frontend cujo frontmatter declara `depends_on_backend:` apontando para a `gap-key` desta linha (ex.: `migration-20260501150000`).

| gap-key | Gap | Endpoint/Coleção esperada | ClickUp ID | Status | Bloqueia tasks |
|---------|-----|---------------------------|------------|--------|----------------|
|         |     |                           |            |        |                |

## Mock strategy

> Opcional. Quando o frontend opta por mock enquanto o backend não atende, descreva aqui (ex.: fixture em `src/__mocks__/projetos.json`, MSW handler, etc.). Tasks que usam mock NÃO declaram `depends_on_backend:` — apenas referenciam esta seção.

## Knowledge mapped

> Inventário denso do que foi indexado no comprehension gate (regras-de-negocio + Postman).

- **Regras de negócio**: `<lista de arquivos relevantes em docs/regras-de-negocio/>`
- **Postman**: `<lista de coleções/endpoints relevantes em docs/postman/>`
- **Stack ref**: `<sha de stack.md>`

## Riscos & Rollback

- <risco>
- Rollback: <git tag/branch>
