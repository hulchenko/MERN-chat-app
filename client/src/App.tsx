import "./App.css";
import { Outlet } from "react-router-dom";

export const App = () => {
  return (
    <div>
      {/* Nav */}
      <Outlet />
      {/* Footer */}
    </div>
  );
};
