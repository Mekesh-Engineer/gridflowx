'use client';

import React, { useState } from 'react';
import { FileText, Download, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportGeneratorPage() {
  const [reportType, setReportType] = useState('executive_summary');
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success(`Generated ${reportType.toUpperCase()} report in ${format.toUpperCase()} format.`);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Automated Report Generator</h1>
        <p className="text-xs text-[var(--text-muted)]">Configure compliance, operational & financial reports with automated email schedules</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4 max-w-xl">
        <div>
          <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Report Type</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs">
            <option value="executive_summary">Executive Performance Summary</option>
            <option value="audit_ledger">Full Cryptographic Audit Ledger</option>
            <option value="carbon_esg">ESG Carbon Offset & Yield Report</option>
            <option value="telemetry_raw">Raw Telemetry Time-Series Export</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Output Format</label>
          <select value={format} onChange={e => setFormat(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/40 text-xs">
            <option value="pdf">PDF Document (.pdf)</option>
            <option value="csv">CSV Spreadsheet (.csv)</option>
            <option value="excel">Excel Workbook (.xlsx)</option>
          </select>
        </div>

        <button
          disabled={generating}
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> {generating ? 'Building PDF Document...' : 'Generate & Download Report'}
        </button>
      </div>
    </div>
  );
}
