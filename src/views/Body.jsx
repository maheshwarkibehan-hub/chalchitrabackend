import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addUser, removeUser } from "../store/slices/userSlice";
import { auth } from "../utils/firebase";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import Header from "./Header";
import Sidebar from "../views/Sidebar";
import ToastNotification from "../components/ToasterNotification";

const Body = () => {
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState(null); // Toast state
  const isSideBar = useSelector((state) => state.sidebar.isSidebarOpen);
  const location = useLocation();
  const isWatchRoute = location.pathname === "/watch";
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, displayName, email } = user;
        dispatch(addUser({ uid: uid, firstName: displayName, email: email }));
        console.log("login success");

        // Show login toast (only if not initial load)
        if (!authLoading) {
          setToast({
            text: "Successfully logged In!",
            bgColor: "bg-green-400",
          });
        }
      } else {
        dispatch(removeUser());
        console.log("login failed");

        // Show logout toast
        if (!authLoading) {
          setToast({ text: "Logged Out successfully", bgColor: "bg-red-600" });
        }
      }
      setAuthLoading(false);
    });
    return unsub;
  }, [dispatch, authLoading]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <Wrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div>
        <Header />
        <div className="flex gap-2">
          {isSideBar && <Sidebar isWatchRoute={isWatchRoute} />}
          <Outlet />
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <ToastNotification
          text={toast.text}
          bgColor={toast.bgColor}
          onClose={() => setToast(null)}
        />
      )}
    </Wrapper>
  );
};

export default Body;
