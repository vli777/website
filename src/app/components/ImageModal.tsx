"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageModalProps {
  image: {
    imageSrc: string;
    title: string;
    description?: string;
  };
  onClose: () => void;
}

const ImageModal = ({ image, onClose }: ImageModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div
        className="relative flex w-full max-w-none flex-col gap-6 rounded-2xl bg-black/75 p-4 shadow-2xl ring-1 ring-white/10 sm:p-8"
        onClick={handleContentClick}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Close visualization"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative w-full">
          <div className="relative h-[80vh] w-full overflow-hidden rounded-xl bg-black">
            <Image
              src={image.imageSrc}
              alt={image.title}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 text-white">
          <h2
            id="image-modal-title"
            className="text-2xl font-semibold tracking-tight"
          >
            {image.title}
          </h2>
          {image.description && (
            <p className="text-base text-gray-300">{image.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
