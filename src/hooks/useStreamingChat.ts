import { useCallback, useRef } from "react";
import { getToken } from "@/utils/token";
import { parseSSEChunk } from "@/utils/sse";
import { useChatStore } from "@/store/chatStore";
import type { Message } from "@/types/chat";

export function useStreamingChat(conversationId: string, docId?: string) {
  const {
    messages,
    isStreaming,
    statusLabel,
    statusHistory,
    partialContent,
    setMessages,
    addMessage,
    setStreaming,
    setStatusLabel,
    appendPartial,
    clearPartial,
  } = useChatStore();

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const sendMessage = useCallback(
    async (question: string) => {
      // Optimistically add user message
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        created_at: new Date().toISOString(),
      };
      addMessage(userMsg);
      setStreaming(true);
      setStatusLabel("Connecting…");
      clearPartial();

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/conversations/${conversationId}/ask`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken() ?? ""}`,
            },
            body: JSON.stringify({
              question,
              ...(docId ? { doc_ids: [docId] } : {}),
            }),
          }
        );

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const events = parseSSEChunk(chunk);

          for (const event of events) {
            if (event.type === "status") {
              setStatusLabel(event.content);
            } else if (event.type === "delta") {
              appendPartial(event.content);
            } else if (event.type === "complete") {
              const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: event.content,
                sources: event.sources,
                created_at: new Date().toISOString(),
              };
              addMessage(assistantMsg);
              clearPartial();
              setStreaming(false);
            } else if (event.type === "error") {
              const errorMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `Error: ${event.content}`,
                created_at: new Date().toISOString(),
              };
              addMessage(errorMsg);
              clearPartial();
              setStreaming(false);
            }
          }
        }
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : "Something went wrong";
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${text}`,
          created_at: new Date().toISOString(),
        };
        addMessage(errorMsg);
        clearPartial();
        setStreaming(false);
      }
    },
    [conversationId, docId, addMessage, setStreaming, setStatusLabel, appendPartial, clearPartial]
  );

  const abort = useCallback(() => {
    readerRef.current?.cancel();
    readerRef.current = null;
    clearPartial();
    setStreaming(false);
  }, [clearPartial, setStreaming]);

  return {
    messages,
    isStreaming,
    statusLabel,
    statusHistory,
    partialContent,
    setMessages,
    sendMessage,
    abort,
  };
}
