"use client";

import { useEffect, useRef, useState } from "react";
import { conversationsApi } from "@/api/conversations";
import { useChatStore } from "@/store/chatStore";
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
    thinkingContent,
    setMessages,
    sendMessage,
    abort,
  } = useStreamingChat(conversationId, docId);

  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const isStreamingRef = useRef(false);
  const loadedRef = useRef<string | null>(null);

  // Load message history when conversation changes
  useEffect(() => {
    if (loadedRef.current === conversationId) return;
    loadedRef.current = conversationId;

    // If this conversation is still streaming in the background, just show
    // what's already in the store — history is up to date and stream is live.
    const { isStreaming, streamingConversationId, conversationMessages } = useChatStore.getState();
    if (isStreaming && streamingConversationId === conversationId) {
      setHistoryLoading(false);
      return;
    }

    // If we already have messages cached for this conversation, use them
    // immediately (no flash of empty state) while silently refreshing in background.
    const cached = conversationMessages[conversationId];
    if (cached && cached.length > 0) {
      setHistoryLoading(false);
    } else {
      setHistoryLoading(true);
    }

    conversationsApi
      .messages(conversationId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setHistoryLoading(false));
  }, [conversationId, setMessages]);

  // Keep isStreamingRef in sync so scroll handler can read it without stale closure
  useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);

  // Disable auto-scroll the moment the user touches the wheel/trackpad/touch,
  // re-enable it only when they scroll back within 80px of the bottom.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onUserScrollIntent = () => { autoScrollRef.current = false; };
    const onScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
        autoScrollRef.current = true;
        if (isStreamingRef.current) el.scrollTop = el.scrollHeight; // catch up during streaming only
      }
    };

    el.addEventListener("wheel", onUserScrollIntent, { passive: true });
    el.addEventListener("touchstart", onUserScrollIntent, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", onUserScrollIntent);
      el.removeEventListener("touchstart", onUserScrollIntent);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Auto-scroll as tokens arrive — instant so it can't fight user input
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (autoScrollRef.current && el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, partialContent, thinkingContent]);

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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
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
            thinkingContent={thinkingContent}
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
