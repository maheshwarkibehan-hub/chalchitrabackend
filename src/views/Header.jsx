import { YOUTUBE_LOGO_PNG } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../store/slices/sideBarToggleSlice";
import Wrapper from "../components/Wrapper";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetchSuggestions } from "../hooks/useFetchSuggestions";
import AuthenticationModal from "../components/AuthenticationModal";
import ProfileDropdown from "../components/ProfileDropDown";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import ConfirmationModal from "../components/ConfirmationModal";

const Header = () => {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const isUser = useSelector((state) => state.user);
  const firstName = isUser?.firstName || "";

  const searchRef = useRef();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Fetch suggestions from hook
  const suggestions = useFetchSuggestions(query);

  const handleSearchButton = () => {
    const inputValue = searchRef.current?.value.trim() || "";
    if (inputValue) {
      navigate(`/results?search_query=${encodeURIComponent(inputValue)}`);
      setShowSuggestion(false);
    }
  };

  const handleSuggestionClick = (title) => {
    setQuery(title);
    navigate(`/results?search_query=${encodeURIComponent(title)}`);
    setShowSuggestion(false);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Logout successful");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <>
      <Wrapper>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white px-2 md:px-6">
          <div className="grid grid-flow-col py-2 items-center">
            <div className="flex items-center col-span-2 md:col-span-1">
              <i
                onClick={() => dispatch(toggleSidebar())}
                className="ri-menu-line text-lg cursor-pointer px-2 py-1 rounded-4xl hover:bg-gray-100"
              ></i>
              <Link to={"/"}>
                <img
                  className="w-20 md:w-24"
                  src={YOUTUBE_LOGO_PNG}
                  alt="Youtube_Logo"
                />
              </Link>
            </div>

            {/* Search input */}
            <div className="col-span-10 md:col-span-8 flex justify-start sm:justify-center">
              <div className="flex flex-col">
                <div className="border border-gray-200 w-[200px] sm:w-[400px] md:w-[450px] lg:w-   [550px] flex rounded-2xl">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowSuggestion(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestion(false), 200)
                    }
                    className="border border-white rounded-tl-2xl rounded-bl-2xl px-3 text-[14px] 
                  w-[200px] sm:w-[400px] md:w-[450px] lg:w-[550px] focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    onClick={handleSearchButton}
                    className="border-l border-gray-200 px-4 bg-gray-50 rounded-tr-2xl rounded-br-2xl cursor-pointer hover:bg-gray-100"
                  >
                    <i className="ri-search-line w-[10%] text-lg"></i>
                  </button>
                </div>

                {/* Suggestion Box */}
                {showSuggestion && suggestions.length > 0 && (
                  <div className="max-h-[400px] overflow-y-auto fixed z-50 top-[45px] border border-gray-50 w-[400px] rounded-xl bg-white px-1 shadow-lg">
                    <ul>
                      {suggestions.map((item) => (
                        <li
                          key={item.id.videoId}
                          onMouseDown={() =>
                            handleSuggestionClick(item.snippet.title)
                          }
                          className="px-2 py-2 text-[13px] rounded-lg m-1 hover:bg-gray-100 cursor-pointer truncate w-full"
                        >
                          <i className="ri-search-line pr-2 text-sm"></i>
                          {item.snippet.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {isUser ? (
              <div className="sm:col-span-3 sm:flex sm:justify-end ">
                <ProfileDropdown
                  firstName={firstName}
                  onLogout={handleLogout}
                />
              </div>
            ) : (
              <div className="sm:col-span-3 sm:flex sm:justify-end ">
                <button
                  onClick={() => setOpenModal(true)}
                  className=" px-3 py-1 cursor-pointer  border border-red-500 rounded-md text-[12px] text-white bg-red-600 font-bold hover:bg-red-700"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-14" />
      </Wrapper>
      <AuthenticationModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};

export default Header;
