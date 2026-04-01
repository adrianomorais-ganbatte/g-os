# shadcn/ui — guia rápido

> **shadcn/ui** é uma coleção de componentes React reutilizáveis construídos com Radix UI e Tailwind CSS que você copia e cola em seus projetos ([https://ui.shadcn.com](https://ui.shadcn.com))

## Quando usar
* Projetos que usam Tailwind CSS
* Desenvolvimento que requer customização total dos componentes
* Times que preferem ownership do código ao invés de dependências
* Aplicações que precisam de acessibilidade robusta (Radix UI)

## Instalação
```bash
# Inicializar shadcn/ui no projeto
npx shadcn-ui@latest init

# Adicionar componentes específicos
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

## Configuração

### Setup inicial
```bash
# Responder as perguntas de configuração:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Estrutura gerada
```
components/
  ui/
    button.tsx
    card.tsx
    dialog.tsx
lib/
  utils.ts
```

### Componente Button
```tsx
import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  return (
    <div className="space-x-2">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}
```

### Card Component
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CardDemo() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            {/* Form content */}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  )
}
```

### Dialog/Modal
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  )
}
```