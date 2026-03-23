import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { conversationsApi } from "@/api/conversations";
import { useConversationStore } from "@/store/conversationStore";

export function useConversations() {
  const { conversations, setConversations, addConversation, removeConversation } =
    useConversationStore();
  const router = useRouter();

  useEffect(() => {
    conversationsApi
      .list()
      .then(setConversations)
      .catch(() => {/* silently ignore — proxy handles auth redirect */});
  }, [setConversations]);

  async function createConversation(): Promise<string | null> {
    try {
      const conv = await conversationsApi.create();
      addConversation(conv);
      return conv.id;
    } catch {
      return null;
    }
  }

  async function deleteConversation(id: string) {
    try {
      await conversationsApi.delete(id);
      removeConversation(id);
      router.push("/chat");
    } catch {
      // silent
    }
  }

  return { conversations, createConversation, deleteConversation };
}
