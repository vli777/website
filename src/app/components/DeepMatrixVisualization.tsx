import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
  activationChance?: number;    // Chance to activate a connection each frame
  fadeSpeed?: number;           // Speed at which connections fade in/out
  interactionSensitivity?: number; // Multiplier for pointer movement -> rotation velocity
  dragDamping?: number;         // Per-frame damping factor while dragging
  inertiaDecay?: number;        // Per-frame damping once released
  maxRotationVelocity?: number; // Clamp for rotation velocity magnitude
  autoRotationSpeed?: number;   // Base speed for autonomous rotation
  autoRotationJitter?: number;  // Random variation applied over time
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
  activationChance = 0.002,
  fadeSpeed = 0.05,
  interactionSensitivity = 0.42,
  dragDamping = 0.93,
  inertiaDecay = 0.996,
  maxRotationVelocity = 0.42,
  autoRotationSpeed = 0.007,
  autoRotationJitter = 0.001
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    /**
     * Scene, Camera, Renderer
     */
    const scene = new THREE.Scene();

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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    // Limit pixel ratio to reduce resource usage on high-DPI displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.background = 'transparent';
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
    const allPointsObjects: THREE.Points[] = []; // Keep track of Points objects for size animation
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff, // White points
      size: 0.2,       // Smaller default max size
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
        allPointsObjects.push(points);
      })
    );

    /**
     * Build Connections (Intra- and Inter-Layer) - OPTIMIZED
     * Use batched LineSegments instead of individual Line objects
     */
    type Connection = {
      index: number;        // Position in the batched geometry
      center: THREE.Vector3;
      activation: number;
      target: number;
    };

    const connections: Connection[] = [];
    const allConnectionPoints: THREE.Vector3[] = [];
    const allConnectionColors: number[] = [];

    for (const stack of allTokenPositions) {
      for (let layerIndex = 0; layerIndex < stack.length; layerIndex++) {
        const currentLayer = stack[layerIndex];

        // Intra-layer connections
        currentLayer.forEach((start, t) => {
          const allOthers = [...Array(currentLayer.length).keys()].filter(o => o !== t);
          for (let i = 0; i < maxConnectionsPerToken; i++) {
            const randomIndex = Math.floor(Math.random() * allOthers.length);
            const end = currentLayer[allOthers[randomIndex]];

            const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            const index = allConnectionPoints.length / 2;

            allConnectionPoints.push(start.clone(), end.clone());
            allConnectionColors.push(0.6, 0.6, 0.6, 0.6, 0.6, 0.6); // Gray for both vertices

            connections.push({ index, center, activation: 0, target: 0 });
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

              const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
              const index = allConnectionPoints.length / 2;

              allConnectionPoints.push(start.clone(), end.clone());
              allConnectionColors.push(0.6, 0.6, 0.6, 0.6, 0.6, 0.6); // Gray for both vertices

              connections.push({ index, center, activation: 0, target: 0 });
            }
          });
        }
      }
    }

    // Create a single batched LineSegments object
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(allConnectionPoints);
    const colorArray = new Float32Array(allConnectionColors);
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    parentGroup.add(lineSegments);

    /**
     * Animation Loop (Rotating in Place) - OPTIMIZED + DYNAMIC SIZE + MULTI-AXIS ROTATION
     */
    const colorAttribute = lineGeometry.getAttribute('color') as THREE.BufferAttribute;
    const targetColorObj = new THREE.Color(connectionColor);
    const grayColorObj = new THREE.Color(0.6, 0.6, 0.6);

    // Throttle activation checks (only check a subset each frame)
    let activationCheckIndex = 0;
    const activationsPerFrame = Math.max(1, Math.floor(connections.length / 10));

    // Random size pulsing for each point group (0.2 max, can shrink to 0.033 - 6x smaller)
    const pointSizeData = allPointsObjects.map(() => ({
      currentSize: 0.2,
      targetSize: Math.random() * 0.167 + 0.033, // Random target between 0.033 (6x smaller) and 0.2 (max)
      pulseSpeed: Math.random() * 0.05 + 0.02, // Random speed
      nextChangeTime: Math.random() * 2000 + 1000, // Random time until next target change
    }));

    // Interactive rotation state (mouse-driven with inertia)
    const rotationVelocity = new THREE.Vector3(0, 0, 0);
    const lastPointer = new THREE.Vector2();
    let isDragging = false;
    const rotationClamp = Math.PI / 2;

    container.style.cursor = 'grab';
    container.style.touchAction = 'none';

    const updateRotationVelocity = (deltaX: number, deltaY: number) => {
      rotationVelocity.x += deltaY;
      rotationVelocity.y += deltaX;
      const velocityLength = rotationVelocity.length();
      if (velocityLength > maxRotationVelocity) {
        rotationVelocity.setLength(maxRotationVelocity);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      container.setPointerCapture(event.pointerId);
      isDragging = true;
      lastPointer.set(event.clientX, event.clientY);
      container.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = (event.clientX - lastPointer.x) * interactionSensitivity;
      const deltaY = (event.clientY - lastPointer.y) * interactionSensitivity;
      lastPointer.set(event.clientX, event.clientY);
      updateRotationVelocity(deltaX, deltaY);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDragging) return;
      if (typeof container.hasPointerCapture === 'function' && container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
      isDragging = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });

    let lastTime = Date.now();

    const autoRotation = new THREE.Vector3(
      autoRotationSpeed * (Math.random() * 0.6 + 0.7),
      autoRotationSpeed * (Math.random() * 0.8 + 0.6),
      autoRotationSpeed * (Math.random() * 0.5 + 0.35)
    );
    const targetAutoRotation = autoRotation.clone();
    const autoRotationLerp = 0.02;

    async function animate() {
      requestAnimationFrame(animate);

      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      const deltaSeconds = deltaTime / 1000;
      const frameFactor = Math.min(deltaSeconds * 60, 3);

      // Update autonomous rotation target occasionally
      if (Math.random() < 0.01) {
        targetAutoRotation.set(
          autoRotationSpeed * (1 + (Math.random() - 0.5) * autoRotationJitter * 30),
          autoRotationSpeed * 1.2 * (1 + (Math.random() - 0.5) * autoRotationJitter * 30),
          autoRotationSpeed * 0.8 * (1 + (Math.random() - 0.5) * autoRotationJitter * 30)
        );
      }
      autoRotation.lerp(targetAutoRotation, autoRotationLerp * frameFactor);

      // Apply rotation velocity with damping/inertia plus autonomous rotation
      parentGroup.rotation.x = THREE.MathUtils.clamp(
        parentGroup.rotation.x + (rotationVelocity.x + autoRotation.x) * frameFactor,
        -rotationClamp,
        rotationClamp
      );
      parentGroup.rotation.y += (rotationVelocity.y + autoRotation.y) * frameFactor;
      parentGroup.rotation.z += (rotationVelocity.z + autoRotation.z) * frameFactor;

      if (isDragging) {
        rotationVelocity.multiplyScalar(dragDamping);
      } else {
        rotationVelocity.multiplyScalar(inertiaDecay);
        if (rotationVelocity.lengthSq() < 1e-6) {
          rotationVelocity.set(0, 0, 0);
        }
      }

      // Animate point sizes (pulsing effect)
      allPointsObjects.forEach((pointsObj, index) => {
        const data = pointSizeData[index];

        // Smoothly transition to target size
        const diff = data.targetSize - data.currentSize;
        if (Math.abs(diff) > 0.001) {
          data.currentSize += diff * data.pulseSpeed;
          (pointsObj.material as THREE.PointsMaterial).size = data.currentSize;
        }

        // Check if it's time to pick a new target size
        data.nextChangeTime -= deltaTime;
        if (data.nextChangeTime <= 0) {
          data.targetSize = Math.random() * 0.167 + 0.033; // New target between 0.033 (6x smaller) and 0.2
          data.nextChangeTime = Math.random() * 3000 + 1000; // 1-4 seconds
        }
      });

      // Randomly activate a subset of connections each frame
      for (let i = 0; i < activationsPerFrame; i++) {
        const conn = connections[activationCheckIndex];
        if (conn.activation < 0.01 && Math.random() < activationChance) {
          conn.target = 1;
        }
        activationCheckIndex = (activationCheckIndex + 1) % connections.length;
      }

      // Update all connection colors in the buffer
      let needsUpdate = false;
      connections.forEach((conn) => {
        const diff = conn.target - conn.activation;
        if (Math.abs(diff) > 0.001) {
          conn.activation += diff * fadeSpeed;
          if (conn.target === 1 && conn.activation > 0.99) {
            conn.target = 0;
          }

          // Interpolate color
          const color = grayColorObj.clone().lerp(targetColorObj, conn.activation);

          // Update both vertices of this line segment
          colorAttribute.setXYZ(conn.index * 2, color.r, color.g, color.b);
          colorAttribute.setXYZ(conn.index * 2 + 1, color.r, color.g, color.b);

          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        colorAttribute.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    animate();

    const onResize = () => {
      if (!renderer) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      rotationVelocity.set(0, 0, 0);
      autoRotation.set(0, 0, 0);

      // Dispose of geometries and materials
      lineGeometry.dispose();
      lineMaterial.dispose();
      pointsMaterial.dispose();

      try {
        if (renderer) {
          renderer.forceContextLoss();
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
    activationChance,
    fadeSpeed,
    interactionSensitivity,
    dragDamping,
    inertiaDecay,
    maxRotationVelocity,
    autoRotationSpeed,
    autoRotationJitter
  ]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', background: 'transparent' }} />;
};

export default DeepMatrixVisualization;
