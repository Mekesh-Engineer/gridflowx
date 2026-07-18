# 👑 GridFlowX RBAC Page Specification — Admin Module (L3)

## Software Requirements Specification (SRS) & System Design Document (SDD)

**Document ID:** `SDD-PAGES-04`
**Version:** 1.0
**Last Updated:** June 2026
**Classification:** SRS/SDD · RBAC Page Architecture · UI/UX Specification
**Maintained By:** Platform Architecture Team

---

# 1. User Management

## 1.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | User Management |
| **Route Path** | `/team` |
| **Accessible Roles** | Admin (L3), Superadmin (L4) |
| **Purpose** | Complete user lifecycle management — create, read, update, and deactivate tenant user accounts |
| **Business Objective** | Centralized workforce management with audit-logged role assignments |
| **User Workflow** | Navigate to Team → View user list → Create/Edit/Deactivate users → Assign roles → Verify audit trail |

## 1.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER BAR                                                              │
│ [☰] [GridFlowX] [Admin > User Management]         [🔔] [👤 Admin]        │
├────────┬────────────────────────────────────────────────────────────────┤
│SIDEBAR │  MAIN CONTENT                                                 │
│        │ ┌────────────────────────────────────────────────────────────┐ │
│ 📊 Dash│ │  USER MANAGEMENT HEADER                                   │ │
│ 👥 Team│ │  "User Management"         [+ Create User] [📥 Import]    │ │
│ 🔐 Role│ │  "12 users · 3 active now"                                │ │
│ 💳 Bill│ │ ├────────────────────────────────────────────────────────┤ │ │
│ 🔌 Intg│ │ │  SEARCH & FILTER BAR                                  │ │ │
│ 🤖 Auto│ │ │  [🔍 Search users...] [Role ▼] [Status ▼] [Sort ▼]   │ │ │
│ 📋 Audt│ │ ├────────────────────────────────────────────────────────┤ │ │
│ ⚙️ Sett│ │ │  USER TABLE                                           │ │ │
│        │ │ │  ☐ │ Avatar │ Name      │ Email         │ Role     │  │ │ │
│        │ │ │  ☐ │ 👤     │ J. Smith  │ j@gridflowx.io   │ Operator │  │ │ │
│        │ │ │  ☐ │ 👤     │ A. Jones  │ a@gridflowx.io   │ Operator │  │ │ │
│        │ │ │  ☐ │ 👤     │ M. Lee    │ m@gridflowx.io   │ Supervisor│ │ │ │
│        │ │ │                                                        │ │ │
│        │ │ │  Status │ Last Login    │ Actions                      │ │ │
│        │ │ │  ● Active│ 2 hours ago  │ [✏️ Edit] [🔒 Lock] [🗑️]   │ │ │
│        │ │ │  ● Active│ 1 day ago    │ [✏️ Edit] [🔒 Lock] [🗑️]   │ │ │
│        │ │ │  ● Active│ 5 min ago    │ [✏️ Edit] [🔒 Lock] [🗑️]   │ │ │
│        │ │ ├────────────────────────────────────────────────────────┤ │ │
│        │ │ │  PAGINATION                                           │ │ │
│        │ │ │  [◀ Prev] Page 1 of 3 [Next ▶]  Showing 1-10 of 12   │ │ │
│        │ │ └────────────────────────────────────────────────────────┘ │ │
└────────┴────────────────────────────────────────────────────────────────┘
```

## 1.3 Sections & Widgets

### User Statistics Header

| Widget | Value | Description |
| :--- | :--- | :--- |
| Total Users | Count | Total users in tenant |
| Active Now | Count | Currently online (WebSocket presence) |
| By Role | Breakdown | Operators / Supervisors / Admins pie chart |
| New This Month | Count | Users created in current month |

### User Table

| Column | Type | Sortable | Searchable |
| :--- | :--- | :--- | :--- |
| Checkbox | Select | ❌ | ❌ |
| Avatar | Image | ❌ | ❌ |
| Full Name | Text | ✅ | ✅ |
| Email | Text | ✅ | ✅ |
| Username | Text | ✅ | ✅ |
| Role | Badge | ✅ (filter) | ✅ (filter) |
| Status | Badge | ✅ (filter) | ❌ |
| Last Login | Relative date | ✅ | ❌ |
| Created | Date | ✅ | ❌ |
| Actions | Buttons | ❌ | ❌ |

**Bulk Operations (via checkboxes):**
- Bulk deactivate
- Bulk role change
- Bulk export (CSV)

## 1.4 Modal Windows

### Create User Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Create User |
| **Trigger** | Click "+ Create User" button |
| **Purpose** | Provision new user account |
| **Fields** | Full Name (text, required), Username (text, required, unique check), Email (email, required, unique check), Role (select: Operator/Supervisor/Admin, required), Temporary Password (auto-generated or custom), Assigned Sites (multi-select), Send Welcome Email (checkbox, default: true) |
| **Validation** | Name 2–100 chars; Username 3–50 chars, alphanumeric + underscore; Email valid format + unique; Password 12+ chars with complexity; Role required |
| **Success State** | Toast: "User created successfully" + optional email sent notification |
| **Error State** | Inline field errors; duplicate username/email toast |
| **Audit** | `USER_CREATED` logged with new user details |

### Edit User Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Edit User |
| **Trigger** | Click edit icon on user row |
| **Purpose** | Update user details and role assignment |
| **Fields** | Full Name, Email, Role (dropdown), Status (Active/Inactive), Assigned Sites |
| **Validation** | Same as create (except password) |
| **Confirmation** | Role changes require explicit confirmation dialog |
| **Audit** | `USER_UPDATED` for general changes; `USER_ROLE_CHANGED` for role modifications |

### Reset Password Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click "Reset Password" in edit modal |
| **Fields** | New temporary password (auto-generated), "Force password change on login" (checkbox, default: true) |
| **Audit** | `PASSWORD_RESET_ADMIN` logged |

### Delete User Confirmation Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click delete icon on user row |
| **Purpose** | Soft-delete (deactivate) user account |
| **Confirmation** | Type username to confirm: "Type `j_smith` to deactivate this account" |
| **Note** | Users are soft-deleted (is_active = false), not physically removed |
| **Audit** | `USER_DEACTIVATED` logged |

### Bulk Import Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click "Import" button |
| **Purpose** | Bulk user creation from CSV file |
| **Fields** | CSV file upload, column mapping preview, dry-run results |
| **Validation** | CSV format check, duplicate detection, role validation |
| **Success** | Summary: "10 users created, 2 skipped (duplicates)" |

## 1.5 Micro Animations

| Animation | Trigger | Duration | UX Purpose |
| :--- | :--- | :--- | :--- |
| Table row fade-in | New user created | 400ms | Confirm addition |
| Row highlight flash | User edited | 300ms amber flash | Confirm update |
| Row slide-out | User deleted | 300ms | Confirm removal |
| Status badge transition | Status change | 200ms | State change feedback |
| Skeleton rows | Initial load | Until data arrives | Loading state |
| Search results filter | Keystroke | 200ms debounce | Responsive filtering |

## 1.6 Forms & Validation

### Create User Zod Schema

```typescript
const createUserSchema = z.object({
  fullName: z.string().min(2).max(100),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  role: z.enum(['Operator', 'Supervisor', 'Admin']),
  password: z.string().min(12)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain digit')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  assignedSites: z.array(z.string()).optional(),
  sendWelcomeEmail: z.boolean().default(true),
});
```

## 1.7 API Requirements

| Method | Route | Request | Response | Role |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | `?page=1&limit=10&role=Operator&search=smith` | `{ users: [...], total, page }` | Admin+ |
| `POST` | `/api/v1/users` | Create user payload | `{ id, username, role, created_at }` | Admin+ |
| `GET` | `/api/v1/users/:id` | — | User detail object | Admin+ |
| `PUT` | `/api/v1/users/:id` | Updated fields | `{ updated: true }` | Admin+ |
| `DELETE` | `/api/v1/users/:id` | — | `{ deactivated: true }` | Admin+ |
| `POST` | `/api/v1/users/:id/reset-password` | `{ newPassword, forceChange }` | `{ reset: true }` | Admin+ |
| `POST` | `/api/v1/users/import` | FormData (CSV file) | `{ created, skipped, errors }` | Admin+ |
| `GET` | `/api/v1/users/export` | `?format=csv` | CSV download | Admin+ |

## 1.8 Backend Services

| Service | Responsibilities |
| :--- | :--- |
| **user.service.ts** | CRUD operations, role validation, password hashing, unique checks, soft-delete |
| **auth.service.ts** | Password reset, force-change flag, welcome email trigger |
| **audit.service.ts** | Log all user management actions |
| **email.service.ts** | Send welcome emails and password reset notifications |

## 1.9 Database Integration

| Store / Service | Target | Usage |
| :--- | :--- | :--- |
| **Firebase Auth** | Users | Manage credential profiles, password resets, and login blocking |
| **Firebase Firestore** | `users`, `audit_logs` | Write custom role claims metadata and insert audit events |

## 1.10 Security & RBAC

| Rule | Detail |
| :--- | :--- |
| **Allowed Roles** | Admin (L3), Superadmin (L4) |
| **Self-Modification** | Admins cannot change their own role |
| **Escalation Prevention** | Admins can only assign roles ≤ their own level |
| **Tenant Isolation** | Admin sees only users within their tenant |
| **Password Policy** | Min 12 chars, complexity, no reuse of last 5 passwords |

## 1.11 Performance Requirements

| Metric | Target |
| :--- | :--- |
| User list load | < 500ms (paginated, 50 users/page) |
| User search | < 300ms (debounced) |
| Create user | < 1s (includes bcrypt) |
| Bulk import (100 users) | < 30s |

---

# 2. Role Management (`/roles`)

## 2.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Role Management |
| **Route Path** | `/roles` |
| **Accessible Roles** | Admin (L3), Superadmin (L4) |
| **Purpose** | Tenant-level RBAC customization and permission assignment |

## 2.2 Sections & Widgets

### Role Cards

| Role | Default Permissions | Customizable |
| :--- | :--- | :--- |
| Operator (L1) | View telemetry, override relays (30min), report incidents | ⚠️ Limited |
| Supervisor (L2) | + Analytics, approvals, team management, reports | ⚠️ Limited |
| Admin (L3) | + User mgmt, config, billing, integrations, audit | ✅ Full |

### Permission Matrix Table

| Permission Category | Operator | Supervisor | Admin |
| :--- | :--- | :--- | :--- |
| View Dashboard | ✅ | ✅ | ✅ |
| Override Relays | ✅ (time-limited) | ✅ (extended) | ✅ (unlimited) |
| Emergency Shutdown | ✅ | ✅ | ✅ |
| Recovery Authorization | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| Generate Reports | Own only | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Edit Configuration | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | Team only | ✅ |
| Manage Billing | ❌ | ❌ | ✅ |

### Custom Permission Toggles (Admin Role)
- Per-permission toggle switches for fine-grained customization
- "Reset to Default" button per role

## 2.3 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/roles` | List roles with permissions | Admin+ |
| `PUT` | `/api/v1/roles/:id/permissions` | Update role permissions | Admin+ |
| `POST` | `/api/v1/roles/:id/reset` | Reset to default permissions | Admin+ |

---

# 3. Tenant Settings (`/settings`)

## 3.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Tenant Settings |
| **Route Path** | `/settings` |
| **Accessible Roles** | Admin (L3), Superadmin (L4) |
| **Purpose** | System safety threshold editor, calibration coefficients, and tenant preferences |

## 3.2 Sections & Widgets

### Safety Thresholds Panel

| Setting | Field Type | Default | Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| SoC Tier 2 Shed (%) | Number slider | 40 | 20–60 | Battery SoC below which Tier 2 loads shed |
| SoC Tier 3 Shed (%) | Number slider | 30 | 10–50 | Battery SoC below which Tier 3 loads shed |
| Temp Warning (°C) | Number input | 70 | 50–80 | Heatsink temperature warning threshold |
| Temp Shutdown (°C) | Number input | 85 | 70–95 | Emergency shutdown temperature |
| Voltage Ripple Max (V) | Number input | 1.2 | 0.5–3.0 | Maximum acceptable voltage ripple |

### Calibration Coefficients Panel

| Setting | Field Type | Default | Description |
| :--- | :--- | :--- | :--- |
| ACS712 Offset (V) | Decimal input | 2.500 | Current sensor zero offset |
| ACS712 Scale (V/A) | Decimal input | 0.185 | Current sensor sensitivity |
| Divider Ratio | Decimal input | 3.703 | Voltage divider conversion factor |

### System Preferences

| Setting | Type | Default |
| :--- | :--- | :--- |
| AI Auto Mode | Toggle | Enabled |
| Notification Email | Email input | null |
| Timezone | Select | Africa/Johannesburg |
| Data Retention (days) | Number | 365 |
| Telemetry Resolution (s) | Select | 15 |

## 3.3 Modal Windows

### Restore Defaults Confirmation

| Property | Value |
| :--- | :--- |
| **Trigger** | Click "Restore Factory Defaults" |
| **Purpose** | Reset all configuration to factory values |
| **Confirmation** | Double confirmation: "This will reset ALL thresholds and calibration values. Type `RESTORE` to confirm." |
| **Audit** | `CONFIG_RESTORE_DEFAULTS` logged |

### Unsaved Changes Warning

| Property | Value |
| :--- | :--- |
| **Trigger** | Navigate away with unsaved changes |
| **Purpose** | Prevent accidental data loss |
| **Actions** | "Save Changes" / "Discard" / "Cancel Navigation" |

## 3.4 Forms & Validation

```typescript
const configSchema = z.object({
  thresholds: z.object({
    soc_tier2_shed: z.number().min(20).max(60),
    soc_tier3_shed: z.number().min(10).max(50),
    temp_warning: z.number().min(50).max(80),
    temp_shutdown: z.number().min(70).max(95),
    voltage_ripple_max: z.number().min(0.5).max(3.0),
  }),
  calibration: z.object({
    acs712_offset: z.number().min(0).max(5),
    acs712_scale: z.number().min(0.01).max(1.0),
    divider_ratio: z.number().min(1.0).max(10.0),
  }),
}).refine(data => data.thresholds.soc_tier3_shed < data.thresholds.soc_tier2_shed, {
  message: 'Tier 3 shed must be lower than Tier 2 shed',
}).refine(data => data.thresholds.temp_warning < data.thresholds.temp_shutdown, {
  message: 'Warning temp must be lower than shutdown temp',
});
```

## 3.5 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/config/thresholds` | Load current configuration | Admin+ |
| `PUT` | `/api/v1/config/thresholds` | Save updated configuration | Admin+ |
| `POST` | `/api/v1/config/restore-defaults` | Reset to factory defaults | Admin+ |

## 3.6 State Management

### config.store (Zustand)

```typescript
interface ConfigState {
  thresholds: SafetyThresholds;
  calibration: CalibrationCoefficients;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: number | null;
}
```

**Actions:** `loadConfig()`, `updateThreshold(key, value)`, `saveConfig()`, `restoreDefaults()`

---

# 4. Billing Center (`/billing`)

## 4.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Billing Center |
| **Route Path** | `/billing` |
| **Accessible Roles** | Admin (L3), Superadmin (L4) |
| **Purpose** | Invoice history, payment method management, and seat allocation tracking |

## 4.2 Sections & Widgets

### Current Plan Summary Card

| Property | Display |
| :--- | :--- |
| Plan Name | "Professional" badge |
| Monthly Cost | "$XXX/month" |
| Billing Cycle | Next billing date |
| Seats Used | "8 of 15 seats used" with progress bar |
| Node Limit | "12 of 50 nodes active" with progress bar |

### Invoice History Table

| Column | Type |
| :--- | :--- |
| Invoice # | Link to PDF |
| Date | Formatted date |
| Amount | Currency formatted |
| Status | Paid (green) / Pending (amber) / Overdue (red) |
| Actions | Download PDF, View Details |

### Payment Methods

| Property | Value |
| :--- | :--- |
| **Display** | Card list with masked card numbers |
| **Actions** | Add card, set default, remove |
| **Security** | PCI-DSS compliant — card data handled by Stripe/payment provider |

## 4.3 Modal Windows

### Add Payment Method Modal

| Field | Type | Validation |
| :--- | :--- | :--- |
| Card Number | Stripe Elements | Stripe validation |
| Expiry | Stripe Elements | Future date |
| CVC | Stripe Elements | 3-4 digits |
| Cardholder Name | Text | Required |
| Billing Address | Address form | Required |

### Upgrade Plan Modal

| Property | Value |
| :--- | :--- |
| **Content** | Plan comparison table, feature differences, price change summary |
| **Confirmation** | "Your billing will change from $X to $Y on your next cycle" |

## 4.4 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/billing/summary` | Current plan and usage | Admin+ |
| `GET` | `/api/v1/billing/invoices` | Invoice history | Admin+ |
| `GET` | `/api/v1/billing/invoices/:id/pdf` | Download invoice PDF | Admin+ |
| `POST` | `/api/v1/billing/payment-methods` | Add payment method | Admin+ |
| `DELETE` | `/api/v1/billing/payment-methods/:id` | Remove payment method | Admin+ |
| `POST` | `/api/v1/billing/upgrade` | Change subscription plan | Admin+ |

---

# 5. Integrations Hub (`/integrations`)

| Property | Value |
| :--- | :--- |
| **Route** | `/integrations` |
| **Roles** | Admin+ |
| **Purpose** | Third-party service integration configuration |
| **Sections** | Available integrations catalog, active integrations, connection status |
| **Integration Types** | Weather API (OpenWeatherMap), CRM (HubSpot), HRMS (Workday), Notification (Slack/Teams), Email (SendGrid) |
| **API** | `GET /api/v1/integrations`, `POST /api/v1/integrations/:type/connect`, `DELETE /api/v1/integrations/:type/disconnect` |

# 6. API Key Management (`/api-keys`)

| Property | Value |
| :--- | :--- |
| **Route** | `/api-keys` |
| **Roles** | Admin+ |
| **Purpose** | Developer API credential lifecycle management |
| **Sections** | Active API keys table, create key, usage statistics, rate limit configuration |
| **Security** | API keys shown only once on creation; hashed in storage |
| **API** | `GET /api/v1/api-keys`, `POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/:id` |

# 7. Workflow Automation (`/automation`)

| Property | Value |
| :--- | :--- |
| **Route** | `/automation` |
| **Roles** | Admin+ |
| **Purpose** | Visual rules engine for event-driven system triggers |
| **Sections** | Rule builder (IF/THEN/ELSE), active rules list, execution history |
| **Example Rules** | "IF battery SoC < 30% AND solar < 50W THEN shed Tier 3 loads" |
| **API** | `POST /api/v1/automation/rules`, `GET /api/v1/automation/rules`, `PUT /api/v1/automation/rules/:id` |

# 8. Audit Logs (`/audit`)

## 8.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Audit Logs |
| **Route Path** | `/audit` |
| **Accessible Roles** | Supervisor (L2 — team only), Admin (L3), Superadmin (L4) |
| **Purpose** | Immutable security log viewer with filtering and export |

## 8.2 Sections & Widgets

### Audit Log Table

| Column | Type | Filterable |
| :--- | :--- | :--- |
| Timestamp | DateTime | ✅ (date range) |
| User | Name + avatar | ✅ (user select) |
| Action | Badge | ✅ (action type) |
| Details | JSON expandable | ❌ |
| IP Address | Text | ✅ |
| User Agent | Truncated text | ❌ |

### Filter Panel

| Filter | Type | Options |
| :--- | :--- | :--- |
| Date Range | Date picker | Last 24h, 7d, 30d, custom |
| User | Multi-select | All tenant users |
| Action Type | Multi-select | LOGIN_SUCCESS, MANUAL_RELAY_OVERRIDE, CONFIG_UPDATE, etc. |
| IP Address | Text input | Exact or prefix match |

### Export Options
- CSV download with applied filters
- PDF compliance report
- Scheduled export (daily/weekly email)

## 8.3 RBAC Scoping

| Role | Scope |
| :--- | :--- |
| Supervisor (L2) | Only team members' logs (operators they supervise) |
| Admin (L3) | Full tenant audit logs |
| Superadmin (L4) | Cross-tenant global audit logs |

## 8.4 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/audit/logs` | Query audit logs with filters | Supervisor+ (scoped) |
| `GET` | `/api/v1/audit/logs/export` | Export filtered logs | Admin+ |
| `GET` | `/api/v1/audit/compliance-report` | Generate compliance report | Admin+ |

# 9. Circuit Configuration (`/departments`)

| Property | Value |
| :--- | :--- |
| **Route** | `/departments` |
| **Roles** | Admin+ |
| **Purpose** | Map physical relay circuits to load tier classifications |
| **Sections** | Circuit-to-tier mapping table, drag-and-drop assignment, tier description editor |
| **Tiers** | Critical Tier 1 (never shed), Important Tier 2 (shed at SoC < 40%), Flexible Tier 3 (shed at SoC < 30%) |

# 10. Business Reports (`/reports/admin`)

| Property | Value |
| :--- | :--- |
| **Route** | `/reports/admin` |
| **Roles** | Admin+ |
| **Purpose** | Tenant billing analytics, seat utilization insights, cost optimization recommendations |
| **Sections** | Cost per kWh chart, seat utilization donut, API usage trend, billing forecast |

---

## 📐 Architecture Notes

- Admin pages use optimistic updates — UI reflects changes immediately while API confirms in background
- User creation is offloaded to Firebase Authentication
- Configuration changes are broadcast via WebSockets to all connected clients for immediate effect
- Audit logs are immutable — client Firestore rules block all write and delete operations on the `audit_logs` collection

## 🗺️ Related Documents

| Document | Purpose |
| :--- | :--- |
| [12_Access_Control.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/12_Access_Control.md) | RBAC permission definitions |
| [Database_Schema.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/Database_Schema.md) | User and audit log table schemas |
| [10_Authentication.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/10_Authentication.md) | Authentication implementation |
