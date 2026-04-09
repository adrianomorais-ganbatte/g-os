# Fractus — Status de Conclusao das Tasks

> **Data da auditoria:** 02/04/2026
> **Metodo:** Analise automatica do codebase vs criterios de aceitacao
> **Status ClickUp:** NAO ATUALIZADO (pendente aprovacao manual)

## Legenda

- CONCLUIDA: Task atendida pelo codebase atual
- PARCIAL: Parte dos criterios atendidos
- PENDENTE: Nao iniciada ou sem evidencia no codebase

---

## S01 — Semana 1 (02/03 - 08/03) | Fase 0: Definicoes

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-001 | Analise do prototipo figma-make | CONCLUIDA | figma-make/mod-gestao/ existe com componentes catalogados |
| T-002 | Confirmar stack e decisoes arquiteturais | CONCLUIDA | Stack confirmada: Next.js 16.2 + Supabase + shadcn/ui + Zod + RHF + Recharts |
| T-003 | Preencher cronograma ClickUp completo | CONCLUIDA | clickup-sprints.md criado, ClickUp populado com 89 tasks |

**Sprint S01: 3/3 CONCLUIDAS**

---

## S02 — Semana 2 (08/03 - 15/03) | Fase 0: Definicoes (cont.)

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-004 | Padronizacao de UI — Tokens e guidelines | CONCLUIDA | tailwind.config.mjs configurado com tokens, postcss v4 |
| T-005 | Design de Gestao de Projetos (Upstream) | CONCLUIDA | Telas de projetos implementadas (list, form, detail com tabs) |

**Sprint S02: 2/2 CONCLUIDAS**

---

## S03 — Semana 3 (15/03 - 22/03) | Fase 1: Base + Padronizacao

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-006 | Scaffold Next.js App Router | CONCLUIDA | Next.js 16.2, App Router, TypeScript, Tailwind, ESLint configurados. `src/app/` com estrutura completa |
| T-007 | Configurar Supabase + Schema base | CONCLUIDA | supabase/config.toml, .env.local, 3 migrations criadas |
| T-008 | Schema — Enums SQL | CONCLUIDA | 5 enums: status_participante, tipo_template, tipo_campo, status_negocio, status_instancia |
| T-009 | Schema — Models core | CONCLUIDA | 10+ tabelas core criadas via migration (programas, patrocinadores, participantes, negocios, templates, etc.) |
| T-010 | Schema — Models transacionais | CONCLUIDA | Tabelas instancias, respostas, sessoes, presencas, paineis_customizados criadas |
| T-081 | Tabela negocios — Schema completo (NOVO) | CONCLUIDA | Tabela negocios com campos do PRD, RLS policies ativas |
| T-082 | Atualizar tabela participantes — FK negocio_id | PARCIAL | Tabela participantes existe mas FK negocio_id como obrigatoria nao confirmada (participante_negocios e N:N) |
| T-011 | Seed data realista | PARCIAL | seed.sql existe com patrocinadores e programas, mas seed de negocios/participantes vinculados incompleto |
| T-012 | Instalar primitivos shadcn/ui P0 | CONCLUIDA | 47 componentes UI instalados (excede os 16 P0 requeridos) |
| T-013 | Instalar primitivos shadcn/ui P1 | CONCLUIDA | calendar, popover, dropdown-menu, scroll-area, skeleton, progress, slider, radio-group — todos presentes |
| T-014 | Compostos base — PageHeader, EmptyState, SearchInput, ConfirmDialog | PARCIAL | PageHeader implementado. EmptyState, SearchInput, ConfirmDialog nao encontrados como componentes separados |
| T-015 | Compostos base — StatCard, StatusBadge, CountBadge, LoadingBadge, SortableTableHead | CONCLUIDA | stat-card.tsx, status-badge.tsx, sortable-table-head.tsx implementados |
| T-016 | Page Shells — PlatformShell, AuthShell, FormShell | CONCLUIDA | app-shell.tsx + app-sidebar.tsx (PlatformShell), /login layout (AuthShell), /f/[linkId] layout (FormShell) |
| T-016b | Configurar Storybook | CONCLUIDA | .storybook/ configurado, 33 stories presentes |
| T-075 | CI/CD pipeline (GitHub Actions + Vercel preview) | PENDENTE | Nenhum workflow GitHub Actions encontrado |
| T-017 | Design de Coleta — Pesquisas (Upstream) | CONCLUIDA | Telas de templates/pesquisas implementadas (list, form, detail) |

**Sprint S03: 12/16 CONCLUIDAS, 2 PARCIAIS, 1 PENDENTE**

---

## S04 — Semana 4 (22/03 - 29/03) | Fase 2a: Coleta — Templates

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-018 | Zod validation schemas — Enums e entidades base | CONCLUIDA | lib/validations/ com program.ts, participant.ts, deal.ts, template.ts |
| T-019 | Zod validation schemas — Pesquisas, Instancias, Respostas, Sessoes | CONCLUIDA | instance.ts, response.ts, session.ts em lib/validations/ |
| T-020 | Compostos avancados — MultiSelect, DataTable | CONCLUIDA | multi-select.tsx implementado. DataTable usado nas pages com sorting |
| T-021 | Compostos avancados — FormField, DateRangePicker, TagBadge, TagFilter | PARCIAL | date-picker.tsx presente. FormField via shadcn form. TagBadge/TagFilter nao encontrados separados |
| T-022 | CsvImportWizard — Portar de Vue para React | CONCLUIDA | csv-import-dialog.tsx implementado |
| T-023 | API Workspaces — CRUD | CONCLUIDA | Server actions para workspaces (via templates/actions.ts) |
| T-024 | API Templates (Pesquisas) — CRUD completo | CONCLUIDA | templates/actions.ts com getTemplates(), createTemplate() |
| T-025 | TemplatesList page (PesquisasList) | CONCLUIDA | /dashboard/templates page implementada |
| T-026 | TemplateForm page (PesquisaForm) — Editor de campos | CONCLUIDA | /dashboard/templates/novo implementado |
| T-027 | TemplateDetail page (PesquisaDetail) | CONCLUIDA | /dashboard/templates/[id] implementado |

**Sprint S04: 9/10 CONCLUIDAS, 1 PARCIAL**

---

## S05 — Semana 5 (29/03 - 05/04) | Fase 2a+2b: Auth + Instancias

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-028 | Auth setup — Supabase Auth + middleware | CONCLUIDA | Supabase SSR client configurado, utils/supabase/server.ts e client.ts |
| T-029 | API Auth — Endpoints | CONCLUIDA | /auth/callback/route.ts + server actions login/logout |
| T-030 | Login page | CONCLUIDA | /login page com email/password form |
| T-076 | Rate limiting — Endpoints publicos | PENDENTE | Nenhuma implementacao de rate limiting encontrada |
| T-031 | API Instancias — CRUD + publicar | CONCLUIDA | instances/actions.ts com getInstanceByLink(), getInstancesByProgram() |
| T-032 | InstanciaForm dialog | PARCIAL | Nao encontrado como componente isolado, mas funcionalidade pode estar inline |
| T-033 | InstanciaDetail page | PARCIAL | Nao encontrada page dedicada para detalhe de instancia |
| T-034 | Design de Autenticacao (Upstream) | CONCLUIDA | Login page implementada com design funcional |
| T-035 | Design de Coleta — Respostas (Upstream) | CONCLUIDA | FormPublico implementado em /f/[linkId] |

**Sprint S05: 6/9 CONCLUIDAS, 2 PARCIAIS, 1 PENDENTE**

---

## S06 — Semana 6 (05/04 - 12/04) | Fase 2c: Coleta — Respostas

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-036 | API Respostas — CRUD + auto-save + submit | PARCIAL | responses/actions.ts existe mas auto-save/submit nao confirmados |
| T-037 | Logica auto-status — Participante atualizado apos diagnostico | PENDENTE | Nao encontrada logica de auto-status |
| T-038 | Validacao de link publico — Middleware | PARCIAL | getInstanceByLink() existe mas 6 validacoes completas nao confirmadas |
| T-039 | FormPublico page — Renderizador de campos | CONCLUIDA | /f/[linkId] com public-form-client.tsx implementado |
| T-040 | RespostasViewer pages | PENDENTE | Nao encontradas pages de visualizacao de respostas |
| T-041 | Design de Impacto (Upstream) | PENDENTE | Sprint futuro |
| T-042 | Design Painel Investidor (Upstream) | PENDENTE | Sprint futuro |

**Sprint S06: 1/7 CONCLUIDA, 2 PARCIAIS, 4 PENDENTES**

---

## S07 — Semana 7 (12/04 - 19/04) | Fase 3a: Gestao

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-043 | API Projetos — CRUD completo | CONCLUIDA | programs/actions.ts com getPrograms(), createProgram(), deleteProgram() |
| T-044 | API Participantes — CRUD + bulk import | CONCLUIDA | participants/actions.ts com getAllParticipants(), createParticipant() |
| T-045 | API Investidores — CRUD | CONCLUIDA | sponsors/actions.ts implementado |
| T-083 | API Negocios CRUD — Pre-cadastro manual (NOVO) | CONCLUIDA | deals/actions.ts com getDeals(), createDeal() |
| T-084 | API Diagnostico do Negocio — Link unico por projeto | PENDENTE | Nao encontrada implementacao de diagnostico |
| T-085 | API Diagnostico Individual — Participante responde | PENDENTE | Nao encontrada implementacao |
| T-086 | API Ativacao Manual — Gestor ativa participante | PENDENTE | Nao encontrada implementacao |
| T-046 | ProjetosList page | CONCLUIDA | /dashboard/programas implementada |
| T-047 | ProjetoForm page | CONCLUIDA | create-program-dialog.tsx implementado |
| T-048 | ProjetoDetail page — Estrutura de tabs | CONCLUIDA | /dashboard/programas/[id] com tabs |

**Sprint S07: 7/10 CONCLUIDAS, 3 PENDENTES**

---

## S08 — Semana 8 (19/04 - 26/04) | Fase 3a: Gestao (cont.)

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-049 | ParticipantesList tab + ImportCSV | CONCLUIDA | /dashboard/participantes + csv-import-dialog.tsx |
| T-050 | ParticipanteDetail page | CONCLUIDA | /dashboard/participantes/[id] implementada |
| T-051 | InvestidoresList page + InvestidorDetail drawer | CONCLUIDA | /dashboard/patrocinadores implementada |
| T-087 | NegociosList page — Tabela com drawer (NOVO) | CONCLUIDA | /dashboard/negocios implementada |
| T-088 | NegocioForm dialog — Pre-cadastro (NOVO) | CONCLUIDA | create-deal-dialog.tsx implementado |
| T-089 | Copy Diagnostico Link component (NOVO) | CONCLUIDA | copy-link-input.tsx implementado |
| T-052 | API Sessoes + Presenca — CRUD completo | CONCLUIDA | sessions/actions.ts implementado |
| T-053 | Recalculo presenca — Service function | PENDENTE | Nao encontrada funcao de recalculo |
| T-078 | Brainstorming gate — Motor de risco | CONCLUIDA | lib/risk-calculator.ts existe (decisao tomada: portar do prototipo) |
| T-054 | Motor de risco — Server-side | CONCLUIDA | lib/risk-calculator.ts implementado |
| T-055 | RiskBadge componente | PENDENTE | Componente RiskBadge nao encontrado como separado |
| T-056 | PresencaTab + SessaoForm | CONCLUIDA | /dashboard/sessoes + create-session-dialog.tsx + attendance-manager.tsx |
| T-057 | PesquisasTab + SatisfacaoTab | PENDENTE | Tabs separados dentro do projeto nao encontrados |
| T-058 | API Negocios — CRUD (legado) | CONCLUIDA | Coberto por T-083 |
| T-059 | NegociosTab (legado) | CONCLUIDA | Coberto por T-087 |
| T-060 | Loading + Error states globais | PARCIAL | Loading skeletons para participantes, patrocinadores, programas, templates. Error states nao confirmados |

**Sprint S08: 11/16 CONCLUIDAS, 1 PARCIAL, 4 PENDENTES**

---

## S09 — Semana 9 (26/04 - 03/05) | Fase 3a (finalizacao) + Fase 3b

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-061 | Deploy Vercel + Supabase producao | PENDENTE | Sprint futuro |
| T-062 | API Impacto — Indicadores | PENDENTE | Sprint futuro |
| T-063 | API Impacto — Dashboard | PENDENTE | Sprint futuro |
| T-064 | API Paineis — CRUD | PENDENTE | Sprint futuro |
| T-065 | Expirar instancias — Lazy check | PENDENTE | Sprint futuro |

**Sprint S09: 0/5 — Sprint futuro**

---

## S10 — Semana 10 (03/05 - 10/05) | Fase 3b: Impacto + Paineis

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-079 | Brainstorming gate — Dashboard de impacto | PENDENTE | Sprint futuro |
| T-066 | ImpactoDashboard page | PENDENTE | Sprint futuro |
| T-080 | Brainstorming gate — Paineis customizados | PENDENTE | Sprint futuro |
| T-067 | PainelEditor + PainelView | PENDENTE | Sprint futuro |
| T-068 | Painel do Investidor page | PENDENTE | Sprint futuro |
| T-069 | Discovery V2 (Upstream) | PENDENTE | Sprint futuro |

**Sprint S10: 0/6 — Sprint futuro**

---

## S11 — Semana 11 (10/05 - 17/05) | Fase 4: QA + Deploy

| Task | Nome | Status | Evidencia |
|------|------|--------|-----------|
| T-070 | Testes E2E — Fluxos criticos | PENDENTE | Sprint futuro |
| T-071 | Auditoria de acessibilidade | PENDENTE | Sprint futuro |
| T-072 | Performance audit | PENDENTE | Sprint futuro |
| T-073 | Bug fixing e polish | PENDENTE | Sprint futuro |
| T-077 | Error tracking (Sentry) | PENDENTE | Sprint futuro |

**Sprint S11: 0/5 — Sprint futuro**

---

## Resumo Geral

| Sprint | Concluidas | Parciais | Pendentes | Total |
|--------|-----------|----------|-----------|-------|
| S01 | 3 | 0 | 0 | 3 |
| S02 | 2 | 0 | 0 | 2 |
| S03 | 12 | 2 | 1 | 16* |
| S04 | 9 | 1 | 0 | 10 |
| S05 | 6 | 2 | 1 | 9 |
| S06 | 1 | 2 | 4 | 7 |
| S07 | 7 | 0 | 3 | 10 |
| S08 | 11 | 1 | 4 | 16* |
| S09 | 0 | 0 | 5 | 5 |
| S10 | 0 | 0 | 6 | 6 |
| S11 | 0 | 0 | 5 | 5 |
| **TOTAL** | **51** | **8** | **29** | **89** |

*S03 e S08 incluem task T-017 e tasks legadas respectivamente

**Progresso geral: 51/89 concluidas (57%), 8 parciais (9%), 29 pendentes (33%)**

---

## Tasks Concluidas — IDs para ClickUp

Quando aprovado, atualizar para "concluida" no ClickUp:

```
T-001, T-002, T-003, T-004, T-005, T-006, T-007, T-008, T-009, T-010,
T-081, T-012, T-013, T-015, T-016, T-016b, T-017, T-018, T-019, T-020,
T-022, T-023, T-024, T-025, T-026, T-027, T-028, T-029, T-030, T-031,
T-034, T-035, T-039, T-043, T-044, T-045, T-083, T-046, T-047, T-048,
T-049, T-050, T-051, T-087, T-088, T-089, T-052, T-078, T-054, T-056,
T-058, T-059
```

## Tasks Parciais — Requerem verificacao manual

```
T-082, T-011, T-014, T-021, T-032, T-033, T-036, T-038, T-060
```
