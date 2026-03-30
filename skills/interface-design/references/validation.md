# Validation & Memory Management

When and how to update `.interface-design/system.md`. Rules for pattern persistence and consistency verification.

---

## When to Add Patterns

Add to system.md when:
- Component used **2+ times** in the project
- Pattern is **reusable** across different contexts
- Has **specific measurements** worth remembering (height, padding, radius, shadow)

## When NOT to Add

- **One-off components** — unique to a single page/context
- **Temporary experiments** — still iterating on the design
- **Variations better handled with props** — a Button with size variants doesn't need separate patterns per size

---

## Pattern Format

Keep patterns concise and scannable:

```markdown
### Button Primary
- Height: 36px
- Padding: 12px 16px
- Radius: 6px
- Font: 14px, 500 weight
- Usage: Primary actions, form submits
```

Include:
- Name (component + variant)
- Key measurements (height, padding, radius)
- Typography if specific (size, weight)
- Usage context (when to use this pattern)

---

## Pattern Reuse Rules

Before creating any component, **check system.md first:**

1. **Pattern exists?** Use it exactly. Don't reinvent.
2. **Need a variation?** Extend the existing pattern, don't create a new one from scratch.
3. **New pattern type?** Build it, then add to system.md after first use.
4. **Pattern outdated?** Update the system.md entry, don't just override silently.

Memory compounds: each pattern saved makes future work faster and more consistent.

---

## system.md Structure

```markdown
# Design System

## Direction
Personality: [Precision & Density / Warmth / etc]
Foundation: [Cool slate / Warm stone / etc]
Depth: [Borders-only / Subtle shadows / Layered]

## Tokens
### Spacing
Base: 4px
Scale: 4, 8, 12, 16, 24, 32

### Colors
--foreground: [value]
--secondary: [value]
--accent: [value]

### Radius
Scale: [values]

### Typography
Font: [family]
Scale: [sizes]
Weights: [values]

## Patterns
### [Component Name]
- [Key properties]
- Usage: [when to use]

## Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| [choice] | [why]     | [when] |
```

---

## Consistency Checks

If system.md defines values, verify against them:

| Check | Rule |
|-------|------|
| **Spacing** | All values multiples of defined base unit |
| **Depth** | Using declared strategy throughout (borders-only = no shadows) |
| **Colors** | Using defined palette, no random hex codes |
| **Patterns** | Reusing documented patterns instead of creating new |
| **Radius** | Using defined scale, not ad-hoc values |
| **Typography** | Using defined font stack and size scale |

---

## When to Update system.md

| Trigger | Action |
|---------|--------|
| New reusable component built | Add pattern after confirmation |
| Existing pattern modified | Update pattern entry |
| Direction change | Update Direction section, verify cascading consistency |
| New token added | Add to Tokens section |
| Design decision made | Add to Decisions table with rationale |

---

## Offering to Save

After completing any UI building task, always offer:

```
"Want me to save these patterns for future sessions?"
```

If yes, write or update `.interface-design/system.md` with:
- Direction and feel (if new project)
- Depth strategy
- Spacing base unit
- Any new component patterns
- Key decisions with rationale
