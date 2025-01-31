'use client'

import React  from 'react';
import PulsingDownload from './components/PulsingDownload';
import DeepMatrixVisualization from './components/DeepMatrixVisualization';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-black">
      {/* Left Column: Content */}
      <div className="flex flex-col justify-center items-start px-16 md:w-1/2 text-white space-y-4">
        <div className="flex items-center">
          <h1 className="text-4xl font-bold ">VINCE</h1>     
          <PulsingDownload />
        </div>        
        <p className="text-md">  
          I’m a full stack engineer specializing in UI development, visualization, and currently working on machine learning.
        </p>             
      </div>

      {/* Right Column: 3D Animation */}
      <div className="relative md:w-1/2 h-1/2 md:h-full">
        <div className="absolute inset-0">
          <DeepMatrixVisualization
            stackCount={2}
            layerCount={8}
            tokenCount={64}
            horizontalSpacing={64}
            verticalSpacing={64}
            stackSpacing={64}
            layerSpacing={64}
            maxConnectionsPerToken={16}
            connectionColor="blue"
            cameraZoom={2.0}
            rotationSpeed={0.007}
            lodDistanceThreshold={1337}
            activationChance={0.01}
            fadeSpeed={0.5}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
