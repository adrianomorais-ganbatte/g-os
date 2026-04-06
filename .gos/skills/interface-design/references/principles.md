# Design Principles — Technical Reference

Deep reference for token architecture, CSS patterns, spacing systems, and implementation details.

---

## Token Architecture

Every color in your interface should trace back to a small set of primitives:

- **Foreground** — text colors (primary, secondary, tertiary, muted)
- **Background** — surface colors (base, elevated, overlay)
- **Border** — edge colors (default, subtle, strong, stronger)
- **Brand** — your primary accent
- **Semantic** — functional colors (destructive, warning, success, info)

No random hex values. Everything maps to primitives.

### The Primitive Foundation

```css
/* Dark mode example — slate family */
:root {
  /* Foreground (text hierarchy) */
  --fg-primary: hsl(210 11% 93%);      /* ~#e8eaed */
  --fg-secondary: hsl(215 8% 62%);     /* ~#959ba5 */
  --fg-tertiary: hsl(215 8% 46%);      /* ~#6b7280 */
  --fg-muted: hsl(215 8% 34%);         /* ~#4e545e */

  /* Background (surface elevation) */
  --bg-base: hsl(220 13% 9%);          /* ~#141518 */
  --bg-surface-1: hsl(220 13% 11%);    /* ~#191b1f */
  --bg-surface-2: hsl(220 13% 13%);    /* ~#1e2025 */
  --bg-surface-3: hsl(220 13% 16%);    /* ~#262830 */
  --bg-inset: hsl(220 13% 7%);         /* ~#101114 */

  /* Border (separation hierarchy) */
  --border-default: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-strong: rgba(255, 255, 255, 0.12);
  --border-stronger: rgba(255, 255, 255, 0.20);

  /* Brand */
  --accent: hsl(217 91% 60%);          /* blue-500 */
  --accent-hover: hsl(217 91% 55%);

  /* Semantic */
  --destructive: hsl(0 72% 51%);
  --warning: hsl(38 92% 50%);
  --success: hsl(142 71% 45%);
}
```

### Light Mode Equivalent

```css
:root[data-theme="light"] {
  --fg-primary: hsl(220 13% 13%);
  --fg-secondary: hsl(215 16% 47%);
  --fg-tertiary: hsl(215 14% 62%);
  --fg-muted: hsl(215 12% 77%);

  --bg-base: hsl(0 0% 100%);
  --bg-surface-1: hsl(210 20% 98%);
  --bg-surface-2: hsl(210 17% 95%);
  --bg-surface-3: hsl(210 14% 92%);
  --bg-inset: hsl(210 20% 96%);

  --border-default: rgba(0, 0, 0, 0.08);
  --border-subtle: rgba(0, 0, 0, 0.05);
  --border-strong: rgba(0, 0, 0, 0.12);
  --border-stronger: rgba(0, 0, 0, 0.20);
}
```

---

## Text Hierarchy

Four levels, each with a distinct role:

| Level | Role | Example |
|-------|------|---------|
| **Primary** | Default text, highest contrast | Page titles, body text, labels |
| **Secondary** | Supporting text, slightly muted | Descriptions, helper text |
| **Tertiary** | Metadata, timestamps | "Updated 2 hours ago", table headers |
| **Muted** | Disabled, placeholder | Input placeholders, disabled labels |

Use all four consistently. Two-level hierarchy (text + gray text) is too flat.

---

## Border Progression

Four levels matching intensity to importance:

| Level | Opacity (dark) | Use |
|-------|---------------|-----|
| **Subtle** | 0.05 | Softest separation, visual grouping |
| **Default** | 0.08 | Standard card/panel borders |
| **Strong** | 0.12 | Emphasis, hover states, section dividers |
| **Stronger** | 0.20 | Focus rings, maximum emphasis |

Use `rgba()` not solid hex. Low-opacity borders blend with backgrounds — they define edges without demanding attention.

---

## Control Tokens

Form controls need dedicated tokens, not reused surface tokens:

```css
--control-bg: hsl(220 13% 7%);         /* Slightly darker than surface (inset) */
--control-border: rgba(255, 255, 255, 0.10);
--control-border-hover: rgba(255, 255, 255, 0.15);
--control-border-focus: var(--accent);
--control-ring: 0 0 0 2px rgba(59, 130, 246, 0.3);
```

This separation lets you tune interactive elements independently from layout surfaces.

---

## Spacing System

Pick a base unit (4px is standard) and use only multiples:

| Context | Values | Use |
|---------|--------|-----|
| **Micro** | 2px, 4px | Icon gaps, tight element pairs |
| **Component** | 6px, 8px, 12px | Within buttons, inputs, badges |
| **Section** | 16px, 20px, 24px | Card padding, group spacing |
| **Major** | 32px, 48px, 64px | Page sections, layout gaps |

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

Random values (14px, 17px, 22px) signal no system.

### Padding Symmetry

Keep it symmetrical. TLBR must match unless content naturally requires asymmetry.

```css
/* Good */
padding: 16px;
padding: 12px 16px; /* Only when horizontal needs more room */

/* Bad — no system */
padding: 24px 16px 12px 16px;
```

---

## Depth & Elevation Strategy

Choose ONE approach and commit:

### Borders-only (flat)
Clean, technical, dense. For utility-focused tools where information density matters.

```css
--border: rgba(0, 0, 0, 0.08);
--border-subtle: rgba(0, 0, 0, 0.05);
border: 0.5px solid var(--border);
```

Linear, Raycast, and developer tools use this approach.

### Subtle single shadows
Soft lift without complexity. For approachable products that want gentle depth.

```css
--shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
```

### Layered shadows
Rich, premium, dimensional. For cards that need to feel like physical objects.

```css
--shadow-layered:
  0 0 0 0.5px rgba(0, 0, 0, 0.05),
  0 1px 2px rgba(0, 0, 0, 0.04),
  0 2px 4px rgba(0, 0, 0, 0.03),
  0 4px 8px rgba(0, 0, 0, 0.02);
```

Stripe and Mercury use layered shadows.

### Surface color shifts
Background tints establish hierarchy without any shadows.

```css
/* Card on page */
background: #fff; /* card */
/* sits on */
background: #f8fafc; /* page - already feels elevated */
```

**Never mix approaches.** Shadows + dramatic borders = visual confusion.

---

## Border Radius

Build a scale matching product personality:

| Product feel | Small | Medium | Large |
|-------------|-------|--------|-------|
| **Technical** | 2px | 4px | 6px |
| **Balanced** | 4px | 6px | 8px |
| **Friendly** | 6px | 8px | 12px |
| **Soft** | 8px | 12px | 16px |

Small for inputs/buttons, medium for cards, large for modals. Don't mix sharp and soft randomly.

---

## Typography Hierarchy

Distinct levels distinguishable at a glance:

| Level | Size | Weight | Tracking | Use |
|-------|------|--------|----------|-----|
| **Display** | 24-32px | 600-700 | -0.02em | Page hero, main title |
| **Heading** | 18-20px | 600 | -0.01em | Section headers |
| **Body** | 14-16px | 400 | normal | Content, descriptions |
| **Label** | 12-13px | 500 | 0.01em | UI labels, badges |
| **Data** | 13-14px mono | 400 | 0 | Numbers, IDs, timestamps |

Don't rely on size alone — combine size, weight, and letter-spacing.

### Monospace for Data

Numbers, IDs, codes, timestamps belong in monospace. Use `font-variant-numeric: tabular-nums` for columnar alignment.

---

## Card Layouts

Design each card's internal structure for its specific content — but keep the surface treatment consistent:

- Same border weight across all cards
- Same shadow depth (or none)
- Same corner radius
- Same padding scale

A metric card doesn't have to look like a settings card. Internal structure varies; surface treatment stays consistent.

---

## Controls

Never use native form elements for styled UI:
- `<select>` renders OS-native dropdown — build custom trigger + positioned dropdown
- `<input type="date">` renders OS-native calendar — build custom input + calendar popover
- Custom checkbox/radio: styled div with state management

Custom select triggers must use `display: inline-flex` with `white-space: nowrap`.

---

## Iconography

Icons clarify, not decorate. If removing an icon loses no meaning, remove it.

- Choose one icon set (e.g., Lucide) and use it consistently
- Standalone icons: give presence with subtle background containers
- Icons next to text: align optically, not mathematically
- Icon-only buttons: always include `aria-label`

---

## Animation

| Context | Duration | Easing |
|---------|----------|--------|
| Hover, focus | ~150ms | ease-out |
| Dropdowns, panels | 200-250ms | ease-out |
| Page transitions | 250-350ms | ease-in-out |

Avoid spring/bounce effects in professional interfaces. They feel playful, not serious.

---

## Interactive States

Every interactive element needs all states:

| State | Visual treatment |
|-------|-----------------|
| **Default** | Base appearance |
| **Hover** | Subtle bg shift or border emphasis |
| **Active/Pressed** | Slightly darker than hover |
| **Focus** | Focus ring (border-stronger or accent ring) |
| **Disabled** | Reduced opacity (0.5), no pointer events |

Data elements need additional states: **loading** (skeleton/spinner), **empty** (illustration + action), **error** (message + retry).

Missing states make an interface feel like a photograph of software.

---

## Navigation Context

Screens need grounding — a data table floating in space feels like a component demo.

Include:
- **Navigation** — sidebar or top nav showing position in the app
- **Location indicator** — breadcrumbs, page title, or active nav state
- **User context** — who's logged in, what workspace/org

**Sidebar approach:** Same background as main content with border separation. Different colors fragment the visual space.

---

## Dark Mode

Dark interfaces have different needs:

- **Borders over shadows** — shadows are less visible on dark backgrounds; lean on borders for definition
- **Desaturate semantics** — success/warning/error colors often need slight desaturation for dark surfaces
- **Same hierarchy, inverted values** — higher elevation = slightly lighter (opposite of light mode)
- **Surface shifts stay subtle** — a few percentage points of lightness between levels, not dramatic jumps

---

## Avoid

- **Harsh borders** — if borders are the first thing you see, they're too strong
- **Dramatic surface jumps** — elevation changes should be whisper-quiet
- **Inconsistent spacing** — the clearest sign of no system
- **Mixed depth strategies** — pick one approach and commit
- **Missing interaction states** — hover, focus, disabled, loading, error
- **Dramatic drop shadows** — shadows should be subtle, not attention-grabbing
- **Large radius on small elements**
- **Pure white cards on colored backgrounds**
- **Thick decorative borders**
- **Gradients and color for decoration** — color should mean something
- **Multiple accent colors** — dilutes focus
- **Different hues for different surfaces** — keep the same hue, shift only lightness
