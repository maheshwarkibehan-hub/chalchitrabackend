import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import type { ParsedShort } from "@/lib/parser";
import { enhanceYouTubeThumbnail, formatCount } from "@/lib/utils";

type ShortsShelfProps = {
  shorts: ParsedShort[];
};

export default function ShortsShelf({ shorts }: ShortsShelfProps) {
  if (!shorts.length) return null;

  return (
    <section className="space-y-3" aria-label="Shorts shelf">
      <div className="flex items-center gap-2 px-1">
        <Flame className="h-5 w-5 text-yt-accent" />
        <h2 className="text-lg font-semibold text-yt-textPrimary">Shorts</h2>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-full gap-3">
          {shorts.map((short) => (
            <Link
              key={short.videoId}
              href={`/shorts/${short.videoId}`}
              className="group w-[176px] shrink-0"
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-ytCard bg-yt-hover">
                <Image
                  src={enhanceYouTubeThumbnail(short.thumbnail) || short.thumbnail}
                  alt={short.title}
                  fill
                  sizes="176px"
                  quality={90}
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-2 line-clamp-2 text-sm font-medium text-yt-textPrimary">{short.title}</h3>
              <p className="text-xs text-yt-textSecondary">
                {short.viewCountNumber ? `${formatCount(short.viewCountNumber)} views` : short.viewCount || "Short"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
