import { useSelector } from "react-redux";
import useFetchPopularVideos from "../hooks/useFetchPopularVideos";
import useFetchNextPagePopularVideos from "../hooks/useFetchNextPagePopularVideos";
import useFetchCategoryVideos from "../hooks/useFetchCategoryVideos";
import useFetchNextPageCategoryVideos from "../hooks/useFetchNextPageCategoryVideos";
import VideoCard from "../components/VideoCard";
import VideoCardShimmer from "../components/VideoCardShimmer";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

const VideoContainer = () => {
  const category = useSelector((state) => state.filter.category);
  const movies = useSelector((state) => state.movies.popularMovies);
  const categoryMovies = useSelector((state) => state.movies.categoryMovies);
  const categoryNextPageToken = useSelector(
    (state) => state.movies.categoryNextPageToken
  );
  const popularNextPageToken = useSelector(
    (state) => state.movies.popularNextPageToken
  );
  const isLoading = useSelector((state) => state.movies.isLoading);

  const fetchMorePopularVideos = useFetchNextPagePopularVideos();
  const fetchMoreCategoryVideos = useFetchNextPageCategoryVideos();

  useFetchPopularVideos(category);
  useFetchCategoryVideos(category);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        if (category === "All") {
          if (popularNextPageToken) {
            fetchMorePopularVideos(popularNextPageToken);
          }
        } else {
          if (categoryNextPageToken) {
            fetchMoreCategoryVideos(categoryNextPageToken, category);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    category,
    popularNextPageToken,
    categoryNextPageToken,
    fetchMorePopularVideos,
    fetchMoreCategoryVideos,
  ]);

  // Choose correct list and filter to only complete rows of 3
  const finalList = useMemo(() => {
    const list = category === "All" ? movies : categoryMovies;
    const remainder = list.length % 4;

    // If there's a remainder, remove those last items to make complete rows
    if (remainder !== 0) {
      return list.slice(0, list.length - remainder);
    }

    return list;
  }, [category, movies, categoryMovies]);

  // Shimmer on load
  if (isLoading && finalList.length === 0) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]  md:grid-cols-[repeat(auto-fit,minmax(270px,1fr))]">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <VideoCardShimmer key={i} />
          ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]  md:grid-cols-[repeat(auto-fit,minmax(270px,1fr))]">
      {finalList.map((movie, index) => (
        <Link
          // key={movie.id?.videoId || movie.id}
          key={index}
          to={"/watch?v=" + (movie.id?.videoId || movie.id)}
        >
          <VideoCard info={movie} />
        </Link>
      ))}
    </div>
  );
};

export default VideoContainer;
