import { configureStore } from "@reduxjs/toolkit";
import sideBarReducer from "../store/slices/sideBarToggleSlice";
import moviesReducer from "../store/slices/moviesSlice";
import channelReducer from "../store/slices/channelSlice";
import searchReducer from "./slices/searchSlice";
import filterReducer from "./slices/filterSlice";
import commentReducer from "../store/slices/commentsSlice";
import subscriptionReducer from "../store/slices/subscriptionSlice";
import historyReducer from "../store/slices/historySlice";
import likedReducer from "../store/slices/likedSlice";
import watchLaterReducer from "../store/slices/watchLaterSlice";
import userReducer from "../store/slices/userSlice";
import reportReducer from '../store/slices/reportSlice'
import downloadReducer from '../store/slices/downloadsSlice'

const appStore = configureStore({
  reducer: {
    sidebar: sideBarReducer,
    movies: moviesReducer,
    filter: filterReducer,
    channel: channelReducer,
    search: searchReducer,
    comments: commentReducer,
    subscription: subscriptionReducer,
    history: historyReducer,
    liked: likedReducer,
    watchLater: watchLaterReducer,
    user: userReducer,
    report: reportReducer,
    downloads:downloadReducer
  },
});
export default appStore;
