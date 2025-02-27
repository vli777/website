import { Download } from "lucide-react"; 
import { useEffect, useState } from "react";
import { formatGoogleDriveLink } from "../helpers";

const googleDriveShareLink = "https://drive.google.com/file/d/1iEN4P4HA0oOhXsd-oQCIjqZ5DN8upVel/view?usp=drive_link"
const directDownloadLink = formatGoogleDriveLink(googleDriveShareLink);

const PulsingDownload = () => {
  const [pulsing, setPulsing] = useState(true);
  const [hovered, setHovered] = useState(false);   

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsing((prev) => !prev); 
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

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
        className={`group flex items-center justify-center bg-blue-600 transition-all duration-${hovered? 300: 700} ease-in-out rounded-full`}
        style={ hovered ? {
          width: "32px",
          height: "32px",
          padding: "6px"
        }:{
          width: pulsing ? "12px" : "16px", 
          height: pulsing ? "12px" : "16px",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Download Icon - Hidden until hovered */}
        <Download
          className="w-0 h-0 opacity-0 transition-all duration-300 ease-in-out group-hover:w-8 group-hover:h-8 group-hover:opacity-100 text-white"
        />
      </a>
    </div>
  );
};

export default PulsingDownload;