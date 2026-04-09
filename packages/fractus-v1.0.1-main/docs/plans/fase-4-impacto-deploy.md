# Fase 4 — Impacto + QA + Deploy

> **Período:** 03/05 - 17/05
> **Objetivo:** Dashboard de impacto, testes E2E, deploy produção.

## Backend (Douglas)

### Impacto
- [ ] API Indicadores: cálculo de média por indicador (inicial vs final)
- [ ] API Dashboard: delta absoluto e percentual, NPS geral e por sessão
- [ ] API Painéis customizados: CRUD + filtros por programa/tags
- [ ] Views PostgreSQL para queries de dashboard (otimização)

### QA
- [ ] Testes E2E Playwright: 5 cenários críticos
  1. Login gestor → criar programa → adicionar participante
  2. Criar template → publicar instância → participante responde
  3. Registrar presença + NPS → verificar cálculos
  4. Patrocinador visualiza apenas seus programas
  5. Import CSV com deduplicação
- [ ] RLS audit: verificar todas as tabelas com policies

## Frontend (Adriano)

### Impacto
- [ ] ImpactoDashboard — select programa + classe, StatCards, BarChart + LineChart
- [ ] PaineisCustomizados — builder com seleção de indicadores
- [ ] Métricas: taxa de resposta, NPS, indicadores comparativos

### QA
- [ ] Lighthouse Accessibility > 80
- [ ] FCP < 1.5s em todas as páginas
- [ ] Responsividade (desktop priority, mobile basic)

## Deploy

- [ ] Vercel: configurar Root Directory `packages/fractus`
- [ ] Environment variables no dashboard Vercel
- [ ] Integração Supabase ↔ Vercel (sync env vars)
- [ ] Deploy preview funcional por PR
- [ ] Deploy production em `main`
- [ ] Domínio customizado (quando pronto)

## Marcos
- **03/05** — Gestão completa (todos os módulos core)
- **09/05** — Plataforma no ar (staging/produção)
- **17/05** — Entrega do MVP (testado e validado)

## Checklist pré-deploy
- [ ] `pnpm build` sem erros
- [ ] Todas as env vars configuradas na Vercel
- [ ] `supabase gen types` atualizado
- [ ] RLS policies testadas
- [ ] Nenhuma service_role_key no client-side
- [ ] middleware.ts protegendo `(platform)/`

## Referências
- `docs/fractus/sprint-track-backend.md` — S10-S11
- `docs/fractus/sprint-track-frontend.md` — S10-S11
- `docs/fractus/roadmap-v1.md` — marcos e timeline
