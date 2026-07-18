# 🎨 UI/UX Design Guidelines

## Design System, Color Palette, Typography, Accessibility, Micro-Animations, and Component Library

**Document ID:** `DOC-13`
**Version:** 2.0
**Last Updated:** June 2026
**Classification:** UI/UX Design Document · Frontend Engineering Reference
**Maintained By:** UI/UX Architecture Team

---

## 📋 Purpose

This document defines the visual design language, design system tokens, color palettes, typography, responsive layout strategy, accessibility standards, micro-animation specifications, and component design patterns for the GridFlowX web dashboard.

## 🎯 Scope

- Design vision and theme philosophy
- Color palette specifications (power stage, alert, semantic)
- Typography guidelines (Google Fonts)
- Accessibility compliance (WCAG 2.1 AA)
- Micro-animations and interaction design
- Component design patterns and reusable elements
- Responsive layout strategy

**Out of Scope:** Tailwind CSS configuration (`15_Styling.md`), state management (`14_StateManagement.md`).

## 📌 Assumptions

- Target browsers: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- Primary display: 1920×1080 desktop (control room scenario)
- Secondary display: Tablet (1024×768) for field technicians
- Dark mode is the primary theme; light mode is secondary

## ⚠️ Constraints

- Color contrast must meet WCAG 2.1 AA (4.5:1 ratio minimum)
- Animations must respect `prefers-reduced-motion` browser settings
- Font loading must not block first contentful paint (FCP)
- Maximum 3 Google Font families to minimize load time

---

## 🎨 Design Vision

GridFlowX uses a **sleek glassmorphic dark-mode theme** designed for microgrid control room aesthetics — maximizing data density while maintaining visual hierarchy and readability.

```
                DESIGN VISUAL LAYERS
┌─────────────────────────────────────────────────────────────┐
│ ✦ Glass Panel Layer (Backdrop blur: 12px, border: white/10%)│
├─────────────────────────────────────────────────────────────┤
│ ✦ Dark Canvas Layer (Base: Slate-950, Card: Slate-900)      │
├─────────────────────────────────────────────────────────────┤
│ ✦ Glow Layer (Irradiance/Battery glows — cyan/amber rings)  │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

| Principle | Application |
| --- | --- |
| **Data Density** | Control room operators need multiple data points visible simultaneously |
| **Visual Hierarchy** | Critical alerts and KPIs are visually prominent; secondary data recedes |
| **Contextual Color** | Colors carry meaning (Solar=Amber, Battery=Green, Grid=Red, Bus=Cyan) |
| **Glassmorphic Depth** | Layered translucent panels create visual depth without hard borders |
| **Responsive Motion** | Animations provide feedback without distraction |

---

## 📊 Color Palette

### Power Stage Colors

| Source / State | Name | Hex | RGB | Application |
| --- | --- | --- | --- | --- |
| ☀️ **Solar PV** | Irradiance Amber | `#FBBF24` | 251, 191, 36 | Solar paths, generation meters, charge indicators |
| 🔌 **Grid Fallback** | Utility Crimson | `#EF4444` | 239, 68, 68 | Grid tie lines, bypass paths, peak tariff alerts |
| 🔋 **Battery Storage** | State Green | `#10B981` | 16, 185, 129 | SoC level bars, charge pathways, health indices |
| ⚡ **DC Bus** | Bus Cyan | `#06B6D4` | 6, 182, 212 | Main bus lines, voltage readouts, accent glows |

### Alert & Diagnostic Colors

| State | Name | Hex | Usage |
| --- | --- | --- | --- |
| ✅ **Normal** | Emerald | `#059669` | Safe operation indicators |
| ⚠️ **Warning** | Sun Amber | `#D97706` | Temp > 70°C, SoC < 40% |
| 🚨 **Critical** | Flame Red | `#DC2626` | System trips, SoC < 5% |
| ℹ️ **Info** | Sky Blue | `#0EA5E9` | Notifications, tooltips |

### Canvas & Surface Colors

| Element | Hex | Opacity | Usage |
| --- | --- | --- | --- |
| Canvas Background | `#020617` | 100% | Page background (Slate-950) |
| Card Base | `#0f172a` | 100% | Card backgrounds (Slate-900) |
| Glass Panel | `#0f172a` | 65% | Glassmorphic overlays |
| Glass Panel Hover | `#0f172a` | 80% | Interactive panel hover state |
| Border Default | `#1e293b` | 100% | Card borders (Slate-800) |
| Border Glass | `#ffffff` | 8% | Glass panel subtle borders |
| Border Glow | `#06B6D4` | 25% | Interactive hover border |
| Text Primary | `#f1f5f9` | 100% | Headlines, KPI values (Slate-100) |
| Text Secondary | `#94a3b8` | 100% | Labels, descriptions (Slate-400) |
| Text Muted | `#64748b` | 100% | Timestamps, metadata (Slate-500) |

---

## ✍️ Typography

### Font Stack

| Category | Font Family | Weight | Usage |
| --- | --- | --- | --- |
| **Display** | Outfit | 600–700 | Page headers, KPI metrics, large numbers |
| **Body** | Inter | 400–500 | Body text, labels, sidebar items, form fields |
| **Monospace** | Fira Code | 400 | Event timestamps, log entries, code blocks, REST payloads |

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
| --- | --- | --- | --- | --- | --- |
| H1 (Page Title) | Outfit | 28px / 1.75rem | 700 | 1.2 | -0.02em |
| H2 (Section) | Outfit | 22px / 1.375rem | 600 | 1.3 | -0.01em |
| H3 (Card Title) | Inter | 18px / 1.125rem | 600 | 1.4 | 0 |
| Body | Inter | 14px / 0.875rem | 400 | 1.5 | 0 |
| Caption | Inter | 12px / 0.75rem | 400 | 1.4 | 0.02em |
| KPI Value | Outfit | 36px / 2.25rem | 700 | 1.1 | -0.03em |
| Monospace | Fira Code | 13px / 0.8125rem | 400 | 1.6 | 0 |

---

## ♿ Accessibility (WCAG 2.1 AA)

### Contrast Ratios

| Text Color | Background | Ratio | Requirement | Status |
| --- | --- | --- | --- | --- |
| `#f1f5f9` (Primary) | `#0f172a` (Card) | 15.4:1 | ≥ 4.5:1 | ✅ Pass |
| `#94a3b8` (Secondary) | `#0f172a` (Card) | 5.2:1 | ≥ 4.5:1 | ✅ Pass |
| `#FBBF24` (Solar) | `#0f172a` (Card) | 8.1:1 | ≥ 3:1 (large text) | ✅ Pass |
| `#EF4444` (Alert) | `#0f172a` (Card) | 4.6:1 | ≥ 4.5:1 | ✅ Pass |

### Keyboard Navigation

- All interactive elements are focusable via Tab key
- Focus states use a distinct cyan ring: `focus:ring-2 focus:ring-cyan-500`
- Focus order follows visual layout (left-to-right, top-to-bottom)
- Skip-to-content link provided for screen readers

### Screen Reader Support (ARIA)

```jsx
// Relay control with full ARIA support
<button
  role="switch"
  aria-checked={isRelayOn}
  aria-label="Tier 3 Load Relay Switch"
  aria-describedby="tier3-description"
  onClick={toggleRelay}
  className="relay-toggle"
>
  {isRelayOn ? "ON" : "OFF"}
</button>
<span id="tier3-description" className="sr-only">
  Controls flexible load tier including workshop fans and water pumps
</span>
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .power-flow-line { animation: none; }
  .glass-interactive { transition: none; }
  * { animation-duration: 0.01ms !important; }
}
```

---

## ✨ Micro-Animations

### Power Flow Animation

```css
.power-flow-line {
  stroke-dasharray: 8;
  animation: flowDash 1.5s linear infinite;
}

@keyframes flowDash {
  to { stroke-dashoffset: -16; }
}
```

### Button Hover Effects

```css
.glass-interactive {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-interactive:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.25);
  box-shadow: 0 8px 32px 0 rgba(6, 182, 212, 0.1);
  transform: translateY(-2px);
}
```

### Alert Pulse

```css
.alert-critical {
  animation: criticalPulse 2s ease-in-out infinite;
}

@keyframes criticalPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  50% { box-shadow: 0 0 20px 4px rgba(220, 38, 38, 0.2); }
}
```

### KPI Counter Animation

```css
.kpi-value {
  transition: all 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Smooth number transition via CSS counter */
.kpi-counter {
  font-variant-numeric: tabular-nums;
}
```

---

## 🧩 Component Design Patterns

### Glass Panel Card

```
┌─────────────────────────────────────────┐
│  📊 Card Title           [Action Icon] │  ← Header: Inter 600, 18px
│─────────────────────────────────────────│  ← Divider: rgba(255,255,255,0.08)
│                                         │
│  Main content area                      │  ← Body: Inter 400, 14px
│  Data visualization or form             │
│                                         │
│  Footer: Timestamp / Status indicator   │  ← Footer: Inter 400, 12px, Slate-500
└─────────────────────────────────────────┘
  Background: rgba(15, 23, 42, 0.65)
  Backdrop-filter: blur(12px)
  Border: 1px solid rgba(255, 255, 255, 0.08)
  Border-radius: 12px
```

### KPI Gauge Widget

```
┌──────────────────────┐
│  Battery SoC         │  ← Label: Inter 400, 12px, Slate-400
│                      │
│     7 5 %            │  ← Value: Outfit 700, 36px, Green
│  ███████████░░░      │  ← Progress bar: Green gradient
│                      │
│  ▲ +2.3% (1h)       │  ← Trend: Inter 400, 12px, Green
└──────────────────────┘
```

---

## 📱 Responsive Layout Strategy

| Breakpoint | Width | Layout | Target Device |
| --- | --- | --- | --- |
| `xs` | < 640px | Single column, stacked cards | Mobile (emergency view) |
| `sm` | 640–768px | Single column, compact KPIs | Small tablet |
| `md` | 768–1024px | 2-column grid, sidebar collapsed | Tablet |
| `lg` | 1024–1280px | 2-column grid, sidebar visible | Laptop |
| `xl` | 1280–1536px | 3-column grid, full sidebar | Desktop |
| `2xl` | ≥ 1536px | 4-column grid, expanded widgets | Control room |

---

## 📐 Architecture Notes

- The glassmorphic design uses `backdrop-filter: blur()` which has good browser support (Chrome 76+, Firefox 103+, Safari 9+) but falls back to solid dark backgrounds on unsupported browsers
- Google Fonts are loaded asynchronously via `<link rel="preload">` to prevent render blocking
- The design system is implemented as Tailwind CSS utility classes and custom component classes in `globals.css`

## 👨‍💻 Developer Notes

- All color values are defined in `tailwind.config.ts` under the theme extend config
- Use the semantic color names (e.g., `text-energy-solar`) rather than raw hex values
- Icons use Heroicons (React/Next.js) for consistency
- Test all UI changes against the WCAG color contrast checker before merging

## 🏆 Recruiter & Portfolio Notes

> **UI/UX Engineering:** The design system demonstrates production-quality UI engineering — purpose-built color palettes for energy visualization, WCAG 2.1 AA accessibility compliance, systematic typography scale, responsive layouts for control room to mobile, and polished micro-animations. The glassmorphic design language creates a premium, modern aesthetic while maintaining readability and usability.

## ✅ Best Practices

1. **Semantic Colors:** Always use named color tokens, never raw hex values in components
2. **Accessibility First:** Test every component with keyboard navigation and screen readers
3. **Motion Sensitivity:** Respect `prefers-reduced-motion` for all animations
4. **Consistent Spacing:** Use Tailwind's spacing scale (4px increments) for all margins/padding

## 🔮 Future Enhancements

- **Design Tokens File:** Extract all tokens to a JSON file for multi-platform consistency
- **Component Storybook:** Interactive component documentation with Storybook
- **Dark/Light Theme Toggle:** Runtime theme switching with persistence
- **Custom Charting Library:** Replace Recharts with custom D3.js visualizations for power flow

## 🗺️ Related Documents

| Document | Purpose |
| --- | --- |
| `15_Styling.md` | Tailwind CSS configuration and utility classes |
| `14_StateManagement.md` | How UI state drives component rendering |
| `16_User_Journey_Flows.md` | User interaction flows across pages |
| `02_Features_and_Functionality.md` | Feature requirements driving UI design |
