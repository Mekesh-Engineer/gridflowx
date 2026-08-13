import { UserRole } from '@/types/roles';
import {
  LayoutDashboard, Activity, Zap, Battery, Sun, GitBranch,
  Radio, Thermometer, CloudSun, Brain, Bot, Box, BarChart3,
  FileText, Shield, Bell, Users, Settings, Wrench,
  ClipboardList, AlertTriangle, ToggleLeft, TrendingUp,
  ShieldCheck, CreditCard, Key, Plug, Sliders, Layers,
  Eye, Clock, LucideIcon,
} from 'lucide-react';

// ============================================================================
// Sidebar Types
// ============================================================================

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Badge source — key into a Zustand store getter or a static value */
  badge?: string;
  /** If true, only shows to specific roles even within a group */
  roles?: UserRole[];
}

export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

// ============================================================================
// Role-Based Sidebar Navigation Config
// ============================================================================

const OPERATOR_NAV: SidebarNavGroup[] = [
  {
    label: 'Live Operations',
    items: [
      { label: 'Operations Console',  href: '/dashboard',                           icon: LayoutDashboard },
      { label: 'Live Telemetry',      href: '/dashboard/sensors/live',              icon: Activity },
      { label: 'Power Flow',          href: '/dashboard/digital-twin/energy-flow',  icon: Zap },
    ],
  },
  {
    label: 'Energy Assets',
    items: [
      { label: 'Battery Storage',  href: '/dashboard/energy/bess',   icon: Battery },
      { label: 'Solar PV',         href: '/dashboard/energy/solar',  icon: Sun },
      { label: 'Grid Status',      href: '/dashboard/energy/grid',   icon: Radio },
    ],
  },
  {
    label: 'Field Operations',
    items: [
      { label: 'Work Orders',    href: '/dashboard/operations/work-orders',  icon: ClipboardList },
      { label: 'Incidents',      href: '/dashboard/operations/incidents',    icon: AlertTriangle },
      { label: 'SOP Checklists', href: '/dashboard/operations/checklists',  icon: ClipboardList },
      { label: 'Override Log',   href: '/dashboard/operations/overrides',   icon: ToggleLeft },
    ],
  },
  {
    label: 'IoT & Sensors',
    items: [
      { label: 'Device Status',       href: '/dashboard/iot/devices',         icon: Box },
      { label: 'Sensor Calibration',  href: '/dashboard/sensors/calibration', icon: Sliders },
      { label: 'Diagnostics',         href: '/dashboard/iot/diagnostics',     icon: Activity },
    ],
  },
  {
    label: 'Weather',
    items: [
      { label: 'Live Weather',    href: '/dashboard/weather/live',     icon: Thermometer },
      { label: 'Solar Forecast',  href: '/dashboard/weather/forecast', icon: CloudSun },
    ],
  },
  {
    label: 'AI Insights',
    items: [
      { label: 'AI Overview',         href: '/dashboard/ai/overview',         icon: Brain },
      { label: 'Recommendations',     href: '/dashboard/ai/recommendations',  icon: Brain },
    ],
  },
  {
    label: 'Reports & Docs',
    items: [
      { label: 'My Reports',       href: '/dashboard/reports/archive',  icon: FileText },
      { label: 'Notifications',    href: '/dashboard/notifications/center', icon: Bell },
    ],
  },
];

const SUPERVISOR_NAV: SidebarNavGroup[] = [
  {
    label: 'Fleet Dashboard',
    items: [
      { label: 'Supervisor Console', href: '/dashboard/supervisor',                 icon: LayoutDashboard },
      { label: 'Multi-Site Map',     href: '/dashboard/digital-twin/visualizer',   icon: Layers },
      { label: 'Live Power Flow',    href: '/dashboard/digital-twin/energy-flow',  icon: Zap },
    ],
  },
  {
    label: 'AI & Autonomy',
    items: [
      { label: 'AI Overview',           href: '/dashboard/ai/overview',           icon: Brain },
      { label: 'Forecast Accuracy',     href: '/dashboard/weather/accuracy',      icon: TrendingUp },
      { label: 'Recommendations',       href: '/dashboard/ai/recommendations',    icon: Brain },
      { label: 'Model Registry',        href: '/dashboard/ai/models',             icon: GitBranch },
      { label: 'Agent Dashboard',       href: '/dashboard/agentic-ai/overview',   icon: Bot },
      { label: 'Approval Queue',        href: '/dashboard/agentic-ai/queue',      icon: ShieldCheck, badge: 'approvals' },
      { label: 'Execution Timeline',    href: '/dashboard/agentic-ai/timeline',   icon: Clock },
    ],
  },
  {
    label: 'Energy Management',
    items: [
      { label: 'Battery Storage',   href: '/dashboard/energy/bess',   icon: Battery },
      { label: 'Solar PV',          href: '/dashboard/energy/solar',  icon: Sun },
      { label: 'Grid Status',       href: '/dashboard/energy/grid',   icon: Radio },
      { label: 'Load Tiers',        href: '/dashboard/energy/loads',  icon: Layers },
    ],
  },
  {
    label: 'IoT & Sensors',
    items: [
      { label: 'Device Inventory',  href: '/dashboard/iot/devices',     icon: Box },
      { label: 'Live Telemetry',    href: '/dashboard/sensors/live',    icon: Activity },
      { label: 'Sensor History',    href: '/dashboard/sensors/history', icon: BarChart3 },
      { label: 'Diagnostics',       href: '/dashboard/iot/diagnostics', icon: Activity },
    ],
  },
  {
    label: 'Operations Oversight',
    items: [
      { label: 'Work Orders',     href: '/dashboard/operations/work-orders',  icon: ClipboardList },
      { label: 'Incident Triage', href: '/dashboard/operations/incidents',   icon: AlertTriangle },
      { label: 'Override Log',    href: '/dashboard/operations/overrides',   icon: ToggleLeft },
    ],
  },
  {
    label: 'Performance Analytics',
    items: [
      { label: 'Business Analytics', href: '/dashboard/analytics/business', icon: BarChart3 },
      { label: 'Carbon Analytics',   href: '/dashboard/analytics/carbon',   icon: TrendingUp },
    ],
  },
  {
    label: 'Reports & Exports',
    items: [
      { label: 'Report Generator', href: '/dashboard/reports/generator', icon: FileText },
      { label: 'Report Archive',   href: '/dashboard/reports/archive',   icon: FileText },
    ],
  },
  {
    label: 'Compliance & Alerts',
    items: [
      { label: 'Audit Logs',      href: '/dashboard/audit',                    icon: Shield },
      { label: 'Notifications',   href: '/dashboard/notifications/center',     icon: Bell },
      { label: 'Alert Rules',     href: '/dashboard/notifications/rules',      icon: Bell },
    ],
  },
];

const ADMIN_NAV: SidebarNavGroup[] = [
  {
    label: 'Executive Overview',
    items: [
      { label: 'Admin Portal',    href: '/dashboard/admin',                        icon: LayoutDashboard },
      { label: 'Tenant Overview', href: '/dashboard/admin',                        icon: Layers },
    ],
  },
  {
    label: 'AI & Autonomy',
    items: [
      { label: 'AI Overview',        href: '/dashboard/ai/overview',          icon: Brain },
      { label: 'Model Registry',     href: '/dashboard/ai/models',            icon: GitBranch },
      { label: 'Agent Dashboard',    href: '/dashboard/agentic-ai/overview',  icon: Bot },
      { label: 'Approval Queue',     href: '/dashboard/agentic-ai/queue',     icon: ShieldCheck, badge: 'approvals' },
    ],
  },
  {
    label: 'Energy Management',
    items: [
      { label: 'Battery Storage',  href: '/dashboard/energy/bess',   icon: Battery },
      { label: 'Solar PV',         href: '/dashboard/energy/solar',  icon: Sun },
      { label: 'Grid Status',      href: '/dashboard/energy/grid',   icon: Radio },
      { label: 'Load Tiers',       href: '/dashboard/energy/loads',  icon: Layers },
    ],
  },
  {
    label: 'IoT & Devices',
    items: [
      { label: 'Device Inventory',  href: '/dashboard/iot/devices',    icon: Box },
      { label: 'Gateway Hub',       href: '/dashboard/iot/gateways',   icon: Radio },
      { label: 'OTA Firmware',      href: '/dashboard/iot/firmware',   icon: Zap },
      { label: 'Diagnostics',       href: '/dashboard/iot/diagnostics',icon: Activity },
    ],
  },
  {
    label: 'User & RBAC',
    items: [
      { label: 'User Directory',    href: '/dashboard/users',   icon: Users },
      { label: 'Roles & Permissions', href: '/dashboard/roles', icon: ShieldCheck },
    ],
  },
  {
    label: 'Reports & Analytics',
    items: [
      { label: 'Report Generator',    href: '/dashboard/reports/generator',     icon: FileText },
      { label: 'Business Analytics',  href: '/dashboard/analytics/business',    icon: BarChart3 },
      { label: 'Carbon Analytics',    href: '/dashboard/analytics/carbon',      icon: TrendingUp },
    ],
  },
  {
    label: 'Audit & Compliance',
    items: [
      { label: 'Security Audit Logs', href: '/dashboard/audit/logs',        icon: Shield },
      { label: 'Compliance Center',   href: '/dashboard/audit/compliance',  icon: ShieldCheck },
    ],
  },
  {
    label: 'Integrations & APIs',
    items: [
      { label: 'Integration Hub',  href: '/dashboard/admin/integrations',  icon: Plug },
      { label: 'API Keys',         href: '/dashboard/admin/api-keys',      icon: Key },
    ],
  },
  {
    label: 'Billing & Plans',
    items: [
      { label: 'Billing & Subscription', href: '/dashboard/admin/billing',   icon: CreditCard },
    ],
  },
  {
    label: 'System Settings',
    items: [
      { label: 'Tenant Settings',  href: '/dashboard/admin/settings',   icon: Settings },
      { label: 'Alert Rules',      href: '/dashboard/notifications/rules', icon: Bell },
    ],
  },
];

const AUDITOR_NAV: SidebarNavGroup[] = [
  {
    label: 'Audit Trail',
    items: [
      { label: 'Auditor Console',     href: '/dashboard/audit',              icon: LayoutDashboard },
      { label: 'Security Audit Logs', href: '/dashboard/audit/logs',         icon: Shield },
      { label: 'Override Log',        href: '/dashboard/operations/overrides', icon: ToggleLeft },
      { label: 'Compliance Center',   href: '/dashboard/audit/compliance',   icon: ShieldCheck },
    ],
  },
  {
    label: 'Historical Data',
    items: [
      { label: 'Sensor History',    href: '/dashboard/sensors/history', icon: Activity },
      { label: 'AI Timeline',       href: '/dashboard/agentic-ai/timeline', icon: Clock },
      { label: 'Agent AI Overview', href: '/dashboard/ai/overview',    icon: Brain },
    ],
  },
  {
    label: 'Analytics & Reports',
    items: [
      { label: 'Business Analytics', href: '/dashboard/analytics/business',  icon: BarChart3 },
      { label: 'Carbon Analytics',   href: '/dashboard/analytics/carbon',    icon: TrendingUp },
      { label: 'Report Archive',     href: '/dashboard/reports/archive',     icon: FileText },
    ],
  },
  {
    label: 'Energy Monitoring',
    items: [
      { label: 'Battery Storage',  href: '/dashboard/energy/bess',              icon: Battery },
      { label: 'Solar PV',         href: '/dashboard/energy/solar',             icon: Sun },
      { label: 'Power Flow',       href: '/dashboard/digital-twin/energy-flow', icon: Zap },
    ],
  },
  {
    label: 'Notifications',
    items: [
      { label: 'Notification Center', href: '/dashboard/notifications/center', icon: Bell },
    ],
  },
];

export const SIDEBAR_NAV: Record<UserRole, SidebarNavGroup[]> = {
  [UserRole.OPERATOR]:   OPERATOR_NAV,
  [UserRole.SUPERVISOR]: SUPERVISOR_NAV,
  [UserRole.ADMIN]:      ADMIN_NAV,
  [UserRole.AUDITOR]:    AUDITOR_NAV,
};
