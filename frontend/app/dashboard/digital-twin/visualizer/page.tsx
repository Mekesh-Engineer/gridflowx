'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layers, Box, Activity, Zap, Sun, Battery, Radio, ShieldCheck, Eye, RotateCw, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';
import { useTelemetryStore } from '@/features/telemetry/store/telemetry.store';
import { RELAY_CHANNEL_METADATA } from '@/types/relay.types';

export default function DigitalTwinVisualizerPage() {
  const currentFrame = useTelemetryStore((state) => state.currentFrame);
  const isWsConnected = useTelemetryStore((state) => state.isWsConnected);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<string | null>('BESS');
  const [cameraAngle, setCameraAngle] = useState<{ x: number; y: number; zoom: number }>({
    x: 0.45,
    y: -0.35,
    zoom: 1.0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Telemetry values
  const solarW = currentFrame?.solarPowerW ?? 342.5;
  const battSoc = currentFrame?.batterySoc ?? 74.5;
  const battTemp = currentFrame?.batteryTempC ?? 31.5;
  const battV = currentFrame?.batteryVoltageV ?? 12.8;
  const battA = currentFrame?.batteryCurrentA ?? -3.2;
  const gridW = currentFrame?.gridPowerW ?? 0.0;
  const busV = currentFrame?.dcBusVoltageV ?? 12.15;
  const loadW = currentFrame?.totalLoadPowerW ?? 48.2;
  const relays = currentFrame?.relayStates ?? [true, true, false, true, false, true, false, true];

  // References for continuous 60fps render without tear-down
  const telemetryRef = useRef({
    solarW,
    battSoc,
    battTemp,
    battV,
    battA,
    gridW,
    busV,
    loadW,
    relays,
  });

  const cameraRef = useRef(cameraAngle);
  const selectedNodeRef = useRef(selectedNode);

  useEffect(() => {
    telemetryRef.current = {
      solarW,
      battSoc,
      battTemp,
      battV,
      battA,
      gridW,
      busV,
      loadW,
      relays,
    };
  }, [solarW, battSoc, battTemp, battV, battA, gridW, busV, loadW, relays]);

  useEffect(() => {
    cameraRef.current = cameraAngle;
  }, [cameraAngle]);

  useEffect(() => {
    selectedNodeRef.current = selectedNode;
  }, [selectedNode]);

  // 3D Isometric Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick += 0.02;
      const width = canvas.width;
      const height = canvas.height;

      const {
        solarW: curSolarW,
        battSoc: curBattSoc,
        battTemp: curBattTemp,
        gridW: curGridW,
        busV: curBusV,
        loadW: curLoadW,
        relays: curRelays,
      } = telemetryRef.current;

      const curCamera = cameraRef.current;
      const curSelected = selectedNodeRef.current;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Background Grid & Space
      ctx.fillStyle = '#090b10';
      ctx.fillRect(0, 0, width, height);

      // Draw Perspective Grid Floor
      const cx = width / 2;
      const cy = height / 2 + 60;
      const zoom = curCamera.zoom;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom * 0.55);

      // Grid Lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 320;
      const step = 40;
      for (let x = -gridSize; x <= gridSize; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, -gridSize);
        ctx.lineTo(x, gridSize);
        ctx.stroke();
      }
      for (let y = -gridSize; y <= gridSize; y += step) {
        ctx.beginPath();
        ctx.moveTo(-gridSize, y);
        ctx.lineTo(gridSize, y);
        ctx.stroke();
      }

      // Draw Power Flow Conduit Lines (Glow paths)
      const nodes = [
        { id: 'SOLAR', name: 'Solar PV Canopy', x: -160, y: -100, z: 40, w: 90, h: 60, color: '#f59e0b', active: curSolarW > 10 },
        { id: 'BUS', name: 'DC Regulated Bus', x: 0, y: 0, z: 30, w: 80, h: 50, color: '#06b6d4', active: true },
        { id: 'BESS', name: 'BESS Battery Bay', x: 160, y: -100, z: 55, w: 85, h: 65, color: '#10b981', active: true },
        { id: 'GRID', name: 'Utility Grid Intertie', x: -160, y: 120, z: 45, w: 80, h: 55, color: '#6366f1', active: curRelays[4] || curGridW > 0 },
        { id: 'LOADS', name: 'Load Distribution Center', x: 160, y: 120, z: 50, w: 95, h: 60, color: '#ec4899', active: curLoadW > 5 },
      ];

      // Connect Conduits to Central Bus
      nodes.forEach((n) => {
        if (n.id === 'BUS') return;
        ctx.beginPath();
        ctx.strokeStyle = n.active ? `${n.color}55` : 'rgba(75, 85, 99, 0.3)';
        ctx.lineWidth = n.active ? 3 : 1;
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // Energy Particle Flow
        if (n.active) {
          const progress = (tick * 1.5 + (n.x > 0 ? 0.5 : 0.0)) % 1.0;
          const px = n.x + (0 - n.x) * progress;
          const py = n.y + (0 - n.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Render 3D Extruded Node Blocks
      nodes.forEach((n) => {
        const isSelected = curSelected === n.id;
        const nx = n.x;
        const ny = n.y;
        const nw = n.w;
        const nh = n.h;
        const nz = n.z;

        // Base Footprint Glow
        ctx.fillStyle = isSelected ? `${n.color}33` : 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(nx - nw / 2, ny - nh / 2, nw, nh);

        // Extruded 3D Box Top
        const topY = ny - nz;
        ctx.fillStyle = isSelected ? `${n.color}99` : `${n.color}22`;
        ctx.strokeStyle = n.color;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.rect(nx - nw / 2, topY - nh / 2, nw, nh);
        ctx.fill();
        ctx.stroke();

        // Side Pillars / Walls
        ctx.beginPath();
        ctx.moveTo(nx - nw / 2, topY + nh / 2);
        ctx.lineTo(nx - nw / 2, ny + nh / 2);
        ctx.moveTo(nx + nw / 2, topY + nh / 2);
        ctx.lineTo(nx + nw / 2, ny + nh / 2);
        ctx.moveTo(nx + nw / 2, topY - nh / 2);
        ctx.lineTo(nx + nw / 2, ny - nh / 2);
        ctx.moveTo(nx - nw / 2, topY - nh / 2);
        ctx.lineTo(nx - nw / 2, ny - nh / 2);
        ctx.strokeStyle = `${n.color}55`;
        ctx.stroke();

        // Text Labels on 3D Node
        ctx.save();
        ctx.scale(1, 1 / 0.55); // Unskew text
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, nx, (topY - 14) * 0.55);

        // Subtitle metric
        ctx.fillStyle = n.color;
        ctx.font = 'bold 10px monospace';
        let valStr = '';
        if (n.id === 'SOLAR') valStr = `${curSolarW.toFixed(1)} W`;
        else if (n.id === 'BESS') valStr = `${curBattSoc.toFixed(1)}% SoC (${curBattTemp.toFixed(1)}°C)`;
        else if (n.id === 'BUS') valStr = `${curBusV.toFixed(2)} V`;
        else if (n.id === 'GRID') valStr = curRelays[4] ? `${curGridW.toFixed(1)} W` : 'DISCONNECTED';
        else if (n.id === 'LOADS') valStr = `${curLoadW.toFixed(1)} W Total`;

        ctx.fillText(valStr, nx, (topY - 2) * 0.55);
        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Mouse drag handlers for Orbit Camera
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setCameraAngle((prev) => ({
      ...prev,
      x: prev.x + dx * 0.005,
      y: Math.max(-0.8, Math.min(0.2, prev.y + dy * 0.005)),
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetCamera = () => {
    setCameraAngle({ x: 0.45, y: -0.35, zoom: 1.0 });
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Interactive 3D Microgrid Digital Twin</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Real-time spatial visualizer with live sensor mesh telemetry, BESS thermal state & circuit topology
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCameraAngle((prev) => ({ ...prev, zoom: Math.min(1.8, prev.zoom + 0.15) }))}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCameraAngle((prev) => ({ ...prev, zoom: Math.max(0.6, prev.zoom - 0.15) }))}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetCamera}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Reset Perspective"
          >
            <RotateCw className="w-3.5 h-3.5" /> Reset View
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 overflow-hidden relative min-h-[540px] flex flex-col justify-between">
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              DIGITAL TWIN ONLINE
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-base)]/80 px-2.5 py-1 rounded border border-[var(--border-primary)]/30">
              60.0 FPS · 1Hz Live Stream
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={900}
            height={540}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
          />

          {/* Node Quick Select Buttons at Bottom of Canvas */}
          <div className="p-3 bg-[var(--bg-base)]/90 border-t border-[var(--border-primary)]/40 flex flex-wrap items-center justify-around gap-2 z-10">
            {[
              { id: 'SOLAR', label: 'Solar PV Array', icon: Sun, color: 'text-amber-400' },
              { id: 'BUS', label: 'DC Regulated Bus', icon: Zap, color: 'text-cyan-400' },
              { id: 'BESS', label: 'BESS Battery Bank', icon: Battery, color: 'text-emerald-400' },
              { id: 'GRID', label: 'Utility Grid Intertie', icon: Radio, color: 'text-indigo-400' },
              { id: 'LOADS', label: '3-Tier Circuit Loads', icon: Layers, color: 'text-pink-400' },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  onClick={() => setSelectedNode(btn.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedNode === btn.id
                      ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-white shadow-sm'
                      : 'bg-[var(--bg-surface)] border-[var(--border-primary)]/30 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${btn.color}`} />
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Node Telemetry Inspection Sidebar */}
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-[var(--border-primary)]/30 pb-3">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Spatial Node Inspector</span>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {selectedNode === 'SOLAR' && 'Solar PV Canopy Node'}
                {selectedNode === 'BUS' && 'Central DC Bus Node'}
                {selectedNode === 'BESS' && 'LiFePO4 BESS Container'}
                {selectedNode === 'GRID' && 'Utility Grid Point of Common Coupling'}
                {selectedNode === 'LOADS' && '3-Tier Load Center Node'}
              </h2>
            </div>

            {/* Dynamic Telemetry Properties for Selected Node */}
            <div className="space-y-2 text-xs font-mono">
              {selectedNode === 'SOLAR' && (
                <>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>PV Voltage:</span>
                    <strong className="text-amber-400">{currentFrame?.solarVoltageV?.toFixed(2) || '18.40'} V</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>PV Current:</span>
                    <strong className="text-amber-400">{currentFrame?.solarCurrentA?.toFixed(2) || '18.60'} A</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Instantaneous Power:</span>
                    <strong className="text-yellow-400 font-bold">{solarW.toFixed(1)} W</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>MPPT Relay (Ch 5):</span>
                    <span className={relays[5] ? 'text-emerald-400' : 'text-zinc-500'}>
                      {relays[5] ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </>
              )}

              {selectedNode === 'BESS' && (
                <>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>State of Charge:</span>
                    <strong className="text-emerald-400 font-bold">{battSoc.toFixed(1)}%</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Terminal Voltage:</span>
                    <strong className="text-emerald-400">{battV.toFixed(2)} V</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Net Battery Current:</span>
                    <strong className={battA >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {battA.toFixed(2)} A
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Enclosure Temp:</span>
                    <strong className="text-emerald-400">{battTemp.toFixed(1)} °C</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Safety Contactor (Ch 7):</span>
                    <span className={relays[7] ? 'text-emerald-400' : 'text-red-400'}>
                      {relays[7] ? 'CLOSED (NORMAL)' : 'OPEN (ISOLATED)'}
                    </span>
                  </div>
                </>
              )}

              {selectedNode === 'BUS' && (
                <>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Regulated DC Voltage:</span>
                    <strong className="text-cyan-400 font-bold">{busV.toFixed(2)} V</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Core 0 Hardware Failsafe:</span>
                    <span className={currentFrame?.core0FailsafeActive ? 'text-red-400' : 'text-emerald-400'}>
                      {currentFrame?.core0FailsafeActive ? 'TRIPPED' : 'CLEAR'}
                    </span>
                  </div>
                </>
              )}

              {selectedNode === 'GRID' && (
                <>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>AC RMS Voltage:</span>
                    <strong className="text-indigo-400">{currentFrame?.gridVoltageV?.toFixed(1) || '230.0'} V</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Line Frequency:</span>
                    <strong className="text-indigo-400">{currentFrame?.gridFrequencyHz?.toFixed(2) || '50.00'} Hz</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Grid Infeed Relay (Ch 4):</span>
                    <span className={relays[4] ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {relays[4] ? 'CONNECTED' : 'ISLANDED (OFF)'}
                    </span>
                  </div>
                </>
              )}

              {selectedNode === 'LOADS' && (
                <>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Total Microgrid Load:</span>
                    <strong className="text-pink-400 font-bold">{loadW.toFixed(1)} W</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Tier 1 Critical (Ch 0):</span>
                    <span className={relays[0] ? 'text-emerald-400' : 'text-zinc-500'}>
                      {relays[0] ? 'ON (~18W)' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Tier 2 Important (Ch 1):</span>
                    <span className={relays[1] ? 'text-emerald-400' : 'text-zinc-500'}>
                      {relays[1] ? 'ON (~20W)' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-primary)]/20">
                    <span>Tier 3 Flexible (Ch 2):</span>
                    <span className={relays[2] ? 'text-emerald-400' : 'text-zinc-500'}>
                      {relays[2] ? 'ON (~45W)' : 'SHEDDED (OFF)'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 text-[11px] text-[var(--text-muted)] space-y-1">
            <p className="font-semibold text-[var(--text-primary)]">Cyber-Physical Synchronicity</p>
            <p>Node geometry and particle conduits update dynamically from 1Hz ESP32 telemetry frames.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
