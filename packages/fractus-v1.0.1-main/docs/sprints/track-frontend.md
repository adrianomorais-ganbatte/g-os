# Sprint Track: Frontend (Adriano)

> **Versao:** 2.0 (atualizada com Design System do Figma e componentes do `start-projeto.md`)
> **Data:** 27/03/2026
> **Responsavel:** Adriano (A)
> **Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI, React Hook Form + Zod, Recharts, Motion
>
> **Nota de nomenclatura (03/04/2026):** Este documento usa nomenclatura anterior ao PRD de 02/04/2026. As tasks e entregas permanecem validas como referencia de implementacao. Mapeamento: Programas→**Projetos**, Patrocinadores→**Investidores**, Formularios→**Pesquisas**. Novidades nao cobertas aqui: DiagnosticoPage publica (T-090), Drawers com 2 abas (T-091), campos expandidos de Participante e Projeto. Ver `clickup-sprints.md` para tasks atualizadas (T-087 a T-092).

---

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de tasks FE | 33 |
| Sprints com tasks FE | S03-S11 |
| Primitivos shadcn/ui | 34 (via CLI) |
| Compostos customizados | 12 (StatusBadge, StatCard, FilterButton, etc.) |
| Componentes de domínio | 18+ |
| Page Shells | 3 (Platform, Auth, Form) |
| Pages | 20+ |

---

## Como ler esta doc

Cada sprint tem:
1. **Tabela de tasks** — o que fazer, em qual arquivo, se depende do backend
2. **AC (critérios de aceite)** — como saber se o sprint está pronto
3. **Depende de BE** — se precisa esperar API. Se sim, trabalhar com mock data/Storybook

**Convenções:**
- `T-NNN` — ID da tarefa
- `F*` — referência à spec (Front-end item)
- `BR-*` — regra de negócio

---

## Build Order (visão geral)

```
S03: Primitivos (34) → Compostos Base (9) → Page Shells (3) → Storybook
S04: Compostos Avançados (7) → Templates Pages (3)
S05: Login Page → Instâncias Pages (2)
S06: FormPublico → RespostasViewer
S07: Programas Pages (3)
S08: Participantes + Patrocinadores + Presença + Tabs
S10: Dashboard Impacto + Painéis
S11: Loading/Error states → E2E → Polish
```

---

## Sprint S03 (15/03 - 22/03) — Fase 1: Base + Padronização

**O que voce faz:** Scaffold, instalar todos os primitivos, criar compostos base, page shells, Storybook.

> **100% frontend — nao depende do backend.**

| Task | O que fazer | Arquivos | Depende de BE |
|------|-------------|----------|---------------|
| T-006 | Scaffold Next.js App Router + Tailwind v4 + ESLint + Prettier | Toda `packages/fractus/src/` | Nao |
| T-012 | Instalar 16 primitivos P0 (ver comando abaixo) | `components/ui/*.tsx` (16 files) | Nao |
| T-013 | Instalar 8 primitivos P1 (ver comando abaixo) | `components/ui/*.tsx` (8 files) | Nao |
| T-014 | 4 compostos base: PageHeader, EmptyState, SearchInput, ConfirmDialog | `components/ui/page-header.tsx`, etc. | Nao |
| T-015 | 5 compostos base (portar do figma-make): StatCard, StatusBadge, CountBadge, LoadingBadge, SortableTableHead | `components/ui/stat-card.tsx`, etc. | Nao |
| T-016 | 3 Page Shells: PlatformShell (sidebar+header), AuthShell (centrado), FormShell (branding minimo) | `app/(platform)/layout.tsx`, `app/(auth)/layout.tsx`, `app/f/[id]/layout.tsx` | Nao |
| T-016b | Configurar Storybook + stories para Button, Card, StatCard, StatusBadge, PageHeader | `.storybook/`, `*.stories.tsx` | Nao |

### Passo a passo: instalar primitivos shadcn/ui

```bash
# Primeiro, inicializar shadcn (se ainda nao fez)
npx shadcn@latest init

# Instalar TODOS os 34 primitivos de uma vez
npx shadcn@latest add button input label textarea select checkbox radio-group switch badge card dialog sheet drawer tabs table popover dropdown-menu command alert-dialog alert tooltip hover-card accordion collapsible calendar avatar skeleton slider toggle breadcrumb progress pagination separator sonner scroll-area
```

> Depois de rodar, confira que os arquivos foram criados em `components/ui/`. Cada componente tem props e variantes prontas.

### Passo a passo: criar um composto customizado

Exemplo: StatusBadge (badge colorido por status do participante)

```tsx
// components/ui/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig = {
  ativo: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
  selecionado: { label: 'Selecionado', className: 'bg-blue-100 text-blue-800' },
  pre_selecionado: { label: 'Pré-selecionado', className: 'bg-yellow-100 text-yellow-800' },
  desclassificado: { label: 'Desclassificado', className: 'bg-red-100 text-red-800' },
  concluinte: { label: 'Concluinte', className: 'bg-purple-100 text-purple-800' },
  desistente: { label: 'Desistente', className: 'bg-gray-100 text-gray-800' },
  publicado: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
  rascunho: { label: 'Rascunho', className: 'bg-gray-100 text-gray-600' },
} as const

type Status = keyof typeof statusConfig

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status]
  return <Badge className={cn(config.className)}>{config.label}</Badge>
}
```

### Compostos customizados completos (12 total)

| Componente | Extende | Props chave | Stories |
|------------|---------|-------------|---------|
| `StatusBadge` | Badge | `status`: 8 valores (ativo, selecionado, etc.) | 8 stories |
| `CategoryBadge` | Badge | `category`: diagnostico_inicial/meio/final, satisfacao_nps | 4 stories |
| `TagBadge` | Badge | `tipo`, `valor`, `onRemove` | 5 stories |
| `DataBadge` | Badge | `icon`: calendar, clock, tag, location, building, user | 6 stories |
| `DateBadge` | Badge | `date`, `format`: short, long, relative | 3 stories |
| `CountBadge` | Badge | `count`, `colorScheme`: blue, green, purple, orange, gray | 5 stories |
| `StatCard` | Card | `title`, `value`, `changePercentage`, `trend`, `subtitle` | 3 stories |
| `MultiSelect` | Popover+Command | `options[]`, `allowCreate`, `onChange` | 2 stories |
| `SortableTableHead` | TableHead | `label`, `sortKey`, `onSort`, `currentSort` | 3 stories |
| `FilterButton` | Button+Popover | `label`, `options[]`, `onFilter`, `estate`: open/close | 2 stories |
| `FilterCleaner` | Button | `onClear`, `hasActiveFilters` | 2 stories |
| `CopyLinkInput` | Input | `label`, `url`, `onCopy` | 2 stories |

### Design System — tokens para configurar no Tailwind

Cores do Figma DS (configurar em `globals.css` ou `tailwind.config.ts`):

| Variável CSS | Hex | Onde usar |
|-------------|-----|-----------|
| `--ds-primary-default` | `#f37d5e` | Botões primários, links, accent |
| `--ds-terceary` | `#eef0f7` | Background badges, tabs inativas |
| `--ds-cinza` | `#5a5a5a` | Texto secundário, labels |
| `--general-foreground` | `#0a0a0a` | Texto principal |
| `--general-muted-foreground` | `#737373` | Placeholders, breadcrumbs |
| `--general-border` | `#e5e5e5` | Bordas, separadores |

Tipografia: **Mulish** (400, 500, 600) — ver [ADR-005](../adr/005-mulish-font.md)

### Sidebar — 2 modos

| Modo | Largura | Conteúdo |
|------|---------|----------|
| Default (aberto) | 288px | Ícones + labels + seções agrupadas |
| Fechado | 101px | Só ícones |

Seções: Programas, Participantes, Negócios, Aulas, Formulários, Patrocinadores.
Rodapé: avatar do gestor + botão logout.
Toggle: botão no topo da sidebar.

**AC do Sprint:**
- [ ] `pnpm dev` roda com App Router
- [ ] 34 primitivos renderizam
- [ ] 12 compostos customizados testados
- [ ] 3 shells navegáveis
- [ ] Storybook funcional com stories
- [ ] Deploy preview no Vercel

---

## Sprint S04 (22/03 - 29/03) — Fase 2a: Templates

**O que voce faz:** Compostos avançados + 3 pages de Templates.

| Task | O que fazer | Arquivos | Depende de BE |
|------|-------------|----------|---------------|
| T-020 | MultiSelect + DataTable (Table+Sort+Search+Pagination) | `components/ui/multi-select.tsx`, `data-table.tsx` | Nao |
| T-021 | FormField + DateRangePicker + TagBadge + TagFilter | `components/ui/form-field.tsx`, `date-range-picker.tsx`, `tag-badge.tsx`, `tag-filter.tsx` | Nao |
| T-022 | CsvImportWizard: 3 etapas (upload → mapeamento → confirmação). PapaParse | `components/ui/csv-import-wizard.tsx` + 3 step components | Nao |
| T-025 | TemplatesList page: tabs por workspace, filtro por tipo, DataTable | `app/(platform)/templates/page.tsx` | **Sim: T-024 (API Templates)** |
| T-026 | TemplateForm page: form builder com seções internas/externas, 4 tipos de pergunta | `app/(platform)/templates/novo/page.tsx` | **Sim: T-024** |
| T-027 | TemplateDetail page: visualização read-only, instâncias vinculadas | `app/(platform)/templates/[id]/page.tsx` | **Sim: T-024** |

### Form builder — 4 tipos de pergunta

| Tipo | UI | Configuração |
|------|----|-------------|
| Texto curto (default) | Input simples | Apenas label + obrigatório |
| Texto longo | Textarea | Label + obrigatório |
| Múltipla escolha | Checkboxes | Lista de opções editáveis + botão "Adicionar opção" |
| Escala 1-5 | Slider | Labels min/max configuráveis |

Cada campo pode ser marcado como **indicador** (`isIndicador: true` + `nomeIndicador`) para rastreamento no módulo Impacto.

### Formulários com seções separadas

Templates dividem campos em:
- **Informações internas** — só o gestor visualiza (ex: nome interno do template)
- **Informações externas** — participante visualiza ao responder

**AC do Sprint:**
- [ ] 7 compostos avançados funcionais
- [ ] CsvImportWizard com upload, mapeamento e confirmação
- [ ] 3 pages de Templates conectadas à API (ou mock data se API não pronta)

---

## Sprint S05 (29/03 - 05/04) — Fase 2a+2b: Auth + Instâncias

**Marco: Auth + Templates prontos (05/04)**

| Task | O que fazer | Arquivos | Depende de BE |
|------|-------------|----------|---------------|
| T-030 | Login page: toggle gestor (email/senha) vs participante (magic link) | `app/(auth)/login/page.tsx` | **Sim: T-028/T-029 (Auth BE)** |
| T-032 | InstanciaForm dialog: selecionar template, programa, tags filtro, prazo | `components/domain/instancia-form.tsx` | **Sim: T-031 (API Instâncias)** |
| T-033 | InstanciaDetail page: status, link (copy to clipboard), respostas X/Y | `app/(platform)/instancias/[id]/page.tsx` | **Sim: T-031** |

**AC do Marco (05/04):**
- [ ] Login gestor funcional (email/senha)
- [ ] Magic link envia email + confirmação
- [ ] CRUD completo de templates com campos dinâmicos
- [ ] Instâncias com link compartilhável

---

## Sprint S06 (05/04 - 12/04) — Fase 2c: Respostas

| Task | O que fazer | Arquivos | Depende de BE |
|------|-------------|----------|---------------|
| T-039 | FormPublico (`/f/[linkId]`): CampoRenderer (4 tipos), auto-save debounce 3s, barra progresso, tela sucesso | `app/f/[id]/page.tsx`, `components/domain/campo-renderer.tsx` | **Sim: T-036, T-038** |
| T-040 | RespostasViewer: 3 subpages (formulários, satisfação, sessão), DataTable, detalhe expandível | `components/domain/respostas-viewer.tsx` | **Sim: T-036** |

### Visualização de respostas por tipo de campo

| Tipo do campo | Como exibir |
|---------------|-------------|
| Texto (curto/longo) | Lista vertical de respostas individuais |
| Escala | Barra horizontal com média numérica |
| Múltipla escolha | Contagem por opção com barra de proporção |

**Marco: Coleta completa (15/04)**

---

## Sprint S07 (12/04 - 19/04) — Fase 3a: Programas

| Task | O que fazer | Arquivos | Depende de BE |
|------|-------------|----------|---------------|
| T-046 | ProgramasList: ProgramaCard, DataTable, métricas colapsáveis | `app/(platform)/programas/page.tsx` | **Sim: T-043** |
| T-047 | ProgramaForm: nome, DateRangePicker, totalInscritos, MultiSelect patrocinadores | `app/(platform)/programas/novo/page.tsx` | **Sim: T-043** |
| T-048 | ProgramaDetail: 5 tabs (Participantes, Negócios, Aulas, Formulários, Satisfação), header com badges | `app/(platform)/programas/[id]/page.tsx` | **Sim: T-043** |

### Header de página (padrão do DS)

O header de ProgramaDetail tem 5 blocos:
1. Título + botões de ação (Excluir ghost, Editar outline, Exportar outline-primary, Novo primary)
2. Descrição em texto muted
3. Badges de metadata — patrocinadores, período, vagas, inscritos
4. Links de diagnóstico com "Copiar link"
5. Tabs de sub-navegação

### Botões — 4 variantes do DS

| Variante | Aparência | Quando usar | Exemplo |
|----------|-----------|-------------|---------|
| `ghost` | Sem fundo, só ícone | Ações destrutivas | Trash (excluir) |
| `outline` | Borda cinza, texto cinza | Ações secundárias | Editar |
| `outline-primary` | Borda `#f37d5e`, texto `#f37d5e` | Ações de exportação | Exportar |
| `primary` | Fundo `#f37d5e`, texto branco | Ação principal | Novo programa |

---

## Sprint S08 (19/04 - 26/04) — Fase 3a: Gestão (cont.)

**Marco: Entrega de Desenvolvimento (26/04)**

| Task | O que fazer | Depende de BE |
|------|-------------|---------------|
| T-049 | ParticipantesList: DataTable, Drawer add/edit, botão "Importar CSV" | **Sim: T-044** |
| T-050 | ParticipanteDetail: dados pessoais, tags, respostas, presenças, risco | **Sim: T-044** |
| T-051 | PatrocinadoresList + PatrocinadorDetail drawer | **Sim: T-045** |
| T-055 | RiskBadge: 4 níveis (Baixo verde, Médio amarelo, Alto laranja, Crítico vermelho) | **Sim: T-054** |
| T-056 | PresencaTab + SessaoForm: lista sessões, matriz presença, criar sessão | **Sim: T-052** |
| T-057 | FormulariosTab + SatisfacaoTab | Não (usa APIs já entregues) |
| T-059 | NegociosTab: lista negócios com participantes | **Sim: T-058** |
| T-060 | Loading + Error states globais: `loading.tsx` + `error.tsx` em todos os segmentos | Não |

### Endereço do participante (campos do drawer)

Seção "Endereço" no ParticipanteForm:
- CEP (máscara `00000-000`)
- Rua
- Número
- Complemento
- Bairro
- Cidade
- UF

> Todos opcionais. Se CEP preenchido, auto-completar via API ViaCEP (opcional, não bloqueia MVP).

---

## Sprint S10 (03/05 - 10/05) — Fase 3b: Impacto

| Task | O que fazer | Depende de BE |
|------|-------------|---------------|
| T-079 | **[Brainstorming]** Dashboard de impacto: explorar visualizações | Não |
| T-066 | ImpactoDashboard: IndicadorCard + IndicadorChart (Recharts bar/line) + DashboardFilter | **Sim: T-063** |
| T-080 | **[Brainstorming]** Painéis customizados: explorar UX | Não |
| T-067 | PainelEditor + PainelView: MultiSelect indicadores, visualização | **Sim: T-064** |
| T-068 | Painel do Patrocinador: view read-only por programa | Sim: T-063 |

---

## Sprint S11 (10/05 - 17/05) — Fase 4: QA

**Marco: Entrega MVP (17/05)**

| Task | O que fazer |
|------|-------------|
| T-070 | Testes E2E Playwright: 5 cenários críticos |
| T-071 | Auditoria acessibilidade: Lighthouse > 80, keyboard nav, aria-labels |
| T-072 | Performance: FCP < 1.5s, bundle size, lazy loading |
| T-073 | Bug fixing e polish |
| T-074 | Documentação README + guia de uso |

---

## Dependências de Backend (quando FE fica bloqueado)

| FE Task | Precisa de | Sprint FE | Sprint BE | Buffer |
|---------|-----------|-----------|-----------|--------|
| T-025/026/027 (Templates pages) | T-024 (API Templates) | S04 | S04 | Mesmo sprint — esperar ~2 dias |
| T-030 (Login) | T-028/029 (Auth) | S05 | S05 | Mesmo sprint |
| T-032/033 (Instâncias) | T-031 (API Instâncias) | S05 | S05 | Mesmo sprint |
| T-039 (FormPublico) | T-036+038 (Respostas+Link) | S06 | S06 | Mesmo sprint |
| T-046/047/048 (Programas) | T-043 (API Programas) | S07 | S07 | Mesmo sprint |
| T-049/050 (Participantes) | T-044 | S07-S08 | S07 | 1 sprint buffer |
| T-051 (Patrocinadores) | T-045 | S08 | S07 | 1 sprint buffer |
| T-066 (Dashboard) | T-063 (API Dashboard) | S10 | S09 | 1 sprint buffer |

> **Estratégia quando API não está pronta:** Trabalhar com mock data / Storybook isolated components. Quando API ficar pronta, conectar via fetch. Não fique parado esperando.

---

## Pages (Next.js App Router) — estrutura de arquivos

```
app/
├── (platform)/                        # Rotas protegidas (middleware auth)
│   ├── programas/
│   │   ├── page.tsx                   # ProgramasList
│   │   └── [id]/
│   │       └── page.tsx               # ProgramaDetail (5 tabs)
│   ├── participantes/
│   │   ├── page.tsx                   # ParticipantesList
│   │   └── [id]/
│   │       └── page.tsx               # ParticipanteDetail
│   ├── templates/
│   │   ├── page.tsx                   # TemplatesList
│   │   ├── novo/
│   │   │   └── page.tsx               # TemplateForm (criar)
│   │   └── [id]/
│   │       └── page.tsx               # TemplateDetail
│   ├── negocios/
│   │   └── page.tsx                   # NegociosList
│   ├── patrocinadores/
│   │   └── page.tsx                   # PatrocinadoresList
│   └── impacto/
│       └── page.tsx                   # ImpactoDashboard
├── (publico)/
│   └── formulario/
│       └── [linkId]/
│           └── page.tsx               # FormPublico (participante responde)
├── auth/
│   ├── login/
│   │   └── page.tsx                   # Login gestor (email/senha)
│   └── callback/
│       └── route.ts                   # Callback magic link
└── layout.tsx                         # Root layout com Mulish font + providers
```

---

## Design System Progression

```
Sprint 3 (Base):
  shadcn/ui (34 primitivos)
  Compostos customizados (12)
  Page Shells (3)

Sprint 4 (Avançado):
  MultiSelect, DataTable, FormField, DateRangePicker
  TagBadge, TagFilter, CsvImportWizard

Sprint 5+ (Domain):
  TemplateCard, InstanciaCard, ProgramaCard
  PatrocinadorCard, SessaoCard, IndicadorCard
  CampoRenderer, CampoEditor
  RiskBadge, PresencaMatrix
  RespostasViewer, DashboardFilter
  PainelEditor, PainelView
```

---

## Componentes portados do protótipo (figma-make)

| Componente | Origem | Destino | Sprint |
|-----------|--------|---------|--------|
| StatCard | figma-make/components/ui/ | components/ui/stat-card.tsx | S03 |
| StatusBadge | figma-make/components/ui/ | components/ui/status-badge.tsx | S03 |
| CountBadge | figma-make/components/ui/ | components/ui/count-badge.tsx | S03 |
| LoadingBadge | figma-make/components/ui/ | components/ui/loading-badge.tsx | S03 |
| SortableTableHead | figma-make/components/ui/ | components/ui/sortable-table-head.tsx | S03 |
| MultiSelect | figma-make/components/ui/ | components/ui/multi-select.tsx | S04 |
| CsvImportWizard | import_csv_map_vue | components/ui/csv-import-wizard.tsx | S04 |

> Consultar o código fonte localmente em `packages/fractus/figma-make/mod-gestao/` (pasta gitignored).
