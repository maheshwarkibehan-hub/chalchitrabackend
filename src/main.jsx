import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import appStore from "./store/appStore.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Body from "./views/Body.jsx";
import MainContainer from "./views/MainContainer.jsx";
import WatchPage from "./views/WatchPage.jsx";
import SearchResultsPage from "./views/SearchResultsPage.jsx";
import SubscriptionsPage from "./views/SubscriptionsPage.jsx";
import HistoryPage from "./views/HistoryPage.jsx";
import LikedVideosPage from "./views/LikedVideosPage.jsx";
import WatchLaterPage from "./views/WatchLaterPage.jsx";
import ReportPage from "./views/ReportPage.jsx";
import DownloadsPage from "./views/DownloadsPage";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Body />,
    children: [
      {
        path: "/",
        element: <MainContainer />,
      },
      {
        path: "watch",
        element: <WatchPage />,
      },
      {
        path: "results",
        element: <SearchResultsPage />,
      },
      {
        path:'subscriptions',
        element:<SubscriptionsPage/>
      },
      {
        path:'history',
        element:<HistoryPage/>
      },
      {
        path:'liked',
        element:<LikedVideosPage/>
      },
      {
        path:'watch-later',
        element:<WatchLaterPage/>
      },
      {
        path:'report',
        element:<ReportPage/>
      },
      {
        path:'download',
        element:<DownloadsPage/>
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={appStore}>
    <RouterProvider router={appRouter}/>
  </Provider>
);
