import { ChatWindow } from "@/components/chat/ChatWindow";

interface ChatPageProps {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ doc_id?: string }>;
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const { conversationId } = await params;
  const { doc_id } = await searchParams;
  return (
    <div className="h-full">
      <ChatWindow conversationId={conversationId} docId={doc_id} />
    </div>
  );
}
