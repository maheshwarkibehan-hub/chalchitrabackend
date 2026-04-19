"use client";

import { useEffect, useMemo, useState } from "react";
import CategoryChips from "@/components/ui/CategoryChips";
import VideoGrid from "@/components/video/VideoGrid";
import type { ParsedVideo } from "@/lib/parser";
import { getDataSource } from "@/lib/runtime";

const TRENDING_TABS = ["Now", "Music", "Gaming", "Movies", "News"];

export default function TrendingPage() {
  const source = useMemo(() => getDataSource("auto"), []);
  const [activeTab, setActiveTab] = useState("Now");
  const [videos, setVideos] = useState<ParsedVideo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadTrending() {
      setLoading(true);
      try {
        const response = await source.trending(undefined);
        setVideos(response.videos);
      } finally {
        setLoading(false);
      }
    }

    loadTrending();
  }, [activeTab, source]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium">Trending</h1>
      <CategoryChips categories={TRENDING_TABS} active={activeTab} onChange={setActiveTab} />
      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
}
