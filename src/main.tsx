import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent iOS bounce/overscroll and ensure keyboard pushes content up
if ('virtualKeyboard' in navigator) {
  (navigator as any).virtualKeyboard.overlaysContent = false;
}

createRoot(document.getElementById("root")!).render(<App />);
