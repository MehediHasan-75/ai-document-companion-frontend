"use client";

import { RichContent } from "./RichContent";

interface StreamingMessageProps {
  content: string;
  statusLabel: string;
  statusHistory: string[];
}

export function StreamingMessage({ content, statusLabel, statusHistory }: StreamingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 space-y-2">

        {/* Pipeline steps — visible until streaming completes */}
        {statusHistory.length > 0 && (
          <ul className="space-y-1">
            {statusHistory.map((step, i) => {
              const isActive = step === statusLabel && !content;
              const isDone = content || step !== statusLabel;
              return (
                <li key={i} className="flex items-center gap-2">
                  {isDone ? (
                    // Completed step — green checkmark
                    <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    // Active step — spinning indicator
                    <svg className="w-3 h-3 text-primary animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    // Pending step — grey dot
                    <span className="w-3 h-3 rounded-full border border-zinc-400 dark:border-zinc-500 shrink-0" />
                  )}
                  <span className={`text-xs ${
                    isActive
                      ? "text-primary font-medium animate-pulse"
                      : isDone
                      ? "text-zinc-500 dark:text-zinc-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {/* Streaming tokens or bounce dots */}
        {content ? (
          <div className="relative pt-1 border-t border-zinc-200 dark:border-zinc-700">
            <RichContent content={content} isStreaming />
            <span className="inline-block h-4 w-0.5 ml-0.5 align-middle bg-zinc-400 animate-pulse" />
          </div>
        ) : (
          <div className="flex gap-1 items-center pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  );
}
