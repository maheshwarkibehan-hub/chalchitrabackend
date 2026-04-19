import VideoCard from "@/components/video/VideoCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import type { ParsedVideo } from "@/lib/parser";

type VideoGridProps = {
  videos: ParsedVideo[];
  loading?: boolean;
  showChannelAvatar?: boolean;
};

export default function VideoGrid({ videos, loading, showChannelAvatar = true }: VideoGridProps) {
  if (loading && videos.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={`sk-${index}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {videos.map((video, index) => (
        <div
          key={video.videoId}
          className="animate-card-in"
          style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
        >
          <VideoCard video={video} showChannelAvatar={showChannelAvatar} />
        </div>
      ))}
      {loading && (
        <>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={`sk-more-${index}`} />
          ))}
        </>
      )}
    </div>
  );
}
