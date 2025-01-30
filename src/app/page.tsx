'use client'

import React from 'react';
import DeepMatrixVisualization from './components/DeepMatrixVisualization';


const Home: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-black">
      {/* Left Column: Content */}
      <div className="flex flex-col justify-center items-start px-16 md:w-1/2 text-white space-y-4">
        <h1 className="text-4xl font-bold italic"></h1>
        <p className="text-md">
          Hi, I’m a full stack engineer specializing in UI development, visualization, and machine learning. 
          Feel free to explore my work and reach out if you’d like to collaborate.
        </p>
        <blockquote className="italic text-gray-500">
        天生我材必有用，千金散尽还复来
        </blockquote>
        <a
          href="https://drive.google.com/uc?id=1_6vKuOfQ0d6FogO61L0bbonMW4J0d96p&export=download"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-lg"
        >
          Resume
        </a>      
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
            maxConnectionsPerToken={8}
            connectionColor="blue"
            cameraZoom={3}
            rotationSpeed={0.002}
            lodDistanceThreshold={2000}
            activationChance={0.02}
            fadeSpeed={0.05}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
