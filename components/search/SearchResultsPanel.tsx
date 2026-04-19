import Image from "next/image";
import Link from "next/link";
import { BellPlus } from "lucide-react";
import type { ParsedChannel, ParsedPlaylistItem, ParsedVideo } from "@/lib/parser";
import { formatDuration, formatViewCount } from "@/lib/utils";

type SearchResultsPanelProps = {
  videos: ParsedVideo[];
  channels: ParsedChannel[];
  playlists: ParsedPlaylistItem[];
  showChannels: boolean;
  showPlaylists: boolean;
};

function ChannelResult({ channel }: { channel: ParsedChannel }) {
  const avatar = channel.thumbnails[0] || "https://yt3.ggpht.com/ytc/default-user=s88-c-k-c0x00ffffff-no-rj";

  return (
    <article className="flex items-center gap-4 rounded-ytCard border border-yt-border bg-yt-elevated p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-yt-border">
        <Image src={avatar} alt={channel.title} fill sizes="80px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/channel/${channel.channelId}`} className="text-lg font-semibold text-yt-textPrimary hover:underline">
          {channel.title}
        </Link>
        <p className="text-sm text-yt-textSecondary">{channel.subscriberCount || "Channel"}</p>
        {channel.description && <p className="mt-1 line-clamp-2 text-sm text-yt-textSecondary">{channel.description}</p>}
      </div>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-full bg-yt-subscribeBg px-4 text-sm font-medium text-yt-subscribeText"
      >
        <BellPlus className="h-4 w-4" />
        Subscribe
      </button>
    </article>
  );
}

function PlaylistResult({ playlist }: { playlist: ParsedPlaylistItem }) {
  const thumb = playlist.thumbnails[0] || "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg";

  return (
    <article className="flex gap-3 rounded-ytCard p-2 hover:bg-yt-hover">
      <Link href={`/playlist/${playlist.playlistId}`} className="relative block aspect-video w-[210px] shrink-0 overflow-hidden rounded-ytCard bg-yt-hover">
        <Image src={thumb} alt={playlist.title} fill sizes="210px" className="object-cover" />
        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-[11px] text-white">Playlist</span>
      </Link>

      <div className="min-w-0">
        <Link href={`/playlist/${playlist.playlistId}`} className="line-clamp-2 text-base font-medium text-yt-textPrimary hover:underline">
          {playlist.title}
        </Link>
        <p className="mt-1 text-sm text-yt-textSecondary">{playlist.videoCount || "Playlist"}</p>
      </div>
    </article>
  );
}

function VideoResult({ video }: { video: ParsedVideo }) {
  const thumb = video.thumbnails[0] || "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg";
  const avatar = video.channelAvatar || "https://yt3.ggpht.com/ytc/default-user=s88-c-k-c0x00ffffff-no-rj";

  return (
    <article className="flex flex-col gap-3 rounded-ytCard p-2 hover:bg-yt-hover sm:flex-row">
      <Link href={`/watch/${video.videoId}`} className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-ytCard bg-yt-hover sm:w-[360px]">
        <Image src={thumb} alt={video.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover" />
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] text-white">
            {video.duration || formatDuration(video.durationSeconds)}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/watch/${video.videoId}`} className="line-clamp-2 text-lg font-medium leading-6 text-yt-textPrimary hover:underline">
          {video.title}
        </Link>
        <p className="mt-1 text-sm text-yt-textSecondary">
          {formatViewCount(video.viewCountNumber || video.viewCount)}
          {video.publishedTime ? ` • ${video.publishedTime}` : ""}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full">
            <Image src={avatar} alt={video.channelName} fill sizes="24px" className="object-cover" />
          </div>
          <Link href={`/channel/${video.channelId}`} className="text-sm text-yt-textSecondary hover:text-yt-textPrimary">
            {video.channelName}
          </Link>
        </div>

        {video.description && <p className="mt-2 line-clamp-2 text-sm text-yt-textSecondary">{video.description}</p>}
      </div>
    </article>
  );
}

export default function SearchResultsPanel({ videos, channels, playlists, showChannels, showPlaylists }: SearchResultsPanelProps) {
  const visibleChannels = showChannels ? channels : [];

  return (
    <div className="space-y-4">
      {visibleChannels.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-yt-textSecondary">Channels</h2>
          {visibleChannels.map((channel) => (
            <ChannelResult key={channel.channelId} channel={channel} />
          ))}
        </section>
      )}

      {showPlaylists && playlists.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-yt-textSecondary">Playlists</h2>
          {playlists.slice(0, 5).map((playlist) => (
            <PlaylistResult key={playlist.playlistId} playlist={playlist} />
          ))}
        </section>
      )}

      {videos.map((video) => (
        <VideoResult key={video.videoId} video={video} />
      ))}

      {!videos.length && !channels.length && !playlists.length && (
        <div className="rounded-ytCard border border-yt-border bg-yt-elevated px-4 py-6 text-sm text-yt-textSecondary">
          Koi result nahi mila. Query ya filters change karke dobara try karo.
        </div>
      )}
    </div>
  );
}
