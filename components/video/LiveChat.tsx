"use client";

import { MessageCircle } from "lucide-react";

type LiveChatItem = {
  id: string;
  author: string;
  message: string;
};

type LiveChatProps = {
  messages: LiveChatItem[];
};

export default function LiveChat({ messages }: LiveChatProps) {
  return (
    <section className="overflow-hidden rounded-ytMenu border border-yt-border bg-yt-elevated">
      <header className="flex items-center gap-2 border-b border-yt-border px-4 py-3">
        <MessageCircle className="h-4 w-4 text-yt-textSecondary" />
        <h3 className="text-sm font-medium text-yt-textPrimary">Live chat replay</h3>
      </header>

      <div className="max-h-80 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 && <p className="text-sm text-yt-textSecondary">No chat replay available.</p>}

        {messages.map((item) => (
          <div key={item.id} className="rounded-lg bg-yt-chip p-2">
            <p className="text-xs text-yt-textSecondary">{item.author}</p>
            <p className="text-sm text-yt-textPrimary">{item.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
