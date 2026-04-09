# Base UI React — Headless Components

> **Base UI** (by MUI) fornece primitivos de UI sem estilo para construir design systems acessiveis. Alternativa ao Radix UI usada em projetos com design system proprio.

## Quando usar

- Design systems com estilizacao totalmente customizada (sem shadcn/ui)
- Projetos que precisam de primitivos acessiveis sem opiniao visual
- Alternativa ao Radix UI quando a API eh preferida
- Projetos React 19 com Tailwind v4 e tv()

## shadcn/ui vs Base UI

Sao **alternativas, nao complementares**:

| | shadcn/ui (Radix) | Base UI |
|--|-------------------|---------|
| Instalacao | Copy-paste de componentes | npm package |
| Estilo default | Tailwind + CSS vars | Nenhum |
| API | Radix UI primitives | Base UI primitives |
| Customizacao | Alta (voce possui o codigo) | Alta (CSS/Tailwind externo) |
| Melhor para | Projetos que querem componentes prontos | Design systems do zero |

## Instalacao

```bash
npm install @base-ui/react
```

## Componentes principais

### Dialog

```tsx
import * as Dialog from '@base-ui/react/dialog'

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-xl border border-border shadow-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold text-foreground">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground" />
          <div className="mt-4">{children}</div>
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <X className="size-4" aria-hidden />
            <span className="sr-only">Fechar</span>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Tabs

```tsx
import * as Tabs from '@base-ui/react/tabs'

export function TabsExample() {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List className="flex border-b border-border">
        <Tabs.Tab
          value="overview"
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[selected]:text-foreground data-[selected]:border-b-2 data-[selected]:border-primary"
        >
          Visao Geral
        </Tabs.Tab>
        <Tabs.Tab
          value="details"
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[selected]:text-foreground data-[selected]:border-b-2 data-[selected]:border-primary"
        >
          Detalhes
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview" className="py-4">Conteudo aba 1</Tabs.Panel>
      <Tabs.Panel value="details" className="py-4">Conteudo aba 2</Tabs.Panel>
    </Tabs.Root>
  )
}
```

### Select

```tsx
import * as Select from '@base-ui/react/select'

export function SelectField({ value, onValueChange, options, placeholder }: SelectFieldProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring data-[placeholder]:text-muted-foreground">
        <Select.Value placeholder={placeholder} />
        <ChevronDown className="size-4 opacity-50" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface shadow-md">
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-foreground outline-none hover:bg-muted data-[highlighted]:bg-muted data-[selected]:font-medium"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2">
                    <Check className="size-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
```

### Menu (Dropdown)

```tsx
import * as Menu from '@base-ui/react/menu'

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 shadow-md">
            {items.map((item) => (
              <Menu.Item
                key={item.label}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-foreground outline-none hover:bg-muted data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={item.onClick}
                disabled={item.disabled}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
```

## Padroes de estilo com data-attributes

Base UI expoe estado via data-attributes CSS — use em vez de logica condicional de classe:

```tsx
// Estados disponiveis por componente
data-[selected]     // Tabs.Tab, Select.Item — selecionado
data-[highlighted]  // Select.Item, Menu.Item — hover/foco via teclado
data-[disabled]     // qualquer item desabilitado
data-[open]         // Dialog.Popup, Select.Popup quando aberto
data-[placeholder]  // Select.Value quando sem valor

// Uso em Tailwind
className="data-[selected]:border-b-2 data-[disabled]:opacity-50 data-[open]:animate-in"
```

## Acessibilidade nativa

Base UI implementa WAI-ARIA automaticamente:
- `role`, `aria-*` aplicados sem configuracao adicional
- Navegacao por teclado (Tab, Enter, Esc, setas) incluida
- Focus trapping em Dialog
- Anuncios de screen reader automaticos

Foco do desenvolvedor: apenas `aria-label` em botoes icon-only e `sr-only` em spans descritivos.

## Composicao com tv()

```tsx
// Combinacao ideal: Base UI (comportamento) + tv() (estilo)
const tabVariants = tv({
  base: 'px-4 py-2 text-sm font-medium transition-colors',
  variants: {
    state: {
      inactive: 'text-muted-foreground hover:text-foreground',
      active: 'text-foreground border-b-2 border-primary',
    },
  },
})

<Tabs.Tab
  className={twMerge(
    tabVariants({ state: isSelected ? 'active' : 'inactive' }),
    className
  )}
>
```
