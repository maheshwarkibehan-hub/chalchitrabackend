"use client";

import { categoryColor, type SponsorSegment } from "@/lib/sponsorblock";

type SponsorBlockProps = {
  segments: SponsorSegment[];
  duration: number;
  currentTime: number;
  onSkip: (time: number) => void;
};

export default function SponsorBlock({ segments, duration, currentTime, onSkip }: SponsorBlockProps) {
  const activeSegment = segments.find(
    (segment) => currentTime >= segment.segment[0] && currentTime <= segment.segment[1],
  );

  return (
    <>
      {segments.map((segment, index) => {
        if (duration <= 0) return null;
        const left = (segment.segment[0] / duration) * 100;
        const width = ((segment.segment[1] - segment.segment[0]) / duration) * 100;
        return (
          <span
            key={`${segment.category}-${index}`}
            title={`${segment.category}: ${segment.segment[0].toFixed(0)}s - ${segment.segment[1].toFixed(0)}s`}
            className="absolute top-0 h-full"
            style={{
              left: `${left}%`,
              width: `${Math.max(width, 0.5)}%`,
              backgroundColor: categoryColor(segment.category),
              opacity: 0.95,
            }}
          />
        );
      })}

      {activeSegment && (
        <button
          type="button"
          onClick={() => onSkip(activeSegment.segment[1])}
          className="absolute bottom-20 right-4 z-20 h-9 rounded-full bg-yt-chip px-4 text-sm text-yt-textPrimary hover:bg-yt-hover"
        >
          Skip Sponsor
        </button>
      )}
    </>
  );
}
