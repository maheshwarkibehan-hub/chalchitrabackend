import Image from "next/image";
import Link from "next/link";

type ChannelCardProps = {
  channelId: string;
  name: string;
  avatar?: string;
  banner?: string;
  subscribers?: string;
  description?: string;
};

export default function ChannelCard({
  channelId,
  name,
  avatar,
  banner,
  subscribers,
  description,
}: ChannelCardProps) {
  return (
    <section className="overflow-hidden rounded-ytCard bg-yt-elevated">
      {banner && (
        <div className="relative h-28 w-full md:h-40">
          <Image src={banner} alt={name} fill sizes="100vw" className="object-cover" />
        </div>
      )}

      <div className="flex items-start gap-4 p-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-yt-border">
          <Image
            src={avatar || "https://yt3.ggpht.com/ytc/default-user=s88-c-k-c0x00ffffff-no-rj"}
            alt={name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-medium text-yt-textPrimary">{name}</h1>
          {subscribers && <p className="text-sm text-yt-textSecondary">{subscribers}</p>}
          {description && <p className="mt-2 line-clamp-3 text-sm text-yt-textSecondary">{description}</p>}
          <Link
            href={`/channel/${channelId}`}
            className="mt-3 inline-flex h-9 items-center rounded-full bg-yt-subscribeBg px-4 text-sm font-medium text-yt-subscribeText"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </section>
  );
}
