import { useSelector } from "react-redux";
import SuggestionCard from "../components/SuggestionCard";
import { Link } from "react-router-dom";
import SuggestionCardShimmer from "../components/SuggestionCardShimmer";
import useFetchPopularVideos from "../hooks/useFetchPopularVideos";

const SuggestionPage = () => {
  const movies = useSelector((state) => state.movies.popularMovies);
  const category = useSelector((state) => state.filter.category);
  if (!movies) {
    useFetchPopularVideos(category)
    return (
      <div className="p-4 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Loading suggestions...</h2>
        {[...Array(10)].map((_, index) => (
          <SuggestionCardShimmer key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1">
        {movies.map((movie) => (
          <Link to={"/watch?v=" + movie.id} key={movie.id}>
            <SuggestionCard info={movie} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SuggestionPage;
