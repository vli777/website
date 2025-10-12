import { Download } from "lucide-react";
import { useState } from "react";
import { formatGoogleDriveLink } from "../helpers";

const { GDRIVE = '' } = process.env;
const googleDriveShareLink = GDRIVE;
const directDownloadLink = formatGoogleDriveLink(googleDriveShareLink);

const PulsingDownload = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        minWidth: "64px",
        minHeight: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <a
        href={directDownloadLink}
        className={`group flex items-center justify-center transition-all ease-in-out rounded-full ${
          hovered ? 'duration-300' : 'duration-150'
        }`}
        style={{
          width: hovered ? "32px" : "14px",
          height: hovered ? "32px" : "14px",
          padding: hovered ? "6px" : "0",
          background: 'radial-gradient(circle, rgba(240, 245, 255, 1) 0%, rgba(220, 220, 255, 1) 8%, rgba(190, 180, 255, 0.95) 18%, rgba(160, 160, 255, 0.88) 30%, rgba(130, 145, 250, 0.75) 45%, rgba(90, 150, 255, 0.65) 58%, rgba(70, 140, 250, 0.5) 68%, rgba(60, 120, 230, 0.35) 78%, rgba(50, 100, 210, 0.2) 88%, rgba(40, 80, 190, 0.08) 100%)',
          boxShadow: hovered
            ? '0 0 20px rgba(80, 100, 255, 0.8), 0 0 40px rgba(60, 80, 220, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.6)'
            : '0 0 8px rgba(80, 100, 255, 0.6), 0 0 16px rgba(60, 80, 220, 0.4)',
          animation: hovered ? 'none' : 'pulse-glow 3s ease-in-out infinite',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Download Icon - Hidden until hovered */}
        <Download
          className="w-0 h-0 opacity-0 transition-all duration-300 ease-in-out group-hover:w-8 group-hover:h-8 group-hover:opacity-100 text-white"
        />
      </a>
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 8px rgba(80, 100, 255, 0.6), 0 0 16px rgba(60, 80, 220, 0.4);
          }
          50% {
            transform: scale(1.3);
            box-shadow: 0 0 20px rgba(80, 100, 255, 1), 0 0 40px rgba(60, 80, 220, 0.8), 0 0 60px rgba(60, 80, 220, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default PulsingDownload;