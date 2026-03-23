"use client";

import { useFileStatus } from "@/hooks/useFileStatus";
import { StatusBadge } from "./StatusBadge";
import { filesApi } from "@/api/files";
import { useFileStore } from "@/store/fileStore";
import { toast } from "@/store/toastStore";
import type { Document } from "@/types/file";

interface FileCardProps {
  file: Document;
}

export function FileCard({ file }: FileCardProps) {
  const { status, error } = useFileStatus(file.id, file.status);
  const { updateFileStatus, removeFile } = useFileStore();

  // Keep store in sync with polled status
  if (status !== file.status) {
    updateFileStatus(file.id, status);
  }

  async function handleProcess() {
    try {
      await filesApi.process(file.id);
      updateFileStatus(file.id, "processing");
      toast(`Processing "${file.filename}"…`, "info");
    } catch {
      toast(`Failed to start processing "${file.filename}"`, "error");
    }
  }

  async function handleDelete() {
    try {
      await filesApi.delete(file.id);
      removeFile(file.id);
      toast(`"${file.filename}" deleted.`, "success");
    } catch {
      toast(`Failed to delete "${file.filename}"`, "error");
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
          {file.filename}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusBadge status={status} />
          {error && (
            <span className="text-[11px] text-red-500 truncate">{error}</span>
          )}
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {new Date(file.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {status === "uploaded" && (
          <button
            onClick={handleProcess}
            className="px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            Process
          </button>
        )}
        <button
          onClick={handleDelete}
          title="Delete file"
          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
