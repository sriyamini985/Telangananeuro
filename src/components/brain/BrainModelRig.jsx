import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import NeuralSignals from './NeuralSignals';
import {
  BRAIN_MANIFEST_PATH,
  BRAIN_MODEL_PATH,
  BRAIN_TARGET_SIZE,
  DRACO_DECODER_PATH,
  TNS_PALETTE,
  VISIBLE_ANATOMY_CATEGORIES,
  classifyLobeRegion,
  resolveStructureCategory,
} from './brainModelConfig';

/**
 * Deterministic 2D pseudo-noise helper for repeatable biological surface micro-textures.
 */
function seededNoise2D(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Generate paired 512x512 organic bump + roughness textures so biological cortical,
 * cerebellar, and brainstem tissues read as realistic physiological matter rather than plastic.
 */
function createBiologicalTextures(striated = false) {
  const size = 512;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d');
  const bumpImg = bumpCtx.createImageData(size, size);
  const bd = bumpImg.data;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d');
  const roughImg = roughCtx.createImageData(size, size);
  const rd = roughImg.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      const v = (y / size) * Math.PI * 2;

      const microGrain = (seededNoise2D(x * 0.65, y * 0.65) - 0.5) * 18;
      const finePore = (seededNoise2D(x * 1.4, y * 1.4) - 0.5) * 10;

      let heightVal;
      if (striated) {
        // Horizontal parallel folia grooves characteristic of cerebellar cortex
        const wave1 = Math.sin(v * 34 + Math.sin(u * 3) * 1.6) * 42;
        const wave2 = Math.sin(v * 68 + Math.cos(u * 6) * 0.9) * 16;
        const wrapVar = Math.sin(u * 5) * 10;
        heightVal = 128 + wave1 + wave2 + wrapVar + microGrain * 0.7;
      } else {
        // Multi-scale biological cortical irregularities & subtle pial vasculature impression
        const macro = Math.sin(u * 4 + Math.cos(v * 5)) * 18;
        const meso = Math.sin((u - v) * 13 + Math.sin(u * 3)) * 14;
        const micro = Math.cos(u * 23 + v * 19) * 7;
        const capillary = Math.pow(Math.abs(Math.sin(u * 7 + Math.sin(v * 9) * 1.4)), 14) * -22;
        heightVal = 128 + macro + meso + micro + capillary + microGrain + finePore;
      }

      const clampedBump = Math.max(0, Math.min(255, Math.round(heightVal)));
      // Sulci/crevices slightly rougher & drier matte than hydrated gyral ridges
      const normalizedHeight = clampedBump / 255;
      const roughVal = Math.round(
        THREE.MathUtils.clamp((0.86 - normalizedHeight * 0.24) * 255 + finePore * 0.4, 145, 240)
      );

      const idx = (y * size + x) * 4;
      bd[idx] = clampedBump;
      bd[idx + 1] = clampedBump;
      bd[idx + 2] = clampedBump;
      bd[idx + 3] = 255;

      rd[idx] = roughVal;
      rd[idx + 1] = roughVal;
      rd[idx + 2] = roughVal;
      rd[idx + 3] = 255;
    }
  }

  bumpCtx.putImageData(bumpImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(striated ? 6 : 4, striated ? 6 : 4);
  bumpMap.anisotropy = 4;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(striated ? 6 : 4, striated ? 6 : 4);
  roughnessMap.anisotropy = 4;

  return { bumpMap, roughnessMap };
}

/**
 * Calibrated medical-grade MeshPhysicalMaterials replacing raw glTF emissive white.
 * Uses biological pinkish-beige tones with peach/reddish undertones, non-plastic micro-roughness,
 * subtle physiological pia mater sheen, and deep anatomical region differentiation.
 */
let cachedAnatomicalMaterials = null;

function getOrCreateAnatomicalMaterials() {
  if (cachedAnatomicalMaterials) return cachedAnatomicalMaterials;

  const cortexTex = createBiologicalTextures(false);
  const cerebellumTex = createBiologicalTextures(true);

  const cortex = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFFFFF'),
    vertexColors: true,
    roughness: 0.72,
    roughnessMap: cortexTex.roughnessMap,
    metalness: 0.0,
    bumpMap: cortexTex.bumpMap,
    bumpScale: 0.011,
    clearcoat: 0.09,
    clearcoatRoughness: 0.56,
    sheen: 0.44,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(TNS_PALETTE.cortexSheen),
    emissive: new THREE.Color('#3B1916'),
    emissiveIntensity: 0.055,
    side: THREE.DoubleSide,
  });

  const cerebellum = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFFFFF'),
    vertexColors: true,
    roughness: 0.76,
    roughnessMap: cerebellumTex.roughnessMap,
    metalness: 0.0,
    bumpMap: cerebellumTex.bumpMap,
    bumpScale: 0.022,
    clearcoat: 0.06,
    clearcoatRoughness: 0.62,
    sheen: 0.34,
    sheenRoughness: 0.68,
    sheenColor: new THREE.Color('#E8B1AA'),
    emissive: new THREE.Color('#2B1312'),
    emissiveIntensity: 0.045,
    side: THREE.DoubleSide,
  });

  const brainstem = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(TNS_PALETTE.brainstemBeige),
    roughness: 0.69,
    roughnessMap: cortexTex.roughnessMap,
    metalness: 0.0,
    bumpMap: cortexTex.bumpMap,
    bumpScale: 0.005,
    clearcoat: 0.07,
    clearcoatRoughness: 0.6,
    sheen: 0.28,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color('#F2E0D0'),
    emissive: new THREE.Color('#261C16'),
    emissiveIntensity: 0.04,
    side: THREE.DoubleSide,
  });

  cachedAnatomicalMaterials = {
    cortex,
    cerebellum,
    brainstem,
  };
  return cachedAnatomicalMaterials;
}

/**
 * Bake multi-stop anatomical gyral-crown vs sulcal-crevice depth + basal ambient occlusion
 * into cortex geometry vertex colors so cortical folds exhibit warm peach-pink crowns
 * and natural reddish sulcal crevices.
 */
function bakeCorticalFoldDepth(mesh, brainOriginWorld, meanOuterRadius) {
  const geo = mesh.geometry?.clone();
  if (!geo?.attributes?.position) return;

  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;
  const count = pos.count;
  const colors = new Float32Array(count * 3);

  const gyrusCol = new THREE.Color(TNS_PALETTE.cortexGyrusPink);
  const midCol = new THREE.Color(TNS_PALETTE.cortexMidPink);
  const sulcusCol = new THREE.Color(TNS_PALETTE.cortexSulcusRose);
  const tmpCol = new THREE.Color();
  const worldPos = new THREE.Vector3();
  const radialDir = new THREE.Vector3();
  const worldNormal = new THREE.Vector3();
  const normalMat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);

  for (let i = 0; i < count; i++) {
    worldPos.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    radialDir.subVectors(worldPos, brainOriginWorld);
    const rRatio = THREE.MathUtils.clamp(radialDir.length() / (meanOuterRadius || 1), 0.5, 1.06);

    let facing = 0.62;
    if (norm) {
      worldNormal.fromBufferAttribute(norm, i).applyMatrix3(normalMat).normalize();
      radialDir.normalize();
      facing = THREE.MathUtils.clamp((worldNormal.dot(radialDir) + 0.38) / 1.38, 0, 1);
    }

    // Subtle basal ambient occlusion beneath ventral temporal/occipital underside
    const ventralAo = THREE.MathUtils.clamp(0.86 + (worldPos.y + 0.8) * 0.12, 0.84, 1.0);
    const foldFactor = Math.pow(
      THREE.MathUtils.clamp(0.56 * facing + 0.44 * ((rRatio - 0.5) / 0.56), 0, 1),
      0.92
    );

    if (foldFactor < 0.48) {
      tmpCol.copy(sulcusCol).lerp(midCol, foldFactor / 0.48);
    } else {
      tmpCol.copy(midCol).lerp(gyrusCol, (foldFactor - 0.48) / 0.52);
    }
    tmpCol.multiplyScalar(ventralAo);

    colors[i * 3] = tmpCol.r;
    colors[i * 3 + 1] = tmpCol.g;
    colors[i * 3 + 2] = tmpCol.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  mesh.geometry = geo;
}

/**
 * Bake subtle crevice-to-ridge tonal richness on cerebellum meshes so horizontal folia
 * and vermis junctions show clear anatomical volume.
 */
function bakeCerebellarFoliaDepth(mesh, originWorld) {
  const geo = mesh.geometry?.clone();
  if (!geo?.attributes?.position) return;

  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;
  const count = pos.count;
  const colors = new Float32Array(count * 3);

  const ridgeCol = new THREE.Color(TNS_PALETTE.cerebellumRose);
  const creviceCol = new THREE.Color(TNS_PALETTE.cerebellumCrevice);
  const tmpCol = new THREE.Color();
  const worldPos = new THREE.Vector3();
  const radialDir = new THREE.Vector3();
  const worldNormal = new THREE.Vector3();
  const normalMat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);

  for (let i = 0; i < count; i++) {
    worldPos.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    radialDir.subVectors(worldPos, originWorld).normalize();
    let facing = 0.65;
    if (norm) {
      worldNormal.fromBufferAttribute(norm, i).applyMatrix3(normalMat).normalize();
      facing = THREE.MathUtils.clamp((worldNormal.dot(radialDir) + 0.35) / 1.35, 0, 1);
    }
    const horizontalStripe = 0.5 + 0.5 * Math.sin(worldPos.y * 46 + worldPos.z * 8);
    const factor = THREE.MathUtils.clamp(0.68 * facing + 0.32 * horizontalStripe, 0, 1);

    tmpCol.copy(creviceCol).lerp(ridgeCol, factor);
    colors[i * 3] = tmpCol.r;
    colors[i * 3 + 1] = tmpCol.g;
    colors[i * 3 + 2] = tmpCol.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  mesh.geometry = geo;
}

/**
 * Detect frontal vs occipital axis from real cortical node centers so the brain
 * opens in an authentic three-quarter side view regardless of Blender export axis.
 */
function computeThreeQuarterYaw(root) {
  const frontalAcc = new THREE.Vector3();
  const occipitalAcc = new THREE.Vector3();
  let frontalN = 0;
  let occipitalN = 0;
  const box = new THREE.Box3();
  const center = new THREE.Vector3();

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.visible) return;
    const n = obj.name.toLowerCase();
    if (/frontal|precentral|orbital/.test(n)) {
      box.setFromObject(obj).getCenter(center);
      frontalAcc.add(center);
      frontalN++;
    } else if (/occipital|calcarine|cuneus/.test(n)) {
      box.setFromObject(obj).getCenter(center);
      occipitalAcc.add(center);
      occipitalN++;
    }
  });

  if (frontalN > 0 && occipitalN > 0) {
    frontalAcc.divideScalar(frontalN);
    occipitalAcc.divideScalar(occipitalN);
    const forwardDir = frontalAcc.sub(occipitalAcc);
    forwardDir.y = 0;
    if (forwardDir.lengthSq() > 0.0001) {
      const currentYaw = Math.atan2(forwardDir.x, forwardDir.z);
      // Aim frontal pole slightly left & toward viewer for authentic 3/4 lateral medical perspective
      return -currentYaw - 0.72;
    }
  }
  return -0.72;
}

/**
 * Loads `/models/human-brain.glb` with local Draco decoder, applies calibrated
 * biological materials + cortical fold depth + cerebellar folia shading, samples
 * structured surface anchors across lobes, and drives gentle rotation + cursor parallax.
 */
export default function BrainModelRig({ pointerRef, compact = false, reducedMotion = false }) {
  const rigRef = useRef(null);
  const gltf = useGLTF(BRAIN_MODEL_PATH, DRACO_DECODER_PATH);
  const [manifestMap, setManifestMap] = useState(null);
  const [surfaceAnchors, setSurfaceAnchors] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(BRAIN_MANIFEST_PATH)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json?.nodes) return;
        const map = new Map();
        json.nodes.forEach((node) => {
          map.set(node.name, node.category);
          map.set(node.name.trim(), node.category);
        });
        setManifestMap(map);
      })
      .catch(() => {
        // Naming heuristics handle classification when manifest is absent
      });
    return () => {
      active = false;
    };
  }, []);

  // Reused module-cached anatomical materials prevent React 19 StrictMode double-mount texture disposal races
  const materials = useMemo(() => getOrCreateAnatomicalMaterials(), []);

  const { preparedGroup, baseYaw, cortexMeshes } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const visibleCortex = [];
    const visibleCerebellum = [];

    clone.traverse((child) => {
      if (!child.isMesh) return;

      const cat = resolveStructureCategory(child.name, manifestMap);
      const isVisible = VISIBLE_ANATOMY_CATEGORIES.has(cat);
      child.visible = isVisible;

      if (!isVisible) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (cat === 'cortex') {
        child.material = materials.cortex;
        visibleCortex.push(child);
      } else if (cat === 'cerebellum') {
        child.material = materials.cerebellum;
        visibleCerebellum.push(child);
      } else {
        child.material = materials.brainstem;
      }
    });

    // Compute normalized bounds over visible anatomical structures only
    const fullBox = new THREE.Box3();
    const tmpBox = new THREE.Box3();
    clone.updateMatrixWorld(true);
    clone.traverse((obj) => {
      if (obj.isMesh && obj.visible) {
        tmpBox.setFromObject(obj);
        fullBox.union(tmpBox);
      }
    });

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    fullBox.getSize(size);
    fullBox.getCenter(center);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scaleFactor = BRAIN_TARGET_SIZE / maxAxis;

    clone.scale.setScalar(scaleFactor);
    clone.position.set(
      -center.x * scaleFactor,
      -center.y * scaleFactor,
      -center.z * scaleFactor
    );
    clone.updateMatrixWorld(true);

    // Bake realistic cortical gyri/sulci shading and cerebellar folia tonal definition
    const brainOrigin = new THREE.Vector3(0, 0.12, 0);
    const meanRadius = BRAIN_TARGET_SIZE * 0.44;
    visibleCortex.forEach((cortexMesh) => {
      bakeCorticalFoldDepth(cortexMesh, brainOrigin, meanRadius);
    });

    const cerebellumOrigin = new THREE.Vector3(0, -0.42, -0.35);
    visibleCerebellum.forEach((cbMesh) => {
      bakeCerebellarFoliaDepth(cbMesh, cerebellumOrigin);
    });

    const yaw = computeThreeQuarterYaw(clone);

    return {
      preparedGroup: clone,
      baseYaw: yaw,
      cortexMeshes: visibleCortex,
    };
  }, [gltf.scene, manifestMap, materials]);

  // Sample structured cortical surface anchors (with normals + lobe labels) across outer gyri
  useEffect(() => {
    if (!cortexMeshes || cortexMeshes.length === 0) return;

    const sorted = [...cortexMeshes].sort(
      (a, b) =>
        (b.geometry.attributes?.position?.count || 0) -
        (a.geometry.attributes?.position?.count || 0)
    );
    const chosen = sorted.slice(0, Math.min(34, sorted.length));
    const sampled = [];
    const pos = new THREE.Vector3();
    const norm = new THREE.Vector3();
    const normalMatrix = new THREE.Matrix3();

    chosen.forEach((mesh) => {
      try {
        const sampler = new MeshSurfaceSampler(mesh).build();
        normalMatrix.getNormalMatrix(mesh.matrixWorld);
        const lobe = classifyLobeRegion(mesh.name);
        for (let k = 0; k < 5; k++) {
          sampler.sample(pos, norm);
          pos.applyMatrix4(mesh.matrixWorld);
          norm.applyMatrix3(normalMatrix).normalize();
          sampled.push({
            point: pos.clone(),
            normal: norm.clone(),
            lobe,
          });
        }
      } catch {
        // Skip malformed submesh gracefully
      }
    });

    setSurfaceAnchors(sampled);
  }, [cortexMeshes]);

  useFrame((state, delta) => {
    const rig = rigRef.current;
    if (!rig) return;

    if (reducedMotion) {
      rig.rotation.y = baseYaw;
      rig.rotation.x = 0.055;
      rig.position.y = 0;
      return;
    }

    const px = pointerRef?.current?.x ?? state.pointer.x;
    const py = pointerRef?.current?.y ?? state.pointer.y;
    const t = state.clock.elapsedTime;

    // Slow continuous physiological idle rotation + smooth cursor-responsive tilt
    const targetRotY = baseYaw + t * 0.08 + px * 0.22;
    const targetRotX = 0.055 - py * 0.13 + Math.sin(t * 0.42) * 0.015;
    const targetPosY = Math.sin(t * 0.72) * 0.022;

    const damp = Math.min(1, delta * 3.0);
    rig.rotation.y = THREE.MathUtils.lerp(rig.rotation.y, targetRotY, damp);
    rig.rotation.x = THREE.MathUtils.lerp(rig.rotation.x, targetRotX, damp);
    rig.position.y = THREE.MathUtils.lerp(rig.position.y, targetPosY, damp);
  });

  return (
    <group ref={rigRef} position={[0.04, 0, 0]}>
      <primitive object={preparedGroup} />
      <NeuralSignals
        surfaceAnchors={surfaceAnchors}
        compact={compact}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
