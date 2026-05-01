---
id: PLAN-<NNN>-<slug>
tela: <nome da tela>
figma_url: <url ou null>
status: pendente
parent_plan: <PLAN-NNN ou null>
children_plans: []
stack_ref: docs/stack.md@<sha-curto>
arch_change: false
created_at: <iso>
validated_at: null
---

# <Título da tela>

## Contexto

<Por que esta tela existe — referência ao PRD, ticket, decisão de produto.>

## Componentes mapeados

| Elemento | Componente do DS | Variant | Props |
|----------|------------------|---------|-------|
|          |                  |         |       |

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
- [ ] <critério específico da tela 1>
- [ ] <critério específico da tela 2>

## Riscos & Rollback

- <risco>
- Rollback: <git tag/branch>
