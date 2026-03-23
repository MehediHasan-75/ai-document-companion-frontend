"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-20 text-center">
      <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
        Failed to load documents
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
