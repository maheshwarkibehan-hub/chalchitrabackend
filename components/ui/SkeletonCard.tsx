export default function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="aspect-video w-full rounded-xl shimmer" />
      <div className="flex gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full shimmer" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-4 w-11/12 rounded shimmer" />
          <div className="h-4 w-2/3 rounded shimmer" />
          <div className="h-3 w-1/2 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}
