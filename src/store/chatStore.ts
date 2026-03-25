import { create } from "zustand";
import type { Message } from "@/types/chat";

interface ChatStore {
  conversationMessages: Record<string, Message[]>;
  isStreaming: boolean;
  streamingConversationId: string | null;
  statusLabel: string;
  statusHistory: string[];
  partialContent: string;
  thinkingContent: string;
  setMessages: (conversationId: string, msgs: Message[]) => void;
  addMessage: (conversationId: string, msg: Message) => void;
  setStreaming: (v: boolean, conversationId?: string) => void;
  setStatusLabel: (v: string) => void;
  appendPartial: (token: string) => void;
  appendThinking: (token: string) => void;
  clearPartial: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversationMessages: {},
  isStreaming: false,
  streamingConversationId: null,
  statusLabel: "",
  statusHistory: [],
  partialContent: "",
  thinkingContent: "",
  setMessages: (conversationId, messages) =>
    set((s) => ({
      conversationMessages: { ...s.conversationMessages, [conversationId]: messages },
    })),
  addMessage: (conversationId, msg) =>
    set((s) => ({
      conversationMessages: {
        ...s.conversationMessages,
        [conversationId]: [...(s.conversationMessages[conversationId] ?? []), msg],
      },
    })),
  setStreaming: (isStreaming, conversationId) =>
    set({ isStreaming, streamingConversationId: isStreaming ? (conversationId ?? null) : null }),
  setStatusLabel: (statusLabel) =>
    set((s) => ({
      statusLabel,
      statusHistory: s.statusHistory.includes(statusLabel)
        ? s.statusHistory
        : [...s.statusHistory, statusLabel],
    })),
  appendPartial: (token) =>
    set((s) => ({ partialContent: s.partialContent + token })),
  appendThinking: (token) =>
    set((s) => ({ thinkingContent: s.thinkingContent + token })),
  clearPartial: () => set({
    partialContent: "",
    statusLabel: "",
    statusHistory: [],
    thinkingContent: "",
  }),
}));
