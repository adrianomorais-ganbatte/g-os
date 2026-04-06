# Craft in Action

This shows the thinking behind common design decisions. Learn the reasoning, not the values — your values will differ, but the approach won't.

---

## The Mindset

You should barely notice the system working.

When you look at Vercel's dashboard, you don't think "nice borders." You just understand the structure. When you look at Supabase, you don't think "good surface elevation." You just know what's above what. The craft is invisible — that's how you know it's working.

---

## Decision: Sidebar Background

**Default:** Make the sidebar a different color than the main content area.

**Craft choice:** Same background as canvas, subtle border separation.

**Why:** Different colors fragment the visual space into "sidebar world" and "content world." The sidebar becomes a separate region instead of part of the app. A subtle border is enough — it defines the boundary without creating a visual cliff.

Vercel does this. Supabase does this. The border is enough.

---

## Decision: Dropdown Elevation

**Default:** Same surface level as the card it emerged from.

**Craft choice:** One elevation level above the parent surface.

**Why:** If dropdown and card share the same surface level, the dropdown blends into the card — you lose the sense of layering. One level higher is just light enough to feel "above" without being dramatically different.

Use a slightly more opaque border for overlays (dropdowns, popovers) — floating elements need more definition because they're in space, not anchored to layout.

---

## Decision: Input Background

**Default:** Lighter or same as surrounding surface.

**Craft choice:** Slightly darker than surroundings (inset).

**Why:** Inputs receive content — they're "inset" containers. A slightly darker background signals "type here" without needing heavy borders. This is the inset/alternative-background principle.

```css
/* Input sits IN the surface, not ON it */
--control-bg: hsl(220 13% 7%);  /* darker than --bg-surface-1 */
```

---

## Decision: Focus States

**Default:** Dramatic glowing ring or heavy color border.

**Craft choice:** Subtle but noticeable border opacity increase.

**Why:** Focus needs to be visible for accessibility, but it doesn't need to scream. A clear increase in border opacity (from 0.08 to 0.20) provides state change without visual disruption. For accent rings, use a low-opacity spread:

```css
/* Subtle but findable */
--control-ring: 0 0 0 2px rgba(59, 130, 246, 0.3);
```

The principle: subtle-but-noticeable — the same as surfaces.

---

## Decision: Border Implementation

**Default:** Solid hex borders (`border: 1px solid #333`).

**Craft choice:** Low-opacity rgba borders (`border: 0.5px solid rgba(255,255,255,0.08)`).

**Why:** Low-opacity borders blend with their background. They define edges without demanding attention. Solid hex borders look harsh in comparison and create visible lines that compete with content.

The border should disappear when you're not looking for it, but be findable when you need structure.

---

## Decision: Surface Elevation Scale

**Default:** Dramatic jumps between surface levels (dark to light, or heavy shadow).

**Craft choice:** Whisper-quiet shifts — a few percentage points of lightness.

**Why:** Study Vercel, Supabase, Linear — their surfaces are barely different but still distinguishable. In dark mode:

```
Level 0 (base):    hsl(220 13% 9%)   — the canvas
Level 1 (card):    hsl(220 13% 11%)  — +2% lightness
Level 2 (overlay): hsl(220 13% 13%)  — +2% lightness
Level 3 (nested):  hsl(220 13% 16%)  — +3% lightness
```

You can barely see it in isolation. But when surfaces stack, the hierarchy emerges.

**What NOT to do:** Don't make dramatic jumps. Don't use different hues for different levels. Keep the same hue, shift only lightness.

---

## The Squint Test

Apply this to everything you build:

1. Blur your eyes or step back from the screen
2. Can you still perceive hierarchy? (what's above what, where regions divide)
3. Is anything jumping out harshly? (borders, shadows, color shifts)
4. Can you tell where regions begin and end?

**If hierarchy is visible and nothing is harsh** — the subtle layering is working.

**If borders jump out** — reduce opacity.

**If you can't find where regions end** — increase slightly.

**If everything looks flat** — your surface elevation scale needs more separation (but still subtle).

---

## Adapting to Context

The principle is constant: barely different, still distinguishable.

The values adapt:
- **Warmer products:** slight yellow/orange tint in surfaces
- **Cooler products:** blue-gray base
- **Light mode:** higher elevation = slightly lighter or uses shadow (inverted from dark mode)
- **Dense tools:** tighter spacing, smaller surfaces, more information per viewport
- **Calm apps:** generous spacing, fewer elements per viewport, more breathing room

Different contexts, same craft standard.
