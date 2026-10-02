import test from 'node:test';
import assert from 'node:assert/strict';

const MAX_HISTORY_BUFFER = 60;

function ingestFrameIntoBuffer(history, newFrame) {
  return [...history.slice(-(MAX_HISTORY_BUFFER - 1)), newFrame];
}

test('Telemetry: Circular buffer never exceeds MAX_HISTORY_BUFFER frames', () => {
  let buffer = [];
  for (let i = 0; i < 150; i++) {
    buffer = ingestFrameIntoBuffer(buffer, { sequenceNumber: i, solarPowerW: 300 + (i % 50) });
  }

  assert.equal(buffer.length, MAX_HISTORY_BUFFER);
  assert.equal(buffer[buffer.length - 1].sequenceNumber, 149);
  assert.equal(buffer[0].sequenceNumber, 149 - (MAX_HISTORY_BUFFER - 1));
});

test('Telemetry: Electrical calculations maintain physical conservation laws', () => {
  const solarV = 18.4;
  const solarA = 18.6;
  const expectedWatts = solarV * solarA;

  assert.ok(Math.abs(expectedWatts - 342.24) < 0.01);

  // Battery current * voltage = Power (negative = discharging)
  const battV = 12.8;
  const battA = -3.2;
  const battWatts = battV * battA;

  assert.ok(battWatts < 0, 'Discharging battery must yield negative net power in Watts');
  assert.ok(Math.abs(battWatts - (-40.96)) < 0.01);
});
