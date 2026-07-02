# Documentation Sync Policy (G-OS)

Regra dura: **regra de negócio nunca muda sozinha — a documentação complementar muda junto, no mesmo PR.**

## Princípio

SEMPRE que uma regra de negócio for criada, alterada, removida ou evoluída, atualize imediatamente as documentações complementares relacionadas.

Antes de concluir qualquer implementação, correção ou ajuste funcional, verifique se há documentação impactada, incluindo:

- regras de negócio (`docs/regras-de-negocio/`)
- fluxos operacionais
- decisões técnicas (ADRs)
- permissões / RBAC / RLS
- auditorias
- seeds
- processos
- guias de uso (técnicos e não técnicos carregados no sistema)
- contratos de API (Postman / OpenAPI)

Havendo impacto documental, atualize os arquivos correspondentes para manter **produto, código e documentação sincronizados**.

## Como o pipeline aplica (não é daemon)

1. **Plano**: `plan-blueprint` preenche `## Impacto documental` no `plan.md` (e no `spec.md`) — lista das docs que a entrega afeta.
2. **Execução**: `execute-plan`, antes de marcar uma task `validacao`, confere se a task tocou regra de negócio; se sim, a atualização da doc impactada é parte dos critérios de aceite da task.
3. **Validação**: `validate-plan` **bloqueia o fechamento** do plano se houver item em `## Impacto documental` não resolvido (doc listada mas não tocada no diff).

## Heurística de detecção

Uma mudança impacta documentação quando toca: RLS/policy, roles/permissões, schema/migration, seed, endpoint/contrato, fluxo de estado, ou qualquer arquivo sob `docs/regras-de-negocio/` ou `docs/postman/`. Nesses casos, a doc correspondente entra em `## Impacto documental` e precisa ser atualizada antes do `concluido`.
