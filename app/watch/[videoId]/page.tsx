"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Copy,
  Download,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import CommentSection from "@/components/ui/CommentSection";
import Transcript from "@/components/video/Transcript";
import { formatCount, formatExactDate, formatViewCount, getBestThumbnail, parseDescriptionText } from "@/lib/utils";
import type { ParsedComment, ParsedVideo } from "@/lib/parser";
import { getDataSource } from "@/lib/runtime";
import { useAppStore } from "@/lib/store";

type PlayerResponse = {
  videoDetails: {
    videoId: string;
    title: string;
    author: string;
    lengthSeconds: number;
    viewCount: number;
    shortDescription: string;
    thumbnail: Array<{ url: string }>;
  };
  streamingData: {
    formats: Array<Record<string, unknown>>;
    videoStreams: Array<Record<string, unknown>>;
    audioStreams: Array<Record<string, unknown>>;
  };
  playabilityStatus?: {
    status?: string;
    reason?: string;
  };
};

type WatchPageProps = {
  params: {
    videoId: string;
  };
};

export default function WatchPage({ params }: WatchPageProps) {
  const source = useMemo(() => getDataSource("auto"), []);
  const [playerData, setPlayerData] = useState<PlayerResponse | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<ParsedVideo[]>([]);
  const [chapters, setChapters] = useState<Array<{ title: string; timeRangeStartMillis: number }>>([]);
  const [transcript, setTranscript] = useState<Array<{ startMs: number; text: string }>>([]);
  const [comments, setComments] = useState<ParsedComment[]>([]);
  const [commentsContinuation, setCommentsContinuation] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [dislikes, setDislikes] = useState<number>(0);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const toggleLikedVideo = useAppStore((state) => state.toggleLikedVideo);
  const toggleWatchLater = useAppStore((state) => state.toggleWatchLater);
  const createLocalPlaylist = useAppStore((state) => state.createLocalPlaylist);
  const localPlaylists = useAppStore((state) => state.localPlaylists);
  const addToPlaylist = useAppStore((state) => state.addToPlaylist);

  useEffect(() => {
    async function loadWatchData() {
      setLoading(true);
      try {
        const [player, related, chapterResponse, transcriptResponse, commentsResponse, dislikeResponse] = await Promise.all([
          source.player(params.videoId),
          source.next(params.videoId),
          source.chapters(params.videoId),
          source.transcript(params.videoId),
          source.comments(params.videoId),
          source.dislikeVotes(params.videoId),
        ]);

        setPlayerData(player as unknown as PlayerResponse);
        setRelatedVideos(related.relatedVideos || []);
        setChapters(chapterResponse || []);
        setTranscript(transcriptResponse || []);
        setComments(commentsResponse.comments || []);
        setCommentsContinuation(commentsResponse.continuationToken);
        setDislikes(dislikeResponse?.dislikes || 0);
      } finally {
        setLoading(false);
      }
    }

    loadWatchData();
  }, [params.videoId, source]);

  const details = playerData?.videoDetails;
  const hasPlayableStreams = useMemo(() => {
    if (!playerData) return false;

    const hasMuxed = playerData.streamingData.formats.some((stream) => {
      const candidate = stream as { url?: string };
      return Boolean(candidate.url);
    });

    const hasVideoOnly = playerData.streamingData.videoStreams.some((stream) => {
      const candidate = stream as { url?: string };
      return Boolean(candidate.url);
    });

    return hasMuxed || hasVideoOnly;
  }, [playerData]);

  const descriptionParts = useMemo(
    () => parseDescriptionText(details?.shortDescription || ""),
    [details?.shortDescription],
  );

  const detailsThumbnail = useMemo(
    () => getBestThumbnail(details?.thumbnail?.map((thumb) => thumb.url) || []),
    [details?.thumbnail],
  );

  function handleShare() {
    const url = `${window.location.origin}/watch/${params.videoId}`;
    navigator.clipboard.writeText(url).catch(() => undefined);
  }

  function saveToPlaylist() {
    const detailsSafe = details;
    if (!detailsSafe) return;

    if (localPlaylists.length === 0) {
      createLocalPlaylist("Favorites");
      return;
    }

    addToPlaylist(localPlaylists[0].id, {
      videoId: params.videoId,
      title: detailsSafe.title,
      channelName: detailsSafe.author,
      thumbnail: detailsThumbnail || `https://i.ytimg.com/vi/${params.videoId}/hq720.jpg`,
      duration: detailsSafe.lengthSeconds,
    });
  }

  return (
    <div>
      {loading || !details ? (
        <p className="text-sm text-yt-textSecondary">Loading video...</p>
      ) : (
        <div className={`grid gap-6 ${theaterMode ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(400px,4fr)]"}`}>
          <div className="space-y-4">
            {hasPlayableStreams ? (
              <VideoPlayer
                videoId={params.videoId}
                title={details.title}
                poster={detailsThumbnail || `https://i.ytimg.com/vi/${params.videoId}/hq720.jpg`}
                muxedFormats={playerData.streamingData.formats || []}
                videoStreams={playerData.streamingData.videoStreams || []}
                audioStreams={playerData.streamingData.audioStreams || []}
                relatedVideos={relatedVideos}
                chapters={chapters}
                transcript={transcript}
                theaterMode={theaterMode}
                onToggleTheaterMode={() => setTheaterMode((prev) => !prev)}
                onTimeUpdate={setCurrentTime}
                seekTo={seekTo}
                onSeekHandled={() => setSeekTo(null)}
              />
            ) : (
              <section className="space-y-3">
                <div className="overflow-hidden rounded-ytCard border border-yt-border bg-black">
                  <div className="aspect-video">
                    <iframe
                      title={details.title}
                      src={`https://www.youtube.com/embed/${params.videoId}?autoplay=1&rel=0&playsinline=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-yt-textSecondary">
                  <p>
                    Custom stream blocked by YouTube ({playerData.playabilityStatus?.reason || "restricted"}). Embedded fallback active.
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=${params.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center rounded-full bg-yt-chip px-3 text-xs text-yt-textPrimary hover:bg-yt-hover"
                  >
                    Open on YouTube
                  </a>
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h1 className="text-[20px] font-medium text-yt-textPrimary">{details.title}</h1>
              <p className="text-sm text-yt-textSecondary">
                {formatViewCount(details.viewCount)} • {formatExactDate(new Date())}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-yt-border">
                    <Image
                      src={detailsThumbnail || `https://i.ytimg.com/vi/${params.videoId}/hq720.jpg`}
                      alt={details.author}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yt-textPrimary">{details.author}</p>
                    <p className="text-xs text-yt-textSecondary">Channel info</p>
                  </div>
                  <button
                    type="button"
                    className="h-9 rounded-full px-4 text-sm font-medium transition bg-yt-subscribeBg text-yt-subscribeText hover:opacity-90"
                    onClick={() => setSubscribed((prev) => !prev)}
                  >
                    {subscribed ? "Subscribed" : "Subscribe"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex h-9 items-center overflow-hidden rounded-full bg-yt-chip text-sm">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3 hover:bg-yt-hover"
                      onClick={() =>
                        toggleLikedVideo({
                          videoId: params.videoId,
                          title: details.title,
                          channelName: details.author,
                          thumbnail: detailsThumbnail || "",
                          duration: details.lengthSeconds,
                        })
                      }
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {formatCount(details.viewCount / 30)}
                    </button>
                    <span className="h-5 w-px bg-yt-border" />
                    <span className="inline-flex items-center gap-2 px-3">
                      <ThumbsDown className="h-4 w-4" />
                      {formatCount(dislikes)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-yt-chip px-3 text-sm hover:bg-yt-hover"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full bg-yt-chip px-3 text-sm hover:bg-yt-hover">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toggleWatchLater({
                        videoId: params.videoId,
                        title: details.title,
                        channelName: details.author,
                        thumbnail: detailsThumbnail || "",
                        duration: details.lengthSeconds,
                      })
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-yt-chip px-3 text-sm hover:bg-yt-hover"
                  >
                    <Bookmark className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={saveToPlaylist}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-yt-chip px-3 text-sm hover:bg-yt-hover"
                  >
                    <Copy className="h-4 w-4" />
                    Playlist
                  </button>
                </div>
              </div>

              <div className="rounded-ytMenu bg-yt-elevated p-4 text-sm text-yt-textPrimary">
                <div className={`${expandedDescription ? "" : "line-clamp-3"}`}>
                  {descriptionParts.map((part, index) => {
                    if (part.type === "timestamp") {
                      return (
                        <button
                          type="button"
                          key={`time-${index}`}
                          className="mx-0.5 text-yt-likeActive hover:underline"
                          onClick={() => setSeekTo(part.seconds)}
                        >
                          {part.value}
                        </button>
                      );
                    }
                    if (part.type === "url") {
                      return (
                        <a key={`url-${index}`} href={part.href} target="_blank" className="mx-0.5 text-yt-likeActive hover:underline">
                          {part.value}
                        </a>
                      );
                    }
                    if (part.type === "hashtag") {
                      return (
                        <Link key={`hash-${index}`} href={`/search?q=${encodeURIComponent(part.value)}`} className="mx-0.5 text-yt-likeActive hover:underline">
                          {part.value}
                        </Link>
                      );
                    }
                    return <span key={`txt-${index}`}>{part.value}</span>;
                  })}
                </div>

                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-yt-textPrimary hover:underline"
                  onClick={() => setExpandedDescription((prev) => !prev)}
                >
                  {expandedDescription ? "Show less" : "...more"}
                </button>
              </div>

              {chapters.length > 0 && (
                <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-3">
                  <h2 className="mb-2 text-base font-medium">Chapters</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {chapters.map((chapter) => (
                      <button
                        key={`${chapter.title}-${chapter.timeRangeStartMillis}`}
                        type="button"
                        className="rounded-lg bg-yt-chip px-3 py-2 text-left text-sm hover:bg-yt-hover"
                        onClick={() => setSeekTo(chapter.timeRangeStartMillis / 1000)}
                      >
                        <p className="text-xs text-yt-textSecondary">{Math.floor(chapter.timeRangeStartMillis / 1000)}s</p>
                        <p className="line-clamp-1 text-yt-textPrimary">{chapter.title}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <Transcript transcript={transcript} currentTime={currentTime} onSeek={(seconds) => setSeekTo(seconds)} />
              <CommentSection
                videoId={params.videoId}
                initialComments={comments}
                initialContinuation={commentsContinuation}
              />
            </section>
          </div>

          {!theaterMode && (
            <aside className="space-y-3 xl:sticky xl:top-16 xl:h-[calc(100vh-72px)] xl:overflow-y-auto">
              <h2 className="text-base font-medium text-yt-textPrimary">Related videos</h2>
              {relatedVideos.map((video) => (
                <Link
                  key={video.videoId}
                  href={`/watch/${video.videoId}`}
                  className="flex gap-2 rounded-lg p-2 hover:bg-yt-chip"
                >
                  <div className="relative aspect-video w-40 overflow-hidden rounded-lg">
                    <Image
                      src={getBestThumbnail(video.thumbnails) || `https://i.ytimg.com/vi/${video.videoId}/hq720.jpg`}
                      alt={video.title}
                      fill
                      sizes="160px"
                      quality={86}
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-yt-textPrimary">{video.title}</p>
                    <p className="text-xs text-yt-textSecondary">{video.channelName}</p>
                    <p className="text-xs text-yt-textSecondary">{video.viewCount}</p>
                  </div>
                </Link>
              ))}
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
