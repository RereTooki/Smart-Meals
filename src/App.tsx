import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Homepage from "./components/Homepage";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Homepage />
      <Analytics />
    </>
  );
}

export default App;
