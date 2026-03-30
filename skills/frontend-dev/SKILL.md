---
name: fe
description: Frontend developer mode for React, Next.js, or Vue/WeWeb projects. Use when asked to build or modify frontend components, pages, hooks, composables, or UI work. Enforces scalable architecture patterns (feature-folders, service layer, state hierarchy).
argument-hint: "[component or feature description]"
use-when:
  - criar ou modificar componentes frontend (React, Next.js, Vue, WeWeb)
  - trabalhar com paginas, hooks, composables, ou UI
  - criar componentes WeWeb customizados
  - modificar wwElement.vue ou ww-config.js
do-not-use-for:
  - diagnosticar componentes WeWeb com falha (use weweb-debug)
  - trabalho backend ou API (use be)
metadata:
  category: mcp-enhancement
---

You are operating as a **Frontend Developer** for the A8Z project.

## Task
$ARGUMENTS

## Architecture Reference

**BEFORE writing any code**, read the architecture rule and applicable patterns library:
- Rule: `./.a8z/rules/react-architecture.md` — feature-based structure, service layer, state strategy
- React patterns: `./.a8z/libraries/frontend/react-patterns.md`
- Next.js patterns: `./.a8z/libraries/frontend/nextjs-patterns.md`
- Vue/WeWeb patterns: `./.a8z/libraries/frontend/vue-weweb-patterns.md`
- WeWeb standalone local mode: `./.a8z/libraries/frontend/weweb-local-dev.md`
- Tailwind Variants: `./.a8z/libraries/frontend/tailwind-variants.md` — tv() pattern
- Base UI: `./.a8z/libraries/frontend/base-ui.md` — headless components

## Stack Detection

Detect the project stack before proceeding:

| Stack | Indicator | Patterns to Follow |
|-------|-----------|-------------------|
| React + Vite | `vite.config.ts` + no `next.config` | react-patterns.md |
| Next.js | `next.config.js/ts` or `app/` dir | nextjs-patterns.md |
| Vue/WeWeb | `wwElement.vue` or `ww-config.js` | vue-weweb-patterns.md + weweb-local-dev.md |
| React (default) | Fallback | react-patterns.md |

## Architecture Principles (All Frameworks)

### 1. Feature-Based Structure
- New feature = new folder under `features/` (or `src/features/`)
- Each feature folder: `components/`, `hooks/` (or `composables/`), `services/`, `types.ts`, `index.ts`
- Public API via `index.ts` — never import internal files across features
- Component used by 1 feature = inside that feature. Used by 3+ = promote to shared

### 2. Service Layer (mandatory)
```
Component → Hook/Composable → Service → HTTP Client
  (UI)         (state)         (business)  (transport)
```
- Components NEVER call APIs directly
- Services are pure functions/objects — no React/Vue state
- Hooks/composables wire services to component state

### 3. State Hierarchy
- **UI-local**: `useState`/`ref()` — toggles, form inputs, modals
- **Server data**: TanStack Query / VueQuery — API data with cache
- **Global**: Zustand/Redux/Pinia — auth, theme, permissions only
- **URL**: Router params — filters, pagination, search

### 4. Component Responsibility
- Presentation components: props in, events out, no logic
- Container components: fetch data, manage state, compose UI
- Split when component > 150 lines or mixes data fetching with complex UI

## Stack-Specific Constraints (React + Vite — Default)

- **Framework:** React 19 + Vite + TypeScript
- **Routing:** TanStack Router v1 (`src/App.tsx`)
- **UI:** shadcn/ui primitives + Tailwind CSS (CSS variables for theming)
- **State/Data:** Supabase JS client + custom hooks in `src/hooks/`
- **Tables:** TanStack Table

## Pre-flight checklist (always run before writing code)

1. Read `./.a8z/agents/best-practices.system.md` and `./.a8z/agents/uiux-planner.system.md` for the DoD of this work.
2. Read `./.a8z/rules/react-architecture.md` for architecture patterns.
3. Check `src/lib/modulesRegistry.ts` — if adding a new page/route, **update `MODULES_REGISTRY`** first. `TAB_CONFIG` and `PAGE_REGISTRY` are derived from it.
4. Check `src/lib/types.ts` for existing interfaces before defining new ones.
5. Check `src/lib/hover-styles.ts` for interaction styles (`hover.ghost`, `hover.listItem`, `hover.card`).

## Critical rules

### Dark mode
Dark mode is **DISABLED** (`DARK_MODE_ENABLED = false` in `useTheme.ts`). Do not add `dark:` Tailwind variants. Use CSS variable classes:
```tsx
className="bg-card text-foreground border-border"
className="bg-muted text-muted-foreground"
```

### Responsive modals
Always use `ResponsiveModal` (Dialog on desktop ≥640px, BottomSheet on mobile):
```tsx
import { ResponsiveModal } from '@/components/ui/responsive-modal';
```

### Toast notifications
Use the 5 variants — **no emojis in titles** (icons render automatically):
```tsx
toast({ title: 'Criado com sucesso', variant: 'success' });
toast({ title: 'Erro ao salvar', variant: 'destructive' });
// variants: success | destructive | warning | info | default
```

### Async buttons
Always add loading state to prevent double-clicks:
```tsx
const [loading, setLoading] = useState(false);
const handleClick = async () => {
  if (loading) return;
  setLoading(true);
  try { /* ... */ } finally { setLoading(false); }
};
<Button disabled={loading}>
  {loading ? <Loader2 className="animate-spin" /> : <Icon />} Label
</Button>
```

### Split view compatibility
Pages that can appear in split view must use `h-full` (not `h-screen`):
```tsx
<div className="h-full overflow-auto"> {/* NOT h-screen */}
```

### Localhost-only features
Gate scraping/validation features:
```tsx
const isLocal = (import.meta.env.VITE_API_URL || 'http://localhost:7001').includes('localhost');
```

### Permission gates
Use `<PermissionGate>` to guard restricted UI:
```tsx
import { WriteGate, DeleteGate } from '@/components/PermissionGate';
<WriteGate modulo="tarefas"><Button>Save</Button></WriteGate>
```

### npm on Windows
```bash
npm.cmd install <pkg>  # NOT npm install (may silently fail in Git Bash)
```

## WeWeb-Specific Constraints (Vue/WeWeb projects)

When stack is Vue/WeWeb, these ADDITIONAL rules apply on top of the architecture principles above:

### NON-NEGOTIABLE WeWeb Rules

1. **Optional chaining OBRIGATORIO**: Todo acesso a `props.content` usa `?.` — `props.content?.title`, nunca `props.content.title`
2. **computed() para dados de content**: NUNCA use `ref()` para dados derivados de `props.content`. Use `computed(() => props.content?.data || [])`
3. **wwEditor blocks pareados**: Todo `/* wwEditor:start */` deve ter `/* wwEditor:end */` correspondente
4. **wwLib para globals**: Use `wwLib.getFrontDocument()` / `wwLib.getFrontWindow()` — NUNCA `document` ou `window` direto
5. **Root sem dimensoes fixas**: Root element sem `width`/`height` hardcoded, sem `position: fixed`, sem `padding`/`margin`
6. **Single root element**: No fragments

### Dual Script Pattern (RECOMENDADO)

```vue
<script>
export default {
  name: 'MyComponent',
  wwDefaultContent: {
    // ALL properties from ww-config.js
  },
}
</script>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  content: { type: Object, default: () => ({}) },
  uid: { type: String, default: '' },
});
const emit = defineEmits(['trigger-event']);
// Logic here — imports auto-registered, refs auto-exposed
</script>
```

### package.json Rules

- `@weweb/cli: "latest"` (NUNCA versao fixa)
- `sass` em devDependencies (WeWeb usa sass-loader)
- ZERO pacotes npm privados
- NO `"type": "module"`
- NO build config files (webpack, vite, babel, tsconfig)
- NO `vue` em dependencies (ja fornecido)

### Debug

Se o componente falha no build ou dashboard mostra "Failed", use a skill `weweb-debug` para diagnostico completo.

## Design-to-Code Mode

When the task involves converting a Figma design or screenshot to components, activate this mode.

**Trigger signals:** "converter design", "Figma para codigo", "screenshot para componente", "implementar esse design", image attachment with UI design.

### Stack detection for design-to-code

| Stack indicator | Component pattern |
|----------------|-------------------|
| `tailwind-variants` in package.json | `tv()` + `twMerge()` + `data-slot` |
| `@base-ui/react` in package.json | Base UI headless + tv() styling |
| `shadcn/ui` components in `components/ui/` | `cn()` + Radix primitives |
| None detected | Ask user which pattern to follow |

### Design-to-code procedure

1. **Analyze** — identify components, variants, states, spacing, colors
2. **Map to tokens** — map design colors to CSS variables (bg-surface, text-foreground, etc.)
3. **Identify boundaries** — compound component, simple component, or headless primitive
4. **Implement** with correct pattern (tv()+twMerge or cn()+Radix)
5. **Accessibility** — focus-visible ring, aria-label on icon buttons, semantic HTML
6. **Named exports only** — never default export

For dedicated design-to-code workflow with full DoD, use `/design-to-code` skill.

## Model guidance

| Scope | Recommended model |
|-------|-------------------|
| Fix label, adjust spacing, rename prop | `haiku` |
| New component, add hook, connect API, feature work | `sonnet` (default) |
| New module with routing + state + multiple components | `opus` |

## Procedure

1. **Detect stack**: Identify React/Next.js/Vue from project files.
2. **Understand**: Read relevant page/component files before proposing changes.
3. **Check architecture**: Does the feature follow feature-based structure? If not, suggest refactor.
4. **Plan**: Identify files to create/modify. New features go under `features/`. Never create files unless necessary.
5. **Implement**: Follow existing patterns + architecture principles:
   - API calls in service files, not components
   - State management in hooks/composables, not components
   - Presentation/container split for complex components
   - Error boundaries around feature sections
   - Loading + error states for all async operations
6. **Check types**: Run `npx tsc --noEmit` to verify.
7. **DoD**: Component works on desktop + mobile. No TS errors. Uses design system tokens. Follows service layer pattern. State in the right place.

## Architecture DoD (in addition to standard DoD)

- [ ] New features use `features/{name}/` folder structure
- [ ] API calls go through service layer (not in components)
- [ ] State follows hierarchy (local → server → global)
- [ ] No prop drilling beyond 2 levels
- [ ] Complex components split into presentation/container
- [ ] Error boundaries around feature sections
- [ ] Async operations have loading + error states
- [ ] Route-level lazy loading for new pages (React/Next.js)
- [ ] Components with variants use tv() + VariantProps (or cn() for shadcn)
- [ ] data-slot on compound component elements
- [ ] Interactive elements have focus-visible ring
- [ ] Icon-only buttons have aria-label

## When to Use
- Use according to the triggers described in the description/use-when list.

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Instructions
1) Siga o passo-a-passo principal da skill.
2) Valide saa com checklists desta skill ou do workflow.
3) Registre decises relevantes se aplic5vel.
