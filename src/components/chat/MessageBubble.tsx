"use client";

import { RichContent } from "./RichContent";
import { SourcePanel } from "./SourcePanel";
import { ThinkingBlock } from "./ThinkingBlock";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className="max-w-[80%] min-w-0 overflow-hidden rounded-2xl px-4 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      ) : (
        <div className="space-y-1 max-w-[80%] min-w-0">
          {message.thinking && (
            <ThinkingBlock content={message.thinking} isStreaming={false} />
          )}
          <div className="min-w-0 overflow-hidden rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800">
            <RichContent content={message.content} />
            {message.sources && message.sources.length > 0 && (
              <SourcePanel sources={message.sources} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
