import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Hls from "hls.js";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import log from "../etc/utils";

export default function VideoPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<
    "processing" | "ready" | "loading" | "error"
  >("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pollInterval: number;
    setStatus("loading");
    setError(null);

    const checkStatus = async () => {
      try {
        log.d("Polling video status for ID:", id);
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/video/${id}`,
        );
        if (!response.ok) {
          log.e(
            "Status API call failed for ID:",
            id,
            "Status:",
            response.status,
          );
          throw new Error(t("video.error_not_found"));
        }

        const data = await response.json();
        log.v("Received video status:", data.status);

        const backendStatus = data.status as
          | "processing"
          | "ready"
          | "loading"
          | "error";

        if (backendStatus === "error") {
          log.e("Backend reported error status for video", id, ":", data.error);
          setStatus("error");
          setError(
            typeof data.error === "string" && data.error.length > 0
              ? data.error
              : t("video.error_failed"),
          );
          clearInterval(pollInterval);
          return;
        }

        setStatus(backendStatus);

        if (backendStatus === "ready") {
          log.i("Video is ready. Stopping poll.");
          clearInterval(pollInterval);
        } else if (backendStatus === "processing") {
          log.d("Video is still processing, continuing poll...");
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : t("video.error_failed");
        log.e("Poll error for video", id, ":", msg);
        setStatus("error");
        setError(msg);
        clearInterval(pollInterval);
      }
    };

    checkStatus();
    pollInterval = window.setInterval(checkStatus, 2000);

    return () => clearInterval(pollInterval);
  }, [id, t]);

  useEffect(() => {
    if ((status === "ready" || status === "processing") && videoRef.current) {
      const hlsUrl = `${import.meta.env.VITE_APP_API_URL}/streams/${id}/master.m3u8`;

      if (Hls.isSupported()) {
        log.i("Initializing HLS.js player for video:", id);
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        log.d("Loading source:", hlsUrl);
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          log.i("HLS manifest parsed. Autoplay starting...");
          videoRef.current?.play(); // start playing when ready
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            log.e("Fatal HLS error encountered:", data.type, data.details);
            setStatus("error");
            setError(t("video.error_failed"));
            hls.destroy();
          } else {
            log.w("Non-fatal HLS error:", data.type, data.details);
          }
        });

        return () => hls.destroy();
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        log.i("Native HLS supported. Using native player.");
        videoRef.current.src = hlsUrl;
      }
    }
  }, [status, id, t]);

  return (
    <div className="container animate-fade mt-6">
      <div className="card !p-3 overflow-hidden flex flex-col min-h-[400px]">
        {status === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={48} />
            <p className="text-secondary">{t("video.checking_status")}</p>
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
                {t("video.streaming_processing")}
              </span>
            </div>
          </div>
        )}

        {status === "ready" && (
          <video
            ref={videoRef}
            controls
            muted // autoplay
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
              {t("common.retry")}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div>
          <h2 className="mb-1">
            {t("video.video_id")} {id}
          </h2>
          <p className="text-secondary">
            {status === "processing"
              ? t("video.status_processing")
              : status === "loading"
                ? t("video.checking_status")
                : status === "error"
                  ? t("video.error_failed")
                  : t("video.status_ready")}
          </p>
        </div>
      </div>
    </div>
  );
}
