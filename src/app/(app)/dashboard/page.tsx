"use client";

import { useEffect, useState } from "react";
import { filesApi } from "@/api/files";
import { useFileStore } from "@/store/fileStore";
import { FileUploader } from "@/components/files/FileUploader";
import { FileCard } from "@/components/files/FileCard";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function DashboardPage() {
  const { files, setFiles } = useFileStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filesApi
      .list()
      .then((res) => setFiles(res.files))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setFiles]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Documents</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Upload and manage your files
          </p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Go to Chat
        </Link>
      </div>

      {/* Upload */}
      <section>
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Upload a file</h2>
        <FileUploader />
      </section>

      {/* File list */}
      <section>
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          Your files
          {files.length > 0 && (
            <span className="ml-2 text-zinc-400 font-normal">({files.length})</span>
          )}
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Skeleton className="w-9 h-9 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-14 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No files yet</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Upload a document to start. Supported: PDF, DOCX, PPTX, XLSX, CSV, TXT, MD, HTML, JSON
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <FileCard key={f.id} file={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
