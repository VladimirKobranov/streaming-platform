import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav
      style={{
        padding: "0.75rem 2rem",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        className="container"
        style={{
          padding: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              background: "var(--primary-color)",
              padding: "0.5rem",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlayCircle size={24} color="#0f172a" />
          </div>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              background: "linear-gradient(to right, #38bdf8, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LabStream
          </span>
        </Link>
      </div>
    </nav>
  );
}
