---
name: figma-make-analyzer
description: >
  Parseia output bruto do Figma Make (JSX/TSX com estilos inline) e produz inventario JSON
  de componentes, hierarquia, props, patterns repetidos e assets.
  Use quando receber codigo exportado do Figma Make e precisar entender o que foi gerado
  antes de integrar ao projeto.
argument-hint: "[path do diretorio com output do Figma Make]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit]
use-when:
  - receber output bruto do Figma Make para integrar ao projeto
  - precisar inventariar componentes gerados pelo Figma Make
  - comparar versao nova do Make contra projeto existente (modo diff)
  - iniciar cenario Full Build, Incremental, Dual Source ou Maintenance
do-not-use-for:
  - converter designs Figma para codigo (use design-to-code)
  - criar componentes do zero (use frontend-dev)
  - revisar UI existente (use interface-design)
metadata:
  category: document-asset
---

# Figma Make Analyzer

## Overview

Analisa output bruto do Figma Make — codigo JSX/TSX com estilos inline, estrutura de componentes ad-hoc, e assets referenciados. Produz um inventario estruturado (JSON) que alimenta skills downstream como `make-code-triage`, `component-dedup` e `storybook-gen`.

**Announce at start:** "Estou usando figma-make-analyzer para inventariar o output do Figma Make."

## Modes

### Full Mode (inventario completo)
Usado na primeira importacao (cenario Full Build).

**Input:** Path do diretorio com output Make.
**Output:** `figma-make-inventory.json` na raiz do projeto.

### Diff Mode (delta incremental)
Usado em atualizacoes (cenarios Incremental e Maintenance).

**Input:** Path do diretorio Make + path do projeto existente.
**Output:** `figma-make-diff.json` com componentes adicionados/alterados/removidos.

## Procedure

### Step 1: Scan directory
1. Glob `**/*.{tsx,jsx,ts,js}` no diretorio Make
2. Identificar arquivos de componente vs utilitarios vs assets
3. Contar total de arquivos e linhas

### Step 2: Parse components
Para cada arquivo de componente:
1. Extrair nome do componente (export default/named)
2. Mapear props e seus tipos (inferir de uso se nao tipado)
3. Identificar dependencias internas (imports entre componentes Make)
4. Detectar estilos inline vs className vs styled-components
5. Catalogar assets referenciados (imagens, icones, fontes)

### Step 3: Detect patterns
1. Agrupar componentes similares (mesma estrutura, props diferentes)
2. Identificar patterns repetidos (cards, lists, forms, modals)
3. Calcular indice de duplicacao (quantos componentes sao variantes)
4. Mapear hierarquia (page → section → component → atom)

### Step 4: Extract tokens (from v2 prompt format)
Produzir tokens em 3 camadas:
1. **Primitive:** cores hex, font sizes, spacing values encontrados
2. **Semantic:** mapeamento inferido (primary, secondary, background, text)
3. **Component:** tokens por componente (button-bg, card-border, etc.)

### Step 5: Generate inventory
Produzir JSON com schema:

```json
{
  "version": "1.0.0",
  "mode": "full|diff",
  "source_path": "path/to/make/output",
  "generated_at": "ISO8601",
  "summary": {
    "total_files": 0,
    "total_components": 0,
    "total_lines": 0,
    "duplication_index": 0.0,
    "unique_patterns": []
  },
  "components": [
    {
      "name": "ComponentName",
      "file": "relative/path.tsx",
      "type": "page|section|component|atom",
      "props": [{"name": "prop", "type": "string", "required": true}],
      "dependencies": ["OtherComponent"],
      "assets": ["image.png"],
      "style_approach": "inline|className|styled",
      "pattern_group": "card|list|form|modal|custom",
      "lines": 0
    }
  ],
  "tokens": {
    "primitive": {},
    "semantic": {},
    "component": {}
  },
  "hierarchy": {
    "pages": [],
    "sections": [],
    "components": [],
    "atoms": []
  }
}
```

### Step 6 (Diff mode only): Compare
1. Carregar inventario existente do projeto (se houver)
2. Diff por componente: added / modified / removed
3. Detectar breaking changes (props removidos, tipos alterados)
4. Gerar `figma-make-diff.json` com delta

## Definition of Done

- [ ] Inventario JSON gerado sem erros de parse
- [ ] Todos os componentes do diretorio Make catalogados
- [ ] Tokens extraidos em 3 camadas (primitive/semantic/component)
- [ ] Hierarquia mapeada (page → atom)
- [ ] Indice de duplicacao calculado
- [ ] Em diff mode: delta correto (added/modified/removed)

## When to Use
- Use according to the triggers described in the description/use-when list.

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Related artifacts
- `skills/make-code-triage/SKILL.md` — classifica output apos analise
- `skills/component-dedup/SKILL.md` — deduplica componentes similares
- `skills/design-to-code/SKILL.md` — converte designs em codigo
- `rules/project-docs-convention.md` — onde salvar inventarios
