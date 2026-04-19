import YoutubeLogo from "../../public/youtubeLogoDark.png";
import HomeIcon from "../../public/home.png";
import ShortsIcon from "../../public/shorts.png";
import SubscriptionIcon from "../../public/subs.png";
import SubscriptionIcon2 from "../../public/subs2.png";
import DegreeIcon from "../../public/degree.png";
import DownlaodIcon from "../../public/download.png";
import GameIcon from "../../public/game.png";
import HistoryIcon from "../../public/history.png";
import InfoIcon from "../../public/info.png";
import LikeIcon from "../../public/like.png";
import ReportIcon from "../../public/report.png";
import SettingIcon from "../../public/setting.png";
import TrophyIcon from "../../public/trophy.png";
import ClockIcon from "../../public/clock.png";
import FeedbackIcon from "../../public/feedback.png";
import PlaylistIcon from "../../public/playlist.png";
import PlayIcon from "../../public/play.png";
import MusicIcon from "../../public/music.png";
import NewsIcon from "../../public/news.png";
import YoutubeIcon from "../../public/youtube.png";
import YoutubeStudioIcon from "../../public/ytStudio.png";
import YoutubeMusicIcon from "../../public/ytMusic.png";
import YoutubeKidsIcon from "../../public/ytKids.png";
import GoogleImage from "../../public/Google-icon.png";
import SaveImage from "../../public/bookmark.png";
import SaveImage2 from "../../public/bookmark2.png";
import FlagImage from "../../public/flag2.png";

export const YOUTUBE_LOGO_PNG = YoutubeLogo;
export const HOME_ICON_PNG = HomeIcon;
export const SHORTS_ICON_PNG = ShortsIcon;
export const SUBSCRIPTIONS_ICON_PNG = SubscriptionIcon;
export const SUBSCRIPTIONS_ICON_PNG_2 = SubscriptionIcon2;
export const HISTORY_ICON_PNG = HistoryIcon;
export const GAME_ICON_PNG = GameIcon;
export const CLOCK_ICON_PNG = ClockIcon;
export const FEEDBACK_ICON_PNG = FeedbackIcon;
export const SETTING_ICON_PNG = SettingIcon;
export const REPORT_ICON_PNG = ReportIcon;
export const INFO_ICON_PNG = InfoIcon;
export const TROPHY_ICON_PNG = TrophyIcon;
export const LIKE_ICON_PNG = LikeIcon;
export const DEGREE_ICON_PNG = DegreeIcon;
export const DOWNLAOD_ICON_PNG = DownlaodIcon;
export const PLAYLIST_ICON_PNG = PlaylistIcon;
export const PLAY_ICON_PNG = PlayIcon;
export const MUSIC_ICON_PNG = MusicIcon;
export const NEWS_ICON_PNG = NewsIcon;
export const YOUTUBE_ICON_PNG = YoutubeIcon;
export const YOUTUBE_STUIDIO_ICON_PNG = YoutubeStudioIcon;
export const YOUTUBE_MUSIC_ICON_PNG = YoutubeMusicIcon;
export const YOUTUBE_KIDS_ICON_PNG = YoutubeKidsIcon;
export const GOOGLE_IMAGE = GoogleImage;
export const SAVE_IMAGE = SaveImage;
export const SAVE_IMAGE2 = SaveImage2;
export const FLAG_IMAGE = FlagImage;

export const proxy = "https://corsproxy.io/?";

export const YOUTUBE_POPULAR_VIDEOS_API =
  "https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=PK&key=";

export const YOUTUBE_CHANNELS_API =
  "https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=AIzaSyDFPRfyCMnByePeoyywRPZQRwBxsT8Rylk";

export const YOUTUBE_SEARCH_SUGGESTION_API = (query) =>
  `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${query}&key=${API_KEY}`;

export const SINGLE_VIDEO_DETAIL_API = (videoId) =>
  `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;

export const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export function formatViews(views) {
  if (views < 1000) {
    return views.toString();
  } else if (views < 1_000_000) {
    return (views / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
}

export const handleHomeClick = (e) => {
  if (location.pathname === "/") {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = now - past; // difference in milliseconds

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
}

export const CALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=829&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
