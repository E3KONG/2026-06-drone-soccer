import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'

// Effects.svelte owns the bloom composer; GoalRecorder reuses it to render the
// beauty-camera frame with the same post-processing. Plain ref, not reactive.
export const captureRig: { composer: EffectComposer | null } = { composer: null }
