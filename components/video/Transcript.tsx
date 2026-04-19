"use client";

import { useMemo } from "react";
import { formatDuration } from "@/lib/utils";

type TranscriptSegment = {
  startMs: number;
  text: string;
};

type TranscriptProps = {
  transcript: TranscriptSegment[];
  currentTime: number;
  onSeek: (seconds: number) => void;
};

export default function Transcript({ transcript, currentTime, onSeek }: TranscriptProps) {
  const activeIndex = useMemo(
    () => transcript.findIndex((segment) => currentTime * 1000 >= segment.startMs),
    [currentTime, transcript],
  );

  if (!transcript.length) {
    return (
      <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
        <h3 className="mb-2 text-base font-medium text-yt-textPrimary">Transcript</h3>
        <p className="text-sm text-yt-textSecondary">No transcript available.</p>
      </section>
    );
  }

  return (
    <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-3">
      <h3 className="mb-2 text-base font-medium text-yt-textPrimary">Transcript</h3>
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {transcript.map((segment, index) => (
          <button
            key={`${segment.startMs}-${index}`}
            type="button"
            onClick={() => onSeek(segment.startMs / 1000)}
            className={`flex w-full gap-3 rounded-lg px-2 py-2 text-left transition ${
              activeIndex === index ? "bg-yt-hover" : "hover:bg-yt-hover"
            }`}
          >
            <span className="w-14 shrink-0 text-xs text-yt-textSecondary">{formatDuration(Math.floor(segment.startMs / 1000))}</span>
            <span className="text-sm text-yt-textPrimary">{segment.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
