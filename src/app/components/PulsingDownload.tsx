"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatGoogleDriveLink } from "../helpers";

const googleDriveShareLink = process.env.NEXT_PUBLIC_GDRIVE ?? "";
const directDownloadLink = googleDriveShareLink
  ? formatGoogleDriveLink(googleDriveShareLink)
  : "";

const BASE_SIZE = 14;
const HOVER_SIZE = 32;

interface PulsingDownloadProps {
  onRadiusChange?: (radius: number) => void;
}

const PulsingDownload = ({ onRadiusChange }: PulsingDownloadProps) => {
  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const notifyRadius = useCallback(() => {
    if (!onRadiusChange || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const radius = rect.width / 2;
    if (!Number.isNaN(radius)) {
      onRadiusChange(radius);
    }
  }, [onRadiusChange]);

  useEffect(() => {
    notifyRadius();

    if (!onRadiusChange || !anchorRef.current || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      notifyRadius();
    });

    observer.observe(anchorRef.current);

    return () => observer.disconnect();
  }, [notifyRadius, onRadiusChange]);

  const size = hovered ? HOVER_SIZE : BASE_SIZE;

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
        ref={anchorRef}
        href={directDownloadLink}
        className={`group flex items-center justify-center transition-all ease-in-out rounded-full ${
          hovered ? "duration-300" : "duration-150"
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          padding: hovered ? "6px" : "0",
          background:
            "radial-gradient(circle, rgba(240, 245, 255, 1) 0%, rgba(220, 220, 255, 1) 8%, rgba(190, 180, 255, 0.95) 18%, rgba(160, 160, 255, 0.88) 30%, rgba(130, 145, 250, 0.75) 45%, rgba(90, 150, 255, 0.65) 58%, rgba(70, 140, 250, 0.5) 68%, rgba(60, 120, 230, 0.35) 78%, rgba(50, 100, 210, 0.2) 88%, rgba(40, 80, 190, 0.08) 100%)",
          boxShadow: hovered
            ? "0 0 20px rgba(80, 100, 255, 0.8), 0 0 40px rgba(60, 80, 220, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.6)"
            : "0 0 8px rgba(80, 100, 255, 0.6), 0 0 16px rgba(60, 80, 220, 0.4)",
          animation: hovered ? "none" : "pulse-glow 3s ease-in-out infinite",
        }}
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        onFocus={() => {
          setHovered(true);
        }}
        onBlur={() => {
          setHovered(false);
        }}
      >
        {/* Download Icon - Hidden until hovered */}
        <Download className="w-0 h-0 opacity-0 transition-all duration-300 ease-in-out group-hover:w-8 group-hover:h-8 group-hover:opacity-100 text-white" />
      </a>
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 8px rgba(80, 100, 255, 0.6),
              0 0 16px rgba(60, 80, 220, 0.4);
          }
          50% {
            transform: scale(1.3);
            box-shadow: 0 0 20px rgba(80, 100, 255, 1),
              0 0 40px rgba(60, 80, 220, 0.8),
              0 0 60px rgba(60, 80, 220, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default PulsingDownload;
