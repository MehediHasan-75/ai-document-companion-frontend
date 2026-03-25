import { useCallback, useRef } from "react";
import { getToken } from "@/utils/token";
import { parseSSEChunk } from "@/utils/sse";
import { useChatStore } from "@/store/chatStore";
import type { Message } from "@/types/chat";

// Module-level so any hook instance (any chat page) can cancel the in-flight stream.
let activeController: AbortController | null = null;

export function useStreamingChat(conversationId: string, docId?: string) {
  const {
    conversationMessages,
    isStreaming,
    streamingConversationId,
    statusLabel,
    statusHistory,
    partialContent,
    thinkingContent,
    setMessages,
    addMessage,
    setStreaming,
    setStatusLabel,
    appendPartial,
    appendThinking,
    clearPartial,
  } = useChatStore();

  // Messages and streaming state scoped to this conversation
  const messages = conversationMessages[conversationId] ?? [];
  const thisConversationIsStreaming = isStreaming && streamingConversationId === conversationId;

  const bufferRef = useRef("");

  const processEvents = useCallback(
    (chunk: string) => {
      for (const event of parseSSEChunk(chunk)) {
        if (event.type === "status") {
          setStatusLabel(event.content);
        } else if (event.type === "thinking") {
          appendThinking(event.content);
        } else if (event.type === "delta") {
          appendPartial(event.content);
        } else if (event.type === "complete") {
          const thinking = useChatStore.getState().thinkingContent || undefined;
          const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: event.content,
            thinking,
            sources: event.sources,
            images: event.images,
            created_at: new Date().toISOString(),
          };
          addMessage(conversationId, assistantMsg);
          clearPartial();
          setStreaming(false);
        } else if (event.type === "error") {
          const errorMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${event.content}`,
            created_at: new Date().toISOString(),
          };
          addMessage(conversationId, errorMsg);
          clearPartial();
          setStreaming(false);
        }
      }
    },
    [conversationId, addMessage, appendPartial, appendThinking, clearPartial, setStatusLabel, setStreaming]
  );

  const sendMessage = useCallback(
    async (question: string) => {
      // Cancel any in-flight stream from any conversation before starting a new one
      activeController?.abort();
      activeController = new AbortController();
      const { signal } = activeController;

      // Optimistically add user message
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        created_at: new Date().toISOString(),
      };
      addMessage(conversationId, userMsg);
      setStreaming(true, conversationId);
      setStatusLabel("Connecting…");
      clearPartial();
      bufferRef.current = "";

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
            signal,
          }
        );

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          bufferRef.current += decoder.decode(value, { stream: true });
          const lastNewline = bufferRef.current.lastIndexOf("\n");
          if (lastNewline === -1) continue;

          const complete = bufferRef.current.slice(0, lastNewline + 1);
          bufferRef.current = bufferRef.current.slice(lastNewline + 1);
          processEvents(complete);
        }

        // Flush any remaining buffer (final chunk may lack trailing newline)
        if (bufferRef.current.trim()) {
          processEvents(bufferRef.current);
          bufferRef.current = "";
        }
      } catch (err: unknown) {
        // Abort is intentional — don't show an error message
        if (err instanceof Error && err.name === "AbortError") {
          clearPartial();
          setStreaming(false);
          return;
        }
        const text = err instanceof Error ? err.message : "Something went wrong";
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${text}`,
          created_at: new Date().toISOString(),
        };
        addMessage(conversationId, errorMsg);
        clearPartial();
        setStreaming(false);
      }
    },
    [conversationId, docId, addMessage, setStreaming, setStatusLabel, clearPartial, processEvents]
  );

  const abort = useCallback(() => {
    activeController?.abort();
    activeController = null;
    clearPartial();
    setStreaming(false);
  }, [clearPartial, setStreaming]);

  return {
    messages,
    isStreaming: thisConversationIsStreaming,
    statusLabel,
    statusHistory,
    partialContent,
    thinkingContent,
    setMessages: (msgs: Message[]) => setMessages(conversationId, msgs),
    sendMessage,
    abort,
  };
}
