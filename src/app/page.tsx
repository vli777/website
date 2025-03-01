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
    <div className="px-8 md:px-16 lg:px-32">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left Column: Content */}
        <div className="flex flex-col justify-center items-start text-white space-y-4 md:w-1/2">
          <div className="flex items-center">
            <h1 className="text-4xl font-bold">VINCE</h1>
            <PulsingDownload />
          </div>
          <p className="text-md">
            Full stack software engineer with 6+ years of React, TypeScript, and frontend expertise, complemented by backend development in Python FastAPI. I bring a strong foundation in machine learning, graduate level statistics and quantitative finance, with hands-on experience applying ML/AI towards real world solutions.
          </p>
        </div>

        {/* Right Column: 3D Animation */}
        <div className="relative md:w-1/2 h-1/2 md:h-full">
          <div className="absolute inset-0">
            <DeepMatrixVisualization
              stackCount={1}
              layerCount={8}
              tokenCount={64}
              horizontalSpacing={64}
              verticalSpacing={64}
              stackSpacing={64}
              layerSpacing={64}
              maxConnectionsPerToken={8}
              connectionColor="blue"
              cameraZoom={3.0}
              rotationSpeed={0.007}
              activationChance={0.01}
              fadeSpeed={0.5}
            />
          </div>
        </div>
      </div>

      {/* Parallax Image Cards */}
      <div className="relative z-10 space-y-6 py-8">
        {imageData.map((img, index) => (
          <ImageCard key={index} {...img} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Home;
