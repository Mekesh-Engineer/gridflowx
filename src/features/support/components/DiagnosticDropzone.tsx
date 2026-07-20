"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AttachedFileItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  type: string;
}

interface DiagnosticDropzoneProps {
  files: AttachedFileItem[];
  onFilesChange: (files: AttachedFileItem[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function DiagnosticDropzone({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
}: DiagnosticDropzoneProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (newFilesList: FileList | File[]) => {
      setErrorMsg(null);
      const addedItems: AttachedFileItem[] = [];

      if (files.length + newFilesList.length > maxFiles) {
        setErrorMsg(`Maximum ${maxFiles} diagnostic files allowed per ticket.`);
        return;
      }

      Array.from(newFilesList).forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setErrorMsg(`File "${file.name}" exceeds the ${maxSizeMB}MB size limit.`);
          return;
        }

        const exists = files.some((f) => f.name === file.name && f.sizeBytes === file.size);
        if (!exists) {
          addedItems.push({
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            file,
            name: file.name,
            sizeBytes: file.size,
            type: file.type || "application/octet-stream",
          });
        }
      });

      if (addedItems.length > 0) {
        onFilesChange([...files, ...addedItems]);
      }
    },
    [files, maxFiles, maxSizeMB, onFilesChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "log" || ext === "txt") return <FileText size={16} className="text-sky-400" />;
    if (ext === "json" || ext === "pcap" || ext === "bin") return <FileCode size={16} className="text-amber-400" />;
    if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) return <ImageIcon size={16} className="text-purple-400" />;
    return <Paperclip size={16} className="text-[var(--primary)]" />;
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-5 transition-all cursor-pointer flex flex-col items-center justify-center text-center group",
          isDragging
            ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_15px_var(--val-shadow-primary)] scale-[1.01]"
            : "border-[var(--border-primary)] bg-[var(--bg-surface)] hover:border-[var(--primary)]/60 hover:bg-[var(--bg-card)]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          className="hidden"
          accept=".log,.txt,.json,.pcap,.png,.jpg,.jpeg,.webp"
        />

        <div className="p-3 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--primary)] mb-2 group-hover:scale-110 transition-transform">
          <UploadCloud size={20} />
        </div>

        <p className="text-xs font-bold text-[var(--text-primary)]">
          Drop diagnostic logs, `.pcap` traces, or oscilloscope screenshots
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
          Or <span className="text-[var(--primary)] font-semibold underline">browse local hardware dumps</span> (Max {maxFiles} files, up to {maxSizeMB}MB each)
        </p>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-500 flex items-center gap-1.5 font-medium px-1">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
              Attached Artifacts ({files.length}/{maxFiles})
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {files.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] group hover:border-[var(--primary)]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)]/50 shrink-0">
                      {getFileIcon(item.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                        <span>{formatSize(item.sizeBytes)}</span>
                        <span>•</span>
                        <span className="text-emerald-500 flex items-center gap-0.5 font-semibold">
                          <CheckCircle2 size={10} /> Ready to append
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0 ml-2"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
