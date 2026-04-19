"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Captions,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RectangleHorizontal,
  Settings2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import { getDataSource } from "@/lib/runtime";
import type { ParsedVideo } from "@/lib/parser";
import ChapterMarkers from "@/components/video/ChapterMarkers";
import SponsorBlock from "@/components/video/SponsorBlock";
import Toast from "@/components/ui/Toast";

type StreamOption = {
  url?: string;
  itag?: number;
  quality?: string;
  qualityLabel?: string;
  height?: number;
  mimeType?: string;
};

type Chapter = {
  title: string;
  timeRangeStartMillis: number;
};

type TranscriptSegment = {
  startMs: number;
  text: string;
};

type VideoPlayerProps = {
  videoId: string;
  title: string;
  poster?: string;
  channelName?: string;
  keywords?: string[];
  muxedFormats: Array<Record<string, unknown>>;
  relatedVideos?: ParsedVideo[];
  chapters?: Chapter[];
  transcript?: TranscriptSegment[];
  theaterMode: boolean;
  onToggleTheaterMode: () => void;
  onTimeUpdate?: (seconds: number) => void;
  seekTo?: number | null;
  onSeekHandled?: () => void;
};

type QualityOption = {
  label: string;
  url: string;
  rank: number;
};

function normalizeStreams(items: Array<Record<string, unknown>>): StreamOption[] {
  return items.map((item) => ({
    url: typeof item.url === "string" ? item.url : undefined,
    itag: typeof item.itag === "number" ? item.itag : undefined,
    quality: typeof item.quality === "string" ? item.quality : undefined,
    qualityLabel: typeof item.qualityLabel === "string" ? item.qualityLabel : undefined,
    height: typeof item.height === "number" ? item.height : undefined,
    mimeType: typeof item.mimeType === "string" ? item.mimeType : undefined,
  }));
}

function qualityRank(label: string): number {
  if (label === "Auto") return 9999;
  const number = Number(label.replace(/\D/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function qualityLabel(stream: StreamOption): string {
  if (stream.qualityLabel) return stream.qualityLabel;
  if (stream.height) return `${stream.height}p`;
  if (stream.quality) {
    const match = stream.quality.match(/\d+/);
    if (match?.[0]) return `${match[0]}p`;
  }
  return "Auto";
}

export default function VideoPlayer({
  videoId,
  title,
  poster,
  channelName = "",
  keywords = [],
  muxedFormats,
  chapters = [],
  transcript = [],
  theaterMode,
  onToggleTheaterMode,
  onTimeUpdate,
  seekTo,
  onSeekHandled,
}: VideoPlayerProps) {
  const dataSource = useMemo(() => getDataSource("auto"), []);
  const playerRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const preferences = useAppStore((state) => state.preferences);
  const currentlyPlaying = useAppStore((state) => state.currentlyPlaying);
  const updateCurrentlyPlaying = useAppStore((state) => state.updateCurrentlyPlaying);
  const updateWatchProgress = useAppStore((state) => state.updateWatchProgress);
  const addWatchHistory = useAppStore((state) => state.addWatchHistory);
  const setMiniPlayerActive = useAppStore((state) => state.setMiniPlayerActive);

  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(preferences.defaultPlaybackSpeed || 1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(preferences.captionsEnabled);
  const [fullscreen, setFullscreen] = useState(false);
  const [pip, setPip] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [sponsorSegments, setSponsorSegments] = useState<Array<{ category: "sponsor" | "intro" | "outro" | "interaction" | "selfpromo" | "music_offtopic" | "preview" | "filler"; segment: [number, number] }>>([]);

  const muxed = useMemo(() => normalizeStreams(muxedFormats).filter((item) => item.url), [muxedFormats]);

  const qualityOptions = useMemo<QualityOption[]>(() => {
    const unique = new Map<string, QualityOption>();

    muxed.forEach((stream) => {
      if (!stream.url) return;
      const label = qualityLabel(stream);
      if (!unique.has(label)) {
        unique.set(label, { label, url: stream.url, rank: qualityRank(label) });
      }
    });

    const sorted = Array.from(unique.values()).sort((a, b) => b.rank - a.rank);
    if (sorted.length) {
      sorted.unshift({ label: "Auto", url: sorted[0].url, rank: 9999 });
    }

    return sorted;
  }, [muxed]);

  const [selectedQuality, setSelectedQuality] = useState<string>(preferences.defaultVideoQuality || "Auto");

  const selectedUrl = useMemo(() => {
    if (!qualityOptions.length) return "";
    const selected = qualityOptions.find((option) => option.label === selectedQuality);
    return selected?.url || qualityOptions[0].url;
  }, [qualityOptions, selectedQuality]);



  const setCurrentPlaybackSnapshot = useCallback(
    (element: HTMLVideoElement, isPlayingOverride?: boolean) => {
      if (!videoId || !selectedUrl) return;

      updateCurrentlyPlaying({
        videoId,
        title,
        thumbnail: poster || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        streamUrl: selectedUrl,
        currentTime: element.currentTime || 0,
        isPlaying: isPlayingOverride ?? !element.paused,
        volume,
        isMuted: muted,
        playbackRate,
        quality: selectedQuality,
        duration: element.duration || duration || 0,
      });
    },
    [duration, muted, playbackRate, poster, selectedQuality, selectedUrl, title, updateCurrentlyPlaying, videoId, volume],
  );

  const activateMiniPlayer = useCallback(() => {
    const element = playerRef.current;
    if (!element || !selectedUrl) return;

    setCurrentPlaybackSnapshot(element, !element.paused);
    element.pause();
    setMiniPlayerActive(true);
  }, [selectedUrl, setCurrentPlaybackSnapshot, setMiniPlayerActive]);

  useEffect(() => {
    if (!currentlyPlaying.videoId || currentlyPlaying.videoId !== videoId) return;
    if (!useAppStore.getState().miniPlayerActive) return;
    setMiniPlayerActive(false);
  }, [currentlyPlaying.videoId, setMiniPlayerActive, videoId]);

  const activeTranscript = useMemo(() => {
    if (!captionsEnabled || !transcript.length) return null;
    const index = transcript.findIndex((segment, idx) => {
      const start = segment.startMs / 1000;
      const end = transcript[idx + 1] ? transcript[idx + 1].startMs / 1000 : Number.MAX_SAFE_INTEGER;
      return currentTime >= start && currentTime < end;
    });
    return index >= 0 ? transcript[index] : null;
  }, [captionsEnabled, currentTime, transcript]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1800);
  }, []);

  const refreshControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (!playing) return;
      setShowControls(false);
    }, 2000);
  }, [playing]);

  const seekToPercent = useCallback(
    (percent: number) => {
      const element = playerRef.current;
      if (!element || duration <= 0) return;
      const next = Math.max(0, Math.min(duration, percent * duration));
      element.currentTime = next;
      setCurrentTime(next);
      onTimeUpdate?.(next);
    },
    [duration, onTimeUpdate],
  );

  const togglePlay = useCallback(() => {
    const element = playerRef.current;
    if (!element) return;

    if (element.paused) {
      element.play().catch(() => undefined);
    } else {
      element.pause();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = wrapperRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => undefined);
      return;
    }

    document.exitFullscreen().catch(() => undefined);
  }, []);

  const togglePiP = useCallback(async () => {
    const element = playerRef.current;
    if (!element || !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPip(false);
      } else {
        await element.requestPictureInPicture();
        setPip(true);
      }
    } catch {
      setPip(false);
    }
  }, []);

  useEffect(() => {
    const element = playerRef.current;
    if (!element || !selectedUrl) return;

    const shouldResume = currentlyPlaying.videoId === videoId;
    const resumeTime = shouldResume ? currentlyPlaying.currentTime : 0;
    const shouldAutoplayFromStore = shouldResume && currentlyPlaying.isPlaying;

    if (shouldResume) {
      setVolume(currentlyPlaying.volume);
      setMuted(currentlyPlaying.isMuted);
      setPlaybackRate(currentlyPlaying.playbackRate);
    }

    const wasPlaying = !element.paused;
    const prevTime = element.currentTime;

    element.src = selectedUrl;
    element.load();

    const onLoaded = () => {
      const targetTime = prevTime > 0 ? prevTime : resumeTime;
      if (targetTime > 0) {
        element.currentTime = Math.min(targetTime, element.duration || targetTime);
      }
      if (shouldResume) {
        element.volume = currentlyPlaying.volume;
        element.muted = currentlyPlaying.isMuted;
        element.playbackRate = currentlyPlaying.playbackRate;
      }
      if (wasPlaying || shouldAutoplayFromStore) {
        element.play().catch(() => undefined);
      }
      setCurrentPlaybackSnapshot(element, wasPlaying || shouldAutoplayFromStore);
      element.removeEventListener("loadedmetadata", onLoaded);
    };

    element.addEventListener("loadedmetadata", onLoaded);
    return () => element.removeEventListener("loadedmetadata", onLoaded);
  }, [currentlyPlaying.currentTime, currentlyPlaying.isMuted, currentlyPlaying.isPlaying, currentlyPlaying.playbackRate, currentlyPlaying.videoId, currentlyPlaying.volume, selectedUrl, setCurrentPlaybackSnapshot, videoId]);

  useEffect(() => {
    if (!videoId || !selectedUrl) return;
    updateCurrentlyPlaying({
      videoId,
      title,
      thumbnail: poster || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      streamUrl: selectedUrl,
      quality: selectedQuality,
    });
  }, [poster, selectedQuality, selectedUrl, title, updateCurrentlyPlaying, videoId]);

  useEffect(() => {
    const element = playerRef.current;
    if (!element) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onMetadata = () => setDuration(element.duration || 0);
    const onTime = () => {
      const time = element.currentTime || 0;
      setCurrentTime(time);
      onTimeUpdate?.(time);

      if (element.buffered.length > 0 && element.duration > 0) {
        const end = element.buffered.end(element.buffered.length - 1);
        setBufferedPercent(Math.min(100, (end / element.duration) * 100));
      }
    };

    element.addEventListener("play", onPlay);
    element.addEventListener("pause", onPause);
    element.addEventListener("loadedmetadata", onMetadata);
    element.addEventListener("timeupdate", onTime);

    return () => {
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onPause);
      element.removeEventListener("loadedmetadata", onMetadata);
      element.removeEventListener("timeupdate", onTime);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    const element = playerRef.current;
    if (!element) return;
    element.volume = volume;
    element.muted = muted;
    element.playbackRate = playbackRate;
  }, [muted, playbackRate, volume]);

  useEffect(() => {
    if (seekTo == null) return;
    const element = playerRef.current;
    if (!element) return;
    element.currentTime = Math.max(0, seekTo);
    onSeekHandled?.();
  }, [onSeekHandled, seekTo]);

  useEffect(() => {
    if (!videoId || !preferences.sponsorBlockEnabled) {
      setSponsorSegments([]);
      return;
    }

    dataSource
      .sponsorSegments(videoId)
      .then((segments) => setSponsorSegments(segments))
      .catch(() => setSponsorSegments([]));
  }, [dataSource, preferences.sponsorBlockEnabled, videoId]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);

    const element = playerRef.current;
    const onPipEnter = () => setPip(true);
    const onPipLeave = () => setPip(false);
    element?.addEventListener("enterpictureinpicture", onPipEnter as EventListener);
    element?.addEventListener("leavepictureinpicture", onPipLeave as EventListener);

    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      element?.removeEventListener("enterpictureinpicture", onPipEnter as EventListener);
      element?.removeEventListener("leavepictureinpicture", onPipLeave as EventListener);
    };
  }, []);

  useEffect(() => {
    const element = playerRef.current;
    if (!element) return;

    const onWheel = (event: WheelEvent) => {
      // Allow page scroll unless we want to control volume specifically
      // Removing event.preventDefault() to avoid hijacking page scroll
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      setVolume((prev) => Math.min(1, Math.max(0, prev + delta)));
      if (muted) setMuted(false);
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [muted]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        togglePlay();
      }
      if (event.key === "f" || event.key === "F") toggleFullscreen();
      if (event.key === "m" || event.key === "M") setMuted((prev) => !prev);
      if (event.key === "t" || event.key === "T") onToggleTheaterMode();
      if (event.key === "i" || event.key === "I") {
        const current = useAppStore.getState().miniPlayerActive;
        if (current) {
          setMiniPlayerActive(false);
        } else {
          activateMiniPlayer();
        }
      }
      if (event.key === "ArrowLeft") {
        const element = playerRef.current;
        if (element) element.currentTime = Math.max(0, element.currentTime - 5);
      }
      if (event.key === "ArrowRight") {
        const element = playerRef.current;
        if (element) element.currentTime = Math.min(duration || Number.MAX_SAFE_INTEGER, element.currentTime + 5);
      }
      if (event.key === "j" || event.key === "J") {
        const element = playerRef.current;
        if (element) element.currentTime = Math.max(0, element.currentTime - 10);
      }
      if (event.key === "l" || event.key === "L") {
        const element = playerRef.current;
        if (element) element.currentTime = Math.min(duration || Number.MAX_SAFE_INTEGER, element.currentTime + 10);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setVolume((prev) => Math.min(1, prev + 0.05));
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setVolume((prev) => Math.max(0, prev - 0.05));
      }
      if (event.key === ",") {
        setPlaybackRate((prev) => Math.max(0.25, Number((prev - 0.25).toFixed(2))));
      }
      if (event.key === ".") {
        setPlaybackRate((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))));
      }
      if (event.key === "c" || event.key === "C") {
        setCaptionsEnabled((prev) => !prev);
      }
      if (/^[0-9]$/.test(event.key) && duration > 0) {
        seekToPercent(Number(event.key) / 10);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activateMiniPlayer, duration, onToggleTheaterMode, seekToPercent, setMiniPlayerActive, toggleFullscreen, togglePlay]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const element = playerRef.current;
      if (!element || !videoId || !selectedUrl) return;

      setCurrentPlaybackSnapshot(element);

      if (element.duration > 0) {
        updateWatchProgress(videoId, element.currentTime, element.duration);
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [selectedUrl, setCurrentPlaybackSnapshot, updateWatchProgress, videoId]);

  useEffect(() => {
    const element = playerRef.current;
    return () => {
      if (!element) return;

      setCurrentPlaybackSnapshot(element, !element.paused);

      if (!element.paused && videoId && selectedUrl) {
        setMiniPlayerActive(true);
      }

      addWatchHistory({
        videoId,
        title,
        channelName,
        keywords,
        thumbnail: poster || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: element.duration || duration,
        progressPercent: element.duration > 0 ? (element.currentTime / element.duration) * 100 : 0,
        progressSeconds: element.currentTime,
      });
    };
  }, [addWatchHistory, duration, poster, selectedUrl, setCurrentPlaybackSnapshot, setMiniPlayerActive, title, videoId, channelName, keywords]);

  return (
    <section className="relative">
      <div
        ref={wrapperRef}
        className="relative overflow-hidden rounded-2xl border border-yt-border bg-black"
        onMouseMove={refreshControls}
        onMouseLeave={() => {
          if (playing) setShowControls(false);
        }}
      >
        <video
          ref={playerRef}
          className="aspect-video w-full bg-black"
          poster={poster}
          preload="metadata"
          playsInline
          onClick={togglePlay}
        />


        <div
          className={`absolute inset-0 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {pip && (
            <div className="absolute left-3 top-3 rounded bg-black/80 px-2 py-1 text-xs text-white">
              Playing in Picture-in-Picture
            </div>
          )}

          {captionsEnabled && activeTranscript?.text && (
            <div className="absolute bottom-20 left-1/2 max-w-[82%] -translate-x-1/2 rounded bg-black/80 px-3 py-2 text-center text-sm text-white">
              {activeTranscript.text}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
            <div
              className="relative mb-2 h-1.5 cursor-pointer overflow-hidden rounded-full bg-white/25"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const percent = (event.clientX - rect.left) / rect.width;
                seekToPercent(percent);
              }}
            >
              <div className="absolute inset-y-0 left-0 bg-white/40" style={{ width: `${bufferedPercent}%` }} />
              <div className="absolute inset-y-0 left-0 bg-[#ff0000]" style={{ width: `${progressPercent}%` }} />

              <ChapterMarkers
                chapters={chapters}
                duration={duration}
                onJump={(seconds) => {
                  const element = playerRef.current;
                  if (!element) return;
                  element.currentTime = seconds;
                }}
              />

              <SponsorBlock
                segments={sponsorSegments}
                duration={duration}
                currentTime={currentTime}
                onSkip={(time) => {
                  const element = playerRef.current;
                  if (!element) return;
                  element.currentTime = time;
                  showToast("Skipped Sponsored Segment");
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-white">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-full p-2 hover:bg-white/15 transition-colors"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
                </button>

                <div className="group/vol flex items-center">
                  <button
                    type="button"
                    onClick={() => setMuted((prev) => !prev)}
                    className="rounded-full p-2 hover:bg-white/15 transition-colors"
                    aria-label={muted ? "Unmute" : "Mute"}
                  >
                    {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>

                  <div className="w-0 overflow-hidden transition-all duration-200 group-hover/vol:w-20">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={muted ? 0 : volume}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setVolume(value);
                        if (value > 0 && muted) setMuted(false);
                      }}
                      className="h-1 w-full cursor-pointer accent-white"
                      aria-label="Volume"
                    />
                  </div>
                </div>

                <p className="ml-1 select-none text-xs font-medium tabular-nums">
                  {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration || 0))}
                </p>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setCaptionsEnabled((prev) => !prev)}
                  className={`rounded-sm p-2 transition-colors ${captionsEnabled ? "bg-white/20" : "hover:bg-white/15"}`}
                  aria-label="Captions"
                  title="Captions (c)"
                >
                  <Captions className="h-5 w-5" />
                </button>

                {/* Settings gear — opens combined Speed + Quality menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen((prev) => !prev)}
                    className={`rounded-sm p-2 transition-all ${settingsOpen ? "rotate-45 bg-white/20" : "hover:bg-white/15"}`}
                    aria-label="Settings"
                    title="Settings"
                  >
                    <Settings2 className="h-5 w-5" />
                  </button>

                  {settingsOpen && (
                    <div className="absolute bottom-12 right-0 z-30 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]/95 py-1 shadow-2xl backdrop-blur-md">
                      {/* Playback speed */}
                      <div className="border-b border-white/10 px-3 py-2">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">Playback speed</p>
                        <div className="flex flex-wrap gap-1">
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                            <button
                              key={speed}
                              type="button"
                              onClick={() => {
                                setPlaybackRate(speed);
                                showToast(`Speed: ${speed === 1 ? "Normal" : `${speed}x`}`);
                              }}
                              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                playbackRate === speed
                                  ? "bg-white text-black"
                                  : "bg-white/10 text-white hover:bg-white/20"
                              }`}
                            >
                              {speed === 1 ? "Normal" : `${speed}x`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality options */}
                      <div className="px-1 py-1">
                        <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-white/50">Quality</p>
                        <div className="max-h-48 overflow-y-auto">
                          {qualityOptions.map((option) => {
                            const isHD = option.rank >= 720 && option.rank < 9999;
                            return (
                              <button
                                key={option.label}
                                type="button"
                                onClick={() => {
                                  setSelectedQuality(option.label);
                                  setSettingsOpen(false);
                                  showToast(`Quality: ${option.label}`);
                                }}
                                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                                  selectedQuality === option.label
                                    ? "bg-white/15 text-white"
                                    : "text-white/80 hover:bg-white/10"
                                }`}
                              >
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                  {selectedQuality === option.label && (
                                    <span className="h-2 w-2 rounded-full bg-white" />
                                  )}
                                </span>
                                <span className="flex-1">{option.label}</span>
                                {isHD && (
                                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white/70">HD</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={activateMiniPlayer}
                  className="rounded-sm p-2 hover:bg-white/15 transition-colors"
                  aria-label="Mini player"
                  title="Mini player (i)"
                >
                  <Minimize className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={onToggleTheaterMode}
                  className={`rounded-sm p-2 transition-colors ${theaterMode ? "bg-white/20" : "hover:bg-white/15"}`}
                  aria-label="Theater mode"
                  title="Theater mode (t)"
                >
                  <RectangleHorizontal className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="rounded-sm p-2 hover:bg-white/15 transition-colors"
                  aria-label="Fullscreen"
                  title="Full screen (f)"
                >
                  {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} show={toastVisible} />
    </section>
  );
}
