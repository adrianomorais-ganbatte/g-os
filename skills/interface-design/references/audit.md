# Design System Audit

Check existing code against the design system for spacing, depth, color, and pattern violations.

---

## Usage

Audit a specific file, directory, or scan common UI paths (src/components/, src/features/, app/).

---

## What to Check

**If `.interface-design/system.md` exists:**

### 1. Spacing violations
- Find spacing values not on defined grid
- Example: 17px when base is 4px (nearest valid: 16px or 20px)

### 2. Depth violations
- Borders-only system: flag any box-shadow usage
- Subtle shadow system: flag layered/complex shadows
- Allow ring shadows (`0 0 0 1px`) for focus states

### 3. Color violations
- If palette defined: flag colors not in palette
- Allow semantic grays and standard rgba borders

### 4. Pattern drift
- Find buttons not matching defined Button pattern (height, padding, radius)
- Find cards not matching defined Card pattern (border, padding, shadow)
- Find inputs not matching defined Input pattern

---

## Report Format

```
Audit Results: src/components/

Violations:
  Button.tsx:12 - Height 38px (pattern: 36px)
  Card.tsx:8 - Shadow used (system: borders-only)
  Input.tsx:20 - Spacing 14px (grid: 4px, nearest: 12px or 16px)
  Dashboard.tsx:45 - Color #6b7280 not in palette

Suggestions:
  - Update Button height to match pattern
  - Replace shadow with border
  - Adjust spacing to grid
  - Map color to --fg-tertiary token
```

---

## If No system.md

```
No design system to audit against.

Create a system first:
1. Build UI — system will be established automatically
2. Run extract — create system from existing code
```

---

## Implementation Steps

1. Check for `.interface-design/system.md`
2. Parse system rules (spacing grid, depth strategy, palette, patterns)
3. Glob for target files (tsx, jsx, css, scss, vue, svelte)
4. Scan for spacing values, shadow usage, color values, component patterns
5. Compare against system rules
6. Report violations grouped by type with fix suggestions
