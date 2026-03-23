import type { FileStatus } from "@/types/file";

interface StatusBadgeProps {
  status: FileStatus;
}

const config: Record<FileStatus, { label: string; className: string }> = {
  uploaded:   { label: "Uploaded",    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
  processing: { label: "Processing",  className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse" },
  processed:  { label: "Ready",       className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  failed:     { label: "Failed",      className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  deleted:    { label: "Deleted",     className: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status] ?? config.uploaded;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}
