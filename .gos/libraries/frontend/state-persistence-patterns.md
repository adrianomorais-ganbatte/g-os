# State Persistence Patterns (FOUC Zero)

Reference library for persisting UI state across reloads in SSR/Edge frameworks (Next.js App Router, Remix, SvelteKit) **without** flash of incorrect content (FOUC) or hydration mismatch.

This library is the positive counterpart to `content/ai-writing-patterns.md`: instead of cataloging anti-patterns to avoid, it codifies **patterns to apply** for any UI state that survives reload.

---

## When this applies

State is "persisted UI state" if **all** of the following are true:

1. It survives page reloads (cookie, localStorage, URL, server session).
2. It affects the **first paint** of the layout (sidebar collapsed/expanded, theme, density, locale, RTL/LTR, font-size preset).
3. It has a default value used when the persisted value is missing.

If state is client-only and **does not** affect the first paint (form drafts, in-page panels not visible at load, ephemeral preferences) — these patterns are not required; localStorage + `useEffect` is fine.

---

## The core problem: client-only persistence creates FOUC

A naive implementation reads the persisted value on the client *after* hydration:

```tsx
// ANTI-PATTERN — produces visible flash
function SidebarProvider({ defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    const saved = document.cookie.match(/sidebar_state=(\w+)/)?.[1]
    if (saved === "false") setOpen(false)   // flash: SSR rendered open, this closes it
  }, [])

  return <Context.Provider value={{ open }}>{children}</Context.Provider>
}
```

Sequence that produces the flash:

1. **SSR**: HTML is rendered with `defaultOpen=true` (server has no access to client state).
2. **First paint**: browser shows sidebar **open**.
3. **Hydration**: React mounts with `open=true`.
4. **`useEffect` fires**: reads cookie `false` → `setOpen(false)` → re-render → sidebar collapses.

The flash is 16–200ms depending on network/CPU. On slow connections it is painful UX.

---

## Pattern A — Server-read cookie + `defaultX` injection (canonical)

**When to use**: any state where the persistence medium is a **cookie** and the framework supports reading cookies in Server Components.

**Next.js App Router (canonical)**:

```tsx
// app-shell.tsx — Server Component
import { cookies } from "next/headers"
import { SidebarProvider } from "@/components/ui/sidebar"

export async function AppShell({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()                            // Next 15+ async; Next 14 sync
  const saved = cookieStore.get("sidebar_state")?.value
  const defaultOpen = saved === undefined ? true : saved === "true"

  return <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
}
```

```tsx
// sidebar.tsx — Client Component
"use client"

export function SidebarProvider({ defaultOpen = true, children }) {
  const [open, _setOpen] = useState(defaultOpen)                 // hydrates with correct value

  const setOpen = useCallback((next: boolean) => {
    _setOpen(next)
    document.cookie = `sidebar_state=${next}; path=/; max-age=${60 * 60 * 24 * 7}`
  }, [])

  return <Context.Provider value={{ open, setOpen }}>{children}</Context.Provider>
}
```

**Why this works**:
- Server reads cookie → SSR HTML reflects the persisted state.
- First paint already correct.
- Hydration uses `defaultOpen` from server → no client-side correction needed.
- `useEffect` is **not used for initial state** — only `setOpen` writes the cookie when the user toggles.

**Cost**: `cookies()` forces dynamic rendering of the page that uses it. Acceptable for authenticated dashboards (already dynamic). For static pages, use Pattern C.

---

## Pattern B — `headers()` for derived state (locale, theme by system pref proxy)

When the state can be derived from a request header (e.g., `Accept-Language`, `Sec-CH-Prefers-Color-Scheme`), read it server-side and inject as default:

```tsx
import { headers } from "next/headers"

export async function ThemeShell({ children }) {
  const h = await headers()
  const prefersDark = h.get("sec-ch-prefers-color-scheme") === "dark"
  return <ThemeProvider defaultTheme={prefersDark ? "dark" : "light"}>{children}</ThemeProvider>
}
```

Use this **in addition to** Pattern A: server reads cookie first; if missing, derives from headers; client toggles persist back to cookie.

---

## Pattern C — Inline blocking script for static pages (last resort)

When the page **must** stay static (cannot opt into dynamic rendering) but still needs FOUC-free persisted state, use a small synchronous script in `<head>` that sets a class/attribute on `<html>` **before** the first paint:

```tsx
// app/layout.tsx
import Script from "next/script"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script id="set-sidebar-state" strategy="beforeInteractive">
          {`(function(){try{var m=document.cookie.match(/sidebar_state=(\\w+)/);
            if(m&&m[1]==="false"){document.documentElement.dataset.sidebar="collapsed"}}catch(e){}})()`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

Then CSS reads the attribute:

```css
[data-sidebar="collapsed"] aside { width: 56px; }
```

**Caveats**:
- Adds blocking JS to critical path (~1KB).
- CSP must allow the inline script (or extract to external file with hash).
- Only use when Pattern A is impossible (truly static pages).

This is what `next-themes` does for theme persistence on static pages.

---

## Pattern D — URL state (no FOUC by definition)

For state that should be **shareable** (filters, tabs, pagination), persist in the URL search params. The server reads `searchParams` on render, so first paint is always correct:

```tsx
// page.tsx — Server Component
export default async function Page({ searchParams }) {
  const params = await searchParams
  const view = params.view ?? "grid"
  return <Layout defaultView={view}>...</Layout>
}
```

This trades persistence-across-sessions (cookies persist; URL is per-tab) for shareability and bookmarkability. Use both: URL for view state, cookie for chrome (sidebar/theme).

---

## Decision tree

```
Does the state affect first paint?
├── No  → localStorage + useEffect is fine.
└── Yes → Is it shareable / bookmarkable?
         ├── Yes → Pattern D (URL search params).
         └── No  → Is the route already dynamic?
                  ├── Yes → Pattern A (cookies() in Server Component).
                  └── No  → Can the route opt into dynamic rendering?
                           ├── Yes → Pattern A; route becomes dynamic.
                           └── No  → Pattern C (blocking script).
```

---

## Anti-patterns (catalog)

### A1. `useEffect` to read persisted state and `setState`

```tsx
// BAD
useEffect(() => {
  const saved = localStorage.getItem("theme")
  if (saved) setTheme(saved)
}, [])
```

**Why bad**: SSR renders default; client corrects after hydration → flash.

**Fix**: Pattern A or C.

### A2. Conditional render that hides until hydrated

```tsx
// BAD
const [hydrated, setHydrated] = useState(false)
useEffect(() => setHydrated(true), [])
if (!hydrated) return null     // layout shift on hydration
return <Sidebar open={open} />
```

**Why bad**: layout shift (CLS hit), accessibility regression (sidebar invisible to screen readers initially).

**Fix**: Pattern A or C.

### A3. `suppressHydrationWarning` to mask the mismatch

```tsx
// BAD
<aside suppressHydrationWarning data-state={open ? "open" : "closed"}>
```

**Why bad**: hides the symptom, not the cause. The actual visual flash still happens.

**Fix**: solve the root cause with Pattern A. Use `suppressHydrationWarning` only on `<html>` for theme (where the script in Pattern C legitimately mutates the attribute before React hydrates).

### A4. Cookie set in client without server read

```tsx
// BAD — server cannot read what only the client wrote
function setOpen(next) {
  document.cookie = `sidebar_state=${next}`
  setOpenState(next)
}
// And the server never reads "sidebar_state" → flash on every reload.
```

**Why bad**: persistence works (cookie is sent on next request), but the server doesn't use it — the loop is incomplete.

**Fix**: complete the loop — server reads in Pattern A.

### A5. localStorage for layout-affecting state

```tsx
// BAD for state affecting first paint
localStorage.setItem("sidebar_state", "false")
```

**Why bad**: localStorage is **client-only** by definition; no server-side reading possible. Inevitable flash.

**Fix**: migrate to cookie (Pattern A) or accept blocking script (Pattern C). localStorage is fine for client-only state that doesn't affect first paint.

### A6. Default state assumed identical for all users

```tsx
// BAD when users have different defaults (locale, timezone, RTL)
<App defaultLocale="en" />
```

**Why bad**: ignores `Accept-Language`; first paint is "wrong" for half the users until client correction.

**Fix**: Pattern B (read header) + Pattern A (override with user-saved cookie).

---

## Checklist for any persisted UI state

Before merging a feature that persists state:

- [ ] Does the state affect first paint? If yes:
  - [ ] Is the persistence medium readable on the server (cookie, header)? If no, migrate it.
  - [ ] Does the Server Component / loader pass the persisted value as `defaultX` to the Client Component? If no, add it.
  - [ ] Is there a `useEffect` reading the persisted value to update state? If yes, **remove it** (Pattern A makes it redundant).
- [ ] Does the toggle UI write to the same persistence medium the server reads? (Cookie path/expiry must match.)
- [ ] Tested on Slow 3G: zero flash on reload?
- [ ] Tested in incognito (no cookie): falls back to default cleanly?
- [ ] Tested on mobile (different state model often required).

---

## Real incidents this library prevents

- **Sidebar flash open→closed on reload** (Fractus 2026-05-04, T-51): cookie persisted but read in `useEffect`; fix moved read to `cookies()` in Server Component.
- **Theme flash light→dark on reload** (common pre-`next-themes`): solved by Pattern C blocking script. `next-themes` automates it.
- **Wrong locale flash for non-English users**: solved by Pattern B reading `Accept-Language`.

---

## References

- Next.js docs: [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies), [`headers()`](https://nextjs.org/docs/app/api-reference/functions/headers).
- shadcn/ui sidebar: [persistence pattern](https://ui.shadcn.com/docs/components/sidebar) — uses Pattern A by default.
- `next-themes`: source for Pattern C reference implementation.
- React docs: [hydration mismatches](https://react.dev/reference/react-dom/client/hydrateRoot#hydrating-server-rendered-html).

---

## Cross-references in this framework

- Anti-patterns of writing/content: `.gos/libraries/content/ai-writing-patterns.md` (analogous catalog format).
- (Add `.gos/libraries/frontend/nextjs-patterns.md` and `react-patterns.md` here when ported.)
