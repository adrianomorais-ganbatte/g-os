---
name: design-to-code
description: Converte designs Figma ou screenshots em componentes React com tv() + Base UI quando há referência visual clara.
argument-hint: "[descricao do componente ou 'analisar' para analise do design]"
use-when:
  - receber screenshot ou frame Figma para converter em React
  - criar componente a partir de referencia visual
  - implementar design system a partir de especificacao visual
  - pedidos de "design to code", "Figma to code", "converter design"
  - figma mcp
  - figma url
do-not-use-for:
  - criacao de componente sem referencia visual (use fe)
  - debug de componentes existentes (use react-doctor ou weweb-debug)
  - trabalho Vue/WeWeb (use fe com stack Vue)
metadata:
  category: document-asset
---

# Skill: Design to Code

## When to Use this skill
- Converta frames Figma ou screenshots em componentes React.
- Estruture variações com tv()/Base UI seguindo o design system local.

## Do not use
- Sem insumo visual.
- Quando o stack não é React (use fe/Vue).

## Instructions
1) Leia referências do projeto (design system, tokens, tv()).
2) Gere esqueleto do componente com variações declaradas.
3) Garantir Story/Preview se o projeto usar (ex.: .stories.tsx).

## Task
$ARGUMENTS

## MANDATORY: Read References First

Antes de qualquer codigo:
- `./.a8z/libraries/frontend/tailwind-variants.md` — tv(), VariantProps, twMerge
- `./.a8z/libraries/frontend/base-ui.md` — Dialog, Tabs, Select, Menu headless
- `./.a8z/libraries/frontend/tailwindcss.md` — Tailwind v4, @theme, CSS variables
- `./.a8z/rules/react-architecture.md` — convencoes de arquivo, acessibilidade

## Stack Detection

Detectar stack do projeto antes de implementar:

| Encontrado | Pattern a usar |
|-----------|---------------|
| `tailwind-variants` em package.json | `tv()` + `twMerge()` — ver tailwind-variants.md |
| `@base-ui/react` em package.json | Base UI headless + tv() styling |
| `components/ui/` com shadcn | `cn()` + Radix — ver shadcn.md |
| Nenhum | Perguntar ao usuario |

## Phase 1 — Design Analysis

Analisar o design antes de escrever codigo:

1. **Identificar componente(s):** quantos arquivos serao criados?
2. **Mapear variantes:** quais estados visuais existem? (hover, disabled, selected, sizes)
3. **Identificar compound structure:** o componente tem sub-partes? (Card + CardHeader + CardTitle)
4. **Mapear cores para tokens semanticos:**
   - Fundo branco -> `bg-surface`
   - Texto principal -> `text-foreground`
   - Texto secundario -> `text-muted-foreground`
   - Bordas -> `border-border`
   - Acao primaria -> `bg-primary text-primary-foreground`
   - Erro/destruicao -> `bg-destructive text-destructive-foreground`
5. **Identificar componentes headless necessarios:** Dialog? Tabs? Select? Menu?

## Phase 2 — Implementation

### Padrao base (projetos com tv())

```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export const componentVariants = tv({
  base: [
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: {
    variant: {
      default: 'bg-surface border-border text-foreground',
      primary: 'bg-primary border-primary text-primary-foreground',
    },
    size: {
      sm: 'h-6 px-2 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

export interface MyComponentProps
  extends ComponentProps<'div'>,
    VariantProps<typeof componentVariants> {}

export function MyComponent({ className, variant, size, ...props }: MyComponentProps) {
  return (
    <div
      data-slot="my-component"
      className={twMerge(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### Regras de nomenclatura

- **Arquivo:** `user-card.tsx` (lowercase-hyphen) ou `UserCard.tsx` (PascalCase) — seguir convencao do projeto
- **Exports:** sempre named, nunca default
- **Sem barrel files** (`index.ts`) para pastas internas de componentes

### Icones

```tsx
// Lucide React — importar individualmente (tree-shaking)
import { Check, X, ChevronDown, Loader2 } from 'lucide-react'

// Tamanho via className
<Check className="size-4" />

// Icones em variantes de button — controle via [&_svg]:
'[&_svg]:size-3.5'  // em buttonVariants.variants.size.md

// Botoes icon-only OBRIGATORIAMENTE com aria-label
<button aria-label="Fechar">
  <X className="size-4" aria-hidden />
</button>
```

## Phase 3 — Acessibilidade

Checklist obrigatorio:

```tsx
// 1. Focus visible em todos os interativos
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

// 2. aria-label em icon-only buttons
<button aria-label="Remover item"><Trash2 className="size-4" aria-hidden /></button>

// 3. Roles semanticos quando necessario
<nav aria-label="Breadcrumb">
<div role="alert">{errorMessage}</div>

// 4. Contraste — use tokens do design system (nao cores hardcoded)
text-foreground        // contraste garantido sobre bg-surface
text-primary-foreground // contraste garantido sobre bg-primary
```

## Phase 4 — Output Format

Para cada componente gerado, entregar:

1. **Codigo completo** com imports, types, funcao e exports
2. **Exemplo de uso** mostrando todas as variantes
3. **Notas de customizacao** — como sobrescrever via className

## DoD Final

- [ ] Stack detectado — pattern correto aplicado
- [ ] Arquivo com nomenclatura correta (seguir convencao do projeto)
- [ ] Named exports apenas
- [ ] `ComponentProps<'elemento'>` + `VariantProps` para tipagem
- [ ] `tv()` para variantes, `twMerge()` para merge de className
- [ ] `data-slot` no elemento raiz
- [ ] Estados via `data-[state]:` selectors
- [ ] Apenas tokens semanticos (sem cores hardcoded)
- [ ] Focus visible em elementos interativos
- [ ] `aria-label` em botoes icon-only
- [ ] `{...props}` spread no final
- [ ] Sem `forwardRef` (React 19)
- [ ] Sem default exports
- [ ] Sem barrel files para pastas internas

## Figma MCP Mode

Quando o Figma MCP esta disponivel, esta skill pode operar com dados estruturados ao inves de screenshots, obtendo informacoes muito mais ricas sobre o design.

### Deteccao

No inicio da execucao, verificar se a tool `get_figma_data` esta acessivel:

1. **Verificar se Figma MCP esta configurado** — checar `.mcp.json` por `figma-mcp`
2. **Verificar se a tool existe** — tentar chamar `get_figma_data` com um file_key de teste
3. **Se disponivel:** usar Figma MCP Mode (dados estruturados)
4. **Se nao disponivel:** manter Screenshot Mode (comportamento padrao)

### Figma MCP Mode — Fluxo

Quando MCP esta ativo e o usuario fornece uma URL Figma:

1. **Extrair `file_key` e `node_id`** da URL Figma
2. **Chamar `get_figma_data`** para obter dados estruturados do node:
   - Layout completo (auto-layout, spacing, padding, alignment)
   - Propriedades visuais (fills, strokes, effects, cornerRadius)
   - Tipografia exata (fontFamily, fontSize, fontWeight, lineHeight)
   - Hierarquia de nodes filhos
   - Variables Figma aplicadas (com referencia ao token original)
   - Variantes do componente (se for component set)
3. **Consultar `.figma-design-system-rules`** (se existir) para mapeamentos
4. **Prosseguir com Phase 1 — Design Analysis** usando dados MCP ao inves de analise visual

### Vantagens sobre Screenshot Mode

| Aspecto | Screenshot Mode | Figma MCP Mode |
|---------|----------------|----------------|
| Cores | Estimativa visual (pode errar) | Valor exato + variable reference |
| Espacamento | Estimativa por pixel | Valor exato do auto-layout |
| Tipografia | Inferencia visual | fontFamily, size, weight exatos |
| Variantes | Precisa de multiplos screenshots | Todas as variantes em uma chamada |
| Tokens | Inferencia por proximidade | Variable ID direto do Figma |
| Hierarquia | Flat (o que se ve) | Arvore completa de nodes |

### Fallback para Screenshot Mode

Se o MCP nao estiver configurado ou falhar:

1. **Informar o usuario:** "Figma MCP nao disponivel. Usando modo screenshot."
2. **Continuar com o fluxo padrao** (Phase 1-4 existentes)
3. **Sugerir configuracao:** "Para resultados mais precisos, configure o Figma MCP em `.mcp.json`."

### Exemplo de uso com MCP

```
Usuario: "Converta este frame para React: https://www.figma.com/design/abc123/MyProject?node-id=42-100"

1. Detectar MCP disponivel -> OK
2. get_figma_data({ file_key: "abc123", node_id: "42:100" })
3. Parsear: Frame "UserCard" com auto-layout vertical, gap=16, padding=24
   - Text "UserCard/Title": Inter 18px/700
   - Text "UserCard/Description": Inter 14px/400
   - Frame "UserCard/Actions": auto-layout horizontal, gap=8
     - Instance "Button/Primary"
     - Instance "Button/Secondary"
4. Consultar rules -> Button mapeado para @/components/ui/button
5. Gerar componente UserCard.tsx com tv() e imports corretos
```

## Model guidance

| Scope | Model |
|-------|-------|
| Componente simples (Button, Badge, Tag) | `sonnet` |
| Compound component (Card, Form, Table) | `sonnet` |
| Design system completo (10+ componentes) | `opus` |
