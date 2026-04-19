import ButtonList from "./ButtonList";
import VideoContainer from "./VideoContainer";
import Wrapper from "../components/Wrapper";

const MainContainer = () => {
  return (
    <div className="flex-1 min-w-0 ">
      <ButtonList />
      <VideoContainer />
    </div>
  );
};
export default MainContainer;
