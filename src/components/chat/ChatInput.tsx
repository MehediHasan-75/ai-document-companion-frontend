"use client";

import { useState } from "react";

interface ChatInputProps {
  onSend: (question: string) => void;
  onAbort: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export function ChatInput({ onSend, onAbort, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-end gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents…"
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 max-h-40"
          style={{ minHeight: "24px" }}
        />
        {isStreaming ? (
          <button
            onClick={onAbort}
            className="rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shrink-0"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors shrink-0"
          >
            Send
          </button>
        )}
      </div>
      <p className="mt-1.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
