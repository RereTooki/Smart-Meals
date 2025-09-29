import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Analytics />
    </>
  );
}

export default App;
