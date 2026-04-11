import Link from "next/link";
import { getMyChats } from "./actions";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const chats = await getMyChats();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline shrink-0">Second <span className="text-coral">App</span></Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Inbox</span>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold text-text-primary mb-5">Messages</h1>

        {chats.length > 0 ? (
          <div className="space-y-2">
            {chats.map((chat) => (
              <Link key={chat.id} href={`/inbox/${chat.id}`} className="block no-underline">
                <div className="bg-card border border-border rounded-[10px] px-4 py-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-semibold text-text-primary">{chat.otherPartyName}</span>
                    <span className="text-[10px] text-text-faint">{new Date(chat.lastMessageAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-[12px] text-text-muted truncate">{chat.lastMessage}</p>
                  <p className="text-[10px] text-text-faint mt-0.5">Re: {chat.listingTitle}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-text-secondary mb-1">No messages yet</p>
            <p className="text-[13px] text-text-muted mb-4">Start a conversation by asking a question on any listing</p>
            <Link href="/" className="inline-block px-5 py-2 rounded-lg bg-coral text-white text-sm font-semibold no-underline">Browse Listings</Link>
          </div>
        )}
      </main>
    </div>
  );
}
