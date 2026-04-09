# Guia: Setup do ambiente (Dev Junior)

> Siga estes passos na ordem. Cada passo tem o comando exato a executar.

## Pré-requisitos

- Node.js 20+ (`node -v`)
- pnpm (`pnpm -v`) — se não tiver: `npm install -g pnpm`
- Git configurado com SSH
- Acesso ao projeto Supabase (pedir ao líder técnico)

## 1. Clonar o repositório

```bash
git clone git@github.com:ganbatte-dev/Ganbatte.git
cd Ganbatte
pnpm install
```

## 2. Scaffold Next.js (se ainda não existir)

```bash
cd packages/fractus
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

## 3. Instalar dependências do Fractus

```bash
# Supabase
pnpm install @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npx shadcn@latest add button input label textarea select checkbox radio-group switch badge card dialog sheet drawer tabs table popover dropdown-menu command alert-dialog alert tooltip hover-card accordion collapsible calendar avatar skeleton slider toggle breadcrumb progress pagination separator sonner scroll-area

# Formulários + validação
pnpm install zod react-hook-form @hookform/resolvers

# Gráficos + utilidades
pnpm install recharts motion sonner date-fns papaparse nanoid @dnd-kit/core @dnd-kit/sortable lucide-react

# Dev
pnpm install -D vitest @testing-library/react @testing-library/jest-dom playwright @playwright/test eslint-config-prettier prettier

# Supabase CLI
pnpm install -D supabase
```

## 4. Configurar variáveis de ambiente

Criar `packages/fractus/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://szaxyfuhhgkzxazeexgm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_nFoZeRhv-CHLE5SNcvAQ9w_ft6sx3uV
```

> Pedir `DATABASE_URL`, `DIRECT_URL` e `SUPABASE_SERVICE_ROLE_KEY` ao líder técnico. Nunca commitar.

## 5. Configurar Supabase CLI

```bash
npx supabase init
npx supabase link --project-ref szaxyfuhhgkzxazeexgm
```

## 6. Gerar tipos TypeScript

```bash
npx supabase gen types typescript --linked > src/types/database.ts
```

> Rodar sempre que alterar o schema.

## 7. Configurar Mulish font

Em `app/layout.tsx`:

```tsx
import { Mulish } from 'next/font/google';

const mulish = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mulish',
});
```

## 8. Verificar

```bash
pnpm dev          # Dev server funciona?
pnpm build        # Build passa?
pnpm storybook    # Storybook roda? (após setup)
```

## Próximos passos

- Ler `docs/prompts/start-projeto.md` — guia completo de execução
- Ler ADRs em `packages/fractus/docs/adr/` — entender decisões arquiteturais
- Consultar `docs/fractus/sprint-track-frontend.md` ou `sprint-track-backend.md` — suas tasks
