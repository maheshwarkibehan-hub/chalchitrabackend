import Header from "../views/Header";
import Sidebar from "../views/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header /> 
      <div className="flex flex-1">
        <Sidebar /> 
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
