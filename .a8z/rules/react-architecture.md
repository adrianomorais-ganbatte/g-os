# Frontend Architecture — Scalable Patterns

**Applies to:** All frontend projects under A8Z framework (React, Next.js, Vue/WeWeb).
**Goal:** Prevent codebase entropy by enforcing conventions from day one.
**Libraries:** See `libraries/frontend/react-patterns.md`, `nextjs-patterns.md`, `vue-weweb-patterns.md` for code examples.

---

## 1. Feature-Based Folder Structure

Organize code **by feature**, not by type. Each feature is self-contained with its own components, hooks, services, and state.

```
src/
  features/
    auth/
      components/       # UI components specific to auth
        LoginForm.tsx
        SignupForm.tsx
      hooks/            # Custom hooks for auth
        useAuth.ts
        useSession.ts
      services/         # API calls for auth
        authService.ts
      store/            # State management (slice/atoms)
        authSlice.ts
      types.ts          # Types specific to auth
      index.ts          # Public API — re-exports only
    dashboard/
      components/
      hooks/
      services/
      index.ts
    users/
      ...

  components/           # Shared/generic components (Button, Modal, Card)
  hooks/                # Shared hooks (useDebounce, useFetch, useMediaQuery)
  services/             # Shared services (httpClient, storage, analytics)
  layouts/              # App layouts (MainLayout, AuthLayout)
  routes/               # Route definitions and guards
  store/                # Global state setup (Redux store, Zustand stores)
  lib/                  # Utilities, constants, type helpers
  pages/                # Page-level entry points (thin wrappers)
```

### Rules

- **New feature = new folder** under `features/`.
- Each feature folder has an `index.ts` that controls the public API.
- **Never import from another feature's internal files.** Only from its `index.ts`.
- Shared code goes in top-level `components/`, `hooks/`, `services/`.
- A component used by only one feature **stays inside that feature**.
- When a component is used by 3+ features, **promote it** to shared `components/`.

---

## 2. Component Responsibility

### Presentation Components (UI)
- Receive data via props
- No business logic, no API calls, no state management
- Pure rendering + user event callbacks
- Easy to test, easy to reuse

```tsx
// features/users/components/UserCard.tsx — PRESENTATION
interface UserCardProps {
  name: string;
  email: string;
  onEdit: () => void;
}

export function UserCard({ name, email, onEdit }: UserCardProps) {
  return (
    <Card>
      <CardTitle>{name}</CardTitle>
      <p>{email}</p>
      <Button onClick={onEdit}>Edit</Button>
    </Card>
  );
}
```

### Container Components (Logic)
- Fetch data, manage state, handle side effects
- Compose presentation components
- Own the "wiring" between data and UI

```tsx
// features/users/components/UserCardContainer.tsx — CONTAINER
export function UserCardContainer({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId);
  const navigate = useNavigate();

  if (isLoading) return <Skeleton />;
  if (!user) return null;

  return (
    <UserCard
      name={user.name}
      email={user.email}
      onEdit={() => navigate(`/users/${userId}/edit`)}
    />
  );
}
```

### When to split

- Component > 150 lines? **Split.**
- Component does API calls AND renders complex UI? **Split.**
- Component is reused but with different data sources? **Extract presentation.**

---

## 3. Service Layer (UI -> Hook -> Service -> API)

Never call APIs directly from components. Follow this flow:

```
Component  -->  Hook  -->  Service  -->  HTTP Client
   (UI)       (state)    (business)     (transport)
```

### Service

```tsx
// features/auth/services/authService.ts
import { httpClient } from '@/services/httpClient';

export const authService = {
  login: (credentials: LoginDTO) =>
    httpClient.post<AuthResponse>('/auth/login', credentials),

  logout: () =>
    httpClient.post('/auth/logout'),

  getProfile: () =>
    httpClient.get<UserProfile>('/auth/me'),
};
```

### Hook

```tsx
// features/auth/hooks/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useAuth() {
  const profile = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authService.getProfile,
  });

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: () => profile.refetch(),
  });

  return { profile, login };
}
```

### Component

```tsx
// features/auth/components/LoginPage.tsx
export function LoginPage() {
  const { login } = useAuth();
  // Only cares about calling login.mutate() — doesn't know about HTTP
}
```

---

## 4. State Management Strategy

Use the **right tool for each state type**:

| State Type | Tool | When |
|-----------|------|------|
| UI-local | `useState` / `useReducer` | Form inputs, toggles, modals, collapse state |
| Server/API data | TanStack Query / SWR | Data from APIs (caching, revalidation, optimistic updates) |
| Global app state | Zustand / Redux Toolkit | Auth user, theme, permissions, sidebar state |
| URL state | TanStack Router / URL params | Filters, pagination, search, tabs |
| Ephemeral shared | React Context | Theme provider, toast provider (small, rarely updated) |

### Anti-patterns

- **DON'T** put server data in Redux/Zustand. Use TanStack Query.
- **DON'T** use Context for frequently updating values (causes re-renders).
- **DON'T** prop drill more than 2 levels. Extract to hook or context.
- **DON'T** create global state for data only one feature uses.

---

## 5. Performance Patterns

### Mandatory

- **Error Boundaries**: Wrap feature modules and critical UI sections.
- **Lazy loading**: Use `React.lazy()` + `Suspense` for route-level code splitting.
- **Loading states**: Every async operation must show loading feedback.

### Use When Needed

- **React.memo**: For components that re-render often but props rarely change (lists, heavy renders).
- **useMemo / useCallback**: For expensive computations or stable references in dependency arrays. Don't use by default — only when profiling shows a problem.
- **Virtualization**: For lists with 100+ items (use `@tanstack/react-virtual`).

### Avoid

- Premature optimization. Profile first, optimize second.
- Wrapping every component in `React.memo`.
- Using `useMemo` for trivial computations.

---

## 6. Error Handling

```tsx
// Hierarchy: App ErrorBoundary > Feature ErrorBoundary > Component try/catch

// Route-level
<ErrorBoundary fallback={<FullPageError />}>
  <Suspense fallback={<PageSkeleton />}>
    <LazyDashboard />
  </Suspense>
</ErrorBoundary>

// Feature-level
<ErrorBoundary fallback={<FeatureError feature="users" />}>
  <UserList />
</ErrorBoundary>

// API errors — handled in hooks, surfaced via toasts
const { mutate } = useMutation({
  mutationFn: userService.create,
  onError: (error) => toast({ title: error.message, variant: 'destructive' }),
});
```

---

## 7. Testing Strategy for React

| Layer | Tool | What to Test |
|-------|------|-------------|
| Components (unit) | Vitest + Testing Library | Render, user interactions, accessibility |
| Hooks (unit) | Vitest + renderHook | State transitions, side effects |
| Integration | Vitest + MSW | Feature flows (hook + service + mock API) |
| E2E | Playwright | Critical user journeys |

### Priority
1. **P0**: Business logic in hooks and services
2. **P1**: User interactions in critical components
3. **P2**: Integration tests for feature flows
4. **Skip**: Presentation-only components with no logic

---

## 8. File Naming Conventions

```
PascalCase.tsx    — Components (UserCard.tsx, LoginForm.tsx) — PADRAO DEFAULT
camelCase.ts      — Hooks (useAuth.ts), services (authService.ts), utils
kebab-case.ts     — Config files, route definitions
UPPER_CASE.ts     — Constants (API_ENDPOINTS.ts)
*.test.ts         — Test files (UserCard.test.tsx)
*.types.ts        — Type-only files (auth.types.ts)
index.ts          — Barrel exports (public API of a feature)
```

**Convencao alternativa (kebab-case para componentes):**

Alguns design systems (Rocketseat, shadcn/ui CLI) preferem kebab-case para todos os arquivos:

```
user-card.tsx     — Componente (kebab-case)
use-auth.ts       — Hook (kebab-case)
button.tsx        — UI primitive (kebab-case)
```

**Regra:** use a convencao que o projeto ja adota. Documente a escolha em `CLAUDE.md` do projeto. Nunca misture dentro do mesmo projeto.

---

## 9. Acessibilidade — Padroes Obrigatorios

```tsx
// Focus visible — todos os elementos interativos
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

// aria-label — obrigatorio em botoes icon-only
<button aria-label="Fechar dialogo">
  <X className="size-4" aria-hidden />
</button>

// sr-only — texto para screen readers em elementos visuais
<span className="sr-only">Carregando...</span>
<Loader2 className="size-4 animate-spin" aria-hidden />

// Roles explicitos quando o elemento nao eh semantico
<div role="alert" aria-live="polite">{errorMessage}</div>
<nav aria-label="Menu principal">

// Contraste — use tokens semanticos (nao cores hardcoded)
// text-foreground sobre bg-surface = garantido pelo design system
// Nao use cores brutas (text-gray-400 sobre bg-gray-200 = contraste indefinido)
```

---

## 10. Component Variant Pattern (tv())

Para componentes com variantes visuais, use `tailwind-variants`:

```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

const alertVariants = tv({
  base: 'relative w-full rounded-lg border p-4 text-sm',
  variants: {
    variant: {
      default: 'bg-surface text-foreground border-border',
      info: 'bg-blue-50 text-blue-900 border-blue-200',
      warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
      destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface AlertProps
  extends ComponentProps<'div'>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={twMerge(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}
```

Ver `libraries/frontend/tailwind-variants.md` para documentacao completa.

---

## Summary Checklist

Before every React PR, verify:

- [ ] New feature has its own folder under `features/`
- [ ] Components follow presentation/container split when complex
- [ ] API calls go through service layer, not directly in components
- [ ] State is in the right place (local/server/global/URL)
- [ ] No prop drilling beyond 2 levels
- [ ] Error boundaries wrap feature sections
- [ ] Route-level lazy loading for new pages
- [ ] Async operations have loading + error states
- [ ] Tests cover hooks and business logic (P0/P1)
- [ ] Interactive elements have focus-visible ring
- [ ] Icon-only buttons have aria-label
- [ ] Components with variants use tv() + VariantProps
- [ ] className composition uses twMerge() (or cn())
- [ ] data-slot on compound component elements
- [ ] No forwardRef (React 19 projects)

---

# Next.js Architecture — App Router Patterns

**Applies to:** Next.js 14+ projects using App Router.
**See:** `libraries/frontend/nextjs-patterns.md` for full code examples.

---

## 9. Next.js Folder Structure

```
app/
  (auth)/                 # Route group — no URL segment
    login/page.tsx
    signup/page.tsx
    layout.tsx            # Auth layout (centered, no sidebar)
  (dashboard)/            # Route group — protected
    layout.tsx            # Dashboard layout (sidebar, header)
    page.tsx              # Dashboard home
    users/
      page.tsx            # User list (Server Component)
      [id]/
        page.tsx          # User detail
        edit/page.tsx     # User edit (Client Component island)
    settings/
      page.tsx
  api/                    # Route Handlers (API)
    auth/
      [...nextauth]/route.ts
    users/route.ts
  layout.tsx              # Root layout (html, body, providers)
  error.tsx               # Global error boundary
  loading.tsx             # Global loading UI
  not-found.tsx           # 404 page

features/                 # Feature modules (same pattern as React)
  auth/
    components/
    hooks/
    actions/              # Server Actions
    services/
    types.ts
  users/
    ...

components/               # Shared UI components
lib/                      # Utilities, config, db client
```

## 10. Server vs Client Components

**Default: Server Components.** Only add `'use client'` when you need:
- `useState`, `useEffect`, or other hooks
- Browser APIs (window, localStorage)
- Event handlers (onClick, onChange)
- Third-party client libraries

### The Boundary Pattern

```
Server Component (page.tsx)     — Fetches data, renders structure
  └── Client Component island   — Handles interactivity
```

Push `'use client'` as far down the tree as possible.

## 11. Data Flow in Next.js

| Pattern | When |
|---------|------|
| Server Components + `fetch` | Read-only data display (lists, details) |
| Server Actions | Mutations (forms, create/update/delete) |
| Route Handlers (`app/api/`) | External webhooks, third-party integrations |
| TanStack Query (client) | Real-time data, optimistic updates, complex cache |

### Server Actions over API routes for mutations

```tsx
// features/users/actions/createUser.ts
'use server';

export async function createUser(formData: FormData) {
  const data = Object.fromEntries(formData);
  // validate, save, revalidate
  revalidatePath('/users');
}
```

## 12. Caching & Revalidation Strategy

| Strategy | Config | Use Case |
|----------|--------|----------|
| Static | `export const revalidate = 3600` | Marketing pages, docs |
| ISR | `revalidate: 60` in fetch | Product lists, dashboards |
| Dynamic | `export const dynamic = 'force-dynamic'` | User-specific data |
| On-demand | `revalidatePath()` / `revalidateTag()` | After mutations |

## 13. Next.js Performance

- **Streaming**: Use `loading.tsx` per route segment for instant perceived load.
- **Parallel routes**: Use `@modal` slots for modal routing without full page loads.
- **Image optimization**: Always use `next/image` with `sizes` prop.
- **Font optimization**: Use `next/font` for zero-CLS font loading.
- **Metadata API**: Use `generateMetadata()` for dynamic SEO per page.

---

# Vue / WeWeb Architecture — Component Patterns

**Applies to:** Vue 3 projects and WeWeb custom components.
**See:** `libraries/frontend/vue-weweb-patterns.md` for full code examples.

---

## 14. Vue Feature-Based Structure

```
src/
  features/
    auth/
      components/
        LoginForm.vue
        SignupForm.vue
      composables/          # Vue equivalent of React hooks
        useAuth.ts
        useSession.ts
      services/
        authService.ts
      stores/               # Pinia stores
        authStore.ts
      types.ts
      index.ts
    dashboard/
      ...

  components/               # Shared components
  composables/              # Shared composables
  services/                 # Shared services (httpClient)
  stores/                   # Global Pinia stores
  layouts/
  pages/
  router/
```

Same feature-based principles apply: self-contained features, public API via `index.ts`, no cross-feature internal imports.

## 15. Vue Composition API Patterns

Use Composition API (`<script setup>`) exclusively. Options API is legacy.

### Composables (equivalent to React hooks)

```ts
// features/users/composables/useUsers.ts
export function useUsers(filters?: Ref<UserFilters>) {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchUsers() {
    loading.value = true;
    try {
      users.value = await userService.list(unref(filters));
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  watchEffect(() => { if (filters?.value) fetchUsers(); });

  return { users, loading, error, refetch: fetchUsers };
}
```

## 16. Vue State Management (Pinia)

| State Type | Tool | When |
|-----------|------|------|
| Component-local | `ref()` / `reactive()` | Form inputs, toggles, UI state |
| Server data | VueQuery / composables | API data with caching |
| Global state | Pinia stores | Auth, theme, permissions |
| URL state | Vue Router query params | Filters, pagination |

## 17. WeWeb Custom Components

WeWeb components follow a specific structure. Each component has configuration (properties exposed in the WeWeb editor) and runtime (Vue component).

### WeWeb Component Structure

```
ww-components/
  my-component/
    ww-config.js           # Properties, events, triggers exposed in editor
    src/
      wwElement.vue        # Main component (required name)
      components/          # Sub-components
        InnerPart.vue
      composables/
        useComponentLogic.ts
    package.json
```

### Key WeWeb Principles

- **wwElement.vue** is the entry point — WeWeb injects `content` (config) and `uid` props.
- **Props come from WeWeb editor**, not parent components. Use `ww-config.js` to define them.
- **Bindable properties**: Any prop marked `bindable: true` can be connected to WeWeb data.
- **Events/Triggers**: Emit events that WeWeb workflows can listen to.
- **Responsive**: Use WeWeb's responsive system, not custom media queries.
- **No global state in components**: WeWeb manages global state. Components receive data via props/bindings.

### WeWeb Local Standalone Mode (without editor upload)

Use a dual-mode setup:

- `npm run serve` for WeWeb editor integration.
- `npm run dev` for standalone local development with Vite (`./dev` root).

This mode is useful for fast local iteration before editor-level validation. Keep both flows available; standalone mode does not replace final validation inside WeWeb editor.

### WeWeb ww-config.js Pattern

```js
export default {
  editor: {
    label: { en: 'My Component' },
    icon: 'table',
  },
  properties: {
    data: {
      label: { en: 'Data source' },
      type: 'Array',
      bindable: true,
      defaultValue: [],
    },
    columns: {
      label: { en: 'Columns' },
      type: 'Array',
      options: {
        item: {
          type: 'Object',
          defaultValue: { label: '', key: '' },
          options: {
            item: {
              label: { label: { en: 'Label' }, type: 'Text' },
              key: { label: { en: 'Key' }, type: 'Text' },
            },
          },
        },
      },
    },
    emptyMessage: {
      label: { en: 'Empty message' },
      type: 'Text',
      defaultValue: 'No data available',
      bindable: true,
    },
  },
  triggerEvents: [
    { name: 'row:click', label: { en: 'On row click' }, event: { row: {} } },
    { name: 'sort:change', label: { en: 'On sort change' }, event: { column: '', direction: '' } },
  ],
};
```

## 18. Vue/WeWeb Testing

| Layer | Tool | What to Test |
|-------|------|-------------|
| Components | Vitest + Vue Test Utils | Render, props, emits, slots |
| Composables | Vitest | Reactive state, API calls |
| E2E | Playwright / Cypress | User flows, WeWeb preview |
| WeWeb | Manual + Playwright | Editor config, bindings, responsive |

## 19. Escolha de Orquestrador (LangChain vs LangGraph)

**Use LangChain (chains/DAG sequencial)** quando:
- Fluxo linear simples (ex: ingest -> embed -> query).
- Nao precisa voltar estado, nem checkpoints.
- Observabilidade basica (logs, spans) ja basta.

**Use LangGraph (stateful graph)** quando:
- Precisa de backtracking/time-travel ou HITL a cada passo.
- Workflow reflexivo (ex: deep-research loop) com decisoes condicionais.
- Multiagente com sub-agentes e compartilhamento de estado.
- Rastreabilidade forte: checkpoints, replay, diff entre execucoes.

**Padrao de estado recomendado (Graph):**
- `state` imutavel + `patches` aplicados por node.
- Guardar `checkpoints` a cada decisao para inspecao/rollback.
- Registrar `tools_called` e `context_used` para auditoria.

**Limiar de decisao rapido:**
- Se precisa reexecutar um passo anterior → LangGraph.
- Se workflow cabe em um `RunnableSequence` sem loops → LangChain.

**Modelos/LLMs:** LangGraph se beneficia de modelos com bom tool-calling (Claude 3.5, GPT-4.1, Qwen 3.5).

**Observabilidade:** sempre ligar tracing (LangSmith ou OpenTelemetry). Sem tracing, nao adote LangGraph.

---

## Cross-Framework Summary

These principles apply regardless of framework:

1. **Feature-based folders** — self-contained modules
2. **Service layer** — components never call APIs directly
3. **State hierarchy** — right tool for each state type
4. **Presentation/Logic split** — separate what renders from what decides
5. **Error boundaries** — graceful degradation at every level
6. **Lazy loading** — code-split at route level minimum
7. **Loading + error states** — every async operation
8. **Tests on business logic** — hooks/composables/services first
