# React Patterns Library

Reference de padroes arquiteturais para aplicacoes React escalaveis.

---

## Feature Module Pattern

Cada feature eh auto-contida. O `index.ts` eh a API publica.

```tsx
// features/orders/index.ts — Public API
export { OrderList } from './components/OrderList';
export { OrderDetails } from './components/OrderDetails';
export { useOrders } from './hooks/useOrders';
export { useOrderActions } from './hooks/useOrderActions';
export type { Order, OrderStatus } from './types';
```

### Importing

```tsx
// CORRETO — importa da API publica
import { OrderList, useOrders } from '@/features/orders';

// ERRADO — importa de arquivo interno
import { OrderList } from '@/features/orders/components/OrderList';
```

---

## Service Layer Pattern

```tsx
// services/httpClient.ts — Transport layer (configurado uma vez)
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

httpClient.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const message = error.response?.data?.message || 'Erro inesperado';
    return Promise.reject(new Error(message));
  }
);
```

```tsx
// features/orders/services/orderService.ts — Feature service
import { httpClient } from '@/services/httpClient';
import type { Order, CreateOrderDTO } from '../types';

export const orderService = {
  list: (params?: { status?: string; page?: number }) =>
    httpClient.get<Order[]>('/orders', { params }),

  getById: (id: string) =>
    httpClient.get<Order>(`/orders/${id}`),

  create: (data: CreateOrderDTO) =>
    httpClient.post<Order>('/orders', data),

  updateStatus: (id: string, status: string) =>
    httpClient.patch<Order>(`/orders/${id}/status`, { status }),
};
```

```tsx
// features/orders/hooks/useOrders.ts — State + cache layer
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

const KEYS = {
  all: ['orders'] as const,
  list: (filters: Record<string, unknown>) => [...KEYS.all, 'list', filters] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

export function useOrders(filters = {}) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: () => orderService.list(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
```

---

## Presentation / Container Split

```tsx
// Presentation — pure UI, receives everything via props
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ data, columns, isLoading, onRowClick }: DataTableProps<T>) {
  if (isLoading) return <TableSkeleton columns={columns.length} />;
  return (
    <Table>
      {/* pure rendering logic */}
    </Table>
  );
}
```

```tsx
// Container — wires data to presentation
export function OrdersTable() {
  const { data, isLoading } = useOrders();
  const navigate = useNavigate();

  return (
    <DataTable
      data={data ?? []}
      columns={orderColumns}
      isLoading={isLoading}
      onRowClick={(order) => navigate(`/orders/${order.id}`)}
    />
  );
}
```

---

## State Hierarchy

```tsx
// 1. UI-local state (useState)
const [isOpen, setIsOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

// 2. Server state (TanStack Query)
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: userService.list,
  staleTime: 5 * 60 * 1000, // 5 min cache
});

// 3. URL state (TanStack Router / searchParams)
const { page, status } = Route.useSearch();  // filters from URL
// or: const [searchParams, setSearchParams] = useSearchParams();

// 4. Global state (Zustand — only for truly global data)
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

---

## Error Boundary Pattern

```tsx
// components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

```tsx
// Usage — layered boundaries
<ErrorBoundary fallback={<AppCrash />}>
  <Layout>
    <ErrorBoundary fallback={<FeatureError />}>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  </Layout>
</ErrorBoundary>
```

---

## Lazy Loading Pattern

```tsx
// routes/AppRoutes.tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/features/dashboard'));
const Users = lazy(() => import('@/features/users'));
const Settings = lazy(() => import('@/features/settings'));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<PageSkeleton />}>
          <Dashboard />
        </Suspense>
      } />
      <Route path="/users/*" element={
        <Suspense fallback={<PageSkeleton />}>
          <Users />
        </Suspense>
      } />
    </Routes>
  );
}
```

---

## Custom Hook Patterns

### Composing Hooks

```tsx
// hooks/useConfirmAction.ts — Reusable confirm-then-act pattern
export function useConfirmAction<T>(
  action: (item: T) => Promise<void>,
  options?: { title?: string; description?: string }
) {
  const [pending, setPending] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = (item: T) => setPending(item);
  const cancel = () => setPending(null);

  const execute = async () => {
    if (!pending) return;
    setLoading(true);
    try {
      await action(pending);
      setPending(null);
    } finally {
      setLoading(false);
    }
  };

  return { pending, loading, confirm, cancel, execute };
}
```

### Debounced Search

```tsx
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage
function UserSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data } = useUsers({ search: debouncedSearch });
  // ...
}
```

---

## Protected Route Pattern

```tsx
// routes/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

// routes/RoleRoute.tsx
export function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

---

## Form Pattern (with validation)

```tsx
// features/users/components/UserForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  role: z.enum(['admin', 'user', 'viewer']),
});

type FormData = z.infer<typeof schema>;

export function UserForm({ onSubmit, defaultValues }: {
  onSubmit: (data: FormData) => Promise<void>;
  defaultValues?: Partial<FormData>;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* ... more fields */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Compound Component Pattern

Componentes que compartilham contexto implicitamente, com API declarativa:

```tsx
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={twMerge(
        'bg-surface flex flex-col gap-6 rounded-xl border border-border p-6 shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-header" className={twMerge('flex flex-col gap-1.5', className)} {...props} />
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 data-slot="card-title" className={twMerge('text-lg font-semibold', className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={className} {...props} />
}

// Uso
<Card>
  <CardHeader>
    <CardTitle>Titulo</CardTitle>
  </CardHeader>
  <CardContent>Conteudo</CardContent>
</Card>
```

Para compound components com estado compartilhado, use Context:

```tsx
const AccordionContext = createContext<{ openId: string | null; toggle: (id: string) => void } | null>(null)

export function Accordion({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id)

  return (
    <AccordionContext value={{ openId, toggle }}>
      <div data-slot="accordion">{children}</div>
    </AccordionContext>
  )
}

export function AccordionItem({ id, title, children }: AccordionItemProps) {
  const ctx = use(AccordionContext)!
  const isOpen = ctx.openId === id

  return (
    <div data-slot="accordion-item" data-open={isOpen ? '' : undefined}>
      <button onClick={() => ctx.toggle(id)}>{title}</button>
      {isOpen && <div data-slot="accordion-content">{children}</div>}
    </div>
  )
}
```

---

## data-slot e data-attributes para Estado

### data-slot — Identificacao de sub-componentes

Cada componente (ou sub-componente de um compound) deve ter `data-slot` para:
- Identificacao em DevTools
- Targeting CSS via `[data-slot="card-title"]`
- Composicao de estilos externos sem className prop drilling

```tsx
<div data-slot="card" />
<div data-slot="card-header" />
<button data-slot="button" />
```

### data-attributes para estados interativos

Use data-attributes em vez de classes condicionais para estados:

```tsx
// CORRETO — estado via data-attribute
<button
  data-disabled={disabled ? '' : undefined}
  data-loading={isLoading ? '' : undefined}
  data-selected={isSelected ? '' : undefined}
>

// CSS para esses estados
className="data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
className="data-[loading]:cursor-wait"
className="data-[selected]:bg-primary data-[selected]:text-primary-foreground"

// ERRADO — logica condicional de classe inline
className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}
```

Padrao preferido com `tv()`:

```tsx
export const buttonVariants = tv({
  base: [
    'inline-flex items-center font-medium rounded-lg border transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    'data-[loading]:cursor-wait',
  ],
})
```

---

## React 19 — Padroes Atualizados

### Sem forwardRef

React 19 passa `ref` como prop normal — `forwardRef()` nao eh necessario:

```tsx
// React 19 — ref como prop normal
export function Input({ ref, className, ...props }: ComponentProps<'input'>) {
  return <input ref={ref} className={twMerge('...', className)} {...props} />
}

// React 18 — necessitava forwardRef (LEGADO)
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={...} {...props} />
  )
)
```

### use() em vez de useContext()

```tsx
import { use } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = use(ThemeContext)  // mais conciso
  return <button onClick={() => setTheme('dark')}>{theme}</button>
}

// Tambem funciona com Promises (Suspense)
export function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)  // suspende automaticamente
  return <div>{user.name}</div>
}
```

### Server Actions com useActionState

```tsx
import { useActionState } from 'react'

export function ContactForm() {
  const [state, action, isPending] = useActionState(submitContact, null)

  return (
    <form action={action}>
      <input name="email" type="email" />
      <button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin size-4" /> : 'Enviar'}
      </button>
      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}
    </form>
  )
}
```

---

## className Composition com twMerge

Padrao obrigatorio para componentes que aceitam `className` externo:

```tsx
import { twMerge } from 'tailwind-merge'

// CORRETO — twMerge resolve conflitos Tailwind
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={twMerge('bg-surface rounded-xl border p-6', className)} {...props} />
  )
}

// Uso — className externo sobrescreve corretamente
<Card className="p-4" />       // p-4 vence, p-6 descartado
<Card className="bg-muted" />  // bg-muted vence, bg-surface descartado

// ERRADO — concatenacao simples cria conflitos Tailwind
className={`bg-surface rounded-xl ${className}`}
// <Card className="bg-muted" /> -> 'bg-surface bg-muted' (comportamento indefinido)
```

Em projetos shadcn/ui, use `cn()` de `@/lib/utils` (que internamente usa twMerge):

```tsx
import { cn } from '@/lib/utils'
className={cn('bg-surface rounded-xl', className)}
```
