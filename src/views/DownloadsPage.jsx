import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeDownload,
  clearAllDownloads,
} from "../store/slices/downloadsSlice";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";

const DownloadsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get downloads object and convert to array
  const downloadedVideosObj = useSelector(
    (state) => state.downloads.downloadedVideos
  );
  const downloadedVideos = Object.values(downloadedVideosObj);
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
  

  // Sort by most recent first
  const sortedVideos = [...downloadedVideos].sort(
    (a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt)
  );

  const handleRemove = (videoId) => {
    dispatch(removeDownload(videoId));
  };

  const handleClearAll = () => {
   dispatch(clearAllDownloads())
   setOpenConfirmModal(false)
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch?v=${videoId}`);
  };

  if (sortedVideos.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center h-[60vh] text-center px-4">
        <i className="ri-download-cloud-line text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          No Downloads Yet
        </h2>
        <p className="text-gray-500 mb-4">
          Videos you download will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Downloads</h1>
            <p className="text-sm text-gray-600">
              {sortedVideos.length} video{sortedVideos.length !== 1 ? "s" : ""}{" "}
              downloaded
            </p>
          </div>
          <button
            onClick={() => setOpenConfirmModal(true)}
            className="text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-4">
          {sortedVideos.map((video) => (
            <div
              key={video.videoId}
              className="flex gap-4 bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              {/* Thumbnail */}
              <div
                className="relative cursor-pointer shrink-0"
                onClick={() => handleVideoClick(video.videoId)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-40 h-24 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                  <i className="ri-play-circle-fill text-4xl text-white"></i>
                </div>
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-blue-600"
                  onClick={() => handleVideoClick(video.videoId)}
                >
                  {video.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {video.channelTitle}
                </p>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <i className="ri-download-line"></i>
                    Downloaded{" "}
                    {formatDistanceToNow(new Date(video.downloadedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {video.filename && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[200px]">
                      {video.filename}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => handleVideoClick(video.videoId)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Watch
                </button>
                <button
                  onClick={() => handleRemove(video.videoId)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={handleClearAll}
        title="Clear All Watch Later Videos?"
        message="Are you sure you want to clear all Watch Later Videos History?"
        cancelLabel="Cancel"
        confirmLabel="Clear All"
      />
    </>
  );
};

export default DownloadsPage;
