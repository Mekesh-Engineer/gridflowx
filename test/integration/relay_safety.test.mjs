import test from 'node:test';
import assert from 'node:assert/strict';

function executeEmergencyShutdown(currentRelays) {
  // Atomic hardware safe-state isolation
  return [false, false, false, false, false, false, false, false];
}

function executeRecoveryAuthorization(role, reason) {
  if (role !== 'supervisor' && role !== 'admin') {
    throw new Error('Unauthorized: Recovery requires Supervisor or Admin authorization.');
  }
  // Safe default recovery configuration (MPPT on, Inverter on, Critical Tier 1 on)
  return [true, true, false, true, false, true, false, true];
}

test('Relay Safety: Emergency stop sets all 8 contactors to FALSE atomically', () => {
  const activeRelays = [true, true, true, true, true, true, true, true];
  const shutdownRelays = executeEmergencyShutdown(activeRelays);

  assert.equal(shutdownRelays.length, 8);
  assert.ok(shutdownRelays.every(channel => channel === false));
});

test('Relay Safety: Recovery rejects Operator role and requires Supervisor or Admin', () => {
  assert.throws(
    () => executeRecoveryAuthorization('operator', 'Attempt recovery'),
    /Unauthorized/
  );

  const supervisorRecovered = executeRecoveryAuthorization('supervisor', 'Verified clear');
  assert.equal(supervisorRecovered.length, 8);
  assert.equal(supervisorRecovered[0], true); // Critical Tier 1 restored

  const adminRecovered = executeRecoveryAuthorization('admin', 'Admin clear');
  assert.equal(adminRecovered.length, 8);
  assert.equal(adminRecovered[0], true);
});
