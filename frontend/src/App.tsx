import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import UploadPage from "./pages/UploadPage";
import VideoPage from "./pages/VideoPage";
import log from "./etc/utils";

function App() {
  log.d("App component rendered");
  return (
    <Router>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/v/:id" element={<VideoPage />} />
        </Routes>
      </main>
      <footer className="p-6 text-center opacity-50 text-sm border-t border-white/5">
        &copy; {new Date().getFullYear()} LabStream • Private Streaming Service
      </footer>
    </Router>
  );
}

export default App;
