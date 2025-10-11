import { Download } from "lucide-react";
import { useState } from "react";
import { formatGoogleDriveLink } from "../helpers";

const googleDriveShareLink = "https://drive.google.com/file/d/1jEfASk8sQCZrtz1bBK_xuqGgT_l_Xcww/view?usp=sharing"
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
        className={`group flex items-center justify-center bg-blue-600 transition-all ease-in-out rounded-full ${
          hovered ? 'duration-300' : 'duration-150'
        }`}
        style={{
          width: hovered ? "32px" : "14px",
          height: hovered ? "32px" : "14px",
          padding: hovered ? "6px" : "0",
          animation: hovered ? 'none' : 'pulse-smooth 3s ease-in-out infinite',
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
        @keyframes pulse-smooth {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default PulsingDownload;