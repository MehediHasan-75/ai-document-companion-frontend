import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Conversation } from "@/types/chat";

interface ConversationStore {
  conversations: Conversation[];
  activeId: string | null;
  docFilters: Record<string, string>; // conversationId → docId
  setConversations: (list: Conversation[]) => void;
  addConversation: (c: Conversation) => void;
  removeConversation: (id: string) => void;
  setActiveId: (id: string | null) => void;
  setDocFilter: (conversationId: string, docId: string) => void;
  renameConversation: (id: string, title: string) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      conversations: [],
      activeId: null,
      docFilters: {},
      setConversations: (conversations) => set({ conversations }),
      addConversation: (c) => set((s) => ({ conversations: [c, ...s.conversations] })),
      removeConversation: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.docFilters;
          return {
            conversations: s.conversations.filter((c) => c.id !== id),
            docFilters: rest,
          };
        }),
      setActiveId: (activeId) => set({ activeId }),
      setDocFilter: (conversationId, docId) =>
        set((s) => ({ docFilters: { ...s.docFilters, [conversationId]: docId } })),
      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) => c.id === id ? { ...c, title } : c),
        })),
    }),
    {
      name: "conversations",
      partialize: (s) => ({ docFilters: s.docFilters }),
    }
  )
);
