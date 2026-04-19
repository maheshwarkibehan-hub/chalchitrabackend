import { useSelector } from "react-redux";
import { timeAgo } from "../utils/constants";
import { useChannel } from "../hooks/useFetchChannels";

const ResultCard = ({ info }) => {
  const { snippet } = info;
  const { channelTitle, title, thumbnails, channelId, publishedAt } = snippet;
  // const { viewCount } = statistics;
  useChannel(channelId);
  const channelInfo = useSelector((state) => state.channel.channels[channelId]);

  // Extract channel avatar safely
  const channelAvatar = channelInfo?.snippet?.thumbnails?.medium?.url;
  const description = channelInfo?.snippet?.description;
  return (
    <div className="flex gap-3 p-2 cursor-pointer w-[900px]">
      <img
        className="rounded-2xl w-[300px]"
        src={thumbnails.medium.url}
        alt=""
      />
      <div className="mt-3">
        <p className="text-[14px]">{title}</p>
        <div>
          {/* <p>{formatViews(viewCount)}</p> */}
          <p className="text-[10px]  text-gray-500 mt-1">
            {timeAgo(publishedAt)}
          </p>
        </div>
        <div className="flex items-center gap-3 text-gray-500 text-[12px] mt-3">
          <img className="w-6 rounded-full" src={channelAvatar} alt="" />
          <p>{channelTitle}</p>
        </div>
        <p className="leading-5 line-clamp-1 text-gray-500 text-[10px] mt-3">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
