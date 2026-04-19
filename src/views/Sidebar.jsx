import { Link, useLocation } from "react-router-dom";
import {
  CLOCK_ICON_PNG,
  DEGREE_ICON_PNG,
  DOWNLAOD_ICON_PNG,
  FEEDBACK_ICON_PNG,
  GAME_ICON_PNG,
  handleHomeClick,
  HISTORY_ICON_PNG,
  HOME_ICON_PNG,
  INFO_ICON_PNG,
  LIKE_ICON_PNG,
  MUSIC_ICON_PNG,
  NEWS_ICON_PNG,
  PLAY_ICON_PNG,
  PLAYLIST_ICON_PNG,
  REPORT_ICON_PNG,
  SETTING_ICON_PNG,
  SHORTS_ICON_PNG,
  SUBSCRIPTIONS_ICON_PNG_2,
  TROPHY_ICON_PNG,
  YOUTUBE_ICON_PNG,
  YOUTUBE_KIDS_ICON_PNG,
  YOUTUBE_LOGO_PNG,
  YOUTUBE_MUSIC_ICON_PNG,
  YOUTUBE_STUIDIO_ICON_PNG,
} from "../utils/constants";
import SideBarButton from "../components/SideBarButton";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../store/slices/sideBarToggleSlice";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);

  // Helper function to check if route is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <div className="w-[180px] fixed bg-white z-40 shrink-0 h-[calc(100vh-50px)] overflow-y-auto pr-2 pt-2 pl-2 hide-scrollbar md:sticky top-[50px]">
        <div className="pb-2">
          <Link onClick={handleHomeClick} to={"/"}>
            <SideBarButton
              name={"Home"}
              img={HOME_ICON_PNG}
              isActive={isActive("/")}
            />
          </Link>
          <SideBarButton name={"Shorts"} img={SHORTS_ICON_PNG} />
          <Link to={"/subscriptions"}>
            <SideBarButton
              name={"Subscriptions"}
              img={SUBSCRIPTIONS_ICON_PNG_2}
              isActive={isActive("/subscriptions")}
            />
          </Link>
        </div>
        <hr className="text-gray-50" />
        <div className="flex gap-1 items-center py-3">
          <h1 className="text-[12px]">You</h1>
          <i className="ri-arrow-right-s-line"></i>
        </div>
        <div className="pb-2">
          <Link to={"/history"}>
            <SideBarButton
              name={"History"}
              img={HISTORY_ICON_PNG}
              isActive={isActive("/history")}
            />
          </Link>
          <SideBarButton name={"Playlist"} img={PLAYLIST_ICON_PNG} />
          <SideBarButton name={"Your videos"} img={PLAY_ICON_PNG} />
          <SideBarButton name={"Your courses"} img={DEGREE_ICON_PNG} />
          <Link to={"/watch-later"}>
            <SideBarButton
              name={"Watch later"}
              img={CLOCK_ICON_PNG}
              isActive={isActive("/watch-later")}
            />
          </Link>
          <Link to={"/liked"}>
            <SideBarButton
              name={"Liked videos"}
              img={LIKE_ICON_PNG}
              isActive={isActive("/liked")}
            />
          </Link>
          <Link to={'/download'}>
            <SideBarButton name={"Downloads"} img={DOWNLAOD_ICON_PNG} />
          </Link>
        </div>
        <hr className="text-gray-50" />
        <div className="flex gap-1 items-center py-3">
          <h1 className="text-[12px]">Explore</h1>
        </div>
        <div className="pb-2">
          <SideBarButton name={"Music"} img={MUSIC_ICON_PNG} />
          <SideBarButton name={"Gaming"} img={GAME_ICON_PNG} />
          <SideBarButton name={"News"} img={NEWS_ICON_PNG} />
          <SideBarButton name={"Sports"} img={TROPHY_ICON_PNG} />
        </div>
        <hr className="text-gray-50" />

        <div className="flex gap-1 items-center py-3">
          <h1 className="text-[12px]">More from YouTube</h1>
        </div>
        <div className="pb-2">
          <SideBarButton name={"YouTube Premium"} img={YOUTUBE_ICON_PNG} />
          <SideBarButton
            name={"YouTube Studio"}
            img={YOUTUBE_STUIDIO_ICON_PNG}
          />
          <SideBarButton name={"YouTube Music"} img={YOUTUBE_MUSIC_ICON_PNG} />
          <SideBarButton name={"YouTube Kids"} img={YOUTUBE_KIDS_ICON_PNG} />
        </div>
        <hr className="text-gray-50" />
        <div className="pb-2">
          <SideBarButton name={"Setting"} img={SETTING_ICON_PNG} />
          <Link to={"/report"}>
            <SideBarButton name={"Report History"} img={REPORT_ICON_PNG} />
          </Link>

          <SideBarButton name={"Help"} img={INFO_ICON_PNG} />
          <SideBarButton name={"Send feedback"} img={FEEDBACK_ICON_PNG} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
