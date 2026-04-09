---
name: component-dedup
description: >
  Compara componente candidato contra biblioteca existente do projeto (DS, shared, ui).
  Analise semantica de props, estrutura e variantes. Output: criar novo / reusar / merge.
  Use antes de importar componentes do Figma Make para evitar duplicacao.
argument-hint: "[path do componente candidato + path da biblioteca existente]"
allowedTools: [Read, Glob, Grep, Write, Edit]
use-when:
  - importar componentes do Figma Make e precisar verificar duplicatas
  - antes de criar componente novo que pode ja existir no DS
  - apos figma-make-analyzer identificar alto indice de duplicacao
  - cenarios Full Build ou Incremental com biblioteca existente
do-not-use-for:
  - criar componentes do zero (use frontend-dev)
  - analisar output Make bruto (use figma-make-analyzer primeiro)
  - revisar qualidade de componentes (use interface-design)
metadata:
  category: document-asset
---

# Component Dedup

## Overview

Compara componentes candidatos (tipicamente do Figma Make) contra a biblioteca existente do projeto. Realiza analise semantica considerando props, estrutura JSX, variantes e tokens visuais para recomendar uma das 3 acoes: criar novo, reusar existente, ou merge (combinar features).

**Announce at start:** "Estou usando component-dedup para verificar duplicatas contra a biblioteca existente."

## Procedure

### Step 1: Load candidates and library
1. Carregar componentes candidatos (do inventario Make ou paths diretos)
2. Escanear biblioteca existente: `components/ui/`, `components/shared/`, `components/`
3. Construir mapa de componentes existentes (nome, props, variantes)

### Step 2: Compare each candidate
Para cada componente candidato:
1. **Nome match:** buscar componente com nome igual ou similar (fuzzy)
2. **Structural match:** comparar arvore JSX (tags, nesting, slots)
3. **Props match:** comparar interface de props (nomes, tipos, defaults)
4. **Variant match:** comparar variantes definidas (tv(), className conditionals)
5. **Token match:** comparar tokens visuais usados (cores, spacing, typography)

### Step 3: Score similarity
Para cada par (candidato, existente):
- **0-30%:** Componentes diferentes → **CRIAR NOVO**
- **31-70%:** Overlap parcial → **MERGE** (combinar features de ambos)
- **71-100%:** Essencialmente o mesmo → **REUSAR** existente (adaptar se necessario)

### Step 4: Generate report

```markdown
# Dedup Report: [Source]

## Summary
- Candidates analyzed: N
- Create new: N
- Reuse existing: N
- Merge required: N

## Decisions

### CREATE NEW
| Candidate | Reason | Destination |
|-----------|--------|-------------|
| CardNew | No match in library (0%) | components/ui/CardNew.tsx |

### REUSE EXISTING
| Candidate | Match | Similarity | Action |
|-----------|-------|------------|--------|
| Button | Button.tsx | 95% | Usar existente, adicionar variante "outline" |

### MERGE
| Candidate | Match | Similarity | Merge Plan |
|-----------|-------|------------|------------|
| UserCard | ProfileCard.tsx | 55% | Combinar props, manter variantes de ambos |
```

### Step 5: Save report
Salvar em `docs/plans/NN-dedup-[source].md` seguindo `rules/project-docs-convention.md`.

## Definition of Done

- [ ] Todos os candidatos comparados contra biblioteca existente
- [ ] Score de similaridade calculado para cada par
- [ ] Decisao clara (criar/reusar/merge) para cada candidato
- [ ] Merge plans detalhados para componentes com overlap
- [ ] Report salvo em `docs/plans/`

## When to Use
- Use according to the triggers described in the description/use-when list.

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Related artifacts
- `skills/figma-make-analyzer/SKILL.md` — produz inventario de input
- `skills/make-code-triage/SKILL.md` — classifica componentes por categoria
- `skills/frontend-dev/SKILL.md` — implementa apos decisao de dedup
- `skills/interface-design/SKILL.md` — valida qualidade do resultado
