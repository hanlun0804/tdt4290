import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="flex min-h-screen min-w-max flex-col bg-slate-200">
      <Navbar />
      <div className="h-12 bg-slate-200"></div>
      <div className="flex grow flex-col bg-slate-700 px-10 py-4">
        <Outlet />
      </div>
    </div>
  );
}
