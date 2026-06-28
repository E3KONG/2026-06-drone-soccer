import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

// Effects.svelte owns the bloom composer + shockwave pass; GoalRecorder reuses
// the composer to render the beauty frame, and disables the shock pass for the
// still. Plain ref, not reactive.
export const captureRig: {
  composer: EffectComposer | null
  shockPass: ShaderPass | null
} = { composer: null, shockPass: null }
