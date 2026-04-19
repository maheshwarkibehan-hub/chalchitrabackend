import { useSelector } from "react-redux";
import { useChannel } from "../hooks/useFetchChannels";
import { formatViews, timeAgo } from "../utils/constants";

const VideoCard = ({ info }) => {
  // Early return for invalid data
  if (!info) return null;

  // Destructure channel data cleanly
  const { snippet } = info;
  const { channelTitle, title, thumbnails, channelId, publishedAt } = snippet;
  const viewCount = info.statistics?.viewCount || 0;

  // Fetch channel data
  useChannel(channelId);
  const channelInfo = useSelector((state) => state.channel.channels[channelId]);

  // Extract channel avatar safely
  const channelAvatar = channelInfo?.snippet?.thumbnails?.medium?.url;
  const channelPublishedDate = channelInfo?.snippet?.publishedAt;

  return (
    <div className="p-2 transition-all ease-in-out duration-500 cursor-pointer hover:bg-gray-200 rounded-2xl my-2 animate-fadeIn">
      {/* Video Thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-300">
        <img
          className="w-full h-full object-cover"
          src={thumbnails.medium.url}
          alt={title}
          loading="lazy"
        />
      </div>

      {/* Video Info */}
      <div className="flex gap-3 mt-3">
        {/* Channel Avatar */}
        <div className="shrink-0">
          {channelAvatar ? (
            <img
              className="w-9 h-9 rounded-full object-cover"
              src={channelAvatar}
              alt={`${channelTitle} avatar`}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-300 animate-pulse" />
          )}
        </div>

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          {/* Video Title */}
          <h3 className="font-semibold text-sm leading-5 line-clamp-2 mb-1">
            {title}
          </h3>

          {/* Channel Name */}
          <p className="text-xs text-gray-600 truncate mb-1">{channelTitle}</p>

          {/* Views and Upload Time */}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>{formatViews(viewCount)} views</span>
            <span>•</span>
            <span>{timeAgo(channelPublishedDate || publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
