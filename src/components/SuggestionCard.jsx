import { formatViews, timeAgo } from "../utils/constants";

const SuggestionCard = ({ info }) => {
  const { snippet, statistics } = info;
  const { channelTitle, title, thumbnails, publishedAt } = snippet;
  const { viewCount } = statistics;

  return (
    <div className="flex gap-2 px-2 rounded-xl p-1 hover:bg-gray-50 hover:cursor-pointer mb-2">
      {/* Image container - Fixed width, will NOT shrink */}
      <div className="shrink-0">
        <img
          className="w-[168px] h-[94px] object-cover rounded-lg"
          src={thumbnails.medium.url}
          alt={title}
        />
      </div>

      {/* Text content - will take remaining space and handle overflow */}
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-[12px] leading-[18px] font-medium line-clamp-2 mb-1">
          {title}
        </p>
        <p className="text-[10px] text-gray-600 mb-1">{channelTitle}</p>
        <div className="flex gap-1 items-center text-[10px] text-gray-600">
          <span>{formatViews(viewCount)}</span>
          <span>•</span>
          <span>{timeAgo(publishedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
