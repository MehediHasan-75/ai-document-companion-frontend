"use client";

import { useToastStore } from "@/store/toastStore";

const variantStyles = {
  success: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
  error:   "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
  info:    "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm animate-in fade-in slide-in-from-bottom-2 ${variantStyles[t.variant]}`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
