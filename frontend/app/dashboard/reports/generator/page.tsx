'use client';

import React, { useState } from 'react';
import { FileText, Download, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { generateNewReport, downloadReportCsv, OperationalReport } from '@/features/reports/services/report.service';
import { toast } from 'sonner';

export default function ReportGeneratorPage() {
  const [reportType, setReportType] = useState('Daily Microgrid Operational & Energy Summary');
  const [format, setFormat] = useState('csv');
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<OperationalReport | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const rep = await generateNewReport(reportType);
      setGeneratedReport(rep);
      downloadReportCsv(rep);
      toast.success(`Generated and downloaded report: ${rep.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Automated Operational Report Generator</h1>
        <p className="text-xs text-[var(--text-muted)]">
          Synthesizes Solar PV yield, BESS health, load consumption & Time-of-Use financial savings into exportable formats
        </p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4 max-w-xl">
        <div>
          <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Report Scope & Template</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="Daily Microgrid Operational & Energy Summary">Daily Microgrid Operational & Energy Summary (24h)</option>
            <option value="Weekly Executive Compliance & Yield Summary">Weekly Executive Compliance & Yield Summary</option>
            <option value="Monthly Decarbonization & Financial ROI Audit">Monthly Decarbonization & Financial ROI Audit</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Output Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="csv">CSV Spreadsheet (.csv)</option>
            <option value="pdf">PDF Document (.pdf)</option>
          </select>
        </div>

        <button
          disabled={generating}
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
        >
          <Download className="w-4 h-4" />
          {generating ? 'Compiling Metrics & Exporting...' : 'Generate & Download Report'}
        </button>

        {generatedReport && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 space-y-1">
            <p className="font-bold">✓ Report {generatedReport.id} Successfully Compiled</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              Solar Yield: {generatedReport.totalSolarGeneratedKwh} kWh · Savings: ${generatedReport.totalFinancialSavingsUsd} · CO₂: {generatedReport.co2DisplacedKg} kg
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
