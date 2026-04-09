# FRACTUS -- Especificação de Desenvolvimento e Roadmap

> **Atualizado em 03/04/2026** — Schema, rotas e enums alinhados com PRD Resumo (02/04/2026) e Figma Make v1.0.2. Mudanças: Programas→Projetos, Patrocinadores→Investidores, Negócio como entidade primária com FK para Projeto, Participante com negocio_id obrigatório e campos expandidos (CPF, endereço, gênero, cargo), StatusNegocio simplificado para pre_selecionado/selecionado, rota /diagnostico/:projetoId adicionada.

## 1. Resumo executivo

Fractus é uma plataforma digital para gestão de projetos de formação e medição de impacto. O produto opera em três camadas integradas: **Gestão** (estrutura operacional de projetos, negócios, participantes, presença e investidores), **Coleta** (motor de pesquisas reutilizáveis com templates, instâncias e captura de respostas) e **Impacto** (consolidação de indicadores comparativos e dashboards para gestores e investidores).

O sistema é **single-tenant** -- cada instância de deploy atende uma única organização, sem isolamento multi-tenant na modelagem. O MVP prioriza simplicidade, rastreabilidade e consistência de dados. Participantes não possuem área própria -- recebem links, fazem login, respondem e enviam. Segmentações (turma, negócio, grupo, cohort) são tratadas por tags flexíveis no nível de participante, sem entidades estruturais de Turma no MVP. O modelo de atribuição é controlado (formulários circulam exclusivamente por instância vinculada a programa), com validação de elegibilidade por vínculo do participante ao programa. A importação de participantes em lote é suportada via componente de upload CSV com mapeamento visual de colunas (wizard de 3 etapas: upload → mapeamento → confirmação).

A stack é fullstack Next.js (App Router) com Supabase (PostgreSQL) + Prisma ORM, validação Zod, componentes shadcn/ui + Radix UI + Tailwind CSS, gráficos Recharts, formulários React Hook Form, e animações Motion.

Existe um protótipo funcional em Vite + React Router (`packages/fractus/figma-make/mod-gestao/`) que serve como referência visual e comportamental. O protótipo define 54+ componentes UI, tipos TypeScript consolidados (`types.ts`), motor de risco de evasão (`riskCalculator.ts`), e mock data completo. A migração para Next.js App Router é o ponto de partida do desenvolvimento.

---

## 2. Framework nativo Ganbatte/Fractus

### 2.1 Front-end foundation (Next.js App Router)

**Estrutura de diretórios proposta:**

```
packages/fractus/
  src/
    app/
      (auth)/
        login/page.tsx
        layout.tsx
      (platform)/
        layout.tsx              # MainLayout (sidebar + auth guard)
        projetos/
          page.tsx              # ProjetosList (GestaoPage)
          novo/page.tsx         # ProjetoForm (create)
          [id]/
            page.tsx            # ProjetoDetail (tabs: Negócios|Participantes|Aulas|Pesquisas)
            editar/page.tsx     # ProjetoForm (edit)
            pesquisas/[templateId]/respostas/page.tsx
            sessoes/[sessaoId]/respostas/page.tsx
        participantes/
          [id]/page.tsx         # ParticipanteDetail
        investidores/
          page.tsx              # InvestidoresList
          [id]/page.tsx         # InvestidorDetail
        formularios/
          page.tsx              # FormulariosList (Templates de pesquisa)
          novo/page.tsx         # FormularioForm (create)
          [id]/
            page.tsx            # FormularioDetail
            editar/page.tsx     # FormularioForm (edit)
            respostas/page.tsx  # RespostasFormularioPage
        instancias/
          [id]/page.tsx         # InstanciaDetail
        impacto/
          page.tsx              # ImpactoDashboard
      diagnostico/
        [projetoId]/
          page.tsx              # DiagnosticoPage (public, no sidebar)
          layout.tsx            # Minimal layout
      f/
        [id]/
          page.tsx              # Public form (participant-facing)
          layout.tsx            # Minimal layout (no sidebar)
      api/
        auth/[...nextauth]/route.ts
        projetos/route.ts
        projetos/[id]/route.ts
        negocios/route.ts
        negocios/[id]/route.ts
        participantes/route.ts
        participantes/[id]/route.ts
        investidores/route.ts
        investidores/[id]/route.ts
        formularios/route.ts
        formularios/[id]/route.ts
        instancias/route.ts
        instancias/[id]/route.ts
        instancias/[id]/publicar/route.ts
        respostas/route.ts
        respostas/[id]/route.ts
        sessoes/route.ts
        sessoes/[id]/route.ts
        diagnostico/[projetoId]/route.ts
        impacto/indicadores/route.ts
        impacto/dashboard/route.ts
        paineis/route.ts
        paineis/[id]/route.ts
        workspaces/route.ts
    components/
      ui/                       # shadcn/ui primitives (migrated from figma-make)
      domain/                   # Domain-specific composites
      layout/                   # Shell components
    lib/
      prisma.ts                 # Prisma client singleton
      auth.ts                   # Auth config (NextAuth/Supabase Auth)
      validations/              # Zod schemas (shared FE+BE)
      utils.ts                  # cn() + helpers
      risk-calculator.ts        # Port from figma-make
    hooks/
      use-table-sort.ts
      use-debounce.ts
      use-form-autosave.ts
    types/
      index.ts                  # Re-exports
      enums.ts                  # Zod enum schemas
      entities.ts               # Zod entity schemas (source of truth)
    services/
      programas.ts
      participantes.ts
      templates.ts
      instancias.ts
      respostas.ts
      sessoes.ts
      impacto.ts
  prisma/
    schema.prisma
    migrations/
    seed.ts
```

**Convenções de roteamento:**
- Route groups `(auth)` e `(platform)` para layouts distintos
- `f/[id]` fora de ambos os grupos -- layout minimalista para formulários públicos
- Cada `page.tsx` é Server Component por padrão; Client Components extraídos para `components/`
- `loading.tsx` e `error.tsx` em cada segmento de rota para estados de carregamento e erro

**Padrão de data fetching:**
- Server Components fazem fetch direto via Prisma (sem API intermediária)
- Client Components usam `fetch()` para API routes quando necessitam interatividade
- Formulários públicos (`/f/[id]`) usam API routes exclusivamente (sem acesso direto ao Prisma no client)

### 2.2 Back-end foundation (Next.js API Routes + Supabase + Prisma)

**Prisma schema (modelo relacional):**

```prisma
// Enums
enum StatusParticipante {
  pre_selecionado
  selecionado
  ativo
  desistente
  inativado
  concluinte
}

enum TipoTemplate {
  diagnostico_inicial
  diagnostico_meio
  diagnostico_final
  satisfacao_nps
}

enum TipoCampo {
  texto
  escolha_unica
  multipla_escolha
  escala
}

enum StatusNegocio {
  pre_selecionado
  selecionado
}

enum StatusInstancia {
  rascunho
  publicado
  expirado
}

// Models
model Investidor {
  id                  String   @id @default(cuid())
  nome                String
  descricao           String?
  createdAt           DateTime @default(now())
  projetos            ProjetoInvestidor[]
}

model Projeto {
  id                  String   @id @default(cuid())
  nome                String
  descricao           String?
  dataInicio          DateTime
  dataFim             DateTime
  totalInscritos      Int?
  vagas               Int?
  cargaHoraria        String?
  modalidade          String   // Presencial | Online | Híbrido
  createdAt           DateTime @default(now())
  investidores        ProjetoInvestidor[]
  negocios            Negocio[]
  participantes       Participante[]
  instancias          Instancia[]
  sessoes             Sessao[]
}

model ProjetoInvestidor {
  projetoId           String
  investidorId        String
  projeto             Projeto       @relation(fields: [projetoId], references: [id], onDelete: Cascade)
  investidor          Investidor    @relation(fields: [investidorId], references: [id], onDelete: Cascade)
  @@id([projetoId, investidorId])
}

model Negocio {
  id                      String          @id @default(cuid())
  nome                    String
  liderNome               String
  liderEmail              String
  telefone                String
  descricao               String?
  status                  StatusNegocio   @default(pre_selecionado)
  diagnosticoRespondido   Boolean         @default(false)
  projetoId               String
  projeto                 Projeto         @relation(fields: [projetoId], references: [id], onDelete: Cascade)
  createdAt               DateTime        @default(now())
  participantes           Participante[]
  @@unique([liderEmail, projetoId])
}

model Tag {
  id                  String   @id @default(cuid())
  tipo                String   // turma | negocio | grupo | cohort | outro
  valor               String
  participanteId      String
  participante        Participante @relation(fields: [participanteId], references: [id], onDelete: Cascade)
  @@index([tipo, valor])
  @@index([participanteId])
}

model Participante {
  id                          String              @id @default(cuid())
  nome                        String
  email                       String
  telefone                    String?
  cpf                         String?
  dataNascimento              DateTime?
  genero                      String?             // Masculino | Feminino | Outro | Prefiro não informar
  cargo                       String?
  cep                         String?
  endereco                    String?
  numero                      String?
  complemento                 String?
  bairro                      String?
  cidade                      String?
  estado                      String?             // UF, 2 caracteres
  projetoId                   String
  projeto                     Projeto             @relation(fields: [projetoId], references: [id], onDelete: Cascade)
  negocioId                   String
  negocio                     Negocio             @relation(fields: [negocioId], references: [id], onDelete: Cascade)
  status                      StatusParticipante  @default(pre_selecionado)
  respondeuDiagnosticoInicial Boolean             @default(false)
  percentualPresenca          Float               @default(0)
  faltasConsecutivas          Int                 @default(0)
  dataVinculo                 DateTime            @default(now())
  createdAt                   DateTime            @default(now())
  tags                        Tag[]
  respostas                   RespostaInstancia[]
  presencas                   PresencaParticipante[]
  usuario                     Usuario?
}

model Workspace {
  id          String     @id @default(cuid())
  nome        String
  descricao   String?
  createdAt   DateTime   @default(now())
  templates   Template[]
}

model Template {
  id                        String         @id @default(cuid())
  nome                      String
  descricao                 String
  tipo                      TipoTemplate
  workspaceId               String
  workspace                 Workspace      @relation(fields: [workspaceId], references: [id])
  permitirMultiplasRespostas Boolean       @default(false)
  versao                    Int            @default(1)
  ativo                     Boolean        @default(true)
  createdAt                 DateTime       @default(now())
  updatedAt                 DateTime       @updatedAt
  campos                    CampoTemplate[]
  instancias                Instancia[]
}

model CampoTemplate {
  id              String      @id @default(cuid())
  templateId      String
  template        Template    @relation(fields: [templateId], references: [id], onDelete: Cascade)
  tipo            TipoCampo
  label           String
  obrigatorio     Boolean     @default(true)
  opcoes          String[]    // Para escolha_unica e multipla_escolha
  escalaMin       Int?
  escalaMax       Int?
  escalaLabelMin  String?
  escalaLabelMax  String?
  isIndicador     Boolean     @default(false)
  nomeIndicador   String?
  ordem           Int         @default(0)
}

model Instancia {
  id                      String          @id @default(cuid())
  templateId              String
  template                Template        @relation(fields: [templateId], references: [id])
  programaId              String
  programa                Programa        @relation(fields: [programaId], references: [id], onDelete: Cascade)
  tipo                    TipoTemplate
  status                  StatusInstancia @default(rascunho)
  linkCompartilhavel      String?         @unique
  prazoValidade           DateTime?
  mensagemPersonalizada   String?
  tagsFiltro              Json?           // Tag[] serialized
  createdAt               DateTime        @default(now())
  publishedAt             DateTime?
  respostas               RespostaInstancia[]
  sessoes                 Sessao[]        @relation("SessaoInstanciaSatisfacao")
}

model RespostaInstancia {
  id              String        @id @default(cuid())
  instanciaId     String
  instancia       Instancia     @relation(fields: [instanciaId], references: [id])
  templateId      String
  participanteId  String
  participante    Participante  @relation(fields: [participanteId], references: [id])
  programaId      String
  respostas       Json          // Record<string, any>
  rascunho        Json?         // Partial responses (auto-save)
  dataEnvio       DateTime?
  completedAt     DateTime?
  versaoTemplate  Int
  createdAt       DateTime      @default(now())
  @@unique([instanciaId, participanteId], name: "resposta_unica")
}

model Sessao {
  id                      String    @id @default(cuid())
  programaId              String
  programa                Programa  @relation(fields: [programaId], references: [id], onDelete: Cascade)
  data                    DateTime
  nome                    String?
  percentualPresenca      Float     @default(0)
  tipo                    String    @default("manual") // manual | inferida
  instanciaSatisfacaoId   String?
  instanciaSatisfacao     Instancia? @relation("SessaoInstanciaSatisfacao", fields: [instanciaSatisfacaoId], references: [id])
  templateSatisfacaoId    String?
  denominador             String[]  // Snapshot IDs de participantes esperados
  tagsFiltro              Json?
  createdAt               DateTime  @default(now())
  presencas               PresencaParticipante[]
}

model PresencaParticipante {
  id              String       @id @default(cuid())
  sessaoId        String
  sessao          Sessao       @relation(fields: [sessaoId], references: [id], onDelete: Cascade)
  participanteId  String
  participante    Participante @relation(fields: [participanteId], references: [id])
  presente        Boolean
  @@unique([sessaoId, participanteId])
}

model PainelCustomizado {
  id                      String   @id @default(cuid())
  nome                    String
  descricao               String?
  indicadoresSelecionados String[] // nomes dos indicadores
  programasFiltro         String[] // IDs
  tagsFiltro              Json?
  tipoVisualizacao        String   @default("cards") // cards | tabela | grafico_barras | grafico_linhas
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}

model Usuario {
  id              String   @id @default(cuid())
  nome            String
  email           String   @unique
  senhaHash       String
  tipo            String   @default("gestor") // gestor | participante
  participanteId  String?  @unique
  participante    Participante? @relation(fields: [participanteId], references: [id])
  createdAt       DateTime @default(now())
}
```

**Padrão de API Routes:**

Cada API route segue esta estrutura:
1. Validar autenticação via `getServerSession()` ou Supabase Auth
2. Validar body/params via Zod schema
3. Executar operação via Prisma
4. Retornar `NextResponse.json()` com status code adequado
5. Erros retornam `{ error: string, details?: ZodError }` com HTTP 400/401/404/500

**Supabase integration:**
- Supabase serve como host PostgreSQL + Auth provider (magic link para participantes, email/password para gestores)
- Prisma conecta via `DATABASE_URL` (Supabase connection string com pgBouncer)
- Row Level Security (RLS) desabilitado no MVP -- autorização via middleware Next.js
- Supabase Storage para logos de patrocinadores (bucket público)

### 2.3 Regras de consistência

| Regra | Descrição | Responsabilidade |
|-------|-----------|-----------------|
| RC-01 | Todo Zod schema é definido em `lib/validations/` e compartilhado entre FE e BE | Compartilhado |
| RC-02 | Prisma schema é source of truth para tipos de banco; Zod schemas derivam dos mesmos tipos | Back-end |
| RC-03 | Componentes UI nunca importam Prisma diretamente -- usam tipos Zod inferidos | Front-end |
| RC-04 | API routes retornam tipos consistentes com os Zod schemas de resposta | Back-end |
| RC-05 | Toda mutação passa por validação Zod no servidor, independente de validação no cliente | Compartilhado |
| RC-06 | Datas são armazenadas como UTC no banco e formatadas com `date-fns` + locale pt-BR no front | Compartilhado |
| RC-07 | IDs são `cuid()` gerados pelo Prisma, nunca pelo cliente | Back-end |
| RC-08 | Estados de carregamento usam `loading.tsx` (RSC) ou Skeleton components (Client) | Front-end |
| RC-09 | Erros de API são capturados por `error.tsx` boundaries | Front-end |
| RC-10 | Links compartilháveis de instâncias usam nanoid (8 chars) prefixados com `/f/` | Back-end |
| RC-11 | Respostas parciais são salvas no campo `rascunho` via debounce (3s) -- `completedAt` marca envio final | Compartilhado |
| RC-12 | Templates com respostas existentes não podem ser deletados -- apenas desativados (`ativo: false`) | Back-end |
| RC-13 | Participante muda de `pre_selecionado` para `selecionado` automaticamente ao responder diagnóstico individual. Transição para `ativo` é manual pelo gestor (após termo de aceite externo) | Back-end |
| RC-14 | `percentualPresenca` e `faltasConsecutivas` são recalculados via trigger após insert/update em `PresencaParticipante` | Back-end |

### 2.4 Biblioteca de componentes

Hierarquia de construção (primitive -> composite -> domain -> page shell -> page):

**Primitivos (shadcn/ui -- migrar do figma-make):**
Existem 54 componentes UI no protótipo em `c:/Users/dsoliveira/Documents/Github/Ganbatte/packages/fractus/figma-make/mod-gestao/src/app/components/ui/`. Os seguintes são utilizados ativamente e devem ser migrados na primeira etapa:

| Componente | Arquivo referência | Prioridade |
|------------|-------------------|-----------|
| Button | `button.tsx` | P0 |
| Input | `input.tsx` | P0 |
| Label | `label.tsx` | P0 |
| Card, CardHeader, CardTitle, CardContent | `card.tsx` | P0 |
| Table, TableHead, TableBody, TableRow, TableCell | `table.tsx` | P0 |
| Badge | `badge.tsx` | P0 |
| Select, SelectTrigger, SelectContent, SelectItem | `select.tsx` | P0 |
| Tabs, TabsContent, TabsList, TabsTrigger | `tabs.tsx` | P0 |
| Dialog | `dialog.tsx` | P0 |
| Sheet, SheetContent, SheetHeader, SheetTitle | `sheet.tsx` | P0 |
| Checkbox | `checkbox.tsx` | P0 |
| Textarea | `textarea.tsx` | P0 |
| Tooltip | `tooltip.tsx` | P0 |
| Separator | `separator.tsx` | P0 |
| Sonner (toast) | `sonner.tsx` | P0 |
| Form (RHF integration) | `form.tsx` | P0 |
| Calendar | `calendar.tsx` | P1 |
| Popover | `popover.tsx` | P1 |
| DropdownMenu | `dropdown-menu.tsx` | P1 |
| ScrollArea | `scroll-area.tsx` | P1 |
| Skeleton | `skeleton.tsx` | P1 |
| Progress | `progress.tsx` | P1 |
| Slider | `slider.tsx` | P1 |
| RadioGroup | `radio-group.tsx` | P1 |
| Switch | `switch.tsx` | P2 |
| Breadcrumb | `breadcrumb.tsx` | P2 |
| Pagination | `pagination.tsx` | P2 |
| Sidebar | `sidebar.tsx` | P2 |

**Compostos (domain-agnostic, criados pelo time):**

| Componente | Descrição | Dependências |
|------------|-----------|-------------|
| `SortableTableHead` | Cabeçalho de tabela com sort (já existe em `sortable-table-head.tsx`) | Table, lucide-react |
| `StatCard` | Card de métrica com tendência (já existe em `stat-card.tsx`) | Card, Badge, lucide-react |
| `StatusBadge` | Badge colorido por status (já existe em `status-badge.tsx`) | Badge, lucide-react |
| `CountBadge` | Badge numérico com cor (já existe em `status-badge.tsx`) | Badge |
| `LoadingBadge` | Badge com spinner (já existe em `status-badge.tsx`) | Badge, lucide-react |
| `MultiSelect` | Select com múltiplas opções (já existe em `multi-select.tsx`) | Popover, Command, Badge |
| `DataTable` | Tabela com sort, filtro, paginação | Table, SortableTableHead, Input, Select, Pagination |
| `EmptyState` | Estado vazio com ícone, título e CTA | Card, Button, lucide-react |
| `ConfirmDialog` | Dialog de confirmação com ação destrutiva | AlertDialog, Button |
| `PageHeader` | Cabeçalho de página com título, breadcrumb e ações | Breadcrumb, Button |
| `SearchInput` | Input com ícone de busca e debounce | Input, lucide-react |
| `DateRangePicker` | Seletor de intervalo de datas | Popover, Calendar, date-fns |
| `FormField` | Campo de formulário com label, erro e dica | Label, Input/Select/Textarea, RHF |
| `CsvImportWizard` | Wizard 3 etapas para importação CSV: upload drag-and-drop → mapeamento visual de colunas → preview e confirmação. Baseado em `import_csv_map_vue`, portado para React/shadcn/ui. Parser: PapaParse. Validação: .csv, max 5MB, max 5000 linhas. Colunas configuráveis via prop `columns`. Ignora cabeçalho opcional. Emite `onComplete(mappedData[])` | Dialog, Table, Select, Button, Input, lucide-react, papaparse |

**Componentes de domínio:**

| Componente | Módulo | Descrição |
|------------|--------|-----------|
| `ProgramaCard` | Gestão | Card resumo de programa com métricas |
| `ParticipanteRow` | Gestão | Linha de tabela com status, presença, risco |
| `RiskBadge` | Gestão | Badge de nível de risco (baixo/médio/alto/crítico) |
| `TagBadge` | Gestão | Badge de tag com cor por tipo |
| `TagFilter` | Gestão | Seletor de tags para filtro |
| `PresencaMatrix` | Gestão | Matriz sessões x participantes |
| `SessaoCard` | Gestão | Card de sessão com presença e NPS |
| `PatrocinadorCard` | Gestão | Card de patrocinador com programas |
| `TemplateCard` | Coleta | Card de template com tipo e campos |
| `CampoEditor` | Coleta | Editor de campo individual (tipo, opções, escala) |
| `CampoRenderer` | Coleta | Renderizador de campo para participante |
| `InstanciaCard` | Coleta | Card de instância com status e respostas X/Y |
| `RespostasViewer` | Coleta | Visualizador de respostas do gestor |
| `FormPublico` | Coleta | Formulário renderizado para participante |
| `IndicadorCard` | Impacto | Card de indicador com delta |
| `IndicadorChart` | Impacto | Gráfico de indicador (bar/line) |
| `DashboardFilter` | Impacto | Filtros de programa + tags para dashboard |
| `PainelEditor` | Impacto | Editor de painel customizado |

**Page Shells:**

| Shell | Descrição | Filhos |
|-------|-----------|--------|
| `PlatformShell` | Layout principal com sidebar, header, auth guard | Todas as páginas exceto `/f/[id]` e `/login` |
| `AuthShell` | Layout de autenticação (centered, minimal) | `/login` |
| `FormShell` | Layout de formulário público (branding mínimo, progresso) | `/f/[id]` |

### 2.5 Contratos e integrações

**Autenticação:**
- Gestor: email + password via Supabase Auth (ou NextAuth com Supabase adapter)
- Participante: magic link via Supabase Auth (email) -- sem senha no MVP
- Sessão gerenciada via cookies HTTP-only
- Middleware Next.js valida sessão em `(platform)/` e redireciona para login

**Formulários públicos (`/f/[id]`):**
- URL pública baseada em `instancia.linkCompartilhavel` (nanoid)
- Participante acessa link -> redirect para login se não autenticado -> validação de vínculo (participante pertence ao programa da instância) -> renderiza formulário
- Auto-save via debounce 3s no campo `rascunho` da `RespostaInstancia`
- Submit final marca `completedAt` e `dataEnvio`

**Real-time (futuro, não MVP):**
- Supabase Realtime para notificações de novas respostas
- Atualização automática de contadores X/Y nas instâncias

---

## 3. Macroetapas compartilhadas

| # | Macroetapa | Objetivo | Escopo | Responsabilidade | Dependências | Artefato de saída |
|---|-----------|----------|--------|------------------|-------------|-------------------|
| M1 | Setup do projeto | Criar projeto Next.js, configurar Prisma + Supabase, CI/CD | Scaffold, env vars, deploy pipeline | Compartilhado | Nenhuma | Repo inicializado, deploy preview funcional |
| M2 | Design system base | Migrar primitivos shadcn/ui, configurar Tailwind tokens, criar compostos base | 28 primitivos P0/P1, 13 compostos, 3 shells | Front-end | M1 | Storybook/catálogo de componentes funcional |
| M3 | Schema e banco | Modelar Prisma schema, migrations, seed data | 15 models, enums, relações, indexes | Back-end | M1 | Schema deployado em Supabase, seed funcional |
| M4 | Auth e middleware | Implementar login gestor/participante, middleware de proteção | Supabase Auth, NextAuth adapter, middleware | Compartilhado | M1, M3 |Login funcional, rotas protegidas |
| M5 | Validações Zod | Criar schemas Zod para todas entidades e endpoints | 15+ schemas de criação/update, enums | Compartilhado | M3 | `lib/validations/` completo |
| M6 | CRUD Programas | Listar, criar, editar, deletar programas | API routes + pages + forms | Compartilhado | M2, M3, M4, M5 | Módulo Programas funcional |
| M7 | CRUD Participantes | Listar, criar, vincular a programa, tags, status | API routes + pages + drawer | Compartilhado | M6 | Participantes dentro de programa |
| M8 | CRUD Patrocinadores | Listar, criar, vincular a programa | API routes + pages | Compartilhado | M6 | Patrocinadores funcional |
| M9 | CRUD Templates + Workspaces | Criar workspaces, templates com campos dinâmicos | API routes + pages + campo editor | Compartilhado | M2, M3, M5 | Motor de templates funcional |
| M10 | Instâncias + Links | Criar instância de template para programa, gerar link | API routes + pages + link gen | Compartilhado | M9, M6 | Instâncias funcional |
| M11 | Formulário público | Renderizar formulário, auto-save, submit | Page `/f/[id]` + API respostas | Compartilhado | M10, M4 | Coleta de respostas funcional |
| M12 | Visualização de respostas | Tabela de respostas por instância, detalhe por participante | Pages de respostas | Front-end | M11 | Gestor vê respostas |
| M13 | Sessões + Presença | CRUD sessões, presença inferida/manual, matriz | API routes + PresencaTab + matriz | Compartilhado | M7, M10 | Presença funcional |
| M14 | Motor de risco | Cálculo de risco de evasão, exibição por participante | Lógica server-side + RiskBadge | Compartilhado | M7, M13 | Indicadores de risco |
| M15 | Negócios (tags) | Gestão de negócios via tags + aba de negócios no programa | API routes + NegociosList | Compartilhado | M7 | Negócios funcional |
| M16 | Dashboard de impacto | Cálculo de indicadores, gráficos, filtros | API + ImpactoDashboard + Recharts | Compartilhado | M11, M12 | Dashboard básico |
| M17 | Painéis customizados | CRUD de painéis, seleção de indicadores, visualizações | API + PainelEditor | Compartilhado | M16 | Painéis customizados |
| M18 | Painel do patrocinador | View read-only para patrocinador, filtrada por programa | Page pública (sem auth) | Front-end | M16 | Área do patrocinador |
| M19 | QA e polish | Testes E2E, acessibilidade, performance, edge cases | Cypress/Playwright, Lighthouse | Compartilhado | M6-M18 | Suite de testes, relatório QA |

---

## 4. Roadmap Front-end

| # | Nome | Objetivo | Escopo | Dependências | Artefato de saída |
|---|------|----------|--------|-------------|-------------------|
| F1 | Scaffold Next.js + Tailwind | Criar app Next.js 14+, configurar Tailwind v4, fontes, tema | `create-next-app`, tailwind config, globals.css | M1 | App renderizando |
| F2 | Migrar primitivos shadcn/ui P0 | Instalar via `npx shadcn@latest add` os 16 componentes P0 | button, input, label, card, table, badge, select, tabs, dialog, sheet, checkbox, textarea, tooltip, separator, sonner, form | F1 | 16 componentes renderizáveis |
| F3 | Criar compostos base | StatCard, StatusBadge, CountBadge, SortableTableHead, EmptyState, ConfirmDialog, PageHeader, SearchInput | Portar de figma-make + criar novos | F2 | 8 compostos testados |
| F4 | Criar Page Shells | PlatformShell (sidebar nav), AuthShell, FormShell | Portar MainLayout do figma-make para Next.js layout.tsx | F2 | Shells navegáveis |
| F5 | Instalar primitivos P1 | Calendar, Popover, DropdownMenu, ScrollArea, Skeleton, Progress, Slider, RadioGroup | Via shadcn CLI | F1 | 8 primitivos adicionais |
| F6 | Compostos avançados | DataTable, DateRangePicker, FormField, TagBadge, TagFilter, CsvImportWizard | Compor primitivos P0 + P1. CsvImportWizard portado de `import_csv_map_vue` (Vue→React) | F2, F5 | 6 compostos |
| F7 | ProgramasList page | Listagem de programas com cards/tabela, filtros, busca | ProgramaCard, DataTable, PageHeader | F3, F6, M6 | Página funcional |
| F8 | ProgramaForm page | Formulário criar/editar programa com RHF + Zod | FormField, DateRangePicker, MultiSelect | F6, M5, M6 | Formulário funcional |
| F9 | ProgramaDetail page | Detail com tabs (Negócios, Participantes, Presença, Formulários, Satisfação) | Tabs, sub-components per tab | F3, F7, M6 | Página com tabs |
| F10 | ParticipantesList tab | Tabela de participantes dentro do programa, drawer add/edit, importação CSV em lote | DataTable, Sheet, StatusBadge, RiskBadge, CsvImportWizard | F6, M7 | Tab funcional com importação CSV |
| F11 | ParticipanteDetail page | Detalhe do participante, histórico, respostas, presença | Card, StatCard, Table | F3, M7 | Página funcional |
| F12 | PatrocinadoresList page | Listagem e CRUD de patrocinadores | PatrocinadorCard, DataTable | F3, M8 | Página funcional |
| F13 | PatrocinadorDetail page | Detalhe com programas vinculados | Card, Table | F3, M8 | Página funcional |
| F14 | TemplatesList page | Listagem com filtro por workspace, tipo | TemplateCard, DataTable, tabs por workspace | F6, M9 | Página funcional |
| F15 | TemplateForm page | Editor de template com campos dinâmicos drag-and-drop | CampoEditor, RHF, DnD | F6, M9 | Editor funcional |
| F16 | TemplateDetail page | Visualização do template, instâncias vinculadas | Card, Table, InstanciaCard | F3, M9 | Página funcional |
| F17 | InstanciaForm dialog | Criar instância: selecionar template, programa, tags, prazo | Dialog, Select, MultiSelect, Calendar | F6, M10 | Dialog funcional |
| F18 | InstanciaDetail page | Detalhe da instância, link, respostas X/Y | Card, Table, copyToClipboard | F3, M10 | Página funcional |
| F19 | FormPublico page | Formulário renderizado para participante (`/f/[id]`) | CampoRenderer, FormShell, auto-save | F4, M11 | Formulário funcional |
| F20 | RespostasViewer pages | Tabelas de respostas por instância (formulários, satisfação, sessão) | DataTable, RespostasViewer | F6, M12 | 3 páginas de respostas |
| F21 | PresencaTab + SessaoForm | Tab de presença no programa, criar/editar sessão, matriz | PresencaMatrix, SessaoCard, Sheet | F3, M13 | Tab funcional |
| F22 | FormulariosTab | Tab de formulários/diagnósticos no programa | InstanciaCard, InstanciaForm | F17, M10 | Tab funcional |
| F23 | SatisfacaoTab | Tab de satisfação no programa | InstanciaCard, vínculo com sessão | F17, M10 | Tab funcional |
| F24 | ImpactoDashboard page | Dashboard com indicadores, gráficos, filtros | IndicadorCard, IndicadorChart, DashboardFilter, Recharts | F6, M16 | Dashboard funcional |
| F25 | PainelEditor + PainelView | Criar/editar painel customizado, visualizações | PainelEditor, Recharts, MultiSelect | F6, M17 | Painéis funcional |
| F26 | Painel do patrocinador | View pública read-only filtrada | Cards, gráficos simplificados | F24, M18 | Área do patrocinador |
| F27 | Login page | Formulário login gestor (email/senha) e participante (magic link) | AuthShell, Form, Button | F4, M4 | Login funcional |
| F28 | Loading + Error states | loading.tsx, error.tsx, Skeleton em todas as rotas | Skeleton, EmptyState | F3 | Estados consistentes |

---

## 5. Roadmap Back-end

| # | Nome | Objetivo | Escopo | Dependências | Artefato de saída |
|---|------|----------|--------|-------------|-------------------|
| B1 | Prisma schema + migrations | Criar schema completo, rodar migrations em Supabase | 15 models, enums, indexes, relations | M1 | DB deployado |
| B2 | Seed data | Script de seed com dados realistas para dev | Programas, participantes, templates, respostas, sessões | B1 | `prisma/seed.ts` funcional |
| B3 | Zod validation schemas | Schemas para create/update de todas entidades | Programas, Participantes, Templates, Instâncias, Respostas, Sessões, etc. | B1 | `lib/validations/` |
| B4 | Auth setup | Supabase Auth + NextAuth adapter, middleware | Login, magic link, session, protect routes | B1 | Auth funcional |
| B5 | API Programas | GET (list/detail), POST, PUT, DELETE `/api/programas` | CRUD completo com validação Zod | B1, B3 | Endpoints testados |
| B6 | API Participantes | GET (list/detail, by programa), POST, PUT, DELETE `/api/participantes` | CRUD + vínculo a programa + tags | B1, B3 | Endpoints testados |
| B7 | API Patrocinadores | GET (list/detail), POST, PUT `/api/patrocinadores` | CRUD + vínculo a programa | B1, B3 | Endpoints testados |
| B8 | API Workspaces | GET (list), POST `/api/workspaces` | CRUD básico | B1, B3 | Endpoints testados |
| B9 | API Templates | GET (list/detail, by workspace), POST, PUT `/api/templates` | CRUD + campos + versionamento + soft delete | B1, B3 | Endpoints testados |
| B10 | API Instâncias | GET, POST, PUT `/api/instancias`, POST `.../publicar` | CRUD + gerar link (nanoid) + publicar/despublicar | B1, B3, B9 | Endpoints testados |
| B11 | API Respostas | GET (by instância, by participante), POST, PUT `/api/respostas` | Criar resposta + auto-save rascunho + submit final | B1, B3, B10 | Endpoints testados |
| B12 | Lógica auto-status | Participante -> ativo após responder diagnostico_inicial | Trigger em POST respostas | B6, B11 | Regra funcional |
| B13 | API Sessões + Presença | GET, POST, PUT, DELETE `/api/sessoes` | CRUD sessão + registro presença + recálculo % | B1, B3, B6 | Endpoints testados |
| B14 | Recálculo presença | Recalcular `percentualPresenca` e `faltasConsecutivas` após mutação em presença | Service function chamada em B13 | B6, B13 | Métricas atualizadas |
| B15 | Motor de risco | Portar `riskCalculator.ts` para server-side, expor via API | Endpoint GET `/api/participantes/[id]/risco` ou campo computado | B6, B14 | Risco calculado |
| B16 | API Negócios | GET, POST, PUT, DELETE `/api/negocios` | CRUD + vínculo a participantes | B1, B3 | Endpoints testados |
| B17 | Validação link público | Middleware em `/f/[id]`: validar participante vinculado ao programa da instância, prazo válido | Auth check + query Prisma | B4, B10 | Validação funcional |
| B18 | API Impacto indicadores | GET `/api/impacto/indicadores` | Agregar respostas de diagnostico_inicial vs diagnostico_final, calcular deltas | B11 | Indicadores calculados |
| B19 | API Impacto dashboard | GET `/api/impacto/dashboard` com filtros programa/tags | Estatísticas agregadas, métricas por programa | B18 | Dashboard data |
| B20 | API Painéis | GET, POST, PUT, DELETE `/api/paineis` | CRUD painéis customizados | B1, B3 | Endpoints testados |
| B21 | Expirar instâncias | Job ou check na leitura: se `prazoValidade < now()`, marcar como `expirado` | Cron ou lazy check | B10 | Instâncias expiram |

---

## 6. Matriz de responsabilidades

| Artefato / Atividade | Front-end | Back-end | Compartilhado |
|----------------------|-----------|----------|---------------|
| Projeto Next.js scaffold | | | X |
| Tailwind + design tokens | X | | |
| Componentes shadcn/ui | X | | |
| Componentes compostos | X | | |
| Componentes de domínio | X | | |
| Page shells (layouts) | X | | |
| Pages (Server Components) | X | | |
| Client Components interativos | X | | |
| Prisma schema + migrations | | X | |
| Seed data | | X | |
| Zod validation schemas | | | X |
| API routes handlers | | X | |
| Auth (Supabase + NextAuth) | | | X |
| Middleware proteção rotas | | | X |
| Lógica de negócio (risco, status, presença) | | X | |
| Formulário público | X | X | |
| Auto-save respostas | X | X | |
| Motor de impacto (indicadores) | | X | |
| Graficos Recharts | X | | |
| Painel patrocinador | X | | |
| Testes unitários (lógica) | | X | |
| Testes E2E | | | X |
| Deploy Vercel/Supabase | | | X |

---

## 7. Componentes antes de páginas

A sequência de construção segue rigorosamente a hierarquia:

### Fase 1: Primitivos (shadcn/ui)
Instalar via `npx shadcn@latest add [component]`. Nenhuma customização nesta fase exceto tokens Tailwind (cores, fontes, espaçamentos).

Instalar nesta ordem:
1. `button`, `input`, `label`, `textarea` (controles básicos)
2. `card` (layout)
3. `table` (dados)
4. `badge` (status)
5. `select`, `checkbox`, `radio-group` (forms)
6. `tabs` (navegação interna)
7. `dialog`, `sheet`, `alert-dialog` (overlays)
8. `tooltip`, `separator` (utilidades)
9. `form` (RHF integration)
10. `sonner` (toast)
11. `calendar`, `popover` (date picker)
12. `dropdown-menu`, `scroll-area`, `skeleton`, `progress`, `slider` (complementares)
13. `breadcrumb`, `pagination`, `sidebar` (navegação)

### Fase 2: Compostos (domain-agnostic)
Criar nesta ordem (cada um depende dos anteriores):
1. `PageHeader` (Button + Breadcrumb)
2. `EmptyState` (Card + Button + Lucide icon)
3. `SearchInput` (Input + Lucide Search + useDebounce)
4. `ConfirmDialog` (AlertDialog + Button)
5. `FormField` (Label + Input/Select/Textarea + RHF)
6. `SortableTableHead` (TableHead + Lucide ArrowUpDown) -- portar de figma-make
7. `DataTable` (Table + SortableTableHead + SearchInput + Select + Pagination)
8. `StatCard` -- portar de figma-make
9. `StatusBadge`, `CountBadge`, `LoadingBadge` -- portar de figma-make
10. `MultiSelect` -- portar de figma-make
11. `DateRangePicker` (Popover + Calendar + date-fns)
12. `TagBadge` (Badge com cor por tipo de tag)
13. `TagFilter` (MultiSelect + TagBadge)
14. `CsvImportWizard` -- portar de `import_csv_map_vue` (Vue 3 → React). Wizard 3 etapas: (1) upload drag-and-drop com validação (.csv, 5MB, 5000 linhas), (2) mapeamento visual de colunas via Select dropdowns com preview de dados, (3) confirmação com tabela completa. Dependências: Dialog, Table, Select, Button, Input, lucide-react, papaparse. Prop `columns` configura campos-alvo (nome, email, telefone, etc.). Emite `onComplete(mappedData[])`. Ref: `C:\Users\dsoliveira\Documents\Github\import_csv_map_vue`

### Fase 3: Componentes de dominio
Criar por módulo, nesta ordem:

**Gestão (primeiro porque é a base estrutural):**
1. `ProgramaCard` (Card + StatCard + Badge + Link)
2. `ParticipanteRow` (TableRow + StatusBadge + RiskBadge + TagBadge)
3. `RiskBadge` (Badge + riskCalculator)
4. `SessaoCard` (Card + Badge + percentual)
5. `PresencaMatrix` (Table + Checkbox + participantes x sessões)
6. `PatrocinadorCard` (Card + Avatar + Badge)

**Coleta (segundo porque depende de Gestão para programas):**
1. `TemplateCard` (Card + Badge tipo + contagem campos)
2. `CampoEditor` (Card + Select tipo + Input label + opções/escala config)
3. `CampoRenderer` (Input/RadioGroup/Checkbox/Slider conforme tipo)
4. `InstanciaCard` (Card + StatusBadge + link + X/Y respostas)
5. `FormPublico` (sequência de CampoRenderer + progress + submit)
6. `RespostasViewer` (DataTable + detalhe por participante)

**Impacto (terceiro porque depende de dados coletados):**
1. `IndicadorCard` (Card + valor inicial/final + delta + percentual)
2. `IndicadorChart` (Recharts BarChart/LineChart + ResponsiveContainer)
3. `DashboardFilter` (Select programa + TagFilter + DateRangePicker)
4. `PainelEditor` (Dialog + MultiSelect indicadores + Select visualização)

### Fase 4: Page Shells
1. `PlatformShell` -- layout.tsx em `(platform)/` com sidebar (portar MainLayout)
2. `AuthShell` -- layout.tsx em `(auth)/` centrado, minimalista
3. `FormShell` -- layout.tsx em `f/` com branding mínimo e barra de progresso

### Fase 5: Pages
Construir na ordem das macroetapas M6-M18, usando os componentes já prontos.

---

## 8. Contratos e entidades

### 8.1 Módulo Gestão

**Entidades:** Programa, Participante, Patrocinador, Negócio, Tag, Sessão, PresencaParticipante

**Endpoints:**

| Método | Rota | Payload (Zod) | Response | Regras |
|--------|------|--------------|----------|--------|
| GET | `/api/programas` | query: `{ search?, page?, limit? }` | `{ data: Programa[], total: number }` | Ordenar por dataInicio DESC |
| GET | `/api/programas/[id]` | -- | `Programa` com patrocinadores populados | 404 se não encontrado |
| POST | `/api/programas` | `{ nome, descricao, dataInicio, dataFim, totalInscritos, quantidadeVagas?, patrocinadorIds[] }` | `Programa` criado | dataFim > dataInicio |
| PUT | `/api/programas/[id]` | Partial do POST | `Programa` atualizado | Mesmo do POST |
| DELETE | `/api/programas/[id]` | -- | `{ success: true }` | Cascade deleta participantes, instâncias, sessões |
| GET | `/api/participantes?programaId=` | query: `{ programaId, search?, status?, tags?, page?, limit? }` | `{ data: Participante[], total: number }` | Filtro por tags: AND dentro do mesmo tipo, OR entre tipos |
| GET | `/api/participantes/[id]` | -- | `Participante` com tags, respostas, presenças | Include relations |
| POST | `/api/participantes` | `{ nome, email, telefone?, dataNascimento?, programaId, tags[], negociosIds[] }` | `Participante` criado | Email único dentro do programa |
| PUT | `/api/participantes/[id]` | Partial do POST + `{ status? }` | `Participante` atualizado | Transições de status: pre_selecionado->selecionado->ativo->desistente/concluinte |
| DELETE | `/api/participantes/[id]` | -- | `{ success: true }` | Cascade deleta tags, respostas, presenças |
| POST | `/api/participantes/bulk` | `{ programaId, participantes: { nome, email, telefone?, dataNascimento?, tags[]?, negociosIds[]? }[] }` | `{ created: number, duplicates: number, errors: { row: number, field: string, message: string }[] }` | Importação em lote via CSV. Frontend envia dados já mapeados (pós-wizard de mapeamento de colunas). Validação por linha: email único dentro do programa, campos obrigatórios (nome, email). Limite: 5000 linhas por requisição. Operação transacional (tudo ou nada) |
| GET | `/api/patrocinadores` | query: `{ search?, page?, limit? }` | `{ data: Patrocinador[], total: number }` | -- |
| POST | `/api/patrocinadores` | `{ nome, logo? }` | `Patrocinador` criado | -- |
| PUT | `/api/patrocinadores/[id]` | Partial do POST | `Patrocinador` atualizado | -- |
| GET | `/api/sessoes?programaId=` | query: `{ programaId }` | `Sessao[]` com presenças | Ordenar por data DESC |
| POST | `/api/sessoes` | `{ programaId, data, nome?, tipo, instanciaSatisfacaoId?, templateSatisfacaoId?, tagsFiltro?, denominador[] }` | `Sessao` criada | Snapshot do denominador no momento da criação |
| PUT | `/api/sessoes/[id]` | Partial + `{ presencas: { participanteId, presente }[] }` | `Sessao` atualizada | Recalcular percentualPresenca + faltasConsecutivas de cada participante |
| DELETE | `/api/sessoes/[id]` | -- | `{ success: true }` | Cascade deleta presenças, recalcular métricas |
| GET | `/api/negocios?programaId=` | query: `{ programaId? }` | `Negocio[]` com participantes | -- |
| POST | `/api/negocios` | `{ nome, empresa?, descricao? }` | `Negocio` criado | -- |

**Estados de participante:**
```
pre_selecionado --[gestor muda status]--> selecionado
selecionado --[responde diagnostico_inicial]--> ativo (automático)
ativo --[gestor muda status]--> desistente
ativo --[gestor muda status]--> concluinte
desistente --[gestor reverte]--> ativo (excepcional)
```

**Erros padronizados:**
- `PROGRAMA_NAO_ENCONTRADO` (404)
- `PARTICIPANTE_JA_VINCULADO` (409) -- email duplicado no programa
- `TRANSICAO_STATUS_INVALIDA` (422) -- ex: concluinte -> selecionado
- `DATA_FIM_ANTERIOR_INICIO` (422)

### 8.2 Módulo Coleta

**Entidades:** Workspace, Template, CampoTemplate, Instância, RespostaInstancia

**Endpoints:**

| Método | Rota | Payload (Zod) | Response | Regras |
|--------|------|--------------|----------|--------|
| GET | `/api/workspaces` | -- | `Workspace[]` com count de templates | -- |
| POST | `/api/workspaces` | `{ nome, descricao? }` | `Workspace` criado | Nome único |
| GET | `/api/templates` | query: `{ workspaceId?, tipo?, search? }` | `Template[]` com campos | Somente ativos por default |
| GET | `/api/templates/[id]` | -- | `Template` com campos + count instâncias | -- |
| POST | `/api/templates` | `{ nome, descricao, tipo, workspaceId, campos[], permitirMultiplasRespostas }` | `Template` criado | Pelo menos 1 campo obrigatório |
| PUT | `/api/templates/[id]` | Partial do POST | `Template` atualizado | Se tem respostas: incrementar versão, não alterar campos existentes (apenas adicionar) |
| DELETE | `/api/templates/[id]` | -- | `{ success: true }` ou 422 | Se tem respostas: retornar 422 com mensagem para desativar. Se não: delete real |
| PUT | `/api/templates/[id]/desativar` | -- | `Template` com ativo: false | Soft delete |
| GET | `/api/instancias?programaId=&tipo=` | query: `{ programaId?, tipo? }` | `Instancia[]` com contagem respostas | -- |
| GET | `/api/instancias/[id]` | -- | `Instancia` com template populado | -- |
| POST | `/api/instancias` | `{ templateId, programaId, tipo, tagsFiltro?, prazoValidade?, mensagemPersonalizada? }` | `Instância` criada (status: rascunho) | tipo deve ser igual ao tipo do template |
| PUT | `/api/instancias/[id]/publicar` | -- | `Instancia` com status: publicado, linkCompartilhavel gerado | Gerar nanoid 8 chars, publishedAt = now |
| PUT | `/api/instancias/[id]/despublicar` | -- | `Instancia` com status: rascunho | Manter link (reutilizável) |
| GET | `/api/respostas?instanciaId=` | query: `{ instanciaId }` | `RespostaInstancia[]` com participante.nome | -- |
| GET | `/api/respostas/[id]` | -- | `RespostaInstancia` completa | -- |
| POST | `/api/respostas` | `{ instanciaId, participanteId, respostas }` | `RespostaInstancia` criada | Validar: participante vinculado ao programa, instância publicada, prazo válido, única resposta (salvo permitirMultiplasRespostas) |
| PUT | `/api/respostas/[id]/rascunho` | `{ respostas: Partial }` | `RespostaInstancia` com rascunho atualizado | Auto-save, não marca completedAt |
| PUT | `/api/respostas/[id]/enviar` | -- | `RespostaInstancia` com completedAt e dataEnvio | Validar campos obrigatórios preenchidos. Se tipo=diagnostico_inicial: marcar participante como ativo |
| GET | `/api/f/[linkId]` | -- | `{ instancia, template, participante }` ou erro | Validar: link existe, instância publicada, prazo válido |

**Regras de validação de link público:**
1. Link existe na tabela instância
2. Status da instância = `publicado`
3. `prazoValidade` nulo ou > now()
4. Participante autenticado está vinculado ao programa da instância
5. Se `tagsFiltro` definido: participante possui pelo menos uma tag correspondente
6. Se não `permitirMultiplasRespostas`: participante ainda não submeteu resposta para esta instância

**Erros:**
- `TEMPLATE_COM_RESPOSTAS` (422) -- tentativa de deletar template com respostas
- `INSTANCIA_NAO_PUBLICADA` (422)
- `PRAZO_EXPIRADO` (410)
- `PARTICIPANTE_NAO_VINCULADO` (403)
- `RESPOSTA_JA_ENVIADA` (409)
- `CAMPOS_OBRIGATORIOS_FALTANDO` (422)

### 8.3 Módulo Impacto

**Entidades:** Indicador (derivado), PainelCustomizado

**Endpoints:**

| Método | Rota | Payload | Response | Regras |
|--------|------|---------|----------|--------|
| GET | `/api/impacto/indicadores` | query: `{ programaId?, tagsFiltro? }` | `Indicador[]` | Calcular delta entre diagnostico_inicial e diagnostico_final para cada campo com `isIndicador: true` |
| GET | `/api/impacto/dashboard` | query: `{ programaId?, tagsFiltro? }` | `{ indicadores[], metricas: { totalParticipantes, mediaPresenca, taxaConclusao, taxaEvasao }, distribuicaoRisco }` | Agregar por programa ou global |
| GET | `/api/impacto/evolucao` | query: `{ indicadorNome, programaId? }` | `{ dataPoints: { momento, valor }[] }` | Para gráficos de linha (inicial -> meio -> final) |
| GET | `/api/paineis` | -- | `PainelCustomizado[]` | -- |
| POST | `/api/paineis` | `{ nome, descricao?, indicadoresSelecionados[], programasFiltro[], tagsFiltro[], tipoVisualizacao }` | `PainelCustomizado` criado | -- |
| PUT | `/api/paineis/[id]` | Partial do POST | `PainelCustomizado` atualizado | -- |
| DELETE | `/api/paineis/[id]` | -- | `{ success: true }` | -- |

**Lógica de cálculo de indicadores:**
1. Buscar todas instâncias de diagnostico_inicial e diagnostico_final para o filtro (programa/tags)
2. Para cada campo com `isIndicador: true`:
   - Buscar respostas do diagnostico_inicial → média dos valores
   - Buscar respostas do diagnostico_final → média dos valores
   - Calcular `deltaAbsoluto = valorFinal - valorInicial`
   - Calcular `deltaPercentual = ((valorFinal - valorInicial) / valorInicial) * 100`
3. Retornar array de Indicador com nome (do `nomeIndicador` do campo), campoId, valores e deltas

**Motor de risco (portar de `riskCalculator.ts`):**
Referência: `c:/Users/dsoliveira/Documents/Github/Ganbatte/packages/fractus/figma-make/mod-gestao/src/app/utils/riskCalculator.ts`

A lógica permanece idêntica ao protótipo:
- Status `desistente` = 100 pts (crítico automático)
- Presença < 50% = +40 pts
- Não respondeu diagnostico_inicial = +30 pts
- 3+ faltas consecutivas = +25 pts
- Zero respostas de avaliação = +20 pts
- Presença 50-75% = +20 pts
- Status `selecionado` = +10 pts
- Níveis: baixo (0-25), médio (26-50), alto (51-75), crítico (76-100)

### 8.4 Módulo Auth

**Endpoints:**

| Método | Rota | Payload | Response | Regras |
|--------|------|---------|----------|--------|
| POST | `/api/auth/login` | `{ email, senha }` | `{ usuario, session }` | Somente gestores via email/senha |
| POST | `/api/auth/magic-link` | `{ email }` | `{ success: true }` | Somente participantes. Envia link via Supabase Auth |
| GET | `/api/auth/me` | -- | `Usuario` | Decodificar session |
| POST | `/api/auth/logout` | -- | `{ success: true }` | Invalidar session |
| GET | `/api/auth/callback` | query: tokens | Redirect para `/` ou `/f/[returnTo]` | Callback do magic link |

---

## 9. Lacunas e decisões pendentes

| # | Tópico | Descrição | Impacto | Módulo |
|---|--------|-----------|---------|--------|
| ~~L1~~ | ~~Multi-tenancy~~ | **RESOLVIDO**: Single-tenant. Cada deploy atende uma organização. Sem necessidade de tenant_id ou isolamento multi-tenant na modelagem | ~~Alto~~ | Compartilhado |
| ~~L2~~ | ~~Importação de participantes~~ | **RESOLVIDO**: Sim, importação CSV com mapeamento visual de colunas. Solução baseada em `import_csv_map_vue` (wizard 3 etapas: upload drag-and-drop → mapeamento de colunas via dropdown → preview e confirmação). Parser PapaParse, validação de arquivo (5MB/5000 linhas), colunas configuráveis. Componente portado para React/shadcn/ui | ~~Médio~~ | Gestão |
| L3 | Versionamento de templates | O PRD menciona "versionamento simples" -- quando o template é editado após ter respostas, o que acontece? Proposta: incrementar `versao`, campos existentes são imutáveis, novos campos podem ser adicionados | Alto -- afeta integridade de dados | Coleta |
| L4 | Notificações | Não há requisito de notificação no MVP. Quem distribui o link é o facilitador externamente. Confirmar que não há necessidade de email de lembrete | Baixo | Compartilhado |
| L5 | Limites de formulário | Quantos campos por template? Quantas opções por campo de escolha? Impacta validação e performance de renderização | Baixo | Coleta |
| L6 | Patrocinador auth | "Read-only, no auth required" -- mas como filtrar? O patrocinador recebe um link com token? Ou a URL é pública com o ID do patrocinador? | Médio -- afeta segurança | Impacto |
| L7 | Diagnóstico "Meio" | O PRD lista diagnostico_meio mas não detalha quando é aplicado. Pode haver múltiplos diagnósticos meio? | Baixo | Coleta |
| L8 | Presença inferida | Quando presença é inferida via NPS e o participante responde tardiamente (após a sessão), como tratar? | Médio -- afeta métricas | Gestão |
| L9 | Offline/conexão instável | Formulários públicos precisam funcionar offline/com conexão instável? Service worker? | Médio -- afeta arquitetura | Coleta |
| L10 | Internacionalização | O sistema é exclusivamente pt-BR ou precisará de i18n? | Baixo | Compartilhado |
| L11 | Acessibilidade | Qual o nível de conformidade WCAG desejado? A-AA-AAA? | Médio | Front-end |
| L12 | Exportação de dados | O PRD não menciona exportação CSV/PDF dos dados. É necessário para o MVP? | Médio | Compartilhado |
| L13 | Escala de campo tipo `escala` | A escala é sempre numérica (1-5, 1-10)? Ou pode ser qualitativa (Discordo-Concordo mapeada)? Impacta cálculo de indicadores | Médio | Coleta/Impacto |
| L14 | Deploy target | Confirmar se o deploy será em Vercel (recomendado para Next.js) ou outra plataforma | Baixo | Compartilhado |
| L15 | Sessão única com 2 steps | PRD diz "um link = presença + NPS opcional". O participante abre link e vê: Step 1 (marcar presença) -> Step 2 (NPS se vinculado). Confirmar que é um link único e não dois links separados | Alto -- afeta UX e modelagem | Gestão/Coleta |

---

### Critical Files for Implementation

- `c:/Users/dsoliveira/Documents/Github/Ganbatte/packages/fractus/figma-make/mod-gestao/src/app/types.ts` - Source of truth for all TypeScript types and enums; must be converted to Prisma schema + Zod schemas
- `c:/Users/dsoliveira/Documents/Github/Ganbatte/packages/fractus/figma-make/mod-gestao/src/app/utils/riskCalculator.ts` - Risk calculation engine to port directly to server-side; defines business logic for evasion risk
- `c:/Users/dsoliveira/Documents/Github/Ganbatte/packages/fractus/figma-make/mod-gestao/src/app/components/layout/MainLayout.tsx` - Sidebar navigation pattern to port to Next.js App Router layout; defines PlatformShell structure
- `c:/Users/dsoliveira/Documents/Github/Ganbatte/packages/fractus/figma-make/mod-gestao/src/app/context/AppContext.tsx` - All CRUD operations and query patterns defined as context methods; serves as blueprint for API routes and services layer
- `c:/Users/dsoliveira/Documents/Github/Ganbatte/packages/fractus/figma-make/mod-gestao/src/app/components/presenca/PresencaTab.tsx` - Most complex domain component combining sessions, attendance matrix, and NPS integration; reference for the hardest feature implementation
- `c:/Users/dsoliveira/Documents/Github/import_csv_map_vue` - Referência para o componente CsvImportWizard. Projeto Vue 3 (WeWeb) com wizard 3 etapas para importação CSV com mapeamento de colunas. Portar para React/shadcn/ui mantendo a mesma UX: drag-and-drop upload, mapeamento visual via dropdowns, preview com busca, confirmação. Dependência: PapaParse para parsing CSV