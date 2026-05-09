# Engineering Best Practices — G-OS

> Padroes de codigo, arquitetura e workflow. Aplicado em todo `plan-blueprint`, codegen e revisao.

## TypeScript — strict mode obrigatorio

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Regras

- **Nunca** `as any`, `@ts-ignore` sem comentario justificando.
- **Permitido** `@ts-expect-error` com comentario obrigatorio.
- `interface` para objetos de dominio e contratos.
- `type` para unions, intersections, utilitarios.
- **Nunca enum** — use `const X = { ... } as const` + `type Status = typeof X[keyof typeof X]`.
- Generics tipados — sem `T = any`.

## React 18 — patterns

### Componentes
- Funcionais sempre. Class components proibidos.
- `function declaration` para componentes principais (export default).
- `arrow function` para callbacks/handlers.
- Props tipadas via `interface`.
- Children: `React.ReactNode` (nao `JSX.Element[]`).

### Hooks
- `useState` para estado local primitivo.
- `useReducer` para state machine (>3 transicoes).
- `useEffect` apenas para sincronizacao com sistema externo (DOM, network, subscriptions).
- **NUNCA** `useEffect` para derivar state — calcular inline ou `useMemo`.
- Custom hooks com prefix `use` + camelCase (`useAuth`, `useProjects`).

### Estado global
- Servidor: TanStack Query (cache + invalidation).
- Cliente: Zustand para complexo, `useState` lift-up para simples.
- **Nunca** Redux em projeto novo.

## TanStack Query — patterns

```tsx
// Query key como tupla [domain, params]
const projects = useQuery({
  queryKey: ['projects', { status: 'active' }],
  queryFn: () => api.projects.list({ status: 'active' }),
  staleTime: 60_000, // 1min
});

// Mutation com invalidacao
const createProject = useMutation({
  mutationFn: api.projects.create,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
});
```

### Anti-patterns
- Refetch on window focus em lista grande (custo de rede).
- queryKey como string (`'projects'`) — sempre array.
- Mutation sem `onError` quando UX precisa rollback.

## TanStack Router — patterns

- Routes em `src/routes/<path>.tsx` com file-based routing OU codegen.
- Loader para dados criticos (bloqueia render ate ter).
- Search params via `validateSearch` Zod.
- Type-safe params: `Route.useParams()`.

## File structure (single-app)

```
src/
  routes/                   # rotas TanStack
  components/
    ui/                     # shadcn primitives
    <feature>/              # componentes especificos do dominio
  hooks/                    # custom hooks reutilizaveis
  lib/
    supabase.ts             # client
    utils.ts                # cn(), formatters
  schemas/                  # Zod schemas
  types/                    # tipos compartilhados
  api/                      # client API (workers fetch wrappers)
```

## File structure (monorepo)

```
apps/
  web/                      # frontend
  worker/                   # backend Workers
packages/
  ui/                       # design system compartilhado
  schemas/                  # Zod schemas usados front+back
  types/                    # tipos compartilhados
  config/                   # tsconfig base, eslint base
```

## Naming

- Componentes: `PascalCase` (`ProjectCard.tsx`).
- Hooks: `camelCase` com `use` prefix (`useProjects.ts`).
- Utils: `camelCase` (`formatCurrency.ts`).
- Types: `PascalCase` (`Project`, `User`).
- Constants: `SCREAMING_SNAKE_CASE` (`MAX_FILE_SIZE`).
- Booleans: `is/has/should` prefix (`isLoading`, `hasError`).

## Commits — Conventional Commits

```
<type>(<scope>): <subject>

[body]

[footer]
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`.

Exemplos:
- `feat(auth): add magic link login`
- `fix(projects): correct active count`
- `refactor(api): extract supabase client`

## Branches

- `main` — producao.
- `dev` — integracao.
- `feat/<slug>` — feature em desenvolvimento.
- `fix/<slug>` — bug fix.
- `chore/<slug>` — limpeza.

## Workflow

1. `feat/<slug>` -> commits pequenos e atomicos.
2. PR para `dev`.
3. Code review obrigatorio (auto-review aceito em MVP descartavel).
4. CI passa (build + tsc + tests).
5. Merge squash.
6. `dev` -> `main` periodicamente.

## Testing

### MVP descartavel
- Smoke test manual antes de deploy.
- Sem unit tests obrigatorios.

### Continuo
- Vitest para units (so logica pura, formatadores, hooks).
- Playwright para E2E em fluxos criticos (login, checkout, dashboard).
- Coverage minima: 60% em logica de negocio.
- **NAO** testar componentes UI puros (chumba implementacao).

## Performance

- Lazy load rotas: `React.lazy` + `Suspense`.
- Code split por feature (TanStack Router cuida).
- Imagens: WebP via Cloudflare Image Transformations.
- Bundle target: <200KB inicial gzip.
- Lighthouse score 90+ em mobile.

## Acessibilidade

- Labels em todos inputs (`htmlFor` + `id` ou `aria-label`).
- Roles ARIA em componentes custom.
- Focus management em modal/drawer.
- Contraste AA (4.5:1 texto, 3:1 UI).
- Keyboard navigation em todos os flows interativos.

Detalhe completo: `libraries/ui-guardrails-checklist.md`.

## Architecture — Hexagonal-ish (continuo)

```
src/
  domain/                   # entidades, value objects, regras puras
  application/              # use cases, services
  infrastructure/           # adapters (supabase, workers, http)
  ui/                       # React components
```

Em MVP descartavel, achatar para `lib/` + `components/` direto.

## Anti-patterns

- Componente >500 linhas — quebrar em sub-components.
- Hook com >5 useState — provavelmente precisa useReducer.
- Funcao com >50 linhas — extrair sub-funcoes.
- `any` em props — sempre tipar.
- `console.log` em codigo que vai pra prod — usar logger ou remover.
- TODO sem prazo/owner — vira divida tecnica permanente.
- Comentario explicando WHAT do codigo — refatorar nome em vez de comentar.

## Referencias completas

- `docs-tools/docs/engineering/dev/02-padroes-codigo.md` — base completa.
- `docs-tools/docs/engineering/arquitetura/hexagonal.md` — para apps continuos.
- `docs-tools/docs/engineering/dev/01-workflow-desenvolvimento.md` — fluxo de trabalho.
