"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFileStatus } from "@/hooks/useFileStatus";
import { StatusBadge } from "./StatusBadge";
import { filesApi } from "@/api/files";
import { conversationsApi } from "@/api/conversations";
import { useFileStore } from "@/store/fileStore";
import { useConversationStore } from "@/store/conversationStore";
import { toast } from "@/store/toastStore";
import type { Document } from "@/types/file";

interface FileCardProps {
  file: Document;
}

export function FileCard({ file }: FileCardProps) {
  const { status, error } = useFileStatus(file.id, file.status);
  const { updateFileStatus, removeFile } = useFileStore();
  const addConversation = useConversationStore((s) => s.addConversation);
  const setActiveId = useConversationStore((s) => s.setActiveId);
  const router = useRouter();
  const [starting, setStarting] = useState(false);

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

  async function handleAsk() {
    setStarting(true);
    try {
      const conv = await conversationsApi.create(`Questions about ${file.filename}`);
      addConversation(conv);
      setActiveId(conv.id);
      router.push(`/chat/${conv.id}`);
    } catch {
      toast("Could not start a conversation", "error");
      setStarting(false);
    }
  }

  const isProcessed = status === "processed";

  return (
    <div className={`flex flex-col bg-white dark:bg-zinc-900 rounded-xl border transition-colors ${
      isProcessed
        ? "border-green-200 dark:border-green-900/50"
        : "border-zinc-200 dark:border-zinc-800"
    }`}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isProcessed ? "bg-green-50 dark:bg-green-900/20" : "bg-primary/10"
        }`}>
          <svg className={`w-5 h-5 ${isProcessed ? "text-green-600 dark:text-green-400" : "text-primary"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {file.filename}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <StatusBadge status={status} />
            {error && (
              <span className="text-[11px] text-red-500 truncate">{error}</span>
            )}
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {new Date(file.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Stats row */}
          {isProcessed && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {file.page_count != null && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {file.page_count} {file.page_count === 1 ? "page" : "pages"}
                </span>
              )}
              {file.chunk_count != null && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
                  </svg>
                  {file.chunk_count} chunks
                </span>
              )}
              {file.image_count != null && file.image_count > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {file.image_count} {file.image_count === 1 ? "image" : "images"}
                </span>
              )}
              {file.table_count != null && file.table_count > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
                  </svg>
                  {file.table_count} {file.table_count === 1 ? "table" : "tables"}
                </span>
              )}
              {file.file_size != null && (
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {file.file_size < 1024 * 1024
                    ? `${Math.round(file.file_size / 1024)} KB`
                    : `${(file.file_size / (1024 * 1024)).toFixed(1)} MB`}
                </span>
              )}
            </div>
          )}
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

      {/* Ready CTA — only when processed */}
      {isProcessed && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-green-100 dark:border-green-900/40 bg-green-50/50 dark:bg-green-900/10 rounded-b-xl">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-green-700 dark:text-green-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Ready for questions
          </span>
          <button
            onClick={() => void handleAsk()}
            disabled={starting}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50 transition-opacity"
          >
            {starting ? "Starting…" : "Ask something about this document"}
            {!starting && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
