import React from "react";
import { useSelector } from "react-redux";
import { formatViews } from "../utils/constants";
import SubscribeButton from "../components/SubscribeButton";

const SubscriptionsPage = () => {
  const subscribedChannels = useSelector(
    (state) => state.subscription.subscribedChannels
  );

  const channelsList = Object.values(subscribedChannels);

  if (channelsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center w-full">
        <i className="ri-user-follow-line text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-600 mb-2">
          No subscriptions yet
        </h2>
        <p className="text-gray-500">
          Subscribe to channels to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Subscriptions ({channelsList.length})
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channelsList.map((channel) => (
          <div
            key={channel.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={channel.thumbnail}
                alt={channel.title}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{channel.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {formatViews(channel.subscriberCount)} subscribers
                </p>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {channel.description}
                </p>
                <SubscribeButton
                  channelId={channel.id}
                  channelInfo={{
                    snippet: {
                      title: channel.title,
                      thumbnails: { medium: { url: channel.thumbnail } },
                      description: channel.description,
                    },
                    statistics: {
                      subscriberCount: channel.subscriberCount,
                    },
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Subscribed on{" "}
              {new Date(channel.subscribedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsPage;