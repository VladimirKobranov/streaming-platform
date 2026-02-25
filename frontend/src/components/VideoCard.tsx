import { Link } from "react-router-dom";
import { Calendar, PlayCircle } from "lucide-react";

interface VideoData {
  id: string;
  status: string;
  streamUrl: string;
  createdAt: string;
  thumbnailUrl?: string;
}

interface VideoCardProps {
  video: VideoData;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const cacheBuster = new Date(video.createdAt).getTime();

  const renderThumbnail = () => {
    if (video.thumbnailUrl) {
      return (
        <>
          <img
            src={`${apiUrl}${video.thumbnailUrl}?t=${cacheBuster}`}
            alt={video.id}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 left-3 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm p-1.5 border border-white/10">
            <PlayCircle
              className="text-white/90 group-hover:text-brand-primary transition-colors duration-300"
              size={20}
            />
          </div>
        </>
      );
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayCircle
          className="text-white/20 group-hover:text-brand-primary group-hover:scale-110 transition-all duration-300"
          size={64}
        />
      </div>
    );
  };

  return (
    <Link
      to={`/v/${video.id}`}
      className="group card !p-0 overflow-hidden hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative aspect-video bg-black/40">
        {renderThumbnail()}

        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md border ${
              video.status === "ready"
                ? "bg-brand-primary/20 text-brand-primary border-brand-primary/30"
                : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
            }`}
          >
            {video.status}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm truncate opacity-60 group-hover:opacity-100 transition-opacity">
              {video.id}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-secondary">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{video.createdAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
