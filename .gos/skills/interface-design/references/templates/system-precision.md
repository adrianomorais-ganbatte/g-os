# Design System — Precision & Density

Starter template for dashboard, admin, and data-heavy interfaces. Adapt values to your product's world — this is a starting point, not a prescription.

## Direction

**Personality:** Precision & Density
**Foundation:** Cool (slate)
**Depth:** Borders-only

## Tokens

### Spacing
Base: 4px
Scale: 4, 8, 12, 16, 24, 32

### Colors
```
--fg-primary: slate-900
--fg-secondary: slate-600
--fg-tertiary: slate-400
--fg-muted: slate-200
--border-default: rgba(0, 0, 0, 0.08)
--border-subtle: rgba(0, 0, 0, 0.05)
--accent: blue-600
```

### Radius
Scale: 4px, 6px, 8px (sharp, technical)

### Typography
Font: system-ui (fast, native feel)
Scale: 11, 12, 13, 14 (base), 16, 18
Weights: 400, 500, 600
Mono: SF Mono, Consolas (for data)

## Patterns

### Button
- Height: 32px (compact)
- Padding: 8px 12px
- Radius: 4px
- Font: 13px, 500 weight
- Border: 1px solid
- Usage: Actions in dense layouts

### Card
- Border: 0.5px solid (subtle)
- Padding: 12px
- Radius: 6px
- Shadow: none
- Usage: Data containers, metric displays

### Table Cell
- Padding: 8px 12px
- Font: 13px tabular-nums
- Border-bottom: 1px solid (subtle)

### Input
- Height: 32px
- Padding: 6px 8px
- Radius: 4px
- Background: inset (slightly darker)
- Border: 1px solid (default)

## Decisions

| Decision | Rationale |
|----------|-----------|
| Borders-only | Information density matters more than lift |
| Compact sizing | Power users, high information density |
| System fonts | Performance, native feel |
| Sharp radius | Technical, precise personality |
