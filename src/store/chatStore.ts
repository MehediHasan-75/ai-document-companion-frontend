import { create } from "zustand";
import type { Message } from "@/types/chat";

interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  statusLabel: string;
  partialContent: string;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  setStreaming: (v: boolean) => void;
  setStatusLabel: (v: string) => void;
  appendPartial: (token: string) => void;
  clearPartial: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  statusLabel: "",
  partialContent: "",
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStatusLabel: (statusLabel) => set({ statusLabel }),
  appendPartial: (token) =>
    set((s) => ({ partialContent: s.partialContent + token })),
  clearPartial: () => set({ partialContent: "", statusLabel: "" }),
}));
