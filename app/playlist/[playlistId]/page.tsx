"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import PlaylistPanel from "@/components/video/PlaylistPanel";
import VideoGrid from "@/components/video/VideoGrid";
import type { ParsedVideo } from "@/lib/parser";
import { getDataSource } from "@/lib/runtime";
import { useAppStore } from "@/lib/store";

type PlaylistPageProps = {
  params: {
    playlistId: string;
  };
};

export default function PlaylistPage({ params }: PlaylistPageProps) {
  const source = useMemo(() => getDataSource("auto"), []);
  const localPlaylists = useAppStore((state) => state.localPlaylists);

  const [title, setTitle] = useState("Playlist");
  const [description, setDescription] = useState("");
  const [videoCount, setVideoCount] = useState("0");
  const [videos, setVideos] = useState<ParsedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlaylist() {
      setLoading(true);
      try {
        const local = localPlaylists.find((playlist) => playlist.id === params.playlistId);
        if (local) {
          setTitle(local.name);
          setDescription("Locally saved playlist");
          setVideoCount(String(local.videos.length));
          setVideos(
            local.videos.map((video) => ({
              videoId: video.videoId,
              title: video.title,
              thumbnails: [video.thumbnail],
              duration: "",
              durationSeconds: video.duration,
              viewCount: "",
              viewCountNumber: 0,
              channelName: video.channelName,
              channelId: "",
              publishedTime: "",
            })),
          );
          return;
        }

        const response = await source.playlist(params.playlistId);
        setTitle(response.title);
        setDescription(response.description);
        setVideoCount(response.videoCount);
        setVideos(response.videos || []);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylist();
  }, [params.playlistId, source, localPlaylists]);

  return (
    <div className="space-y-4">
      <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
        <h1 className="text-2xl font-medium text-yt-textPrimary">{title}</h1>
        <p className="mt-2 text-sm text-yt-textSecondary">{description || "No description"}</p>
        <p className="mt-1 text-sm text-yt-textSecondary">{videoCount} videos</p>

        {videos[0] && (
          <Link
            href={`/watch/${videos[0].videoId}`}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-yt-chip px-4 text-sm text-yt-textPrimary hover:bg-yt-hover"
          >
            <PlayCircle className="h-5 w-5" />
            Play all
          </Link>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <VideoGrid videos={videos} loading={loading} />
        <PlaylistPanel title={title} videos={videos} />
      </div>
    </div>
  );
}
