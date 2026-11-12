import React, { Component, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import BrainModelRig from './BrainModelRig';
import {
  BRAIN_MODEL_PATH,
  DRACO_DECODER_PATH,
  TNS_PALETTE,
} from './brainModelConfig';
import brainFallbackImg from '../../assets/images/brain_fallback.jpg';

useGLTF.preload(BRAIN_MODEL_PATH, DRACO_DECODER_PATH);

function hasWebGLSupport() {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

class BrainErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, retries: 0 };
    this.retryTimer = null;
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[BrainHeroCanvas] WebGL/GLTF render error:', error, info);
    if (this.state.retries < 2) {
      this.retryTimer = setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          retries: prev.retries + 1,
        }));
      }, 450);
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function StudioLightingRig() {
  return (
    <>
      {/* Balanced warm-ivory sky & deep plum-tinted bounce for organic sulcus occlusion */}
      <hemisphereLight args={['#FFFDF7', '#BFAFC9', 0.68]} />

      {/* Warm anatomical key light casting gentle self-shadowing across gyri & cerebellar folia */}
      <directionalLight
        position={[3.6, 5.2, 4.1]}
        intensity={1.68}
        color="#FFF8EE"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={16}
        shadow-camera-left={-2.2}
        shadow-camera-right={2.2}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-2.2}
        shadow-bias={-0.0003}
        shadow-normalBias={0.018}
        shadow-radius={5}
      />

      {/* Cool frontal-lateral studio fill light preserving soft natural curvature */}
      <directionalLight position={[-4.1, 1.5, 2.8]} intensity={0.56} color="#EEF3FF" />

      {/* Gentle overhead top-back rim light defining longitudinal fissure & silhouette */}
      <directionalLight position={[0.4, 4.6, -3.8]} intensity={0.44} color="#FFF4E5" />

      {/* Understated Society Purple, Heritage Gold & Neural Cyan architectural contour rim accents */}
      <directionalLight
        position={[-3.5, -1.5, -3.4]}
        intensity={0.52}
        color={TNS_PALETTE.purpleSignal}
      />
      <pointLight
        position={[2.6, 1.9, -2.7]}
        intensity={0.78}
        distance={9}
        color={TNS_PALETTE.goldSignal}
      />
      <pointLight
        position={[-2.2, 0.8, 2.5]}
        intensity={0.28}
        distance={7}
        color={TNS_PALETTE.cyanSignal}
      />

      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#FFF8EC"
          scale={[8, 4, 1]}
          position={[0, 4.5, 4]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="ring"
          intensity={0.62}
          color={TNS_PALETTE.goldSignal}
          scale={4}
          position={[3.8, 1.2, -2.5]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.48}
          color={TNS_PALETTE.purple}
          scale={[6, 3, 1]}
          position={[-4, -2, -3]}
          target={[0, 0, 0]}
        />
      </Environment>
    </>
  );
}

function TemporaryBrainFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={brainFallbackImg}
        alt="Anatomical Human Brain"
        className="w-full max-w-[460px] h-auto object-contain select-none [mask-image:radial-gradient(closest-side,#000_78%,transparent_100%)]"
      />
    </div>
  );
}

/**
 * Right-side Homepage Hero realistic 3D anatomical brain container.
 * Uses React Three Fiber + Three.js with gentle rotation, mouse tilt,
 * cortical surface-following purple, gold & cyan signals, automatic WebGL
 * context recovery on refresh, and a matching seamless fallback only when
 * WebGL is genuinely unavailable.
 */
export default function BrainHeroCanvas() {
  const containerRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [webglUnavailable, setWebglUnavailable] = useState(() => !hasWebGLSupport());
  const [canvasRecoveryKey, setCanvasRecoveryKey] = useState(0);
  const contextCleanupRef = useRef(null);

  useEffect(() => {
    return () => {
      if (contextCleanupRef.current) contextCleanupRef.current();
    };
  }, []);

  const handlePointerMove = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
    pointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
  };

  const handlePointerLeave = () => {
    pointerRef.current.x = 0;
    pointerRef.current.y = 0;
  };

  const [viewportMode, setViewportMode] = useState(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, lowPower: false, reducedMotion: false };
    }
    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowCores =
      typeof navigator !== 'undefined' &&
      navigator.hardwareConcurrency &&
      navigator.hardwareConcurrency <= 4;
    return { isMobile, lowPower: isMobile || lowCores, reducedMotion };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMode = () => {
      const isMobile = window.innerWidth < 768;
      const lowCores =
        typeof navigator !== 'undefined' &&
        navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency <= 4;
      setViewportMode({
        isMobile,
        lowPower: isMobile || lowCores,
        reducedMotion: motionQuery.matches,
      });
    };

    window.addEventListener('resize', updateMode, { passive: true });
    motionQuery.addEventListener('change', updateMode);
    return () => {
      window.removeEventListener('resize', updateMode);
      motionQuery.removeEventListener('change', updateMode);
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div className="relative w-full max-w-full h-[280px] min-[400px]:h-[330px] sm:h-[420px] lg:h-[540px] flex items-center justify-center overflow-hidden">
        <TemporaryBrainFallback />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={viewportMode.isMobile ? undefined : handlePointerMove}
      onPointerLeave={viewportMode.isMobile ? undefined : handlePointerLeave}
      className="relative w-full max-w-full h-[280px] min-[400px]:h-[330px] sm:h-[420px] lg:h-[540px] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D Anatomical Human Brain"
    >
      <BrainErrorBoundary fallback={<TemporaryBrainFallback />}>
        <Canvas
          key={canvasRecoveryKey}
          shadows={viewportMode.lowPower ? false : 'soft'}
          dpr={viewportMode.lowPower ? [1, 1.35] : [1, 2]}
          camera={{ position: [0, 0.05, viewportMode.isMobile ? 4.95 : 4.62], fov: 35 }}
          gl={{
            alpha: true,
            antialias: !viewportMode.isMobile,
            powerPreference: viewportMode.lowPower ? 'low-power' : 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.02,
          }}
          onCreated={({ gl }) => {
            if (contextCleanupRef.current) contextCleanupRef.current();
            const dom = gl.domElement;
            const onLost = (event) => {
              event.preventDefault();
            };
            const onRestored = () => {
              setWebglUnavailable(false);
              setCanvasRecoveryKey((k) => k + 1);
            };
            dom.addEventListener('webglcontextlost', onLost, false);
            dom.addEventListener('webglcontextrestored', onRestored, false);
            contextCleanupRef.current = () => {
              dom.removeEventListener('webglcontextlost', onLost, false);
              dom.removeEventListener('webglcontextrestored', onRestored, false);
            };
          }}
          className="w-full h-full touch-pan-y"
        >
          <StudioLightingRig />

          <Suspense fallback={null}>
            <BrainModelRig
              pointerRef={pointerRef}
              compact={viewportMode.lowPower}
              reducedMotion={viewportMode.reducedMotion}
            />
          </Suspense>

          {!viewportMode.lowPower && (
            <ContactShadows
              position={[0, -0.96, 0]}
              opacity={0.28}
              scale={3.8}
              blur={2.5}
              far={2.2}
              color="#34283F"
            />
          )}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.07}
            rotateSpeed={0.55}
            minPolarAngle={Math.PI / 3.4}
            maxPolarAngle={(Math.PI * 2) / 3}
          />
        </Canvas>
      </BrainErrorBoundary>
    </div>
  );
}
