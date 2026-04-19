"use client";

import { useMemo } from "react";

type StreamOption = {
  itag?: number;
  quality?: string;
  audioQuality?: string;
  bitrate?: number;
  mimeType?: string;
  height?: number;
  width?: number;
};

type QualitySelectorProps = {
  videoStreams: StreamOption[];
  audioStreams: StreamOption[];
  selectedVideoQuality: string;
  selectedAudioQuality: string;
  onVideoQualityChange: (quality: string) => void;
  onAudioQualityChange: (quality: string) => void;
};

export default function QualitySelector({
  videoStreams,
  audioStreams,
  selectedVideoQuality,
  selectedAudioQuality,
  onVideoQualityChange,
  onAudioQualityChange,
}: QualitySelectorProps) {
  const videoOptions = useMemo(() => {
    const unique = new Map<string, string>();

    videoStreams.forEach((stream) => {
      const label = stream.quality || (stream.height ? `${stream.height}p` : "Auto");
      unique.set(label, label);
    });

    return ["Auto", ...Array.from(unique.values()).filter((value) => value !== "Auto")];
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
    <div className="w-64 space-y-4 rounded-ytMenu border border-yt-border bg-yt-elevated p-3 text-sm text-yt-textPrimary shadow-2xl">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-yt-textSecondary">Video Quality</p>
        <select
          value={selectedVideoQuality}
          onChange={(event) => onVideoQualityChange(event.target.value)}
          className="h-9 w-full rounded-lg border border-yt-border bg-yt-input px-3"
        >
          {videoOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-yt-textSecondary">Audio Quality</p>
        <select
          value={selectedAudioQuality}
          onChange={(event) => onAudioQualityChange(event.target.value)}
          className="h-9 w-full rounded-lg border border-yt-border bg-yt-input px-3"
        >
          {audioOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
