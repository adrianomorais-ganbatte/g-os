---
id: SPEC-<NNN>-<slug>
plan_id: PLAN-<NNN>-<slug>
tela: <nome da tela>
stack_ref: docs/stack.md@<sha-curto>
created_at: <iso>
---

# Spec — <Título da tela>

> **Spec completa de desenvolvimento**. Deriva de `plan.md` + `context.md` + tasks e é o contrato que o **Junior executa** e o **Senior audita**. Responde O QUE / ONDE / COMO / POR QUE e fecha com critérios de aceite verificáveis. Sem placeholders: seção sem resposta = spec incompleta.

## POR QUE (motivação)

<Problema/necessidade que a entrega resolve. Referência a PRD/ticket/decisão de produto. O que muda quando isto existir.>

## O QUE (escopo)

<Descrição precisa do entregável: telas, componentes, comportamentos, dados. O que está DENTRO e o que está FORA do escopo (lista explícita de out-of-scope).>

**Fora de escopo:**
- <item que parece relacionado mas NÃO deve ser tocado>

## Contrato backend / frontend

> Item 9: decidir se o backend pronto atende ANTES de detalhar o frontend.

- **Backend existente atende?** <sim | não | parcial>
  - **Se sim**: o que usar (endpoint/coleção Postman | tabela | regra-de-negócio), por quê, onde e como consumir.
  - **Se não/parcial**: gaps listados em `plan.md` `## Backend pendings`. Gap grande → plano-irmão `PLAN-NNN-backend-<slug>` executado ANTES do frontend dependente (backend-first).
- **Padrão de fetching**: <server component | server action | client + cache>
- **Auth/authz requerida**: <sim/não> — provider e regras (RLS/policy) de `docs/stack.md`.

## ONDE (arquivos e rotas)

> Referência a `context.md` `## Arquivos relevantes`. Caminhos concretos.

- Rota: `<src/app/.../page.tsx>`
- Arquivos-chave: `<lista com função de cada um>`

## COMO (abordagem técnica)

<Passo a passo da implementação em nível de spec: estrutura de pastas/rotas, fetching, composição de componentes, estado e interatividade, estados visuais (skeleton/empty/error/loading). Referência ao `## Plano de execução` do plano.>

## Segurança e performance (checagens obrigatórias)

> Auditadas por `security-review` / `perf-review` no fechamento.

- **Segurança**: <RLS/policy aplicável, authz de endpoint/edge, validação Zod no boundary, sem secret no client>.
- **Performance**: <cache estratégico, paginação por filtro/search, evitar N+1/over-fetch, trabalho não-realtime em fila/cron>.

## Impacto documental

> Item 2. Docs que MUDAM com esta entrega (regras de negócio, fluxos, permissões, seeds, ADR, guias). Atualizar no mesmo PR.

- <doc impactada 1 — o que atualizar>

## Critérios de aceite (globais)

> Verificáveis (comando + resultado esperado). Cada task herda os que lhe cabem em `## Critérios de aceite (DoD)`. Se um critério falhar: loop de correção até passar (execute) / correção do Senior (validate). Anti-falso-positivo: re-verificar, nunca auto-declarar.

- [ ] <critério 1 — comando + resultado esperado>
- [ ] <critério 2>
- [ ] `tsc --noEmit` exit 0
- [ ] Estados loading/empty/error/success implementados
- [ ] Segurança: sem findings críticos em `security-review`
- [ ] Performance: sem findings críticos em `perf-review`
- [ ] Documentação impactada atualizada (seção acima)
