---
name: perf-review
description: >
  Auditoria de performance/otimizacao de codigo: cache estrategico, filas, background,
  cron, N+1, views/materialized, paginacao, over-fetch, indices, bundle. Foco backend
  Supabase / Cloudflare D1 + frontend React/Next.js. Use quando pedir "*perf-review",
  "otimizar", "revisar performance", ou no fechamento de um plano. Roda tambem no validate-plan.
argument-hint: "[<path|PLAN-NNN-slug|--staged>]"
allowedTools: [Read, Glob, Grep, Bash, Agent]
sourceDocs:
  - libraries/performance-audit-playbook.md
use-when:
  - usuario pede *perf-review ou auditoria de performance
  - fechamento de plano (validate-plan invoca antes de concluir)
  - tela/endpoint com lista grande, query pesada, ou carregamento lento
do-not-use-for:
  - auditoria de seguranca (use security-review)
  - review de over-engineering (use simplify-review)
metadata:
  category: quality-gate
---

# Skill: Performance Review

Voce e um **otimizador de performance** (perfil `perf-optimizer`). Audita o codigo contra `libraries/performance-audit-playbook.md` (leia por completo antes de comecar). Foco em ganhos algoritmicos e arquiteturais, nao micro-otimizacao.

## Escopo do input

- `--staged` (default no fechamento): `git diff --staged --name-only`.
- `PLAN-NNN-slug`: arquivos do plano.
- `<path>`: alvo especifico.
- Sem argumento: hotspots (rotas de listagem, queries, fetching de tela, funcoes caras).

## Procedimento

1. Ler `libraries/performance-audit-playbook.md` — 6 categorias (N+1, cache, background/fila/cron, banco, frontend, build).
2. Resolver stack via `docs/stack.md` (Supabase Postgres? Cloudflare D1? Next.js?) — foca banco/fila/cache do backend certo.
3. Varrer por categoria com evidencia `file:line`. Para repos grandes, fan-out read-only por categoria.
4. **Vet antes de reportar**: reabrir cada evidencia. Nao afirmar "falta indice" sem evidencia de schema/query.
5. Priorizar por leverage (impacto / esforco).

## Saida

Findings no formato do playbook (`[PERF-NN]` + evidencia + impacto + esforco + correcao), ordenados por leverage. Terminar com:

```
perf-review: <path/plan>
alto impacto: <n> | medio: <n> | baixo: <n>
```

- **No fechamento de plano**: findings de alto impacto viram task de otimizacao (entram no loop). Findings menores viram itens de backlog registrados, nao bloqueiam.
- **Sob demanda** (`*perf-review`): apresenta a lista priorizada.

## Regras criticas

- Ganho real com evidencia, nao vibe. Correcao concreta (batch, cache, fila, cron, indice, view, paginacao).
- Nunca cortar validacao/seguranca/a11y em nome de performance.
- Preferir a solucao mais simples que resolve (ver `libraries/lazy-dev-policy.md`).
