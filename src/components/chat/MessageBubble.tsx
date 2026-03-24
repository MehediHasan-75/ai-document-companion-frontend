"use client";

import { RichContent } from "./RichContent";
import { SourcePanel } from "./SourcePanel";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] min-w-0 overflow-hidden rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-zinc-100 dark:bg-zinc-800"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <>
            <RichContent content={message.content} />
            {message.sources && message.sources.length > 0 && (
              <SourcePanel sources={message.sources} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
