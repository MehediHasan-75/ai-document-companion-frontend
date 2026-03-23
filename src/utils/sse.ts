import type { SSEEvent } from "@/types/chat";

/**
 * Parses a single SSE chunk (may contain multiple `data:` lines)
 * into an array of typed SSEEvent objects.
 */
export function parseSSEChunk(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const raw = line.slice(6).trim();
    if (!raw) continue;

    try {
      const event = JSON.parse(raw) as SSEEvent;
      events.push(event);
    } catch {
      // malformed line — skip
    }
  }

  return events;
}
