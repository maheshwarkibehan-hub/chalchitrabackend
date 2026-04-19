"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle, MoreVertical, ThumbsUp } from "lucide-react";
import type { ParsedComment } from "@/lib/parser";

type CommentSectionProps = {
  videoId: string;
  initialComments?: ParsedComment[];
  initialContinuation?: string;
};

type SortType = "Top Comments" | "Newest First";

export default function CommentSection({
  videoId,
  initialComments = [],
  initialContinuation,
}: CommentSectionProps) {
  const [comments, setComments] = useState<ParsedComment[]>(initialComments);
  const [continuation, setContinuation] = useState<string | undefined>(initialContinuation);
  const [loading, setLoading] = useState(false);
  const [sortType, setSortType] = useState<SortType>("Top Comments");

  useEffect(() => {
    if (comments.length > 0 || !videoId) return;

    async function loadInitial() {
      setLoading(true);
      try {
        const response = await fetch(`/api/comments?videoId=${encodeURIComponent(videoId)}`);
        const data = await response.json();
        setComments(data.comments || []);
        setContinuation(data.continuationToken || undefined);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, [comments.length, videoId]);

  async function loadMoreComments() {
    if (!continuation || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/comments?continuation=${encodeURIComponent(continuation)}&videoId=${encodeURIComponent(videoId)}`);
      const data = await response.json();

      setComments((prev) => [...prev, ...(data.comments || [])]);
      setContinuation(data.continuationToken || undefined);
    } finally {
      setLoading(false);
    }
  }

  const displayed = sortType === "Top Comments" ? comments : [...comments].reverse();

  return (
    <section className="rounded-ytMenu bg-yt-base p-1">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-xl font-medium text-yt-textPrimary">{comments.length.toLocaleString()} Comments</h3>
        <select
          value={sortType}
          onChange={(event) => setSortType(event.target.value as SortType)}
          className="h-8 rounded-full border border-yt-border bg-yt-chip px-3 text-sm text-yt-textPrimary"
        >
          <option>Top Comments</option>
          <option>Newest First</option>
        </select>
      </div>

      <div className="space-y-4">
        {displayed.map((comment) => (
          <article key={comment.commentId} className="flex gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={comment.authorAvatar || "https://yt3.ggpht.com/ytc/default-user=s88-c-k-c0x00ffffff-no-rj"}
                alt={comment.author}
                fill
                sizes="40px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[13px] font-medium text-yt-textPrimary">{comment.author}</span>
                <span className="text-[13px] text-yt-textSecondary">{comment.publishedTime}</span>
              </div>
              <p className="mb-2 whitespace-pre-wrap text-sm text-yt-textPrimary">{comment.text}</p>

              <div className="flex items-center gap-4 text-yt-textSecondary">
                <button type="button" className="inline-flex items-center gap-1 text-xs hover:text-yt-textPrimary">
                  <ThumbsUp className="h-4 w-4" />
                  {comment.likeCount || "0"}
                </button>
                <button type="button" className="text-xs text-yt-likeActive hover:underline">
                  {comment.replyCount > 0 ? `${comment.replyCount} replies` : "Reply"}
                </button>
                <button type="button" className="ml-auto text-xs">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {comment.replyCount > 0 && (
                <div className="mt-2 border-l-2 border-yt-accent pl-3 text-xs text-yt-textSecondary">
                  Threaded replies in 2026 style
                </div>
              )}
            </div>
          </article>
        ))}

        {!loading && displayed.length === 0 && (
          <div className="rounded-ytMenu border border-yt-border bg-yt-elevated px-4 py-3 text-sm text-yt-textSecondary">
            Is video par comments available nahi hain ya abhi load nahi ho pa rahe.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {continuation && (
          <button
            type="button"
            onClick={loadMoreComments}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-yt-chip px-4 text-sm text-yt-textPrimary hover:bg-yt-hover disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
            {loading ? "Loading..." : "Load more comments"}
          </button>
        )}
      </div>
    </section>
  );
}
