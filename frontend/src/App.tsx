import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import UploadPage from "./pages/UploadPage";
import VideoPage from "./pages/VideoPage";

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/v/:id" element={<VideoPage />} />
        </Routes>
      </main>
      <footer
        style={{
          padding: "1.5rem",
          textAlign: "center",
          opacity: 0.5,
          fontSize: "0.875rem",
        }}
      >
        &copy; {new Date().getFullYear()} LabStream • Private Streaming Service
      </footer>
    </Router>
  );
}

export default App;
