"use client";

import { useEffect, useRef, useState } from "react";

interface ThinkingBlockProps {
  content: string;
  isStreaming: boolean; // true while thinking tokens are still arriving
}

export function ThinkingBlock({ content, isStreaming }: ThinkingBlockProps) {
  const [open, setOpen] = useState(false);
  const wasStreamingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-open when thinking starts; auto-close when answer starts
  useEffect(() => {
    if (isStreaming) {
      wasStreamingRef.current = true;
      setOpen(true);
    } else if (wasStreamingRef.current) {
      wasStreamingRef.current = false;
      setOpen(false);
    }
  }, [isStreaming]);

  // Auto-scroll the thinking box to the bottom as tokens arrive
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  if (!content) return null;

  return (
    <div className="flex justify-start mb-1">
      <div className="max-w-[80%] min-w-0">
        {/* Header row */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {isStreaming ? (
            // Pulsing brain icon while thinking
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-violet-400 animate-pulse"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-violet-400 font-medium animate-pulse">Thinking…</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-violet-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-violet-400 font-medium">Thought</span>
            </span>
          )}

          {/* Chevron */}
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Collapsible content */}
        {open && (
          <div ref={scrollRef} className="mt-1.5 px-3 py-2.5 rounded-xl border border-violet-200 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 max-h-64 overflow-y-auto">
            <pre className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap break-words">
              {content}
              {isStreaming && (
                <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-violet-400 animate-pulse rounded-sm" />
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
