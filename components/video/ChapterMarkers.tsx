type Chapter = {
  title: string;
  timeRangeStartMillis: number;
};

type ChapterMarkersProps = {
  chapters: Chapter[];
  duration: number;
  onJump: (seconds: number) => void;
};

export default function ChapterMarkers({ chapters, duration, onJump }: ChapterMarkersProps) {
  if (!chapters.length || duration <= 0) return null;

  return (
    <>
      {chapters.map((chapter) => {
        const leftPercent = (chapter.timeRangeStartMillis / 1000 / duration) * 100;

        return (
          <button
            key={`${chapter.title}-${chapter.timeRangeStartMillis}`}
            type="button"
            title={chapter.title}
            onClick={(event) => {
              event.stopPropagation();
              onJump(chapter.timeRangeStartMillis / 1000);
            }}
            className="absolute top-0 h-full w-[2px] -translate-x-1/2 bg-white/90"
            style={{ left: `${leftPercent}%` }}
          />
        );
      })}
    </>
  );
}
