"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import PulsingDownload from "./components/PulsingDownload";
import imageData from "./imageData.json";
import { ImageCard } from "./components/ImageCard";
import ImageModal from "./components/ImageModal";

const DeepMatrixVisualization = dynamic(
  () => import('./components/DeepMatrixVisualization'),
  { ssr: false }
);

type VisualizationImage = {
  imageSrc: string;
  title: string;
  description?: string;
  alignment?: string;
};

const typedImages = imageData as VisualizationImage[];

const Home: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<VisualizationImage | null>(null);
  const [downloadRadius, setDownloadRadius] = useState<number | null>(null);
  const [baseRadius, setBaseRadius] = useState<number | null>(null);
  const heroImages = typedImages.slice(0, 6);
  const additionalImages = typedImages.slice(6);

  const handleCardClick = useCallback((image: VisualizationImage) => {
    setSelectedImage(image);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleRadiusChange = useCallback((radius: number) => {
    setBaseRadius((prev) => (prev === null && radius > 0 ? radius : prev));
    setDownloadRadius(radius);
  }, []);

  const matrixScale = useMemo(() => {
    if (!downloadRadius || !baseRadius) {
      return 1;
    }
    const ratio = downloadRadius / baseRadius;
    return Math.min(21, Math.max(1, ratio));
  }, [downloadRadius, baseRadius]);

  return (
    <>
      <div className="flex h-screen flex-col gap-2 overflow-y-scroll snap-y snap-mandatory md:min-h-screen md:h-auto md:overflow-y-auto md:snap-none">
      {/* Hero Section */}
      <div className="snap-start md:snap-align-none relative flex h-screen flex-col justify-center text-white">
        {/* Background video */}
        <div className="absolute inset-0 -z-30">
          <video
            className="h-full w-full object-cover"
            src="/asset_universe.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden={true}
          />
        </div>
        <div className="absolute inset-0 -z-20 bg-black/60" />

        <div className="absolute inset-0 z-0 pointer-events-auto">
          <DeepMatrixVisualization
            stackCount={1}
            layerCount={8}
            tokenCount={64}
            horizontalSpacing={21.33}
            verticalSpacing={21.33}
            stackSpacing={21.33}
            layerSpacing={21.33}
            maxConnectionsPerToken={8}
            connectionColor="blue"
            cameraZoom={9.0}
            activationChance={0.01}
            fadeSpeed={0.5}
            scaleMultiplier={matrixScale}
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 text-left sm:gap-12 md:flex-row md:items-center md:justify-between pointer-events-none">
          <div className="flex w-full flex-col gap-4 px-4 sm:gap-6 md:max-w-xl md:px-0 pointer-events-none">
            <div className="flex items-center gap-0 pointer-events-none">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">Vince Li</h1>
              <div className="pointer-events-auto">
                <PulsingDownload onRadiusChange={handleRadiusChange} />
              </div>
            </div>
            <p className="text-lg font-light leading-relaxed tracking-tight text-gray-200 sm:text-xl md:text-2xl">
              Full-stack engineer specializing in React, TypeScript, and Python. Building high-performance frontends and scalable data systems with modern ML/AI integration.
            </p>
          </div>

          <div className="hidden md:block" />
        </div>
      </div>

      {/* Hero content grid below landing section */}
        <section className="snap-start md:snap-align-none grid gap-2 grid-cols-1 sm:grid-cols-2 auto-rows-[minmax(500px,1fr)]">
          {heroImages.map((img, index) => (
            <ImageCard
              key={index}
              {...img}
              index={index}
              onClick={() => handleCardClick(img)}
            />
          ))}
        </section>

      {/* Additional panels if more content is provided */}
      {additionalImages.length > 0 && (
          <section className="snap-start md:snap-align-none grid gap-2 grid-cols-1 sm:grid-cols-2 auto-rows-[minmax(500px,1fr)]">
            {additionalImages.map((img, index) => (
              <ImageCard
                key={index + heroImages.length}
                {...img}
                index={index + heroImages.length}
                onClick={() => handleCardClick(img)}
              />
            ))}
          </section>
      )}

      <footer className="snap-start md:snap-align-none flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Vince Li. All rights reserved.</p>
        <p className="text-xs text-gray-500">Crafted with React, Next.js, and a hint of GPU magic.</p>
      </footer>
      </div>
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={handleModalClose} />
      )}
    </>
  );
};

export default Home;
