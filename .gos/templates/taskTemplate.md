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
assignees: []
links: []
---

## Contexto

<Por que esta task existe — referência direta ao plano pai e ao critério de aceite.>

## Objetivo

<Resultado esperado em 1-2 frases.>

## Plano de execução

- [ ] Passo 1
- [ ] Passo 2
- [ ] Passo 3

## Critérios de aceitação (DoD)

- [ ] Implementação atende `valida_em` do plano
- [ ] **Visual gate aprovado** (relatório em `T-NNN-NN.notes.md` com 4 seções: anatomia, tokens, variants, densidade)
- [ ] Tests/CI verdes
- [ ] Sem regressões
- [ ] <métrica específica>

## Riscos & Rollback

- <risco>
- Rollback: <comando>
