# Fractus — Documentacao Tecnica

Documentacao oficial do projeto Fractus. Base versionada, rastreavel e organizada.

> **Referencia principal:** O [PRD Resumo](prd/prd-resumo.md) e a fonte mais atualizada sobre visao de produto (atualizado em 02/04/2026).

## Estrutura

```
docs/
├── adr/          # Architecture Decision Records
├── prd/          # Product Requirements Documents + Regras de Negocio
├── plans/        # Planos de execucao por fase
├── sprints/      # Sprint tracks (macro + micro + tracks por papel)
├── guides/       # Guias operacionais para o dev
└── README.md     # Este arquivo
```

## ADRs (Architecture Decision Records)

Cada ADR documenta uma decisao arquitetural significativa, o contexto, alternativas consideradas e consequencias.

> **Nota:** Os ADRs foram escritos antes da atualizacao do PRD de 02/04/2026 que renomeia entidades (Programas->Projetos, Patrocinadores->Investidores, Formularios->Pesquisas) e introduz Negocios como entidade primaria. As decisoes tecnicas continuam validas, mas a nomenclatura pode estar desatualizada.

| ADR | Titulo | Status |
|-----|--------|--------|
| [ADR-001](adr/001-nextjs-app-router.md) | Next.js App Router como framework fullstack | Aceita |
| [ADR-002](adr/002-supabase-client-sdk.md) | Supabase Client SDK ao inves de Prisma ORM | Aceita |
| [ADR-003](adr/003-single-tenant-rls.md) | Single-tenant com isolamento via RLS | Aceita |
| [ADR-004](adr/004-shadcn-design-system.md) | shadcn/ui + Radix UI como sistema de componentes | Aceita |
| [ADR-005](adr/005-mulish-font.md) | Mulish como font family do Design System | Aceita |
| [ADR-006](adr/006-build-order.md) | Priorizacao Backend -> Components -> Frontend | Aceita |
| [ADR-007](adr/007-zod-shared-validation.md) | Zod como validacao compartilhada FE/BE | Aceita |
| [ADR-008](adr/008-magic-link-auth.md) | Magic link para autenticacao de participantes | Aceita |
| [ADR-009](adr/009-tags-flexiveis.md) | Tags flexiveis ao inves de entidade Turma | Aceita |
| [ADR-010](adr/010-storybook-first.md) | Storybook-first para componentes customizados | Aceita |

## PRD

| Doc | Descricao |
|-----|-----------|
| [PRD Resumo](prd/prd-resumo.md) | Visao geral do produto — **referencia principal** (02/04/2026) |
| [PRD Completo](prd/prd-completo.md) | Product Requirements Document completo (02/04/2026) |
| [Regras de Negocio](prd/business-rules.md) | 135 regras estruturadas com 6 fluxogramas Mermaid |
| [Lean Inception](prd/lean-inception.csv) | Artefato Lean Inception (discovery) |

## Planos de execucao

> **Nota:** Os planos de fase usam nomenclatura anterior ao PRD de 02/04/2026. As fases e entregas continuam validas, mas nomes de entidades podem estar desatualizados.

| Plano | Fase | Periodo |
|-------|------|---------|
| [Fase 1 — Base + Padronizacao](plans/fase-1-base.md) | Setup, scaffold, DS, schema | 15/03 - 03/04 |
| [Fase 2 — Coleta + Auth](plans/fase-2-coleta-auth.md) | Templates, instancias, auth | 22/03 - 05/04 |
| [Fase 3 — Gestao + Presenca](plans/fase-3-gestao.md) | Programas, participantes, sessoes | 05/04 - 03/05 |
| [Fase 4 — Impacto + QA + Deploy](plans/fase-4-impacto-deploy.md) | Dashboards, testes E2E, Vercel | 03/05 - 17/05 |

## Sprints

| Doc | Descricao | Para quem |
|-----|-----------|-----------|
| [Roadmap Macro](sprints/roadmap-macro.md) | Timeline geral, marcos, fases, Gantt | Todos — visao geral do projeto |
| [Roadmap Micro](sprints/roadmap-micro.md) | 11 sprints detalhadas (S01-S11), macroetapas, caminho critico | Todos — planejamento detalhado |
| [Sprint Track — Backend](sprints/track-backend.md) | Tasks BE por sprint, API contracts, passo a passo | Douglas (BE) |
| [Sprint Track — Frontend](sprints/track-frontend.md) | Tasks FE por sprint, componentes, pages | Adriano (FE) |
| [Como trabalhar com sprints](sprints/como-trabalhar.md) | Fluxo diario, convencoes, checklist | Dev junior — ler no primeiro dia |

## Guias

| Guia | Para quem |
|------|-----------|
| [Setup do ambiente](guides/setup-ambiente.md) | Dev junior — primeiro dia |
| [Git e SSH](guides/git-ssh.md) | Dev junior — configuracao Git |
| [Schema e migrations](guides/schema-migrations.md) | Dev — trabalhar com Supabase CLI |
| [Especificacao de desenvolvimento](guides/spec-desenvolvimento.md) | Dev — stack, estrutura, APIs, schema |

---

## Divergencias conhecidas (PRD 02/04/2026)

O PRD atualizado em 02/04/2026 introduziu mudancas estruturais significativas que ainda nao foram propagadas para todos os documentos:

| Antes | Agora |
|-------|-------|
| Programas | Projetos |
| Patrocinadores | Investidores |
| Formularios | Pesquisas |
| Participante como entidade primaria | **Negocio** como entidade primaria |
| Criacao manual de participantes | Criacao automatica via diagnostico |
| Navegacao: Gestao/Coleta/Impacto | Navegacao: Negocios/Participantes/Aulas/Pesquisas |

Documentos afetados: ADRs, planos de fase, sprint tracks. As decisoes tecnicas permanecem validas; a nomenclatura e fluxos precisam de alinhamento futuro.
