"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { sendMessage, getChatMessages } from "../actions";

interface Message {
  id: string;
  content: string;
  senderName: string;
  isMe: boolean;
  createdAt: string;
}

interface ChatClientProps {
  chatId: string;
  initialMessages: Message[];
  chatInfo: { listingTitle: string; listingSlug: string; otherPartyName: string };
}

export default function ChatClient({ chatId, initialMessages, chatInfo }: ChatClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const { messages: newMessages } = await getChatMessages(chatId);
      if (newMessages.length !== messages.length) setMessages(newMessages);
    }, 5000);
    return () => clearInterval(interval);
  }, [chatId, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(chatId, input.trim());
    setInput("");
    const { messages: updated } = await getChatMessages(chatId);
    setMessages(updated);
    setSending(false);
  };

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/inbox" className="text-text-muted no-underline">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </Link>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-text-primary truncate">{chatInfo.otherPartyName}</p>
          <Link href={`/product/${chatInfo.listingSlug}`} className="text-[11px] text-coral no-underline">{chatInfo.listingTitle}</Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${msg.isMe ? "bg-coral text-white rounded-br-md" : "bg-white border border-border text-text-primary rounded-bl-md"}`}>
              <p className="text-[13px] leading-relaxed">{msg.content}</p>
              <p className={`text-[9px] mt-1 ${msg.isMe ? "text-white/60" : "text-text-faint"}`}>
                {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-border px-4 py-3 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-3.5 py-2.5 text-[13px] border border-border rounded-full bg-input-light text-text-primary"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center border-none cursor-pointer disabled:opacity-50 shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
        </button>
      </div>
    </div>
  );
}
