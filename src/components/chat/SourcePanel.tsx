"use client";

import { useState } from "react";
import type { Source } from "@/types/chat";

interface SourcePanelProps {
  sources: Source[];
}

const typeBadge: Record<Source["type"], string> = {
  text:  "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
  table: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  image: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
};

export function SourcePanel({ sources }: SourcePanelProps) {
  const [open, setOpen] = useState(false);

  if (!sources.length) return null;

  return (
    <div className="mt-3 border-t border-zinc-200 dark:border-zinc-700 pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {open ? "Hide" : "Show"} {sources.length} source{sources.length !== 1 ? "s" : ""}
      </button>

      {open && (
        <ol className="mt-2 space-y-2">
          {sources.map((src, i) => (
            <li
              key={i}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3"
            >
              {/* Header row */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                  [{i + 1}]
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${typeBadge[src.type]}`}
                >
                  {src.type}
                </span>
                {src.doc_id && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                    {src.doc_id}
                  </span>
                )}
              </div>

              {/* Summary */}
              {src.summary && (
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                  {src.summary}
                </p>
              )}

              {/* Original content preview */}
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-4 leading-relaxed">
                {src.original}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
