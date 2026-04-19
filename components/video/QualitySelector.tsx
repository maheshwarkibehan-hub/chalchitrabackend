"use client";

import { useMemo } from "react";
import { Check, Settings } from "lucide-react";

type StreamOption = {
  itag?: number;
  quality?: string;
  audioQuality?: string;
  bitrate?: number;
  mimeType?: string;
  height?: number;
  width?: number;
  fps?: number;
};

type QualitySelectorProps = {
  videoStreams: StreamOption[];
  audioStreams: StreamOption[];
  selectedVideoQuality: string;
  selectedAudioQuality: string;
  onVideoQualityChange: (quality: string) => void;
  onAudioQualityChange: (quality: string) => void;
};

const QUALITY_ORDER = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p", "Auto"];

function sortQualities(options: string[]): string[] {
  return options.sort((a, b) => {
    const idxA = QUALITY_ORDER.indexOf(a);
    const idxB = QUALITY_ORDER.indexOf(b);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });
}

export default function QualitySelector({
  videoStreams,
  audioStreams,
  selectedVideoQuality,
  selectedAudioQuality,
  onVideoQualityChange,
  onAudioQualityChange,
}: QualitySelectorProps) {
  const videoOptions = useMemo(() => {
    const unique = new Map<string, { label: string; badge?: string }>();

    videoStreams.forEach((stream) => {
      const label = stream.height ? `${stream.height}p` : stream.quality || "Auto";
      if (!unique.has(label)) {
        const fps = stream.fps && stream.fps > 30 ? `${stream.fps}` : undefined;
        const isHD = (stream.height || 0) >= 720;
        unique.set(label, {
          label,
          badge: fps ? `${fps} FPS` : isHD ? "HD" : undefined,
        });
      }
    });

    const sorted = sortQualities(Array.from(unique.keys()));
    return [
      { label: "Auto", badge: undefined },
      ...sorted.filter((k) => k !== "Auto").map((k) => unique.get(k)!),
    ];
  }, [videoStreams]);

  const audioOptions = useMemo(() => {
    const unique = new Map<string, string>();

    audioStreams.forEach((stream) => {
      const label = stream.audioQuality || `${Math.round((stream.bitrate || 0) / 1000)}kbps`;
      unique.set(label, label);
    });

    return ["Auto", ...Array.from(unique.values()).filter((value) => value !== "Auto")];
  }, [audioStreams]);

  return (
    <div className="w-72 overflow-hidden rounded-xl border border-yt-border bg-yt-elevated shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-yt-border px-4 py-3">
        <Settings className="h-4 w-4 text-yt-textSecondary" />
        <span className="text-sm font-medium text-yt-textPrimary">Quality</span>
      </div>

      {/* Video quality list */}
      <div className="max-h-64 overflow-y-auto py-1">
        <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-yt-textSecondary">
          Video
        </p>
        {videoOptions.map((option) => {
          const isSelected = option.label === selectedVideoQuality;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onVideoQualityChange(option.label)}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "bg-yt-hover text-yt-textPrimary"
                  : "text-yt-textPrimary hover:bg-yt-hover"
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {isSelected && <Check className="h-4 w-4 text-yt-accent" />}
              </span>
              <span className="flex-1">{option.label}</span>
              {option.badge && (
                <span className="rounded bg-yt-chip px-1.5 py-0.5 text-[10px] font-medium text-yt-textSecondary">
                  {option.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Audio quality */}
        <div className="mt-1 border-t border-yt-border pt-1">
          <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-yt-textSecondary">
            Audio
          </p>
          {audioOptions.map((option) => {
            const isSelected = option === selectedAudioQuality;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onAudioQualityChange(option)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-yt-hover text-yt-textPrimary"
                    : "text-yt-textPrimary hover:bg-yt-hover"
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {isSelected && <Check className="h-4 w-4 text-yt-accent" />}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
