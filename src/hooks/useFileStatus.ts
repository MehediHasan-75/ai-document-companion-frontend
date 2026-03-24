import { useEffect, useRef, useState } from "react";
import { filesApi } from "@/api/files";
import type { FileStatus } from "@/types/file";

const TERMINAL: FileStatus[] = ["processed", "failed", "deleted"];
const POLL_INTERVAL_MS = 3000;
const STUCK_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function useFileStatus(fileId: string, initial: FileStatus) {
  const [status, setStatus] = useState<FileStatus>(initial);
  const [error, setError] = useState<string | undefined>();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAt = useRef<number | null>(null);

  // Elapsed timer — ticks every second while processing
  useEffect(() => {
    if (TERMINAL.includes(status)) {
      startedAt.current = null;
      return;
    }
    if (startedAt.current === null) {
      startedAt.current = Date.now();
    }
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Status polling
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

  const isStuck = status === "processing" && elapsedSeconds * 1000 >= STUCK_THRESHOLD_MS;

  return { status, error, elapsedSeconds, isStuck };
}
