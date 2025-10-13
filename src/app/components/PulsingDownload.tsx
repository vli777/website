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
const GLOW_RING = "rgba(14, 8, 58, 1)";
const GLOW_HALO = "rgba(10, 8, 38, 1)"; // #0a0826
const REST_GLOW = "rgba(11, 10, 30, 0.3)";

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

  useEffect(() => {
    notifyRadius();
  }, [hovered, notifyRadius]);

  const size = hovered ? HOVER_SIZE : BASE_SIZE;
  const ringSize = hovered ? size + 30 : size + 22;
  const ringOpacity = hovered ? 0.9 : 0.65;

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
      <div className="relative flex items-center justify-center">
        <span
          className="neon-ring"
          style={{
            width: `${ringSize}px`,
            height: `${ringSize}px`,
            opacity: ringOpacity,
          }}
        />
        <a
          ref={anchorRef}
          href={directDownloadLink}
          className={`relative z-10 group flex items-center justify-center transition-all ease-in-out rounded-full ${
            hovered ? "duration-300" : "duration-150"
          }`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            padding: hovered ? "6px" : "0",
          background: hovered
            ? `radial-gradient(circle, ${CORE_GLOW} 0%, rgba(8,3,79,0.78) 22%, ${GLOW_RING} 48%, ${GLOW_HALO} 88%)`
            : `radial-gradient(circle, rgba(8,3,79,0.55) 0%, rgba(10,6,66,0.35) 24%, ${GLOW_RING} 46%, ${GLOW_HALO} 88%)`,
            boxShadow: hovered
              ? `0 0 28px ${GLOW_RING}, 0 0 52px ${GLOW_HALO}`
              : `0 0 8px ${REST_GLOW}, 0 0 18px ${GLOW_RING}`,
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
          <Download className="w-0 h-0 opacity-0 transition-all duration-300 ease-in-out group-hover:w-8 group-hover:h-8 group-hover:opacity-100 text-white drop-shadow-[0_0_12px_rgba(10,8,38,0.85)]" />
        </a>
      </div>
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 8px ${GLOW_RING},
              0 0 16px ${REST_GLOW};
          }
          50% {
            transform: scale(1.3);
            box-shadow: 0 0 20px ${GLOW_RING},
              0 0 40px ${GLOW_HALO},
              0 0 60px ${GLOW_HALO};
          }
        }

        .neon-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          pointer-events: none;
          mix-blend-mode: screen;
          background: conic-gradient(
            from 0deg,
            rgba(8,3,79,0) 0deg,
            rgba(138, 43, 226, 0.45) 40deg,
            rgba(56, 189, 248, 0.35) 120deg,
            rgba(250, 204, 21, 0.35) 200deg,
            rgba(8,3,79,0) 340deg,
            rgba(8,3,79,0) 360deg
          );
          box-shadow: 0 0 24px rgba(80, 59, 255, 0.35);
          filter: blur(0.8px);
          animation: ringSweep 3s linear infinite;
          mask: radial-gradient(circle, transparent calc(100% - 6px), black calc(100% - 2px));
          -webkit-mask: radial-gradient(circle, transparent calc(100% - 6px), black calc(100% - 2px));
        }

        @keyframes ringSweep {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PulsingDownload;
