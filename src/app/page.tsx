'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import PulsingDownload from './components/PulsingDownload';
import imageData from './imageData.json';
import { ImageCard } from './components/ImageCard';

const DeepMatrixVisualization = dynamic(
  () => import('./components/DeepMatrixVisualization'),
  { ssr: false }
);

const Home: React.FC = () => {
  const heroImages = imageData.slice(0, 6);
  const additionalImages = imageData.slice(6);

  return (
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

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 text-left sm:gap-12 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-4 px-4 sm:gap-6 md:w-1/2 md:px-0">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">Vince Li</h1>
              <PulsingDownload />
            </div>
            <p className="text-lg font-light leading-relaxed tracking-tight text-gray-200 sm:text-xl md:text-2xl">
              Full-stack engineer specializing in React, TypeScript, and Python. Building high-performance frontends and scalable data systems with modern ML/AI integration.
            </p>
          </div>

          <div className="pointer-events-none relative flex w-full shrink-0 justify-center md:w-1/2">
            <div className="relative h-72 w-full sm:h-96 md:h-[28rem]">
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
                rotationSpeed={0.007}
                activationChance={0.01}
                fadeSpeed={0.5}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero content grid below landing section */}
      <section className="snap-start md:snap-align-none grid gap-2 sm:grid-cols-2">
        {heroImages.map((img, index) => (
          <ImageCard key={index} {...img} index={index} />
        ))}
      </section>

      {/* Additional panels if more content is provided */}
      {additionalImages.length > 0 && (
        <section className="snap-start md:snap-align-none grid gap-2 sm:grid-cols-2">
          {additionalImages.map((img, index) => (
            <ImageCard key={index} {...img} index={index + heroImages.length} />
          ))}
        </section>
      )}

      <footer className="snap-start md:snap-align-none flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Vince Li. All rights reserved.</p>
        <p className="text-xs text-gray-500">Crafted with React, Next.js, and a hint of GPU magic.</p>
      </footer>
    </div>
  );
};



export default Home;
