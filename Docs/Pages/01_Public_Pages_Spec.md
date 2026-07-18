# 🌐 GridFlowX RBAC Page Specification — Public & Authentication Pages

## Software Requirements Specification (SRS) & System Design Document (SDD)

**Document ID:** `SDD-PAGES-01`
**Version:** 1.0
**Last Updated:** June 2026
**Classification:** SRS/SDD · RBAC Page Architecture · UI/UX Specification
**Maintained By:** Platform Architecture Team

---

## 📋 Document Purpose

This document provides the complete Role-Based Access Control (RBAC) specification for all **Public** and **Authentication** pages in the GridFlowX platform. Each page is specified across 17 dimensions: overview, layout, sections/widgets, modals, animations, functional requirements, forms/validation, API requirements, backend services, database integration, real-time communication, state management, security/RBAC, error handling, performance, testing, and future enhancements.

---

# 1. Landing Page

## 1.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Landing Page |
| **Route Path** | `/` |
| **Accessible Roles** | Public (Unauthenticated), All Authenticated Roles |
| **Purpose** | Primary marketing entry point showcasing the GridFlowX platform capabilities, AI-driven energy management, and enterprise CTA |
| **Business Objective** | Convert visitors into demo requests and trial sign-ups; establish brand authority in AI microgrid management |
| **User Workflow** | Visitor arrives → Scans hero section → Explores features/pricing → Submits demo request or navigates to login |

## 1.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ STICKY NAVBAR                                                   │
│ [Logo] [Features] [Pricing] [About] [Contact]    [Login] [CTA] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HERO SECTION                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Headline: "AI-Powered Microgrid Intelligence"          │   │
│  │  Subheading: Real-time optimization description         │   │
│  │  [Schedule Demo]  [Watch Video]                         │   │
│  │  Animated Sankey power flow diagram (background)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  STATS BAR                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                       │
│  │ 99.9%│  │ <50ms│  │ 78%  │  │ 24/7 │                       │
│  │Uptime│  │AI    │  │Energy│  │Moni- │                       │
│  └──────┘  └──────┘  └──────┘  └──────┘                       │
│                                                                 │
│  FEATURES GRID (3-column cards)                                 │
│  AI Forecasting | Load Shedding | Anomaly Detection             │
│                                                                 │
│  CASE STUDIES CAROUSEL                                          │
│                                                                 │
│  CTA SECTION                                                    │
│  "Start Managing Your Microgrid" [Get Started Free]             │
│                                                                 │
│  FOOTER                                                         │
│  [Links] [Social] [Legal] [Status]                              │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

| Breakpoint | Layout Adjustment |
| :--- | :--- |
| **Desktop (≥1280px)** | Full 3-column feature grid, side-by-side hero content + animation |
| **Tablet (768–1279px)** | 2-column feature grid, hero animation below text |
| **Mobile (<768px)** | Single column stack, simplified hero animation, hamburger nav |

## 1.3 Sections & Widgets

### Section: Hero Banner

| Property | Value |
| :--- | :--- |
| **Section Name** | Hero Banner |
| **Purpose** | First impression — communicate value proposition |
| **Display Conditions** | Always visible |
| **Role Visibility** | All (Public) |

**Components:**
- Animated gradient headline (Outfit 700, 48px → mobile 32px)
- Subheading paragraph (Inter 400, 18px)
- Primary CTA button: "Schedule Demo" (accent-blue, glow-effect)
- Secondary CTA button: "Watch Video" (glass-panel, border-only)
- Background: Animated Sankey power flow diagram (SVG, reduced opacity)

**Data Display:**
- Static marketing content (no API dependency)
- Platform statistics counter (animated on viewport entry)

### Section: Platform Statistics Bar

| Property | Value |
| :--- | :--- |
| **Section Name** | Stats Counter Bar |
| **Purpose** | Social proof through quantified platform achievements |
| **Display Conditions** | Triggers count-up animation on scroll into viewport |
| **Role Visibility** | All (Public) |

**Components:**
- 4 KPI counter cards: Uptime %, AI Latency (ms), Energy Savings %, Monitoring Hours
- Each card: Icon + animated number + label

### Section: Features Grid

| Property | Value |
| :--- | :--- |
| **Section Name** | Feature Showcase |
| **Purpose** | Highlight core AI capabilities |
| **Display Conditions** | Always visible |
| **Role Visibility** | All (Public) |

**Components:**
- 3 glass-panel cards with hover animations
- Card structure: Icon → Title → Description → "Learn More" link
- Features: AI Solar/Load Forecasting, 3-Tier Load Shedding, Self-Healing Anomaly Detection

### Section: Case Studies Carousel

| Property | Value |
| :--- | :--- |
| **Section Name** | Client Success Stories |
| **Purpose** | Build trust through real deployment results |
| **Display Conditions** | Always visible |
| **Role Visibility** | All (Public) |

**Components:**
- Horizontal carousel with auto-advance (8s interval)
- Each slide: Client logo, quote, energy savings metric, deployment thumbnail
- Navigation dots + left/right arrows

### Section: CTA & Footer

- Full-width gradient CTA band with primary action button
- Footer: Navigation links, social media icons, legal links, system status badge

## 1.4 Modal Windows

### Demo Request Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Schedule Demo Modal |
| **Trigger Action** | Click "Schedule Demo" CTA button |
| **Purpose** | Capture lead information for sales pipeline |
| **Form Fields** | Full Name (text), Email (email), Company (text), Phone (tel, optional), Microgrid Size (select: 1-10, 11-50, 50+), Message (textarea, optional) |
| **Validation** | Name required (min 2 chars), Email required + valid format, Company required |
| **Success State** | Animated checkmark → "Thank you! We'll contact you within 24 hours." |
| **Error State** | Inline field errors with red borders, toast notification for server errors |
| **Confirmation** | None (single-step submit) |
| **Role Restrictions** | None (Public) |

### Video Player Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Platform Video Modal |
| **Trigger Action** | Click "Watch Video" button |
| **Purpose** | Embedded product demo video playback |
| **Form Fields** | None |
| **Success State** | Video plays in overlay with close button |
| **Error State** | "Video unavailable — please try again later" |
| **Role Restrictions** | None (Public) |

## 1.5 Micro Animations & UX Enhancements

### Entry Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Hero text fade-in + slide-up | Page load | 800ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Dramatic first impression |
| Stats counter roll-up | Scroll into viewport | 2000ms | `ease-out` | Engagement through motion |
| Feature cards stagger reveal | Scroll into viewport | 400ms per card, 100ms stagger | `cubic-bezier(0.4, 0, 0.2, 1)` | Progressive disclosure |
| Sankey background flow | Continuous | 3000ms loop | `linear` | Visual energy representation |

### Interactive Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| CTA button glow pulse | Idle (continuous) | 2000ms alternate | `ease-in-out` | Draw attention to conversion |
| Feature card lift + glow | Hover | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Interactive depth feedback |
| Nav link underline slide | Hover | 200ms | `ease-out` | Navigation affordance |
| Carousel slide transition | Auto/manual | 500ms | `ease-in-out` | Smooth content rotation |

### Feedback Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Form submit spinner | Demo form submit | Until response | `linear` infinite | Loading state indication |
| Success checkmark draw | Form success | 600ms | `ease-out` | Positive completion signal |
| Toast slide-in | Error response | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Error awareness |

## 1.6 Functional Requirements

| Function | Description |
| :--- | :--- |
| **Demo Request Submission** | POST form data to backend, store lead record, trigger email notification to sales |
| **Video Playback** | Embedded player with play/pause, fullscreen, volume controls |
| **Navigation** | Smooth-scroll anchor links to page sections |
| **Responsive Menu** | Hamburger menu toggle on mobile viewports |
| **SEO Optimization** | Server-rendered meta tags, Open Graph tags, structured data (JSON-LD) |

## 1.7 Forms & Validation

### Demo Request Form

| Field | Type | Required | Default | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `fullName` | `text` | ✅ | — | Min 2 chars, max 100, alphabetic + spaces |
| `email` | `email` | ✅ | — | RFC 5322 email format |
| `company` | `text` | ✅ | — | Min 2 chars, max 200 |
| `phone` | `tel` | ❌ | — | E.164 format (optional) |
| `microgridSize` | `select` | ✅ | `"1-10"` | One of: `1-10`, `11-50`, `50+` |
| `message` | `textarea` | ❌ | — | Max 1000 chars |

**Zod Schema:**
```typescript
const demoRequestSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().min(2).max(200),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  microgridSize: z.enum(['1-10', '11-50', '50+']),
  message: z.string().max(1000).optional(),
});
```

**Security:**
- Input sanitization: Strip HTML tags, escape special characters
- Rate limiting: 3 submissions per IP per 15 minutes
- Honeypot field for bot detection

## 1.8 API Requirements

| Method | Route | Request Payload | Response | Required Role |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/public/demo-request` | `{ fullName, email, company, phone?, microgridSize, message? }` | `{ status: "submitted", requestId: "dr_xxx" }` | Public |
| `GET` | `/api/v1/public/status` | — | `{ services: [...], overallStatus: "operational" }` | Public |

**Audit Logging:** Demo submissions are logged with IP address and timestamp for anti-spam analysis. No authentication audit required.

## 1.9 Backend Services

| Service | Responsibilities |
| :--- | :--- |
| **public.service.ts** | Handle demo request submissions, validate input, send email notifications, store leads |
| **email.service.ts** | Send confirmation emails to requesters, notify sales team of new leads |

## 1.10 Database Integration

| Store | Usage |
| :--- | :--- |
| **Firebase Firestore** | `demoRequests` collection: name, email, company, phone, size, message, ip, createdAt |

## 1.11 Real-Time Communication

No real-time requirements for public pages.

## 1.12 State Management

No Zustand stores required. Form state managed locally via `react-hook-form`.

## 1.13 Security & RBAC Rules

| Rule | Detail |
| :--- | :--- |
| **Access** | Fully public — no authentication required |
| **UI Restrictions** | None |
| **API Restrictions** | Rate limited to 3 requests/IP/15min |
| **XSS Protection** | All user input sanitized before storage |
| **CSRF Protection** | Not required (no authenticated state) |

## 1.14 Error Handling

| Error Type | User-Facing Message | Recovery |
| :--- | :--- | :--- |
| Validation error | Inline field error messages | Fix highlighted fields and resubmit |
| Rate limit exceeded | "Too many requests. Please try again in 15 minutes." | Wait and retry |
| Server error (500) | "Something went wrong. Please try again later." | Retry; fallback mailto link |
| Network failure | "Unable to connect. Please check your internet connection." | Auto-retry on reconnect |

## 1.15 Performance Requirements

| Metric | Target |
| :--- | :--- |
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3.5s |
| API response (demo submit) | < 500ms |
| Total page weight | < 500KB (gzip) |
| Image optimization | WebP format, lazy-loaded |

## 1.16 Testing Requirements

### Unit Tests
- Demo request form validation (Zod schema)
- Stats counter animation trigger logic
- Responsive nav toggle behavior

### Integration Tests
- Demo form submission → API → Database insertion
- Rate limiting enforcement

### E2E Tests
- Full visitor journey: Land → Scroll → Open demo modal → Submit → See confirmation
- Mobile responsive navigation test
- Video modal open/close flow

## 1.17 Future Enhancements

- **AI Savings Calculator:** Interactive calculator estimating energy savings based on user inputs
- **Live Dashboard Preview:** Embedded read-only dashboard widget showing real telemetry
- **Chatbot Integration:** AI-powered sales chatbot for instant question answering
- **A/B Testing Framework:** Variant testing for hero messaging and CTA positioning
- **Internationalization (i18n):** Multi-language support for global deployments

---

# 2. Login Page

## 2.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Login |
| **Route Path** | `/login` |
| **Accessible Roles** | Public (Unauthenticated only — redirects if already authenticated) |
| **Purpose** | Authenticate users via credentials, SSO, or social OAuth |
| **Business Objective** | Secure entry point with minimal friction; support enterprise SSO for rapid onboarding |
| **User Workflow** | Enter credentials → Submit → Firebase ID Token issued → Redirect to role-appropriate dashboard |

## 2.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                   FULL-SCREEN SPLIT LAYOUT                      │
│ ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│ │                      │  │                                  │ │
│ │  BRANDING PANEL      │  │  LOGIN FORM PANEL                │ │
│ │                      │  │                                  │ │
│ │  GridFlowX Logo         │  │  "Welcome Back"                  │ │
│ │  Animated energy     │  │                                  │ │
│ │  flow visualization  │  │  [Email/Username]                │ │
│ │                      │  │  [Password]  [👁 Toggle]         │ │
│ │  "Smart AI Microgrid │  │  [Remember Me] [Forgot Password] │ │
│ │   Management"        │  │                                  │ │
│ │                      │  │  [Sign In]                       │ │
│ │  Platform stats:     │  │                                  │ │
│ │  • Active microgrids │  │  ──── or continue with ────      │ │
│ │  • AI decisions/day  │  │                                  │ │
│ │  • Energy saved      │  │  [SSO] [Google] [Microsoft]      │ │
│ │                      │  │                                  │ │
│ │                      │  │  Don't have an account?          │ │
│ │                      │  │  [Contact Admin]                 │ │
│ └──────────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

| Breakpoint | Layout |
| :--- | :--- |
| **Desktop** | 50/50 split — branding left, form right |
| **Tablet** | Branding panel collapses to minimal header above form |
| **Mobile** | Full-width form with logo header, no branding panel |

## 2.3 Sections & Widgets

### Section: Branding Panel (Left)

| Property | Value |
| :--- | :--- |
| **Purpose** | Reinforce brand identity while form is being filled |
| **Display Conditions** | Desktop and tablet only |
| **Components** | GridFlowX logo, animated energy SVG, platform statistics, tagline |

### Section: Login Form Panel (Right)

| Property | Value |
| :--- | :--- |
| **Purpose** | Primary authentication interface |
| **Display Conditions** | Always visible |
| **Components** | Form heading, credential inputs, action buttons, OAuth buttons, links |

## 2.4 Modal Windows

### Account Locked Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Account Locked Notification |
| **Trigger** | 5 failed login attempts |
| **Purpose** | Inform user of temporary account lockout |
| **Form Fields** | None |
| **Content** | Lock icon, lockout duration, "Contact administrator" link |
| **Role Restrictions** | None (pre-auth) |

## 2.5 Micro Animations & UX Enhancements

### Entry Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Form panel slide-in from right | Page load | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth entrance |
| Branding panel fade-in | Page load | 800ms | `ease-out` | Background reveal |
| Energy flow SVG animation | Continuous | 3000ms loop | `linear` | Visual interest while filling form |
| Input focus glow | Focus event | 200ms | `ease-out` | Active field indication |

### Interactive Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Password visibility toggle | Eye icon click | 150ms | `ease` | Field type feedback |
| Button loading spinner | Form submit | Until response | `linear` infinite | Processing indication |
| OAuth button hover scale | Hover | 200ms | `ease-out` | Clickable affordance |
| Input shake animation | Validation error | 400ms | `cubic-bezier(0.36, 0.07, 0.19, 0.97)` | Error attention |

### Feedback Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Success redirect fade-out | Auth success | 300ms | `ease-in` | Smooth transition to dashboard |
| Error toast slide-in | Auth failure | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Error visibility |
| Field error highlight | Validation fail | 200ms | `ease` | Specific field error guidance |

## 2.6 Functional Requirements

| Function | Description |
| :--- | :--- |
| **Credential Authentication** | Validate username/email + password against backend |
| **SSO Authentication** | Redirect to SAML 2.0 / OIDC identity provider |
| **Social OAuth** | Google and Microsoft OAuth 2.0 PKCE flows |
| **Remember Me** | Persist refresh token with extended TTL (30 days) |
| **Forgot Password** | Navigate to `/forgot-password` route |
| **Auto-Redirect** | If already authenticated, redirect to role-appropriate dashboard |
| **Account Lockout Display** | Show lockout notice after 5 failed attempts |
| **Rate Limiting** | 5 login attempts per IP per 15 minutes |

## 2.7 Forms & Validation

### Login Form

| Field | Type | Required | Default | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `identifier` | `text` | ✅ | — | Non-empty, min 3 chars (accepts email or username) |
| `password` | `password` | ✅ | — | Non-empty, min 8 chars |
| `rememberMe` | `checkbox` | ❌ | `false` | Boolean |

**Zod Schema:**
```typescript
const loginSchema = z.object({
  identifier: z.string().min(3, 'Username or email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(false),
});
```

**Security:**
- Password field: No autocomplete on shared devices (configurable)
- Input sanitization: Strip leading/trailing whitespace
- Rate limiting: 5 attempts per IP per 15 minutes
- CSRF token validation
- Constant-time password comparison (backend)

## 2.8 API Requirements

| Method | Route | Request Payload | Response | Required Role |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | `{ identifier, password, rememberMe }` | `{ accessToken, refreshToken, user: { id, username, email, role } }` | Public |
| `POST` | `/api/v1/auth/sso/initiate` | `{ provider, tenantDomain }` | `{ redirectUrl }` | Public |
| `POST` | `/api/v1/auth/oauth/google` | `{ code, codeVerifier }` | `{ accessToken, refreshToken, user }` | Public |
| `POST` | `/api/v1/auth/oauth/microsoft` | `{ code, codeVerifier }` | `{ accessToken, refreshToken, user }` | Public |

**Audit Logging:**
- `LOGIN_SUCCESS` — Logged with userId, IP, userAgent
- `LOGIN_FAILED` — Logged with attempted username, IP, reason

## 2.9 Backend Services

| Service | Responsibilities |
| :--- | :--- |
| **Firebase SDK** | Client-side credential validation, Firebase Auth token retrieval |
| **FastAPI Auth core** | Server-side token validation, Custom Claims check |
| **audit.py** | Log authentication events (success/failure) in Firestore |

## 2.10 Database Integration

| Store | Usage |
| :--- | :--- |
| **Firebase Auth** | User credential matching, session validation |
| **Firebase Firestore** | `users` collection: Display profile, `audit_logs` collection: write events |

## 2.11 Real-Time Communication

No real-time requirements during login flow.

## 2.12 State Management

### authStore (Zustand)

| Property | Type | Description |
| :--- | :--- | :--- |
| `user` | `User \| null` | Authenticated user object |
| `idToken` | `string \| null` | Firebase ID Token |
| `isAuthenticated` | `boolean` | Authentication state flag |
| `isLoading` | `boolean` | Login request in-flight |
| `role` | `string` | User role (Operator, Supervisor, Admin) |

**Actions:**
- `login(email, password)` — Perform email/password authentication
- `logout()` — Sign out user, disconnect WebSocket

**Persistence:** Only the client UI `theme` preference is persisted to localStorage.

## 2.13 Security & RBAC Rules

| Rule | Detail |
| :--- | :--- |
| **Access** | Public route — unauthenticated users only |
| **Auto-Redirect** | Authenticated users visiting `/login` are redirected to their default dashboard |
| **Brute Force Protection** | Handled automatically by Firebase Authentication |
| **Session Limit** | Concurrency and active sessions governed by Firebase session configurations |
| **Token Security** | ID Token: 1-hour expiration, auto-refreshed by Firebase Client SDK |

## 2.14 Error Handling

| Error Type | User Message | Recovery |
| :--- | :--- | :--- |
| Invalid credentials | "Invalid username or password" | Retry with correct credentials |
| Account locked | "Account temporarily locked due to many failed attempts." | Wait or reset password |
| Network failure | "Unable to connect to server. Check your connection." | Auto-retry |
| Server error (500) | "An unexpected error occurred. Please try again." | Retry |

## 2.15 Performance Requirements

| Metric | Target |
| :--- | :--- |
| Page load (FCP) | < 1.0s |
| Login API response | < 500ms (includes bcrypt 12 rounds) |
| SSO redirect initiation | < 200ms |
| Token storage | < 10ms (localStorage) |

## 2.16 Testing Requirements

### Unit Tests
- Login form Zod validation (valid/invalid inputs)
- Auth store login/logout actions
- Auto-redirect logic for authenticated users

### Integration Tests
- Authenticate via Firebase client SDK → ID Token returned → stored in auth store
- Failed login → error callback received
- Account lockout handled by Firebase Auth

### E2E Tests
- Full login flow: Enter credentials → Submit → Dashboard appears
- Invalid credentials: Error toast shown, form retains username
- Account lockout: handled via Firebase Auth automatically
- SSO flow: Firebase Auth redirect/popup flow → Dashboard

## 2.17 Future Enhancements

- **Biometric Authentication:** WebAuthn/FIDO2 hardware key support
- **Passwordless Login:** Magic link email authentication
- **Adaptive MFA:** Risk-based MFA triggers (new device, new location)
- **Login Analytics:** Geographic login heatmap for security monitoring
- **Session Continuity:** Resume exact dashboard state from last session

---

# 3. Registration Page

## 3.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Registration |
| **Route Path** | `/register` |
| **Accessible Roles** | Public |
| **Purpose** | Multi-tenant organization onboarding and primary admin account creation |
| **Business Objective** | Self-service tenant provisioning to reduce onboarding friction |
| **User Workflow** | Fill organization details → Create admin account → Verify email → Access platform |

## 3.2 Layout Structure

Same split layout as Login page with registration form replacing login form.

### Form Sections (Multi-Step Wizard):
1. **Step 1: Organization Details** — Company name, industry, microgrid count
2. **Step 2: Admin Account** — Full name, email, password, confirm password
3. **Step 3: Plan Selection** — Subscription tier selection
4. **Step 4: Confirmation** — Review summary, agree to terms, submit

## 3.3 Sections & Widgets

### Multi-Step Progress Indicator

| Property | Value |
| :--- | :--- |
| **Purpose** | Show registration progress and allow navigation between completed steps |
| **Components** | 4-step horizontal stepper with active/completed/upcoming states |
| **Animation** | Step completion checkmark animation (300ms), progress bar fill |

## 3.4 Modal Windows

### Terms of Service Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click "Terms of Service" link |
| **Purpose** | Display full ToS without leaving registration flow |
| **Content** | Scrollable legal text with accept/decline buttons |

## 3.5 Forms & Validation

| Field | Step | Type | Required | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `companyName` | 1 | `text` | ✅ | 2–200 chars |
| `industry` | 1 | `select` | ✅ | Predefined list |
| `microgridCount` | 1 | `number` | ✅ | 1–1000 |
| `fullName` | 2 | `text` | ✅ | 2–100 chars |
| `email` | 2 | `email` | ✅ | RFC 5322 + unique check |
| `password` | 2 | `password` | ✅ | Min 12 chars, uppercase, lowercase, digit, special |
| `confirmPassword` | 2 | `password` | ✅ | Must match `password` |
| `plan` | 3 | `radio` | ✅ | One of: `starter`, `professional`, `enterprise` |
| `termsAccepted` | 4 | `checkbox` | ✅ | Must be `true` |

**Password Strength Meter:** Visual indicator (Weak → Fair → Strong → Very Strong) with color gradient (red → amber → green → emerald).

## 3.6 API Requirements

| Method | Route | Request | Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/tenant/register` | `{ company, industry, microgridCount, admin: { name, email, password }, plan }` | `{ tenantId, adminUserId, verificationEmailSent: true }` |
| `GET` | `/api/v1/auth/check-email` | `?email=user@example.com` | `{ available: boolean }` |

## 3.7 Performance Requirements

| Metric | Target |
| :--- | :--- |
| Page load | < 1.5s |
| Email uniqueness check | < 200ms (debounced 300ms) |
| Registration submit | < 2s |

---

# 4. Forgot Password Page

## 4.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Reset Password |
| **Route Path** | `/forgot-password` |
| **Accessible Roles** | Public |
| **Purpose** | Secure password recovery via email verification |
| **Business Objective** | Reduce admin support burden for password resets |
| **User Workflow** | Enter email → Receive reset link → Click link → Set new password |

## 4.2 Layout Structure

Centered single-card layout with GridFlowX branding.

## 4.3 Forms & Validation

### Step 1: Request Reset

| Field | Type | Required | Validation |
| :--- | :--- | :--- | :--- |
| `email` | `email` | ✅ | Valid email format |

### Step 2: New Password (accessed via `/reset-password?token=xxx`)

| Field | Type | Required | Validation |
| :--- | :--- | :--- | :--- |
| `newPassword` | `password` | ✅ | Min 12 chars, complexity requirements |
| `confirmPassword` | `password` | ✅ | Must match `newPassword` |

**Security:**
- Reset token: Single-use, 1-hour expiry
- No information disclosure: Always show "If an account exists, we've sent a reset link" regardless
- Password history: Cannot reuse last 5 passwords
- Rate limit: 3 reset requests per email per hour

## 4.4 API Requirements

| Method | Route | Request | Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/forgot-password` | `{ email }` | `{ message: "If an account exists..." }` |
| `POST` | `/api/v1/auth/reset-password` | `{ token, newPassword }` | `{ message: "Password updated successfully" }` |

---

# 5. Email Verification Page

## 5.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Verify Email |
| **Route Path** | `/verify-email` |
| **Accessible Roles** | Public (accessed via email link) |
| **Purpose** | Confirm user email ownership during registration |

## 5.2 Layout Structure

Centered status card showing verification result.

## 5.3 States

| State | Display | Action |
| :--- | :--- | :--- |
| **Verifying** | Spinner + "Verifying your email..." | Auto-submit token |
| **Success** | Checkmark + "Email verified!" | Redirect to `/login` after 3s |
| **Expired** | Warning icon + "Link expired" | "Resend verification" button |
| **Invalid** | Error icon + "Invalid link" | "Contact support" link |

## 5.4 API Requirements

| Method | Route | Request | Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/verify-email` | `{ token }` (from URL params) | `{ verified: boolean, message }` |
| `POST` | `/api/v1/auth/resend-verification` | `{ email }` | `{ sent: boolean }` |

---

# 6. Multi-Factor Authentication Page

## 6.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Multi-Factor Authentication |
| **Route Path** | `/mfa` |
| **Accessible Roles** | Authenticated (post-credential, pre-session) |
| **Purpose** | Second-factor verification and MFA setup |
| **Business Objective** | Enhance security for Admin and Supervisor accounts |

## 6.2 Layout Structure

Centered card with TOTP code input (6-digit OTP with auto-advance).

## 6.3 Sections & Widgets

### TOTP Verification View
- 6 individual digit input boxes with auto-advance on keypress
- "Use backup code instead" link
- "Having trouble?" help text

### MFA Setup View (first-time)
- QR code display for Google Authenticator / Duo
- Manual key display (copyable)
- Verification code input to confirm setup
- Backup codes display (10 codes, downloadable)

## 6.4 API Requirements

| Method | Route | Request | Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/mfa/verify` | `{ code, sessionToken }` | `{ accessToken, refreshToken, user }` |
| `POST` | `/api/v1/auth/mfa/setup` | `{ method: "totp" }` | `{ secret, qrCodeUrl, backupCodes }` |
| `POST` | `/api/v1/auth/mfa/backup` | `{ backupCode, sessionToken }` | `{ accessToken, refreshToken, user }` |

## 6.5 Security

- TOTP codes valid for 30-second window with ±1 step tolerance
- Backup codes: Single-use, 10 codes generated on setup
- Rate limit: 5 attempts per session before lockout
- Brute force: Account locked after 10 failed MFA attempts

---

# 7. SSO Configuration Page

## 7.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | SSO Configuration |
| **Route Path** | `/sso` |
| **Accessible Roles** | Admin (L3), Superadmin (L4) |
| **Purpose** | Configure SAML 2.0 / OIDC identity provider integrations for enterprise tenants |
| **Business Objective** | Enable enterprise clients to use their existing IdP for seamless authentication |

## 7.2 Layout Structure

Authenticated layout with sidebar. Main content: SSO provider configuration form.

## 7.3 Sections & Widgets

### Active SSO Connections Table

| Column | Description |
| :--- | :--- |
| Provider Name | e.g., "Okta", "Azure AD" |
| Protocol | SAML 2.0 or OIDC |
| Status | Active / Inactive badge |
| Last Login | Most recent SSO login timestamp |
| Actions | Edit, Test, Disable |

### SSO Configuration Form

| Field | Type | Required | Validation |
| :--- | :--- | :--- | :--- |
| `providerName` | `text` | ✅ | 2–100 chars |
| `protocol` | `select` | ✅ | `saml2` or `oidc` |
| `metadataUrl` | `url` | ✅ (SAML) | Valid HTTPS URL |
| `clientId` | `text` | ✅ (OIDC) | Non-empty |
| `clientSecret` | `password` | ✅ (OIDC) | Non-empty |
| `issuerUrl` | `url` | ✅ (OIDC) | Valid HTTPS URL |
| `allowedDomains` | `text` | ✅ | Comma-separated email domains |

## 7.4 API Requirements

| Method | Route | Request | Response | Role |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/auth/sso/configs` | — | `{ providers: [...] }` | Admin+ |
| `POST` | `/api/v1/auth/sso/config` | SSO config object | `{ providerId, status }` | Admin+ |
| `PUT` | `/api/v1/auth/sso/config/:id` | Updated fields | `{ updated: true }` | Admin+ |
| `POST` | `/api/v1/auth/sso/test/:id` | — | `{ testResult, redirectUrl }` | Admin+ |
| `DELETE` | `/api/v1/auth/sso/config/:id` | — | `{ deleted: true }` | Admin+ |

## 7.5 Security & RBAC

| Rule | Detail |
| :--- | :--- |
| **Allowed Roles** | Admin (L3), Superadmin (L4) |
| **Client Secret** | Never displayed after initial save; masked with `••••••••` |
| **Audit** | All SSO config changes logged: `SSO_CONFIG_CREATED`, `SSO_CONFIG_UPDATED`, `SSO_CONFIG_DELETED` |

---

# 8. System Status Page

## 8.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | System Status |
| **Route Path** | `/status` |
| **Accessible Roles** | Public |
| **Purpose** | Public uptime tracker for platform services, WebSockets, and API latency |

## 8.2 Sections & Widgets

### Overall Status Banner
- Large status indicator: "All Systems Operational" (green) / "Partial Outage" (amber) / "Major Outage" (red)
- Last updated timestamp

### Service Status Grid

| Service | Monitored Metrics |
| :--- | :--- |
| FastAPI Backend | Response time, error rate |
| ESP32 WebSocket | Active connections, message throughput |
| Client WebSocket | Active connections, latency |
| Firestore DB | Read/Write quotas, query performance |
| AI Service | Inference latency, availability |

### 90-Day Uptime Chart
- Horizontal bar chart showing daily uptime percentage
- Color-coded: green (100%), amber (>99%), red (<99%)

### Incident History
- Chronological list of past incidents
- Each: Title, status (Resolved/Investigating), duration, affected services

## 8.3 API Requirements

| Method | Route | Response |
| :--- | :--- | :--- |
| `GET` | `/api/v1/public/status` | `{ overall, services: [{ name, status, latency, uptime }], incidents: [...] }` |

## 8.4 Performance Requirements

| Metric | Target |
| :--- | :--- |
| Page load | < 1s |
| Status API | < 200ms |
| Auto-refresh | Every 60 seconds |

---

# 9. Help Center / Support Page

## 9.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Help Center |
| **Route Path** | `/support` |
| **Accessible Roles** | Public (knowledge base), All Authenticated (ticket system) |
| **Purpose** | Self-service knowledge base and authenticated support ticket system |

## 9.2 Sections & Widgets

### Public Knowledge Base
- Search bar with instant results (Elasticsearch)
- Category filters: Hardware (ESP32, relays), Software (dashboard, API), AI (forecasting, anomalies)
- Article cards with title, excerpt, category tag, read time

### Authenticated Support Portal (visible when logged in)
- My Tickets table: ID, Subject, Status (Open/In Progress/Resolved), Priority, Last Updated
- "Create New Ticket" button → modal
- Live chat widget (bottom-right floating button)

## 9.3 Modal Windows

### Create Ticket Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click "Create New Ticket" |
| **Fields** | Subject (text), Category (select), Priority (select: Low/Medium/High/Critical), Description (textarea), Attachments (file upload, max 5 files, 10MB each) |
| **Validation** | Subject required (5–200 chars), Category required, Description required (20–5000 chars) |
| **Success State** | Ticket ID displayed with confirmation message |

## 9.4 API Requirements

| Method | Route | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/public/knowledge-base` | Public | Search articles |
| `GET` | `/api/v1/support/tickets` | Authenticated | List user's tickets |
| `POST` | `/api/v1/support/tickets` | Authenticated | Create new ticket |
| `PUT` | `/api/v1/support/tickets/:id` | Authenticated | Update ticket (add comment) |

---

# 10. Static Legal Pages

## Pages: Privacy Policy (`/privacy`) and Terms of Service (`/terms`)

### Common Specification

| Property | Value |
| :--- | :--- |
| **Accessible Roles** | Public |
| **Purpose** | Legal compliance (GDPR, POPIA, CCPA) |
| **Layout** | Centered content column (max-width 800px), table of contents sidebar |
| **Content** | Markdown-rendered legal text with section anchors |
| **Components** | Table of contents (auto-generated from headings), last updated date, print button |
| **Performance** | Static content — < 500ms FCP |
| **Testing** | Verify all section anchors resolve correctly, print styling renders properly |

---

## 📐 Architecture Notes

- All public pages are server-side renderable for SEO optimization
- Authentication pages implement automatic PKCE flow for OAuth providers
- The login page implements a "double-submit cookie" CSRF pattern
- Public API endpoints are rate-limited at the API Gateway level
- Static legal pages can be cached aggressively at the CDN layer (1-hour TTL)

## 🗺️ Related Documents

| Document | Purpose |
| :--- | :--- |
| [10_Authentication.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/10_Authentication.md) | Firebase Authentication and Claims implementation |
| [11_SecurityRules.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/11_SecurityRules.md) | Network-level security controls |
| [12_Access_Control.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/12_Access_Control.md) | RBAC permission matrix |
| [13_UI_UX_Guidelines.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/13_UI_UX_Guidelines.md) | Design system and component patterns |
