import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeReport, clearAllReports } from "../store/slices/reportSlice";
import ConfirmationModal from "../components/ConfirmationModal";
import { useState } from "react";

const ReportedVideosPage = () => {
  const dispatch = useDispatch();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const reportedVideos = useSelector((state) => state.report.reportedVideos);

  const handleClearAllReports = () => {
    dispatch(clearAllReports());
    setOpenConfirmModal(false);
  };

  // Convert object to array and sort by reported time (most recent first)
  const videosList = Object.values(reportedVideos).sort(
    (a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)
  );

  const handleRemoveReport = (videoId, e) => {
    e.preventDefault(); 
    dispatch(removeReport(videoId));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const reported = new Date(date);
    const diffInSeconds = Math.floor((now - reported) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return reported.toLocaleDateString();
  };

  if (videosList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center w-full">
        <i className="ri-alarm-warning-line text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-600 mb-2">
          No reported videos
        </h2>
        <p className="text-gray-500">Videos you report will appear here!</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Reported Videos</h1>
            <p className="text-sm text-gray-600">
              {videosList.length} {videosList.length === 1 ? "video" : "videos"}{" "}
              reported
            </p>
          </div>
          <button
            onClick={() => setOpenConfirmModal(true)}
            className="text-gray-600 cursor-pointer px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <i className="ri-delete-bin-line"></i>
            Clear All Reports
          </button>
        </div>

        <div className="space-y-4">
          {videosList.map((video, index) => (
            <Link
              key={video.id}
              to={`/watch?v=${video.id}`}
              className="flex gap-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 group relative"
            >
              {/* Index Number */}
              <div className="shrink-0 w-8 text-center">
                <span className="text-gray-500 font-semibold text-sm">
                  {index + 1}
                </span>
              </div>

              {/* Thumbnail */}
              <div className="relative shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-48 h-28 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <i className="ri-play-circle-line text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
                {/* Reported Badge */}
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <i className="ri-alarm-warning-fill"></i>
                  Reported
                </div>
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {video.channelTitle}
                </p>

                {/* Report Reason */}
                {video.reasonTitle && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                      {video.reasonTitle}
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-2">
                  Reported {formatTimeAgo(video.reportedAt)}
                </p>

                {/* Report Description */}
                {video.description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 bg-gray-50 p-2 rounded border-l-2 border-red-400">
                    <span className="font-semibold">Report: </span>
                    {video.description}
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => handleRemoveReport(video.id, e)}
                className="shrink-0 text-gray-400 cursor-pointer hover:text-red-500 transition-colors p-2 flex items-center gap-1"
                title="Remove the report"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </Link>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={handleClearAllReports}
        title="Clear All Reported Videos?"
        message="Are you sure you want to clear all reported videos from your list?"
        cancelLabel="Cancel"
        confirmLabel="Clear All"
      />
    </>
  );
};

export default ReportedVideosPage;
