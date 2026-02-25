import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import log from "./etc/utils";

log.i("Initializing LabStream frontend...");

createRoot(document.getElementById("root")!).render(<App />);
