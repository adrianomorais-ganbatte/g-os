# Playbook — Auditoria visual streaming (audit-screenshots)

Guia de uso do fluxo de correção visual **plano-primeiro, task-por-insumo**. Confronta o app implementado
contra o Figma e gera UM plano de correção com tasks escritas na hora — cada divergência passa pelo gate
de reuso de componente (reuse / create / merge). Substitui o modelo antigo de fila (acumular prints →
materializar no `close`).

## Quando usar

- Você tem N telas com divergências visuais (cola prints, ou aponta rotas) e quer UM plano de fix.
- Quer auditar sistematicamente um tipo de tela contra o Figma (`validate`).
- NÃO use para planejar tela nova (use `*plan` / plan-blueprint) nem para executar (use `*execute-plan`).

## Pré-requisitos do workspace

1. `.gos-local/plan-paths.json` configurado (campo `figma_screen_map`; default `docs/figma-screen-map.md`).
2. `docs/figma-screen-map.md` — mapa canônico `Rota app ↔ node-id` (contrato tela↔Figma do projeto).
3. **Figma MCP** ativo (expected) e **Playwright** disponível (actual, captura do app vivo).
4. `progress.txt` na raiz (criado no primeiro `*plan`/`open`).

## Fluxo end-to-end

### 1. Abrir o plano (uma vez por auditoria)

```
*audit-screenshots open [SLUG]
```

Cria `docs/plans/PLAN-NNN-fix-<SLUG>/` com `plan.md` em **`status: aberto`** (draft) + `context.md` +
`tasks/` vazio + `audit-evidence/`. **Não** roda check-plan (o plano ainda é rascunho).

### 2. Adicionar insumos (quantos quiser, a qualquer momento)

```
# Cole o print + contexto, OU aponte a rota para o Playwright capturar:
*audit-screenshots add   "a aba negocios esta sem a coluna Area"   # + imagem colada
*audit-screenshots add   /dashboard/projetos/123?tab=negocios       # captura via Playwright
```

Cada insumo, NA HORA: resolve tela no mapa → captura actual (print ou Playwright) → pull Figma (MCP) →
confronta via `figma-print-diff` (single-pass, lenses 1-6) → **gate de reuso** por divergência estrutural
→ escreve `tasks/T-NN-*.md` (`status: pendente`) com evidência anexada. Sem fila, sem `close` no fim.

### 3. (Opcional) Sweep de validação por tipo de tela

```
*audit-screenshots validate listagem      # todas as telas tipo "listagem" no mapa
*audit-screenshots validate --all          # varre o mapa inteiro
```

Itera o `figma-screen-map.md`, captura Playwright + pull Figma, confronta e escreve tasks — mesmo fluxo do `add`.

### 4. Revisar e finalizar

```
*audit-screenshots list        # tasks escritas ate agora + decisoes de componente
*audit-screenshots finalize    # flip status: pendente -> roda check-plan.js -> pronto p/ execute-plan
```

`finalize` valida que cada task é self-contained, vira o plano para `status: pendente`, dispara
`ui-guardrails` e roda `check-plan.js` (gate determinístico). Exit 0 → o plano é input de `*execute-plan`.

```
*execute-plan PLAN-NNN-fix-<SLUG>
```

`*audit-screenshots discard` aborta o plano aberto a qualquer momento.

## Gate de reuso de componente (design-to-code)

Cada divergência em estrutura reusável (table, card, form, list…) NÃO vira patch one-off. O fluxo mapeia o
elemento → checa a biblioteca (`component-dedup`) → decide **reuse | create | merge** (ver
`libraries/component-reuse-gate.md`). A task grava `component_decision` + `component_target`.

**Exemplo (Fractus):** divergência numa tabela → a primitiva `DataTable` (TanStack) já existe →
decisão **reuse**. A correção é nas `columns`/dados daquela tela OU na própria primitiva (se o defeito é
compartilhado) — nunca um `<table>` novo. `negocios-table`, `funders-table` etc. = 1 primitiva, N usos.

## Por que mudou (vs modelo de fila)

| Antes (fila) | Agora (streaming) |
|--------------|-------------------|
| `add` acumula em `audit-session.json` | `open` cria plano draft; o diretório É o estado |
| Tasks só nascem no `close` (perda de contexto) | Task escrita NA HORA, por insumo, com evidência |
| Correção = patch da tela | Correção passa pelo gate de reuso (reuse/create/merge) |
| check-plan no `close` | check-plan só no `finalize` (plano `aberto` é estado válido) |
