name: Psicontrol
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#424754'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 32px
  gutter: 24px
  section-gap: 48px
  stack-sm: 12px
  stack-md: 20px
---

## Brand & Style
The design system is engineered for mental health professionals, where the interface must act as a silent, supportive partner. The brand personality is **Clinical Minimalism**: it combines the precision of medical software with the warmth of a therapeutic environment.

The target audience—psychologists and clinical administrators—requires a workspace that reduces cognitive load and emotional fatigue. The UI evokes a sense of **serenity, order, and absolute reliability**.

We employ a **Refined Modern** style, characterized by:
- **Generous Whitespace:** Prioritizing focus and mental "breathing room."
- **Soft Geometry:** Avoiding harsh angles to maintain a welcoming atmosphere.
- **Subtle Depth:** Using tonal shifts and soft shadows instead of heavy borders to define hierarchy.
- **Information Density:** Low-to-medium density to ensure practitioners are never overwhelmed by data.

## Colors
This design system utilizes a palette rooted in "Psychological Safety." 

- **Primary (Soft Blue):** Used for primary actions and active states. It represents trust and clarity.
- **Secondary (Slate):** Used for iconography and secondary metadata to maintain a neutral, professional tone.
- **Tertiary (Mint/Emerald):** Reserved specifically for "Success" states and positive health outcomes.
- **Neutral (Deep Navy/Slate):** Used for typography to ensure maximum legibility and a sense of grounding.

The background strategy uses `#FFFFFF` for the main content canvas (the "paper") and `#F9FAFB` for structural elements like sidebars and headers to create soft, non-intrusive boundaries.

## Typography
The typography system balances the technical precision of **Geist** for headings with the universal readability of **Inter** for clinical notes and patient data.

- **Headings:** Use Geist with tight letter-spacing and medium weights to create a modern, architectural feel.
- **Body:** Use Inter with a generous line height (1.5 - 1.6) to facilitate long-form reading of patient histories and session notes.
- **Tracking:** Labels and small caps should utilize positive tracking (+0.02em to +0.05em) to maintain clarity at small scales.
- **Hierarchy:** High contrast between Heading and Body sizes is encouraged to allow practitioners to scan documents quickly.

## Layout & Spacing
This design system employs a **12-column Fluid Grid** for main dashboards and a **Fixed Centered Column** (max-width: 800px) for session note-taking and forms.

- **Breakpoints:** Mobile (<640px), Tablet (640px - 1024px), Desktop (>1024px).
- **Margins:** Desktop uses a generous 32px outer margin to distance content from the hardware frame.
- **Reflow:** On mobile, sidebars collapse into a bottom navigation bar or a hamburger menu, and 2-column forms reflow into a single vertical stack.
- **Rhythm:** All spacing is based on an 8px baseline grid to ensure mathematical harmony.

## Elevation & Depth
To maintain a "clean" healthcare aesthetic, depth is communicated through **Tonal Layering** and **Soft Ambient Shadows**.

- **Level 0 (Base):** Background color `#F9FAFB`. Used for the application shell and sidebar.
- **Level 1 (Card):** Background color `#FFFFFF` with a 1px border of `#E2E8F0`. No shadow. Used for secondary widgets.
- **Level 2 (Active):** Background color `#FFFFFF` with a soft shadow: `0px 4px 12px rgba(0, 0, 0, 0.03)`. Used for primary content cards and patient profiles.
- **Level 3 (Overlay):** Background color `#FFFFFF` with a deep shadow: `0px 20px 25px -5px rgba(0, 0, 0, 0.1)`. Used for modals and dropdown menus.

Avoid heavy black shadows; instead, use shadows tinted with the Deep Navy neutral to maintain a "cool" temperature.

## Shapes
The shape language is defined by **Softened Precision**. 

- **Standard Radius (8px):** Used for input fields, small buttons, and tags.
- **Large Radius (16px):** Used for main content cards, modals, and the persistent sidebar navigation.
- **Full Radius (Pill):** Reserved exclusively for status indicators (e.g., "Active Patient") and search bars to make them easily identifiable as interactive or informational anchors.

## Components
Consistent implementation of components is vital for clinical software where speed of entry is key.

- **Sidebar Navigation:** Use a 280px fixed-width sidebar. Active states should be indicated by a soft blue background tint and a 4px vertical "pill" indicator on the left edge.
- **Data Tables:** Row heights should be generous (min 56px). Use subtle dividers (#F1F5F9) instead of alternating row colors to keep the visual field clear.
- **Input Fields:** Use floating labels to maintain context. Borders should be light grey, turning primary blue only on focus.
- **Multi-step Forms:** Use a horizontal "stepper" at the top with Geist Medium labels. Completed steps are marked with a Tertiary (Mint) checkmark.
- **Calendar Elements:** Use a white background with rounded 8px event blocks. Overlapping appointments should use 80% opacity to indicate conflict without hiding data.
- **Rich Text Areas:** Specifically for "Clinical Notes." Use a serif-inspired font-size for the actual text input (18px) to distinguish "Patient Narrative" from "System Data."