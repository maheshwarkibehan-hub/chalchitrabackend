export type ReturnYouTubeDislikeResponse = {
  id: string;
  dateCreated: string;
  likes: number;
  dislikes: number;
  rating: number;
  viewCount: number;
  deleted: boolean;
};

export async function getReturnYouTubeDislike(videoId: string): Promise<ReturnYouTubeDislikeResponse | null> {
  if (!videoId) return null;
  try {
    const response = await fetch(
      `https://returnyoutubedislike.com/api/getVotes?videoId=${encodeURIComponent(videoId)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) return null;
    return (await response.json()) as ReturnYouTubeDislikeResponse;
  } catch {
    return null;
  }
}
