"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { ParsedShort } from "@/lib/parser";
import { enhanceYouTubeThumbnail, formatCount } from "@/lib/utils";

type ShortsShelfProps = {
  shorts: ParsedShort[];
};

/* YouTube Shorts SVG logo */
function ShortsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z"
        fill="#FF0000"
      />
    </svg>
  );
}

export default function ShortsShelf({ shorts }: ShortsShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  if (!shorts.length) return null;

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }

  function scrollBy(amount: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
    // Debounced state update after scroll animation
    setTimeout(updateScrollState, 350);
  }

  return (
    <section className="space-y-3 border-b border-yt-border pb-6" aria-label="Shorts shelf">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <ShortsIcon className="h-6 w-6" />
        <h2 className="text-xl font-bold text-yt-textPrimary">Shorts</h2>
      </div>

      {/* Scrollable container with arrows */}
      <div className="group/shelf relative">
        {/* Left scroll arrow */}
        {canScroll.left && (
          <button
            type="button"
            onClick={() => scrollBy(-600)}
            className="absolute -left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-yt-border bg-yt-elevated text-yt-textPrimary opacity-0 shadow-lg transition-opacity group-hover/shelf:opacity-100"
            aria-label="Scroll shorts left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1"
        >
          {shorts.map((short) => (
            <Link
              key={short.videoId}
              href={`/shorts/${short.videoId}`}
              className="group/card w-[210px] shrink-0"
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-yt-hover">
                <Image
                  src={enhanceYouTubeThumbnail(short.thumbnail) || short.thumbnail}
                  alt={short.title}
                  fill
                  sizes="210px"
                  quality={90}
                  className="object-cover transition-transform duration-200 group-hover/card:scale-[1.03]"
                />

                {/* Bottom gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Title & views overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="line-clamp-2 text-[13px] font-medium leading-[18px] text-white">
                    {short.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-none text-white/70">
                    {short.viewCountNumber
                      ? `${formatCount(short.viewCountNumber)} views`
                      : short.viewCount || "Short"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right scroll arrow */}
        {canScroll.right && (
          <button
            type="button"
            onClick={() => scrollBy(600)}
            className="absolute -right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-yt-border bg-yt-elevated text-yt-textPrimary opacity-0 shadow-lg transition-opacity group-hover/shelf:opacity-100"
            aria-label="Scroll shorts right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
}
