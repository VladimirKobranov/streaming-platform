import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VideoCard } from "../components/VideoCard";
import log from "../etc/utils";

interface VideoData {
  id: string;
  status: string;
  streamUrl: string;
  createdAt: string;
  thumbnailUrl?: string;
}

export default function VideoListPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        log.d("Fetching video list...");
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/videos`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
        const data = await response.json();
        log.i("Videos loaded:", data.length);
        setVideos(data);
      } catch (err) {
        log.e("Error fetching videos:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [t]);

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="animate-spin text-brand-primary" size={48} />
      <p className="text-secondary">
        {t("common.loading", "Loading videos...")}
      </p>
    </div>
  );

  const renderError = () => (
    <div className="card p-10 text-center flex flex-col items-center gap-4">
      <p className="text-brand-error">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary px-6 py-2 rounded-lg"
      >
        {t("common.retry")}
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="card p-20 text-center flex flex-col items-center gap-6">
      <div className="p-4 bg-white/5 rounded-full">
        <Video size={48} className="text-secondary opacity-50" />
      </div>
      <div>
        <h3 className="text-xl font-medium mb-1">
          {t("videos.no_videos", "No videos found")}
        </h3>
        <p className="text-secondary">
          {t("videos.upload_first", "Upload your first video to see it here.")}
        </p>
      </div>
      <Link to="/" className="btn-primary px-8 py-3 rounded-xl font-semibold">
        {t("upload.btn_start")}
      </Link>
    </div>
  );

  const renderContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();
    if (videos.length === 0) return renderEmpty();

    return (
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    );
  };

  return (
    <div className="container animate-fade mt-6 py-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            {t("videos.title", "All Videos")}
          </h1>
          <p className="text-secondary">
            {t("videos.subtitle", "List of all uploaded streams")}
          </p>
        </div>
        <Link to="/" className="btn-secondary px-6 py-2 rounded-lg text-sm">
          {t("upload.title")}
        </Link>
      </header>

      {renderContent()}
    </div>
  );
}
