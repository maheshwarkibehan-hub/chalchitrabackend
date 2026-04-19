const SuggestionCardShimmer = () => {
  return (
    <div className="flex gap-2 px-2 rounded-xl p-1 mb-2 animate-pulse">
      {/* Image shimmer - Fixed width */}
      <div className="shrink-0">
        <div className="w-[168px] h-[94px] bg-gray-200 rounded-lg"></div>
      </div>

      {/* Text content shimmer */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
        {/* Title lines */}
        <div className="space-y-2">
          <div className="h-[18px] bg-gray-200 rounded w-full"></div>
          <div className="h-[18px] bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Channel name */}
        <div className="h-2.5 bg-gray-200 rounded w-24"></div>

        {/* Views and time */}
        <div className="flex gap-2 items-center">
          <div className="h-2.5 bg-gray-200 rounded w-16"></div>
          <div className="h-2.5 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCardShimmer;
