import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

interface DeepMatrixVisualizationProps {
  stackCount: number;           // Number of vertical stacks (Y-axis)
  layerCount: number;           // Number of layers per stack (Z-axis)
  tokenCount: number;           // Tokens per layer
  horizontalSpacing?: number;   // Space between tokens horizontally
  verticalSpacing?: number;     // Space between tokens vertically (within a layer)
  stackSpacing?: number;        // Space between stacks along Y-axis
  layerSpacing?: number;        // Space between layers along Z-axis
  maxConnectionsPerToken?: number; // Limit on connections for each token
  connectionColor?: string;     // Target color for active connections (default: blue)
  cameraZoom?: number;          // Camera zoom factor
  rotationSpeed?: number;       // Speed of rotation (radians per frame)
  activationChance?: number;    // Chance to activate a connection each frame
  fadeSpeed?: number;           // Speed at which connections fade in/out
}

/**
 * Color interpolation: gray -> target color
 * @param activation Activation level (0..1)
 * @param connectionColor Target color for active connections
 * @returns Interpolated THREE.Color
 */
function colorFromActivation(activation: number, connectionColor: string): THREE.Color {
  const gray = 0.6; // Base gray level (0..1)
  const targetColor = new THREE.Color(connectionColor);
  const grayColor = new THREE.Color(gray, gray, gray);
  return grayColor.lerp(targetColor, activation);
}

const DeepMatrixVisualization: React.FC<DeepMatrixVisualizationProps> = ({
  stackCount,
  layerCount,
  tokenCount,
  horizontalSpacing = 20,
  verticalSpacing = 6,
  stackSpacing = 20,
  layerSpacing = 10,
  maxConnectionsPerToken = 4,
  connectionColor = '#0000ff', // Default blue
  cameraZoom = 1.5, // Camera zoom factor
  rotationSpeed = 0.001, // Rotation speed (radians per frame)
  activationChance = 0.002,
  fadeSpeed = 0.05
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    /**
     * Scene, Camera, Renderer
     */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background

    // Compute offsets so that tokens are centered in the group.
    const offsetY = (stackCount - 1) * stackSpacing / 2;
    const offsetZ = (layerCount - 1) * layerSpacing / 2;

    // Use a perspective camera looking at the origin.
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    const cameraDistance = Math.max(
      stackCount * stackSpacing,
      layerCount * layerSpacing * cameraZoom
    );
    camera.position.set(0, 0, cameraDistance);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = new WebGPURenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 50, 50).normalize();
    scene.add(dirLight);

    // Parent group for all tokens and connections.
    const parentGroup = new THREE.Group();
    scene.add(parentGroup);

    /**
     * Create Points for Tokens
     */
    const rows = Math.floor(Math.sqrt(tokenCount));
    const cols = Math.ceil(tokenCount / rows);

    const allTokenPositions: THREE.Vector3[][][] = []; // [stack][layer][token]
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff, // White points
      size: 1,         // Smaller size for a "pixel" appearance
    });

    for (let stackIndex = 0; stackIndex < stackCount; stackIndex++) {
      const stackY = stackIndex * stackSpacing - offsetY;

      const stackTokenPositions: THREE.Vector3[][] = [];
      for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
        // Center layers by adding offsetZ so that the middle is at 0.
        const layerZ = -layerIndex * layerSpacing + offsetZ;

        const layerTokenPositions: THREE.Vector3[] = [];
        for (let t = 0; t < tokenCount; t++) {
          const row = Math.floor(t / cols);
          const col = t % cols;
          const x = (col - cols / 2) * horizontalSpacing;
          const y = (row - rows / 2) * verticalSpacing + stackY;
          layerTokenPositions.push(new THREE.Vector3(x, y, layerZ));
        }
        stackTokenPositions.push(layerTokenPositions);
      }
      allTokenPositions.push(stackTokenPositions);
    }

    allTokenPositions.forEach((stack) =>
      stack.forEach((layer) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(layer);
        const points = new THREE.Points(geometry, pointsMaterial);
        parentGroup.add(points);
      })
    );

    /**
     * Build Connections (Intra- and Inter-Layer)
     */
    type Connection = {
      line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
      center: THREE.Vector3;
      activation: number;
      target: number;
    };

    const connections: Connection[] = [];

    for (const stack of allTokenPositions) {
      for (let layerIndex = 0; layerIndex < stack.length; layerIndex++) {
        const currentLayer = stack[layerIndex];

        // Intra-layer connections
        currentLayer.forEach((start, t) => {
          const allOthers = [...Array(currentLayer.length).keys()].filter(o => o !== t);
          for (let i = 0; i < maxConnectionsPerToken; i++) {
            const randomIndex = Math.floor(Math.random() * allOthers.length);
            const end = currentLayer[allOthers[randomIndex]];
            const points = [start.clone(), end.clone()];
            const geom = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
              color: 0x808080,
              transparent: true,
              opacity: 0.2,
            });
            const line = new THREE.Line(geom, mat);
            const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            parentGroup.add(line);
            connections.push({ line, center, activation: 0, target: 0 });
          }
        });

        // Inter-layer connections (current to next layer)
        if (layerIndex < stack.length - 1) {
          const nextLayer = stack[layerIndex + 1];
          currentLayer.forEach((start) => {
            const allOthers = [...Array(nextLayer.length).keys()];
            for (let i = 0; i < maxConnectionsPerToken; i++) {
              const randomIndex = Math.floor(Math.random() * allOthers.length);
              const end = nextLayer[allOthers[randomIndex]];
              const points = [start.clone(), end.clone()];
              const geom = new THREE.BufferGeometry().setFromPoints(points);
              const mat = new THREE.LineBasicMaterial({
                color: 0x808080,
                transparent: true,
                opacity: 0.2,
              });
              const line = new THREE.Line(geom, mat);
              const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
              parentGroup.add(line);
              connections.push({ line, center, activation: 0, target: 0 });
            }
          });
        }
      }
    }

    /**
     * Animation Loop (Rotating in Place)
     */
    function animate() {
      requestAnimationFrame(animate);

      // Rotate the entire parent group around its center (y-axis).
      parentGroup.rotation.y += rotationSpeed;

      // Update camera frustum
      camera.updateMatrixWorld();
      const frustum = new THREE.Frustum();
      const matrix = new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      frustum.setFromProjectionMatrix(matrix);

      // Activate and update connections
      connections.forEach((conn) => {
        if (conn.activation < 0.01 && Math.random() < activationChance) {
          conn.target = 1;
        }
        if (frustum.containsPoint(conn.center)) {
          conn.line.visible = true;
          const diff = conn.target - conn.activation;
          conn.activation += diff * fadeSpeed;
          if (conn.target === 1 && conn.activation > 0.99) {
            conn.target = 0;
          }
          const mat = conn.line.material as THREE.LineBasicMaterial;
          mat.color = colorFromActivation(conn.activation, connectionColor);
          mat.opacity = 0.2 + 0.8 * conn.activation;
        } else {
          conn.line.visible = false;
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      try {
        if (renderer && typeof renderer.dispose === 'function') {
          renderer.dispose();
        }
      } catch (error) {
        console.warn("Error during renderer disposal:", error);
      }
      scene.clear();
      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    stackCount,
    layerCount,
    tokenCount,
    horizontalSpacing,
    verticalSpacing,
    stackSpacing,
    layerSpacing,
    maxConnectionsPerToken,
    connectionColor,
    cameraZoom,
    rotationSpeed,
    activationChance,
    fadeSpeed
  ]);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', background: '#000' }} />;
};

export default DeepMatrixVisualization;
