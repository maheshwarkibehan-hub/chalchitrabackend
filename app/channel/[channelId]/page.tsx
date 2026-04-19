"use client";

import { useEffect, useMemo, useState } from "react";
import ChannelCard from "@/components/ui/ChannelCard";
import CategoryChips from "@/components/ui/CategoryChips";
import VideoGrid from "@/components/video/VideoGrid";
import type { ParsedChannelPage, ParsedVideo } from "@/lib/parser";
import { getDataSource } from "@/lib/runtime";

type ChannelPageProps = {
  params: {
    channelId: string;
  };
};

export default function ChannelPage({ params }: ChannelPageProps) {
  const source = useMemo(() => getDataSource("auto"), []);
  const [channel, setChannel] = useState<ParsedChannelPage | null>(null);
  const [videos, setVideos] = useState<ParsedVideo[]>([]);
  const [activeTab, setActiveTab] = useState("Videos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChannel() {
      setLoading(true);
      try {
        const data = await source.channel(params.channelId);
        setChannel(data);
        setVideos(data.videos || []);
        const selected = data.tabs.find((tab) => tab.selected);
        if (selected?.title) {
          setActiveTab(selected.title);
        }
      } finally {
        setLoading(false);
      }
    }

    loadChannel();
  }, [params.channelId, source]);

  async function handleTabChange(tabTitle: string) {
    if (!channel) return;
    setActiveTab(tabTitle);

    const tab = channel.tabs.find((item) => item.title === tabTitle);
    if (!tab?.params) return;

    setLoading(true);
    try {
      const data = await source.channel(params.channelId, tab.params);
      setVideos(data.videos || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {channel ? (
        <>
          <ChannelCard
            channelId={channel.channelId}
            name={channel.name}
            avatar={channel.avatar}
            banner={channel.banner}
            subscribers={channel.subscriberCount}
            description={channel.description}
          />

          <CategoryChips
            categories={channel.tabs.map((tab) => tab.title || "Tab").filter(Boolean)}
            active={activeTab}
            onChange={handleTabChange}
          />

          <VideoGrid videos={videos} loading={loading} />
        </>
      ) : (
        <p className="text-sm text-yt-textSecondary">Loading channel...</p>
      )}
    </div>
  );
}
