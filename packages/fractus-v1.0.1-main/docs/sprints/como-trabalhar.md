# Como trabalhar com sprints (Guia para dev junior)

> Este guia explica o fluxo de trabalho diário. Leia uma vez e consulte quando tiver dúvida.

---

## 1. Entendendo a estrutura

O projeto é dividido em **sprints semanais** (S01 a S11). Cada sprint tem tasks com IDs (`T-NNN`).

| Doc | O que contém | Quando consultar |
|-----|-------------|------------------|
| [Roadmap Macro](roadmap-macro.md) | Timeline geral, marcos, fases | Para entender onde estamos no projeto |
| [Track Backend](track-backend.md) | Tasks do Douglas, API contracts | Para saber quais APIs existem/vão existir |
| [Track Frontend](track-frontend.md) | Tasks do Adriano, componentes, pages | Para saber o que implementar |
| [Plans (por fase)](../plans/) | Checklists detalhados por fase | Para ver critérios de aceite da fase |

---

## 2. Fluxo diário (passo a passo)

### Antes de começar o dia

1. **Abra o sprint track** do seu papel (frontend ou backend)
2. **Encontre a sprint atual** (olhe as datas)
3. **Identifique sua próxima task** (primeira que não está marcada como concluída)
4. **Verifique se depende do backend** (coluna "Depende de BE" na tabela)

### Se a task NÃO depende do backend

Comece imediatamente:

```bash
# 1. Criar branch
git checkout -b feat/T-025-templates-list

# 2. Implementar
# ... código ...

# 3. Testar localmente
pnpm dev         # funciona?
pnpm build       # compila?

# 4. Commitar
git add src/app/(platform)/templates/page.tsx src/components/domain/template-card.tsx
git commit -m "feat: criar TemplatesList page com DataTable e filtros"

# 5. Push + PR
git push -u origin feat/T-025-templates-list
gh pr create --title "feat: T-025 TemplatesList page" --body "..."
```

### Se a task DEPENDE do backend e a API não está pronta

**Não fique parado.** Faça uma destas coisas:

1. **Trabalhar com mock data:**

```typescript
// Criar arquivo temporário com dados fake
// services/mock/templates.ts
export const mockTemplates = [
  { id: '1', nome: 'Diagnóstico Inicial', tipo: 'diagnostico_inicial', campos: [] },
  { id: '2', nome: 'NPS Sessão 1', tipo: 'satisfacao_nps', campos: [] },
]
```

2. **Trabalhar no Storybook:**

```bash
pnpm storybook
# Criar stories para os componentes que você precisa
# Quando API ficar pronta, só precisa trocar mock → fetch real
```

3. **Trabalhar em outra task** que não depende de API (compostos, stories, loading states)

---

## 3. Convenção de branches

```
feat/T-025-templates-list     # Nova funcionalidade (com ID da task)
fix/T-025-filtro-tipo         # Correção de bug
chore/setup-storybook         # Setup, config, infra
```

Formato: `prefixo/T-NNN-descricao-curta`

---

## 4. Convenção de commits

```
feat: criar TemplatesList page com DataTable e filtros
fix: corrigir filtro por tipo de template
chore: configurar Storybook com compostos customizados
```

Formato: `tipo: descrição curta` (imperativo, minúscula, sem ponto final)

---

## 5. Como saber se terminei uma task

Cada task tem **critérios de aceite (AC)** no sprint track. Exemplo:

> **T-025 (TemplatesList):**
> - [ ] Page renderiza lista de templates
> - [ ] Filtro por tipo funciona
> - [ ] DataTable com sort e busca
> - [ ] Paginação funcional

Só marque como concluída quando **todos os ACs** passam.

---

## 6. Quando pedir ajuda

| Situação | O que fazer |
|----------|-------------|
| Não entendo o que a task pede | Ler o sprint track + a spec em `docs/fractus/spec-desenvolvimento.md` |
| Não sei como implementar tecnicamente | Consultar o [ADR](../adr/) relevante + exemplos no sprint track |
| API retorna erro | Verificar se é erro de RLS (precisa de auth), dados faltando, ou bug no backend |
| Build quebra | Rodar `pnpm build` localmente. Ler o erro. Corrigir antes de commitar |
| Merge conflict | `git pull origin main` + resolver conflitos + `pnpm build` para verificar |
| Não sei qual task pegar | Olhar a sprint atual no track. Pegar a primeira task disponível |

---

## 7. Regras importantes (memorizar)

### Nunca fazer

- Nunca commitar `.env.local`, `.env`, credenciais
- Nunca force-push para `main`
- Nunca mergear PR com build quebrado
- Nunca importar Supabase direto em componentes UI (usar tipos gerados + Zod)
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no client-side
- Nunca criar IDs no frontend (sempre `gen_random_uuid()` no banco)

### Sempre fazer

- Sempre rodar `pnpm build` antes de abrir PR
- Sempre validar com Zod no servidor antes de gravar no banco
- Sempre habilitar RLS em toda tabela nova
- Sempre rodar `npx supabase gen types` após alterar schema
- Sempre usar `date-fns` com locale `pt-BR` para formatar datas
- Sempre usar componentes shadcn/ui como base (não criar do zero)

---

## 8. Estrutura de arquivos (onde colocar o que)

```
src/
├── app/                    # Rotas e páginas (Next.js App Router)
│   ├── (platform)/         # Rotas protegidas (gestor)
│   ├── (publico)/          # Rotas públicas (participante)
│   ├── auth/               # Login, callback
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Primitivos shadcn + compostos customizados
│   ├── domain/             # Componentes de domínio (ProgramaCard, etc.)
│   └── layout/             # Sidebar, Header
├── lib/
│   ├── supabase/           # Clientes Supabase (server.ts, client.ts)
│   ├── validations/        # Schemas Zod (programa.ts, template.ts, etc.)
│   └── utils.ts            # cn() e utilidades
├── services/               # Camada de acesso a dados (queries Supabase)
├── hooks/                  # Hooks React customizados
└── types/
    └── database.ts         # Tipos gerados pelo Supabase CLI (NÃO EDITAR)
```

### Regra de ouro: onde colocar código novo

| Eu estou criando... | Colocar em... |
|---------------------|---------------|
| Uma página nova | `app/(platform)/[modulo]/page.tsx` |
| Um componente reutilizável genérico | `components/ui/` |
| Um componente específico de um módulo | `components/domain/` |
| Uma validação Zod | `lib/validations/` |
| Uma query ao Supabase | `services/` |
| Um hook React | `hooks/` |
| Um tipo TypeScript | Derivar do Zod schema (`z.infer<>`) ou de `types/database.ts` |

---

## 9. Workflow completo de uma task (exemplo real)

**Task T-046: ProgramasList page**

```bash
# 1. Verificar que estou na main atualizada
git checkout main
git pull origin main

# 2. Criar branch
git checkout -b feat/T-046-programas-list

# 3. Verificar API contract no sprint track backend (S07)
# GET /api/programas -> { search, page, limit } -> { data[], total }

# 4. Criar a page
# app/(platform)/programas/page.tsx

# 5. Criar componentes de domínio necessários
# components/domain/programa-card.tsx

# 6. Testar localmente
pnpm dev
# Abrir http://localhost:3000/programas
# Verificar: lista renderiza? Filtros funcionam? Paginação funciona?

# 7. Rodar build
pnpm build  # Se falhar, corrigir ANTES de commitar

# 8. Commitar e push
git add src/app/\(platform\)/programas/page.tsx src/components/domain/programa-card.tsx
git commit -m "feat: criar ProgramasList page com DataTable e filtros"
git push -u origin feat/T-046-programas-list

# 9. Abrir PR
gh pr create --title "feat: T-046 ProgramasList page" --body "## O que faz
- Lista de programas com DataTable
- Filtros por status e busca
- Paginação

## Task
T-046 (Sprint S07)"
```

---

## 10. Checklist rápido (colar no monitor)

Antes de abrir PR:
- [ ] Branch nomeada corretamente (`feat/T-NNN-descricao`)
- [ ] `pnpm build` passa
- [ ] Nenhum `.env` ou credencial no commit
- [ ] Componentes usam shadcn/ui como base
- [ ] Validações Zod no servidor
- [ ] Tipos gerados (`database.ts`) atualizados se schema mudou

---

## Referências

- [Setup do ambiente](../guides/setup-ambiente.md) — primeiro dia
- [Git e SSH](../guides/git-ssh.md) — configuração Git
- [Schema e migrations](../guides/schema-migrations.md) — trabalhar com Supabase CLI
- [ADRs](../adr/) — entender decisões arquiteturais
- `docs/fractus/business-rules.md` — 135 regras de negócio
- `docs/fractus/spec-desenvolvimento.md` — especificação técnica completa
