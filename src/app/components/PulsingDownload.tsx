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
const CORE_GLOW = "rgba(8, 3, 79, 1)"; // #08034f
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
  const ringDiameter = HOVER_SIZE + 16; // ring matches max radius
  const ringClassName = hovered ? "neon-ring neon-ring-hover" : "neon-ring";

  return (
    <div
      className="relative z-30"
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
          className={ringClassName}
          style={{
            width: `${ringDiameter}px`,
            height: `${ringDiameter}px`,
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
              : `radial-gradient(circle, rgba(8,3,79,0.5) 0%, rgba(10,6,66,0.32) 24%, ${GLOW_RING} 46%, ${GLOW_HALO} 88%)`,
            boxShadow: hovered
              ? `0 0 28px ${GLOW_RING}, 0 0 52px ${GLOW_HALO}`
              : `0 0 8px ${REST_GLOW}, 0 0 14px ${GLOW_RING}`,
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
          transform: translate(-50%, -50%) scale(0.9);
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          pointer-events: none;
          opacity: 0;
          mix-blend-mode: screen;
          border: 3px solid rgba(98, 80, 255, 0.18);
          border-top-color: rgba(147, 129, 255, 0.92);
          border-right-color: rgba(110, 93, 255, 0.6);
          border-bottom-color: rgba(76, 68, 200, 0.18);
          border-left-color: rgba(76, 68, 200, 0);
          box-shadow: 0 0 16px rgba(108, 90, 255, 0.35);
          animation: ringSpin 2s linear infinite, ringPulse 2s ease-out infinite;
        }

        .neon-ring-hover {
          opacity: 1 !important;
          border-color: rgba(255, 255, 255, 0.25);
          border-top-color: rgba(255, 255, 255, 0.9);
          border-right-color: rgba(255, 255, 255, 0.6);
          box-shadow: 0 0 38px rgba(255, 255, 255, 0.85);
          animation: ringSpinFast 0.45s linear infinite !important;
        }

        @keyframes ringSpin {
          from {
            transform: translate(-50%, -50%) scale(0.9) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) scale(0.9) rotate(360deg);
          }
        }

        @keyframes ringSpinFast {
          from {
            transform: translate(-50%, -50%) scale(0.95) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) scale(0.95) rotate(360deg);
          }
        }

        @keyframes ringPulse {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.7) rotate(0deg);
          }
          10% {
            opacity: 0.9;
          }
          35% {
            opacity: 0.4;
          }
          68% {
            opacity: 0.08;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PulsingDownload;
