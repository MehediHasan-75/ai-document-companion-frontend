import { create } from "zustand";
import type { Conversation } from "@/types/chat";

interface ConversationStore {
  conversations: Conversation[];
  activeId: string | null;
  setConversations: (list: Conversation[]) => void;
  addConversation: (c: Conversation) => void;
  removeConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  setActiveId: (id: string | null) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  activeId: null,
  setConversations: (conversations) => set({ conversations }),
  addConversation: (c) => set((s) => ({ conversations: [c, ...s.conversations] })),
  removeConversation: (id) =>
    set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),
  renameConversation: (id, title) =>
    set((s) => ({
      conversations: s.conversations.map((c) => c.id === id ? { ...c, title } : c),
    })),
  setActiveId: (activeId) => set({ activeId }),
}));
