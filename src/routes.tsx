import { createBrowserRouter } from "react-router-dom";
import Homepage from "./components/Homepage";
import About from "./components/About";
import Dashboard from "./components/Dashboard";
import MealPlanner from "./components/MealPlanner";
import Preferences from "./components/Preferences";
import Profile from "./components/Profile";
import Auth from "./components/Auth";

const router = createBrowserRouter([
  { path: "/", element: <Homepage /> },
  { path: "/about", element: <About /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/meal-planner", element: <MealPlanner /> },
  { path: "/preferences", element: <Preferences /> },
  { path: "/profile", element: <Profile /> },
  { path: "/auth", element: <Auth /> },
]);

export default router;
