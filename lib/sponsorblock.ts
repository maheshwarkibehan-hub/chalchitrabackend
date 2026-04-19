export type SponsorSegmentCategory =
  | "sponsor"
  | "intro"
  | "outro"
  | "interaction"
  | "selfpromo"
  | "music_offtopic"
  | "preview"
  | "filler";

export type SponsorSegment = {
  category: SponsorSegmentCategory;
  segment: [number, number];
  UUID?: string;
  actionType?: string;
};

export const SPONSORBLOCK_CATEGORIES: SponsorSegmentCategory[] = [
  "sponsor",
  "intro",
  "outro",
  "interaction",
  "selfpromo",
  "music_offtopic",
  "preview",
  "filler",
];

export async function getSponsorSegments(
  videoId: string,
  categories: SponsorSegmentCategory[] = SPONSORBLOCK_CATEGORIES,
): Promise<SponsorSegment[]> {
  if (!videoId) return [];

  const query = encodeURIComponent(JSON.stringify(categories));
  const endpoint = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=${query}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) return [];
    const data = (await response.json()) as SponsorSegment[];
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export function segmentContainsTime(segment: SponsorSegment, time: number): boolean {
  return time >= segment.segment[0] && time <= segment.segment[1];
}

export function categoryColor(category: SponsorSegmentCategory): string {
  switch (category) {
    case "sponsor":
      return "#00c853";
    case "intro":
      return "#00b8d4";
    case "outro":
      return "#2979ff";
    case "interaction":
      return "#d500f9";
    case "selfpromo":
      return "#ffea00";
    case "music_offtopic":
      return "#ff9100";
    case "preview":
      return "#00e5ff";
    case "filler":
      return "#8d6e63";
    default:
      return "#ffea00";
  }
}
