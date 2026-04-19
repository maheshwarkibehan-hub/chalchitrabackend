import { Link, useSearchParams } from "react-router-dom";
import useFetchSearchResults from "../hooks/useFetchSearchResults";
import { useSelector } from "react-redux";
import SearchResultCard from "../components/SearchResultCard";
import ResultCardShimmer from "../components/ResultCardShimmer";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search_query");
  useFetchSearchResults(searchQuery);

  const searchResults = useSelector((state) => state.search.searchResults);

  const isLoading = useSelector((state) => state.search.isLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pl-6">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <ResultCardShimmer key={index} />
          ))}
      </div>
    );
  }

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="p-8">
        <p className="text-4xl align-middle font-bold">
          No results found for "{searchQuery}"
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 pl-6">
      {searchResults &&
        searchResults.map((item) => (
          <Link to={"/watch?v=" + item.id.videoId} key={item.id||item.id?.videoId}>
            <SearchResultCard info={item} />
          </Link>
        ))}
    </div>
  );
};

export default SearchResultsPage;
