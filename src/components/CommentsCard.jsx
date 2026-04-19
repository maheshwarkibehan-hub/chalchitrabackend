const CommentsCard = ({ item }) => {
  return (
    <div className="flex gap-4 items-center my-2 bg-gray-50 p-2 rounded-2xl w-[800px]">
      <img
        className="w-8 h-8 rounded-full"
        src={
          item?.snippet?.topLevelComment?.snippet?.authorProfileImageUrl ||
          "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png"
        }
        alt=""
      />
      <div className="">
        <p className="text-[12px] font-bold">
          {item?.snippet?.topLevelComment?.snippet?.authorDisplayName}
        </p>
        <p className="text-[12px]">
          {item?.snippet?.topLevelComment?.snippet?.textDisplay}
        </p>
      </div>
    </div>
  );
};

export default CommentsCard;
