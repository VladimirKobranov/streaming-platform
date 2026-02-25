import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Hls from "hls.js";
import { Loader2, AlertCircle } from "lucide-react";

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<
    "processing" | "ready" | "loading" | "error"
  >("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pollInterval: number;

    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/video/${id}`);
        if (!response.ok) throw new Error("Video not found");

        const data = await response.json();
        setStatus(data.status);

        if (data.status === "ready" || data.status === "processing") {
          // Keep polling if processing, but we can try to initialize player anyway
          // since task says "start playing before encoding finishes"
          // Actually, we'll initialize if processing or ready.
          if (data.status === "processing") {
            // Keep polling to update status text, but start player
          } else {
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to load video");
        clearInterval(pollInterval);
      }
    };

    checkStatus();
    pollInterval = window.setInterval(checkStatus, 2000);

    return () => clearInterval(pollInterval);
  }, [id]);

  useEffect(() => {
    if ((status === "ready" || status === "processing") && videoRef.current) {
      const hlsUrl = `http://localhost:8080/streams/${id}/master.m3u8`;

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // videoRef.current?.play();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            // If it's a 404, maybe it's just not ready yet (processing hasn't written master.m3u8)
            // We'll let it retry or just wait for next poll
          }
        });

        return () => hls.destroy();
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = hlsUrl;
      }
    }
  }, [status, id]);

  return (
    <div className="container animate-fade mt-6">
      <div className="card !p-3 overflow-hidden flex flex-col min-h-[400px]">
        {status === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={48} />
            <p className="text-secondary">Checking video status...</p>
          </div>
        )}

        {status === "processing" && !error && (
          <div className="relative flex-1">
            <video
              ref={videoRef}
              controls
              className="w-full rounded-lg bg-black max-h-[65vh]"
            />
            <div className="absolute top-4 right-4 bg-black/60 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md border border-white/10">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-xs font-semibold">
                Streaming while processing...
              </span>
            </div>
          </div>
        )}

        {status === "ready" && (
          <video
            ref={videoRef}
            controls
            className="w-full rounded-lg bg-black max-h-[65vh]"
          />
        )}

        {status === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <AlertCircle size={48} className="text-brand-error" />
            <p>{error}</p>
            <button
              className="btn-secondary px-6 py-2 rounded-lg"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div>
          <h2 className="mb-1">Video ID: {id}</h2>
          <p className="text-secondary">
            {status === "processing"
              ? "Processing in progress... This may affect historical seeking."
              : "Ready for playback."}
          </p>
        </div>
      </div>
    </div>
  );
}
