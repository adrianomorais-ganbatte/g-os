---
name: figma-implement-design
description: >
  Converte designs Figma em codigo usando MCP direto e convencoes do projeto.
  Recebe URL de frame/componente Figma, le dados via get_figma_data, consulta
  o arquivo .figma-design-system-rules para mapeamento, e gera componente React
  com tv()/shadcn conforme stack detectado. Respeita tokens e variaveis existentes.
  Triggers: "implementar design", "figma para codigo", "converter frame".
argument-hint: "<URL do frame ou componente Figma>"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit]
use-when:
  - implementar design
  - figma para codigo
  - converter frame
  - implement figma design
  - figma to code
  - convert figma frame
  - gerar componente a partir do figma
do-not-use-for:
  - converter screenshot em codigo (use design-to-code)
  - criar componentes no Figma (use figma-canvas)
  - gerar library completa (use figma-generate-library)
  - extrair design tokens de app web (use designkit)
metadata:
  category: frontend
---

# Figma Implement Design — Figma to Code via MCP

Converte designs Figma em codigo de producao usando dados estruturados do MCP, garantindo fidelidade ao design e aderencia as convencoes do projeto.

**Announce at start:** "Estou usando figma-implement-design para converter o design Figma em codigo via MCP."

## Prerequisites

- Figma MCP configurado em `.mcp.json` (server `figma-mcp`)
- Arquivo `.figma-design-system-rules` no projeto (opcional, mas recomendado)
- Acesso ao arquivo Figma via URL

## MANDATORY: Read References First

Antes de gerar qualquer codigo, ler:
- `./.figma-design-system-rules` — mapeamento componentes Figma → codigo
- `./.a8z/libraries/frontend/tailwind-variants.md` — tv(), VariantProps, twMerge
- `./.a8z/libraries/frontend/base-ui.md` — Dialog, Tabs, Select, Menu headless
- `./.a8z/libraries/frontend/tailwindcss.md` — Tailwind v4, @theme, CSS variables
- `./.a8z/rules/react-architecture.md` — convencoes de arquivo, acessibilidade

## Flow Completo

### Step 1: Receive and Parse Figma URL

1. **Receber URL** do frame/componente (formato: `https://www.figma.com/design/<file_key>/<name>?node-id=<X>-<Y>`)
2. **Extrair parametros:**
   - `file_key` — identificador do arquivo
   - `node_id` — ID do node (converter `X-Y` do URL para `X:Y` do API)
3. **Validar** que a URL e acessivel

### Step 2: Read Design Data via MCP

1. **Chamar `get_figma_data`** com file_key e node_id:
   ```
   get_figma_data({
     file_key: "<file_key>",
     node_id: "<node_id>"
   })
   ```
2. **Parsear resposta** extraindo:
   - **Layout:** auto-layout direction, spacing, padding, alignment
   - **Visual:** fills (cores), strokes (bordas), effects (sombras), cornerRadius
   - **Typography:** fontFamily, fontSize, fontWeight, lineHeight, letterSpacing
   - **Hierarquia:** filhos, nesting, component instances
   - **Variables:** quais variables Figma estao aplicadas
   - **Variantes:** se for component set, listar todas as variantes
   - **Component properties:** booleans, text, instance swaps

### Step 3: Consult Design System Rules

1. **Ler `.figma-design-system-rules`** se existir
2. **Para cada componente/instancia detectada:**
   - Buscar mapeamento `figma_name` → `code_path`, `code_import`
   - Buscar mapeamento de variantes `figma_variant` → `code_prop`
3. **Para cada token/variavel:**
   - Buscar mapeamento `figma_variable` → `code_variable` / `tailwind_class`
4. **Se rules nao existir:**
   - Inferir mapeamentos a partir de naming conventions
   - Alertar usuario que `.figma-design-system-rules` nao foi encontrado

### Step 4: Detect Project Stack

Antes de gerar codigo, detectar stack:

| Encontrado | Pattern a usar |
|-----------|---------------|
| `tailwind-variants` em package.json | `tv()` + `twMerge()` |
| `@base-ui/react` em package.json | Base UI headless + tv() styling |
| `components/ui/` com shadcn | `cn()` + Radix / Base UI |
| Nenhum | Perguntar ao usuario |

### Step 5: Generate Component Code

1. **Definir estrutura do componente:**
   - Nome: derivar do nome do Figma node (PascalCase)
   - Props: mapear Figma properties para React props
   - Variantes: mapear Figma variants para tv() variants
2. **Mapear estilos:**

   | Figma Property | Codigo |
   |---------------|--------|
   | fills[0].color | `bg-{token}` ou `style={{ backgroundColor }}` |
   | strokes[0].color | `border-{token}` |
   | effects[type=DROP_SHADOW] | `shadow-{token}` |
   | cornerRadius | `rounded-{token}` |
   | auto-layout.direction VERTICAL | `flex flex-col` |
   | auto-layout.direction HORIZONTAL | `flex flex-row` |
   | auto-layout.itemSpacing | `gap-{value}` |
   | auto-layout.padding | `p-{value}` ou `px-{x} py-{y}` |
   | text.fontSize | `text-{size}` |
   | text.fontWeight | `font-{weight}` |

3. **Gerar codigo** seguindo pattern do stack:

```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export const myComponentVariants = tv({
  base: [
    // Base styles from Figma auto-layout + fills
    'flex flex-col gap-4 p-6 rounded-lg',
    'bg-surface border border-border',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ],
  variants: {
    // Mapped from Figma component variants
    variant: {
      default: 'bg-surface border-border text-foreground',
      primary: 'bg-primary border-primary text-primary-foreground',
    },
    size: {
      sm: 'p-4 gap-2 text-sm',
      md: 'p-6 gap-4 text-base',
      lg: 'p-8 gap-6 text-lg',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

export interface MyComponentProps
  extends ComponentProps<'div'>,
    VariantProps<typeof myComponentVariants> {}

export function MyComponent({ className, variant, size, ...props }: MyComponentProps) {
  return (
    <div
      data-slot="my-component"
      className={twMerge(myComponentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### Step 6: Handle Nested Components

Para componentes compostos (compound):

1. **Identificar sub-componentes** na hierarquia Figma
2. **Verificar se ja existem** no codebase (via rules ou glob)
3. **Se existem:** importar e reutilizar
4. **Se nao existem:** gerar cada sub-componente recursivamente
5. **Compor** o componente pai usando os filhos

### Step 7: Respect Existing Tokens

1. **Nunca hardcodar cores** — usar tokens semanticos
2. **Mapear variables Figma** para CSS custom properties existentes
3. **Se token nao existir:**
   - Verificar se ha token similar (fuzzy match)
   - Sugerir criacao do token ao usuario
   - Usar valor mais proximo temporariamente

## Output

Para cada componente gerado, entregar:

1. **Codigo completo** com imports, types, variantes e exports
2. **Mapeamento** — tabela mostrando Figma property → codigo
3. **Exemplo de uso** com todas as variantes
4. **Dependencias** — componentes/tokens que precisam existir
5. **Notas** — divergencias entre design e implementacao (se houver)

## DoD (Definition of Done)

- [ ] Dados lidos via MCP (nao screenshot)
- [ ] Rules file consultado (se existente)
- [ ] Stack detectado — pattern correto aplicado
- [ ] Named exports apenas
- [ ] `ComponentProps<'elemento'>` + `VariantProps` para tipagem
- [ ] `tv()` para variantes, `twMerge()` para merge de className
- [ ] `data-slot` no elemento raiz
- [ ] Apenas tokens semanticos (sem cores hardcoded)
- [ ] Variables Figma mapeadas para tokens codigo
- [ ] Focus visible em elementos interativos
- [ ] `aria-label` em botoes icon-only
- [ ] Sem `forwardRef` (React 19)
- [ ] Sem default exports
- [ ] Componentes filhos reutilizados quando existentes

## Error Handling

| Erro | Acao |
|------|------|
| MCP nao disponivel | Fallback para design-to-code (screenshot mode) |
| Node nao encontrado | Verificar URL e pedir confirmacao |
| Rules file ausente | Inferir mapeamentos + alertar usuario |
| Token nao mapeado | Usar valor mais proximo + documentar |

## Model Guidance

| Scope | Model |
|-------|-------|
| Componente simples (Button, Badge, Tag) | `sonnet` |
| Compound component (Card, Form, Table) | `sonnet` |
| Page inteira (Dashboard, Settings) | `opus` |
| Design system completo (10+ componentes) | `opus` |
