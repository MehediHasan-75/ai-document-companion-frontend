"use client";

import { useRef, useState } from "react";
import { filesApi } from "@/api/files";
import { useFileStore } from "@/store/fileStore";
import { toast } from "@/store/toastStore";

const ACCEPT = ".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,.html,.json";

export function FileUploader() {
  const { addFile, uploading, setUploading } = useFileStore();
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) void upload(file);
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void upload(file);
    e.target.value = "";
  }

  async function upload(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const res = await filesApi.upload(file);
      addFile({
        id: res.file_id,
        filename: file.name,
        status: "uploaded",
        type: "other",
        created_at: new Date().toISOString(),
      });
      setMessage({ ok: true, text: `"${file.name}" uploaded successfully.` });
      toast(`"${file.name}" uploaded successfully.`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setMessage({ ok: false, text: msg });
      toast(`Upload failed: ${msg}`, "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Uploading…</p>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 text-zinc-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Drop a file here or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              PDF, DOCX, PPTX, XLSX, CSV, TXT, MD, HTML, JSON
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleSelect}
          className="hidden"
        />
      </div>

      {message && (
        <p className={`mt-3 text-sm px-3 py-2 rounded-lg ${
          message.ok
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
        }`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
