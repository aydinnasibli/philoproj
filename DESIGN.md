---
name: The Living Manuscript
description: A living map of Western philosophical thought — tracing lineage, ideas, and connections across history.
colors:
  aged-vellum: "#FCFBF9"
  canvas-warm: "#F8F5EE"
  midnight-ink: "#11151A"
  ash-gray: "#5F6A78"
  old-gold: "#845400"
  warm-bronze: "#C47029"
  gilt-edge: "#D4B08C"
  parchment-tint: "#F5EEE3"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.2rem, 4vw, 3.2rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
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
    backgroundColor: "{colors.old-gold}"
    textColor: "{colors.aged-vellum}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.warm-bronze}"
    textColor: "{colors.aged-vellum}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.parchment-tint}"
    textColor: "{colors.old-gold}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ash-gray}"
    rounded: "{rounded.sm}"
    padding: "8px"
  nav-item-active:
    backgroundColor: "{colors.parchment-tint}"
    textColor: "{colors.old-gold}"
---

# Design System: The Living Manuscript

## 1. Overview

**Creative North Star: "The Scholar's Study"**

A private, well-used intellectual space. The Living Manuscript treats philosophy not as a subject studied at a distance, but as a living conversation the user steps into. Every surface should feel inhabited: warm, slightly worn, full of accumulated meaning. Not pristine. Not sterile.

The system refuses three failure modes by name. First, the clinical neutrality of Wikipedia: text-dense, colorless, a filing cabinet that has forgotten it once held ideas. Second, the impersonal utility of SaaS dashboards: identical card grids, icon plus heading plus text repeated to exhaustion, utility without presence. Third, the cheap drama of "dark philosophy" aesthetics: brooding darkness, neon accents, glassmorphism as personality. This project earns atmosphere through restraint, not through effect.

The experience rewards wandering. A user arrives to look up one thinker and discovers three others through the network. The design should make that serendipity feel inevitable, not accidental.

**Key Characteristics:**
- Parchment-warm surfaces; no pure whites, no pure blacks
- Gold used sparingly as a signal of significance, never decoration
- Serif typography carries content; sans-serif handles interface chrome only
- Almost flat; depth through tonal layering, not dramatic shadow stacks
- Era-specific color as contextual data embedded in the system, not cosmetic variety
- Motion that breathes; never performs

## 2. Colors: The Manuscript Palette

A room lit by warm incandescent light: parchment surfaces, one gold accent used with restraint, and ink that is deep without being harsh.

### Primary
- **Old Gold** (`#845400`): The single interactive accent. Links, active states, interactive affordances, era markers, and selection states. Appears on no more than 10% of any screen.
- **Warm Bronze** (`#C47029`): The hover and active state for Old Gold. Also present in era-specific color coding for certain periods. Never used as a standalone default accent alongside Old Gold.

### Neutral
- **Aged Vellum** (`#FCFBF9`): The base canvas. Every page and surface defaults here.
- **Canvas Warm** (`#F8F5EE`): Secondary surfaces, sidebars, inset panels. One tonal step above Aged Vellum; the primary depth tool.
- **Midnight Ink** (`#11151A`): Body text, headings, the primary reading color. The only near-black; never `#000000`.
- **Ash Gray** (`#5F6A78`): Muted text, metadata, dates, labels, inactive navigation icons.
- **Parchment Tint** (`#F5EEE3`): Hover states, selected backgrounds, subtle callout fills. The solid-color equivalent of the `rgba(132,84,0,0.07)` overlay used throughout the codebase.
- **Gilt Edge** (`#D4B08C`): De-emphasized accent; decorative rule lines, era color at low prominence, ornamental detail.

**The One Voice Rule.** Old Gold appears on 10% or less of any given screen. It marks what is interactive and what is significant. Its scarcity is its authority. Warm Bronze signals state change only; it is never a second accent used in parallel with Old Gold at rest.

## 3. Typography

**Display Font:** Playfair Display (with Georgia, serif)
**Content Font:** EB Garamond (with Georgia, serif)
**Interface Font:** Inter (with system-ui, sans-serif)
**Institutional Font:** Cinzel (with Georgia, serif) — era labels, period markers, and small-caps contexts only

**Character:** The serif stack carries the voice of the content; Inter carries the voice of the interface. They never compete. Where a label sits on a visualization, it is Inter. Where a philosopher's biography begins, it is EB Garamond. Cinzel appears only as an institutional signal: small, uppercase, wide-tracked, and never for body copy or headings.

### Hierarchy
- **Display** (Playfair Display, 700, `clamp(2.2rem, 4vw, 3.2rem)`, line-height 1.1, -0.01em tracking): Philosopher names at hero scale. Page titles on profile pages. Appears once per view, never in list contexts.
- **Headline** (EB Garamond, 500, `clamp(1.4rem, 2.5vw, 1.8rem)`, line-height 1.25): Section headings within content areas. The scholarly voice of the product.
- **Title** (Cinzel, 400, `0.75rem`, line-height 1.4, 0.1em tracking, uppercase): Era labels, period markers, institutional names. Always small, always uppercase. A contextual signal, not a dominant element.
- **Body** (Inter, 400, `0.9375rem`, line-height 1.7): All interface text, descriptions, navigation labels. Max line-length 65ch on prose passages.
- **Label** (Inter, 500, `0.6875rem`, line-height 1.4, 0.06em tracking): Metadata, dates, relationship tags, counts. Uppercase in certain contexts; always small and precise.

**The Register Rule.** If the user is reading content, the font is serif. If the user is navigating or scanning interface chrome, the font is Inter. A navigation item in Garamond is wrong. A philosopher biography in Inter is wrong. No exceptions.

## 4. Elevation

The system is almost flat. Depth is communicated through tonal layering: Canvas Warm sits one step above Aged Vellum, and that contrast is sufficient to distinguish panel from canvas without any shadow at all. Shadows are rare, diffuse, and state-driven — they appear only when an element rises in response to interaction.

### Shadow Vocabulary
- **Ambient Lift** (`0 2px 12px rgba(17,21,26,0.06)`): Cards at rest. So subtle it reads as material presence rather than drop shadow.
- **Panel Rise** (`0 4px 24px rgba(17,21,26,0.10), 0 1px 4px rgba(17,21,26,0.06)`): Open side panels, hovered cards, focused containers. Present enough to signal elevation; restrained enough to stay editorial.

**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadows appear only in response to state: hover, open, focus. A shadow that is always visible is decoration. Decoration is prohibited.

## 5. Components

### Buttons
Warm and tactile in feel; precise and restrained in detail.

- **Shape:** Gently squared (4px radius). Never pill-shaped. Never fully sharp.
- **Primary:** Old Gold background (`#845400`), Aged Vellum text, 10px 24px padding. Transitions to Warm Bronze on hover over 180ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Ghost:** Transparent background, Midnight Ink text, 1px solid `rgba(17,21,26,0.15)` border. On hover: Parchment Tint background, Old Gold text, border shifts to `rgba(132,84,0,0.2)`.
- **Focus:** 2px Old Gold outline, 2px offset. Always visible; never suppressed.

### Chips / Era Tags
- **Style:** Parchment Tint background (`#F5EEE3`), Old Gold text, pill shape (9999px radius). Cinzel, 0.65rem, uppercase, 0.1em letter-spacing.
- Used exclusively for era labels and philosophical branch tags. Not for navigation. Not for user-triggered actions.

### Cards / Containers
- **Corner Style:** Gently curved (8px radius)
- **Background:** Canvas Warm for default cards; Aged Vellum for inset content within a Canvas Warm parent.
- **Shadow:** Ambient Lift at rest; Panel Rise on hover.
- **Border:** `rgba(17,21,26,0.08)` full border on all four sides. Never a side-stripe border.
- **Internal Padding:** 20–24px consistent; outer layout gap is separate.

### Inputs / Fields
- **Style:** 1px solid `rgba(17,21,26,0.15)` border, Aged Vellum background, 6px radius.
- **Focus:** Border shifts to Old Gold (`#845400`), 0 0 0 3px `rgba(132,84,0,0.12)` focus ring. No glow theatrics.
- **Placeholder:** Ash Gray. Body Inter size.

### Navigation (Sidebar)
- Fixed 80px wide, icon-only at rest. Icons in Ash Gray, transitioning to Old Gold on active.
- Active state: Parchment Tint background chip (40px wide, 40px tall, 4px radius) behind the icon.
- No text labels at rest; tooltips on hover.
- No divider lines; the sidebar holds its visual lane through background color alone.

### Philosopher Panel (Signature Component)
The primary detail surface. Slides in from the right as contextual context — never as a modal interrupt.

- Background: Aged Vellum. Dividing lines use `rgba(17,21,26,0.08)` hairlines.
- Philosopher name in Display type (Playfair Display, 700). Biography in EB Garamond body (1rem, line-height 1.7). Metadata in Inter label.
- Era color appears as a radial gradient tint at the top edge only, fading to transparent. This is the one permitted location for a gradient: one color to transparent, never two colors.

## 6. Do's and Don'ts

### Do
- **Do** use Old Gold exclusively for interactive affordances and era markers. One accent, one role; its scarcity is the point.
- **Do** use serif fonts (EB Garamond, Playfair Display) for all content the user reads; use Inter only for navigation and interface metadata.
- **Do** layer depth through tonal backgrounds (Canvas Warm over Aged Vellum) before reaching for a shadow.
- **Do** honor `prefers-reduced-motion` by disabling all Framer Motion transitions when the media query matches.
- **Do** use Cinzel only for era labels and period markers: small, uppercase, wide-tracked.
- **Do** use full borders (`border: 1px solid`) on cards and containers. All four sides, never just one.

### Don't
- **Don't** make it feel like Wikipedia: clinical neutrality, text-dense, no visual warmth, no sense of place.
- **Don't** make it feel like a generic SaaS dashboard: identical card grids with icon plus heading plus text, repeated without variation.
- **Don't** use a gamified learning aesthetic: progress bars, achievement badges, Duolingo-style playfulness that trivializes the subject matter.
- **Don't** use "dark philosophy" aesthetics: brooding dark mode, neon accents, dramatic purple gradients, glassmorphism as personality.
- **Don't** use a side-stripe border (`border-left` or `border-right` greater than 1px in an accent color) on any card, callout, or list item. Use full borders, background tints, or nothing.
- **Don't** use gradient text (`background-clip: text` with a gradient). Single solid color only; emphasis through weight or scale.
- **Don't** render philosopher cards as identical grid items. Scale and density should reflect variation in each thinker's significance and era.
- **Don't** reach for a modal as the first response to any interaction. The Philosopher Panel slides in contextually; it does not interrupt the current view.
