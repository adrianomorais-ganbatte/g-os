# Critique

Post-build craft review protocol. Use after building to evaluate quality and rebuild what defaulted.

Your first build shipped the structure. Now look at it the way a design lead reviews a junior's work — not asking "does this work?" but "would I put my name on this?"

---

## The Gap

There's a distance between correct and crafted. Correct means the layout holds, the grid aligns, the colors don't clash. Crafted means someone cared about every decision down to the last pixel. You can feel the difference immediately — the way you tell a hand-thrown mug from an injection-molded one. Both hold coffee. One has presence.

Your first output lives in correct. This process pulls it toward crafted.

---

## See the Composition

Step back. Look at the whole thing.

- **Rhythm:** Great interfaces breathe unevenly — dense tooling areas give way to open content, heavy elements balance against light ones. Default layouts are monotone: same card size, same gaps, same density everywhere. Flatness is the sound of no one deciding.

- **Proportions:** A 280px sidebar next to full-width content says "navigation serves content." A 360px sidebar says "these are peers." If you can't articulate what your proportions are saying, they're not saying anything.

- **Focal point:** Every screen has one thing the user came here to do. That thing should dominate — through size, position, contrast, or the space around it. When everything competes equally, nothing wins.

---

## See the Craft

Move close. Pixel-close.

- **Spacing:** Every value a multiple of the base unit, no exceptions. But correctness alone isn't craft — a tool panel at 16px padding feels workbench-tight, the same card at 24px feels like a brochure. Density is a design decision, not a constant.

- **Typography:** Legible even squinted. If size is the only thing separating headline from body from label, the hierarchy is too weak. Weight, tracking, and opacity create layers that size alone can't.

- **Surfaces:** Should whisper hierarchy. Remove every border mentally — can you still perceive structure through surface color alone? If not, your surfaces aren't working hard enough.

- **Interactive elements:** Every button, link, and clickable region should respond to hover and press. Missing states make an interface feel like a photograph of software instead of software.

---

## See the Content

Read every visible string as a user would. Not checking for typos — checking for truth.

Does this screen tell one coherent story? Could a real person at a real company be looking at exactly this data right now? Or does the page title belong to one product, the article body to another, and the sidebar metrics to a third?

Content incoherence breaks the illusion faster than any visual flaw.

---

## See the Structure

Open the CSS and find the lies — the places that look right but are held together with tape.

- Negative margins undoing a parent's padding
- `calc()` values that exist only as workarounds
- Absolute positioning to escape layout flow

Each is a shortcut where a clean solution exists. Cards with full-width dividers use flex column and section-level padding. Centered content uses `max-width` with auto margins. The correct answer is always simpler than the hack.

---

## Critique Checklist

| Area | Check | Pass? |
|------|-------|-------|
| Composition | Layout has rhythm (dense + open areas) | |
| Composition | Clear focal point exists | |
| Composition | Proportions are intentional | |
| Craft | All spacing on grid | |
| Craft | Typography hierarchy has 3+ distinguishable levels | |
| Craft | Surfaces whisper hierarchy without borders | |
| Craft | All interactive elements have hover/focus/active states | |
| Content | Screen tells one coherent story | |
| Content | Data feels realistic, not placeholder | |
| Structure | No negative margin hacks | |
| Structure | No absolute positioning for layout | |
| Structure | No unnecessary calc() workarounds | |

---

## Process

1. Open the file you just built
2. Walk through each area: composition, craft, content, structure
3. Identify every place you defaulted instead of decided
4. Rebuild those parts — from the decision, not from a patch
5. Do not narrate the critique to the user. Do the work. Show the result.

The first build was the draft. The critique is the design.
