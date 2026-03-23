import api from "./client";
import type { Conversation, Message } from "@/types/chat";

export const conversationsApi = {
  create: (title?: string) =>
    api.post<Conversation>("/conversations", { title }).then((r) => r.data),

  list: () =>
    api.get<Conversation[]>("/conversations").then((r) => r.data),

  messages: (id: string) =>
    api.get<Message[]>(`/conversations/${id}/messages`).then((r) => r.data),

  rename: (id: string, title: string) =>
    api.patch<Conversation>(`/conversations/${id}`, { title }).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/conversations/${id}`).then((r) => r.data),
};
