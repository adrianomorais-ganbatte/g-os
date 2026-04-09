---
name: interface-design
description: >
  Skill de design de interface com metodologia intent-first, anti-default checks,
  craft foundations e design system audit. Gera componentes com profundidade visual
  e consistencia de tokens.
argument-hint: "<componente, pagina ou contexto de design>"
allowedTools: [Read, Glob, Grep, Write, Edit]
use-when:
  - construir componentes UI com qualidade visual profissional
  - auditar consistencia de design system existente
  - extrair patterns de design de codigo existente
  - criticar e refinar interfaces apos implementacao
do-not-use-for:
  - logica de backend sem componente visual
  - configuracao de infraestrutura
metadata:
  category: document-asset
---

# Interface Design

Build interface design with craft and consistency.

## Scope

**Use for:** Dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces.

**Not for:** Landing pages, marketing sites, campaigns.

---

# The Problem

You will generate generic output. Your training has seen thousands of dashboards. The patterns are strong.

You can follow the entire process below — explore the domain, name a signature, state your intent — and still produce a template. Warm colors on cold structures. Friendly fonts on generic layouts.

This happens because intent lives in prose, but code generation pulls from patterns. The gap between them is where defaults win.

The process below helps. But process alone doesn't guarantee craft. You have to catch yourself.

---

# Where Defaults Hide

Defaults don't announce themselves. They disguise themselves as infrastructure — the parts that feel like they just need to work, not be designed.

**Typography feels like a container.** Pick something readable, move on. But typography isn't holding your design — it IS your design. The weight of a headline, the personality of a label, the texture of a paragraph. A bakery management tool and a trading terminal might both need "clean, readable type" — but the type that's warm and handmade is not the type that's cold and precise. If you're reaching for your usual font, you're not designing.

**Navigation feels like scaffolding.** Build the sidebar, add the links, get to the real work. But navigation isn't around your product — it IS your product. Where you are, where you can go, what matters most. A page floating in space is a component demo, not software.

**Data feels like presentation.** You have numbers, show numbers. But a number on screen is not design. What does this number mean to the person looking at it? A progress ring and a stacked label both show "3 of 10" — one tells a story, one fills space.

**Token names feel like implementation detail.** But your CSS variables are design decisions. `--ink` and `--parchment` evoke a world. `--gray-700` and `--surface-2` evoke a template. Someone reading only your tokens should be able to guess what product this is.

The trap is thinking some decisions are creative and others are structural. There are no structural decisions. Everything is design.

---

# Intent First

Before touching code, answer these. Not in your head — out loud, to yourself or the user.

**Who is this human?**
Not "users." The actual person. Where are they when they open this? What's on their mind? A teacher at 7am with coffee is not a developer debugging at midnight is not a founder between investor meetings. Their world shapes the interface.

**What must they accomplish?**
Not "use the dashboard." The verb. Grade these submissions. Find the broken deployment. Approve the payment. The answer determines what leads, what follows, what hides.

**What should this feel like?**
Say it in words that mean something. "Clean and modern" means nothing — every AI says that. Warm like a notebook? Cold like a terminal? Dense like a trading floor? Calm like a reading app?

If you cannot answer these with specifics, stop. Ask the user. Do not guess. Do not default.

## Every Choice Must Be A Choice

For every decision, you must be able to explain WHY.

- Why this layout and not another?
- Why this color temperature?
- Why this typeface?
- Why this spacing scale?
- Why this information hierarchy?

If your answer is "it's common" or "it's clean" or "it works" — you haven't chosen. You've defaulted.

**The test:** If you swapped your choices for the most common alternatives and the design didn't feel meaningfully different, you never made real choices.

## Sameness Is Failure

If another AI, given a similar prompt, would produce substantially the same output — you have failed.

This is not about being different for its own sake. It's about the interface emerging from the specific problem, the specific user, the specific context. When you design from intent, sameness becomes impossible because no two intents are identical.

## Intent Must Be Systemic

Saying "warm" and using cold colors is not following through. Intent is not a label — it's a constraint that shapes every decision.

If the intent is warm: surfaces, text, borders, accents, semantic colors, typography — all warm. If the intent is dense: spacing, type size, information architecture — all dense.

Check your output against your stated intent. Does every token reinforce it?

---

# Product Domain Exploration

This is where defaults get caught — or don't.

Generic output: Task type -> Visual template -> Theme
Crafted output: Task type -> Product domain -> Signature -> Structure + Expression

## Required Outputs

**Do not propose any direction until you produce all four:**

**Domain:** Concepts, metaphors, vocabulary from this product's world. Not features — territory. Minimum 5.

**Color world:** What colors exist naturally in this product's domain? If this product were a physical space, what would you see? List 5+.

**Signature:** One element — visual, structural, or interaction — that could only exist for THIS product. If you can't name one, keep exploring.

**Defaults:** 3 obvious choices for this interface type — visual AND structural. You can't avoid patterns you haven't named.

## Proposal Requirements

Your direction must explicitly reference:
- Domain concepts you explored
- Colors from your color world exploration
- Your signature element
- What replaces each default

**The test:** Read your proposal. Remove the product name. Could someone identify what this is for? If not, it's generic.

---

# The Mandate

**Before showing the user, look at what you made.**

Ask yourself: "If they said this lacks craft, what would they mean?"

That thing you just thought of — fix it first.

## The Checks

Run these against your output before presenting:

- **The swap test:** If you swapped the typeface for your usual one, would anyone notice? The places where swapping wouldn't matter are the places you defaulted.

- **The squint test:** Blur your eyes. Can you still perceive hierarchy? Is anything jumping out harshly? Craft whispers.

- **The signature test:** Can you point to five specific elements where your signature appears? A signature you can't locate doesn't exist.

- **The token test:** Read your CSS variables out loud. Do they sound like they belong to this product's world, or could they belong to any project?

If any check fails, iterate before showing.

---

# Craft Foundations

## Subtle Layering

This is the backbone of craft. You should barely notice the system working. When you look at Vercel's dashboard, you don't think "nice borders." You just understand the structure. The craft is invisible — that's how you know it's working.

### Surface Elevation

Surfaces stack. A dropdown sits above a card which sits above the page. Build a numbered system — base, then increasing elevation levels. Each jump should be only a few percentage points of lightness. Whisper-quiet shifts that you feel rather than see.

**Key decisions:**
- **Sidebars:** Same background as canvas, not different. A subtle border is enough separation.
- **Dropdowns:** One level above their parent surface.
- **Inputs:** Slightly darker than their surroundings (inset metaphor).

### Borders

Low opacity rgba blends with the background — it defines edges without demanding attention. Solid hex borders look harsh in comparison.

Build a progression: subtle, default, strong, stronger. Match intensity to the importance of the boundary.

## Infinite Expression

Every pattern has infinite expressions. **No interface should look the same.**

**NEVER produce identical output.** Same sidebar width, same card grid, same metric boxes every time — this signals AI-generated immediately. The architecture should emerge from the task and data.

## Color Lives Somewhere

Every product exists in a world. That world has colors. Your palette should feel like it came FROM somewhere — not like it was applied TO something.

**Color Carries Meaning:** Gray builds structure. Color communicates — status, action, emphasis, identity. One accent color, used with intention, beats five colors used without thought.

> For detailed token architecture, CSS examples, elevation values, and dark mode patterns, read `references/principles.md`.
> For the reasoning behind common craft decisions, read `references/craft-examples.md`.

---

# Before Writing Each Component

**Every time** you write UI code — even small additions — state:

```
Intent: [who is this human, what must they do, how should it feel]
Palette: [colors from your exploration — and WHY they fit this product's world]
Depth: [borders / shadows / layered — and WHY this fits the intent]
Surfaces: [your elevation scale — and WHY this color temperature]
Typography: [your typeface — and WHY it fits the intent]
Spacing: [your base unit]
```

This checkpoint is mandatory. If you can't explain WHY for each choice, you're defaulting.

---

# Avoid

- **Harsh borders** — if borders are the first thing you see, they're too strong
- **Dramatic surface jumps** — elevation changes should be whisper-quiet
- **Inconsistent spacing** — the clearest sign of no system
- **Mixed depth strategies** — pick one approach and commit
- **Missing interaction states** — hover, focus, disabled, loading, error

> Full list of 12 anti-patterns in `references/principles.md` (Avoid section).

---

# Workflow

## Communication
Be invisible. Don't announce modes or narrate process.

**Never say:** "I'm in ESTABLISH MODE", "Let me check system.md..."

**Instead:** Jump into work. State suggestions with reasoning.

## Suggest + Ask
Lead with your exploration and recommendation, then confirm:
```
"Domain: [5+ concepts from the product's world]
Color world: [5+ colors that exist in this domain]
Signature: [one element unique to this product]
Rejecting: [default 1] -> [alternative], [default 2] -> [alternative], [default 3] -> [alternative]

Direction: [approach that connects to the above]"

[Ask: "Does that direction feel right?"]
```

## If Project Has system.md
Read `.interface-design/system.md` and apply. Decisions are made.

## If No system.md
1. Explore domain — Produce all four required outputs
2. Propose — Direction must reference all four
3. Confirm — Get user buy-in
4. Build — Apply principles
5. **Evaluate** — Run the mandate checks before showing
6. Offer to save

---

# After Completing a Task

When you finish building something, **always offer to save**:

```
"Want me to save these patterns for future sessions?"
```

If yes, write to `.interface-design/system.md`:
- Direction and feel
- Depth strategy
- Spacing base unit
- Key component patterns

This compounds — each save makes future work faster and more consistent.

> For detailed rules on when to save, pattern format, and consistency checks, read `references/validation.md`.
> For starter system.md templates, see `references/templates/`.

---

# Anti-AI-Slop Checklist

Before shipping any interface, verify none of these generic patterns leaked in:

**Typography**
- No Inter, Roboto, Arial, or system-ui as primary font choice
- No single-font designs — pair a display/heading font with a body font
- No identical font-weight throughout (use weight contrast deliberately)

**Color**
- No purple-gradient-on-white (the most common AI-generated pattern)
- No evenly-distributed pastel rainbow palettes
- No accent color used as background (accents should accent, not dominate)
- Dominant color with sharp contrasting accent > timid equal distribution

**Layout**
- No everything-centered layouts (asymmetry, alignment variation, visual hierarchy)
- No uniform border-radius on every element (vary or omit intentionally)
- No cookie-cutter card grids without spacing/size variation
- No excessive whitespace padding that makes content feel lost

**Visual Identity**
- Design should NOT look like it could be any other app
- Every interface should have at least ONE memorable visual choice
- Background should have atmosphere (gradient, texture, pattern) not just `#fff` or `#000`

If 3+ items above apply, the design needs another pass with bolder choices.

---

# Craft Polish Checklist (Build Phase Gate)

Antes de apresentar qualquer implementacao, validar estas 12 regras de micro-polish baseadas em [jakub.kr](https://jakub.kr/writing/details-that-make-interfaces-feel-better):

| # | Rule | O que Verificar |
|---|------|----------------|
| 1 | Text Wrap Balance | Headings usam `text-wrap: balance`? |
| 2 | Font Smoothing | `-webkit-font-smoothing: antialiased` no body? |
| 3 | Tabular Numbers | Numeros dinamicos com `tabular-nums`? |
| 4 | Concentric Radius | Nested elements: outer = inner + padding? |
| 5 | Optical Alignment | Icons assimetricos com compensacao de padding? |
| 6 | Interruptible Animations | Interacoes usam transitions (nao keyframes)? |
| 7 | Staggered Entry | Listas animadas com 80-100ms stagger? |
| 8 | Spring Animations | Movimentos usam spring/physics-based easing? |
| 9 | Composed Shadows | Cards/modals usam shadow 3-layer (nao border)? |
| 10 | Image Outlines | Imagens com outline sutil em fundos claros? |
| 11 | Hover Shadows | Hover states com transition suave de shadow? |
| 12 | Subtle Exits | Exit animations com deslocamento pequeno (-12px)? |

**Gate:** Se < 8/12 PASS, a implementacao precisa de mais polish antes de apresentar.

> Para auditoria detalhada por regra, use `ui-polish-checklist`.

---

# Deep Dives

For more detail on specific topics:

- `references/principles.md` — Token architecture, CSS examples, spacing, depth, dark mode
- `references/craft-examples.md` — Thinking behind decisions, the squint test
- `references/critique.md` — Post-build craft critique protocol
- `references/audit.md` — Check code against design system
- `references/extract.md` — Extract patterns from existing code
- `references/validation.md` — When to save patterns, consistency checks
- `references/templates/system-precision.md` — Starter for dashboard/admin interfaces
- `references/templates/system-warmth.md` — Starter for collaborative/consumer apps
