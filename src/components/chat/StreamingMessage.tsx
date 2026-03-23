"use client";

import { RichContent } from "./RichContent";

interface StreamingMessageProps {
  content: string;
  statusLabel: string;
}

export function StreamingMessage({ content, statusLabel }: StreamingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
        {statusLabel && !content && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 animate-pulse mb-1">
            {statusLabel}
          </p>
        )}
        {content ? (
          <div className="relative">
            {/* isStreaming=true skips rehype-katex and rehype-pretty-code */}
            <RichContent content={content} isStreaming />
            <span className="inline-block h-4 w-0.5 ml-0.5 align-middle bg-zinc-400 animate-pulse" />
          </div>
        ) : (
          <div className="flex gap-1 py-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  );
}
