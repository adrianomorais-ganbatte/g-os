# Code Quality Squad

Squad de qualidade de código em **nível de desenvolvimento**: segurança, performance e anti-over-engineering. Não é org-health/DORA — é review de código.

## Escopo

- Segurança: vulnerabilidades conhecidas (React/Next/TS/Node/Deno/Supabase RLS+edge/Cloudflare D1/Workers) — `security-review`.
- Performance: cache, filas, background, cron, N+1, views/materialized, paginação, over-fetch — `perf-review`.
- Anti-over-engineering: o que deletar, ladder YAGNI→reuso→stdlib→native→dep→1 linha — `simplify-review`.

## Quando roda

- **Fechamento de plano**: `validate-plan` delega `security-review` + `perf-review` antes de concluir (CRITICAL/HIGH bloqueiam).
- **Sob demanda**: `*security-review`, `*perf-review`, `*simplify-review`.

## Catálogos

- `libraries/security-audit-playbook.md`
- `libraries/performance-audit-playbook.md`
- `libraries/lazy-dev-policy.md`
