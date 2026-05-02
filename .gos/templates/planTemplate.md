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

| Elemento | Componente do DS | Story (path) | Variant | Props |
|----------|------------------|--------------|---------|-------|
|          |                  |              |         |       |

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
