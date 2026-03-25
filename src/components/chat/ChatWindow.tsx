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
  const bottomRef = useRef<HTMLDivElement>(null); // kept as DOM anchor; scroll driven by rAF above
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // true  → keep tracking the bottom as new tokens arrive
  // false → user has scrolled up; leave them there
  const autoScrollRef = useRef(true);
  const loadedRef = useRef<string | null>(null);

  // Pending rAF handle. We store it so we can:
  //  a) skip scheduling a second rAF when one is already queued (coalescing), and
  //  b) cancel it on unmount to avoid a setState on an unmounted component.
  const rafRef = useRef<number | null>(null);

  // Set to true just before we programmatically assign scrollTop so the onScroll
  // handler knows to ignore that event. Without this the handler would read the
  // new scrollTop, decide the user is "near the bottom", and re-enable auto-scroll
  // — or worse, call scrollTop again — creating a re-entrant loop.
  const isProgrammaticScrollRef = useRef(false);

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

  // Smooth scroll to bottom after history finishes loading.
  // We use scrollTo({behavior:'smooth'}) here (not during streaming) because
  // smooth easing feels natural for a one-shot jump to the end of a long
  // conversation. During streaming we keep it instant (see scheduleScrollToBottom)
  // because smooth scroll can't keep up with fast token output.
  useEffect(() => {
    if (historyLoading) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    // Small delay so the DOM has painted the messages before we measure scrollHeight.
    const id = setTimeout(() => {
      autoScrollRef.current = true;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 50);
    return () => clearTimeout(id);
  }, [historyLoading, conversationId]);

  // Register scroll listeners once on mount.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // wheel / touchstart fire *before* scrollTop changes, so we read the actual
    // position one frame later. If the user has scrolled more than 80px from the
    // bottom we disable auto-scroll; otherwise leave it alone (they may just be
    // nudging downward). This replaces the old "disable immediately on any wheel"
    // logic which was too aggressive and broke the case where the user scrolls
    // slightly down at the very bottom of a streaming response.
    const onUserScrollIntent = () => {
      requestAnimationFrame(() => {
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distFromBottom > 80) {
          autoScrollRef.current = false;
        }
      });
    };

    const onScroll = () => {
      // Ignore events we triggered ourselves — they carry no intent signal.
      if (isProgrammaticScrollRef.current) return;

      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

      // Re-enable auto-scroll when the user manually scrolls back near the bottom.
      // We do NOT forcibly snap to the bottom here; the next token's useEffect will
      // do that via scheduleScrollToBottom, keeping all DOM writes in one place.
      autoScrollRef.current = distFromBottom <= 80;
    };

    el.addEventListener("wheel", onUserScrollIntent, { passive: true });
    el.addEventListener("touchstart", onUserScrollIntent, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", onUserScrollIntent);
      el.removeEventListener("touchstart", onUserScrollIntent);
      el.removeEventListener("scroll", onScroll);
      // Cancel any pending rAF so it doesn't fire after unmount.
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Coalesced auto-scroll: called on every content update but executes at most
  // once per animation frame. The key insight is that during fast streaming the
  // React render loop can produce many state updates per frame. Without rAF
  // batching each update would write scrollTop separately, causing the browser to
  // interrupt its own compositing pass and producing the characteristic micro-stutter.
  // By guarding with "if rafRef.current !== null return" we ensure only the first
  // call per frame schedules the work; subsequent calls within the same frame are
  // no-ops. The rAF callback then performs exactly one scrollTop write at the
  // start of the next paint, which the compositor can handle in a single pass.
  useEffect(() => {
    if (!autoScrollRef.current) return;
    if (rafRef.current !== null) return; // already queued for this frame — skip

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = scrollContainerRef.current;
      if (!el || !autoScrollRef.current) return;

      // Flag set before the write so our onScroll handler ignores this event.
      isProgrammaticScrollRef.current = true;
      el.scrollTop = el.scrollHeight;

      // Clear the flag after the scroll event has had a chance to fire.
      // One rAF is enough — scroll events are synchronous with the frame.
      requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
    });
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
