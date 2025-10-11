'use client';

import React from 'react';
import PulsingDownload from './components/PulsingDownload';
import dynamic from 'next/dynamic';
import imageData from './imageData.json';
import { ImageCard } from './components/ImageCard';

const DeepMatrixVisualization = dynamic(
  () => import('./components/DeepMatrixVisualization'),
  { ssr: false }
);

const Home: React.FC = () => {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory md:min-h-screen md:h-auto md:overflow-y-auto md:snap-none">
      {/* Hero Section */}
      <div className="snap-start md:snap-align-none relative grid h-screen grid-rows-[1fr_auto] items-center gap-10 px-6 py-4 text-white md:grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)] md:grid-rows-1 md:px-16 lg:px-32">
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
        <div className="absolute inset-0 -z-20 bg-black/50" />

        <div className="relative z-10 flex max-w-3xl flex-col gap-4 text-center md:max-w-none md:gap-5 md:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4 md:items-start">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">Vince Li</h1>
            <PulsingDownload />
          </div>
          <p className="text-lg font-light leading-relaxed tracking-tight text-gray-200 sm:text-xl md:text-2xl">
            Full-stack engineer specializing in React, TypeScript, and Python. Building high-performance frontends and scalable data systems with modern ML/AI integration.
          </p>
        </div>

        <div className="pointer-events-none relative z-10 flex h-72 w-full items-center justify-center md:h-[30rem] md:justify-end">
          <div className="relative h-full w-full md:w-[85%]">
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

      {/* Apple-style Banner Panels - Each takes full screen with snap */}
      <div className="grid gap-5">
        {imageData.map((img, index) => (
          <ImageCard key={index} {...img} index={index} />
        ))}
      </div>
    </div>
  );
};



export default Home;
