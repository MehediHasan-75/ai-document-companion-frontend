import { useEffect, useState } from "react";
import { filesApi } from "@/api/files";
import type { FileStatus } from "@/types/file";

const TERMINAL: FileStatus[] = ["processed", "failed", "deleted"];
const POLL_INTERVAL_MS = 3000;

export function useFileStatus(fileId: string, initial: FileStatus) {
  const [status, setStatus] = useState<FileStatus>(initial);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (TERMINAL.includes(initial)) return;

    const interval = setInterval(async () => {
      try {
        const data = await filesApi.status(fileId);
        setStatus(data.status);
        setError(data.error);
        if (TERMINAL.includes(data.status)) clearInterval(interval);
      } catch {
        clearInterval(interval);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fileId, initial]);

  return { status, error };
}
