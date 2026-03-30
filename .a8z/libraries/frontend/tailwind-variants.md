# Tailwind Variants — Component Variant System

> **tailwind-variants** aplica o poder de variantes ao Tailwind CSS, inspirado em CVA. Suporta slots, compound variants e integra com tailwind-merge.

## Quando usar

- Componentes com variantes visuais (variant, size, color, state)
- Design systems onde variantes precisam ser tipadas
- Substituir strings de classe condicionais longas com logica declarativa
- Projetos com Tailwind v4 — tv() eh o padrao preferido

## Instalacao

```bash
npm install tailwind-variants tailwind-merge
```

## Padrao Base

```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export const buttonVariants = tv({
  base: [
    'inline-flex cursor-pointer items-center justify-center font-medium rounded-lg border transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: {
    variant: {
      primary: 'border-primary bg-primary text-primary-foreground hover:bg-primary-hover',
      secondary: 'border-border bg-secondary text-secondary-foreground hover:bg-muted',
      ghost: 'border-transparent bg-transparent text-muted-foreground hover:text-foreground',
      destructive: 'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    size: {
      sm: 'h-6 px-2 gap-1.5 text-xs [&_svg]:size-3',
      md: 'h-7 px-3 gap-2 text-sm [&_svg]:size-3.5',
      lg: 'h-9 px-4 gap-2.5 text-base [&_svg]:size-4',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      data-slot="button"
      data-disabled={disabled ? '' : undefined}
      className={twMerge(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
```

## Compound Variants

Aplica classes extras quando combinacoes especificas de variantes ocorrem:

```tsx
const badgeVariants = tv({
  base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  variants: {
    variant: {
      solid: '',
      outline: 'border bg-transparent',
    },
    color: {
      blue: '',
      red: '',
      green: '',
    },
  },
  compoundVariants: [
    { variant: 'solid', color: 'blue', class: 'bg-blue-500 text-white' },
    { variant: 'solid', color: 'red', class: 'bg-red-500 text-white' },
    { variant: 'outline', color: 'blue', class: 'border-blue-500 text-blue-700' },
    { variant: 'outline', color: 'red', class: 'border-red-500 text-red-700' },
  ],
  defaultVariants: { variant: 'solid', color: 'blue' },
})
```

## Slots (Compound Components com tv)

Slots permitem aplicar variantes a multiplos elementos de um compound component:

```tsx
const cardVariants = tv({
  slots: {
    root: 'rounded-xl border border-border bg-surface shadow-sm',
    header: 'flex flex-col gap-1.5 p-6',
    title: 'font-semibold leading-none tracking-tight',
    content: 'p-6 pt-0',
    footer: 'flex items-center p-6 pt-0',
  },
  variants: {
    size: {
      sm: { root: 'p-4', header: 'p-4', content: 'p-4 pt-0', footer: 'p-4 pt-0' },
      md: { root: '', header: 'p-6', content: 'p-6 pt-0', footer: 'p-6 pt-0' },
    },
  },
  defaultVariants: { size: 'md' },
})

// Extraindo slots individualmente
const { root, header, title, content, footer } = cardVariants()

// Ou passando variantes
const { root: rootClass } = cardVariants({ size: 'sm' })
```

## Regras de uso

- **Sempre usar `twMerge()`** ao compor `className` do usuario: `twMerge(variants({...}), className)`
- **`VariantProps<typeof variants>`** para tipos — nao definir variantes manualmente
- **`defaultVariants`** obrigatorio — evita props undefined quebrarem a renderizacao
- **Named exports** para variantes: `export const buttonVariants = tv({...})`
- Exportar a funcao `variants` separada do componente para reutilizar em outros contextos (ex: links estilizados como botao)

## twMerge — Class Composition

```tsx
import { twMerge } from 'tailwind-merge'

// Merge correto — className do usuario tem precedencia
className={twMerge('base-classes', className)}

// Sem twMerge — conflitos de classe Tailwind
className={`base-classes ${className}`}  // ERRADO — pode ter conflito bg-red-500 + bg-blue-500

// Com twMerge — ultima classe vence
twMerge('bg-red-500', 'bg-blue-500')  // -> 'bg-blue-500'
twMerge('px-2 py-1', 'p-3')          // -> 'p-3'
```

## Quando tv() vs cn()

| Cenario | Ferramenta |
|---------|-----------|
| Projeto com shadcn/ui | `cn()` da `lib/utils` |
| Design system custom (Base UI) | `tv()` + `twMerge()` |
| Componente com multiplas variantes tipadas | `tv()` |
| Merge simples de classes condicionais | `cn()` ou `twMerge()` |

Em projetos shadcn/ui, `cn()` = `clsx()` + `twMerge()`. Em projetos Base UI ou design systems custom, use `tv()` + `twMerge()` diretamente.
