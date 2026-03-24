import { create } from "zustand";
import type { Message } from "@/types/chat";

interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  streamingConversationId: string | null;
  statusLabel: string;
  statusHistory: string[];
  partialContent: string;
  thinkingContent: string;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  setStreaming: (v: boolean, conversationId?: string) => void;
  setStatusLabel: (v: string) => void;
  appendPartial: (token: string) => void;
  appendThinking: (token: string) => void;
  clearPartial: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  streamingConversationId: null,
  statusLabel: "",
  statusHistory: [],
  partialContent: "",
  thinkingContent: "",
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
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
