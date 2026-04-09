# Next.js Patterns Library

Reference de padroes arquiteturais para aplicacoes Next.js 14+ com App Router.

---

## App Router Folder Structure

```
app/
  (auth)/                 # Route group — shared auth layout, no URL segment
    login/page.tsx
    signup/page.tsx
    forgot-password/page.tsx
    layout.tsx            # Centered layout, no sidebar
  (dashboard)/            # Route group — protected area
    layout.tsx            # Sidebar + header layout
    page.tsx              # Dashboard home
    users/
      page.tsx            # Server Component: user list
      loading.tsx         # Streaming skeleton
      [id]/
        page.tsx          # User detail
        edit/page.tsx     # Client island for edit form
      new/page.tsx
    orders/
      page.tsx
      [id]/page.tsx
    settings/
      page.tsx
      layout.tsx          # Settings-specific subnav
  api/                    # Route Handlers
    auth/[...nextauth]/route.ts
    webhooks/stripe/route.ts
  layout.tsx              # Root layout (html, body, providers)
  error.tsx               # Global error boundary
  loading.tsx             # Global loading
  not-found.tsx           # 404

features/                 # Feature modules (shared pattern)
  auth/
    components/
      LoginForm.tsx       # 'use client'
      SignupForm.tsx
    actions/              # Server Actions
      login.ts
      signup.ts
    services/
      authService.ts
    hooks/
      useSession.ts       # 'use client'
    types.ts
    index.ts
  users/
    components/
    actions/
    services/
    hooks/
    types.ts
    index.ts

components/               # Shared UI components
lib/                      # Utilities, db client, config
  db.ts                   # Prisma/Drizzle client
  auth.ts                 # Auth config
  utils.ts
```

---

## Server vs Client Components

### Decision Tree

```
Need useState/useEffect/useRef?         → 'use client'
Need onClick/onChange/onSubmit?          → 'use client'
Need browser APIs (window, localStorage)? → 'use client'
Need third-party hooks (useQuery)?       → 'use client'
Everything else?                         → Server Component (default)
```

### The Island Pattern

```tsx
// app/(dashboard)/users/page.tsx — SERVER (default, no directive)
import { UserTable } from '@/features/users/components/UserTable';
import { userService } from '@/features/users/services/userService';

export default async function UsersPage() {
  const users = await userService.list(); // Direct DB/API call, no fetch needed

  return (
    <div>
      <h1>Users</h1>
      {/* Client island for interactivity */}
      <UserTable initialData={users} />
    </div>
  );
}
```

```tsx
// features/users/components/UserTable.tsx — CLIENT island
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserTableProps {
  initialData: User[];
}

export function UserTable({ initialData }: UserTableProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filtered = initialData.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Input value={search} onChange={e => setSearch(e.target.value)} />
      <Table data={filtered} onRowClick={u => router.push(`/users/${u.id}`)} />
    </>
  );
}
```

### Props Boundary Rule

Server Components can pass **serializable data** to Client Components:
- Strings, numbers, booleans, dates, plain objects, arrays
- **NOT**: functions, classes, React elements, Symbols

```tsx
// CORRETO: passa dados serializaveis
<ClientComponent users={users} count={total} />

// ERRADO: passa funcao de server para client
<ClientComponent onLoad={async () => { await db.query() }} />
```

---

## Data Fetching Patterns

### Pattern 1: Server Component + Direct DB/Service

```tsx
// app/(dashboard)/orders/page.tsx
import { db } from '@/lib/db';

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return <OrderList orders={orders} />;
}
```

### Pattern 2: Server Actions for Mutations

```tsx
// features/users/actions/createUser.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

export async function createUser(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.user.create({ data: parsed.data });
  revalidatePath('/users');
  redirect('/users');
}
```

```tsx
// features/users/components/CreateUserForm.tsx
'use client';

import { useActionState } from 'react';
import { createUser } from '../actions/createUser';

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, null);

  return (
    <form action={action}>
      <Input name="name" />
      {state?.error?.name && <p className="text-red-500">{state.error.name}</p>}
      <Input name="email" type="email" />
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving...' : 'Create User'}
      </Button>
    </form>
  );
}
```

### Pattern 3: Route Handlers for External Integrations

```tsx
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    body, sig, process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      // handle
      break;
  }

  return Response.json({ received: true });
}
```

### Pattern 4: TanStack Query for Real-Time Client Data

```tsx
// features/orders/hooks/useOrdersRealtime.ts
'use client';

import { useQuery } from '@tanstack/react-query';

export function useOrdersRealtime(filters: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetch(`/api/orders?${new URLSearchParams(filters)}`).then(r => r.json()),
    refetchInterval: 5000, // Poll every 5s
  });
}
```

---

## Caching & Revalidation

### Page-Level Caching

```tsx
// Static page (built at build time)
export const dynamic = 'force-static';

// Dynamic page (always server-rendered)
export const dynamic = 'force-dynamic';

// ISR: revalidate every 60 seconds
export const revalidate = 60;
```

### On-Demand Revalidation

```tsx
// After a mutation
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateUser(id: string, data: UserUpdate) {
  await db.user.update({ where: { id }, data });

  revalidatePath('/users');           // Revalidate the users list page
  revalidatePath(`/users/${id}`);     // Revalidate the specific user page
  revalidateTag('users');             // Revalidate all fetches tagged 'users'
}
```

### Fetch with Tags

```tsx
// In a Server Component
const users = await fetch('https://api.example.com/users', {
  next: { tags: ['users'], revalidate: 300 },
}).then(r => r.json());
```

---

## Streaming & Suspense

```tsx
// app/(dashboard)/layout.tsx — instant shell
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// app/(dashboard)/page.tsx — parallel streaming
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Suspense fallback={<CardSkeleton />}>
        <RevenueCard />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <UsersCard />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}

// Each card fetches independently — streams as ready
async function RevenueCard() {
  const revenue = await getRevenue(); // 200ms
  return <Card title="Revenue">{formatCurrency(revenue.total)}</Card>;
}

async function RecentOrders() {
  const orders = await getRecentOrders(); // 800ms — streams later
  return <OrderTable orders={orders} />;
}
```

---

## Middleware Pattern

```tsx
// middleware.ts (root of project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
```

---

## Metadata & SEO

```tsx
// app/(dashboard)/users/[id]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const user = await getUser(params.id);
  return {
    title: `${user.name} | Users`,
    description: `Profile page for ${user.name}`,
    openGraph: {
      title: user.name,
      images: [user.avatarUrl],
    },
  };
}
```

---

## Error Handling

```tsx
// app/(dashboard)/users/error.tsx — per-route error boundary
'use client';

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <h2>Something went wrong loading users</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
```

---

## Performance Checklist

- [ ] Images use `next/image` with explicit `width`/`height` or `fill`
- [ ] Fonts use `next/font` (zero CLS)
- [ ] Heavy client components use `dynamic(() => import(...), { ssr: false })`
- [ ] `loading.tsx` exists for all data-heavy route segments
- [ ] Metadata API used for SEO (not manual `<head>` tags)
- [ ] Server Actions validate input with Zod
- [ ] Database queries in Server Components (not client-side fetch when avoidable)
- [ ] `revalidatePath`/`revalidateTag` after every mutation
