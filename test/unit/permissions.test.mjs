import test from 'node:test';
import assert from 'node:assert/strict';

// Core RBAC definitions
const UserRole = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  AUDITOR: 'auditor',
};

const ROUTE_PERMISSIONS = {
  '/dashboard': [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/supervisor': [UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/admin': [UserRole.ADMIN],
  '/dashboard/audit': [UserRole.AUDITOR, UserRole.ADMIN, UserRole.SUPERVISOR],
  '/dashboard/energy/bess': [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/users': [UserRole.ADMIN],
  '/dashboard/roles': [UserRole.ADMIN],
  '/dashboard/operations/incidents': [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
};

function roleCanAccessRoute(role, pathname) {
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter(route => pathname === route || pathname.startsWith(route + '/'))
    .sort((a, b) => b.length - a.length)[0];

  if (!matchedRoute) return true;
  return ROUTE_PERMISSIONS[matchedRoute].includes(role);
}

test('RBAC: Admin has unrestricted access to all major portals', () => {
  assert.equal(roleCanAccessRoute(UserRole.ADMIN, '/dashboard'), true);
  assert.equal(roleCanAccessRoute(UserRole.ADMIN, '/dashboard/admin'), true);
  assert.equal(roleCanAccessRoute(UserRole.ADMIN, '/dashboard/supervisor'), true);
  assert.equal(roleCanAccessRoute(UserRole.ADMIN, '/dashboard/users'), true);
  assert.equal(roleCanAccessRoute(UserRole.ADMIN, '/dashboard/roles'), true);
  assert.equal(roleCanAccessRoute(UserRole.ADMIN, '/dashboard/audit'), true);
});

test('RBAC: Operator can access live telemetry & BESS, but is barred from Admin & Users', () => {
  assert.equal(roleCanAccessRoute(UserRole.OPERATOR, '/dashboard'), true);
  assert.equal(roleCanAccessRoute(UserRole.OPERATOR, '/dashboard/energy/bess'), true);
  assert.equal(roleCanAccessRoute(UserRole.OPERATOR, '/dashboard/operations/incidents'), true);
  assert.equal(roleCanAccessRoute(UserRole.OPERATOR, '/dashboard/admin'), false);
  assert.equal(roleCanAccessRoute(UserRole.OPERATOR, '/dashboard/users'), false);
  assert.equal(roleCanAccessRoute(UserRole.OPERATOR, '/dashboard/roles'), false);
});

test('RBAC: Auditor has read access to audit & telemetry, but cannot access user management', () => {
  assert.equal(roleCanAccessRoute(UserRole.AUDITOR, '/dashboard/audit'), true);
  assert.equal(roleCanAccessRoute(UserRole.AUDITOR, '/dashboard/energy/bess'), true);
  assert.equal(roleCanAccessRoute(UserRole.AUDITOR, '/dashboard/users'), false);
  assert.equal(roleCanAccessRoute(UserRole.AUDITOR, '/dashboard/admin'), false);
});

test('RBAC: Public routes remain open to all users', () => {
  assert.equal(roleCanAccessRoute(UserRole.OPERATOR, '/about'), true);
  assert.equal(roleCanAccessRoute(UserRole.OPERATOR, '/contact'), true);
  assert.equal(roleCanAccessRoute(UserRole.AUDITOR, '/features'), true);
});
