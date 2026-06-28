<script>
  import { useThrelte, useTask } from '@threlte/core'
  import { Vector2 } from 'three'
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
  import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
  import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
  import { score } from '../state/score.svelte.ts'

  // --- Bloom ---
  const BLOOM_STRENGTH = 0.9
  const BLOOM_RADIUS = 0.4
  const BLOOM_THRESHOLD = 2.0

  // --- Shockwave ---
  const SHOCK_DURATION = 2
  const SHOCK_RING_WIDTH = 0.3
  const SHOCK_ABERRATION = 0.1

  const shockShader = {
    uniforms: {
      tDiffuse: { value: null },
      progress: { value: -1 },
      ringWidth: { value: SHOCK_RING_WIDTH },
      aberration: { value: SHOCK_ABERRATION },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float progress;
      uniform float ringWidth;
      uniform float aberration;
      varying vec2 vUv;
      void main() {
        if (progress < 0.0) { gl_FragColor = texture2D(tDiffuse, vUv); return; }
        vec2 c = vUv - 0.5;
        float d = length(c);
        float band = smoothstep(ringWidth, 0.0, abs(d - progress)) * (1.0 - progress);
        vec2 dir = normalize(c + 1e-6);
        float amt = band * aberration;
        float r = texture2D(tDiffuse, vUv + dir * amt).r;
        float g = texture2D(tDiffuse, vUv).g;
        float b = texture2D(tDiffuse, vUv - dir * amt).b;
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `,
  }

  const { renderer, scene, camera, size, dpr, autoRender, renderStage } =
    useThrelte()

  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera.current)
  const bloomPass = new UnrealBloomPass(
    new Vector2(1, 1),
    BLOOM_STRENGTH,
    BLOOM_RADIUS,
    BLOOM_THRESHOLD,
  )
  const shockPass = new ShaderPass(shockShader)
  composer.addPass(renderPass)
  composer.addPass(bloomPass)
  composer.addPass(shockPass)
  composer.addPass(new OutputPass())

  $effect(() => {
    composer.setPixelRatio($dpr)
    composer.setSize($size.width, $size.height)
  })

  $effect(() => {
    renderPass.camera = $camera
  })

  $effect(() => {
    autoRender.set(false)
    return () => autoRender.set(true)
  })

  useTask(
    (delta) => {
      if (score.shock >= 0) {
        score.shock += delta / SHOCK_DURATION
        if (score.shock > 1) score.shock = -1
      }
      shockPass.uniforms.progress.value = score.shock
      composer.render(delta)
    },
    {
      stage: renderStage,
      autoInvalidate: false,
    },
  )
</script>
