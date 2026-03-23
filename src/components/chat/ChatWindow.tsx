"use client";

import { useEffect, useRef, useState } from "react";
import { conversationsApi } from "@/api/conversations";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { MessageBubble } from "./MessageBubble";
import { StreamingMessage } from "./StreamingMessage";
import { ChatInput } from "./ChatInput";
import { Skeleton } from "@/components/ui/Skeleton";

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const {
    messages,
    isStreaming,
    statusLabel,
    partialContent,
    setMessages,
    sendMessage,
    abort,
  } = useStreamingChat(conversationId);

  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef<string | null>(null);

  // Load message history when conversation changes
  useEffect(() => {
    if (loadedRef.current === conversationId) return;
    loadedRef.current = conversationId;

    setHistoryLoading(true);
    setMessages([]);
    conversationsApi
      .messages(conversationId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setHistoryLoading(false));
  }, [conversationId, setMessages]);

  // Auto-scroll as tokens arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partialContent]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {historyLoading ? (
          <div className="space-y-4">
            <div className="flex justify-end"><Skeleton className="h-10 w-48 rounded-2xl" /></div>
            <div className="flex justify-start"><Skeleton className="h-16 w-64 rounded-2xl" /></div>
            <div className="flex justify-end"><Skeleton className="h-10 w-36 rounded-2xl" /></div>
            <div className="flex justify-start"><Skeleton className="h-24 w-72 rounded-2xl" /></div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        {isStreaming && (
          <StreamingMessage
            content={partialContent}
            statusLabel={statusLabel}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={(q) => void sendMessage(q)}
        onAbort={abort}
        isStreaming={isStreaming}
        disabled={false}
      />
    </div>
  );
}
