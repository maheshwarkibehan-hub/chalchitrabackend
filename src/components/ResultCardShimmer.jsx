const ResultCardShimmer = () => {
  return (
    <div className="flex gap-3 p-2 w-[900px] animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="rounded-2xl w-[300px] h-[169px] bg-gray-300"></div>

      <div className="mt-3 flex-1">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>

        {/* Time ago skeleton */}
        <div className="mt-1">
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>

        {/* Channel info skeleton */}
        <div className="flex items-center gap-3 mt-3">
          <div className="w-6 h-6 rounded-full bg-gray-300"></div>
          <div className="h-3 bg-gray-300 rounded w-32"></div>
        </div>

        {/* Description skeleton */}
        <div className="mt-3">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ResultCardShimmer;
