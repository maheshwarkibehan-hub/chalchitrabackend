import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  CALLBACK_IMAGE,
  FLAG_IMAGE,
  formatViews,
  REPORT_ICON_PNG,
} from "../utils/constants";
import SuggestionPage from "./SuggestionPage";
import { useComments } from "../hooks/useFetchComments";
import CommentsList from "./CommentsList";
import { useChannel } from "../hooks/useFetchChannels";
import SubscribeButton from "../components/SubscribeButton";
import { addToHistory } from "../store/slices/historySlice";
import LikeButton from "../components/LikeButton";
import WatchLaterButton from "../components/WatchLaterButton";
import useFetchSingleVideoData from "../hooks/useFetchSingleVideoData";
import ReportModal from "../components/ReportModal";
import { reportVideo } from "../store/slices/reportSlice";
import DownloadButton from "../components/DownloadButton";

const WatchPage = () => {
  const dispatch = useDispatch();
  const [openReportModal, setOpenReportModal] = useState(false);
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("v");
  const sideBarFlag = useSelector((state) => state.sidebar.isSidebarOpen);
  const isUser = useSelector((state) => state.user);

  const popularMovies = useSelector((state) => state.movies.popularMovies);
  const searchResults = useSelector((state) => state.search.searchResults);
  const categoryMovies = useSelector((state) => state.movies.categoryMovies);
  const isReported = useSelector(
    (state) => !!state.report.reportedVideos[movieId]
  );
  console.log(isReported);

  // Find the movie matching the ID
  let currentVideo = popularMovies.find((movie) => movie.id === movieId);

  // If not found in popularMovies, check categoryMovies
  if (!currentVideo) {
    currentVideo = categoryMovies.find((movie) => {
      const videoIdFromCategory = movie.id?.videoId || movie.id;
      return videoIdFromCategory === movieId;
    });
  }

  // If still not found, check searchResults
  if (!currentVideo) {
    currentVideo = searchResults.find((movie) => {
      const videoIdFromSearch = movie.id?.videoId || movie.id;
      return videoIdFromSearch === movieId;
    });
  }
  if (!currentVideo) {
    const { data } = useFetchSingleVideoData(movieId);
    currentVideo = data;
  }

  // Extract channel ID
  const channelId = currentVideo?.snippet?.channelId;

  const videoTitle = currentVideo?.snippet?.title;
  const videoLikes = currentVideo?.statistics?.likeCount;

  // Fetch channel data
  useChannel(channelId);
  const channelInfo = useSelector((state) => state.channel.channels[channelId]);

  // Extract channel data
  const channelAvatar = channelInfo?.snippet?.thumbnails?.medium?.url;
  // const channelPublishedDate = channelInfo?.snippet?.publishedAt;
  const channelTitle = channelInfo?.snippet?.title;
  const channelSubscriber = channelInfo?.statistics?.subscriberCount;

  // Calling comments hook
  useComments(movieId);

  // Handle Report Submission
  const handleReportSubmit = (reportData) => {
    dispatch(
      reportVideo({
        videoId: movieId,
        videoData: {
          title: videoTitle,
          thumbnail:
            currentVideo?.snippet?.thumbnails?.medium?.url ||
            currentVideo?.snippet?.thumbnails?.default?.url,
          channelTitle: currentVideo?.snippet?.channelTitle,
          channelId: channelId,
          publishedAt: currentVideo?.snippet?.publishedAt,
        },
        reason: reportData.reason,
        description: reportData.description,
        reportedAt: new Date().toISOString(),
      })
    );

    console.log("Video reported successfully!");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieId]);

  // Add video to history when it's played
  useEffect(() => {
    if (currentVideo && movieId && isUser) {
      dispatch(
        addToHistory({
          videoId: movieId,
          videoData: {
            id: movieId,
            title: currentVideo.snippet?.title,
            thumbnail:
              currentVideo.snippet?.thumbnails?.medium?.url ||
              currentVideo.snippet?.thumbnails?.default?.url,
            channelTitle: currentVideo.snippet?.channelTitle,
            channelId: currentVideo.snippet?.channelId,
            publishedAt: currentVideo.snippet?.publishedAt,
            description: currentVideo.snippet?.description,
          },
        })
      );
    }
  }, [movieId, currentVideo, dispatch]);

  // Add debugging
  useEffect(() => {
    if (!channelId) {
      console.log("No channelId found for video:", movieId);
      console.log("currentVideo:", currentVideo);
    }
    if (channelInfo) {
      console.log("Channel info loaded:", channelInfo);
    }
  }, [channelId, movieId, currentVideo, channelInfo]);

  return (
    <>
      <div className="flex gap-6">
        <div className={`${sideBarFlag ? "pl-3" : "pl-50"} flex-1`}>
          <div className="rounded-2xl overflow-hidden w-[800px] h-[450px]">
            <iframe
              width="800"
              height="450"
              className="w-full h-full rounded-2xl"
              src={`https://www.youtube.com/embed/${movieId}?si=GXl76taUpWIp4fFh`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-sm text-black font-bold py-2 px-2">{videoTitle}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {channelAvatar ? (
                <img
                  className="rounded-full w-10 h-10"
                  src={channelAvatar}
                  onError={(e) => (e.target.src = CALLBACK_IMAGE)}
                  alt=""
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              )}
              <div>
                <p className="text-[12px] font-bold">
                  {channelTitle || (
                    <div className="w-18 h-5 rounded-md bg-gray-300"></div>
                  )}
                </p>
                <p className="text-[11px]">
                  {channelSubscriber
                    ? `${formatViews(channelSubscriber)} subscribers`
                    : ""}
                </p>
              </div>
              <div>
                <SubscribeButton
                  channelId={channelId}
                  channelInfo={channelInfo}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <LikeButton
                videoId={movieId}
                videoData={{
                  title: videoTitle,
                  thumbnail:
                    currentVideo?.snippet?.thumbnails?.medium?.url ||
                    currentVideo?.snippet?.thumbnails?.default?.url,
                  channelTitle: currentVideo?.snippet?.channelTitle,
                  channelId: channelId,
                  publishedAt: currentVideo?.snippet?.publishedAt,
                  description: currentVideo?.snippet?.description,
                }}
                likeCount={videoLikes}
              />
              <button className="bg-gray-300 px-4 rounded-3xl text-[12px] flex items-center gap-2">
                <i className="ri-thumb-down-line text-lg"></i>
              </button>
              <WatchLaterButton
                videoId={movieId}
                videoData={{
                  title: videoTitle,
                  thumbnail:
                    currentVideo?.snippet?.thumbnails?.medium?.url ||
                    currentVideo?.snippet?.thumbnails?.default?.url,
                  channelTitle: currentVideo?.snippet?.channelTitle,
                  channelId: channelId,
                  publishedAt: currentVideo?.snippet?.publishedAt,
                  description: currentVideo?.snippet?.description,
                }}
              />
             
              <DownloadButton
                videoId={movieId}
                videoData={{
                  title: videoTitle,
                  thumbnail: currentVideo?.snippet?.thumbnails?.medium?.url,
                  channelTitle: currentVideo?.snippet?.channelTitle,
                  channelId: channelId,
                  publishedAt: currentVideo?.snippet?.publishedAt,
                }}
              />
              <button
                disabled={isReported}
                onClick={() => setOpenReportModal(true)}
                className={`bg-gray-200 px-4 py-0 rounded-full font-semibold text-[10px] flex items-center gap-2 
              hover:bg-gray-300 transition-colors
              ${
                isReported
                  ? "bg-gray-500 cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
              >
                {isReported ? (
                  <>
                    <img className="w-4" src={FLAG_IMAGE} alt="Flag" />
                    Reported
                  </>
                ) : (
                  <>
                    <img className="w-4" src={REPORT_ICON_PNG} alt="Report" />
                    Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Comments section */}
          <div className="mt-3">
            <CommentsList videoId={movieId} />
          </div>
        </div>

        {/* STICKY SUGGESTIONS SIDEBAR */}
        <div className="w-[290px] shrink-0">
          <div className="sticky top-14 max-h-[calc(100vh-2rem)] overflow-y-auto hide-scrollbar">
            <SuggestionPage />
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={openReportModal}
        onClose={() => setOpenReportModal(false)}
        onSubmit={handleReportSubmit}
      />
    </>
  );
};

export default WatchPage;
