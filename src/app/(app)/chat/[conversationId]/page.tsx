import { ChatWindow } from "@/components/chat/ChatWindow";

interface ChatPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = await params;
  return (
    <div className="h-full">
      <ChatWindow conversationId={conversationId} />
    </div>
  );
}
