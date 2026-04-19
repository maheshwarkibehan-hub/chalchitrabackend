"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Share2, ThumbsDown, ThumbsUp, Volume2, VolumeX } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(true);

  // Auto-play when visible using IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        // Pre-load iframe when visible
        if (entry.isIntersecting && !loaded) {
          setLoaded(true);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loaded]);

  // Control iframe playback via postMessage
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !loaded) return;

    const command = isVisible ? "playVideo" : "pauseVideo";
    // Small delay to ensure iframe is ready
    const timeout = setTimeout(() => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [isVisible, loaded]);

  return (
    <article
      ref={containerRef}
      className="relative mx-auto flex h-[calc(100dvh-72px)] w-full max-w-[420px] snap-start items-center justify-center"
    >
      <div className="relative aspect-[9/16] h-full max-h-[calc(100dvh-80px)] w-auto overflow-hidden rounded-xl bg-black">
        {loaded ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&playsinline=1&modestbranding=1&showinfo=0&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <Image
            src={enhanceYouTubeThumbnail(thumbnail) || thumbnail}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            quality={90}
            className="object-cover"
          />
        )}

        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Channel + title at BOTTOM */}
        <div className="absolute bottom-5 left-4 right-16 z-20 text-white">
          <p className="mb-1 text-[13px] font-semibold opacity-90">@{channelName}</p>
          <h2 className="line-clamp-2 text-[15px] font-medium leading-snug">{title}</h2>
        </div>

        {/* Action buttons — right side */}
        <div className="absolute bottom-8 right-3 z-20 flex flex-col gap-4">
          <button type="button" className="flex flex-col items-center gap-1 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <ThumbsUp className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium">{formatCount(likes)}</span>
          </button>

          <button type="button" className="flex flex-col items-center gap-1 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <ThumbsDown className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium">Dislike</span>
          </button>

          <button type="button" className="flex flex-col items-center gap-1 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium">{formatCount(comments)}</span>
          </button>

          <button type="button" className="flex flex-col items-center gap-1 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Share2 className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium">Share</span>
          </button>

          <button
            type="button"
            onClick={() => setMuted((prev) => !prev)}
            className="flex flex-col items-center gap-1 text-white"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
