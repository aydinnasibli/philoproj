---
name: The Living Manuscript
description: An interactive map of Western philosophical thought, tracing lineage, ideas, and connections between history's greatest thinkers.
colors:
  vellum: "#fafaf9"
  warm-canvas: "#f5f5f4"
  deep-ink: "#09090b"
  active-ink: "#18181b"
  annotation: "#64748b"
  divider: "#f4f4f5"
  dark-base: "#0c0a09"
  dark-surface: "#1c1917"
  dark-text: "#f5f5f4"
  dark-border: "#27272a"
  dark-annotation: "#a8a29e"
  dark-active: "#d4d4d8"
  notes-gold: "#845400"
  notes-bronze: "#c47029"
  notes-tint: "#f5eee3"
typography:
  display:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(3rem, 7vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Cinzel, serif"
    fontSize: "0.65rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.deep-ink}"
    textColor: "{colors.vellum}"
    rounded: "{rounded.xs}"
    padding: "14px 40px"
  button-primary-hover:
    backgroundColor: "{colors.active-ink}"
    textColor: "{colors.vellum}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.xs}"
    padding: "12px 20px"
  button-ghost-hover:
    backgroundColor: "{colors.warm-canvas}"
    textColor: "{colors.deep-ink}"
  chip-era:
    backgroundColor: "{colors.warm-canvas}"
    textColor: "{colors.annotation}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  chip-era-active:
    backgroundColor: "{colors.active-ink}"
    textColor: "{colors.vellum}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.annotation}"
  nav-item-active:
    backgroundColor: "transparent"
    textColor: "{colors.active-ink}"
---

# Design System: The Living Manuscript

## 1. Overview

**Creative North Star: "The Cartographer's Table"**

A working map is a monochrome discipline: black ink on paper, structure as the aesthetic, hierarchy through weight and scale rather than color. The Living Manuscript treats the philosophy network, the lineage timeline, and the thinkers archive as literal maps of intellectual territory. The design does not decorate this territory; it charts it. Every typographic choice, every spacing decision, every border treatment is in service of orientation.

The system operates in two registers. All main surfaces (Network, Lineage, Schools, Thinkers) use the ink-and-paper palette: near-flat monochrome with EB Garamond carrying the scholarly voice, Cinzel providing inscriptional punctuation for era labels, and Inter handling interface chrome. The My Notes section is the explicit exception: it introduces Manuscript Gold as a personal signal, marking a space that belongs to the user rather than to the canon. The distinction is intentional and should be preserved.

The single anti-reference is Wikipedia. Wikipedia fails not through lack of decoration but through lack of confidence: dense text without typographic intention, no sense of place, no hierarchy between what is primary and what is supporting. The Living Manuscript beats Wikipedia not through contrast and color but through considered type scale, deliberate spacing, and the willingness to let blank space hold its ground.

**Key Characteristics:**
- Monochrome outside `/my-notes`; gold is a personal signal, not an accent
- EB Garamond carries all content the user reads; Inter carries all interface chrome; Cinzel marks inscriptions
- Nearly flat; depth through tonal layering (`stone-100` over `stone-50`), not shadow stacks
- Both light and dark modes are primary and designed with equal care
- Motion uses `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-expo) exclusively; no bounce, no spring

## 2. Colors: The Ink-and-Paper Field

Ink and paper, in both directions. Light mode is a warm near-white field with near-black ink. Dark mode inverts: a near-black field with near-white ink. All neutrals are warm-shifted (stone and zinc families) to avoid clinical gray.

### Primary

- **Active Ink** (`#18181b`, zinc-900): The interactive accent on all main surfaces. Active navigation states, active icon containers, hover treatments where a background is needed. Tailwind: `text-zinc-900 dark:text-zinc-300`, `bg-zinc-900/9 dark:bg-zinc-300/9` for active fills.
- **Active Edge** (`#d4d4d8`, zinc-300): The dark-mode inversion of Active Ink. Not a separate accent; the same role in the dark register.

### Neutral

- **Vellum** (`#fafaf9`, stone-50): The base canvas. Every main page surface. Tailwind: `bg-stone-50 dark:bg-stone-950`.
- **Warm Canvas** (`#f5f5f4`, stone-100): Secondary surfaces, the sidebar, inset panels, card hover backgrounds. One tonal step above Vellum. Tailwind: `bg-stone-100 dark:bg-stone-900`.
- **Deep Ink** (`#09090b`, zinc-950): Primary text and headings. Tailwind: `text-zinc-950 dark:text-stone-100`.
- **Annotation** (`#64748b`, slate-500): Muted text, metadata, dates, labels, inactive navigation. Tailwind: `text-slate-500 dark:text-stone-400`.
- **Divider** (`#f4f4f5`, zinc-100): Standard borders between sections and navigation. Tailwind: `border-zinc-100 dark:border-zinc-800`. On cards, use the tonal variant `border-zinc-950/[0.07] dark:border-stone-100/[0.07]` for a subtler, material feel.
- **Dark Base** (`#0c0a09`, stone-950): Dark mode page canvas. `dark:bg-stone-950`.
- **Dark Surface** (`#1c1917`, stone-900): Dark mode secondary surfaces. `dark:bg-stone-900`.

### Notes-Specific (My Notes only)

These tokens appear exclusively within `/my-notes`. They are forbidden on Network, Lineage, Schools, and Thinkers surfaces.

- **Manuscript Gold** (`#845400`): Interactive accent, active states, era chip text, and CTA fills within My Notes. Tailwind arbitrary values: `text-[#845400] dark:text-[#c47029]`, `bg-[#845400] hover:bg-[#c47029]`.
- **Amber Bronze** (`#c47029`): Hover and dark-mode variant of Manuscript Gold. Never used in parallel with Gold at rest; only as a state or dark-mode swap. `dark:text-[#c47029]`.
- **Parchment Tint** (`#f5eee3`): Selected chip backgrounds and active hover fills within My Notes. Tailwind: `bg-[#f5eee3] dark:bg-stone-800`. Border: `border-[rgba(132,84,0,0.18)]`.

**The Monochrome Rule.** All surfaces outside `/my-notes` use ink-and-paper tokens only. Manuscript Gold and Amber Bronze are prohibited outside My Notes. If a component originates in My Notes and is reused elsewhere, strip its gold treatment.

**The Gold Exile Rule.** The existing codebase still carries gold in the hero CTA, school cards, and philosopher panels. These are migration targets, not valid design choices for the current system. When touching any of those components, replace gold values with monochrome equivalents: `text-[#845400]` becomes `text-zinc-900`, `bg-[#845400]` becomes `bg-zinc-950`.

**The Dark Inversion Rule.** Dark mode mirrors light mode structurally: Vellum and Warm Canvas become Dark Base and Dark Surface; Deep Ink becomes Dark Text (`#f5f5f4`). Active Ink inverts from zinc-900 to zinc-300. No hue shifts; lightness only.

## 3. Typography

**Content Font:** EB Garamond (with Georgia, serif) — Tailwind class `font-serif`
**Interface Font:** Inter (with system-ui, sans-serif) — Tailwind class `font-sans`
**Inscription Font:** Cinzel (with serif) — Tailwind class `font-cinzel`

The system is a two-voice arrangement. EB Garamond is the voice of the canon: every word the user reads as content. Inter is the voice of the interface: navigation labels, descriptions inside tool surfaces, metadata. Cinzel is neither voice — it is the inscription language of the map itself: carved labels on a cartographic legend. These three fonts occupy different semantic spaces and never compete.

### Hierarchy

- **Display** (EB Garamond, italic, 500, `clamp(3rem, 7vw, 5.5rem)`, line-height 1.0, -0.02em tracking): Philosopher names at hero scale; the "The Living Manuscript" hero title. One instance per view. Never in list or repeat contexts.
- **Headline** (EB Garamond, 500, `clamp(1.25rem, 2.5vw, 1.75rem)`, line-height 1.2, -0.01em tracking): Section headings inside content areas. The scholarly voice of the product.
- **Title** (Cinzel, 400, `0.65rem`, line-height 1.4, 0.1em tracking, uppercase): Era labels on philosopher cards, period markers, philosophical era headers. Always small, always uppercase, always wide-tracked. A cartographic label, not a heading.
- **Body** (Inter, 400, `0.9375rem`, line-height 1.7): All interface descriptions, navigation labels, metadata, tool-surface text. Max line length 65–75ch on prose.
- **Label** (Inter, 500, `0.6875rem`, line-height 1.4, 0.06em tracking): Counts, relationship tags, small metadata. Uppercase in select contexts (nav labels, stat labels).

**The Register Rule.** If the user is reading content, the font is EB Garamond. If the user is navigating or scanning interface chrome, the font is Inter. A philosopher's biography in Inter is wrong. A navigation label in EB Garamond is wrong. No exceptions.

**The Cinzel Rule.** Cinzel appears in exactly four contexts: era labels and period markers on philosopher cards and timelines; the hero CTA ("Enter the Network"); primary action buttons within My Notes; and the "The Living Manuscript" sidebar brand label. It is always uppercase, always tracked (0.08em minimum), always small (0.6–0.75rem). It never appears in headings, body copy, descriptions, or secondary interface text.

## 4. Elevation

The system is nearly flat. Depth is communicated through tonal layering: Warm Canvas over Vellum is the primary depth tool, and that one-step contrast is sufficient to separate panel from canvas without any shadow. Shadows are reserved for state feedback only.

### Shadow Vocabulary

- **Ambient Presence** (`box-shadow: 0 2px 12px rgba(17, 21, 26, 0.04)`): Cards at rest. So subtle it reads as material weight rather than a cast shadow. Dark mode: `0 2px 12px rgba(0, 0, 0, 0.12)`.
- **State Lift** (`box-shadow: 0 8px 28px rgba(17, 21, 26, 0.08)`): Cards on hover, open panels. Present enough to signal elevation change; restrained enough to stay editorial.

**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadows respond to state (hover, open, focus) and only to state. A shadow that is always visible is decoration, and decoration is prohibited.

## 5. Components

### Buttons

Monochrome on all main surfaces. Confident, not passive. Primary uses Cinzel for its label, enforcing the cartographic register.

- **Shape:** 2px radius (`rounded-xs`). Not pill, not sharp. Slightly softened.
- **Primary (main surfaces):** Deep Ink background (`bg-zinc-950`), Vellum text (`text-stone-50`), Cinzel font at `0.7rem` 0.25em tracking uppercase, 14px/40px padding. Shadow: `shadow-[0_8px_32px_rgba(9,9,11,0.2),0_2px_8px_rgba(9,9,11,0.1)]`. Hover: Active Ink (`hover:bg-zinc-900`). Transition: 180ms `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Ghost (main surfaces):** Transparent background, `border border-zinc-950/[0.15]` border, Deep Ink text, Inter font. Hover: Warm Canvas background (`hover:bg-stone-100`), border to `border-zinc-950/[0.25]`. Transition: 150ms.
- **Focus:** 2px Active Ink outline, 2px offset. `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900`.
- **My Notes Primary (exception):** Manuscript Gold background (`bg-[#845400]`), Vellum text, Cinzel label. Hover: Amber Bronze (`hover:bg-[#c47029]`). Same radius and padding as main primary.

### Chips / Era Tags

- **Default:** Warm Canvas background (`bg-stone-100 dark:bg-stone-800`), Annotation text (`text-slate-500 dark:text-stone-400`), pill shape (`rounded-full`). Cinzel, `text-[0.6rem]`, uppercase, `tracking-widest`. Full class pattern: `font-cinzel text-[0.6rem] uppercase tracking-widest bg-stone-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 px-2.5 py-0.5 rounded-full`.
- **Active/Selected:** Active Ink background (`bg-zinc-900 dark:bg-zinc-300`), Vellum text (`text-stone-50 dark:text-zinc-950`).
- **My Notes chips (exception):** Parchment Tint bg (`bg-[#f5eee3] dark:bg-stone-800`), Manuscript Gold text (`text-[#845400] dark:text-[#c47029]`), Gold border (`border border-[rgba(132,84,0,0.18)] dark:border-stone-700`).

### Cards / Containers

- **Corner Style:** No radius to 2px (`rounded-none` or implied). Cards are precise containers, not soft pouches.
- **Background:** `bg-stone-50/70 dark:bg-stone-900/70`. Hover: `hover:bg-stone-50 dark:hover:bg-stone-900` (full opacity).
- **Shadow:** Ambient Presence at rest. State Lift on hover.
- **Border:** `border border-zinc-950/[0.07] dark:border-stone-100/[0.07]` — all four sides, never one.
- **Hover border:** `hover:border-zinc-700/[0.12] dark:hover:border-zinc-500/[0.12]`.
- **Internal Padding:** 24–28px (`px-7 pt-7 pb-6`). Layout gap separate.
- **Transition:** `transition-[background,border-color,box-shadow] duration-200` with Framer `whileHover={{ y: -3 }}`.

### Inputs / Fields

- **Style:** 1px solid `border-stone-300 dark:border-stone-700` border, `bg-stone-100 dark:bg-stone-800` background, 4px radius (`rounded-sm`).
- **Focus:** `focus:border-zinc-900 dark:focus:border-zinc-300`, focus ring `shadow-[0_0_0_3px_rgba(24,24,27,0.1)]`.
- **Text:** `text-zinc-950 dark:text-stone-100`. Placeholder: `placeholder:text-slate-500 dark:placeholder:text-stone-500`.

### Navigation (Sidebar)

Fixed 80px, icon-only at rest. Entirely monochrome.

- **Background:** `bg-stone-50 dark:bg-stone-900`, right border `border-r border-zinc-100 dark:border-zinc-800`.
- **Inactive:** `text-slate-500 dark:text-stone-400 opacity-55`.
- **Active:** `text-zinc-900 dark:text-zinc-300 opacity-100`. Active icon container: `bg-zinc-900/9 dark:bg-zinc-300/9` (8px radius, 40x40). Active indicator: `absolute -left-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-zinc-900 dark:bg-zinc-300 rounded-r-sm`.
- **Transition:** `transition-opacity duration-300` for items, `transition-[background] duration-300` for icon container.
- **Brand label:** EB Garamond italic, `text-xs text-zinc-950/45 dark:text-stone-100/45 tracking-widest [writing-mode:vertical-lr] rotate-180`.

### Philosopher Panel (Signature Component)

Slides in from the right as contextual context. Never a modal interrupt.

- **Background:** `bg-stone-50 dark:bg-stone-900`. Hairlines: `border-zinc-950/[0.08] dark:border-stone-100/[0.08]`.
- **Name:** Display type (EB Garamond italic 500, hero scale).
- **Biography:** EB Garamond, 1rem, line-height 1.7.
- **Metadata:** Inter label size.
- **Era tint:** A radial gradient from a single era hue to transparent at the top edge only, fading over the first 30% of panel height. One color to transparent only; never two colors.

## 6. Do's and Don'ts

### Do:
- **Do** use `bg-stone-50 dark:bg-stone-950` for base page canvases and `bg-stone-100 dark:bg-stone-900` for secondary surfaces.
- **Do** use `text-zinc-950 dark:text-stone-100` for all primary text and headings.
- **Do** use EB Garamond (`font-serif`) for all content the user reads, and Inter (`font-sans`) for all navigation and interface chrome. Never mix.
- **Do** use Cinzel (`font-cinzel`) exclusively for era labels, period markers, hero/notes CTA labels, and the sidebar brand name. Always uppercase, always small (0.6–0.75rem), always tracked.
- **Do** use `border-zinc-950/[0.07] dark:border-stone-100/[0.07]` on cards, full four sides, never one.
- **Do** restrict Manuscript Gold (`#845400` / `#c47029`) entirely to `/my-notes`. All other surfaces are monochrome.
- **Do** apply Ambient Presence shadow at card rest and State Lift on hover or open. Never on static surfaces.
- **Do** use `cubic-bezier(0.22, 1, 0.36, 1)` for all transitions and Framer Motion easings. No other easing curves.
- **Do** honor `prefers-reduced-motion` on all Framer Motion animations.
- **Do** migrate any gold (`text-[#845400]`, `bg-[#845400]`, etc.) found on Network, Lineage, Schools, or Thinkers surfaces to their monochrome equivalents when touching those components.

### Don't:
- **Don't** make it feel like Wikipedia: clinical density, no typographic hierarchy, no spatial intention, no sense of place. Beat it through scale contrast and space, not through decoration.
- **Don't** use Manuscript Gold on any surface outside `/my-notes`. Gold outside My Notes is a mistake, not a design choice.
- **Don't** use EB Garamond for navigation labels, filter controls, or any text the user scans rather than reads. That is Inter's register.
- **Don't** use Cinzel for headings, descriptions, philosopher biographies, or any running text longer than a label. It is an inscription font, not a prose font.
- **Don't** use Playfair Display or Cormorant. They are in the font stack for historical reasons. EB Garamond is the sole content serif; they have no defined role in the current system.
- **Don't** use a side-stripe border (`border-l` or `border-r` greater than 1px as an accent color) on any card, callout, or list item. Use full borders, background tints, or nothing.
- **Don't** use gradient text (`background-clip: text` with a multi-stop gradient). Emphasis through weight or scale; a single solid color only.
- **Don't** add shadows to surfaces at rest. Flat-by-default is not a constraint to work around.
- **Don't** animate layout properties (width, height, padding, margin). Opacity and transform only.
- **Don't** use glassmorphism, grain overlays, or parchment texture effects. The atmospheric direction has been retired; the system earns its warmth through typography and spacing alone.
