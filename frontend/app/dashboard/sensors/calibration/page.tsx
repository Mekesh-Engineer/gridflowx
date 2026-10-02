'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Thermometer,
  Zap,
  Battery,
  Radio,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useTelemetry } from '@/features/telemetry/hooks/useTelemetry';
import { PermissionGuard } from '@/components/providers/PermissionGuard';
import {
  DeviceCalibration,
  DEFAULT_DEVICE_CALIBRATION,
} from '@/types/device.types';
import {
  fetchAllDevices,
  updateDeviceCalibration,
} from '@/services/device.service';

export default function CalibrationPage() {
  const { user } = useAuth();
  const telemetry = useTelemetry();

  const [deviceId, setDeviceId] = useState('GFX-ESP32-MASTER-01');
  const [calibration, setCalibration] = useState<DeviceCalibration>(
    DEFAULT_DEVICE_CALIBRATION
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDevice() {
      try {
        const devices = await fetchAllDevices();
        const target = devices.find((d) => d.id === deviceId) || devices[0];
        if (target && target.calibration) {
          setCalibration(target.calibration);
          setDeviceId(target.id);
        }
      } catch (err) {
        console.warn('Failed to load device calibration:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDevice();
  }, [deviceId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDeviceCalibration(
        deviceId,
        calibration,
        user?.uid || 'SYSTEM_OPERATOR'
      );
      toast.success(
        `Hardware calibration parameters synchronized to ${deviceId} and EEPROM register.`
      );
    } catch (err: any) {
      toast.error(`Calibration update failed: ${err?.message || 'Database error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setCalibration(DEFAULT_DEVICE_CALIBRATION);
    toast.info('Loaded factory calibration defaults');
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Sensor Calibration Studio</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Precision ADC voltage divider attenuation, ACS712 Hall-effect sensitivity & thermal cutoff thresholds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold hover:border-[var(--color-primary)] transition-all"
          >
            Reset Defaults
          </button>
          <PermissionGuard resource="sensors" action="update">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Flash to Controller
            </button>
          </PermissionGuard>
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs text-[var(--text-muted)]">Loading hardware calibration register...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Resistor Divider Voltage Calibration */}
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-5">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Voltage Divider Attenuation Multipliers
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">
                  Solar PV Ratio ((R1 + R2) / R2) · Nom: 7.6667
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={calibration.solarVoltageRatio}
                  onChange={(e) =>
                    setCalibration({
                      ...calibration,
                      solarVoltageRatio: parseFloat(e.target.value) || 1.0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">
                  AC Grid Sense Ratio ((R3 + R4) / R4) · Nom: 5.5455
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={calibration.gridVoltageRatio}
                  onChange={(e) =>
                    setCalibration({
                      ...calibration,
                      gridVoltageRatio: parseFloat(e.target.value) || 1.0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">
                  Battery Sense Ratio ((R5 + R6) / R6) · Nom: 4.5946
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={calibration.batteryVoltageRatio}
                  onChange={(e) =>
                    setCalibration({
                      ...calibration,
                      batteryVoltageRatio: parseFloat(e.target.value) || 1.0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Current Sensor & Thermal Safety */}
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-5">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--color-primary)]" /> ACS712 & Safety Limits
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">
                  ACS712 Zero-Current Offset (Vcc/2 in Volts)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={calibration.acs712ZeroOffsetV}
                  onChange={(e) =>
                    setCalibration({
                      ...calibration,
                      acs712ZeroOffsetV: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">
                  ACS712 Sensitivity (V / A) · Nom: 0.100 for 20A
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={calibration.acs712SensitivityVpA}
                  onChange={(e) =>
                    setCalibration({
                      ...calibration,
                      acs712SensitivityVpA: parseFloat(e.target.value) || 0.001,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">
                  Thermal Cutoff Threshold (°C) · Nom: 65.0°C
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={calibration.thermalCutoffThresholdC}
                  onChange={(e) =>
                    setCalibration({
                      ...calibration,
                      thermalCutoffThresholdC: parseFloat(e.target.value) || 65.0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Column 3: Live Verification Preview */}
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" /> Live Calibrated Readings
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[var(--bg-base)] space-y-1">
                <p className="text-[10px] text-[var(--text-muted)]">Solar Voltage</p>
                <p className="text-xl font-bold font-mono text-yellow-400">
                  {telemetry.solarVoltageV.toFixed(2)} V
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-base)] space-y-1">
                <p className="text-[10px] text-[var(--text-muted)]">Battery Voltage</p>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  {telemetry.batteryVoltageV.toFixed(2)} V
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-base)] space-y-1">
                <p className="text-[10px] text-[var(--text-muted)]">Battery Enclosure Temp</p>
                <p
                  className={`text-xl font-bold font-mono ${
                    telemetry.batteryTempC >= calibration.thermalCutoffThresholdC
                      ? 'text-red-400'
                      : 'text-indigo-400'
                  }`}
                >
                  {telemetry.batteryTempC.toFixed(1)} °C
                </p>
              </div>

              <div className="text-[10px] text-[var(--text-muted)] pt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Live ADC multi-sampling (32x) active on ESP32 Core 0.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
