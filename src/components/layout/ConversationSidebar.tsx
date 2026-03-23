"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { useConversationStore } from "@/store/conversationStore";

interface ConversationSidebarProps {
  onNavigate?: () => void;
}

export function ConversationSidebar({ onNavigate }: ConversationSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { conversations, createConversation, deleteConversation } = useConversations();
  const setActiveId = useConversationStore((s) => s.setActiveId);

  async function handleNew() {
    const id = await createConversation();
    if (id) {
      setActiveId(id);
      router.push(`/chat/${id}`);
      onNavigate?.();
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      {/* Actions */}
      <div className="p-3 space-y-2">
        <button
          onClick={handleNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
        <Link
          href="/dashboard"
          onClick={() => onNavigate?.()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Manage Files
        </Link>
      </div>

      <div className="mx-3 border-t border-zinc-200 dark:border-zinc-800" />

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.length === 0 ? (
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-6 px-2">
            Ask your first question to create a conversation
          </p>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => {
              const isActive = pathname === `/chat/${conv.id}`;
              return (
                <div key={conv.id} className="group relative">
                  <Link
                    href={`/chat/${conv.id}`}
                    onClick={() => {
                      setActiveId(conv.id);
                      onNavigate?.();
                    }}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="flex-1 truncate pr-6">
                      {conv.title ?? "New Conversation"}
                    </span>
                  </Link>
                  <button
                    onClick={() => void deleteConversation(conv.id)}
                    title="Delete"
                    className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex p-1 text-zinc-400 hover:text-red-500 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
