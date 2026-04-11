import { getChatMessages } from "../actions";
import ChatClient from "./ChatClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const { messages, chatInfo } = await getChatMessages(chatId);
  if (!chatInfo) notFound();

  return <ChatClient chatId={chatId} initialMessages={messages} chatInfo={chatInfo} />;
}
