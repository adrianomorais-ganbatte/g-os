# Fractus -- Documento de Sprints para ClickUp

> **Versao:** 1.0
> **Data:** 02/04/2026
> **Projeto:** Fractus -- Plataforma de Gestao de Programas de Capacitacao e Impacto
> **MVP Deadline:** 17/05/2026
> **Stack:** Next.js App Router + Supabase (Client SDK + SQL migrations) + shadcn/ui + Zod
> **Time:** Douglas (Backend), Adriano (Frontend)

---

## Nomenclatura Atualizada (PRD Abril/2026)

> As seguintes mudancas de nomenclatura foram aplicadas conforme PRD atualizado:

| Termo anterior | Termo atual | Observacao |
|----------------|-------------|------------|
| Programas | **Projetos** | Entidade principal de gestao |
| Patrocinadores | **Investidores** | Financiadores dos projetos |
| Formularios | **Pesquisas** | Templates de coleta de dados |
| Participante como entidade primaria | **Negocio como entidade primaria** | Negocio gera participantes via diagnostico |

> **Nota:** Os IDs de tasks (T-001 a T-080) foram preservados. Descricoes atualizadas com nova nomenclatura onde aplicavel.

---

## Navegacao Atualizada

```
Projetos > Negocios > Participantes > Aulas > Pesquisas
```

### Fluxo de Status

**Negocio:**
```
pre_selecionado --> selecionado (apos diagnostico do negocio respondido)
```

**Participante:**
```
pre_selecionado --> selecionado (apos diagnostico individual) --> ativo (apos validacao manual + termo de aceite)
```

> Participantes nao podem existir sem um negocio vinculado.
> Link de diagnostico e unico por projeto.

---

## S01 -- Semana 1 (02/03 - 08/03) | Fase 0: Definicoes

**Objetivo:** Analisar prototipo, alinhar stack e iniciar cronograma.
**Periodo:** 02/03/2026 - 08/03/2026
**Milestone:** Definicoes gerais (08/03)

**Dependencias:**
- Bloqueado por: Nenhum
- Bloqueia: S02 (continuacao das definicoes)

---

### T-001: Analise do prototipo figma-make
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** analise, design-system, planejamento
- **Descricao:** Analisar `packages/fractus/figma-make/mod-gestao/` para levantar inventario de componentes, tipos, rotas, mock data e padroes reutilizaveis. Base para decisoes de porte e reaproveitamento.
- **Subtarefas:**
  - [ ] Catalogar componentes (54+)
  - [ ] Mapear interfaces TypeScript (15)
  - [ ] Listar rotas (20+)
  - [ ] Identificar padroes reutilizaveis (riskCalculator, AppContext, etc.)
- **Checklist de conclusao:**
  - [ ] Documento de analise completo
  - [ ] Inventario de componentes revisado
- **Criterios de aceitacao:**
  - AC1: Documento com inventario de componentes, tipos, rotas e decisoes de porte
  - AC2: Decisoes de reaproveitamento vs reescrita documentadas
- **Referencia:** Fase 0, figma-make/mod-gestao/

---

### T-002: Confirmar stack e decisoes arquiteturais
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** arquitetura, planejamento, infra
- **Descricao:** Confirmar stack tecnica: Next.js App Router, Supabase (PostgreSQL), Zod, shadcn/ui, Recharts, React Hook Form, Motion, PapaParse. Single-tenant. Deploy Vercel. Registrar ADRs.
- **Subtarefas:**
  - [ ] Validar escolha de cada tecnologia
  - [ ] Definir fronteira MVP vs V2 (BR-MVP-001 a BR-MVP-010)
  - [ ] Registrar decisoes em ADRs
- **Checklist de conclusao:**
  - [ ] ADRs 001-010 criados
  - [ ] spec-desenvolvimento.md secoes 1, 2.1, 2.2 preenchidas
- **Criterios de aceitacao:**
  - AC1: Decisoes registradas em spec-desenvolvimento.md
  - AC2: Lacunas L1 e L2 resolvidas
- **Referencia:** ADR-001 a ADR-010

---

### T-003: Preencher cronograma ClickUp completo
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** planejamento, clickup
- **Descricao:** Transferir itens do roadmap macro para ClickUp com datas, responsaveis e dependencias. Configurar marcos e fases.
- **Subtarefas:**
  - [ ] Criar estrutura de sprints no ClickUp (S01-S11)
  - [ ] Adicionar marcos com datas
  - [ ] Configurar dependencias entre tasks
- **Checklist de conclusao:**
  - [ ] ClickUp reflete roadmap-v1.md
  - [ ] 7 marcos configurados
  - [ ] 5 fases mapeadas
- **Criterios de aceitacao:**
  - AC1: ClickUp reflete roadmap com marcos, fases, streams Upstream/Downstream
- **Referencia:** roadmap-macro.md

---

### Criterios de aceite do Sprint S01

- [ ] Documento de analise do prototipo completo
- [ ] Stack confirmada e ADRs criados
- [ ] Cronograma ClickUp populado

---

## S02 -- Semana 2 (08/03 - 15/03) | Fase 0: Definicoes (cont.)

**Objetivo:** Finalizar definicoes de UI e design dos modulos core. Preparar para inicio do codigo.
**Periodo:** 08/03/2026 - 15/03/2026
**Milestone:** Inicio Tech (15/03)

**Dependencias:**
- Bloqueado por: S01 (definicoes iniciais)
- Bloqueia: S03 (inicio do codigo)

---

### T-004: Padronizacao de UI -- Tokens e guidelines
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** design-system, frontend
- **Descricao:** Definir tokens Tailwind (cores, fontes, espacamentos, border-radius), paleta de cores e tipografia. Basear no prototipo figma-make e Figma.
- **Subtarefas:**
  - [ ] Extrair tokens do prototipo
  - [ ] Configurar tailwind.config.ts com tokens customizados
  - [ ] Definir paleta de cores e tipografia
- **Checklist de conclusao:**
  - [ ] Tailwind config com tokens customizados
  - [ ] Cores e tipografia consistentes com prototipo
- **Criterios de aceitacao:**
  - AC1: Tailwind config com todos os tokens do design system
  - AC2: Consistencia visual com prototipo Figma
- **Referencia:** ADR-004, ADR-005

---

### T-005: Design de Gestao de Projetos (Upstream)
- **Responsavel:** Upstream (Design/Produto)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** design, upstream
- **Descricao:** Design das telas de listagem, criacao, edicao e detalhe de projetos (antigo "programas"). Definir layout de tabs, cards e filtros. **Nomenclatura atualizada: Programas -> Projetos.**
- **Subtarefas:**
  - [ ] Specs visuais para ProjetosList (antigo ProgramasList)
  - [ ] Specs visuais para ProjetoForm
  - [ ] Specs visuais para ProjetoDetail (5 tabs)
- **Checklist de conclusao:**
  - [ ] Specs visuais completas e aprovadas
- **Criterios de aceitacao:**
  - AC1: Specs visuais para todas as telas de Projetos
- **Referencia:** BR-PRG-001 a BR-PRG-010, PRD secao Gestao

---

### Criterios de aceite do Sprint S02

- [ ] Tokens de UI definidos e configurados
- [ ] Design de Gestao de Projetos entregue pelo upstream
- [ ] Equipe pronta para inicio do codigo (S03)

---

## S03 -- Semana 3 (15/03 - 22/03) | Fase 1: Base + Padronizacao

**Objetivo:** Scaffold do projeto, schema do banco, design system configurado, Storybook. Adicionar tabela de negocios ao schema.
**Periodo:** 15/03/2026 - 22/03/2026
**Milestone:** Nenhum (em andamento)

**Dependencias:**
- Bloqueado por: S02 (tokens UI, design gestao)
- Bloqueia: S04 (templates, Zod schemas)

---

### T-006: Scaffold Next.js App Router
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** infra, frontend, backend
- **Descricao:** create-next-app com App Router, TypeScript, Tailwind v4, ESLint, Prettier. Configurar estrutura de pastas conforme spec (app/, components/, lib/, hooks/, types/, services/).
- **Subtarefas:**
  - [ ] Executar create-next-app
  - [ ] Configurar ESLint + Prettier
  - [ ] Criar estrutura de diretorios
  - [ ] Configurar deploy preview Vercel
- **Checklist de conclusao:**
  - [ ] `pnpm dev` roda sem erros
  - [ ] Estrutura de diretorios match spec
  - [ ] Deploy preview no Vercel funcional
- **Criterios de aceitacao:**
  - AC1: Projeto roda localmente com `pnpm dev`
  - AC2: Deploy preview acessivel no Vercel
- **Referencia:** ADR-001

---

### T-007: Configurar Supabase + Schema base
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, infra, database
- **Descricao:** Configurar Supabase com connection string (pgBouncer). Criar schema SQL via `supabase migration new` com todas as tabelas, incluindo a nova tabela `negocios`. RLS policies basicas.
- **Subtarefas:**
  - [ ] Instalar Supabase CLI
  - [ ] Configurar .env com credenciais
  - [ ] Criar migration inicial
- **Checklist de conclusao:**
  - [ ] Migration cria todas as tabelas
  - [ ] Supabase Studio mostra tabelas
- **Criterios de aceitacao:**
  - AC1: Todas as tabelas criadas via migration
  - AC2: RLS policies basicas ativas
- **Referencia:** ADR-002, ADR-003
- **Bloqueia:** T-081 (tabela negocios), T-082 (FK participantes)

---

### T-008: Schema -- Enums SQL
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 2 pontos
- **Tags:** backend, database
- **Descricao:** Implementar 5 enums SQL: StatusParticipante (pre_selecionado, selecionado, ativo, inativo, desistente), TipoTemplate (4 valores), TipoCampo (4 valores), StatusNegocio (pre_selecionado, selecionado), StatusInstancia (3 valores). **StatusNegocio atualizado conforme PRD: pre_selecionado e selecionado.**
- **Subtarefas:**
  - [ ] Criar enum StatusParticipante com novos valores (pre_selecionado, selecionado, ativo)
  - [ ] Criar enum StatusNegocio (pre_selecionado, selecionado)
  - [ ] Criar enums TipoTemplate, TipoCampo, StatusInstancia
- **Checklist de conclusao:**
  - [ ] Enums criados sem erros
  - [ ] Migration gerada
- **Criterios de aceitacao:**
  - AC1: 5 enums criados via migration
  - AC2: StatusParticipante inclui pre_selecionado, selecionado, ativo
  - AC3: StatusNegocio inclui pre_selecionado, selecionado
- **Referencia:** PRD secao Status, BR-PRT-001, BR-TPL-003

---

### T-009: Schema -- Models core
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** backend, database
- **Descricao:** Implementar tabelas core: investidores (antigo patrocinadores), projetos (antigo programas), projeto_investidor, negocios, tags, participantes, participante_negocio, workspaces, templates, campo_template. **Nomenclatura atualizada conforme PRD.**
- **Subtarefas:**
  - [ ] Criar tabela projetos (antigo programas)
  - [ ] Criar tabela investidores (antigo patrocinadores)
  - [ ] Criar tabela negocios (ver T-081)
  - [ ] Criar tabela participantes com FK negocio_id (ver T-082)
  - [ ] Criar tabelas de relacao (projeto_investidor, participante_negocio)
  - [ ] Criar tabelas de coleta (workspaces, templates, campo_template)
- **Checklist de conclusao:**
  - [ ] 10 tabelas com relacoes, indexes e cascades
  - [ ] Migration sem erros
- **Criterios de aceitacao:**
  - AC1: Todas as tabelas core criadas com relacoes corretas
  - AC2: Participante possui FK obrigatoria para negocio
- **Referencia:** PRD secao Schema, BR-PRG-002, BR-PAT-003
- **Depende de:** T-008 (enums)

---

### T-010: Schema -- Models transacionais
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, database
- **Descricao:** Implementar tabelas transacionais: instancias (pesquisas atribuidas), resposta_instancia, sessoes, presenca_participante, painel_customizado, usuarios.
- **Subtarefas:**
  - [ ] Criar tabela instancias
  - [ ] Criar tabela resposta_instancia
  - [ ] Criar tabela sessoes + presenca_participante
  - [ ] Criar tabela painel_customizado
  - [ ] Criar tabela usuarios
- **Checklist de conclusao:**
  - [ ] 6 tabelas transacionais criadas
  - [ ] Unique constraints: resposta_unica, sessao_participante
- **Criterios de aceitacao:**
  - AC1: Todas as tabelas transacionais com constraints corretos
  - AC2: Total do schema: 16+ tabelas + 5 enums
- **Referencia:** BR-ATR-001, BR-RSP-003, BR-PRS-002
- **Depende de:** T-009 (models core)

---

### T-081: Tabela `negocios` -- Schema completo (NOVO)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, database, prd-update
- **Descricao:** Criar tabela `negocios` com todos os campos definidos no PRD atualizado. Negocio e a entidade primaria do sistema -- participantes sao gerados a partir do diagnostico do negocio. Inclui RLS policies para protecao de dados.
- **Subtarefas:**
  - [ ] Criar migration com campos: id (uuid PK), nome (text NOT NULL), lider_nome (text NOT NULL), lider_email (text NOT NULL UNIQUE per projeto), telefone (text), status (enum: pre_selecionado, selecionado DEFAULT pre_selecionado), projeto_id (FK NOT NULL), diagnostico_respondido (boolean DEFAULT false), created_at (timestamptz DEFAULT now()), updated_at (timestamptz DEFAULT now())
  - [ ] Criar index em projeto_id
  - [ ] Criar index em lider_email + projeto_id (unique)
  - [ ] Criar RLS policies (SELECT, INSERT, UPDATE para usuarios autenticados)
  - [ ] Criar trigger para updated_at automatico
- **Checklist de conclusao:**
  - [ ] Migration gerada e aplicada sem erros
  - [ ] RLS policies ativas
  - [ ] Indexes criados
- **Criterios de aceitacao:**
  - AC1: Tabela negocios criada com todos os campos do PRD
  - AC2: Status default e pre_selecionado
  - AC3: Email do lider e unico dentro do projeto
  - AC4: RLS policies protegem acesso por usuario autenticado
- **Referencia:** PRD secao Negocios, BR-NEG-001
- **Depende de:** T-007 (Supabase setup), T-008 (enum StatusNegocio)
- **Bloqueia:** T-082 (FK participantes), T-083 (API Negocios)

---

### T-082: Atualizar tabela `participantes` -- FK negocio_id obrigatoria (NOVO)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** backend, database, prd-update
- **Descricao:** Atualizar tabela `participantes` para incluir coluna negocio_id como FK obrigatoria. Participante nao pode existir sem um negocio vinculado. Atualizar status flow: pre_selecionado (default) -> selecionado (apos diagnostico individual) -> ativo (apos validacao manual).
- **Subtarefas:**
  - [ ] Adicionar coluna negocio_id (uuid NOT NULL FK references negocios(id))
  - [ ] Adicionar colunas expandidas: cpf (text), genero (text), cargo (text), cep (text), endereco (text), numero (text), complemento (text), bairro (text), cidade (text), estado (text, max 2 chars)
  - [ ] Adicionar coluna status `inativado` ao enum StatusParticipante
  - [ ] Criar index em negocio_id
  - [ ] Atualizar constraint de status para incluir pre_selecionado, selecionado, ativo, desistente, inativado, concluinte
  - [ ] Atualizar seed data para refletir novo schema
- **Checklist de conclusao:**
  - [ ] Migration aplicada sem erros
  - [ ] FK constraint ativo
  - [ ] Seed data atualizado
- **Criterios de aceitacao:**
  - AC1: Participante sem negocio_id e rejeitado pelo banco
  - AC2: CASCADE DELETE: deletar negocio deleta participantes vinculados
  - AC3: Status default e pre_selecionado
- **Referencia:** PRD secao Participantes, BR-PRT-001
- **Depende de:** T-081 (tabela negocios)
- **Bloqueia:** T-044 (API Participantes), T-084 (Diagnostico Negocio)

---

### T-011: Seed data realista
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** backend, database
- **Descricao:** Script de seed com dados realistas: 3 projetos, 2 investidores, 5 negocios (com lideres), 50 participantes (vinculados a negocios), 5 templates, 10 instancias, 30 respostas, 10 sessoes com presenca. **Atualizado para incluir negocios como entidade primaria.**
- **Subtarefas:**
  - [ ] Criar negocios antes de participantes no seed
  - [ ] Vincular participantes a negocios
  - [ ] Criar projetos com investidores
  - [ ] Popular templates, instancias e respostas
- **Checklist de conclusao:**
  - [ ] Seed executa sem erros
  - [ ] Dados suficientes para testar todas as telas
- **Criterios de aceitacao:**
  - AC1: Seed popula banco com dados realistas e consistentes
  - AC2: Todos os negocios tem pelo menos 2 participantes
- **Referencia:** PRD, seed.ts
- **Depende de:** T-009, T-010, T-081, T-082

---

### T-012: Instalar primitivos shadcn/ui P0
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 2 pontos
- **Tags:** frontend, design-system
- **Descricao:** Instalar 16 componentes P0 via `npx shadcn@latest add`: button, input, label, card, table, badge, select, tabs, dialog, sheet, checkbox, textarea, tooltip, separator, sonner, form.
- **Subtarefas:**
  - [ ] Executar shadcn add para cada componente
  - [ ] Verificar renderizacao
  - [ ] Configurar cn() em lib/utils.ts
- **Checklist de conclusao:**
  - [ ] 16 componentes renderizam corretamente
  - [ ] cn() configurado
- **Criterios de aceitacao:**
  - AC1: Todos os 16 primitivos P0 renderizam sem erros
- **Referencia:** ADR-004

---

### T-013: Instalar primitivos shadcn/ui P1
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 2 pontos
- **Tags:** frontend, design-system
- **Descricao:** Instalar 8 componentes P1: calendar, popover, dropdown-menu, scroll-area, skeleton, progress, slider, radio-group.
- **Subtarefas:**
  - [ ] Instalar componentes P1
  - [ ] Verificar renderizacao
- **Checklist de conclusao:**
  - [ ] 8 componentes adicionais renderizam
  - [ ] Total: 24 primitivos
- **Criterios de aceitacao:**
  - AC1: Todos os 24 primitivos renderizam corretamente
- **Referencia:** ADR-004

---

### T-014: Compostos base -- PageHeader, EmptyState, SearchInput, ConfirmDialog
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend, design-system
- **Descricao:** Criar 4 compostos domain-agnostic. PageHeader (titulo + breadcrumb + acoes), EmptyState (icone + titulo + CTA), SearchInput (input + debounce 300ms), ConfirmDialog (dialog + acao destrutiva).
- **Subtarefas:**
  - [ ] Implementar PageHeader com breadcrumb
  - [ ] Implementar EmptyState com CTA
  - [ ] Implementar SearchInput com debounce
  - [ ] Implementar ConfirmDialog
- **Checklist de conclusao:**
  - [ ] 4 compostos renderizam
  - [ ] SearchInput tem debounce funcional (300ms)
- **Criterios de aceitacao:**
  - AC1: Compostos renderizam corretamente em Storybook
  - AC2: SearchInput debounce funcional
- **Referencia:** BR-UX-003, BR-UX-008

---

### T-015: Compostos base -- StatCard, StatusBadge, CountBadge, LoadingBadge, SortableTableHead
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend, design-system
- **Descricao:** Portar 5 compostos do figma-make: StatCard (card + tendencia), StatusBadge (badge colorido por enum), CountBadge (numerico), LoadingBadge (spinner), SortableTableHead (sort por coluna). **StatusBadge deve suportar novos status de Negocio (pre_selecionado, selecionado) e Participante (pre_selecionado, selecionado, ativo).**
- **Subtarefas:**
  - [ ] Portar StatCard
  - [ ] Portar StatusBadge com suporte a todos os status
  - [ ] Portar CountBadge
  - [ ] Portar LoadingBadge
  - [ ] Portar SortableTableHead
- **Checklist de conclusao:**
  - [ ] Componentes portados e renderizando
  - [ ] StatusBadge aceita todos os status de participante e negocio
- **Criterios de aceitacao:**
  - AC1: StatusBadge renderiza corretamente para pre_selecionado, selecionado, ativo, inativo, desistente
  - AC2: StatusBadge renderiza para status de negocio
- **Referencia:** BR-UX-006, PRD secao Status

---

### T-016: Page Shells -- PlatformShell, AuthShell, FormShell
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend, layout
- **Descricao:** Criar 3 layouts Next.js: (platform)/layout.tsx (sidebar + header + auth guard), (auth)/layout.tsx (centrado, minimal), f/[id]/layout.tsx (branding minimo + barra progresso). **Sidebar atualizada: Projetos, Negocios, Participantes, Investidores, Pesquisas (nomenclatura PRD).**
- **Subtarefas:**
  - [ ] Implementar PlatformShell com sidebar atualizada
  - [ ] Implementar AuthShell
  - [ ] Implementar FormShell
  - [ ] Configurar auth guard no layout (platform)
- **Checklist de conclusao:**
  - [ ] Navegacao entre layouts funcional
  - [ ] Sidebar com itens corretos (nomenclatura atualizada)
  - [ ] Auth guard redireciona para login
- **Criterios de aceitacao:**
  - AC1: Sidebar reflete nova navegacao (Projetos > Negocios > Participantes)
  - AC2: Auth guard funcional
- **Referencia:** BR-UX-001, PRD secao Navegacao

---

### T-016b: Configurar Storybook
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** infra, design-system, qa
- **Descricao:** Configurar Storybook para documentacao visual. Stories para primitivos P0, compostos base e Page Shells.
- **Subtarefas:**
  - [ ] Instalar e configurar Storybook
  - [ ] Criar stories para Button, Card, StatCard, StatusBadge, PageHeader
  - [ ] Configurar deploy preview (opcional)
- **Checklist de conclusao:**
  - [ ] `pnpm storybook` roda
  - [ ] Stories para componentes P0
- **Criterios de aceitacao:**
  - AC1: Storybook roda localmente sem erros
  - AC2: Stories renderizam componentes corretamente
- **Referencia:** ADR-010

---

### T-075: CI/CD pipeline (GitHub Actions + Vercel preview)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** infra, devops
- **Descricao:** Configurar GitHub Actions: lint + typecheck + test em PRs. Vercel preview deploys automaticos por PR. Branch protection rules.
- **Subtarefas:**
  - [ ] Criar workflow ci.yml
  - [ ] Configurar Vercel preview deploys
  - [ ] Configurar branch protection
- **Checklist de conclusao:**
  - [ ] PRs disparam CI
  - [ ] Preview deploy funcional
  - [ ] Branch main protegida
- **Criterios de aceitacao:**
  - AC1: CI roda lint + typecheck + test em cada PR
  - AC2: Preview deploy acessivel por PR
- **Referencia:** vercel.json

---

### T-017: Design de Coleta -- Pesquisas (Upstream)
- **Responsavel:** Upstream (Design/Produto)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** design, upstream
- **Descricao:** Design das telas de listagem/criacao/edicao de pesquisas (antigo "templates/formularios"), editor de campos, workspace tabs. **Nomenclatura atualizada: Formularios -> Pesquisas.**
- **Subtarefas:**
  - [ ] Specs visuais para PesquisasList (antigo TemplatesList)
  - [ ] Specs visuais para PesquisaForm (campo editor)
  - [ ] Specs visuais para PesquisaDetail
- **Checklist de conclusao:**
  - [ ] Specs visuais completas
- **Criterios de aceitacao:**
  - AC1: Specs visuais para todas as telas de Pesquisas
- **Referencia:** BR-TPL-001 a BR-TPL-016

---

### Criterios de aceite do Sprint S03

- [ ] `pnpm build` passa sem erros
- [ ] `pnpm storybook` roda com compostos
- [ ] Schema deployado no Supabase com seed data (incluindo tabela negocios)
- [ ] Tabela negocios com campos corretos e RLS policies
- [ ] Participantes possuem FK obrigatoria para negocio
- [ ] Deploy preview no Vercel acessivel
- [ ] CI/CD pipeline funcional

---

## S04 -- Semana 4 (22/03 - 29/03) | Fase 2a: Coleta -- Templates (Pesquisas)

**Objetivo:** Zod schemas, compostos avancados, CRUD de templates/pesquisas completo.
**Periodo:** 22/03/2026 - 29/03/2026
**Milestone:** Inicio PO (29/03)

**Dependencias:**
- Bloqueado por: S03 (schema, primitivos, page shells)
- Bloqueia: S05 (auth, instancias)

---

### T-018: Zod validation schemas -- Enums e entidades base
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, validacao
- **Descricao:** Criar schemas Zod para enums e entidades de criacao/update: Projeto (antigo Programa), Participante, Investidor (antigo Patrocinador), Negocio, Tag. **Schemas de Negocio incluem novos campos do PRD.**
- **Subtarefas:**
  - [ ] Schemas para enums (StatusParticipante, TipoTemplate, TipoCampo, StatusNegocio, StatusInstancia)
  - [ ] Schemas para Projeto (create/update)
  - [ ] Schemas para Participante (create/update -- com negocio_id obrigatorio)
  - [ ] Schemas para Investidor (create/update)
  - [ ] Schemas para Negocio (create/update -- com campos do PRD)
  - [ ] Schemas para Tag
- **Checklist de conclusao:**
  - [ ] Schemas exportam tipos inferidos (z.infer)
  - [ ] Schemas usaveis em FE e BE
- **Criterios de aceitacao:**
  - AC1: Todos os schemas com tipos create/update
  - AC2: Schema de Negocio inclui campos do PRD (nome, lider_nome, lider_email, telefone, status)
  - AC3: Schema de Participante exige negocio_id
- **Referencia:** ADR-007, PRD secao Negocios

---

### T-019: Zod validation schemas -- Pesquisas, Instancias, Respostas, Sessoes
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, validacao
- **Descricao:** Schemas para: Template (Pesquisa), CampoTemplate, Workspace, Instancia, RespostaInstancia, Sessao, PresencaParticipante, PainelCustomizado, Usuario.
- **Subtarefas:**
  - [ ] Schemas para Template/CampoTemplate/Workspace
  - [ ] Schemas para Instancia/RespostaInstancia
  - [ ] Schemas para Sessao/PresencaParticipante
  - [ ] Schemas para PainelCustomizado/Usuario
  - [ ] Criar index.ts com re-exports
- **Checklist de conclusao:**
  - [ ] 15+ schemas completos
  - [ ] index.ts re-exporta tudo
- **Criterios de aceitacao:**
  - AC1: Todos os schemas com tipos create/update
  - AC2: index.ts centraliza exports
- **Referencia:** BR-TPL-005, BR-ATR-004, BR-RSP-003

---

### T-020: Compostos avancados -- MultiSelect, DataTable
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend, design-system
- **Descricao:** Portar MultiSelect do figma-make (Popover + Command + Badge). Criar DataTable (Table + SortableTableHead + SearchInput + Select + Pagination).
- **Subtarefas:**
  - [ ] Implementar MultiSelect com busca e badges
  - [ ] Implementar DataTable com sort, filtro, paginacao
  - [ ] Criar hook use-table-sort.ts
- **Checklist de conclusao:**
  - [ ] MultiSelect com busca e badges funcional
  - [ ] DataTable com sort, filtro e paginacao
- **Criterios de aceitacao:**
  - AC1: MultiSelect renderiza com busca e selecao multipla
  - AC2: DataTable suporta sort, filtro e paginacao
- **Referencia:** BR-UX-005, BR-UX-006, BR-UX-007

---

### T-021: Compostos avancados -- FormField, DateRangePicker, TagBadge, TagFilter
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend, design-system
- **Descricao:** FormField (Label + Input/Select/Textarea + RHF error), DateRangePicker (Popover + Calendar + date-fns pt-BR), TagBadge (Badge com cor por tipo), TagFilter (MultiSelect + TagBadge).
- **Subtarefas:**
  - [ ] Implementar FormField com integracao RHF
  - [ ] Implementar DateRangePicker em pt-BR
  - [ ] Implementar TagBadge com 5 cores por tipo
  - [ ] Implementar TagFilter
- **Checklist de conclusao:**
  - [ ] FormField integra com React Hook Form
  - [ ] DateRangePicker em pt-BR
  - [ ] TagBadge com 5 cores
- **Criterios de aceitacao:**
  - AC1: FormField exibe erros de validacao do RHF/Zod
  - AC2: DateRangePicker funcional em pt-BR
- **Referencia:** BR-PRT-008

---

### T-022: CsvImportWizard -- Portar de Vue para React
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 8 pontos
- **Tags:** frontend, design-system
- **Descricao:** Portar import_csv_map_vue para React/shadcn/ui. 3 etapas: (1) upload drag-and-drop (.csv, 5MB, 5000 linhas), (2) mapeamento colunas via Select + preview 100 linhas, (3) confirmacao com tabela completa + busca.
- **Subtarefas:**
  - [ ] Implementar step upload (drag-and-drop)
  - [ ] Implementar step mapeamento de colunas
  - [ ] Implementar step confirmacao
  - [ ] Instalar papaparse
- **Checklist de conclusao:**
  - [ ] Upload drag-and-drop funcional
  - [ ] Mapeamento visual de colunas
  - [ ] Callback retorna array de objetos mapeados
- **Criterios de aceitacao:**
  - AC1: Upload aceita .csv ate 5MB e 5000 linhas
  - AC2: Mapeamento de colunas com preview
  - AC3: Callback onComplete retorna dados mapeados
- **Referencia:** BR-PRT-014, BR-MVP-007

---

### T-023: API Workspaces -- CRUD
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** backend
- **Descricao:** Endpoints: GET /api/workspaces (list com count templates/pesquisas), POST /api/workspaces (criar com nome unico).
- **Subtarefas:**
  - [ ] Implementar GET /api/workspaces
  - [ ] Implementar POST /api/workspaces
  - [ ] Validar nome unico (409 se duplicado)
- **Checklist de conclusao:**
  - [ ] GET retorna workspaces com count
  - [ ] POST valida nome unico
- **Criterios de aceitacao:**
  - AC1: GET retorna lista com contagem de pesquisas por workspace
  - AC2: POST rejeita nome duplicado com 409
- **Referencia:** BR-TPL-002, BR-TPL-015

---

### T-024: API Templates (Pesquisas) -- CRUD completo
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** backend
- **Descricao:** CRUD completo de pesquisas (antigo templates): GET list (filtro workspace/tipo/search), GET detail (campos + count instancias), POST (criar com campos), PUT (update + versionamento), DELETE (soft delete se tem respostas), PUT desativar. **Nomenclatura: Templates -> Pesquisas nos endpoints e descricoes.**
- **Subtarefas:**
  - [ ] GET /api/templates (list com filtros)
  - [ ] GET /api/templates/[id] (detail com campos)
  - [ ] POST /api/templates (criar com campos)
  - [ ] PUT /api/templates/[id] (update + versionamento)
  - [ ] DELETE /api/templates/[id] (soft delete)
  - [ ] PUT /api/templates/[id]/desativar
- **Checklist de conclusao:**
  - [ ] Todos os endpoints retornam dados conforme Zod
  - [ ] Versionamento incrementa ao editar com respostas
  - [ ] Soft delete funcional
- **Criterios de aceitacao:**
  - AC1: CRUD completo funcional
  - AC2: Soft delete quando template tem respostas vinculadas
  - AC3: Versionamento incrementa ao editar template vinculado
- **Referencia:** BR-TPL-001, BR-TPL-005, BR-TPL-009, BR-TPL-010

---

### T-025: TemplatesList page (PesquisasList)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** Listagem de pesquisas (antigo templates) com tabs por workspace, filtro por tipo, busca por nome. Exibe: nome, tipo, fase, n perguntas, n respostas, status.
- **Subtarefas:**
  - [ ] Implementar tabs por workspace
  - [ ] Implementar DataTable com sort e filtro
  - [ ] Criar TemplateCard/PesquisaCard
- **Checklist de conclusao:**
  - [ ] Tabs por workspace funcionais
  - [ ] DataTable com sort e filtro
- **Criterios de aceitacao:**
  - AC1: Lista pesquisas com filtro por workspace e tipo
  - AC2: Busca por nome funcional
- **Referencia:** BR-TPL-013, BR-TPL-016

---

### T-026: TemplateForm page (PesquisaForm) -- Editor de campos
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** frontend
- **Descricao:** Formulario criar/editar pesquisa com: nome, descricao, tipo, workspace, campos dinamicos (adicionar/remover/reordenar), config por tipo de campo (opcoes para escolha, escala min/max com labels), marcacao de indicador.
- **Subtarefas:**
  - [ ] Implementar formulario base (nome, descricao, tipo, workspace)
  - [ ] Implementar editor de campos com drag-and-drop
  - [ ] Config de escala (min, max, labels)
  - [ ] Toggle isIndicador com input nomeIndicador
- **Checklist de conclusao:**
  - [ ] Drag-and-drop de campos funcional
  - [ ] Config de escala funcional
  - [ ] RHF + Zod validation
- **Criterios de aceitacao:**
  - AC1: Campos podem ser adicionados, removidos e reordenados
  - AC2: Config por tipo de campo (texto, escolha, escala)
  - AC3: Validacao Zod funcional
- **Referencia:** BR-TPL-004, BR-TPL-005, BR-TPL-006, BR-TPL-007

---

### T-027: TemplateDetail page (PesquisaDetail)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** frontend
- **Descricao:** Visualizacao read-only da pesquisa: campos, configuracao, instancias vinculadas. Botoes: editar, duplicar, desativar/ativar.
- **Subtarefas:**
  - [ ] Renderizar lista de campos
  - [ ] Listar instancias vinculadas
  - [ ] Botoes de acao (editar, duplicar, desativar)
- **Checklist de conclusao:**
  - [ ] Campos renderizados corretamente
  - [ ] Instancias vinculadas listadas
  - [ ] Duplicacao cria copia editavel
- **Criterios de aceitacao:**
  - AC1: Visualizacao completa dos campos e configuracao
  - AC2: Duplicacao funcional
- **Referencia:** BR-TPL-008, BR-TPL-009

---

### Criterios de aceite do Sprint S04

- [ ] Zod schemas completos para todas as entidades (incluindo Negocio)
- [ ] Compostos avancados funcionais (MultiSelect, DataTable, CsvImportWizard)
- [ ] API Workspaces CRUD funcional
- [ ] API Templates (Pesquisas) CRUD completo
- [ ] Telas de pesquisas (list, form, detail) renderizam
- [ ] PO pode iniciar review (marco 29/03)

---

## S05 -- Semana 5 (29/03 - 05/04) | Fase 2a+2b: Auth + Instancias

**Objetivo:** Autenticacao funcional (gestor + participante), instancias de pesquisa com publicacao.
**Periodo:** 29/03/2026 - 05/04/2026
**Milestone:** Auth + Templates prontos (05/04)

**Dependencias:**
- Bloqueado por: S04 (Zod schemas, API Templates)
- Bloqueia: S06 (respostas, formulario publico)

---

### T-028: Auth setup -- Supabase Auth + middleware
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, auth, infra
- **Descricao:** Configurar Supabase Auth: email/password para gestores, magic link para participantes. Middleware Next.js em (platform)/ para validar sessao. Cookies HTTP-only.
- **Subtarefas:**
  - [ ] Configurar Supabase Auth
  - [ ] Implementar middleware de validacao de sessao
  - [ ] Configurar cookies HTTP-only
- **Checklist de conclusao:**
  - [ ] Middleware redireciona nao-autenticados para /login
  - [ ] Session persistida via cookies
- **Criterios de aceitacao:**
  - AC1: Rotas protegidas redirecionam para login
  - AC2: Sessao persiste entre recarregamentos
- **Referencia:** ADR-008, BR-AUT-001, BR-AUT-005

---

### T-029: API Auth -- Endpoints
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, auth
- **Descricao:** POST /api/auth/login (email/senha gestor), POST /api/auth/magic-link (email participante), GET /api/auth/me, POST /api/auth/logout, GET /api/auth/callback (magic link callback).
- **Subtarefas:**
  - [ ] Implementar POST /api/auth/login
  - [ ] Implementar POST /api/auth/magic-link
  - [ ] Implementar GET /api/auth/me
  - [ ] Implementar POST /api/auth/logout
  - [ ] Implementar GET /api/auth/callback
- **Checklist de conclusao:**
  - [ ] Login gestor retorna session
  - [ ] Magic link envia email
  - [ ] Callback redireciona corretamente
- **Criterios de aceitacao:**
  - AC1: Login gestor funcional com email/senha
  - AC2: Magic link envia email e callback redireciona
  - AC3: /me retorna usuario autenticado
- **Referencia:** BR-AUT-001 a BR-AUT-007

---

### T-030: Login page
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** frontend, auth
- **Descricao:** Formulario login com toggle gestor (email/senha) vs participante (magic link). AuthShell layout.
- **Subtarefas:**
  - [ ] Implementar formulario de login gestor
  - [ ] Implementar formulario magic link
  - [ ] Aplicar AuthShell layout
- **Checklist de conclusao:**
  - [ ] Login gestor funcional
  - [ ] Magic link envia email e exibe confirmacao
- **Criterios de aceitacao:**
  - AC1: Toggle entre gestor e participante funcional
  - AC2: Mensagem de confirmacao apos envio de magic link
- **Referencia:** BR-AUT-005

---

### T-076: Rate limiting -- Endpoints publicos
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** backend, infra, seguranca
- **Descricao:** Rate limiting nos endpoints publicos /api/f/[linkId] e /api/respostas (auto-save). 60 req/min por IP.
- **Subtarefas:**
  - [ ] Implementar lib/rate-limit.ts
  - [ ] Aplicar nos endpoints publicos
  - [ ] Retornar 429 com Retry-After header
- **Checklist de conclusao:**
  - [ ] Rate limit ativo
  - [ ] Retorna 429 quando excede
- **Criterios de aceitacao:**
  - AC1: 60 req/min por IP nos endpoints publicos
  - AC2: Header Retry-After presente no 429
- **Referencia:** Infra

---

### T-031: API Instancias -- CRUD + publicar
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** backend
- **Descricao:** CRUD de instancias de pesquisa: GET list (filtro projeto/tipo, contagem respostas X/Y), GET detail, POST (criar), PUT publicar (gerar nanoid 8 chars), PUT despublicar.
- **Subtarefas:**
  - [ ] GET /api/instancias (list com filtros)
  - [ ] GET /api/instancias/[id] (detail com template)
  - [ ] POST /api/instancias (criar com tipo do template)
  - [ ] PUT /api/instancias/[id]/publicar (gerar nanoid)
  - [ ] PUT /api/instancias/[id]/despublicar (manter link)
- **Checklist de conclusao:**
  - [ ] Todos os endpoints funcionais
  - [ ] Publicar gera link /f/[nanoid]
  - [ ] Y calculado por participantes ativos
- **Criterios de aceitacao:**
  - AC1: POST valida tipo = tipo do template
  - AC2: Publicar gera link publico unico
  - AC3: Y calculado corretamente
- **Referencia:** BR-ATR-001 a BR-ATR-010

---

### T-032: InstanciaForm dialog
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** frontend
- **Descricao:** Dialog para criar instancia de pesquisa: selecionar template/pesquisa, projeto, tags filtro, prazo validade, mensagem personalizada.
- **Subtarefas:**
  - [ ] Implementar dialog com selects
  - [ ] Integrar tags filtro com MultiSelect
  - [ ] Validacao Zod
- **Checklist de conclusao:**
  - [ ] Dialog funcional
  - [ ] Selects populados via API
- **Criterios de aceitacao:**
  - AC1: Dialog cria instancia com sucesso
  - AC2: Tags filtro funcional
- **Referencia:** BR-ATR-001, BR-ATR-007, BR-ATR-008

---

### T-033: InstanciaDetail page
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** frontend
- **Descricao:** Detalhe da instancia: status, link (copy to clipboard), respostas X/Y, template info. Botoes: publicar/despublicar.
- **Subtarefas:**
  - [ ] Renderizar dados da instancia
  - [ ] Implementar copy to clipboard do link
  - [ ] Botoes publicar/despublicar
- **Checklist de conclusao:**
  - [ ] Link copiavel com toast
  - [ ] Status badge
  - [ ] Contagem X/Y
- **Criterios de aceitacao:**
  - AC1: Copy to clipboard funcional com feedback visual
  - AC2: Status badge reflete estado atual
- **Referencia:** BR-ATR-004, BR-ATR-006

---

### T-034: Design de Autenticacao (Upstream)
- **Responsavel:** Upstream (Design/Produto)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** design, upstream
- **Descricao:** Design: telas login gestor, magic link participante, paginas de erro (nao cadastrado, sem acesso, prazo expirado).
- **Subtarefas:**
  - [ ] Specs visuais para login
  - [ ] Specs visuais para callback
  - [ ] Specs visuais para paginas de erro
- **Checklist de conclusao:**
  - [ ] Specs visuais completas
- **Criterios de aceitacao:**
  - AC1: Specs visuais para todas as telas de autenticacao
- **Referencia:** BR-AUT-001 a BR-AUT-007

---

### T-035: Design de Coleta -- Respostas (Upstream)
- **Responsavel:** Upstream (Design/Produto)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** design, upstream
- **Descricao:** Design: formulario publico, auto-save indicator, tela de sucesso, visualizacao de respostas pelo gestor.
- **Subtarefas:**
  - [ ] Specs visuais para FormPublico
  - [ ] Specs visuais para RespostasViewer
- **Checklist de conclusao:**
  - [ ] Specs visuais completas
- **Criterios de aceitacao:**
  - AC1: Specs visuais para formulario publico e viewer
- **Referencia:** BR-RSP-001, BR-RSP-010

---

### Criterios de aceite do Sprint S05

- [ ] Login gestor funcional (email/senha)
- [ ] Magic link funcional (envio + callback)
- [ ] Middleware protege rotas (platform)/
- [ ] API Instancias CRUD completo
- [ ] Publicar gera link publico
- [ ] Rate limiting ativo nos endpoints publicos

---

## S06 -- Semana 6 (05/04 - 12/04) | Fase 2c: Coleta -- Respostas

**Objetivo:** Formulario publico funcional, auto-save, visualizacao de respostas.
**Periodo:** 05/04/2026 - 12/04/2026
**Milestone:** Entregas D/P MVP (12/04)

**Dependencias:**
- Bloqueado por: S05 (auth, instancias)
- Bloqueia: S07 (gestao de projetos)

---

### T-036: API Respostas -- CRUD + auto-save + submit
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** backend
- **Descricao:** CRUD de respostas: GET list, GET detail, POST criar, PUT rascunho (auto-save), PUT enviar (submit final com validacao de obrigatorios). Valida 6 regras de link publico.
- **Subtarefas:**
  - [ ] GET /api/respostas?instanciaId= (list com participante.nome)
  - [ ] GET /api/respostas/[id] (detail)
  - [ ] POST /api/respostas (criar com validacao)
  - [ ] PUT /api/respostas/[id]/rascunho (auto-save)
  - [ ] PUT /api/respostas/[id]/enviar (submit -- valida obrigatorios)
- **Checklist de conclusao:**
  - [ ] POST valida 6 regras do link publico
  - [ ] Auto-save nao marca completedAt
  - [ ] Submit valida campos obrigatorios
- **Criterios de aceitacao:**
  - AC1: Auto-save funcional sem marcar completedAt
  - AC2: Submit valida campos obrigatorios e marca completedAt
  - AC3: Erros especificos por cenario (422, 410, 403, 409)
- **Referencia:** BR-RSP-001 a BR-RSP-009

---

### T-037: Logica auto-status -- Participante atualizado apos diagnostico
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** backend, prd-update
- **Descricao:** Ao submeter resposta de diagnostico individual, atualizar participante.status para selecionado. **PRD atualizado: diagnostico individual muda para selecionado (nao mais ativo). Ativacao e manual via T-086.**
- **Subtarefas:**
  - [ ] Trigger no submit de diagnostico individual
  - [ ] Atualizar status para selecionado (nao ativo)
  - [ ] Outros tipos de pesquisa nao alteram status
- **Checklist de conclusao:**
  - [ ] Submit de diagnostico individual muda status
  - [ ] Outros tipos nao alteram status
- **Criterios de aceitacao:**
  - AC1: Diagnostico individual muda pre_selecionado -> selecionado
  - AC2: Outros tipos de pesquisa nao afetam status
- **Referencia:** PRD secao Status Participante, BR-PRT-004
- **Depende de:** T-082 (schema participantes atualizado)

---

### T-038: Validacao de link publico -- Middleware
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, seguranca
- **Descricao:** GET /api/f/[linkId] -- validar 6 regras: link existe, instancia publicada, prazo valido, participante autenticado vinculado ao projeto, tags filtro match, resposta unica.
- **Subtarefas:**
  - [ ] Validar existencia do link
  - [ ] Validar instancia publicada
  - [ ] Validar prazo
  - [ ] Validar participante vinculado
  - [ ] Validar tags filtro
  - [ ] Validar resposta unica
- **Checklist de conclusao:**
  - [ ] Cada cenario retorna erro especifico
  - [ ] Caso OK retorna instancia + template + participante
- **Criterios de aceitacao:**
  - AC1: 6 validacoes funcionais com erros especificos
  - AC2: Retorno correto no caso de sucesso
- **Referencia:** BR-AUT-001 a BR-AUT-004, BR-ATR-008

---

### T-039: FormPublico page -- Renderizador de campos
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** frontend
- **Descricao:** Pagina /f/[id] com renderizacao de pesquisa para participante. CampoRenderer renderiza conforme tipo (texto -> Input, escolha_unica -> RadioGroup, multipla_escolha -> Checkbox group, escala -> Slider). Auto-save via debounce 3s. Submit marca completedAt. FormShell com barra de progresso.
- **Subtarefas:**
  - [ ] Implementar CampoRenderer (4 tipos)
  - [ ] Implementar auto-save com debounce 3s
  - [ ] Implementar barra de progresso
  - [ ] Implementar tela de sucesso apos envio
  - [ ] Validar campos obrigatorios no submit
- **Checklist de conclusao:**
  - [ ] 4 tipos de campo renderizam
  - [ ] Auto-save a cada 3s
  - [ ] Tela de sucesso apos envio
- **Criterios de aceitacao:**
  - AC1: Todos os tipos de campo renderizam corretamente
  - AC2: Auto-save funcional com debounce 3s
  - AC3: Campos obrigatorios validados no submit
- **Referencia:** BR-RSP-001, BR-RSP-002, BR-RSP-004

---

### T-040: RespostasViewer pages
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** 3 paginas de visualizacao de respostas (pesquisas, satisfacao, sessao): DataTable com participante, data envio, status. Detalhe expandivel por participante. **Nomenclatura: Formularios -> Pesquisas.**
- **Subtarefas:**
  - [ ] Implementar RespostasViewer generico
  - [ ] Pagina respostas de pesquisas
  - [ ] Pagina respostas de satisfacao
  - [ ] Pagina respostas de sessao
- **Checklist de conclusao:**
  - [ ] DataTable com respostas
  - [ ] Expandir mostra respostas individuais
  - [ ] Filtro por status
- **Criterios de aceitacao:**
  - AC1: DataTable exibe respostas com filtro por status
  - AC2: Expandir mostra respostas individuais por pergunta
- **Referencia:** BR-RSP-010

---

### T-041: Design de Impacto (Upstream)
- **Responsavel:** Upstream (Design/Produto)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** design, upstream
- **Descricao:** Design: dashboard impacto, cards indicadores, graficos, filtros, paineis customizados.
- **Subtarefas:**
  - [ ] Specs visuais para ImpactoDashboard
  - [ ] Specs visuais para IndicadorCard
  - [ ] Specs visuais para PainelEditor
- **Checklist de conclusao:**
  - [ ] Specs visuais completas
- **Criterios de aceitacao:**
  - AC1: Specs visuais para dashboard de impacto completas
- **Referencia:** BR-IMP-001 a BR-IMP-008

---

### T-042: Design Painel Investidor (Upstream)
- **Responsavel:** Upstream (Design/Produto)
- **Prioridade:** P2 (desejavel)
- **Estimativa:** 3 pontos
- **Tags:** design, upstream
- **Descricao:** Design: view read-only para investidor (antigo patrocinador), filtrada por projeto. **Nomenclatura: Patrocinador -> Investidor.**
- **Subtarefas:**
  - [ ] Specs visuais para InvestidorDashboard (antigo PatrocinadorDashboard)
- **Checklist de conclusao:**
  - [ ] Specs visuais completas
- **Criterios de aceitacao:**
  - AC1: Specs visuais para painel do investidor
- **Referencia:** BR-PAT-005, BR-PAT-006

---

### Criterios de aceite do Sprint S06

- [ ] API Respostas CRUD + auto-save + submit funcional
- [ ] Auto-status de participante funcional (diagnostico individual -> selecionado)
- [ ] Validacao de link publico com 6 regras
- [ ] FormPublico renderiza 4 tipos de campo com auto-save
- [ ] RespostasViewer renderiza respostas por participante
- [ ] Coleta completa (marco 15/04 no proximo sprint)

---

## S07 -- Semana 7 (12/04 - 19/04) | Fase 3a: Gestao -- Projetos, Participantes, Investidores, Negocios

**Objetivo:** APIs de gestao core (Projetos, Participantes, Investidores). Novas APIs de Negocios (PRD atualizado). Inicio das pages de gestao.
**Periodo:** 12/04/2026 - 19/04/2026
**Milestone:** Coleta completa (15/04)

**Dependencias:**
- Bloqueado por: S06 (respostas, formulario publico)
- Bloqueia: S08 (frontend gestao, sessoes, presenca)

---

### T-043: API Projetos -- CRUD completo
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend
- **Descricao:** CRUD de projetos (antigo programas): GET list (search, paginacao, ordenar por dataInicio DESC), GET detail (investidores populados), POST (criar com investidorIds), PUT (partial update), DELETE (cascade). **Nomenclatura: Programas -> Projetos, Patrocinadores -> Investidores.**
- **Subtarefas:**
  - [ ] GET /api/programas (list com search e paginacao)
  - [ ] GET /api/programas/[id] (detail com investidores)
  - [ ] POST /api/programas (criar com investidorIds)
  - [ ] PUT /api/programas/[id] (partial update)
  - [ ] DELETE /api/programas/[id] (cascade)
- **Checklist de conclusao:**
  - [ ] CRUD completo funcional
  - [ ] dataFim > dataInicio validado
  - [ ] Cascade deleta participantes, instancias, sessoes
- **Criterios de aceitacao:**
  - AC1: CRUD completo com validacao de datas
  - AC2: Cascade delete funcional
- **Referencia:** BR-PRG-002 a BR-PRG-009

---

### T-044: API Participantes -- CRUD + bulk import
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** backend
- **Descricao:** CRUD de participantes: GET (filtro por tags, status, search, paginacao), GET detail, POST (criar com tags -- negocio_id obrigatorio), PUT (update + status transitions), DELETE (cascade), POST bulk (CSV max 5000, transacional). **Participante exige negocio_id conforme PRD.**
- **Subtarefas:**
  - [ ] GET /api/participantes (list com filtros)
  - [ ] GET /api/participantes/[id] (detail com relacoes)
  - [ ] POST /api/participantes (negocio_id obrigatorio)
  - [ ] PUT /api/participantes/[id] (update + status transitions)
  - [ ] DELETE /api/participantes/[id] (cascade)
  - [ ] POST /api/participantes/bulk (CSV import transacional)
- **Checklist de conclusao:**
  - [ ] Filtro por tags funcional (AND dentro do tipo, OR entre tipos)
  - [ ] Bulk import transacional
  - [ ] Email unico dentro do projeto
  - [ ] negocio_id obrigatorio no POST
- **Criterios de aceitacao:**
  - AC1: POST rejeita participante sem negocio_id
  - AC2: Filtro por tags com logica AND/OR
  - AC3: Bulk import transacional (tudo ou nada)
- **Referencia:** PRD secao Participantes, BR-PRT-001 a BR-PRT-014
- **Depende de:** T-082 (FK negocio_id)

---

### T-045: API Investidores -- CRUD
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** backend
- **Descricao:** CRUD de investidores (antigo patrocinadores): GET (list com search, paginacao), POST (nome + logo), PUT (update). **Nomenclatura: Patrocinadores -> Investidores.**
- **Subtarefas:**
  - [ ] GET /api/patrocinadores (list)
  - [ ] POST /api/patrocinadores (criar)
  - [ ] PUT /api/patrocinadores/[id] (update)
- **Checklist de conclusao:**
  - [ ] CRUD funcional
  - [ ] Logo upload via Supabase Storage
- **Criterios de aceitacao:**
  - AC1: CRUD completo funcional
  - AC2: Upload de logo funcional
- **Referencia:** BR-PAT-001 a BR-PAT-007

---

### T-083: API Negocios CRUD -- Pre-cadastro manual (NOVO)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, prd-update
- **Descricao:** CRUD de negocios para pre-cadastro manual pelo gestor. GET list (filtro por projeto, status, search), GET detail (com participantes), POST (nome, lider_nome, lider_email, telefone -- status inicia como pre_selecionado), PUT (update), DELETE (cascade). Link de diagnostico e unico por projeto (nao por negocio).
- **Subtarefas:**
  - [ ] GET /api/negocios?projetoId= (list com participantes e status)
  - [ ] GET /api/negocios/[id] (detail com participantes vinculados)
  - [ ] POST /api/negocios (pre-cadastro: nome, lider_nome, lider_email, telefone)
  - [ ] PUT /api/negocios/[id] (update)
  - [ ] DELETE /api/negocios/[id] (cascade deleta participantes)
- **Checklist de conclusao:**
  - [ ] POST cria negocio com status pre_selecionado
  - [ ] Validacao de email do lider (unico por projeto)
  - [ ] Cascade delete funcional
- **Criterios de aceitacao:**
  - AC1: Negocio criado com status pre_selecionado
  - AC2: Email do lider unico dentro do projeto (409 se duplicado)
  - AC3: GET retorna negocios com contagem de participantes
  - AC4: DELETE cascade deleta participantes vinculados
- **Referencia:** PRD secao Negocios
- **Depende de:** T-081 (tabela negocios)
- **Bloqueia:** T-084 (Diagnostico Negocio), T-087 (NegociosList FE)

---

### T-084: API Diagnostico do Negocio -- Link unico por projeto (NOVO)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** backend, prd-update
- **Descricao:** Endpoint para diagnostico do negocio via link unico por projeto. Quando o lider do negocio preenche o diagnostico com lista de membros, o sistema: (1) valida emails dos membros, (2) atualiza status do negocio para selecionado, (3) cria participantes automaticamente vinculados ao negocio. O link de diagnostico e compartilhado -- todos os negocios do projeto usam o mesmo link.
- **Subtarefas:**
  - [ ] GET /api/diagnostico/[projetoLinkId] -- retorna formulario de diagnostico do projeto
  - [ ] POST /api/diagnostico/[projetoLinkId]/responder -- recebe: negocio_id (ou email do lider para lookup), respostas do diagnostico, lista de membros (nome, email, telefone)
  - [ ] Validar emails dos membros (formato e duplicatas)
  - [ ] Atualizar negocio.status para selecionado
  - [ ] Atualizar negocio.diagnostico_respondido para true
  - [ ] Auto-criar participantes com status pre_selecionado vinculados ao negocio
  - [ ] Gerar link unico de diagnostico por projeto (nanoid)
  - [ ] PUT /api/programas/[id]/gerar-link-diagnostico (gera/regenera o link)
- **Checklist de conclusao:**
  - [ ] Diagnostico cria participantes automaticamente
  - [ ] Status do negocio atualizado para selecionado
  - [ ] Emails validados (formato e duplicatas)
  - [ ] Link unico por projeto funcional
- **Criterios de aceitacao:**
  - AC1: Lider preenche diagnostico e participantes sao criados automaticamente
  - AC2: Negocio muda de pre_selecionado para selecionado
  - AC3: Emails duplicados sao rejeitados com erro especifico
  - AC4: Link de diagnostico e unico por projeto (nao por negocio)
  - AC5: Participantes criados tem status pre_selecionado e negocio_id preenchido
- **Referencia:** PRD secao Diagnostico, PRD secao Status Negocio
- **Depende de:** T-083 (API Negocios), T-082 (FK participantes)
- **Bloqueia:** T-085 (Diagnostico Individual), T-089 (Copy Link FE)

---

### T-085: API Diagnostico Individual -- Participante responde (NOVO)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend, prd-update
- **Descricao:** Endpoint para diagnostico individual do participante. Apos ser criado automaticamente via diagnostico do negocio, o participante recebe link para responder seu diagnostico individual. Ao responder, status muda de pre_selecionado para selecionado.
- **Subtarefas:**
  - [ ] GET /api/diagnostico-individual/[linkId] -- retorna formulario individual
  - [ ] POST /api/diagnostico-individual/[linkId]/responder -- recebe respostas
  - [ ] Atualizar participante.status para selecionado
  - [ ] Validar que participante existe e tem status pre_selecionado
- **Checklist de conclusao:**
  - [ ] Diagnostico individual atualiza status
  - [ ] Validacao de status pre_selecionado
- **Criterios de aceitacao:**
  - AC1: Participante responde diagnostico e status muda para selecionado
  - AC2: Participante com status diferente de pre_selecionado e rejeitado
  - AC3: Respostas salvas corretamente
- **Referencia:** PRD secao Status Participante
- **Depende de:** T-084 (Diagnostico Negocio cria participantes)
- **Bloqueia:** T-086 (Ativacao Manual)

---

### T-086: API Ativacao Manual -- Gestor ativa participante (NOVO)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** backend, prd-update
- **Descricao:** Endpoint para ativacao manual de participante pelo gestor. Apos o participante responder diagnostico individual (status selecionado), o gestor valida o termo de aceite e muda status para ativo manualmente.
- **Subtarefas:**
  - [ ] PUT /api/participantes/[id]/ativar
  - [ ] Validar que status atual e selecionado
  - [ ] Atualizar status para ativo
  - [ ] Registrar data de ativacao
  - [ ] PUT /api/participantes/bulk-ativar (ativacao em lote)
- **Checklist de conclusao:**
  - [ ] Ativacao manual funcional
  - [ ] Validacao de status selecionado
- **Criterios de aceitacao:**
  - AC1: Gestor ativa participante de selecionado para ativo
  - AC2: Tentativa de ativar participante com status diferente de selecionado retorna erro 422
  - AC3: Ativacao em lote funcional
- **Referencia:** PRD secao Status Participante, PRD secao Ativacao
- **Depende de:** T-085 (Diagnostico Individual)

---

### T-046: ProjetosList page (antigo ProgramasList)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** Listagem de projetos (antigo programas) com ProjetoCard (nome, periodo, presenca, investidores) + DataTable + filtros + busca. **Nomenclatura: Programas -> Projetos, Patrocinadores -> Investidores.**
- **Subtarefas:**
  - [ ] Implementar ProjetoCard com metricas
  - [ ] Implementar DataTable com sort
  - [ ] Implementar busca por nome
  - [ ] Metricas no topo (fold/unfold)
- **Checklist de conclusao:**
  - [ ] Cards com metricas
  - [ ] DataTable com sort e busca
- **Criterios de aceitacao:**
  - AC1: Lista projetos com cards e metricas
  - AC2: Busca e filtro funcionais
- **Referencia:** BR-PRG-008, BR-PRG-010

---

### T-047: ProjetoForm page (antigo ProgramaForm)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** Formulario criar/editar projeto: nome, descricao, datas (DateRangePicker), totalInscritos, quantidadeVagas, investidores (MultiSelect checkbox). **Nomenclatura: Patrocinadores -> Investidores.**
- **Subtarefas:**
  - [ ] Implementar formulario com RHF + Zod
  - [ ] DateRangePicker para inicio/fim
  - [ ] MultiSelect de investidores
- **Checklist de conclusao:**
  - [ ] RHF + Zod validation funcional
  - [ ] DateRangePicker seleciona inicio/fim
  - [ ] MultiSelect de investidores funcional
- **Criterios de aceitacao:**
  - AC1: Formulario cria/edita projeto com sucesso
  - AC2: Validacao Zod funcional
- **Referencia:** BR-PRG-002, BR-PRG-004, BR-PRG-009

---

### T-048: ProjetoDetail page -- Estrutura de tabs (antigo ProgramaDetail)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** Pagina detalhe do projeto com tabs atualizadas conforme PRD: **Negocios, Participantes, Aulas (presenca), Pesquisas, Satisfacao.** Header com nome, periodo, botao editar. **Navegacao atualizada: Negocios e a primeira tab.**
- **Subtarefas:**
  - [ ] Implementar header com dados do projeto
  - [ ] Implementar 5 tabs: Negocios, Participantes, Aulas, Pesquisas, Satisfacao
  - [ ] Breadcrumb funcional
  - [ ] Botao editar
- **Checklist de conclusao:**
  - [ ] 5 tabs navegaveis
  - [ ] Header com dados do projeto
  - [ ] Breadcrumb funcional
- **Criterios de aceitacao:**
  - AC1: Tabs refletem nova navegacao (Negocios como primeira tab)
  - AC2: Breadcrumb funcional
- **Referencia:** PRD secao Navegacao, BR-PRG-005

---

### Criterios de aceite do Sprint S07

- [ ] API Projetos CRUD completo
- [ ] API Participantes CRUD + bulk import (negocio_id obrigatorio)
- [ ] API Investidores CRUD funcional
- [ ] API Negocios CRUD funcional (pre-cadastro manual)
- [ ] API Diagnostico do Negocio: link unico por projeto, auto-criacao de participantes
- [ ] API Diagnostico Individual: participante responde e status muda para selecionado
- [ ] API Ativacao Manual: gestor ativa participante de selecionado para ativo
- [ ] Pages de Projetos (list, form, detail com tabs atualizadas)

---

## S08 -- Semana 8 (19/04 - 26/04) | Fase 3a: Gestao (cont.) -- Frontend + Sessoes + Negocios FE

**Objetivo:** Frontend de gestao completo: participantes, investidores, negocios (novo), sessoes, presenca, motor de risco. Loading/error states.
**Periodo:** 19/04/2026 - 26/04/2026
**Milestone:** Entrega de Desenvolvimento (26/04)

**Dependencias:**
- Bloqueado por: S07 (APIs de gestao, API Negocios)
- Bloqueia: S09 (deploy, impacto)

---

### T-049: ParticipantesList tab + ImportCSV
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** frontend
- **Descricao:** Tab dentro do projeto: DataTable de participantes (nome, email, status, presenca, risco, negocio, WhatsApp). Drawer add/edit. Botao "Importar CSV" abre CsvImportWizard. **Coluna negocio obrigatoria na tabela. Status reflete novo flow (pre_selecionado, selecionado, ativo).**
- **Subtarefas:**
  - [ ] Implementar DataTable com colunas atualizadas
  - [ ] Drawer para add/edit participante (negocio_id obrigatorio)
  - [ ] Integracao com CsvImportWizard
  - [ ] Status badge com novos valores
  - [ ] Link WhatsApp
- **Checklist de conclusao:**
  - [ ] DataTable com todas as colunas (incluindo negocio)
  - [ ] CSV import funcional
  - [ ] Status badge colorido para todos os status
- **Criterios de aceitacao:**
  - AC1: DataTable exibe negocio vinculado
  - AC2: Add participante exige selecao de negocio
  - AC3: CSV import funcional via wizard
- **Referencia:** BR-PRT-009, BR-PRT-014, PRD secao Participantes

---

### T-050: ParticipanteDetail page
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** Detalhe individual: dados pessoais, tags, negocio vinculado, historico de respostas, presencas, nivel de risco. **Exibe negocio vinculado.**
- **Subtarefas:**
  - [ ] Cards com metricas
  - [ ] Lista de respostas
  - [ ] Lista de presencas
  - [ ] RiskBadge
  - [ ] Info do negocio vinculado
- **Checklist de conclusao:**
  - [ ] Dados do participante renderizados
  - [ ] Negocio vinculado visivel
  - [ ] RiskBadge funcional
- **Criterios de aceitacao:**
  - AC1: Exibe todos os dados do participante incluindo negocio
  - AC2: RiskBadge reflete nivel de risco
- **Referencia:** BR-PRT-010, BR-PRT-013

---

### T-051: InvestidoresList page + InvestidorDetail drawer (antigo PatrocinadoresList)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** Listagem global de investidores (antigo patrocinadores) com InvestidorCard (nome, logo, projetos vinculados). Detail abre em drawer: nome editavel, projetos listados. **Nomenclatura: Patrocinadores -> Investidores.**
- **Subtarefas:**
  - [ ] Implementar DataTable + cards
  - [ ] Drawer com nome editavel
  - [ ] Lista de projetos vinculados
- **Checklist de conclusao:**
  - [ ] DataTable + cards renderizam
  - [ ] Drawer abre com edicao funcional
- **Criterios de aceitacao:**
  - AC1: Lista investidores com cards
  - AC2: Drawer com edicao inline do nome
- **Referencia:** BR-PAT-001, BR-PAT-003, BR-PAT-004

---

### T-087: NegociosList page -- Tabela com drawer (NOVO)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** frontend, prd-update
- **Descricao:** Pagina/tab de listagem de negocios dentro do projeto. DataTable com colunas: nome do negocio, nome do lider, status (pre_selecionado/selecionado), status do diagnostico (respondido/pendente), numero de membros/participantes, acoes. Drawer lateral com 2 tabs: Cadastro (dados do negocio) e Pesquisas (diagnosticos vinculados).
- **Subtarefas:**
  - [ ] Implementar DataTable com colunas: nome, lider, status, diagnostico, num membros, acoes
  - [ ] StatusBadge para status do negocio (pre_selecionado = amarelo, selecionado = verde)
  - [ ] Badge de diagnostico (respondido = check verde, pendente = cinza)
  - [ ] Contagem de membros/participantes
  - [ ] Drawer lateral com 2 tabs
  - [ ] Tab Cadastro: dados do negocio (nome, lider_nome, lider_email, telefone, status)
  - [ ] Tab Pesquisas: lista de diagnosticos respondidos pelo negocio
  - [ ] Botoes de acao: editar, excluir (com ConfirmDialog)
- **Checklist de conclusao:**
  - [ ] DataTable renderiza com todas as colunas
  - [ ] Drawer com 2 tabs funcional
  - [ ] StatusBadge para status do negocio
  - [ ] Contagem de participantes por negocio
- **Criterios de aceitacao:**
  - AC1: Tabela exibe negocios com todas as colunas especificadas
  - AC2: Drawer abre com tabs Cadastro e Pesquisas
  - AC3: Status badge diferencia pre_selecionado de selecionado
  - AC4: Contagem de membros reflete participantes vinculados ao negocio
- **Referencia:** PRD secao Negocios, PRD secao Navegacao
- **Depende de:** T-083 (API Negocios)

---

### T-088: NegocioForm dialog -- Pre-cadastro (NOVO)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** frontend, prd-update
- **Descricao:** Dialog para pre-cadastro manual de negocio pelo gestor. Campos: nome do negocio, nome do lider, email do lider, telefone. Validacao Zod. Apos criar, negocio aparece na lista com status pre_selecionado.
- **Subtarefas:**
  - [ ] Implementar Dialog com formulario
  - [ ] Campos: nome negocio, nome lider, email lider, telefone
  - [ ] Validacao Zod (email valido, campos obrigatorios)
  - [ ] Integracao com POST /api/negocios
  - [ ] Toast de sucesso apos criacao
- **Checklist de conclusao:**
  - [ ] Dialog funcional com validacao
  - [ ] Negocio criado aparece na lista
- **Criterios de aceitacao:**
  - AC1: Dialog cria negocio com todos os campos
  - AC2: Validacao impede submit com email invalido
  - AC3: Negocio criado tem status pre_selecionado
- **Referencia:** PRD secao Pre-cadastro de Negocios
- **Depende de:** T-083 (API Negocios)

---

### T-089: Copy Diagnostico Link component (NOVO)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 2 pontos
- **Tags:** frontend, prd-update
- **Descricao:** Componente para copiar o link unico de diagnostico do projeto. Exibe o link gerado e botao de copy to clipboard com feedback visual (toast). O link e unico por projeto -- todos os negocios pre-cadastrados do projeto usam o mesmo link.
- **Subtarefas:**
  - [ ] Implementar componente CopyDiagnosticoLink
  - [ ] Exibir link com botao copy
  - [ ] Toast de confirmacao ao copiar
  - [ ] Botao para gerar/regenerar link (chama PUT /api/programas/[id]/gerar-link-diagnostico)
  - [ ] Indicador visual de link ativo vs nao gerado
- **Checklist de conclusao:**
  - [ ] Copy to clipboard funcional
  - [ ] Toast de confirmacao
  - [ ] Botao gerar/regenerar
- **Criterios de aceitacao:**
  - AC1: Copy to clipboard funcional com feedback visual
  - AC2: Link reflete projeto (nao negocio individual)
  - AC3: Botao regenerar atualiza o link
- **Referencia:** PRD secao Diagnostico, T-084
- **Depende de:** T-084 (API Diagnostico)

---

### T-090: DiagnosticoPage -- Pagina publica de diagnostico do negocio (NOVO)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** frontend, prd-update
- **Descricao:** Pagina publica em `/diagnostico/:projetoId` (sem sidebar, layout minimo). Formulario de 3 paginas com validacao de email do lider. Fluxo: (1) email validation → (2) 3 paginas de diagnostico → (3) lista de membros → (4) confirmacao. Bloqueia re-submissao se negocio ja respondeu.
- **Subtarefas:**
  - [ ] Criar rota /diagnostico/[projetoId]/page.tsx com layout minimo (sem sidebar)
  - [ ] Step 0: Input de email + validacao contra API (email deve estar pre-cadastrado)
  - [ ] Step 1 - Informacoes Basicas: faturamento anual (select ranges), numero funcionarios (select ranges), area de atuacao (text)
  - [ ] Step 2 - Perfil do Negocio: tempo de mercado (select), nivel de digitalizacao (select), principal desafio (textarea)
  - [ ] Step 3 - Expectativas: expectativa com o projeto (textarea), conhece programas similares (radio sim/nao)
  - [ ] Step 4 - Membros: tabela dinamica com campos nome, email, cargo (add/remove rows)
  - [ ] Navegacao entre steps (anterior/proximo) com validacao por step
  - [ ] Tela de sucesso apos envio
  - [ ] Tela de erro: "Email nao cadastrado" ou "Diagnostico ja respondido"
  - [ ] Responsividade mobile
- **Checklist de conclusao:**
  - [ ] Email validation funcional
  - [ ] 3 paginas + membros funcionais
  - [ ] Re-submissao bloqueada
  - [ ] Telas de erro e sucesso
- **Criterios de aceitacao:**
  - AC1: Apenas emails pre-cadastrados podem acessar o formulario
  - AC2: Re-submissao e bloqueada com mensagem de erro clara
  - AC3: Dados dos membros sao enviados para criacao automatica de participantes
  - AC4: Funciona em mobile
- **Referencia:** PRD secao 5.3, BR-DIG-001 a BR-DIG-008, Figma Make v1.0.2 DiagnosticoPage
- **Depende de:** T-084 (API Diagnostico)

---

### T-091: Drawer 2 abas -- Negocio e Participante (NOVO)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** frontend, prd-update
- **Descricao:** Implementar pattern de drawer com 2 abas (Cadastro + Pesquisas) para Negocio e Participante. Drawer de Negocio: Aba 1 mostra dados do pre-cadastro (editaveis) + dados do diagnostico (read-only apos preenchimento). Aba 2 mostra historico de pesquisas. Drawer de Participante: Aba 1 mostra dados pessoais + dados diagnostico individual. Aba 2 mostra historico de pesquisas.
- **Subtarefas:**
  - [ ] Implementar DetalhesNegocioDrawer com Tabs (Cadastro | Pesquisas)
  - [ ] Aba Cadastro: form com dados pre-cadastro editaveis + secao diagnostico read-only
  - [ ] Aba Pesquisas: tabela de pesquisas respondidas (nome, tipo, status, respostas, NPS)
  - [ ] Implementar DetalhesParticipanteDrawer com Tabs (Cadastro | Pesquisas)
  - [ ] Aba Cadastro: dados pessoais completos (nome, email, telefone, cpf, nascimento, genero, endereco, cargo)
  - [ ] Aba Pesquisas: historico de pesquisas do participante
  - [ ] Dados do diagnostico nunca ficam vazios se ja respondido
  - [ ] Acao "Visualizar detalhes" na pesquisa abre tela de respostas existente
- **Checklist de conclusao:**
  - [ ] Drawers com 2 abas funcionais
  - [ ] Dados diagnostico read-only apos preenchimento
  - [ ] Historico de pesquisas com acao de visualizar
- **Criterios de aceitacao:**
  - AC1: Drawer de negocio mostra dados pre-cadastro + diagnostico
  - AC2: Drawer de participante mostra dados pessoais completos
  - AC3: Aba Pesquisas lista historico com tipo, NPS e status
  - AC4: Dados preenchidos nunca aparecem vazios
- **Referencia:** PRD secoes 9-10, BR-NEG-009, Figma Make v1.0.2 fractus-ajustes.md
- **Depende de:** T-087 (NegociosList), T-083 (API Negocios)

---

### T-092: Campos expandidos Projeto -- cargaHoraria e modalidade (NOVO)
- **Responsavel:** Backend (Douglas) + Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** backend, frontend, prd-update
- **Descricao:** Adicionar campos `carga_horaria` (text) e `modalidade` (text NOT NULL, enum: Presencial/Online/Hibrido) a tabela projetos. Atualizar API e formulario de criacao/edicao de projeto.
- **Subtarefas:**
  - [ ] Migration: adicionar colunas carga_horaria (text) e modalidade (text NOT NULL DEFAULT 'Presencial')
  - [ ] Atualizar Zod schema de Projeto com novos campos
  - [ ] Atualizar API POST/PUT /api/projetos
  - [ ] Atualizar NovoProgramaDrawer com campos: carga horaria (text), modalidade (radio: Presencial/Online/Hibrido)
  - [ ] Exibir modalidade no header do ProjetoDetail
- **Checklist de conclusao:**
  - [ ] Migration aplicada
  - [ ] API aceita e retorna novos campos
  - [ ] Formulario de projeto inclui campos
- **Criterios de aceitacao:**
  - AC1: Modalidade e obrigatoria com 3 opcoes
  - AC2: Carga horaria e opcional
  - AC3: Dados aparecem na visualizacao do projeto
- **Referencia:** Figma Make v1.0.2 NovoProgramaDrawer
- **Depende de:** T-009 (tabela projetos)

---

### T-052: API Sessoes + Presenca -- CRUD completo
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** backend
- **Descricao:** CRUD de sessoes: GET list (com presencas, ordenar por data DESC), POST (criar com snapshot denominador), PUT (update + presenca array), DELETE (cascade).
- **Subtarefas:**
  - [ ] GET /api/sessoes?programaId= (list com presencas)
  - [ ] POST /api/sessoes (criar com snapshot denominador)
  - [ ] PUT /api/sessoes/[id] (update + presenca array)
  - [ ] DELETE /api/sessoes/[id] (cascade)
- **Checklist de conclusao:**
  - [ ] POST fixa snapshot do denominador
  - [ ] PUT recalcula percentualPresenca
  - [ ] Cascade deleta presencas
- **Criterios de aceitacao:**
  - AC1: Denominador fixado no momento da criacao
  - AC2: Recalculo de presenca funcional
  - AC3: Cascade delete funcional
- **Referencia:** BR-PRS-001 a BR-PRS-016

---

### T-053: Recalculo presenca -- Service function
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 3 pontos
- **Tags:** backend
- **Descricao:** Service function: recalcular percentualPresenca e faltasConsecutivas de cada participante apos mutacao em presenca.
- **Subtarefas:**
  - [ ] Implementar calculo de percentualPresenca
  - [ ] Implementar calculo de faltasConsecutivas
  - [ ] Integrar com PUT/DELETE de sessoes
- **Checklist de conclusao:**
  - [ ] percentualPresenca = presentes / total sessoes * 100
  - [ ] faltasConsecutivas conta sequencia continua
- **Criterios de aceitacao:**
  - AC1: Percentual calculado corretamente
  - AC2: Faltas consecutivas calculadas corretamente
- **Referencia:** BR-PRS-013, RC-14

---

### T-078: Brainstorming gate -- Motor de risco
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** backend, planejamento
- **Descricao:** Gate obrigatorio antes de implementar motor de risco. Explorar 2-3 abordagens: (1) portar riskCalculator.ts do prototipo, (2) ML-based, (3) rule-based configuravel. Documentar trade-offs.
- **Subtarefas:**
  - [ ] Analisar abordagem 1: portar do prototipo
  - [ ] Analisar abordagem 2: ML-based
  - [ ] Analisar abordagem 3: rule-based configuravel
  - [ ] Documentar trade-offs e decisao
- **Checklist de conclusao:**
  - [ ] Documento com 2-3 abordagens
  - [ ] Decisao final documentada
- **Criterios de aceitacao:**
  - AC1: Documento com trade-offs aprovado
- **Referencia:** Fluxo 6 business-rules.md

---

### T-054: Motor de risco -- Server-side
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend
- **Descricao:** Portar riskCalculator.ts do figma-make para server-side. 7 fatores, 4 niveis (baixo 0-25, medio 26-50, alto 51-75, critico 76-100). Expor como campo computado na API de participantes.
- **Subtarefas:**
  - [ ] Portar riskCalculator.ts
  - [ ] Implementar 7 fatores de risco
  - [ ] Implementar 4 niveis
  - [ ] Integrar com GET /api/participantes
- **Checklist de conclusao:**
  - [ ] Logica identica ao prototipo
  - [ ] Retorna { score, level, factors[] }
- **Criterios de aceitacao:**
  - AC1: Calculo identico ao prototipo
  - AC2: 4 niveis de risco funcional
- **Referencia:** Fluxo 6 business-rules.md
- **Depende de:** T-078 (brainstorming gate)

---

### T-055: RiskBadge componente
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 2 pontos
- **Tags:** frontend
- **Descricao:** Badge de nivel de risco: Baixo (verde), Medio (amarelo), Alto (laranja), Critico (vermelho). Tooltip com fatores.
- **Subtarefas:**
  - [ ] Implementar badge com 4 cores
  - [ ] Tooltip com fatores ativos
- **Checklist de conclusao:**
  - [ ] 4 cores renderizam
  - [ ] Tooltip lista fatores
- **Criterios de aceitacao:**
  - AC1: Badge renderiza corretamente para cada nivel
  - AC2: Tooltip exibe fatores de risco
- **Referencia:** lib/risk-calculator.ts

---

### T-056: PresencaTab + SessaoForm
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** frontend
- **Descricao:** Tab Aulas/Presenca dentro do projeto: lista de sessoes (SessaoCard), criar sessao (Sheet), matriz presenca (participantes x sessoes), modo corretivo manual, duas visualizacoes (tabela por sessao vs matriz por aluno).
- **Subtarefas:**
  - [ ] Implementar lista de sessoes com SessaoCard
  - [ ] Implementar SessaoForm (Sheet: nome, data, incluir NPS?)
  - [ ] Implementar matriz presenca
  - [ ] Modo corretivo manual
  - [ ] Duas visualizacoes: tabela por sessao e matriz por aluno
- **Checklist de conclusao:**
  - [ ] Criar sessao com/sem NPS
  - [ ] Snapshot do denominador
  - [ ] Checkbox presenca funcional
- **Criterios de aceitacao:**
  - AC1: Criar sessao funcional
  - AC2: Matriz presenca renderiza corretamente
  - AC3: Duas visualizacoes funcionais
- **Referencia:** BR-PRS-001 a BR-PRS-017

---

### T-057: PesquisasTab + SatisfacaoTab (antigo FormulariosTab)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** Tab Pesquisas (antigo Formularios): lista instancias tipo diagnostico_*. Tab Satisfacao: lista instancias tipo satisfacao_nps, vinculo com sessao. **Nomenclatura: Formularios -> Pesquisas.**
- **Subtarefas:**
  - [ ] Tab Pesquisas com lista de instancias
  - [ ] Tab Satisfacao com vinculo a sessao
  - [ ] Botao criar instancia (abre InstanciaForm)
  - [ ] Cards X/Y respostas
- **Checklist de conclusao:**
  - [ ] Tabs listam instancias filtradas por tipo
  - [ ] Botao criar funcional
- **Criterios de aceitacao:**
  - AC1: Pesquisas tab lista instancias de diagnostico
  - AC2: Satisfacao tab lista instancias de NPS
- **Referencia:** BR-ATR-001, BR-TPL-003

---

### T-058: API Negocios -- CRUD (legado, mesclado com T-083)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** backend
- **Descricao:** **Nota: Esta task foi expandida e substituida pela T-083 (API Negocios CRUD com campos do PRD). Manter ID para rastreabilidade. Funcionalidade legada de rename e visualizacao simples incorporada na T-083.**
- **Subtarefas:**
  - [ ] Verificar que T-083 cobre todos os requisitos desta task
  - [ ] Marcar como concluida quando T-083 estiver pronta
- **Checklist de conclusao:**
  - [ ] Funcionalidade coberta por T-083
- **Criterios de aceitacao:**
  - AC1: T-083 implementa todos os requisitos
- **Referencia:** BR-NEG-001 a BR-NEG-009
- **Depende de:** T-083

---

### T-059: NegociosTab (legado, mesclado com T-087)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 2 pontos
- **Tags:** frontend
- **Descricao:** **Nota: Esta task foi expandida e substituida pela T-087 (NegociosList com drawer e tabs). Manter ID para rastreabilidade.**
- **Subtarefas:**
  - [ ] Verificar que T-087 cobre todos os requisitos desta task
- **Checklist de conclusao:**
  - [ ] Funcionalidade coberta por T-087
- **Criterios de aceitacao:**
  - AC1: T-087 implementa todos os requisitos
- **Referencia:** BR-NEG-004, BR-NEG-009
- **Depende de:** T-087

---

### T-060: Loading + Error states globais
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** frontend, qa
- **Descricao:** Adicionar loading.tsx e error.tsx em todos os segmentos de rota. Skeleton components para listas e cards. Antecipado da Fase 4 para S08 para que todas as pages da Fase 3a ja tenham loading states.
- **Subtarefas:**
  - [ ] Criar loading.tsx para cada segmento de rota
  - [ ] Criar error.tsx para cada segmento de rota
  - [ ] Skeleton components para tabelas
  - [ ] Skeleton components para cards
- **Checklist de conclusao:**
  - [ ] Todas as rotas tem loading/error states
  - [ ] Skeletons para tabelas e cards
- **Criterios de aceitacao:**
  - AC1: Todas as rotas da plataforma tem loading state
  - AC2: Todas as rotas tem error boundary
- **Referencia:** RC-08, RC-09

---

### Criterios de aceite do Sprint S08

- [ ] ParticipantesList com negocio obrigatorio e CSV import
- [ ] InvestidoresList com drawer funcional
- [ ] NegociosList com tabela completa e drawer (Cadastro + Pesquisas tabs)
- [ ] NegocioForm dialog de pre-cadastro funcional
- [ ] Copy Diagnostico Link component funcional
- [ ] Sessoes + Presenca CRUD completo (BE + FE)
- [ ] Motor de risco funcional (BE + RiskBadge FE)
- [ ] Loading/Error states em todas as rotas
- [ ] Marco: Entrega de Desenvolvimento (26/04)

---

## S09 -- Semana 9 (26/04 - 03/05) | Fase 3a (finalizacao) + Fase 3b: Impacto inicio

**Objetivo:** Deploy staging, APIs de impacto, expiracao de instancias.
**Periodo:** 26/04/2026 - 03/05/2026
**Milestone:** Gestao completa (03/05)

**Dependencias:**
- Bloqueado por: S08 (gestao FE, sessoes, presenca)
- Bloqueia: S10 (impacto FE, paineis)

> **ATENCAO:** Regras de negocio de Impacto e Painel do Investidor podem nao estar 100% definidas. Brainstorming gates obrigatorios antes de implementar.

---

### T-061: Deploy Vercel + Supabase producao
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** infra, devops
- **Descricao:** Configurar projeto Vercel, environment variables de producao, dominio customizado. Supabase projeto de producao com migrations aplicadas.
- **Subtarefas:**
  - [ ] Configurar projeto Vercel
  - [ ] Configurar environment variables
  - [ ] Configurar dominio customizado
  - [ ] Criar projeto Supabase de producao
  - [ ] Aplicar migrations
  - [ ] Executar seed de producao
- **Checklist de conclusao:**
  - [ ] App acessivel via dominio
  - [ ] Supabase producao com schema atualizado
- **Criterios de aceitacao:**
  - AC1: App acessivel via URL de producao
  - AC2: Supabase producao com todas as tabelas (incluindo negocios)
- **Referencia:** vercel.json

---

### T-062: API Impacto -- Indicadores
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend
- **Descricao:** GET /api/impacto/indicadores?projetoId=&tagsFiltro= -- agregar respostas diagnostico_inicial vs diagnostico_final para campos com isIndicador. Calcular delta absoluto e percentual por indicador.
- **Subtarefas:**
  - [ ] Implementar agregacao de respostas por indicador
  - [ ] Calcular delta absoluto e percentual
  - [ ] Filtrar por projeto e tags
- **Checklist de conclusao:**
  - [ ] Retorna array de indicadores com deltas
- **Criterios de aceitacao:**
  - AC1: Retorna indicadores com valorInicial, valorFinal, deltaAbsoluto, deltaPercentual
  - AC2: Filtro por projeto e tags funcional
- **Referencia:** BR-IMP-001 a BR-IMP-006

---

### T-063: API Impacto -- Dashboard
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P0 (critico)
- **Estimativa:** 5 pontos
- **Tags:** backend
- **Descricao:** GET /api/impacto/dashboard?projetoId= -- estatisticas agregadas: totalParticipantes, mediaPresenca, taxaConclusao, taxaEvasao, distribuicaoRisco. GET /api/impacto/evolucao?indicadorNome= -- data points para graficos.
- **Subtarefas:**
  - [ ] Implementar endpoint dashboard
  - [ ] Implementar endpoint evolucao
  - [ ] Calcular metricas agregadas
- **Checklist de conclusao:**
  - [ ] Dashboard retorna metricas
  - [ ] Evolucao retorna data points
- **Criterios de aceitacao:**
  - AC1: Dashboard retorna metricas agregadas corretas
  - AC2: Evolucao retorna data points para graficos
- **Referencia:** BR-IMP-004

---

### T-064: API Paineis -- CRUD
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** backend
- **Descricao:** CRUD de paineis customizados: GET list, POST criar, PUT update, DELETE. Tipos de visualizacao: cards, tabela, grafico barras, grafico linhas.
- **Subtarefas:**
  - [ ] GET /api/paineis (list)
  - [ ] POST /api/paineis (criar)
  - [ ] PUT /api/paineis/[id] (update)
  - [ ] DELETE /api/paineis/[id]
- **Checklist de conclusao:**
  - [ ] CRUD funcional
  - [ ] 4 tipos de visualizacao suportados
- **Criterios de aceitacao:**
  - AC1: CRUD completo funcional
  - AC2: 4 tipos de visualizacao: cards, tabela, barras, linhas
- **Referencia:** BR-IMP-007

---

### T-065: Expirar instancias -- Lazy check
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 2 pontos
- **Tags:** backend
- **Descricao:** Na leitura de instancia, verificar se prazoValidade < now() e marcar como expirado. Link exibe mensagem generica.
- **Subtarefas:**
  - [ ] Implementar lazy check no GET
  - [ ] Marcar instancia como expirada
  - [ ] Retornar mensagem generica no link publico
- **Checklist de conclusao:**
  - [ ] Instancia expirada retorna status expirado
  - [ ] Link exibe mensagem
- **Criterios de aceitacao:**
  - AC1: Instancia com prazo expirado marcada automaticamente
  - AC2: Link publico exibe mensagem de expiracao
- **Referencia:** BR-ATR-008

---

### Criterios de aceite do Sprint S09

- [ ] Deploy Vercel + Supabase producao funcional
- [ ] API Impacto Indicadores retorna deltas corretos
- [ ] API Impacto Dashboard retorna metricas agregadas
- [ ] API Paineis CRUD funcional
- [ ] Instancias expiram automaticamente (lazy check)
- [ ] Marco: Gestao completa (03/05)

---

## S10 -- Semana 10 (03/05 - 10/05) | Fase 3b: Impacto + Paineis

**Objetivo:** Dashboard de impacto, paineis customizados, painel do investidor.
**Periodo:** 03/05/2026 - 10/05/2026
**Milestone:** Plataforma no ar (09/05)

**Dependencias:**
- Bloqueado por: S09 (APIs impacto, deploy)
- Bloqueia: S11 (QA, polish)

---

### T-079: Brainstorming gate -- Dashboard de impacto
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** frontend, planejamento
- **Descricao:** Gate obrigatorio antes de implementar dashboard FE. Explorar visualizacoes: (1) cards + graficos Recharts, (2) dashboard builder drag-and-drop, (3) tabular + export.
- **Subtarefas:**
  - [ ] Explorar opcao 1: cards + graficos
  - [ ] Explorar opcao 2: drag-and-drop
  - [ ] Explorar opcao 3: tabular + export
  - [ ] Documentar e decidir
- **Checklist de conclusao:**
  - [ ] Documento com opcoes e decisao
- **Criterios de aceitacao:**
  - AC1: Documento com wireframes e decisao aprovada
- **Referencia:** BR-IMP-001 a BR-IMP-008

---

### T-066: ImpactoDashboard page
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** frontend
- **Descricao:** Dashboard com: IndicadorCard (valor inicial/final + delta), IndicadorChart (Recharts bar/line), DashboardFilter (projeto + tags + periodo), metricas gerais (participantes, presenca, conclusao, evasao, risco).
- **Subtarefas:**
  - [ ] Implementar IndicadorCard com delta colorido
  - [ ] Implementar IndicadorChart (Recharts bar + line)
  - [ ] Implementar DashboardFilter (projeto + tags + periodo)
  - [ ] Implementar metricas gerais
- **Checklist de conclusao:**
  - [ ] Dashboard renderiza com dados
  - [ ] Filtros funcionais
  - [ ] Graficos Recharts renderizam
- **Criterios de aceitacao:**
  - AC1: Dashboard exibe indicadores com delta
  - AC2: Filtros por projeto e tags funcionais
  - AC3: Graficos renderizam corretamente
- **Referencia:** BR-IMP-001 a BR-IMP-008
- **Depende de:** T-079 (brainstorming gate), T-062 (API Indicadores)

---

### T-080: Brainstorming gate -- Paineis customizados
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 2 pontos
- **Tags:** frontend, planejamento
- **Descricao:** Gate obrigatorio antes de implementar editor de paineis. Explorar UX: (1) wizard step-by-step, (2) canvas drag-and-drop, (3) template gallery.
- **Subtarefas:**
  - [ ] Explorar opcoes de UX
  - [ ] Wireframes low-fi
  - [ ] Documentar decisao
- **Checklist de conclusao:**
  - [ ] Documento com opcoes e decisao
- **Criterios de aceitacao:**
  - AC1: Documento com wireframes e decisao aprovada
- **Referencia:** BR-IMP-007

---

### T-067: PainelEditor + PainelView
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** Criar/editar painel customizado: Dialog com MultiSelect indicadores, Select visualizacao (cards/tabela/barras/linhas), filtros projeto + tags. View renderiza painel salvo.
- **Subtarefas:**
  - [ ] Implementar PainelEditor (Dialog)
  - [ ] Implementar PainelView (renderizacao)
  - [ ] Integracao com API Paineis
- **Checklist de conclusao:**
  - [ ] Editor funcional
  - [ ] View renderiza conforme tipo
- **Criterios de aceitacao:**
  - AC1: Editor permite criar/editar paineis
  - AC2: View renderiza corretamente por tipo de visualizacao
- **Referencia:** BR-IMP-007
- **Depende de:** T-080 (brainstorming gate), T-064 (API Paineis)

---

### T-068: Painel do Investidor page (antigo Painel Patrocinador)
- **Responsavel:** Frontend (Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 5 pontos
- **Tags:** frontend
- **Descricao:** View read-only para investidor (antigo patrocinador): dashboard pre-configurado por projeto, sem auth operacional. URL publica com token. **Nomenclatura: Patrocinador -> Investidor.**
- **Subtarefas:**
  - [ ] Implementar view read-only
  - [ ] Filtro por investidor
  - [ ] URL publica com token
- **Checklist de conclusao:**
  - [ ] View renderiza indicadores
  - [ ] Sem login necessario
- **Criterios de aceitacao:**
  - AC1: Investidor acessa dashboard via URL publica
  - AC2: Dashboard exibe indicadores filtrados por investidor
- **Referencia:** BR-PAT-005, BR-PAT-006, BR-IMP-005

---

### T-069: Discovery V2 (Upstream)
- **Responsavel:** Upstream (Design/Produto)
- **Prioridade:** P2 (desejavel)
- **Estimativa:** 5 pontos
- **Tags:** upstream, planejamento
- **Descricao:** Pesquisa e definicao de funcionalidades V2: inscricao pela plataforma, automacao de disparos, versionamento avancado. Negocio como entidade formal ja incorporado no MVP (PRD atualizado).
- **Subtarefas:**
  - [ ] Backlog V2 priorizado
  - [ ] Documentacao de funcionalidades V2
- **Checklist de conclusao:**
  - [ ] Backlog V2 documentado
- **Criterios de aceitacao:**
  - AC1: Backlog V2 priorizado e documentado
- **Referencia:** BR-MVP-003 a BR-MVP-010

---

### Criterios de aceite do Sprint S10

- [ ] ImpactoDashboard renderiza com graficos e filtros
- [ ] PainelEditor + PainelView funcionais
- [ ] Painel do Investidor acessivel via URL publica
- [ ] Marco: Plataforma no ar (09/05)

---

## S11 -- Semana 11 (10/05 - 17/05) | Fase 4: QA + Deploy

**Objetivo:** Testes E2E, acessibilidade, performance, bug fixing, deploy producao final.
**Periodo:** 10/05/2026 - 17/05/2026
**Milestone:** Entrega do MVP (17/05)

**Dependencias:**
- Bloqueado por: S10 (impacto FE, paineis)
- Bloqueia: Nenhum (sprint final)

---

### T-070: Testes E2E -- Fluxos criticos
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** qa, e2e
- **Descricao:** Playwright: (1) Login gestor + criar projeto + adicionar negocios + participantes (manual + CSV), (2) Criar pesquisa + atribuir + publicar + copiar link, (3) Login participante (magic link) + responder pesquisa + auto-save + submit, (4) Verificar dashboard impacto com dados, (5) Presenca: criar sessao + registrar + verificar percentual. **(6) NOVO: Fluxo negocio -- pre-cadastro, diagnostico, auto-criacao participantes, diagnostico individual, ativacao manual.**
- **Subtarefas:**
  - [ ] Cenario 1: Login + Projeto + Negocios + Participantes
  - [ ] Cenario 2: Pesquisa + Atribuicao + Link publico
  - [ ] Cenario 3: Participante responde pesquisa
  - [ ] Cenario 4: Dashboard impacto
  - [ ] Cenario 5: Presenca
  - [ ] Cenario 6: Fluxo completo de negocio (pre-cadastro -> diagnostico -> participantes -> diagnostico individual -> ativacao)
- **Checklist de conclusao:**
  - [ ] 6 cenarios E2E passando
  - [ ] CI/CD integrado
- **Criterios de aceitacao:**
  - AC1: 6 cenarios E2E passando consistentemente
  - AC2: CI executa testes automaticamente
- **Referencia:** Fluxos 1-6 business-rules.md

---

### T-071: Auditoria de acessibilidade
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** qa, acessibilidade
- **Descricao:** Lighthouse audit > 80. Verificar: labels em inputs, contraste, foco keyboard, aria-labels, alt texts.
- **Subtarefas:**
  - [ ] Audit Lighthouse em todas as pages
  - [ ] Corrigir problemas encontrados
  - [ ] Verificar navegacao via teclado
- **Checklist de conclusao:**
  - [ ] Lighthouse Accessibility > 80
  - [ ] Navegacao via teclado funcional
- **Criterios de aceitacao:**
  - AC1: Lighthouse Accessibility > 80
  - AC2: Navegacao via teclado funcional em todas as pages
- **Referencia:** WCAG 2.1 AA

---

### T-072: Performance audit
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** qa, performance
- **Descricao:** Lighthouse Performance > 80. Verificar: bundle size, image optimization, Server Components, lazy loading.
- **Subtarefas:**
  - [ ] Audit Lighthouse Performance
  - [ ] Otimizar bundle size
  - [ ] Verificar Server Components
  - [ ] Implementar lazy loading onde necessario
- **Checklist de conclusao:**
  - [ ] Lighthouse Performance > 80
  - [ ] FCP < 1.5s
- **Criterios de aceitacao:**
  - AC1: Lighthouse Performance > 80
  - AC2: First Contentful Paint < 1.5s
- **Referencia:** Web Vitals

---

### T-073: Bug fixing e polish
- **Responsavel:** Compartilhado (Douglas + Adriano)
- **Prioridade:** P0 (critico)
- **Estimativa:** 8 pontos
- **Tags:** qa, bug-fix
- **Descricao:** Resolver bugs encontrados em QA, ajustar UX conforme feedback, corrigir edge cases. Foco especial no fluxo de negocios e diagnosticos (novas funcionalidades do PRD).
- **Subtarefas:**
  - [ ] Resolver bugs criticos
  - [ ] Ajustar UX conforme feedback
  - [ ] Corrigir edge cases
  - [ ] Testar fluxo completo de negocios
- **Checklist de conclusao:**
  - [ ] Zero bugs criticos
  - [ ] Fluxos E2E passando
  - [ ] Stakeholders aprovam
- **Criterios de aceitacao:**
  - AC1: Zero bugs criticos em producao
  - AC2: Todos os fluxos E2E passando
- **Referencia:** Todos os fluxos

---

### T-077: Error tracking (Sentry)
- **Responsavel:** Backend (Douglas)
- **Prioridade:** P1 (importante)
- **Estimativa:** 3 pontos
- **Tags:** infra, monitoramento
- **Descricao:** Instalar e configurar Sentry para Next.js. Source maps em producao. Captura de erros server-side e client-side.
- **Subtarefas:**
  - [ ] Instalar Sentry SDK
  - [ ] Configurar sentry.client.config.ts
  - [ ] Configurar sentry.server.config.ts
  - [ ] Configurar source maps
  - [ ] Configurar alertas por severidade
- **Checklist de conclusao:**
  - [ ] Erros capturados em Sentry
  - [ ] Source maps funcionais
  - [ ] Alertas configurados
- **Criterios de aceitacao:**
  - AC1: Erros capturados automaticamente
  - AC2: Source maps funcionais em producao
  - AC3: Alertas por severidade configurados
- **Referencia:** Infra

---

### Criterios de aceite do Sprint S11

- [ ] 6 cenarios E2E passando (incluindo fluxo de negocios)
- [ ] Lighthouse Accessibility > 80
- [ ] Lighthouse Performance > 80, FCP < 1.5s
- [ ] Zero bugs criticos
- [ ] Sentry configurado com alertas
- [ ] Marco: Entrega do MVP (17/05)

---

## Resumo de Tasks por Sprint

| Sprint | Periodo | Tasks | Novas (PRD) | Total Pontos |
|--------|---------|-------|-------------|-------------|
| S01 | 02/03 - 08/03 | T-001 a T-003 | 0 | 11 |
| S02 | 08/03 - 15/03 | T-004, T-005 | 0 | 10 |
| S03 | 15/03 - 22/03 | T-006 a T-017, T-075, T-081, T-082 | 2 (T-081, T-082) | 62 |
| S04 | 22/03 - 29/03 | T-018 a T-027 | 0 | 55 |
| S05 | 29/03 - 05/04 | T-028 a T-035, T-076 | 0 | 39 |
| S06 | 05/04 - 12/04 | T-036 a T-042 | 0 | 40 |
| S07 | 12/04 - 19/04 | T-043 a T-048, T-083 a T-086 | 4 (T-083 a T-086) | 57 |
| S08 | 19/04 - 26/04 | T-049 a T-060, T-087 a T-092 | 6 (T-087 a T-092) | 82 |
| S09 | 26/04 - 03/05 | T-061 a T-065 | 0 | 20 |
| S10 | 03/05 - 10/05 | T-066 a T-069, T-079, T-080 | 0 | 28 |
| S11 | 10/05 - 17/05 | T-070 a T-073, T-077 | 0 | 25 |

**Total:** 89 tasks (80 originais + 9 novas do PRD atualizado)

---

## Mapa de Dependencias das Novas Tasks (PRD Abril/2026)

```
T-008 (Enums) --> T-081 (Tabela negocios)
                     |
                     v
                  T-082 (FK participantes)
                     |
                     v
               T-083 (API Negocios CRUD) -----> T-087 (NegociosList FE)
                     |                           T-088 (NegocioForm FE)
                     v
               T-084 (Diagnostico Negocio) ---> T-089 (Copy Link FE)
                     |
                     v
               T-085 (Diagnostico Individual)
                     |
                     v
               T-086 (Ativacao Manual)
```

---

## Glossario de Nomenclatura

| Contexto | Termo no codigo (endpoints) | Termo na UI (PRD) |
|----------|---------------------------|-------------------|
| Entidade principal de gestao | /api/programas | Projetos |
| Financiadores | /api/patrocinadores | Investidores |
| Templates de coleta | /api/templates | Pesquisas |
| Empresa/negocio participante | /api/negocios | Negocios |

> **Nota:** Os endpoints de API mantem os nomes originais por compatibilidade. A UI deve exibir os termos atualizados do PRD.

---

## Changelog

| Data | Versao | Mudanca |
|------|--------|---------|
| 02/04/2026 | 1.0 | Documento criado. Consolidacao de S01-S11 com tasks T-001 a T-080. Novas tasks T-081 a T-089 do PRD atualizado. Nomenclatura atualizada (Projetos, Investidores, Pesquisas, Negocios como entidade primaria). |
| 03/04/2026 | 1.1 | Enriquecido com analise Figma Make v1.0.2. Novas tasks T-090 (DiagnosticoPage FE), T-091 (Drawer 2 abas), T-092 (campos expandidos Projeto). T-082 expandida com campos participante (cpf, genero, endereco, cargo, status inativado). |
