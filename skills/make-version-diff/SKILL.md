---
name: make-version-diff
description: >
  Compara duas versoes de output do Figma Make (nova vs projeto existente) e produz plano
  de atualizacao com componentes adicionados, alterados e removidos.
  Use no cenario Maintenance quando nova versao do Make chega.
argument-hint: "[path da versao nova do Make] [path do projeto existente]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit]
use-when:
  - nova versao do Figma Make chega e precisa atualizar projeto
  - cenario Maintenance (comparar versao atual vs nova)
  - identificar breaking changes entre versoes do Make
do-not-use-for:
  - primeira importacao do Make (use figma-make-analyzer modo full)
  - comparar Figma Design vs Figma Make (use figma-divergence-detector)
  - implementar mudancas (use frontend-dev apos o diff)
metadata:
  category: workflow-automation
---

# Make Version Diff

## Overview

Workflow que compara duas versoes de output do Figma Make para produzir um plano de atualizacao estruturado. Usa `figma-make-analyzer` em modo diff e encadeia com `diff-review-visual` e `wave-execution` para implementacao.

**Announce at start:** "Estou usando make-version-diff para comparar versoes do Figma Make."

## Composition chain

```
figma-make-analyzer (versao nova) → figma-make-analyzer (diff vs projeto) →
diff-review-visual diff → make-code-triage → wave-execution
```

## Procedure

### Step 1: Analyze new version
1. Rodar `figma-make-analyzer` em modo `full` no diretorio da nova versao
2. Produzir `figma-make-inventory-new.json`

### Step 2: Diff against project
1. Rodar `figma-make-analyzer` em modo `diff` comparando novo vs existente
2. Produzir `figma-make-diff.json` com:
   - Componentes adicionados (novos no Make)
   - Componentes alterados (props mudaram, estrutura mudou)
   - Componentes removidos (existiam antes, nao mais)
   - Breaking changes (tipos alterados, props removidos)

### Step 3: Visual diff report
1. Usar `/diff-review-visual diff` para gerar report visual HTML
2. Highlights: before/after panels para componentes alterados
3. Lista de breaking changes com impacto estimado

### Step 4: Triage changes
1. Usar `make-code-triage` para classificar mudancas por camada
2. Priorizar: breaking changes primeiro, depois adicionais, depois cosmeticos

### Step 5: Generate update plan
Produzir plano em `docs/plans/NN-make-update-[date].md` com waves:
- Wave 1: Types + breaking changes
- Wave 2: Componentes alterados
- Wave 3: Componentes novos
- Wave 4: Stories atualizadas

### Step 6: Execute via waves (optional)
Se usuario aprovar: executar plano via `/wave-execution`

## Definition of Done

- [ ] Inventario da versao nova gerado
- [ ] Diff report com added/modified/removed/breaking
- [ ] Visual diff HTML gerado
- [ ] Update plan salvo em `docs/plans/`
- [ ] Progress sidecar criado

## When to Use
- Use according to the triggers described in the description/use-when list.

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Related artifacts
- `skills/figma-make-analyzer/SKILL.md` — analise de versoes individuais
- `skills/make-code-triage/SKILL.md` — triagem de mudancas
- `skills/diff-review-visual/SKILL.md` — report visual de diff
- `skills/wave-execution/SKILL.md` — execucao do plano de update
