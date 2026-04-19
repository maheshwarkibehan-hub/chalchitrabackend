import ShortsFeed from "@/components/video/ShortsFeed";

type ShortsVideoPageProps = {
  params: {
    videoId: string;
  };
};

export default function ShortsVideoPage({ params }: ShortsVideoPageProps) {
  return <ShortsFeed initialVideoId={params.videoId} />;
}
