/**
 * Configuration, anatomical category mapping, regional classifiers, and official TNS palette
 * tokens for the React Three Fiber 3D brain hero stage.
 */
export const BRAIN_MODEL_PATH = '/models/human-brain.glb';
export const BRAIN_MANIFEST_PATH = '/models/brain-manifest.json';
export const DRACO_DECODER_PATH = '/draco/';

// Normalized scale fitting complete cortex, cerebellum & brainstem comfortably inside right hero stage
export const BRAIN_TARGET_SIZE = 2.26;

// Gross anatomical exterior structures to render (excludes outer dural sheets/veins/long vessels)
export const VISIBLE_ANATOMY_CATEGORIES = new Set([
  'cortex',
  'cerebellum',
  'brainstem',
  'white_matter',
  'diencephalon',
]);

export const TNS_PALETTE = {
  purple: '#393185',
  purpleSignal: '#8474FA',
  gold: '#C18C26',
  goldSignal: '#F4C95D',
  cyan: '#009DE2',
  cyanSignal: '#4CC3F7',
  ivory: '#F7F2E8',
  // Calibrated biological tissue palette: warm pinkish-beige with luminous peach & rose undertones
  cortexGyrusPink: '#EBB9AA',
  cortexMidPink: '#D89A8E',
  cortexSulcusRose: '#A86660',
  cortexSheen: '#F7DCD2',
  cerebellumRose: '#C77870',
  cerebellumCrevice: '#964E48',
  brainstemBeige: '#E4CCB9',
};

/**
 * Resolve anatomical category using downloaded `brain-manifest.json` metadata
 * with deterministic naming heuristics as fallback.
 */
export function resolveStructureCategory(meshName, manifestMap) {
  if (manifestMap && manifestMap.has(meshName)) {
    return manifestMap.get(meshName);
  }
  const lower = (meshName || '').toLowerCase();
  if (/cerebell|floccul|vermis|culmen|declive|biventral|uvula|pyramis|nodulus|folium|tuber/.test(lower)) {
    return 'cerebellum';
  }
  if (/medulla|pons|midbrain|brainstem|collicul|peduncle|olivary|tegmentum|aqueduct|pyramid/.test(lower)) {
    return 'brainstem';
  }
  if (/gyrus|sulcus|lobe|cortex|opercul|precuneus|cuneus|insula|paracentral/.test(lower)) {
    return 'cortex';
  }
  if (/callosum|commissure|fornix|internal capsule|corona/.test(lower)) {
    return 'white_matter';
  }
  if (/thalam|pituitary|pineal|mammillary/.test(lower)) {
    return 'diencephalon';
  }
  return 'other';
}

/**
 * Classify cortical mesh sub-structures by lobe so surface pathways span
 * authentic association tracts (frontal, parietal, temporal, occipital).
 */
export function classifyLobeRegion(meshName) {
  const lower = (meshName || '').toLowerCase();
  if (/frontal|precentral|orbital|broca/.test(lower)) return 'frontal';
  if (/parietal|postcentral|supramarginal|angular|precuneus|paracentral/.test(lower)) return 'parietal';
  if (/temporal|fusiform|heschl|parahippocamp/.test(lower)) return 'temporal';
  if (/occipital|calcarine|cuneus|lingual/.test(lower)) return 'occipital';
  return 'cortex';
}

/**
 * Safely verify whether the binary glTF (`glTF` magic header) is available at `url`.
 */
export async function checkGlbAvailability(url = BRAIN_MODEL_PATH) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-11' },
      cache: 'default',
    });

    if (!response.ok) return false;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) return false;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 4) return false;

    const bytes = new Uint8Array(buffer.slice(0, 4));
    return (
      bytes[0] === 0x67 &&
      bytes[1] === 0x6c &&
      bytes[2] === 0x54 &&
      bytes[3] === 0x46
    );
  } catch {
    return false;
  }
}
