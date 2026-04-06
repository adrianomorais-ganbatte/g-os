---
name: make-code-triage
description: >
  Classifica codigo do Figma Make em categorias (UI pura, data fetching, mock data, API calls, types)
  e produz plano de triagem com destino de cada bloco na arquitetura do projeto.
  Use apos figma-make-analyzer ou quando receber codigo Make bruto para integrar.
argument-hint: "[path do inventario JSON do figma-make-analyzer OU path direto do codigo Make]"
allowedTools: [Read, Glob, Grep, Write, Edit]
use-when:
  - apos figma-make-analyzer produzir inventario JSON
  - receber codigo Make bruto e precisar classificar antes de implementar
  - iniciar triagem BE/FE de importacao Figma Make
  - cenarios Full Build, Incremental, Dual Source ou Maintenance
do-not-use-for:
  - analisar output Make (use figma-make-analyzer primeiro)
  - implementar componentes (use frontend-dev ou design-to-code)
  - revisar codigo existente (use senior-review)
metadata:
  category: document-asset
---

# Make Code Triage

## Overview

Recebe inventario do `figma-make-analyzer` (ou path direto de codigo Make) e classifica cada bloco em categorias da arquitetura Next.js + Supabase. Produz plano de triagem com destino exato de cada bloco, facilitando a importacao organizada.

**Announce at start:** "Estou usando make-code-triage para classificar o codigo Make por camada arquitetural."

## Classification categories

| Categoria | Destino | Criterio |
|-----------|---------|----------|
| **UI pura** | `components/` ou `app/*/page.tsx` | Renderiza JSX, sem data fetching, sem side effects |
| **Data fetching** | `hooks/` ou `services/` | Chama API, fetch, useEffect com request, SWR/React Query |
| **Mock data** | `app/api/*/seed/route.ts` | Dados hardcoded, arrays de objetos, constantes de exemplo |
| **API call** | `services/` ou `lib/api/` | HTTP client, Supabase client, RPC calls |
| **Types** | `types/` ou `domain.ts` | Interfaces, types, enums, Zod schemas |
| **Style tokens** | `globals.css` ou `tailwind.config.ts` | CSS variables, cores, espacamentos, tipografia |
| **Mixed** | Requer split | Componente que mistura UI + data — precisa ser separado |

## Procedure

### Step 1: Load inventory
1. Se input e JSON do figma-make-analyzer → carregar diretamente
2. Se input e path de diretorio → rodar scan basico (glob + parse)
3. Validar que ha componentes para classificar

### Step 2: Classify each component
Para cada componente no inventario:
1. Analisar corpo do componente (JSX, hooks, imports)
2. Detectar presenca de data fetching (fetch, useEffect, useSWR, supabase.from)
3. Detectar mock data (arrays const com dados de exemplo)
4. Detectar chamadas API (HTTP client, service imports)
5. Classificar em uma das categorias acima
6. Se **Mixed**: marcar para split e indicar quais partes sao UI vs data

### Step 3: Map destinations
Para cada componente classificado:
1. Determinar path de destino na arquitetura do projeto
2. Seguir service layer: `Component → Hook → Service → Supabase`
3. Componentes nunca chamam APIs diretamente (R4)
4. Mock data vai para seed routes (R3)

### Step 4: Generate triage plan
Produzir plano em Markdown:

```markdown
# Triage Plan: [Source]

## Summary
- Total components: N
- UI pura: N
- Data fetching: N (→ hooks/services)
- Mock data: N (→ seed routes)
- API calls: N (→ service layer)
- Types: N (→ domain.ts)
- Mixed (requer split): N

## Import Order (by wave)

### Wave 1: Types + Tokens
| Component | Category | Destination |
|-----------|----------|-------------|
| ... | types | types/domain.ts |

### Wave 2: Services + Hooks
| Component | Category | Destination |
|-----------|----------|-------------|
| ... | data-fetching | hooks/useX.ts |

### Wave 3: UI Components
| Component | Category | Destination |
|-----------|----------|-------------|
| ... | ui-pure | components/X.tsx |

### Wave 4: Pages
| Component | Category | Destination |
|-----------|----------|-------------|
| ... | ui-pure (page) | app/X/page.tsx |

## Components Requiring Split
| Component | UI Part | Data Part | Action |
|-----------|---------|-----------|--------|
| ... | → components/ | → hooks/ | Separar UI de data fetching |

## Seed Routes Needed
| Route | Mock Data Source | Endpoint |
|-------|-----------------|----------|
| ... | ComponentX mock array | app/api/X/seed/route.ts |
```

### Step 5: Save plan
Salvar em `docs/plans/NN-triage-[source].md` seguindo `rules/project-docs-convention.md`.

## Definition of Done

- [ ] Todos os componentes do inventario classificados
- [ ] Nenhum componente Mixed sem plano de split
- [ ] Import order organizado por waves (types → services → UI → pages)
- [ ] Seed routes identificadas para todos os mock data
- [ ] Service layer respeitada (nenhum componente chama API diretamente)
- [ ] Plano salvo em `docs/plans/`

## When to Use
- Use according to the triggers described in the description/use-when list.

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Related artifacts
- `skills/figma-make-analyzer/SKILL.md` — produz inventario de input
- `skills/frontend-dev/SKILL.md` — implementa componentes apos triagem
- `skills/component-dedup/SKILL.md` — deduplica antes de implementar
- `rules/project-docs-convention.md` — onde salvar o triage plan
