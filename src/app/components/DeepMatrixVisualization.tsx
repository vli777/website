import React, { useEffect, useRef, useState } from 'react';
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
  scaleMultiplier?: number;     // External scale factor applied to the group
  onInteractionStart?: () => void; // Callback when user starts interacting
}


const BASE_SCALE = 0.5;
const canUseWebGL = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
};

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
  autoRotationJitter = 0.001,
  scaleMultiplier = 1,
  onInteractionStart
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const parentGroupRef = useRef<THREE.Group | null>(null);
  const viewportBoundsRef = useRef(new THREE.Vector2(18, 12));
  const translationVelocityRef = useRef(new THREE.Vector3());
  const pointerPositionRef = useRef(new THREE.Vector2());
  const pointerActiveRef = useRef(false);
  const pointerTimeRef = useRef(0);
  const scaleRef = useRef(1);
  const boundingSphereRef = useRef(new THREE.Sphere(new THREE.Vector3(), 1));
  const [isSupported, setIsSupported] = useState(true);
  const onInteractionStartRef = useRef(onInteractionStart);
  onInteractionStartRef.current = onInteractionStart;
  const connectionColorRef = useRef(connectionColor);
  connectionColorRef.current = connectionColor;
  const revealProgressRef = useRef(0); // 0 = dark, 1 = fully revealed
  const hasRevealedRef = useRef(false); // Track if reveal has been triggered

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    if (!canUseWebGL()) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    // Reset reveal state on mount/remount
    revealProgressRef.current = 0;
    hasRevealedRef.current = false;
    const translationVelocity = translationVelocityRef.current;
    const pointerPosition = pointerPositionRef.current;
    pointerTimeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const raycaster = new THREE.Raycaster();
    const sphereWorld = new THREE.Sphere();
    const sphereCenter = new THREE.Vector3();
    const pointerNDC = new THREE.Vector2();
    const intersectionPoint = new THREE.Vector3();
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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch (error) {
      console.warn("WebGL renderer initialization failed:", error);
      setIsSupported(false);
      return;
    }

    const resizeRenderer = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(window.innerWidth, rect.width, 1);
      const height = Math.max(window.innerHeight, rect.height, 1);
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const halfWidth = halfHeight * aspect;
      viewportBoundsRef.current.set(halfWidth, halfHeight);
    };

    resizeRenderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.background = 'transparent';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '50%';
    renderer.domElement.style.top = '50%';
    renderer.domElement.style.transform = 'translate(-50%, -50%)';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 50, 50).normalize();
    scene.add(dirLight);

    // Parent group for all tokens and connections.
    const parentGroup = new THREE.Group();
    parentGroupRef.current = parentGroup;
    scene.add(parentGroup);

    /**
     * Create Points for Tokens
     */
    const rows = Math.floor(Math.sqrt(tokenCount));
    const cols = Math.ceil(tokenCount / rows);

    const allTokenPositions: THREE.Vector3[][][] = []; // [stack][layer][token]
    const allPointsObjects: THREE.Points[] = []; // Keep track of Points objects for size animation
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x000000, // Start completely dark
      size: 0.2,
      transparent: true,
      opacity: 0.02, // Start nearly invisible
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const boundingBox = new THREE.Box3();

    // Glow mesh and material
    const glowGeometry = new THREE.SphereGeometry(1, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x798394) },
        opacity: { value: 0 } // Start with no glow
      },
      vertexShader: `
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          intensity = pow( 0.8 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float opacity;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity * opacity;
          gl_FragColor = vec4( glow, 1.0 );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.visible = false;
    parentGroup.add(glowMesh);

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
          const point = new THREE.Vector3(x, y, layerZ);
          layerTokenPositions.push(point);
          boundingBox.expandByPoint(point);
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

    let glowBaseScale = 0;
    if (!boundingBox.isEmpty()) {
      boundingBox.getBoundingSphere(boundingSphereRef.current);
      if (boundingSphereRef.current.radius > 0) {
        glowBaseScale = boundingSphereRef.current.radius * 1.25;
        glowMesh.scale.setScalar(glowBaseScale);
        // Keep glow hidden until revealed - animation loop will show it when appropriate
      }
    }

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
            allConnectionColors.push(0.1, 0.1, 0.18, 0.1, 0.1, 0.18); // Dark for both vertices

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
              allConnectionColors.push(0.1, 0.1, 0.18, 0.1, 0.1, 0.18); // Dark for both vertices

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
      opacity: 0.12, // Start with low opacity
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    parentGroup.add(lineSegments);

    /**
     * Animation Loop (Rotating in Place) - OPTIMIZED + DYNAMIC SIZE + MULTI-AXIS ROTATION
     */
    const colorAttribute = lineGeometry.getAttribute('color') as THREE.BufferAttribute;
    const targetColorObj = new THREE.Color(connectionColor);
    const displayColorObj = new THREE.Color(connectionColor); // Smoothly interpolates to target
    const grayColorObj = new THREE.Color(0.35, 0.45, 0.6);
    const glowCoreColor = new THREE.Color(0xffffff);
    const glowRingColor = new THREE.Color(0xa855f7);
    const glowHaloColor = new THREE.Color(0x38bdf8);
    const iridescentPalette = [
      new THREE.Color(0x22d3ee), // teal
      new THREE.Color(0xfacc15), // yellow
      new THREE.Color(0xfb923c), // orange
    ];
    const currentGlowColor = new THREE.Color();
    const baseLineColor = new THREE.Color(0x1b2240);
    const restGlowColor = new THREE.Color(baseLineColor).lerp(new THREE.Color(0xffffff), 0.06);
    const darkColor = new THREE.Color(0x1a1a2e); // Dark but visible on black background

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
    const maxSpinMagnitude = 2.2;
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

    const triggerReveal = () => {
      if (!hasRevealedRef.current) {
        hasRevealedRef.current = true;
        onInteractionStartRef.current?.();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      container.setPointerCapture(event.pointerId);
      isDragging = true;
      lastPointer.set(event.clientX, event.clientY);
      pointerPosition.set(event.clientX, event.clientY);
      pointerActiveRef.current = true;
      container.style.cursor = 'grabbing';
      triggerReveal();
    };

    const applyHoverImpulse = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        pointerActiveRef.current = false;
        return;
      }

      const localSphere = boundingSphereRef.current;
      if (localSphere.radius <= 0) {
        return;
      }

      pointerNDC.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
      raycaster.setFromCamera(pointerNDC, camera);
      sphereCenter.copy(parentGroup.position);
      sphereWorld.center.copy(sphereCenter);
      sphereWorld.radius = localSphere.radius * scaleRef.current;

      if (raycaster.ray.intersectSphere(sphereWorld, intersectionPoint) === null) {
        pointerActiveRef.current = false;
        return;
      }

      if (!pointerActiveRef.current) {
        pointerPosition.set(event.clientX, event.clientY);
        pointerActiveRef.current = true;
        pointerTimeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
        return;
      }

      const deltaX = event.clientX - pointerPosition.x;
      const deltaY = event.clientY - pointerPosition.y;
      pointerPosition.set(event.clientX, event.clientY);

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (deltaX === 0 && deltaY === 0) {
        pointerTimeRef.current = now;
        return;
      }

      const bounds = viewportBoundsRef.current;
      const pixelToWorldX = (bounds.x * 2) / rect.width;
      const pixelToWorldY = (bounds.y * 2) / rect.height;
      const dt = Math.max((now - pointerTimeRef.current) / 1000, 1 / 240);
      pointerTimeRef.current = now;
      const pixelSpeed = Math.hypot(deltaX, deltaY) / dt;
      const baseImpulse = 0.055;
      const speedBoost = Math.min(pixelSpeed * 0.002, 2.7);
      const angleFactor = Math.min(1.8, speedBoost + 0.4);
      rotationVelocity.y += (deltaX * 0.0012) * angleFactor;
      rotationVelocity.x += (deltaY * 0.0012) * angleFactor;
      if (rotationVelocity.length() > maxSpinMagnitude) {
        rotationVelocity.setLength(maxSpinMagnitude);
      }

      const impulseScale = baseImpulse * (1 + speedBoost);

      translationVelocity.x += deltaX * pixelToWorldX * impulseScale;
      translationVelocity.y -= deltaY * pixelToWorldY * impulseScale;

      // Trigger reveal when cube is moved
      triggerReveal();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (isDragging) {
        const deltaX = (event.clientX - lastPointer.x) * interactionSensitivity;
        const deltaY = (event.clientY - lastPointer.y) * interactionSensitivity;
        lastPointer.set(event.clientX, event.clientY);
        updateRotationVelocity(deltaX, deltaY);
      } else {
        applyHoverImpulse(event);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (isDragging) {
        if (typeof container.hasPointerCapture === 'function' && container.hasPointerCapture(event.pointerId)) {
          container.releasePointerCapture(event.pointerId);
        }
        isDragging = false;
        container.style.cursor = 'grab';
      }
      pointerPosition.set(event.clientX, event.clientY);
      pointerActiveRef.current = true;
      pointerTimeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const releaseFactor = 0.06;
      rotationVelocity.multiplyScalar(1 - releaseFactor);
    };

    const handlePointerLeave = () => {
      pointerActiveRef.current = false;
      pointerTimeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });

    // Scroll detection to trigger reveal
    const handleScroll = () => {
      if (window.scrollY > 10) {
        triggerReveal();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let lastTime = Date.now();

    const autoRotation = new THREE.Vector3(
      autoRotationSpeed * (Math.random() * 0.6 + 0.7),
      autoRotationSpeed * (Math.random() * 0.8 + 0.6),
      autoRotationSpeed * (Math.random() * 0.5 + 0.35)
    );
    const targetAutoRotation = autoRotation.clone();
    const autoRotationLerp = 0.02;
    let animationCancelled = false;

    function animate() {
      if (animationCancelled) return;
      requestAnimationFrame(animate);

      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      const deltaSeconds = deltaTime / 1000;
      const frameFactor = Math.min(deltaSeconds * 60, 3);

      // Smoothly transition connection color
      targetColorObj.set(connectionColorRef.current || '#0000ff');
      displayColorObj.lerp(targetColorObj, 0.03 * frameFactor);

      // Update reveal progress - smoothly animate from 0 to 1 when triggered
      if (hasRevealedRef.current && revealProgressRef.current < 1) {
        revealProgressRef.current = Math.min(1, revealProgressRef.current + 0.02 * frameFactor);
      }
      const revealProgress = revealProgressRef.current;

      const spinMagnitude = rotationVelocity.length();
      const autoSpinMagnitude = autoRotation.length();
      const spinIntensity = THREE.MathUtils.clamp((spinMagnitude + autoSpinMagnitude * 3) / maxSpinMagnitude, 0, 1);
      const easedIntensity = THREE.MathUtils.smoothstep(spinIntensity, 0, 1);
      const glowIntensity = easedIntensity * revealProgress; // Scale by reveal progress
      const paletteChoice = iridescentPalette[Math.floor(Math.random() * iridescentPalette.length)];
      const spectralColor = glowRingColor.clone()
        .lerp(glowHaloColor, glowIntensity)
        .lerp(paletteChoice, glowIntensity * 0.55)
        .lerp(glowCoreColor, Math.pow(glowIntensity, 0.6));
      currentGlowColor.copy(restGlowColor).lerp(spectralColor, glowIntensity);
      // Interpolate from dark to target color based on reveal progress
      currentGlowColor.lerp(darkColor, 1 - revealProgress);
      pointsMaterial.color.copy(currentGlowColor);
      // Base opacity of 0.15 when unrevealed, full opacity when revealed
      const basePointOpacity = 0.15;
      const fullPointOpacity = 0.05 + glowIntensity * 0.45;
      pointsMaterial.opacity = basePointOpacity + (fullPointOpacity - basePointOpacity) * revealProgress;
      pointsMaterial.needsUpdate = true;
      const baseLineOpacity = 0.12;
      const fullLineOpacity = 0.08 + glowIntensity * 0.35;
      lineMaterial.opacity = baseLineOpacity + (fullLineOpacity - baseLineOpacity) * revealProgress;
      lineMaterial.needsUpdate = true;
      grayColorObj.copy(baseLineColor).lerp(currentGlowColor, 0.3 + glowIntensity * 0.5);
      // Also darken grayColorObj when not revealed
      grayColorObj.lerp(darkColor, 1 - revealProgress);
      const glowScale = glowBaseScale * Math.max(scaleRef.current, 0.1) * (1.05 + glowIntensity * 0.55);
      if (glowBaseScale > 0) {
        glowMesh.visible = glowIntensity > 0.02 && revealProgress > 0.1;
        glowMesh.scale.setScalar(glowScale);
        glowMaterial.opacity = glowIntensity * 0.35 * revealProgress;
        glowMaterial.needsUpdate = true;
      }
      targetColorObj.copy(currentGlowColor);

      // Update autonomous rotation target occasionally
      if (Math.random() < 0.01) {
        targetAutoRotation.set(
          autoRotationSpeed * (1 + (Math.random() - 0.5) * autoRotationJitter * 30),
          autoRotationSpeed * 1.2 * (1 + (Math.random() - 0.5) * autoRotationJitter * 30),
          autoRotationSpeed * 0.8 * (1 + (Math.random() - 0.5) * autoRotationJitter * 30)
        );
      }
      autoRotation.lerp(targetAutoRotation, autoRotationLerp * frameFactor);

      if (translationVelocity.lengthSq() > 1e-6) {
        parentGroup.position.x += translationVelocity.x * frameFactor;
        parentGroup.position.y += translationVelocity.y * frameFactor;
        const velocityDamping = Math.pow(0.982, frameFactor);
        translationVelocity.multiplyScalar(velocityDamping);
      }

      const bounds = viewportBoundsRef.current;
      const marginX = bounds.x * 0.05;
      const marginY = bounds.y * 0.05;
      const limitX = Math.max(bounds.x - marginX, 0);
      const limitY = Math.max(bounds.y - marginY, 0);

      // Spring force to pull cube back toward center when outside bounds
      const springStrength = 0.1;
      const softLimitX = limitX * 0.6; // Start pulling back before hard limit
      const softLimitY = limitY * 0.6;

      if (Math.abs(parentGroup.position.x) > softLimitX) {
        const overshoot = parentGroup.position.x - Math.sign(parentGroup.position.x) * softLimitX;
        translationVelocity.x -= overshoot * springStrength * frameFactor;
      }
      if (Math.abs(parentGroup.position.y) > softLimitY) {
        const overshoot = parentGroup.position.y - Math.sign(parentGroup.position.y) * softLimitY;
        translationVelocity.y -= overshoot * springStrength * frameFactor;
      }

      // Gentle drift back to center when idle (no active dragging or recent interaction)
      if (!isDragging && translationVelocity.lengthSq() < 0.01) {
        const centerPull = 0.002;
        parentGroup.position.x *= (1 - centerPull * frameFactor);
        parentGroup.position.y *= (1 - centerPull * frameFactor);
      }

      // Hard boundary clamp with bounce
      if (parentGroup.position.x > limitX) {
        parentGroup.position.x = limitX;
        translationVelocity.x = -Math.abs(translationVelocity.x) * 0.72;
      } else if (parentGroup.position.x < -limitX) {
        parentGroup.position.x = -limitX;
        translationVelocity.x = Math.abs(translationVelocity.x) * 0.72;
      }

      if (parentGroup.position.y > limitY) {
        parentGroup.position.y = limitY;
        translationVelocity.y = -Math.abs(translationVelocity.y) * 0.72;
      } else if (parentGroup.position.y < -limitY) {
        parentGroup.position.y = -limitY;
        translationVelocity.y = Math.abs(translationVelocity.y) * 0.72;
      }

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
      const spinSizeMultiplier = 0.7 + glowIntensity * 0.95;
          (pointsObj.material as THREE.PointsMaterial).size = data.currentSize * spinSizeMultiplier;
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

          // Interpolate color using smoothly transitioning displayColorObj
          const color = grayColorObj.clone().lerp(displayColorObj, conn.activation);

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
      resizeRenderer();
    };
    window.addEventListener('resize', onResize);

    return () => {
      animationCancelled = true; // Stop the animation loop
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', handleScroll);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerleave', handlePointerLeave);
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
      parentGroupRef.current = null;
      parentGroupRef.current = null;
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

  useEffect(() => {
    const group = parentGroupRef.current;
    if (!group) {
      return;
    }
    const clamped = Math.max(0.1, Math.min(21, scaleMultiplier * BASE_SCALE));
    group.scale.set(clamped, clamped, clamped);
    scaleRef.current = clamped;
    const bounds = viewportBoundsRef.current;
    const marginX = bounds.x * 0.05;
    const marginY = bounds.y * 0.05;
    const limitX = Math.max(bounds.x - marginX, 0);
    const limitY = Math.max(bounds.y - marginY, 0);
    group.position.x = THREE.MathUtils.clamp(group.position.x, -limitX, limitX);
    group.position.y = THREE.MathUtils.clamp(group.position.y, -limitY, limitY);
  }, [scaleMultiplier]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {!isSupported && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8, 11, 23, 0.65)',
            color: '#c5ddff',
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            pointerEvents: 'none'
          }}
        >
          WebGL unavailable
        </div>
      )}
    </div>
  );
};

export default DeepMatrixVisualization;
