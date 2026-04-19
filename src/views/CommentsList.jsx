import CommentsCard from "../components/CommentsCard";
import { useComments } from "../hooks/useFetchComments";

const CommentsList = ({ videoId }) => {
  const { comments, isLoading } = useComments(videoId);
  if (isLoading) {
    return (
      <div>
        <h1 className="font-black text-md">Comments:</h1>
        <p className="text-sm text-gray-500 mt-2 font-bold">
          Loading comments...
        </p>
      </div>
    );
  }

  if (!comments || !comments.items || comments.items.length === 0) {
    return (
      <div>
        <h1 className="font-black text-md">Comments:</h1>
        <p className="text-sm text-gray-500 mt-2">No comments available.</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="font-black text-md">Comments:</h1>
      </div>
      <div>
        {comments.items.map((item) => (
          <CommentsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CommentsList;
