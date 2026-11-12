import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TRAIL_SEGMENTS = 6;
const TRAIL_STEP = 0.024;

const SIGNAL_STYLES = [
  { key: 'purple', filament: '#393185', pulse: '#6352F5' },
  { key: 'gold', filament: '#C18C26', pulse: '#E59F16' },
  { key: 'cyan', filament: '#0082BA', pulse: '#00A8EE' },
];

/**
 * Lift point just outside the cortical gyral surface so nerve pathways transition visibly above folds.
 */
function hugSurfacePoint(pt, clearance = 0.0175) {
  const dir = pt.clone().normalize();
  return pt.clone().addScaledVector(dir, clearance);
}

/**
 * Walk a smooth surface-hugging chain across outer cortical anchors.
 */
function walkSurfaceChain(pool, startIdx, lengthSteps, globalVisited) {
  const chain = [pool[startIdx]];
  const localVisited = new Set([startIdx]);
  let current = pool[startIdx];

  for (let step = 0; step < lengthSteps; step++) {
    let bestIdx = -1;
    let bestScore = Infinity;

    for (let j = 0; j < pool.length; j++) {
      if (localVisited.has(j)) continue;
      const dist = current.point.distanceTo(pool[j].point);
      if (dist < 0.13 || dist > 0.62) continue;

      let score = dist + (globalVisited.has(j) ? 0.18 : 0);
      if (chain.length >= 2) {
        const prevDir = current.point.clone().sub(chain[chain.length - 2].point).normalize();
        const nextDir = pool[j].point.clone().sub(current.point).normalize();
        // Prefer natural smooth continuation without sharp U-turns
        if (prevDir.dot(nextDir) < 0.15) score += 0.65;
      }
      if (score < bestScore) {
        bestScore = score;
        bestIdx = j;
      }
    }

    if (bestIdx === -1) break;
    localVisited.add(bestIdx);
    current = pool[bestIdx];
    chain.push(current);
  }

  chain.forEach((item) => {
    const idx = pool.indexOf(item);
    if (idx !== -1) globalVisited.add(idx);
  });

  return chain;
}

/**
 * Build a CatmullRomCurve3 smoothly hugging spherical cortical curvature between anchors.
 */
function createSurfaceCurve(chain) {
  const waypoints = [];
  for (let k = 0; k < chain.length; k++) {
    const p = hugSurfacePoint(chain[k].point, 0.032);
    waypoints.push(p);

    if (k < chain.length - 1) {
      const a = chain[k].point;
      const b = chain[k + 1].point;
      const maxEndLen = Math.max(a.length(), b.length());
      for (const t of [0.33, 0.67]) {
        const sub = a.clone().lerp(b, t);
        const arcLift = t === 0.33 || t === 0.67 ? 0.056 : 0.045;
        if (sub.lengthSq() > 0.0001) {
          sub.normalize().multiplyScalar(maxEndLen + arcLift);
        }
        waypoints.push(sub);
      }
    }
  }
  return new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.5);
}

/**
 * Compute surface-aligned quaternion orienting local +Z axis toward outward cortical normal.
 */
function quaternionFromNormal(pos) {
  const up = new THREE.Vector3(0, 0, 1);
  const normal = pos.clone().normalize();
  return new THREE.Quaternion().setFromUnitVectors(up, normal);
}

/**
 * Build 10 curated surface pathways (6 primary cortical tracts + 4 synced branching daughter tracts)
 * plus 4 delicate 3D cortical dendrite micro-neurons anchored near primary synapse junctions.
 */
function buildCorticalNetwork(surfaceAnchors) {
  if (!surfaceAnchors || surfaceAnchors.length < 24) {
    return { pathways: [], neurons: [] };
  }

  const radii = surfaceAnchors.map((a) => a.point.length()).sort((a, b) => a - b);
  const medianRadius = radii[Math.floor(radii.length * 0.5)] || 0.85;
  const outer = surfaceAnchors.filter(
    (a) => a.point.length() >= medianRadius * 0.96 && a.point.y > -0.3
  );
  const frontFacing = outer.filter((a) => a.point.z > -0.35 || Math.abs(a.point.x) > 0.25);
  const pool = frontFacing.length >= 22 ? frontFacing : outer.length >= 22 ? outer : surfaceAnchors;

  const pathways = [];
  const usedIndices = new Set();
  const primaryChains = [];

  // 1. Six primary continuous pathways spanning Purple, Gold, and Cyan
  const primaryTarget = Math.min(6, Math.max(4, Math.floor(pool.length / 8)));
  for (let i = 0; i < primaryTarget; i++) {
    let startIdx = Math.floor((i * pool.length) / primaryTarget) % pool.length;
    while (usedIndices.has(startIdx) && usedIndices.size < pool.length) {
      startIdx = (startIdx + 1) % pool.length;
    }

    const chain = walkSurfaceChain(pool, startIdx, 4, usedIndices);
    if (chain.length < 3) continue;

    const curve = createSurfaceCurve(chain);
    const style = SIGNAL_STYLES[i % SIGNAL_STYLES.length];
    const synStops = [0.06, 0.52, 0.94];

    primaryChains.push({ chain, pathwayIdx: pathways.length, style });
    pathways.push({
      id: `primary-path-${i}`,
      curve,
      style,
      isBranch: false,
      parentIdx: -1,
      branchTriggerAt: 0.52,
      speed: 0.095 + (i % 4) * 0.018,
      phaseOffset: (i * 0.27) % 1,
      synapses: synStops.map((at) => {
        const pos = curve.getPointAt(at);
        return { at, pos, quat: quaternionFromNormal(pos) };
      }),
    });
  }

  // 2. Four branching daughter pathways diverging from middle junction hubs of primary tracts
  let branchesCreated = 0;
  for (let i = 0; i < primaryChains.length && branchesCreated < 4; i++) {
    const parentInfo = primaryChains[i];
    const midAnchor = parentInfo.chain[Math.floor(parentInfo.chain.length / 2)];
    const midIdx = pool.indexOf(midAnchor);
    if (midIdx === -1) continue;

    const branchChain = walkSurfaceChain(pool, midIdx, 3, usedIndices);
    if (branchChain.length < 3) continue;

    const branchCurve = createSurfaceCurve(branchChain);
    const branchStyle = SIGNAL_STYLES[(i + 1) % SIGNAL_STYLES.length];

    pathways.push({
      id: `branch-path-${branchesCreated}`,
      curve: branchCurve,
      style: branchStyle,
      isBranch: true,
      parentIdx: parentInfo.pathwayIdx,
      parentSpeed: pathways[parentInfo.pathwayIdx].speed,
      parentPhase: pathways[parentInfo.pathwayIdx].phaseOffset,
      branchTriggerAt: 0.52,
      speed: 0.145 + (branchesCreated % 2) * 0.025,
      phaseOffset: 0,
      synapses: [0.04, 0.58, 0.95].map((at) => {
        const pos = branchCurve.getPointAt(at);
        return { at, pos, quat: quaternionFromNormal(pos) };
      }),
    });
    branchesCreated++;
  }

  // 3. Four realistic delicate branching dendrite micro-neurons near cortical surface hubs
  const neurons = [];
  for (let n = 0; n < Math.min(4, primaryChains.length); n++) {
    const { chain, style } = primaryChains[n];
    const hubAnchor = chain[Math.floor(chain.length / 2)];
    if (!hubAnchor) continue;

    const basePos = hugSurfacePoint(hubAnchor.point, 0.023);
    const normal = basePos.clone().normalize();
    const refAxis = Math.abs(normal.y) < 0.85 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const tangentA = new THREE.Vector3().crossVectors(refAxis, normal).normalize();
    const tangentB = new THREE.Vector3().crossVectors(normal, tangentA).normalize();

    const dendriteCurves = [];
    const branchCount = 5;
    for (let b = 0; b < branchCount; b++) {
      const angle = (b / branchCount) * Math.PI * 2 + n * 0.45;
      const radialDir = tangentA
        .clone()
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(tangentB, Math.sin(angle))
        .normalize();

      const len = b === 0 ? 0.105 : 0.055 + (b % 2) * 0.022;
      const p0 = basePos.clone();
      const p1 = basePos
        .clone()
        .addScaledVector(radialDir, len * 0.52)
        .addScaledVector(normal, 0.002);
      // Slight lateral curl & twig bifurcation
      const sideTwist = tangentA
        .clone()
        .multiplyScalar(-Math.sin(angle))
        .addScaledVector(tangentB, Math.cos(angle));
      const p2 = basePos
        .clone()
        .addScaledVector(radialDir, len)
        .addScaledVector(sideTwist, len * 0.18)
        .addScaledVector(normal, -0.003);

      dendriteCurves.push(new THREE.CatmullRomCurve3([p0, p1, p2]));

      // Add delicate bifurcating terminal twig on alternate dendrites
      if (b % 2 === 1) {
        const twigEnd = p1
          .clone()
          .addScaledVector(radialDir, len * 0.46)
          .addScaledVector(sideTwist, -len * 0.26)
          .addScaledVector(normal, -0.002);
        dendriteCurves.push(new THREE.CatmullRomCurve3([p1.clone(), twigEnd]));
      }
    }

    neurons.push({
      id: `micro-neuron-${n}`,
      somaPos: basePos,
      quat: quaternionFromNormal(basePos),
      color: style.pulse,
      dendriteCurves,
      phase: (n * 0.31) % 1,
    });
  }

  // 4. Eight restrained peri-cortical nerves closely hugging the outer brain silhouette
  const nerves = [];
  const nerveTarget = Math.min(8, Math.floor(pool.length / 4));
  const usedRoots = [];

  for (let idx = 0; idx < pool.length && nerves.length < nerveTarget; idx += Math.max(1, Math.floor(pool.length / 18))) {
    const anchor = pool[idx];
    const tooClose = usedRoots.some((prev) => prev.distanceTo(anchor.point) < 0.46);
    if (tooClose) continue;
    usedRoots.push(anchor.point);

    const rootPos = anchor.point.clone();
    const outDir = rootPos.clone().normalize();
    const refAxis = Math.abs(outDir.y) < 0.85 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const tA = new THREE.Vector3().crossVectors(refAxis, outDir).normalize();
    const tB = new THREE.Vector3().crossVectors(outDir, tA).normalize();

    const sweepAngle = (nerves.length * 1.15) % (Math.PI * 2);
    const sweepDir = tA
      .clone()
      .multiplyScalar(Math.cos(sweepAngle))
      .addScaledVector(tB, Math.sin(sweepAngle))
      .normalize();

    const reach = 0.095 + (nerves.length % 3) * 0.026;
    // Build curves in root-local space so pivot oscillation stays locked on cortex surface
    const p0 = new THREE.Vector3(0, 0, 0);
    const p1 = outDir.clone().multiplyScalar(reach * 0.35).addScaledVector(sweepDir, reach * 0.18);
    const p2 = outDir.clone().multiplyScalar(reach * 0.72).addScaledVector(sweepDir, reach * 0.42);
    const p3 = outDir
      .clone()
      .multiplyScalar(reach)
      .addScaledVector(sweepDir, reach * 0.36)
      .addScaledVector(tB, 0.045);

    const mainCurve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);

    // Bifurcating secondary nerve branch splitting outward smoothly
    const sideDir = tA
      .clone()
      .multiplyScalar(-Math.sin(sweepAngle))
      .addScaledVector(tB, Math.cos(sweepAngle));
    const branchTip = p2
      .clone()
      .addScaledVector(outDir, reach * 0.32)
      .addScaledVector(sideDir, reach * 0.38);
    const branchMid = p2.clone().lerp(branchTip, 0.5).addScaledVector(outDir, 0.02);
    const branchCurve = new THREE.CatmullRomCurve3([p1.clone(), p2.clone(), branchMid, branchTip]);

    const style = SIGNAL_STYLES[nerves.length % SIGNAL_STYLES.length];
    nerves.push({
      id: `peri-nerve-${nerves.length}`,
      rootPos,
      mainCurve,
      branchCurve,
      tipPos: p3,
      branchTipPos: branchTip,
      style,
      speed: 0.24 + (nerves.length % 4) * 0.045,
      phase: (nerves.length * 0.19) % 1,
    });
  }

  return { pathways, neurons, nerves };
}

function DendriteNeuronCluster({ neuron }) {
  const somaRef = useRef(null);
  const dendriteMatRefs = useRef([]);

  const geometries = useMemo(
    () => neuron.dendriteCurves.map((c) => new THREE.TubeGeometry(c, 12, 0.0024, 5, false)),
    [neuron.dendriteCurves]
  );

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
    };
  }, [geometries]);

  useFrame((state) => {
    const wave = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.45 + neuron.phase * Math.PI * 2);
    if (somaRef.current) {
      somaRef.current.scale.setScalar(0.95 + wave * 0.35);
      somaRef.current.material.opacity = 0.55 + wave * 0.38;
    }
    dendriteMatRefs.current.forEach((mat) => {
      if (mat) mat.opacity = 0.36 + wave * 0.38;
    });
  });

  return (
    <group>
      <mesh ref={somaRef} position={neuron.somaPos} quaternion={neuron.quat} scale={[1.15, 0.9, 0.8]}>
        <sphereGeometry args={[0.0145, 10, 10]} />
        <meshBasicMaterial
          color={neuron.color}
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>
      {geometries.map((geo, idx) => (
        <mesh key={`${neuron.id}-dend-${idx}`} geometry={geo}>
          <meshBasicMaterial
            ref={(el) => {
              dendriteMatRefs.current[idx] = el;
            }}
            color={neuron.color}
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function CorticalPathway({ pathway }) {
  const trailHeadRefs = useRef([]);
  const synapseCoreRefs = useRef([]);
  const synapseRippleRefs = useRef([]);

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(pathway.curve, 52, pathway.isBranch ? 0.0034 : 0.0046, 6, false),
    [pathway.curve, pathway.isBranch]
  );

  useEffect(() => {
    return () => {
      tubeGeometry.dispose();
    };
  }, [tubeGeometry]);

  const tempVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    let mainProgress;
    let secondaryProgress = null;
    let activeMask = 1;

    if (pathway.isBranch) {
      // Sync daughter branch signal emission with parent pathway reaching junction hub
      const parentProgress = (t * pathway.parentSpeed + pathway.parentPhase) % 1;
      let deltaAfterHub = parentProgress - pathway.branchTriggerAt;
      if (deltaAfterHub < 0) deltaAfterHub += 1;
      const travelRatio = THREE.MathUtils.clamp(deltaAfterHub / 0.55, 0, 1);
      mainProgress = travelRatio;
      activeMask = deltaAfterHub < 0.55 ? Math.sin(travelRatio * Math.PI) : 0;
    } else {
      mainProgress = (t * pathway.speed + pathway.phaseOffset) % 1;
      secondaryProgress = (t * pathway.speed * 0.82 + pathway.phaseOffset + 0.5) % 1;
    }

    const activeHeads = secondaryProgress !== null ? [mainProgress, secondaryProgress] : [mainProgress];

    // Render crisp head + 5 fading trailing segments per active electrical signal
    activeHeads.forEach((headProg, pIdx) => {
      const baseFade = pathway.isBranch ? activeMask : Math.sin(headProg * Math.PI);

      for (let s = 0; s < TRAIL_SEGMENTS; s++) {
        const refIdx = pIdx * TRAIL_SEGMENTS + s;
        const mesh = trailHeadRefs.current[refIdx];
        if (!mesh) continue;

        const segProgress = (headProg - s * TRAIL_STEP + 1) % 1;
        pathway.curve.getPointAt(segProgress, tempVec);
        mesh.position.copy(tempVec);

        const taper = 1 - s / TRAIL_SEGMENTS;
        const sizeScale = (0.34 + taper * 0.85) * (0.45 + baseFade * 0.65);
        mesh.scale.setScalar(sizeScale);

        const maxOpacity = s === 0 ? 0.86 : 0.52 * Math.pow(taper, 1.35);
        mesh.material.opacity = maxOpacity * THREE.MathUtils.clamp(baseFade * 1.15, 0, 1);
      }
    });

    // Brief synaptic illumination + surface-tangent expanding ripple on arrival
    pathway.synapses.forEach((syn, sIdx) => {
      let activation = 0;
      for (const p of activeHeads) {
        if (pathway.isBranch && activeMask < 0.05) continue;
        const diff = Math.abs(p - syn.at);
        const wrapped = Math.min(diff, 1 - diff);
        const wave = Math.exp(-Math.pow(wrapped / 0.072, 2));
        if (wave > activation) activation = wave;
      }

      const core = synapseCoreRefs.current[sIdx];
      if (core) {
        core.scale.setScalar(0.75 + activation * 0.95);
        core.material.opacity = 0.4 + activation * 0.55;
      }

      const ripple = synapseRippleRefs.current[sIdx];
      if (ripple) {
        const rippleExpand = 0.9 + (1 - Math.max(0, activation - 0.15)) * 1.75;
        ripple.scale.setScalar(activation > 0.2 ? 0.9 + (1 - activation) * 1.85 : rippleExpand * 0.65);
        ripple.material.opacity = activation > 0.15 ? activation * 0.72 : 0.12;
      }
    });
  });

  const pulseCount = pathway.isBranch ? 1 : 2;
  const segmentIndices = Array.from({ length: pulseCount * TRAIL_SEGMENTS }, (_, idx) => idx);

  return (
    <group>
      {/* Fine cortical surface-hugging pathway trace */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={pathway.style.filament}
          transparent
          opacity={pathway.isBranch ? 0.42 : 0.56}
          depthWrite={false}
        />
      </mesh>

      {/* Synaptic activation soma points + surface-tangent pulse ripples */}
      {pathway.synapses.map((syn, sIdx) => (
        <group key={`${pathway.id}-syn-${sIdx}`} position={syn.pos}>
          <mesh
            ref={(el) => {
              synapseCoreRefs.current[sIdx] = el;
            }}
          >
            <sphereGeometry args={[0.013, 10, 10]} />
            <meshBasicMaterial
              color={pathway.style.pulse}
              transparent
              opacity={0.55}
              depthWrite={false}
            />
          </mesh>

          <mesh
            ref={(el) => {
              synapseRippleRefs.current[sIdx] = el;
            }}
            quaternion={syn.quat}
          >
            <ringGeometry args={[0.018, 0.03, 22]} />
            <meshBasicMaterial
              color={pathway.style.pulse}
              transparent
              opacity={0.28}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* Travelling action-potential cores with soft tapered glowing trails */}
      {segmentIndices.map((idx) => (
        <mesh
          key={`${pathway.id}-seg-${idx}`}
          ref={(el) => {
            trailHeadRefs.current[idx] = el;
          }}
        >
          <sphereGeometry args={[idx % TRAIL_SEGMENTS === 0 ? 0.0165 : 0.0125, 10, 10]} />
          <meshBasicMaterial
            color={pathway.style.pulse}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Delicate radiating peri-cortical nerve filament swaying softly around the brain contour,
 * firing bidirectional glowing nerve impulses and illuminating fine terminal buds.
 */
function SurroundingNerveFilament({ nerve }) {
  const pivotRef = useRef(null);
  const mainTrailRefs = useRef([]);
  const branchTrailRefs = useRef([]);
  const tipGlowRef = useRef(null);
  const branchTipGlowRef = useRef(null);

  const mainGeo = useMemo(
    () => new THREE.TubeGeometry(nerve.mainCurve, 24, 0.0028, 6, false),
    [nerve.mainCurve]
  );
  const branchGeo = useMemo(
    () => new THREE.TubeGeometry(nerve.branchCurve, 16, 0.002, 5, false),
    [nerve.branchCurve]
  );

  useEffect(() => {
    return () => {
      mainGeo.dispose();
      branchGeo.dispose();
    };
  }, [mainGeo, branchGeo]);

  const tempVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Subtle biological breathing flex keeping nerve root fixed flush onto cortex
    if (pivotRef.current) {
      pivotRef.current.rotation.x = Math.sin(t * 0.85 + nerve.phase * 6.28) * 0.032;
      pivotRef.current.rotation.z = Math.cos(t * 0.72 + nerve.phase * 6.28) * 0.028;
    }

    const headProgress = (t * nerve.speed + nerve.phase) % 1;
    const branchProgress = (headProgress - 0.25 + 1) % 1;

    // Main nerve efferent impulse + 4-step fading trail
    for (let s = 0; s < 4; s++) {
      const m = mainTrailRefs.current[s];
      if (!m) continue;
      const p = THREE.MathUtils.clamp(headProgress - s * 0.032, 0, 1);
      nerve.mainCurve.getPointAt(p, tempVec);
      m.position.copy(tempVec);
      const fade = Math.sin(p * Math.PI) * (1 - s * 0.22);
      m.scale.setScalar(0.55 + (1 - s * 0.2) * 0.65);
      m.material.opacity = fade * 0.85;
    }

    // Secondary nerve branch impulse + 3-step fading trail
    for (let s = 0; s < 3; s++) {
      const bm = branchTrailRefs.current[s];
      if (!bm) continue;
      const p = THREE.MathUtils.clamp(branchProgress - s * 0.04, 0, 1);
      nerve.branchCurve.getPointAt(p, tempVec);
      bm.position.copy(tempVec);
      const fade = Math.sin(p * Math.PI) * (1 - s * 0.25);
      bm.scale.setScalar(0.5 + (1 - s * 0.22) * 0.55);
      bm.material.opacity = fade * 0.72;
    }

    // Terminal nerve ending illumination as signal reaches outer tip
    const mainTipSpark = Math.exp(-Math.pow((headProgress - 0.92) / 0.08, 2));
    if (tipGlowRef.current) {
      tipGlowRef.current.scale.setScalar(0.75 + mainTipSpark * 0.95);
      tipGlowRef.current.material.opacity = 0.26 + mainTipSpark * 0.65;
    }

    const branchTipSpark = Math.exp(-Math.pow((branchProgress - 0.92) / 0.08, 2));
    if (branchTipGlowRef.current) {
      branchTipGlowRef.current.scale.setScalar(0.7 + branchTipSpark * 0.85);
      branchTipGlowRef.current.material.opacity = 0.22 + branchTipSpark * 0.58;
    }
  });

  return (
    <group ref={pivotRef} position={nerve.rootPos}>
      {/* Primary radiating nerve fiber */}
      <mesh geometry={mainGeo}>
        <meshBasicMaterial
          color={nerve.style.filament}
          transparent
          opacity={0.54}
          depthWrite={false}
        />
      </mesh>
      {/* Bifurcating secondary nerve branch */}
      <mesh geometry={branchGeo}>
        <meshBasicMaterial
          color={nerve.style.pulse}
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </mesh>

      {/* Terminal nerve buds */}
      <mesh ref={tipGlowRef} position={nerve.tipPos}>
        <sphereGeometry args={[0.0115, 8, 8]} />
        <meshBasicMaterial
          color={nerve.style.pulse}
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={branchTipGlowRef} position={nerve.branchTipPos}>
        <sphereGeometry args={[0.009, 8, 8]} />
        <meshBasicMaterial
          color={nerve.style.pulse}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Main nerve impulse trail */}
      {[0, 1, 2, 3].map((s) => (
        <mesh
          key={`${nerve.id}-mt-${s}`}
          ref={(el) => {
            mainTrailRefs.current[s] = el;
          }}
        >
          <sphereGeometry args={[s === 0 ? 0.0115 : 0.0085, 8, 8]} />
          <meshBasicMaterial
            color={nerve.style.pulse}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Branch nerve impulse trail */}
      {[0, 1, 2].map((s) => (
        <mesh
          key={`${nerve.id}-bt-${s}`}
          ref={(el) => {
            branchTrailRefs.current[s] = el;
          }}
        >
          <sphereGeometry args={[s === 0 ? 0.0095 : 0.007, 8, 8]} />
          <meshBasicMaterial
            color={nerve.style.pulse}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Multi-pathway surface-following neural visualization (Purple, Gold & Cyan)
 * with glowing impulse trails, synced pathway branching, neuron ripple activations,
 * cortical dendrite micro-neurons, and delicate radiating nerves around the brain.
 */
export default function NeuralSignals({
  surfaceAnchors = null,
  compact = false,
  reducedMotion = false,
}) {
  const { pathways, neurons, nerves } = useMemo(
    () => buildCorticalNetwork(surfaceAnchors),
    [surfaceAnchors]
  );

  if (pathways.length === 0 || reducedMotion) return null;

  const activePathways = compact ? pathways.slice(0, 5) : pathways;
  const activeNeurons = compact ? neurons.slice(0, 2) : neurons;
  const activeNerves = compact ? nerves.slice(0, 4) : nerves;

  return (
    <group name="TnsCorticalNeuralNetwork">
      {activePathways.map((pathway) => (
        <CorticalPathway key={pathway.id} pathway={pathway} />
      ))}
      {activeNeurons.map((neuron) => (
        <DendriteNeuronCluster key={neuron.id} neuron={neuron} />
      ))}
      {activeNerves.map((nerve) => (
        <SurroundingNerveFilament key={nerve.id} nerve={nerve} />
      ))}
    </group>
  );
}
