"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { type KeyboardEvent } from "react";

interface ImageCardProps {
  imageSrc: string;
  title: string;
  description?: string;
  alignment?: string;
  index: number;
  onClick?: () => void;
}

export const ImageCard = (props: ImageCardProps) => {
  const {
    imageSrc,
    title,
    description,
    alignment = "center",
    index,
    onClick,
  } = props;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`group relative h-full w-full overflow-hidden ${
        onClick
          ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          : ""
      }`}
    >
      {/* Banner fills entire grid cell */}
      <div className="relative h-full w-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          priority={index === 0}
          sizes="(min-width: 640px) 50vw, 100vw"
          style={{ objectFit: "cover", objectPosition: alignment }}
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 transition-opacity duration-300 group-hover:from-black/60 group-hover:via-black/50 group-hover:to-black/60" />

        {/* Centered text overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-white">
          <div className="max-w-4xl">
            <motion.h2
              className="text-3xl md:text-5xl font-semibold mb-3 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {title}
            </motion.h2>
            {description && (
              <motion.p
                className="text-base md:text-xl font-normal text-gray-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {description}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
