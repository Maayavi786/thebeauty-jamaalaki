# DesignPrinciple.md

## Jamaalaki Design Principles

This document defines the design principles, color and theme usage (light & dark mode), sizing, style, and reusable patterns for all UI/UX development in the Jamaalaki Salon Booking Platform.

---

## 1. Color Theme & Usage

### 1.1. Core Palette
- **Primary:** Used for main actions, highlights, and branding (e.g., `bg-primary`, `text-primary`).
- **Accent/Secondary:** For gradients, backgrounds, and subtle highlights (`from-secondary/30 to-accent/30`).
- **Muted:** For cards and section backgrounds (`bg-muted/30`, `dark:bg-neutral-800/20`).
- **Background:**
  - **Light mode:** `bg-background` (white or very light neutral)
  - **Dark mode:** `dark:bg-neutral-900` (deep neutral)
- **Text:**
  - Main: `text-foreground`
  - Muted: `text-muted-foreground`
- **Decorative:** Soft colored blobs, dots, and icons for visual interest.

### 1.2. Light vs Dark Mode
- **Light Mode:**
  - Background: White or very light neutral
  - Cards: Slightly muted backgrounds
  - Primary: Vibrant (e.g., violet, pink, gold)
  - Text: Dark gray/black
- **Dark Mode:**
  - Background: Deep neutral (`#18181b` or similar)
  - Cards: Darker muted backgrounds
  - Primary: Same as light, but with higher contrast
  - Text: White or light gray
- **Transitions:** Smooth transitions between light/dark using Tailwind's `dark:` variants and CSS transitions.

## Home Page Color Usage: Light & Dark Mode

On the Home page, the color scheme dynamically adapts to light and dark mode using Tailwind CSS utility classes and the Jamaalaki design system.

### Light Mode Colors
- **Background:**
  - Main sections: `bg-gradient-to-r from-secondary/30 to-accent/30` (soft gradient with secondary and accent colors at 30% opacity)
  - Cards/containers: `bg-muted/30` (very light neutral)
- **Text:**
  - Headings/body: `text-foreground` (dark gray/black)
  - Accents: `text-primary`
- **Buttons:**
  - Primary: `bg-primary text-white`
  - Outline: `border-primary text-primary`
- **Decorative elements:**
  - Color blobs: `bg-primary`, `bg-accent` with low opacity

### Dark Mode Colors
- **Background:**
  - Main sections: `dark:bg-neutral-900` (deep neutral/charcoal)
  - Gradient overlays: `bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900`
  - Cards: `dark:bg-neutral-800/20` (very dark muted background)
- **Text:**
  - Headings/body: `text-foreground` (white/light gray)
  - Accents: `text-primary` (high contrast)
- **Buttons:**
  - Primary: `bg-primary text-white`
  - Outline: `border-primary text-primary`
  - App store: `bg-background text-foreground` (background switches to dark)
- **Decorative elements:**
  - Color blobs: `bg-primary`, `bg-accent` with opacity, blend with dark background

### How It Works
- Classes like `bg-gradient-to-r from-secondary/30 to-accent/30 dark:from-neutral-900 dark:to-neutral-900` ensure that in light mode you get a colored gradient, and in dark mode it shifts to deep neutrals for a modern, low-glare look.
- All text, cards, and buttons automatically adapt to the mode using Tailwind’s `dark:` variants.

#### Summary Table

| Element         | Light Mode                            | Dark Mode                               |
|-----------------|--------------------------------------|-----------------------------------------|
| Section BG      | Soft gradient (secondary/accent/30%) | Deep neutral (`neutral-900`)            |
| Card BG         | `bg-muted/30`                        | `dark:bg-neutral-800/20`                |
| Text            | `text-foreground` (dark)             | `text-foreground` (light)               |
| Primary Button  | `bg-primary text-white`              | `bg-primary text-white`                 |
| Outline Button  | `border-primary text-primary`        | `border-primary text-primary`           |
| Decorative      | `bg-primary`/`bg-accent` blobs       | Same, but blended with dark background  |

If you want to see the exact color hex values, refer to the Tailwind config or request them specifically.

---

## 2. Button Styles

### 2.1. Primary Button
- **Class:** `bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all`
- **Size:** Large (`py-3 px-8`), always rounded-full
- **Font:** Medium, `font-playfair` (LTR) or `font-tajawal` (RTL)
- **Shadow:** Strong, increases on hover

### 2.2. Outline Button
- **Class:** `border-primary text-primary hover:bg-primary/10 font-medium py-3 px-8 rounded-full transition-colors`
- **Size:** Large, rounded-full
- **Font:** Same as above
- **Border:** 2px solid primary

### 2.3. App Store/Google Play Buttons
- **Class:** `bg-background hover:bg-background/90 text-foreground font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-colors`
- **Icon:** Left-aligned, 2xl size

### 2.4. General Principles
- Use the shared Button component for all buttons.
- Always apply consistent padding, rounded corners, and transitions.
- Use `font-tajawal` for Arabic/RTL, `font-playfair` for English/LTR.

---

## 3. Card & Section Patterns

### 3.1. Cards
- **Background:** `bg-muted/30` (light), `dark:bg-neutral-800/20` (dark)
- **Rounded:** `rounded-xl` or `rounded-2xl`
- **Shadow:** Subtle, increases on hover
- **Padding:** `p-6` or `p-8`

### 3.2. Grids
- Responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3/4`
- Gap: `gap-6` or `gap-8`

### 3.3. Sections
- **Padding:** `py-12` or `py-16`
- **Background:** Gradient (`bg-gradient-to-r from-secondary/30 to-accent/30`)
- **Container:** `container mx-auto px-4`

---

## 4. Typography

### 4.1. Headings
- **Main:** `font-bold text-4xl lg:text-5xl mb-6` (Hero), `font-playfair`/`font-tajawal`
- **Section:** `font-bold text-3xl`, `text-primary uppercase tracking-wider text-sm font-medium`
- **RTL/LTR:** Font and alignment switch by language

### 4.2. Body Text
- `text-muted-foreground`, max width for readability
- Responsive font sizes

### 4.3. Accessibility
- Always use semantic headings and ARIA labels where needed

---

## 5. Iconography & Decorative Elements
- Use consistent icon sets (Lucide, React Icons)
- Icons sized for context: `text-xl` (cards), `2xl` (buttons)
- Decorative blobs: `bg-primary`/`bg-accent` with opacity for background interest

---

## 6. RTL/LTR & Internationalization
- Always use `isLtr`/`isRtl` from language context for font, alignment, and layout
- All text via `react-i18next` with proper namespaces
- Never hardcode direction or text

---

## 7. Animations & Effects
- **Button/Card Hover:** Shadow and color transitions
- **Section Transitions:** Smooth fade/slide as needed
- **Patterned Backgrounds:** SVG backgrounds for visual richness

---

## 8. Accessibility & Responsiveness
- All layouts must be mobile-first and responsive
- Large touch targets, clear focus states, semantic HTML
- Sufficient color contrast for text and buttons

---

## 9. What to Always Reuse
- **Color palette and gradients** for all new sections
- **Button and card styles**—never use browser defaults or inconsistent shapes/colors
- **Typography and spacing**—follow the heading/body patterns above
- **RTL/LTR and translation patterns**—never hardcode text or direction
- **Use the shared Button component and utility classes** for all interactive elements
- **Section and card layouts**—use the existing grid and container patterns
- **Consistent iconography and decorative elements**

---

## 10. Additional Design Principles
- **Consistency:** Every page/component must match the established look and feel
- **Reusability:** Build new UI as reusable components
- **Simplicity:** Avoid clutter; use whitespace and clear hierarchy
- **Feedback:** Always provide visual feedback on interaction
- **Accessibility:** Never sacrifice accessibility for aesthetics
- **Documentation:** Document new patterns in this file as they are added

---

**Follow these principles for all future development to ensure a beautiful, accessible, and consistent user experience across Jamaalaki.**

_Last updated: 2025-04-16_
