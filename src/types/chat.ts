export interface Source {
  doc_id: string | null;
  type: "text" | "table" | "image";
  summary: string;
  original: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: Source[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
}

// SSE event union — exhaustive, no fallthrough
export type SSEEvent =
  | { type: "status";   content: string }
  | { type: "delta";    content: string }
  | { type: "complete"; content: string; conversation_id: string; sources: Source[] }
  | { type: "error";    content: string };
