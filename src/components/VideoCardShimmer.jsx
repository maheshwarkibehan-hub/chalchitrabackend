const VideoCardShimmer = () => {
  return (
    <div className="p-2 rounded-2xl my-2 animate-pulse">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-300"></div>

      <div className="flex gap-3 mt-3">
        <div className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-gray-300"></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>

          <div className="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>

          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardShimmer