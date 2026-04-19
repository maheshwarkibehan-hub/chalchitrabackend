const SideBarButton = ({ name, img, isActive = false }) => {
  return (
    <div
      className={`flex items-center gap-5 px-3 py-1.5 mr-2 rounded-lg transition-all duration-200 cursor-pointer ${
        isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
      }`}
    >
      <img
        src={img}
        alt={name}
        className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-70"}`}
      />
      <span className={`text-[10px] ${isActive ? "font-semibold" : ""}`}>
        {name}
      </span>
    </div>
  );
};

export default SideBarButton;
