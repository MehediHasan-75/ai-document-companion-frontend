import type { FileStatus } from "@/types/file";

interface StatusBadgeProps {
  status: FileStatus;
  elapsedSeconds?: number;
  isStuck?: boolean;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function StatusBadge({ status, elapsedSeconds, isStuck }: StatusBadgeProps) {
  if (status === "processing") {
    if (isStuck) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Stuck · {elapsedSeconds != null ? formatElapsed(elapsedSeconds) : ""}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <svg className="w-2.5 h-2.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Processing{elapsedSeconds != null && elapsedSeconds > 0 ? ` · ${formatElapsed(elapsedSeconds)}` : ""}
      </span>
    );
  }

  const config: Partial<Record<FileStatus, { label: string; className: string }>> = {
    uploaded:  { label: "Uploaded", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
    processed: { label: "Ready",    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    failed:    { label: "Failed",   className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    deleted:   { label: "Deleted",  className: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600" },
  };

  const { label, className } = config[status] ?? { label: status, className: "bg-zinc-100 text-zinc-500" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}
