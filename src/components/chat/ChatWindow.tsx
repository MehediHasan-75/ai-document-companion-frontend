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
  docId?: string | undefined;
}

export function ChatWindow({ conversationId, docId }: ChatWindowProps) {
  const {
    messages,
    isStreaming,
    statusLabel,
    statusHistory,
    partialContent,
    setMessages,
    sendMessage,
    abort,
  } = useStreamingChat(conversationId, docId);

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
      {/* Doc filter banner */}
      {docId && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/20 text-xs text-primary shrink-0">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Searching within selected document only
        </div>
      )}

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
            statusHistory={statusHistory}
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
