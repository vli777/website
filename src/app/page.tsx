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
      <div className="relative flex flex-col my-3 md:flex-row h-auto md:h-screen">
        {/* Mobile: DeepMatrix Animation as background */}
        <div className="absolute inset-x-0 top-7 md:hidden">
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

        {/* Left Column: Content */}
        <div className="relative z-10 flex flex-col justify-center items-start text-white space-y-3 md:w-1/2 my-7 md:my-3">
          <div className="flex items-center">
            <h1 className="text-4xl font-bold">VINCE</h1>
            <PulsingDownload />
          </div>
          <p className="text-md">
            Full stack engineer with 6 yrs exp, React, TypeScript, and frontend expertise, complemented by backend development in Python and FastAPI. I bring a strong foundation in machine learning, statistics and quantitative finance, with hands-on experience applying ML/AI to fintech analytics, including unsupervised anomaly detection, multi-level clustering, hyperparameter tuning, optimization with SciPy, Pyomo, and stochastic diffusion.
          </p>          
        </div>

        {/* Desktop: Right Column with DeepMatrix Animation */}
        <div className="hidden md:block relative md:w-1/2 h-full">
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

      {/* Parallax Image Cards */}      
      <div className="relative z-10 space-y-6 py-8 mt-64 md:mt-0">
        {imageData.map((img, index) => (
          <ImageCard key={index} {...img} index={index} />
        ))}
      </div>
    </div>
  );
};



export default Home;
