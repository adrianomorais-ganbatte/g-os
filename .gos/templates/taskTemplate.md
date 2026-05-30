---
id: T-<NNN>-<NN>
plan_id: PLAN-<NNN>-<slug>
seq: <NN>
title: <verbo imperativo + objeto>
area: <ui-ux|frontend|fetching|state|tests|infra>
labels: [agent:<slug>, type:<feature|refactor|bug|chore>]
priority: <P0|P1|P2>
estimate: "<2h|4h|1d>"
status: pendente
valida_em: <referência ao critério no checklist do plano>
depends_on_backend: []   # opcional — gap-keys da tabela ## Backend pendings do plano pai
interaction_target: []   # opcional — bullets de "## Interações & Estados" do plano pai que esta task implementa/preserva (ex.: ["row-click-drawer-view", "submit-create"])
override_target: []      # opcional — linhas de "## Page-level overrides" do plano pai que esta task resolve (ex.: ["StatCard:flat-variant"])
cleanup_target: null     # opcional — path absoluto/relativo de arquivo legado que esta task remove (ex.: "src/figma-make/ProjetosPage.tsx"). validate-plan exige deleção observável no diff.
assignees: []
links: []
---

<!--
MODELO DE TASK: toda task DEVE responder às 4 perguntas, nesta ordem:
  POR QUE → ## Contexto
  O QUE   → ## Objetivo + ## Entrega
  ONDE    → ## Arquivos
  COMO    → ## Plano de execução
Nenhuma seção pode ficar com placeholder. Se não há resposta para uma das 4, a task não está pronta para execução.
-->

## Contexto (POR QUE)

<Por que esta task existe — referência direta ao plano pai e ao critério de aceite. Qual problema/gap motiva.>

## Objetivo (O QUE)

<Resultado esperado em 1-2 frases — o entregável concreto, observável.>

### Entrega

- <artefato 1 que esta task produz (componente, action, migration, story...)>
- <artefato 2>

## Arquivos (ONDE)

> Caminhos exatos. Marque a operação. Sem isso o executor adivinha — proibido.

| Operação | Path | Nota |
|----------|------|------|
| criar | `src/.../novo.tsx` | <o que é> |
| editar | `src/.../existente.ts:NN` | <o que muda> |
| deletar | `src/.../legado.tsx` | <só se `cleanup_target`> |

## Plano de execução (COMO)

- [ ] Passo 1
- [ ] Passo 2
- [ ] Passo 3

## Critérios de aceitação (DoD)

- [ ] Implementação atende `valida_em` do plano
- [ ] **Visual gate aprovado** (relatório em `T-NNN-NN.notes.md` com 5 seções: anatomia, tokens, variants, densidade, comportamentos)
- [ ] **Comportamentos**: cada `interaction_target` declarado tem handler/estado implementado e observável no diff
- [ ] **Overrides**: cada `override_target` declarado foi aplicado conforme decisão (a/b/c) registrada em `## Page-level overrides`
- [ ] **Cleanup**: quando `cleanup_target:` declarado, arquivo foi removido (`git diff --staged` mostra deleção)
- [ ] Tests/CI verdes
- [ ] Sem regressões
- [ ] <métrica específica>

## Riscos & Rollback

- <risco>
- Rollback: <comando>
