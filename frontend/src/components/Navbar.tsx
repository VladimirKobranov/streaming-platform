import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import log from "../etc/utils";

export default function Navbar() {
  log.v("Navbar component rendered");
  return (
    <nav className="sticky top-0 z-10 px-8 py-3 bg-brand-bg/80 backdrop-blur-xl border-b border-white/10">
      <div className="container flex justify-between items-center !px-0">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div className="bg-brand-primary p-2 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
            <PlayCircle size={24} className="text-brand-bg" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
            LabStream
          </span>
        </Link>
      </div>
    </nav>
  );
}
