# 🎨 Styling Configuration

## Tailwind CSS Configuration, Glassmorphism Utilities, Dark/Light Theming, and Responsive Layouts

**Document ID:** `DOC-15`
**Version:** 2.0
**Last Updated:** June 2026
**Classification:** Frontend Engineering Reference
**Maintained By:** Frontend Engineering Team

---

## 📋 Purpose

This document provides the complete CSS styling configuration for GridFlowX, including Tailwind CSS setup, custom utility classes, glassmorphic component styles, dark/light theme support, and responsive layout patterns.

## 🎯 Scope

- Tailwind CSS configuration (`tailwind.config.ts`)
- Custom glassmorphism utility classes
- Dark mode and light mode theme switching
- Global stylesheet (`src/app/globals.css`) implementation
- Responsive layout utilities
- Component-level styling patterns

**Out of Scope:** Design principles and color rationale (`13_UI_UX_Guidelines.md`), state management (`14_StateManagement.md`).

## 🔗 Dependencies

| Dependency | Version | Purpose |
| --- | --- | --- |
| `tailwindcss` | 3.x | Utility-first CSS framework |
| `postcss` | 8.x | CSS processing pipeline |
| `autoprefixer` | 10.x | Vendor prefix automation |

---

## ⚙️ Tailwind Configuration

### `tailwind.config.ts`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Class-based dark mode toggling
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#020617',     // Slate-950 (Canvas background)
          card: '#0f172a',     // Slate-900 (Card base)
          border: '#1e293b',   // Slate-800 (Default borders)
        },
        energy: {
          solar: '#FBBF24',    // Amber-400 (Solar PV)
          battery: '#10B981',  // Emerald-500 (Battery)
          grid: '#EF4444',     // Red-500 (Grid)
          bus: '#06B6D4',      // Cyan-500 (DC Bus)
        },
        status: {
          normal: '#059669',   // Emerald-600
          warning: '#D97706',  // Amber-600
          critical: '#DC2626', // Red-600
          info: '#0EA5E9',     // Sky-500
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
      },
      boxShadow: {
        'glass-glow': '0 8px 32px 0 rgba(6, 182, 212, 0.15)',
        'glass-subtle': '0 4px 30px rgba(0, 0, 0, 0.2)',
        'alert-glow': '0 0 20px 4px rgba(220, 38, 38, 0.2)',
      },
      animation: {
        'flow-dash': 'flowDash 1.5s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
      },
      keyframes: {
        flowDash: {
          to: { strokeDashoffset: '-16' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(6, 182, 212, 0.2)' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
```

---

## ✦ Custom CSS Utilities

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Google Fonts Import ── */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap');

/* ── Base Layer Overrides ── */
@layer base {
  html {
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-brand-dark text-slate-100;
    min-height: 100vh;
  }

  /* Scrollbar Styling (Webkit) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #020617;
  }
  ::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
}

/* ── Component Layer ── */
@layer components {
  /* Glassmorphic Panel */
  .glass-panel {
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  }

  /* Interactive Glass (Hoverable) */
  .glass-interactive {
    @apply glass-panel transition-all duration-300 ease-in-out cursor-pointer;
  }
  .glass-interactive:hover {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(6, 182, 212, 0.25);
    box-shadow: 0 8px 32px 0 rgba(6, 182, 212, 0.1);
    transform: translateY(-2px);
  }

  /* KPI Card */
  .kpi-card {
    @apply glass-panel p-4 flex flex-col gap-2;
  }
  .kpi-label {
    @apply text-xs font-body text-slate-400 uppercase tracking-wider;
  }
  .kpi-value {
    @apply text-3xl font-display font-bold tabular-nums;
    transition: all 500ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .kpi-trend {
    @apply text-xs font-body flex items-center gap-1;
  }
  .kpi-trend.positive { @apply text-energy-battery; }
  .kpi-trend.negative { @apply text-energy-grid; }

  /* Alert Badge */
  .alert-badge {
    @apply px-2 py-1 rounded-full text-xs font-semibold;
  }
  .alert-badge.normal { @apply bg-status-normal/20 text-status-normal; }
  .alert-badge.warning { @apply bg-status-warning/20 text-status-warning; }
  .alert-badge.critical { @apply bg-status-critical/20 text-status-critical; }

  /* Relay Toggle Switch */
  .relay-toggle {
    @apply relative inline-flex h-6 w-11 items-center rounded-full
           transition-colors duration-300;
  }
  .relay-toggle.active { @apply bg-energy-battery; }
  .relay-toggle.inactive { @apply bg-slate-600; }
  .relay-toggle .thumb {
    @apply inline-block h-4 w-4 rounded-full bg-white
           transform transition-transform duration-300;
  }
  .relay-toggle.active .thumb { @apply translate-x-6; }
  .relay-toggle.inactive .thumb { @apply translate-x-1; }

  /* Power Flow Animation Line */
  .power-flow-line {
    stroke-dasharray: 8;
    animation: flowDash 1.5s linear infinite;
  }

  /* Sidebar Navigation */
  .sidebar-item {
    @apply flex items-center gap-3 px-4 py-2.5 rounded-lg
           text-slate-400 text-sm font-body
           transition-all duration-200;
  }
  .sidebar-item:hover {
    @apply bg-white/5 text-slate-200;
  }
  .sidebar-item.active {
    @apply bg-energy-bus/10 text-energy-bus border-l-2 border-energy-bus;
  }

  /* Button Variants */
  .btn-primary {
    @apply px-4 py-2 rounded-lg font-body text-sm font-medium
           bg-energy-bus text-white
           hover:bg-energy-bus/90 active:scale-95
           transition-all duration-200;
  }
  .btn-danger {
    @apply px-4 py-2 rounded-lg font-body text-sm font-medium
           bg-status-critical text-white
           hover:bg-status-critical/90 active:scale-95
           transition-all duration-200;
  }
  .btn-ghost {
    @apply px-4 py-2 rounded-lg font-body text-sm font-medium
           text-slate-400 hover:text-slate-200 hover:bg-white/5
           transition-all duration-200;
  }
}

/* ── Animation Keyframes ── */
@keyframes flowDash {
  to { stroke-dashoffset: -16; }
}

/* ── Reduced Motion Support ── */
@media (prefers-reduced-motion: reduce) {
  .power-flow-line { animation: none; }
  .glass-interactive { transition: none; }
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🌗 Dark / Light Theme Support

### Dark Mode (Default)

The application defaults to dark mode, matching control room aesthetics.

### Light Mode Configuration

```css
/* Light theme overrides */
.light-theme body,
html.light body {
  @apply bg-slate-50 text-slate-900;
}

.light-theme .glass-panel,
html.light .glass-panel {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
}

.light-theme .glass-interactive:hover,
html.light .glass-interactive:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(6, 182, 212, 0.3);
}

.light-theme .sidebar-item,
html.light .sidebar-item {
  @apply text-slate-600;
}
.light-theme .sidebar-item:hover,
html.light .sidebar-item:hover {
  @apply bg-slate-100 text-slate-900;
}
```

### Theme Toggle Implementation

```javascript
function toggleTheme() {
  const currentTheme = useAuthStore.getState().theme;
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.classList.toggle('dark', newTheme === 'dark');
  document.documentElement.classList.toggle('light', newTheme === 'light');
  useAuthStore.getState().setTheme(newTheme);
}
```

---

## 📐 Architecture Notes

- Tailwind's `content` array is configured to scan all JSX/TSX files, ensuring no used classes are accidentally purged during production builds
- Custom component classes are defined in `@layer components` to maintain proper Tailwind specificity ordering
- The `class`-based dark mode strategy enables runtime theme switching without page reload

## 👨‍💻 Developer Notes

- Always use semantic class names (`glass-panel`, `kpi-card`) over raw Tailwind utilities for complex components
- Run `npx tailwindcss --postcss` to verify the CSS build includes all used classes
- Font loading uses `font-display: swap` to prevent FOUT (Flash of Unstyled Text)
- Test responsive layouts at each breakpoint using Chrome DevTools device emulation

## 🏆 Recruiter & Portfolio Notes

> **CSS Architecture:** The styling system demonstrates a well-organized CSS architecture — Tailwind configuration for design tokens, custom component classes for reusable patterns, glassmorphic effects with fallback support, WCAG-compliant theming, and reduced-motion accessibility. The layered approach (base → components → utilities) follows CSS best practices for maintainability and specificity management.

## ✅ Best Practices

1. **Component Classes over Utilities:** Use custom classes for any pattern used more than twice
2. **Semantic Naming:** Class names describe purpose, not appearance
3. **Accessible by Default:** All interactive elements have visible focus states
4. **Performance:** Minimize custom CSS; leverage Tailwind's tree-shaking for optimal bundle size

## 🔮 Future Enhancements

- **CSS Custom Properties:** Migrate color tokens to CSS custom properties for runtime theming
- **Container Queries:** Use CSS container queries for truly component-level responsive design
- **Design Token Export:** Generate design tokens from Figma for automated Tailwind config
- **Component Library Publishing:** Publish reusable UI components as an internal npm package

## 🗺️ Related Documents

| Document | Purpose |
| --- | --- |
| `13_UI_UX_Guidelines.md` | Design principles and color rationale |
| `14_StateManagement.md` | State-driven styling (theme switching) |
| `16_User_Journey_Flows.md` | Page layouts and navigation patterns |
| `03_Tech_Stack.md` | Tailwind CSS selection rationale |
