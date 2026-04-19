"use client";

import Image from "next/image";
import { MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { enhanceYouTubeThumbnail, formatCount } from "@/lib/utils";

type ShortCardProps = {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  likes?: number;
  comments?: number;
};

export default function ShortCard({ id, title, thumbnail, channelName, likes = 0, comments = 0 }: ShortCardProps) {
  return (
    <article className="relative mx-auto h-[100dvh] w-full max-w-md snap-start overflow-hidden rounded-ytCard bg-black">
      <Image
        src={enhanceYouTubeThumbnail(thumbnail) || thumbnail}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 420px"
        quality={90}
        className="object-cover"
        priority={false}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute bottom-5 left-4 right-16 text-white">
        <p className="mb-1 text-sm">@{channelName}</p>
        <h2 className="line-clamp-2 text-base font-medium">{title}</h2>
        <p className="mt-1 text-xs text-zinc-300">#{id}</p>
      </div>

      <div className="absolute bottom-8 right-3 flex flex-col gap-3">
        {[{ icon: ThumbsUp, label: formatCount(likes) }, { icon: ThumbsDown, label: "" }, { icon: MessageCircle, label: formatCount(comments) }, { icon: Share2, label: "Share" }].map(
          (item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                className="flex w-14 flex-col items-center gap-1 rounded-full bg-black/55 py-2 text-white"
              >
                <Icon className="h-5 w-5" />
                {item.label && <span className="text-[11px]">{item.label}</span>}
              </button>
            );
          },
        )}
      </div>
    </article>
  );
}
